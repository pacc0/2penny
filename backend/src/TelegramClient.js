// Thin HTTP client for the Telegram Bot API. No business logic — just
// request plumbing. See TelegramBot.gs / TelegramInteractive.gs /
// TelegramNaturalLanguage.gs for the actual bot behavior.

var SCRIPT_PROPERTY_TELEGRAM_BOT_TOKEN = 'TELEGRAM_BOT_TOKEN';
var SCRIPT_PROPERTY_TELEGRAM_CHAT_ID = 'TELEGRAM_CHAT_ID';
var TELEGRAM_API_BASE_URL_ = 'https://api.telegram.org/bot';

function getTelegramBotToken_() {
  var token = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_TELEGRAM_BOT_TOKEN);
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN script property is not set.');
  return token;
}

function getTelegramChatId_() {
  var chatId = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_TELEGRAM_CHAT_ID);
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID script property is not set.');
  return chatId;
}

/**
 * Low-level POST to the Telegram Bot API. Never logs the token/response
 * body verbatim beyond what's needed to surface failures.
 */
function telegramCall_(method, payload) {
  var url = TELEGRAM_API_BASE_URL_ + getTelegramBotToken_() + '/' + method;
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  var result = JSON.parse(response.getContentText());
  if (!result.ok) {
    Logger.log('Telegram API call "' + method + '" failed: ' + response.getContentText());
  }
  return result;
}

function sendTelegramMessage_(text, replyMarkup) {
  var payload = { chat_id: getTelegramChatId_(), text: text };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  return telegramCall_('sendMessage', payload);
}

function editTelegramMessageText_(messageId, text, replyMarkup) {
  var payload = { chat_id: getTelegramChatId_(), message_id: messageId, text: text };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  return telegramCall_('editMessageText', payload);
}

function answerTelegramCallbackQuery_(callbackQueryId, text) {
  var payload = { callback_query_id: callbackQueryId };
  if (text) payload.text = text;
  return telegramCall_('answerCallbackQuery', payload);
}

function setTelegramWebhook_(url) {
  return telegramCall_('setWebhook', { url: url });
}

function deleteTelegramWebhook_() {
  return telegramCall_('deleteWebhook', {});
}
