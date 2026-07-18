/**
 * JSON endpoint contract v1.1 — docs/DATA_CONTRACT.md §3.
 * Single source of the shape for both the mock (Stage 3) and the real
 * proxy (Stage 4). Amendment 1.0 -> 1.1 (ADR-0023, Stage 9): additive only —
 * daily_net_flow + previous_month added, no existing key changed.
 *
 * @typedef {object} DashboardContract
 * @property {string} contract_version
 * @property {string} generated_at ISO-8601 with -05:00 offset.
 * @property {{ month: string, calendar_mode: string, currency: string }} period
 * @property {{
 *   income: number,
 *   expenses: number,
 *   net_flow: number,
 *   savings: { month: number, monthly_goal: number, annual_accumulated: number, annual_goal: number }
 * }} kpis
 * @property {Array<{ category: string, amount: number }>} expenses_by_category
 * @property {Array<{ account: string, amount: number }>} expenses_by_account
 * @property {Array<{ month: string, income: number, expenses: number, net_flow: number }>} net_flow_series 12 rolling months.
 * @property {Array<{ date: string, value: number }>} daily_net_flow Cumulative net flow by calendar day, 1st of current month through today (America/Bogota) inclusive.
 * @property {{ month: string, expenses_by_category: Array<{ category: string, amount: number }> }} previous_month Previous closed calendar month; expenses_by_category is [] (never null/absent) when empty.
 * @property {Array<{ id: string, date: string, amount: number, merchant: string, description: string, type: string }>} pending
 * @property {string | null} error
 */
export {};
