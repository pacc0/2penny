// Periodic Gemini health check. Alerts via Telegram only on failure — zero
// noise on success. See docs/OPERATIONS.md section 6 (Gemini deprecation
// incident, June 2026) and docs/DECISIONS.md ADR-0021.

/**
 * Runs one trivial Gemini call through the pinned GEMINI_MODEL_
 * (GeminiGate.js) and alerts Camilo on Telegram only if it fails. Intended
 * to run on a daily time-driven trigger (Stage 8 manual step,
 * docs/OPERATIONS.md) — early warning for silent model deprecation, the
 * failure mode that caused the June 2026 incident.
 */
function runCanary() {
  try {
    var apiKey = getGeminiApiKey_();
    var url = GEMINI_API_BASE_URL_ + GEMINI_MODEL_ + ':generateContent?key=' + apiKey;
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      throw new Error('Gemini canary call failed (' + response.getResponseCode() + '): ' + response.getContentText());
    }

    Logger.log('runCanary: Gemini call OK (' + GEMINI_MODEL_ + ').');
  } catch (e) {
    Logger.log('runCanary: Gemini call FAILED: ' + e.message);
    sendTelegramMessage_('⚠️ 2penny Canary: Gemini call failed (' + GEMINI_MODEL_ + '). ' + e.message);
  }
}
