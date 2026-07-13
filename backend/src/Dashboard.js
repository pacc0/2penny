// Shared sheet loaders and aggregators consumed by Api.js (json-api @21) and
// MonthlySummary.js (Telegram). See docs/DATA_MODEL.md for Reporting Rules —
// every aggregation here traces back to it. The v1.0 doGet dashboard that
// originally owned this file was retired in Stage 7 (see stage-7-cutover plan).
//
// getSpreadsheetId_() (GmailIngestion.gs) and the sheet-name constants /
// todayIsoDate_() (TransactionsRepository.gs) are reused as-is.

// Transactions column indices, matching writeTransactionRow_'s append order.
var COL_ID = 0;
var COL_TRANSACTION_DATE = 1;
var COL_TRANSACTION_TYPE = 2;
var COL_CATEGORY = 3;
var COL_ACCOUNT_FROM = 4;
var COL_ACCOUNT_TO = 5;
var COL_TRANSFER_PURPOSE = 6;
var COL_AMOUNT = 7;
var COL_DESCRIPTION = 8;
var COL_MERCHANT = 9;
var COL_MERCHANT_RAW = 10;
var COL_SOURCE = 11;
var COL_STATUS = 12;
var COL_CREATED_AT = 13;

// Sheets can auto-detect a date-shaped string and store the cell as a Date
// serial instead of text, which getValues() then returns as a JS Date. Every
// aggregator below does ISO-string comparison, so normalize transaction_date
// back to 'YYYY-MM-DD' here, once, regardless of how the cell is stored.
function loadAllTransactions_(spreadsheetId) {
  var values = SpreadsheetApp.openById(spreadsheetId).getSheetByName(TRANSACTIONS_SHEET_NAME).getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var date = values[i][COL_TRANSACTION_DATE];
    if (date instanceof Date) {
      values[i][COL_TRANSACTION_DATE] = Utilities.formatDate(date, 'America/Bogota', 'yyyy-MM-dd');
    }
  }
  return values;
}

// Reads ALL TransferPurposes rows (including inactive) — a Transfer may
// reference a purpose that has since been deactivated. Deliberately does not
// reuse loadActiveTransferPurposes_ (active-only, serves Telegram).
function loadTransferPurposeSavingsMap_(spreadsheetId) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(TRANSFER_PURPOSES_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < values.length; i++) { // skip header row
    var purpose = String(values[i][0]).trim();
    var countsAsSavings = values[i][1];
    if (purpose) {
      map[purpose] = countsAsSavings === true || String(countsAsSavings).trim() === 'Yes';
    }
  }
  return map;
}

function loadSettingsMap_(spreadsheetId) {
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SETTINGS_SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < values.length; i++) { // skip header row
    var setting = String(values[i][0]).trim();
    if (setting) {
      map[setting] = values[i][1];
    }
  }
  return map;
}

function aggregateMonth_(transactions, monthStart, monthEnd) {
  var income = 0;
  var expenses = 0;
  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Confirmed') continue;
    var date = row[COL_TRANSACTION_DATE];
    if (date < monthStart || date > monthEnd) continue;
    if (row[COL_TRANSACTION_TYPE] === 'Income') income += row[COL_AMOUNT];
    else if (row[COL_TRANSACTION_TYPE] === 'Expense') expenses += row[COL_AMOUNT];
  }
  return { income: income, expenses: expenses, netFlow: income - expenses };
}

function aggregateSavings_(transactions, purposeMap, monthStart, monthEnd, yearStart, goalMonthly) {
  var month = 0;
  var ytd = 0;
  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Confirmed') continue;
    if (row[COL_TRANSACTION_TYPE] !== 'Transfer') continue;
    if (!purposeMap[row[COL_TRANSFER_PURPOSE]]) continue;
    var date = row[COL_TRANSACTION_DATE];
    if (date >= yearStart && date <= monthEnd) ytd += row[COL_AMOUNT];
    if (date >= monthStart && date <= monthEnd) month += row[COL_AMOUNT];
  }
  var goalAnnual = goalMonthly * 12;
  return {
    month: month,
    ytd: ytd,
    goalMonthly: goalMonthly,
    goalAnnual: goalAnnual,
    progressMonthly: goalMonthly ? month / goalMonthly : 0,
    progressAnnual: goalAnnual ? ytd / goalAnnual : 0
  };
}

function aggregateExpensesByCategory_(transactions, monthStart, monthEnd) {
  var totals = {};
  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Confirmed') continue;
    if (row[COL_TRANSACTION_TYPE] !== 'Expense') continue;
    var date = row[COL_TRANSACTION_DATE];
    if (date < monthStart || date > monthEnd) continue;
    var category = row[COL_CATEGORY];
    totals[category] = (totals[category] || 0) + row[COL_AMOUNT];
  }
  return Object.keys(totals)
    .map(function (category) { return { category: category, total: totals[category] }; })
    .sort(function (a, b) { return b.total - a.total; });
}

function aggregateExpensesByAccount_(transactions, monthStart, monthEnd) {
  var totals = {};
  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Confirmed') continue;
    if (row[COL_TRANSACTION_TYPE] !== 'Expense') continue;
    var date = row[COL_TRANSACTION_DATE];
    if (date < monthStart || date > monthEnd) continue;
    var account = row[COL_ACCOUNT_FROM];
    totals[account] = (totals[account] || 0) + row[COL_AMOUNT];
  }
  return Object.keys(totals)
    .map(function (account) { return { account: account, total: totals[account] }; })
    .sort(function (a, b) { return b.total - a.total; });
}

