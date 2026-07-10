// Telegram webhook entry point. Routes incoming updates (message vs
// callback_query) to the interactive button flow or the natural-language
// handler. See docs/ROADMAP.md Phase 3 and docs/DATA_MODEL.md for scope.

/**
 * Web App entry point. Telegram POSTs every update here once the webhook
 * is registered (see registerTelegramWebhook() below).
 */
function doPost(e) {
  try {
    var update = JSON.parse(e.postData.contents);
    if (update.callback_query) {
      handleTelegramCallbackQueryUpdate_(update.callback_query);
    } else if (update.message) {
      handleTelegramMessageUpdate_(update.message);
    }
  } catch (err) {
    Logger.log('doPost failed: ' + err);
  }
  return HtmlService.createHtmlOutput('');
}

/**
 * Trust boundary: the Web App is deployed with ANYONE_ANONYMOUS access
 * (required so Telegram's unauthenticated POSTs are accepted), so anyone
 * who discovers the URL could send a forged Telegram-shaped payload. Penny
 * is single-user — only the configured TELEGRAM_CHAT_ID is trusted.
 */
function isFromConfiguredChat_(chatId) {
  return String(chatId) === getTelegramChatId_();
}

function handleTelegramMessageUpdate_(message) {
  if (!message.chat || !isFromConfiguredChat_(message.chat.id)) {
    return;
  }

  var text = (message.text || '').trim();

  if (text === '/nueva' || text === '/start') {
    startInteractiveTransactionFlow_(message.chat.id);
    return;
  }

  var state = getFlowState_();
  if (state && state.step === 'amount') {
    handleAmountInput_(state, text);
    return;
  }

  if (text) {
    handleNaturalLanguageMessage_(message.chat.id, text);
  }
}

function handleTelegramCallbackQueryUpdate_(callbackQuery) {
  if (!callbackQuery.message || !isFromConfiguredChat_(callbackQuery.message.chat.id)) {
    return;
  }

  answerTelegramCallbackQuery_(callbackQuery.id);
  routeInteractiveCallback_(callbackQuery);
}

var SCRIPT_PROPERTY_WEBAPP_URL = 'WEBAPP_URL';

/**
 * One-time setup. Run manually from the Apps Script editor, AFTER deploying
 * this project as a Web App (executeAs: USER_DEPLOYING, access:
 * ANYONE_ANONYMOUS — see appsscript.json).
 *
 * getUpdates (used earlier to capture TELEGRAM_CHAT_ID) and setWebhook are
 * mutually exclusive — Telegram returns HTTP 409 if both are active at
 * once. deleteWebhook is called first, defensively, to clear any stale
 * webhook state before registering the new one. Not auto-run by any
 * trigger.
 *
 * WEBAPP_URL is read from Script Properties rather than resolved at
 * runtime: ScriptApp.getService().getUrl() only returns the real /exec URL
 * when the code is executing as an actual web app request. A manual editor
 * run resolves it to the /dev URL instead, which always requires Google
 * auth regardless of the manifest's ANYONE_ANONYMOUS setting — registering
 * that with Telegram causes every webhook delivery to fail with 401. Copy
 * the real URL from Deploy -> Manage deployments -> (the deployment) ->
 * Web app URL, and set it as the WEBAPP_URL script property after every
 * new deployment (the URL can change if a new deployment is created).
 */
function registerTelegramWebhook() {
  var chatId = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_TELEGRAM_CHAT_ID);
  if (!chatId) {
    throw new Error('TELEGRAM_CHAT_ID script property must be set before registering the webhook.');
  }

  var webAppUrl = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_WEBAPP_URL);
  if (!webAppUrl) {
    throw new Error('WEBAPP_URL script property is not set. Copy the deployed Web app URL from Deploy > Manage deployments and set it first.');
  }

  var deleteResult = deleteTelegramWebhook_();
  Logger.log('deleteWebhook response: ' + JSON.stringify(deleteResult));

  var setResult = setTelegramWebhook_(webAppUrl);
  Logger.log('setWebhook response: ' + JSON.stringify(setResult));

  if (!setResult.ok) {
    throw new Error('setWebhook failed: ' + JSON.stringify(setResult));
  }
}
