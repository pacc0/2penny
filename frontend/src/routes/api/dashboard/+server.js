/** Mock proxy — Stage 3. Stage 4 replaces the mock with the real
 *  Apps Script fetch + secret from platform env. Contract v1.0. */

/** @type {import('$lib/contract.js').DashboardContract} */
const MOCK_DASHBOARD = {
  contract_version: '1.0',
  generated_at: '2026-07-09T12:00:00-05:00',
  period: { month: '2026-07', calendar_mode: 'Standard', currency: 'COP' },
  kpis: {
    income: 4200000,
    expenses: 2650000,
    net_flow: 1550000,
    savings: {
      month: 800000,
      monthly_goal: 1000000,
      annual_accumulated: 4200000,
      annual_goal: 12000000
    }
  },
  expenses_by_category: [
    { category: 'Vivienda / Arriendo', amount: 1200000 },
    { category: 'Alimentación', amount: 650000 },
    { category: 'Transporte', amount: 480000 },
    { category: 'Ocio / Entretenimiento', amount: 320000 }
  ],
  expenses_by_account: [
    { account: 'Lulo Bank', amount: 1900000 },
    { account: 'Efectivo', amount: 750000 }
  ],
  net_flow_series: [
    { month: '2025-08', income: 3800000, expenses: 2900000, net_flow: 900000 },
    { month: '2025-09', income: 3900000, expenses: 3100000, net_flow: 800000 },
    { month: '2025-10', income: 4000000, expenses: 2700000, net_flow: 1300000 },
    { month: '2025-11', income: 3700000, expenses: 3300000, net_flow: 400000 },
    { month: '2025-12', income: 4500000, expenses: 4100000, net_flow: 400000 },
    { month: '2026-01', income: 3900000, expenses: 2600000, net_flow: 1300000 },
    { month: '2026-02', income: 4000000, expenses: 2800000, net_flow: 1200000 },
    { month: '2026-03', income: 3850000, expenses: 3000000, net_flow: 850000 },
    { month: '2026-04', income: 4100000, expenses: 2900000, net_flow: 1200000 },
    { month: '2026-05', income: 3950000, expenses: 3200000, net_flow: 750000 },
    { month: '2026-06', income: 4050000, expenses: 2750000, net_flow: 1300000 },
    { month: '2026-07', income: 4200000, expenses: 2650000, net_flow: 1550000 }
  ],
  pending: [
    {
      id: 'mock-pending-1',
      date: '2026-07-08',
      amount: 85000,
      merchant: 'Rappi',
      description: 'Domicilio',
      type: 'Expense'
    },
    {
      id: 'mock-pending-2',
      date: '2026-07-09',
      amount: 1500000,
      merchant: 'Nómina',
      description: 'Pago quincenal',
      type: 'Income'
    }
  ],
  error: null
};

export async function GET() {
  return Response.json(MOCK_DASHBOARD);
}
