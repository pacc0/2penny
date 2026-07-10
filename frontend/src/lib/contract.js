/**
 * JSON endpoint contract v1.0 — docs/DATA_CONTRACT.md §3.
 * Single source of the shape for both the mock (Stage 3) and the real
 * proxy (Stage 4).
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
 * @property {Array<{ id: string, date: string, amount: number, merchant: string, description: string, type: string }>} pending
 * @property {string | null} error
 */
export {};
