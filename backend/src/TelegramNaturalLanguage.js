// Free-text message handling: sends the message to Gemini, validates the
// parsed result against Penny's configured Categories/Accounts/
// TransferPurposes, then routes into the same confirm step used by
// TelegramInteractive.gs (spec: one explicit confirm step regardless of
// confidence, for both flows).

function handleNaturalLanguageMessage_(chatId, text) {
  var spreadsheetId = getSpreadsheetId_();
  var parsed;
  try {
    parsed = classifyTransactionText_(text);
  } catch (err) {
    Logger.log('Gemini classification failed: ' + err);
    sendTelegramMessage_('No pude interpretar ese mensaje. Intenta de nuevo o usa /nueva.');
    return;
  }

  if (!isValidParsedTransaction_(parsed, spreadsheetId)) {
    sendTelegramMessage_('No logré entender bien esa transacción. Intenta ser más específico o usa /nueva.');
    return;
  }

  var data = {
    transaction_type: parsed.transaction_type,
    category: parsed.category || '',
    account_from: parsed.account_from || '',
    account_to: parsed.account_to || '',
    transfer_purpose: parsed.transfer_purpose || '',
    amount: parsed.amount,
    description: parsed.description || ''
  };

  var sent = sendTelegramMessage_(buildTransactionSummaryText_(data), buildConfirmKeyboard_());
  var messageId = sent.result && sent.result.message_id;
  setFlowState_({ step: 'confirm', chatId: chatId, messageId: messageId, data: data });
}

/**
 * Guards against Gemini hallucinating values outside Penny's configured
 * Categories/Accounts/TransferPurposes, and against malformed shapes.
 */
function isValidParsedTransaction_(parsed, spreadsheetId) {
  if (!parsed || typeof parsed !== 'object') return false;

  var type = parsed.transaction_type;
  if (['Income', 'Expense', 'Transfer'].indexOf(type) === -1) return false;
  if (!(Number(parsed.amount) > 0)) return false;

  var accounts = loadActiveAccounts_(spreadsheetId);

  if (type === 'Transfer') {
    if (parsed.category) return false;
    if (accounts.indexOf(parsed.account_from) === -1) return false;
    if (accounts.indexOf(parsed.account_to) === -1) return false;
    var purposes = loadActiveTransferPurposes_(spreadsheetId);
    return purposes.indexOf(parsed.transfer_purpose) !== -1;
  }

  // Income / Expense
  if (parsed.transfer_purpose) return false;
  var categories = loadActiveCategories_(spreadsheetId, type);
  if (categories.indexOf(parsed.category) === -1) return false;
  var accountField = type === 'Income' ? parsed.account_to : parsed.account_from;
  var unusedAccountField = type === 'Income' ? parsed.account_from : parsed.account_to;
  if (unusedAccountField) return false;
  return accounts.indexOf(accountField) !== -1;
}
