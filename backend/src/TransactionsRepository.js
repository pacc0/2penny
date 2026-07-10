// Shared, append-only Transactions write path plus read helpers for the
// supporting config sheets (Categories, Accounts, TransferPurposes). Used by
// both GmailIngestion.gs (Pending rows) and the Telegram bot (Confirmed
// rows). See docs/DATA_MODEL.md for schema and Source/Status rules.
//
// getSpreadsheetId_() is defined in GmailIngestion.gs and reused here as-is
// (single Script Property, no need to duplicate it).

var TRANSACTIONS_SHEET_NAME = 'Transactions';
var CATEGORIES_SHEET_NAME = 'Categories';
var ACCOUNTS_SHEET_NAME = 'Accounts';
var TRANSFER_PURPOSES_SHEET_NAME = 'TransferPurposes';
var SETTINGS_SHEET_NAME = 'Settings';

/**
 * Appends one row to Transactions. This is the single write path for every
 * source (Gmail, Telegram) — append-only, per the documented write
 * constraint (no in-place cell editing).
 *
 * @param {string} spreadsheetId
 * @param {Object} transaction Fields matching docs/DATA_MODEL.md's
 *   Transactions schema (id/created_at are generated here).
 */
function writeTransactionRow_(spreadsheetId, transaction) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(TRANSACTIONS_SHEET_NAME);
  sheet.appendRow([
    Utilities.getUuid(),               // id
    transaction.transaction_date,      // transaction_date
    transaction.transaction_type,      // transaction_type
    transaction.category || '',        // category
    transaction.account_from || '',    // account_from
    transaction.account_to || '',      // account_to
    transaction.transfer_purpose || '', // transfer_purpose
    transaction.amount,                // amount
    transaction.description || '',     // description
    transaction.merchant || '',        // merchant
    transaction.merchant_raw || '',    // merchant_raw
    transaction.source,                // source
    transaction.status,                // status
    new Date()                         // created_at
  ]);
}

/**
 * Today's date in ISO 8601, America/Bogota timezone. Telegram-created
 * transactions are always dated today — no backdating in v1 (see plan).
 */
function todayIsoDate_() {
  return Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd');
}

function loadActiveCategories_(spreadsheetId, type) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(CATEGORIES_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var names = [];
  for (var i = 1; i < values.length; i++) { // skip header row
    var name = String(values[i][0]).trim();
    var rowType = String(values[i][1]).trim();
    var active = values[i][2];
    if (name && rowType === type && active) {
      names.push(name);
    }
  }
  return names;
}

function loadActiveAccounts_(spreadsheetId) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(ACCOUNTS_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var names = [];
  for (var i = 1; i < values.length; i++) { // skip header row
    var name = String(values[i][0]).trim();
    var active = values[i][1];
    if (name && active) {
      names.push(name);
    }
  }
  return names;
}

function loadActiveTransferPurposes_(spreadsheetId) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(TRANSFER_PURPOSES_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) { // skip header row
    var purpose = String(values[i][0]).trim();
    var active = values[i][2];
    var displayOrder = values[i][3];
    if (purpose && active) {
      rows.push({ purpose: purpose, displayOrder: displayOrder });
    }
  }
  rows.sort(function (a, b) { return a.displayOrder - b.displayOrder; });
  return rows.map(function (row) { return row.purpose; });
}
