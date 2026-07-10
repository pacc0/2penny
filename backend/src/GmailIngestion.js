// Phase 2: ingests Lulo Bank transaction notifications from Gmail into the
// Transactions sheet as Pending rows. See docs/ROADMAP.md and
// docs/DATA_MODEL.md for the business rules this implements.

var POLL_INTERVAL_MINUTES = 30;
var GMAIL_SENDER = 'notificaciones@lulobank.com';
var PROCESSED_LABEL_NAME = 'Penny/Processed';
var MERCHANT_DICTIONARY_SHEET_NAME = 'MerchantDictionary';
var SCRIPT_PROPERTY_SPREADSHEET_ID = 'SPREADSHEET_ID';
var SCRIPT_PROPERTY_SETUP_CUTOFF = 'SETUP_CUTOFF';

/**
 * One-time setup. Run manually from the Apps Script editor.
 *
 * Stores the target spreadsheet ID, records the cutoff timestamp used to
 * skip pre-existing mail (no backfill), and installs the recurring trigger.
 * O(1) — touches no existing messages.
 *
 * @param {string} spreadsheetId
 */
function setup(spreadsheetId) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty(SCRIPT_PROPERTY_SPREADSHEET_ID, spreadsheetId);
  properties.setProperty(SCRIPT_PROPERTY_SETUP_CUTOFF, new Date().toISOString());
  getOrCreateProcessedLabel_();
  installTrigger_();
}

function installTrigger_() {
  removeExistingTriggers_();
  ScriptApp.newTrigger('ingestLuloEmails')
    .timeBased()
    .everyMinutes(POLL_INTERVAL_MINUTES)
    .create();
}

function removeExistingTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'ingestLuloEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/**
 * Trigger entry point.
 */
function ingestLuloEmails() {
  var label = getOrCreateProcessedLabel_();
  var spreadsheetId = getSpreadsheetId_();
  var merchantMap = loadMerchantDictionary_(spreadsheetId);
  var cutoffDate = getSetupCutoffDate_();

  var threads = searchAllThreads_('from:' + GMAIL_SENDER + ' -label:' + PROCESSED_LABEL_NAME);

  threads.forEach(function (thread) {
    thread.getMessages().forEach(function (message) {
      processMessage_(message, label, spreadsheetId, merchantMap, cutoffDate);
    });
  });
}

function processMessage_(message, label, spreadsheetId, merchantMap, cutoffDate) {
  var subject = message.getSubject();

  if (isIgnoredSubject_(subject)) {
    message.getThread().addLabel(label);
    return;
  }

  if (message.getDate() < cutoffDate) {
    // Predates setup — not a real transaction to record, just mark seen.
    message.getThread().addLabel(label);
    return;
  }

  var parsed;
  try {
    parsed = parseLuloEmail(subject, message.getPlainBody());
  } catch (err) {
    Logger.log('PARSE FAILED for message ' + message.getId() + ' ("' + subject + '"): ' + err);
    return; // Nothing written, nothing labeled — safe to retry next run.
  }

  if (!parsed) {
    Logger.log('UNRECOGNIZED SUBJECT for message ' + message.getId() + ': "' + subject + '"');
    return; // Nothing written, nothing labeled — safe to retry next run.
  }

  var merchantDictionaryEntry = getMerchantDictionaryEntry_(parsed.merchant_raw, merchantMap);
  parsed.merchant = normalizeMerchant_(parsed.merchant_raw, merchantDictionaryEntry);

  if (parsed.transaction_type === 'Income' || parsed.transaction_type === 'Expense') {
    try {
      parsed.category = classifyPendingTransaction_(parsed, merchantDictionaryEntry, spreadsheetId);
    } catch (err) {
      Logger.log('CLASSIFICATION FAILED for message ' + message.getId() + ': ' + err);
      parsed.category = '';
    }
  }

  try {
    writeTransaction_(spreadsheetId, parsed);
  } catch (err) {
    Logger.log('WRITE FAILED for message ' + message.getId() + ': ' + err);
    return; // Nothing written, nothing labeled — safe to retry next run.
  }

  try {
    message.getThread().addLabel(label);
  } catch (err) {
    // KNOWN LIMITATION:
    //
    // If the transaction is successfully written but applying the Gmail label fails,
    // the email will be processed again on the next execution, creating a duplicate
    // Pending transaction.
    //
    // This is an accepted trade-off for Phase 2 to keep the data model simple.
    // Duplicate Pending transactions are detected during the existing manual review.
    //
    // TODO (Future):
    // Revisit if duplicate Pending transactions become a real operational issue.
    // A future solution may introduce a source_message_id or equivalent idempotency mechanism.
    Logger.log('WROTE BUT UNLABELED for message ' + message.getId() + ': ' + err);
  }
}

function isIgnoredSubject_(subject) {
  return subject.indexOf('Verificación de seguridad') !== -1;
}

function getOrCreateProcessedLabel_() {
  return GmailApp.getUserLabelByName(PROCESSED_LABEL_NAME) || GmailApp.createLabel(PROCESSED_LABEL_NAME);
}

function getSpreadsheetId_() {
  var id = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_SPREADSHEET_ID);
  if (!id) {
    throw new Error('SPREADSHEET_ID script property is not set. Run setup(spreadsheetId) first.');
  }
  return id;
}

function getSetupCutoffDate_() {
  var iso = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_SETUP_CUTOFF);
  if (!iso) {
    throw new Error('SETUP_CUTOFF script property is not set. Run setup(spreadsheetId) first.');
  }
  return new Date(iso);
}

/**
 * Paginates GmailApp.search so large result sets aren't silently truncated.
 */
function searchAllThreads_(query) {
  var threads = [];
  var start = 0;
  var pageSize = 100;
  while (true) {
    var page = GmailApp.search(query, start, pageSize);
    if (page.length === 0) break;
    threads = threads.concat(page);
    start += pageSize;
  }
  return threads;
}

// Map values carry both the normalized display name and the optional
// classification hint: { merchant, category_hint }. Single read of
// MerchantDictionary, reused for both normalization (below) and
// classification (Classification.gs) — see docs/DATA_MODEL.md.
function loadMerchantDictionary_(spreadsheetId) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(MERCHANT_DICTIONARY_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < values.length; i++) { // skip header row
    var merchantRaw = String(values[i][0]).trim();
    var merchant = String(values[i][1]).trim();
    var categoryHint = String(values[i][2]).trim();
    var active = values[i][3];
    // Inactive rows are skipped entirely (same convention as
    // loadActiveRules_/loadActiveCategories_/loadActiveAccounts_) — an
    // inactive row participates in neither normalization nor category_hint
    // classification, falling back to merchant_raw unchanged.
    if (merchantRaw && active) {
      map[merchantRaw] = { merchant: merchant, category_hint: categoryHint };
    }
  }
  return map;
}

// Never writes back to MerchantDictionary. A miss (or no entry) falls back
// to merchant_raw unchanged, per DATA_MODEL.md. Takes the already-looked-up
// entry (see getMerchantDictionaryEntry_) so callers do one lookup, not two.
function normalizeMerchant_(merchantRaw, merchantDictionaryEntry) {
  if (!merchantRaw) return merchantRaw;
  return merchantDictionaryEntry ? merchantDictionaryEntry.merchant : merchantRaw;
}

// Lookup only — same trim/hasOwnProperty rule as normalizeMerchant_. Used by
// Classification.gs's dict-hint stage. Returns null on a miss.
function getMerchantDictionaryEntry_(merchantRaw, merchantMap) {
  if (!merchantRaw) return null;
  var trimmed = merchantRaw.trim();
  return Object.prototype.hasOwnProperty.call(merchantMap, trimmed) ? merchantMap[trimmed] : null;
}

// Delegates to the shared append-only write path (TransactionsRepository.gs),
// pinning Gmail-imported rows to source=Gmail/status=Pending per
// docs/DATA_MODEL.md's Source Rules. Behavior is unchanged from before the
// extraction — only the row-building code moved.
function writeTransaction_(spreadsheetId, parsed) {
  writeTransactionRow_(spreadsheetId, {
    transaction_date: parsed.transaction_date,
    transaction_type: parsed.transaction_type,
    category: parsed.category,
    account_from: parsed.account_from,
    account_to: parsed.account_to,
    transfer_purpose: parsed.transfer_purpose,
    amount: parsed.amount,
    description: parsed.description,
    merchant: parsed.merchant,
    merchant_raw: parsed.merchant_raw,
    source: 'Gmail',
    status: 'Pending'
  });
}
