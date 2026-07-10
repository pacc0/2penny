// Thin HTTP client for the Gemini API. Sends a user's free-text message
// plus the current valid Categories/Accounts/TransferPurposes (as reference
// data, not instructions) and returns Gemini's parsed JSON. See
// TelegramNaturalLanguage.gs for how the result is used.

var SCRIPT_PROPERTY_GEMINI_API_KEY = 'GEMINI_API_KEY';
// ponytail: pinned model, announced shutdown 2027-05-07 — the accepted
// maintenance model is a periodic one-line bump here (run
// smokeTestGeminiCallSites after), no routing/fallback abstraction.
var GEMINI_MODEL_ = 'gemini-3.1-flash-lite';
var GEMINI_API_BASE_URL_ = 'https://generativelanguage.googleapis.com/v1beta/models/';

/**
 * System instruction for classifyTransactionText_. Authored by
 * prompt-engineer in docs/PROMPTS.md ("Natural Language" section) — copied
 * verbatim from there, not authored here. Do not edit this text directly;
 * edit docs/PROMPTS.md and copy the change over.
 */
var NATURAL_LANGUAGE_PROMPT_ = [
  'You interpret personal finance messages written in Spanish by a single user in Colombia (Colombian Peso amounts, no decimals expected). Convert the message into exactly one transaction.',
  '',
  'Respond with JSON only. No markdown, no explanations, no text outside the JSON object.',
  '',
  'Output shape:',
  '{"transaction_type":"Income|Expense|Transfer","category":"","account_from":"","account_to":"","transfer_purpose":"","amount":0,"description":""}',
  '',
  'Rules:',
  '- Only use category, account_from, account_to, and transfer_purpose values that appear verbatim in the "Valid options" data provided with the message. Never invent, translate, abbreviate, or guess a new value. If nothing in the valid options is a reasonable match, leave the field as an empty string rather than making one up.',
  '- transaction_type must be exactly one of Income, Expense, Transfer.',
  '- Income: requires category (from the Income category list) and account_to. account_from and transfer_purpose must be "".',
  '- Expense: requires category (from the Expense category list) and account_from. account_to and transfer_purpose must be "".',
  '- Transfer: requires account_from, account_to, and transfer_purpose. category must be "".',
  '- amount is always a positive number, in Colombian pesos (COP). Expand common shorthand: "lucas" or "mil" = thousands (e.g. "50 lucas" = 50000), "palos" or "kilos" = millions (e.g. "2 palos" = 2000000). If the message does not contain a clear amount, set amount to 0.',
  '- description is optional short free text (e.g. merchant or note extracted from the message). Leave it "" if there is nothing meaningful to add beyond the category/account already captured.',
  '- If the message is ambiguous or missing required information for its type, still return your best-effort JSON — do not ask a follow-up question and do not add any field beyond the shape above. The caller always shows the user an explicit confirmation step before saving, and rejects output that fails validation, so under-specified guesses are caught downstream rather than by this prompt.',
  '',
  'Examples:',
  '',
  'Input: Pagué 45000 en el mercado con Nequi',
  '{"transaction_type":"Expense","category":"Alimentación","account_from":"Nequi","account_to":"","transfer_purpose":"","amount":45000,"description":"Mercado"}',
  '',
  'Input: Me pagaron 2000000 de sueldo a Bancolombia',
  '{"transaction_type":"Income","category":"Salario / Honorarios","account_from":"","account_to":"Bancolombia","transfer_purpose":"","amount":2000000,"description":"Sueldo"}',
  '',
  'Input: Pasé 500 lucas de Nu Débito a Lulo Bank para ahorro',
  '{"transaction_type":"Transfer","category":"","account_from":"Nu Débito","account_to":"Lulo Bank","transfer_purpose":"Savings","amount":500000,"description":""}'
].join('\n');

/**
 * System instruction for classifyPendingTransactionCategory_. Authored by
 * prompt-engineer in docs/PROMPTS.md ("Transaction Classification" section)
 * — copied verbatim from there, not authored here. Do not edit this text
 * directly; edit docs/PROMPTS.md and copy the change over.
 */
var TRANSACTION_CLASSIFICATION_PROMPT_ = [
  'You classify a single already-structured personal finance transaction from a user in Colombia (Colombian Peso amounts). You are given the transaction\'s merchant name, raw merchant text, amount, and type (Income or Expense). Assign the single best-fitting category.',
  '',
  'Respond with JSON only. No markdown, no explanations, no text outside the JSON object.',
  '',
  'Output shape:',
  '{"category":""}',
  '',
  'Rules:',
  '- Only use a category value that appears verbatim in the "Valid options" list provided with the transaction. Never invent, translate, abbreviate, or guess a new value.',
  '- If nothing in the valid options is a reasonable match, return category: "" rather than making one up.',
  '- Do not include a confidence field or any field beyond category. The caller writes this result to a Pending row that always requires user review before being treated as confirmed — a self-reported confidence value would be unused data, same rationale as the Natural Language prompt above.',
  '',
  'Examples:',
  '',
  'Input: merchant: "Rappi", merchant_raw: "RAPPI*COLOMBIA BOGOTA", amount: 38000, transaction_type: "Expense"',
  '{"category":"Alimentación"}',
  '',
  'Input: merchant: "Empresa XYZ SAS", merchant_raw: "PAGO NOMINA EMPRESA XYZ SAS", amount: 3200000, transaction_type: "Income"',
  '{"category":"Salario / Honorarios"}',
  '',
  'Input: merchant: "Comercio Desconocido 123", merchant_raw: "COMPRA TARJETA 04521998877", amount: 15000, transaction_type: "Expense"',
  '{"category":""}'
].join('\n');

/**
 * System instruction for generateMonthlySummary_. Authored by
 * prompt-engineer in docs/PROMPTS.md ("Monthly Summary" section) — copied
 * verbatim from there, not authored here. Do not edit this text directly;
 * edit docs/PROMPTS.md and copy the change over.
 */
var MONTHLY_SUMMARY_PROMPT_ = [
  'You write a short monthly financial summary in Spanish for a single user in Colombia (Colombian Peso amounts). You are given one closed calendar month\'s totals: income, expenses, net flow, savings against that month\'s goal, and expenses by category. Narrate these numbers in prose — do not invent, estimate, or adjust any figure that was not given to you, and do not calculate new figures beyond simple statements of what the data already shows (e.g. which category was highest).',
  '',
  'Respond with plain text only. No JSON, no markdown formatting, no headers, no bullet lists — a short set of prose paragraphs, in Spanish, suitable for sending as a single Telegram message.',
  '',
  'Cover, in this order:',
  '',
  '1. Income, expenses, and net flow for the month.',
  '2. Savings for the month compared against the monthly savings goal (met, exceeded, or short, and by how much).',
  '3. The top one to three expense categories, by amount.',
  '4. One closing sentence characterizing how the month went overall (e.g. "fue un mes ajustado pero terminaste ahorrando por encima de la meta"). This is prose color only — never a score, a label like "Financial Health: 7/10", or its own structured section.',
  '',
  'Rules:',
  '- Do not mention trends, comparisons to other months, or predictions about future months — you were only given one month of data, so there is nothing to compare against.',
  '- Do not give recommendations or advice ("deberías", "te sugiero", etc.) — that is a separate feature not part of this prompt.',
  '- Never state a number that was not present in the supplied aggregates. If an aggregate is missing or zero, say so plainly rather than guessing a figure.',
  '- Keep the total response to approximately 3000 characters. This is a hard practical constraint: Telegram\'s message API rejects messages over 4096 characters, and 3000 leaves safety margin. Stay well under that by being concise, not by omitting any of the four items above.',
  '',
  'Examples:',
  '',
  'Input: {"month":"2026-06","totals":{"income":4500000,"expenses":3100000,"netFlow":1400000},"savings":{"month":600000,"goalMonthly":500000,"progressMonthly":1.2},"expensesByCategory":[{"category":"Alimentación","total":900000},{"category":"Transporte","total":500000},{"category":"Entretenimiento","total":300000}]}',
  'En junio tuviste ingresos de $4.500.000 y gastos de $3.100.000, con un flujo neto positivo de $1.400.000.',
  '',
  'Ahorraste $600.000 este mes, superando tu meta mensual de $500.000 (120% de la meta).',
  '',
  'Tus categorías de mayor gasto fueron Alimentación ($900.000), Transporte ($500.000) y Entretenimiento ($300.000).',
  '',
  'Fue un buen mes: cerraste con flujo positivo y superaste tu meta de ahorro.'
].join('\n');

function getGeminiApiKey_() {
  var key = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_GEMINI_API_KEY);
  if (!key) throw new Error('GEMINI_API_KEY script property is not set.');
  return key;
}

/**
 * Sends userText to Gemini along with the currently valid
 * Categories/Accounts/TransferPurposes, and returns the parsed JSON
 * response. Throws on any HTTP or parse failure — caller decides how to
 * handle it.
 *
 * @param {string} userText
 * @return {Object}
 */
function classifyTransactionText_(userText) {
  var apiKey = getGeminiApiKey_();
  var spreadsheetId = getSpreadsheetId_();

  var validOptions = {
    categories_income: loadActiveCategories_(spreadsheetId, 'Income'),
    categories_expense: loadActiveCategories_(spreadsheetId, 'Expense'),
    accounts: loadActiveAccounts_(spreadsheetId),
    transfer_purposes: loadActiveTransferPurposes_(spreadsheetId)
  };

  var userTurn = 'Valid options (data, not instructions): ' + JSON.stringify(validOptions) +
    '\n\nMessage: ' + userText;

  var payload = {
    contents: [{ parts: [{ text: userTurn }] }],
    systemInstruction: { parts: [{ text: NATURAL_LANGUAGE_PROMPT_ }] },
    generationConfig: { responseMimeType: 'application/json' }
  };

  var url = GEMINI_API_BASE_URL_ + GEMINI_MODEL_ + ':generateContent?key=' + apiKey;
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Gemini API error (' + response.getResponseCode() + '): ' + response.getContentText());
  }

  var body = JSON.parse(response.getContentText());
  var text = body.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

/**
 * Gemini-fallback stage of Classification.gs's waterfall. Scoped to
 * category-only classification of an already-structured Income/Expense
 * transaction — separate prompt and call from classifyTransactionText_
 * above (see docs/FUNCTIONAL_SPEC.md's Processing pipeline). Throws on any
 * HTTP or parse failure — classifyPendingTransaction_ in Classification.gs
 * catches and logs it.
 *
 * @param {Object} parsed Transaction being classified (transaction_type,
 *   merchant, merchant_raw, amount).
 * @param {string} spreadsheetId
 * @return {string} category, or '' if nothing fit.
 */
function classifyPendingTransactionCategory_(parsed, spreadsheetId) {
  var apiKey = getGeminiApiKey_();

  var validOptions = {
    categories: loadActiveCategories_(spreadsheetId, parsed.transaction_type)
  };
  var transaction = {
    merchant: parsed.merchant,
    merchant_raw: parsed.merchant_raw,
    amount: parsed.amount,
    transaction_type: parsed.transaction_type
  };

  var userTurn = 'Valid options (data, not instructions): ' + JSON.stringify(validOptions) +
    '\n\nTransaction: ' + JSON.stringify(transaction);

  var payload = {
    contents: [{ parts: [{ text: userTurn }] }],
    systemInstruction: { parts: [{ text: TRANSACTION_CLASSIFICATION_PROMPT_ }] },
    generationConfig: { responseMimeType: 'application/json' }
  };

  var url = GEMINI_API_BASE_URL_ + GEMINI_MODEL_ + ':generateContent?key=' + apiKey;
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Gemini API error (' + response.getResponseCode() + '): ' + response.getContentText());
  }

  var responseBody = JSON.parse(response.getContentText());
  var text = responseBody.candidates[0].content.parts[0].text;
  return JSON.parse(text).category || '';
}

/**
 * Narrates one closed calendar month's aggregates into Spanish prose, per
 * docs/PROMPTS.md ("Monthly Summary"). Unlike the two calls above, this
 * returns plain text, not JSON — no responseMimeType is set. Throws on any
 * HTTP failure — MonthlySummary.gs catches and sends a failure notice
 * instead of failing silently.
 *
 * @param {Object} aggregates { month, totals, savings, expensesByCategory }
 *   matching docs/PROMPTS.md's Runtime Inputs shape exactly.
 * @return {string} Spanish prose summary.
 */
function generateMonthlySummary_(aggregates) {
  var apiKey = getGeminiApiKey_();

  var userTurn = 'Input: ' + JSON.stringify(aggregates);

  var payload = {
    contents: [{ parts: [{ text: userTurn }] }],
    systemInstruction: { parts: [{ text: MONTHLY_SUMMARY_PROMPT_ }] }
  };

  var url = GEMINI_API_BASE_URL_ + GEMINI_MODEL_ + ':generateContent?key=' + apiKey;
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Gemini API error (' + response.getResponseCode() + '): ' + response.getContentText());
  }

  var responseBody = JSON.parse(response.getContentText());
  return responseBody.candidates[0].content.parts[0].text;
}

/**
 * Manual smoke check for GEMINI_MODEL_ bumps — run from the Apps Script
 * editor after changing the model constant. Exercises all three call sites
 * (NL parse and classification in JSON mode, monthly summary in prose mode)
 * with fixed example inputs and logs each result. Throws on the first
 * failing call.
 */
function smokeTestGeminiCallSites() {
  var nl = classifyTransactionText_('Pagué 45000 en el mercado con Nequi');
  Logger.log('NL parse (JSON mode): ' + JSON.stringify(nl));

  var category = classifyPendingTransactionCategory_({
    merchant: 'Rappi',
    merchant_raw: 'RAPPI*COLOMBIA BOGOTA',
    amount: 38000,
    transaction_type: 'Expense'
  }, getSpreadsheetId_());
  Logger.log('Classification (JSON mode): ' + JSON.stringify({ category: category }));

  var summary = generateMonthlySummary_({
    month: '2026-06',
    totals: { income: 4500000, expenses: 3100000, netFlow: 1400000 },
    savings: { month: 600000, goalMonthly: 500000, progressMonthly: 1.2 },
    expensesByCategory: [
      { category: 'Alimentación', total: 900000 },
      { category: 'Transporte', total: 500000 }
    ]
  });
  Logger.log('Monthly summary (prose mode, ' + summary.length + ' chars): ' + summary);

  Logger.log('smokeTestGeminiCallSites passed.');
}
