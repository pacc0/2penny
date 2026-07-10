// Phase 5: single Web App page (doGet) that reads the sheets and returns a
// fully server-aggregated dashboard. See docs/DASHBOARD.md v2.0 for the
// complete build spec and docs/DATA_MODEL.md for Reporting Rules — every
// aggregation here traces back to one of those.
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

// RENAMED in Stage 2: the v1.0 dashboard deployment is PINNED to the pre-Stage-2
// version and still serves this function there. Never bump that deployment.
// Retirement: Stage 7. See docs/DECISIONS.md ADR-0011.
/**
 * Web App entry point (this project's only doGet — doPost is owned by the
 * Telegram webhook). No caching, no partial render: any read failure serves
 * a single Spanish error message.
 */
function doGet_legacy_v1() {
  try {
    var template = HtmlService.createTemplateFromFile('DashboardPage');
    template.data = buildDashboardData_(getSpreadsheetId_());
    return template.evaluate().setTitle('Penny — Tablero');
  } catch (err) {
    Logger.log('doGet failed: ' + err);
    return HtmlService.createHtmlOutput(
      '<p style="font-family:sans-serif;padding:2rem;">No fue posible cargar el tablero. Intenta de nuevo.</p>'
    );
  }
}

/**
 * Orchestrator: one read of each sheet, date boundaries computed once via
 * ISO-string math (transaction_date is stored as YYYY-MM-DD, so string
 * comparison works — no Date parsing needed), then every aggregator per
 * docs/DASHBOARD.md §2.4.
 */
function buildDashboardData_(spreadsheetId) {
  var todayIso = todayIsoDate_();
  var monthStart = todayIso.substring(0, 7) + '-01';
  var monthEnd = todayIso;
  var yearStart = todayIso.substring(0, 4) + '-01-01';

  var transactions = loadAllTransactions_(spreadsheetId);
  var purposeMap = loadTransferPurposeSavingsMap_(spreadsheetId);
  var settingsMap = loadSettingsMap_(spreadsheetId);

  var goalMonthly = Number(settingsMap['Monthly Savings Goal']);
  var percentagePrecision = Number(settingsMap['Percentage Precision']);
  var showPending = settingsMap['Show Pending Transactions'] === 'Yes';

  var data = {
    month: aggregateMonth_(transactions, monthStart, monthEnd),
    pendingCount: countPending_(transactions),
    savings: aggregateSavings_(transactions, purposeMap, monthStart, monthEnd, yearStart, goalMonthly),
    expensesByCategory: aggregateExpensesByCategory_(transactions, monthStart, monthEnd),
    expensesByAccount: aggregateExpensesByAccount_(transactions, monthStart, monthEnd),
    cumulativeNetFlow: aggregateCumulativeNetFlow_(transactions, monthStart, monthEnd),
    settings: {
      percentagePrecision: percentagePrecision,
      showPending: showPending
    }
  };

  if (showPending) {
    data.pendingRows = buildPendingRows_(transactions);
  }

  return data;
}

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

// Calendar-day spacing per docs/DASHBOARD.md §2.4: one entry for every day
// from monthStart through monthEnd inclusive, zero-activity days carried
// forward flat. Builds a per-date net sum first, then walks the calendar
// range applying a running total — simpler to read than incrementing ISO
// date strings by hand, and this range is only ever a single calendar month.
function aggregateCumulativeNetFlow_(transactions, monthStart, monthEnd) {
  var netByDate = {};
  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Confirmed') continue;
    var date = row[COL_TRANSACTION_DATE];
    if (date < monthStart || date > monthEnd) continue;
    if (row[COL_TRANSACTION_TYPE] === 'Income') {
      netByDate[date] = (netByDate[date] || 0) + row[COL_AMOUNT];
    } else if (row[COL_TRANSACTION_TYPE] === 'Expense') {
      netByDate[date] = (netByDate[date] || 0) - row[COL_AMOUNT];
    }
  }

  var year = Number(monthStart.substring(0, 4));
  var month = Number(monthStart.substring(5, 7));
  var lastDay = Number(monthEnd.substring(8, 10));
  var series = [];
  var running = 0;
  for (var day = 1; day <= lastDay; day++) {
    var isoDay = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    running += netByDate[isoDay] || 0;
    series.push({ date: isoDay, value: running });
  }
  return series;
}

function buildPendingRows_(transactions) {
  var rows = [];
  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Pending') continue;
    var type = row[COL_TRANSACTION_TYPE];
    rows.push({
      transaction_date: row[COL_TRANSACTION_DATE],
      merchant: row[COL_MERCHANT],
      categoryOrPurpose: (type === 'Expense' || type === 'Income') ? row[COL_CATEGORY] : row[COL_TRANSFER_PURPOSE],
      amount: row[COL_AMOUNT],
      account_from: row[COL_ACCOUNT_FROM]
    });
  }
  return rows;
}

function countPending_(transactions) {
  var count = 0;
  for (var i = 1; i < transactions.length; i++) {
    if (transactions[i][COL_STATUS] === 'Pending') count++;
  }
  return count;
}
