// Phase 6: narrates the previous closed calendar month's aggregates into a
// Spanish Telegram message via Gemini. See docs/ROADMAP.md Phase 6 and
// docs/DECISIONS.md ADR-0002 — ephemeral only, nothing is persisted.
//
// Reuses Dashboard.gs's aggregators (aggregateMonth_, aggregateSavings_,
// aggregateExpensesByCategory_) and their loader helpers, plus
// getSpreadsheetId_ (GmailIngestion.gs) and sendTelegramMessage_
// (TelegramClient.gs, untouched).

// Telegram's hard limit is 4096 chars; the prompt targets ~3000. This is the
// defensive backstop, not the primary length control.
var MONTHLY_SUMMARY_MAX_LENGTH_ = 4000;

/**
 * ONE-TIME MANUAL SETUP. Run this once from the Apps Script editor after
 * clasp push — it does NOT self-activate on deploy, same as
 * GmailIngestion.gs's setup(). Installs the day-1 monthly trigger.
 */
function setupMonthlySummaryTrigger() {
  installMonthlySummaryTrigger_();
}

function installMonthlySummaryTrigger_() {
  removeExistingMonthlySummaryTriggers_();
  ScriptApp.newTrigger('sendMonthlySummary')
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .create();
}

function removeExistingMonthlySummaryTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'sendMonthlySummary') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/**
 * Trigger entry point. Computes the previous calendar month's Confirmed-only
 * aggregates, narrates them via Gemini, and sends one Telegram message. On
 * any failure, sends a plain Spanish failure notice instead of failing
 * silently.
 */
function sendMonthlySummary() {
  try {
    var spreadsheetId = getSpreadsheetId_();
    var bounds = previousMonthBounds_();

    var transactions = loadAllTransactions_(spreadsheetId);
    var purposeMap = loadTransferPurposeSavingsMap_(spreadsheetId);
    var settingsMap = loadSettingsMap_(spreadsheetId);
    var goalMonthly = Number(settingsMap['Monthly Savings Goal']);

    var monthAggregate = aggregateMonth_(transactions, bounds.monthStart, bounds.monthEnd);
    var savingsAggregate = aggregateSavings_(transactions, purposeMap, bounds.monthStart, bounds.monthEnd, bounds.monthStart, goalMonthly);
    var expensesByCategory = aggregateExpensesByCategory_(transactions, bounds.monthStart, bounds.monthEnd);

    var aggregates = {
      month: bounds.month,
      totals: {
        income: monthAggregate.income,
        expenses: monthAggregate.expenses,
        netFlow: monthAggregate.netFlow
      },
      savings: {
        month: savingsAggregate.month,
        goalMonthly: savingsAggregate.goalMonthly,
        progressMonthly: savingsAggregate.progressMonthly
      },
      expensesByCategory: expensesByCategory
    };

    var summary = generateMonthlySummary_(aggregates);
    summary = truncateSummary_(summary);

    sendTelegramMessage_(summary);
  } catch (err) {
    Logger.log('Monthly summary failed: ' + err);
    sendTelegramMessage_('No fue posible generar el resumen mensual este mes. Revisa los registros de Apps Script.');
  }
}

// yearStart is passed as monthStart here — aggregateSavings_ needs a
// yearStart for its ytd figure, but ytd/goalAnnual are not part of this
// feature's Runtime Inputs shape (see docs/PROMPTS.md), so only month/
// goalMonthly/progressMonthly are read from the result.
function previousMonthBounds_() {
  var todayIso = todayIsoDate_();
  var year = Number(todayIso.substring(0, 4));
  var month = Number(todayIso.substring(5, 7)); // 1-12, current month

  var previousMonth = month - 1;
  var previousYear = year;
  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear = year - 1;
  }

  var monthStr = String(previousMonth).padStart(2, '0');
  var lastDay = new Date(previousYear, previousMonth, 0).getDate(); // day 0 of next month = last day of this one
  var monthStart = previousYear + '-' + monthStr + '-01';
  var monthEnd = previousYear + '-' + monthStr + '-' + String(lastDay).padStart(2, '0');

  return {
    month: previousYear + '-' + monthStr,
    monthStart: monthStart,
    monthEnd: monthEnd
  };
}

function truncateSummary_(text) {
  if (text.length <= MONTHLY_SUMMARY_MAX_LENGTH_) return text;
  return text.substring(0, MONTHLY_SUMMARY_MAX_LENGTH_ - 3) + '...';
}

/**
 * Manual self-check — run from the Apps Script editor, not wired to any
 * trigger. Covers ADR-0002 validation items 2 and 3 (boundary math, forced
 * over-length truncation). Item 1 (trigger fires day 1 in America/Bogota)
 * can only be confirmed by observing a real trigger fire, noted separately.
 */
function testMonthlySummaryLogic() {
  // January rollover: previous month of Jan is Dec of the prior year.
  var savedToday = todayIsoDate_;
  todayIsoDate_ = function () { return '2026-01-15'; };
  var bounds = previousMonthBounds_();
  todayIsoDate_ = savedToday;
  if (bounds.month !== '2025-12') throw new Error('Expected 2025-12, got ' + bounds.month);
  if (bounds.monthStart !== '2025-12-01') throw new Error('Expected 2025-12-01, got ' + bounds.monthStart);
  if (bounds.monthEnd !== '2025-12-31') throw new Error('Expected 2025-12-31, got ' + bounds.monthEnd);

  // Mid-year, 30-day month.
  savedToday = todayIsoDate_;
  todayIsoDate_ = function () { return '2026-05-10'; };
  bounds = previousMonthBounds_();
  todayIsoDate_ = savedToday;
  if (bounds.month !== '2026-04') throw new Error('Expected 2026-04, got ' + bounds.month);
  if (bounds.monthEnd !== '2026-04-30') throw new Error('Expected 2026-04-30, got ' + bounds.monthEnd);

  // Truncation guard: forced over-limit text must be cut, not thrown or dropped.
  var longText = new Array(MONTHLY_SUMMARY_MAX_LENGTH_ + 500).join('a');
  var truncated = truncateSummary_(longText);
  if (truncated.length !== MONTHLY_SUMMARY_MAX_LENGTH_) throw new Error('Expected length ' + MONTHLY_SUMMARY_MAX_LENGTH_ + ', got ' + truncated.length);
  if (truncated.substring(truncated.length - 3) !== '...') throw new Error('Expected ellipsis suffix');
  var shortText = 'short summary';
  if (truncateSummary_(shortText) !== shortText) throw new Error('Short text should pass through unchanged');

  Logger.log('testMonthlySummaryLogic passed.');
}
