// Phase 4: classification engine for Gmail-imported Pending Income/Expense
// transactions. Waterfall: MerchantDictionary category_hint -> Rules Engine
// -> Gemini fallback (GeminiClient.gs). Transfer transactions never run
// through this — see docs/DATA_MODEL.md, Entity: Rules, and
// docs/FUNCTIONAL_SPEC.md's Processing pipeline.

var RULES_SHEET_NAME = 'Rules';

/**
 * Reads Rules once, returns active rows in worksheet order (row order is
 * priority — first match wins, see docs/DATA_MODEL.md Entity: Rules).
 */
function loadActiveRules_(spreadsheetId) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(RULES_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var rules = [];
  for (var i = 1; i < values.length; i++) { // skip header row
    var pattern = String(values[i][0]).trim();
    var category = String(values[i][1]).trim();
    var active = values[i][2];
    if (pattern && category && active) {
      rules.push({ pattern: pattern, category: category });
    }
  }
  return rules;
}

/**
 * Case-insensitive substring match of pattern against merchantRaw. First
 * match in array order wins.
 */
function resolveCategoryFromRules_(merchantRaw, rules) {
  if (!merchantRaw) return '';
  var haystack = merchantRaw.toLowerCase();
  for (var i = 0; i < rules.length; i++) {
    if (haystack.indexOf(rules[i].pattern.toLowerCase()) !== -1) {
      return rules[i].category;
    }
  }
  return '';
}

/**
 * True if category is non-empty and appears in the active category list for
 * transactionType. Shared validation gate for every classification stage.
 */
function isValidCategoryForType_(category, transactionType, spreadsheetId) {
  if (!category) return false;
  return loadActiveCategories_(spreadsheetId, transactionType).indexOf(category) !== -1;
}

/**
 * Orchestrates the classification waterfall for a single Gmail-imported
 * Pending transaction: MerchantDictionary category_hint -> Rules Engine ->
 * Gemini fallback. No-op (returns '') for anything but Income/Expense.
 * Never throws — a Gemini failure is caught and logged, category stays ''.
 *
 * @param {Object} parsed Transaction being classified (transaction_type,
 *   merchant, merchant_raw, amount).
 * @param {?Object} merchantDictionaryEntry {merchant, category_hint} for
 *   parsed.merchant_raw, or null on a dictionary miss.
 * @param {string} spreadsheetId
 * @return {string} Resolved category, or '' if nothing resolved.
 */
function classifyPendingTransaction_(parsed, merchantDictionaryEntry, spreadsheetId) {
  if (parsed.transaction_type !== 'Income' && parsed.transaction_type !== 'Expense') {
    return '';
  }

  var hint = merchantDictionaryEntry && merchantDictionaryEntry.category_hint;
  if (isValidCategoryForType_(hint, parsed.transaction_type, spreadsheetId)) {
    return hint;
  }

  var rules = loadActiveRules_(spreadsheetId);
  var ruleCategory = resolveCategoryFromRules_(parsed.merchant_raw, rules);
  if (isValidCategoryForType_(ruleCategory, parsed.transaction_type, spreadsheetId)) {
    return ruleCategory;
  }

  try {
    var geminiCategory = classifyPendingTransactionCategory_(parsed, spreadsheetId);
    if (isValidCategoryForType_(geminiCategory, parsed.transaction_type, spreadsheetId)) {
      return geminiCategory;
    }
  } catch (err) {
    Logger.log('CLASSIFICATION FAILED (Gemini) for merchant_raw "' + parsed.merchant_raw + '": ' + err);
  }

  return '';
}

/**
 * Self-check for the classification waterfall. Run manually from the Apps
 * Script editor — no framework, no live Sheets/Gemini calls. Every
 * dependency classifyPendingTransaction_ calls out to is monkey-patched for
 * the duration of the run and restored in `finally`. Throws on the first
 * failed assertion; logs PASSED on success.
 */
function classificationSelfCheck_() {
  var originalIsValid = isValidCategoryForType_;
  var originalLoadRules = loadActiveRules_;
  var originalClassifyGemini = classifyPendingTransactionCategory_;

  function assertEqual(actual, expected, label) {
    if (actual !== expected) {
      throw new Error('classificationSelfCheck_ FAILED [' + label + ']: expected "' + expected + '", got "' + actual + '"');
    }
  }

  try {
    // Fake world: only 'Alimentación' and 'Transporte' are valid categories.
    isValidCategoryForType_ = function (category) {
      return category === 'Alimentación' || category === 'Transporte';
    };

    // 1. Dict hint hit.
    assertEqual(
      classifyPendingTransaction_(
        { transaction_type: 'Expense', merchant_raw: 'RAPPI*BOGOTA' },
        { merchant: 'Rappi', category_hint: 'Alimentación' },
        'fake-id'
      ),
      'Alimentación',
      'dict hint hit'
    );

    // 2. Dict hint rejected (inactive/wrong-type) falls through to Rules.
    loadActiveRules_ = function () {
      return [{ pattern: 'rappi', category: 'Transporte' }];
    };
    assertEqual(
      classifyPendingTransaction_(
        { transaction_type: 'Expense', merchant_raw: 'RAPPI*BOGOTA' },
        { merchant: 'Rappi', category_hint: 'Categoría Inactiva' },
        'fake-id'
      ),
      'Transporte',
      'dict hint rejected falls through to rules'
    );

    // 3. Rules hit (no dict entry at all — this is also what an inactive
    // MerchantDictionary row produces upstream: loadMerchantDictionary_
    // skips inactive rows entirely, so getMerchantDictionaryEntry_ returns
    // null, same as a plain miss). Reset the rules mock from test 2 (which
    // wouldn't match this merchant) so this actually exercises the rules
    // stage instead of silently falling through to Gemini.
    loadActiveRules_ = function () {
      return [{ pattern: 'uber', category: 'Transporte' }];
    };
    assertEqual(
      classifyPendingTransaction_(
        { transaction_type: 'Expense', merchant_raw: 'UBER*TRIP' },
        null,
        'fake-id'
      ),
      'Transporte',
      'rules hit'
    );

    // 4. Rules multi-match row-order tiebreak — first match wins.
    loadActiveRules_ = function () {
      return [
        { pattern: 'uber', category: 'Alimentación' },
        { pattern: 'trip', category: 'Transporte' }
      ];
    };
    assertEqual(
      classifyPendingTransaction_(
        { transaction_type: 'Expense', merchant_raw: 'UBER*TRIP' },
        null,
        'fake-id'
      ),
      'Alimentación',
      'rules row-order tiebreak'
    );

    // 5. No match reaches the Gemini stage.
    loadActiveRules_ = function () { return []; };
    var geminiCalled = false;
    classifyPendingTransactionCategory_ = function () {
      geminiCalled = true;
      return 'Transporte';
    };
    assertEqual(
      classifyPendingTransaction_(
        { transaction_type: 'Expense', merchant_raw: 'DESCONOCIDO' },
        null,
        'fake-id'
      ),
      'Transporte',
      'gemini fallback used'
    );
    assertEqual(geminiCalled, true, 'gemini stage reached on no match');

    // 6. Gemini failure leaves category ''.
    classifyPendingTransactionCategory_ = function () {
      throw new Error('simulated Gemini failure');
    };
    assertEqual(
      classifyPendingTransaction_(
        { transaction_type: 'Expense', merchant_raw: 'DESCONOCIDO' },
        null,
        'fake-id'
      ),
      '',
      'gemini failure leaves category empty'
    );

    // 7. Transfer rows never call classification at all — no-op before any
    // stage runs.
    var rulesCalled = false;
    loadActiveRules_ = function () { rulesCalled = true; return []; };
    assertEqual(
      classifyPendingTransaction_(
        { transaction_type: 'Transfer', merchant_raw: 'CAJERO' },
        { merchant: 'Cajero', category_hint: 'Alimentación' },
        'fake-id'
      ),
      '',
      'transfer rows are a no-op'
    );
    assertEqual(rulesCalled, false, 'transfer rows never reach the rules stage');

    Logger.log('classificationSelfCheck_ PASSED');
  } finally {
    isValidCategoryForType_ = originalIsValid;
    loadActiveRules_ = originalLoadRules;
    classifyPendingTransactionCategory_ = originalClassifyGemini;
  }
}
