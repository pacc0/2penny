/**
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

// Chart formatters ported logic-verbatim from the legacy reference
// (backend/src/DashboardPage.html) — absent from the Stage 5 shell,
// verified 2026-07-12 (Stage 6 Task 0b).

/**
 * @param {number} n
 * @returns {string}
 */
export function formatCOP(n) {
  return (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

// Auto-scaling axis formatter (K/M/B via Intl compact notation): real amounts
// range from tens of thousands to single-digit millions; Intl picks the right
// unit per tick automatically.
const compactCOPFormatter = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });

/**
 * @param {number} n
 * @returns {string}
 */
export function formatCompactCOP(n) {
  return (n < 0 ? '-' : '') + '$' + compactCOPFormatter.format(Math.abs(n));
}

const MONTHS_ES_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Abbreviated es-CO month from an ISO month key (e.g. "2026-07" -> "Jul") —
 * x-axis of the net-flow line. The legacy axis was daily (formatDayMonth over
 * YYYY-MM-DD); the 2penny contract's net_flow_series is monthly (YYYY-MM),
 * so only the month abbreviation applies — same trimming doctrine, no year.
 * @param {string} isoMonth
 * @returns {string}
 */
export function formatMonthAbbr(isoMonth) {
  return MONTHS_ES_ABBR[+isoMonth.substring(5, 7) - 1];
}

/**
 * Trimmed day + month, no year (e.g. "23 Jul") — trend-line axis and pending
 * list, to avoid crowding. Input is ISO 8601 (YYYY-MM-DD).
 * @param {string} iso
 * @returns {string}
 */
export function formatDayMonth(iso) {
  const parts = iso.split('-');
  return +parts[2] + ' ' + MONTHS_ES_ABBR[+parts[1] - 1];
}
