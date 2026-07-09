# DATA_CONTRACT.md

## §1 Fuente de verdad

Google Sheets, editable a mano. Hereda de `docs/DATA_MODEL.md` v1.3 del repo
legacy — entidad central `Transactions`, entidades de soporte controlan
valores válidos.

**Hojas y columnas (resumen fiel de DATA_MODEL.md v1.3):**

- **Transactions** (entidad central): `id` (UUID), `transaction_date`
  (YYYY-MM-DD), `transaction_type` (Income/Expense/Transfer), `category`,
  `account_from`, `account_to`, `transfer_purpose`, `amount` (siempre
  positivo), `description`, `merchant`, `merchant_raw`, `source`
  (Gmail/Telegram), `status` (Pending/Confirmed), `created_at`.
- **Categories:** `name`, `type` (Income/Expense), `active`. 4 categorías de
  ingreso, 14 de gasto (ver docs/DESIGN.md §2 para la paleta de color).
- **Accounts:** `name`, `active`. Balances NO se trackean.
- **TransferPurposes:** `purpose`, `counts_as_savings`, `active`,
  `display_order`.
- **MerchantDictionary:** `merchant_raw`, `merchant`, `category_hint`,
  `active`. Empieza vacía, solo se llena con transacciones reales.
- **Rules:** `pattern`, `category`, `active`. Match case-insensitive
  substring sobre `merchant_raw`; primera regla activa en orden de fila
  gana. Empieza vacía.
- **Settings:** untyped, single-user (Currency=COP, Monthly Savings
  Goal, Default Month, Calendar Mode, Percentage Precision, Show Pending
  Transactions).

## §2 Reglas de reporting

(Copiadas de DATA_MODEL.md v1.3 §Reporting Rules — regla, no prosa.)

1. **Savings** ≠ Income − Expenses. Savings = suma de transacciones
   Transfer Confirmadas donde `TransferPurpose.counts_as_savings = Yes`.
2. **Net Flow** = Income − Expenses (solo transacciones Confirmed).
3. Solo transacciones **Confirmed** afectan métricas financieras;
   **Pending** solo aparece en la sección de revisión.
4. Dashboard siempre muestra: Income (mes actual), Expenses (mes actual),
   Net Flow, Savings progress, Monthly/Annual savings goal progress,
   Expenses by category, Expenses by payment method, Pending transactions.
5. `amount` siempre se almacena positivo; el signo lo determina el reporte,
   no el dato.
6. Transfer requiere `account_from` + `account_to` + `transfer_purpose`, no
   puede tener `category`. Income/Expense requieren `category`, no pueden
   tener `transfer_purpose`.

## §3 Contrato del endpoint JSON (Etapa 2 — PENDIENTE)

Shape TBD en la Etapa 2; el contrato se definirá aquí ANTES de escribir
`Api.js`. Cambios breaking requieren un ADR.

Restricciones de envelope ya ratificadas:
- Live read en cada refresh (sin snapshots cacheados).
- Secret requerido — 401 sin él.
- Un solo payload de dashboard (no paginado, no multi-endpoint).

## §4 Lección Gemini (junio 2026)

Contratos de datos explícitos + monitoreo existen porque una deprecación
silenciosa de `gemini-2.0-flash` degradó la clasificación por semanas antes
de detectarse. Cambios de modelo pasan exclusivamente por `GeminiGate.js`
(Etapa 8) — un solo archivo, nunca un cambio disperso.
