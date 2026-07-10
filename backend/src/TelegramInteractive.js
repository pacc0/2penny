// Button-driven step flow for manual transaction entry via Telegram.
// Steps: type -> amount (free text) -> [category ->] account(s)
// [-> transfer_purpose] -> confirm. Writes as Confirmed/Telegram per
// docs/DATA_MODEL.md's Source Rules. Today-only date, no backdating (v1).
//
// Flow state lives in CacheService (ephemeral, TTL-bound) rather than a
// sheet or Script Property — it's short-lived, single-user, per-flow data
// that doesn't belong in persistent config.
//
// ponytail: one global cache key, not keyed by chat_id — fine because Penny
// is single-user (TELEGRAM_CHAT_ID gates every incoming update). Key by
// chat_id if Penny ever supports multiple users.

var TELEGRAM_FLOW_CACHE_KEY_ = 'telegram_flow_state';
var TELEGRAM_FLOW_TTL_SECONDS_ = 600; // 10 minutes — plenty for a manual entry.

function getFlowState_() {
  var cached = CacheService.getScriptCache().get(TELEGRAM_FLOW_CACHE_KEY_);
  return cached ? JSON.parse(cached) : null;
}

function setFlowState_(state) {
  CacheService.getScriptCache().put(TELEGRAM_FLOW_CACHE_KEY_, JSON.stringify(state), TELEGRAM_FLOW_TTL_SECONDS_);
}

function clearFlowState_() {
  CacheService.getScriptCache().remove(TELEGRAM_FLOW_CACHE_KEY_);
}

/**
 * Entry point for /nueva. Also used to restart the flow on "Editar".
 */
function startInteractiveTransactionFlow_(chatId) {
  var sent = sendTelegramMessage_('¿Qué tipo de transacción es?', buildTypeKeyboard_());
  var messageId = sent.result && sent.result.message_id;
  setFlowState_({ step: 'type', chatId: chatId, messageId: messageId, data: {} });
}

/**
 * amount is entered as free text (not a button) — handled from
 * TelegramBot.gs's message router when the current step is 'amount'.
 */
function handleAmountInput_(state, text) {
  var amount = parseTelegramAmount_(text);
  if (amount === null) {
    sendTelegramMessage_('No entendí el monto. Escribe solo el número, por ejemplo 45000.');
    return;
  }
  state.data.amount = amount;

  var spreadsheetId = getSpreadsheetId_();
  if (state.data.transaction_type === 'Transfer') {
    state.step = 'account_from';
    updateFlowMessage_(state, '¿Cuenta de origen?', buildAccountKeyboard_(spreadsheetId, 'account_from'));
  } else {
    state.step = 'category';
    updateFlowMessage_(state, '¿Qué categoría?', buildCategoryKeyboard_(spreadsheetId, state.data.transaction_type));
  }
  setFlowState_(state);
}

function parseTelegramAmount_(text) {
  var cleaned = String(text).replace(/[^\d]/g, '');
  if (!cleaned) return null;
  var amount = parseInt(cleaned, 10);
  return amount > 0 ? amount : null;
}

/**
 * Routes a callback_query (button press) through the current step.
 */
function routeInteractiveCallback_(callbackQuery) {
  var state = getFlowState_();
  if (!state) {
    return; // Flow expired or stale keyboard — ignore quietly.
  }

  var parts = callbackQuery.data.split(':');
  var value = parts.slice(1).join(':');
  var spreadsheetId = getSpreadsheetId_();

  switch (state.step) {
    case 'type':
      state.data.transaction_type = value;
      state.step = 'amount';
      updateFlowMessage_(state, '¿Cuánto fue? (solo el número, ej. 45000)', { inline_keyboard: [] });
      break;

    case 'category':
      state.data.category = value;
      state.step = 'account';
      updateFlowMessage_(state, '¿Con qué cuenta?', buildAccountKeyboard_(spreadsheetId, 'account'));
      break;

    case 'account':
      // Single-account step for Income (account_to) / Expense (account_from).
      if (state.data.transaction_type === 'Income') {
        state.data.account_to = value;
      } else {
        state.data.account_from = value;
      }
      state.step = 'confirm';
      showConfirmStep_(state);
      break;

    case 'account_from':
      state.data.account_from = value;
      state.step = 'account_to';
      updateFlowMessage_(state, '¿Cuenta destino?', buildAccountKeyboard_(spreadsheetId, 'account_to'));
      break;

    case 'account_to':
      state.data.account_to = value;
      state.step = 'transfer_purpose';
      updateFlowMessage_(state, '¿Cuál es el propósito de la transferencia?', buildTransferPurposeKeyboard_(spreadsheetId));
      break;

    case 'transfer_purpose':
      state.data.transfer_purpose = value;
      state.step = 'confirm';
      showConfirmStep_(state);
      break;

    case 'confirm':
      handleConfirmAction_(state, value, spreadsheetId);
      return; // handleConfirmAction_ owns state clearing/persisting.

    default:
      return;
  }

  setFlowState_(state);
}

function handleConfirmAction_(state, action, spreadsheetId) {
  if (action === 'yes') {
    writeTransactionRow_(spreadsheetId, buildConfirmedTelegramTransaction_(state.data));
    clearFlowState_();
    updateFlowMessage_(state, '✅ Transacción registrada.', { inline_keyboard: [] });
    return;
  }

  if (action === 'edit') {
    clearFlowState_();
    updateFlowMessage_(state, buildTransactionSummaryText_(state.data) + '\n\n(Editando desde el inicio...)', { inline_keyboard: [] });
    startInteractiveTransactionFlow_(state.chatId); // restart full flow — no partial-field edit (per plan).
    return;
  }

  // cancel
  clearFlowState_();
  updateFlowMessage_(state, 'Registro cancelado.', { inline_keyboard: [] });
}

function buildConfirmedTelegramTransaction_(data) {
  return {
    transaction_date: todayIsoDate_(),
    transaction_type: data.transaction_type,
    category: data.category,
    account_from: data.account_from,
    account_to: data.account_to,
    transfer_purpose: data.transfer_purpose,
    amount: data.amount,
    description: data.description,
    merchant: '',
    merchant_raw: '',
    source: 'Telegram',
    status: 'Confirmed'
  };
}

function updateFlowMessage_(state, text, replyMarkup) {
  editTelegramMessageText_(state.messageId, text, replyMarkup || { inline_keyboard: [] });
}

function showConfirmStep_(state) {
  updateFlowMessage_(state, buildTransactionSummaryText_(state.data), buildConfirmKeyboard_());
}

function buildConfirmKeyboard_() {
  return {
    inline_keyboard: [[
      { text: 'Sí ✅', callback_data: 'confirm:yes' },
      { text: 'Editar ✏️', callback_data: 'confirm:edit' },
      { text: 'Cancelar ❌', callback_data: 'confirm:cancel' }
    ]]
  };
}

function buildTransactionSummaryText_(data) {
  var lines = ['Confirma la transacción:', ''];
  lines.push('Tipo: ' + translateTransactionType_(data.transaction_type));
  lines.push('Monto: $' + formatAmountCop_(data.amount));
  if (data.category) lines.push('Categoría: ' + data.category);
  if (data.account_from) lines.push('Cuenta origen: ' + data.account_from);
  if (data.account_to) lines.push('Cuenta destino: ' + data.account_to);
  if (data.transfer_purpose) lines.push('Propósito: ' + data.transfer_purpose);
  if (data.description) lines.push('Descripción: ' + data.description);
  return lines.join('\n');
}

function translateTransactionType_(type) {
  var labels = { Income: 'Ingreso', Expense: 'Gasto', Transfer: 'Transferencia' };
  return labels[type] || type;
}

function formatAmountCop_(amount) {
  return Number(amount).toLocaleString('es-CO');
}

function buildTypeKeyboard_() {
  return {
    inline_keyboard: [[
      { text: 'Ingreso', callback_data: 'type:Income' },
      { text: 'Gasto', callback_data: 'type:Expense' },
      { text: 'Transferencia', callback_data: 'type:Transfer' }
    ]]
  };
}

function buildCategoryKeyboard_(spreadsheetId, type) {
  var categories = loadActiveCategories_(spreadsheetId, type);
  return {
    inline_keyboard: categories.map(function (name) {
      return [{ text: name, callback_data: 'category:' + name }];
    })
  };
}

function buildAccountKeyboard_(spreadsheetId, callbackPrefix) {
  var accounts = loadActiveAccounts_(spreadsheetId);
  return {
    inline_keyboard: accounts.map(function (name) {
      return [{ text: name, callback_data: callbackPrefix + ':' + name }];
    })
  };
}

function buildTransferPurposeKeyboard_(spreadsheetId) {
  var purposes = loadActiveTransferPurposes_(spreadsheetId);
  return {
    inline_keyboard: purposes.map(function (purpose) {
      return [{ text: purpose, callback_data: 'transfer_purpose:' + purpose }];
    })
  };
}
