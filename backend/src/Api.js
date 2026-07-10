/**
 * Headless JSON endpoint — contract v1.0 (docs/DATA_CONTRACT.md §3).
 * Auth layer 1: validates e.parameter.key against Script Properties "API_SECRET".
 * Always HTTP 200 (Apps Script limitation); errors travel in the body and are
 * translated to real HTTP statuses by the Pages Function (Stage 4).
 */
function doGet(e) {
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('API_SECRET');
    if (!secret || !e || !e.parameter || e.parameter.key !== secret) {
      return jsonResponse_({ contract_version: '1.0', error: 'unauthorized' });
    }
    return jsonResponse_(buildDashboardPayload_());
  } catch (err) {
    return jsonResponse_({ contract_version: '1.0', error: 'internal' });
    // Never leak err details to the response; log instead:
    // console.error(err);
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Assembles the contract v1.0 envelope. Reuses Dashboard.js's aggregators
 * (aggregateMonth_, aggregateSavings_, aggregateExpensesByCategory_,
 * aggregateExpensesByAccount_, loadAllTransactions_,
 * loadTransferPurposeSavingsMap_, loadSettingsMap_) — same Reporting Rules,
 * different envelope shape per docs/DATA_CONTRACT.md §3.
 */
function buildDashboardPayload_() {
  var spreadsheetId = getSpreadsheetId_();
  var todayIso = todayIsoDate_();
  var monthKey = todayIso.substring(0, 7);
  var monthStart = monthKey + '-01';
  var yearStart = todayIso.substring(0, 4) + '-01-01';

  var transactions = loadAllTransactions_(spreadsheetId);
  var purposeMap = loadTransferPurposeSavingsMap_(spreadsheetId);
  var settingsMap = loadSettingsMap_(spreadsheetId);

  var goalMonthly = Number(getSettingTolerant_(settingsMap, 'Monthly Savings Goal')) || 0;
  var goalAnnualOverride = getSettingTolerant_(settingsMap, 'Annual Savings Goal');

  var month = aggregateMonth_(transactions, monthStart, todayIso);
  var savingsRaw = aggregateSavings_(transactions, purposeMap, monthStart, todayIso, yearStart, goalMonthly);

  return {
    contract_version: '1.0',
    generated_at: Utilities.formatDate(new Date(), 'America/Bogota', "yyyy-MM-dd'T'HH:mm:ssXXX"),
    period: {
      month: monthKey,
      calendar_mode: getSettingTolerant_(settingsMap, 'Calendar Mode') || '',
      currency: getSettingTolerant_(settingsMap, 'Currency') || ''
    },
    kpis: {
      income: month.income,
      expenses: month.expenses,
      net_flow: month.netFlow,
      savings: {
        month: savingsRaw.month,
        monthly_goal: goalMonthly,
        annual_accumulated: savingsRaw.ytd,
        annual_goal: goalAnnualOverride ? Number(goalAnnualOverride) : savingsRaw.goalAnnual
      }
    },
    expenses_by_category: aggregateExpensesByCategory_(transactions, monthStart, todayIso)
      .map(function (row) { return { category: row.category, amount: row.total }; }),
    expenses_by_account: aggregateExpensesByAccount_(transactions, monthStart, todayIso)
      .map(function (row) { return { account: row.account, amount: row.total }; }),
    net_flow_series: buildNetFlowSeries_(transactions, todayIso),
    pending: buildPendingPayload_(transactions),
    error: null
  };
}

// Settings is untyped/free-form (docs/DATA_CONTRACT.md §1) — trim + case-insensitive
// lookup so hand-edited rows don't silently miss due to casing/whitespace drift.
function getSettingTolerant_(settingsMap, key) {
  var lowerKey = key.toLowerCase();
  for (var k in settingsMap) {
    if (k.toLowerCase() === lowerKey) return settingsMap[k];
  }
  return undefined;
}

// 12 rolling calendar months including the current one, oldest first, one row
// per month even at zero (contract §3 fixed window — not a Setting, principle 5).
function buildNetFlowSeries_(transactions, todayIso) {
  var currentYear = Number(todayIso.substring(0, 4));
  var currentMonth = Number(todayIso.substring(5, 7));
  var months = [];
  for (var offset = 11; offset >= 0; offset--) {
    var d = new Date(currentYear, currentMonth - 1 - offset, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }

  var totals = {};
  months.forEach(function (m) { totals[m] = { income: 0, expenses: 0 }; });

  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Confirmed') continue;
    var monthKey = String(row[COL_TRANSACTION_DATE]).substring(0, 7);
    if (!totals[monthKey]) continue;
    if (row[COL_TRANSACTION_TYPE] === 'Income') totals[monthKey].income += row[COL_AMOUNT];
    else if (row[COL_TRANSACTION_TYPE] === 'Expense') totals[monthKey].expenses += row[COL_AMOUNT];
  }

  return months.map(function (m) {
    var t = totals[m];
    return { month: m, income: t.income, expenses: t.expenses, net_flow: t.income - t.expenses };
  });
}

function buildPendingPayload_(transactions) {
  var rows = [];
  for (var i = 1; i < transactions.length; i++) {
    var row = transactions[i];
    if (row[COL_STATUS] !== 'Pending') continue;
    rows.push({
      id: row[COL_ID],
      date: row[COL_TRANSACTION_DATE],
      amount: row[COL_AMOUNT],
      merchant: row[COL_MERCHANT],
      description: row[COL_DESCRIPTION],
      type: row[COL_TRANSACTION_TYPE]
    });
  }
  return rows;
}
