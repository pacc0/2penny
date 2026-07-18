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

## §3 Contrato del endpoint JSON (Etapa 2 — RATIFICADO; Etapa 9 — amendment 1.1)

**Versión de contrato: 1.1.** Cambios breaking → ADR + bump de versión.
Amendment 1.0 → 1.1 (ADR-0023, Etapa 9): estrictamente aditivo — agrega
`daily_net_flow` y `previous_month`; ninguna key existente cambia de
nombre, forma o semántica.

### Envelope JSON (forma verbatim, tal como ratificada)

```json
{
  "contract_version": "1.1",
  "generated_at": "2026-07-09T14:32:00-05:00",
  "period": {
    "month": "2026-07",
    "calendar_mode": "...",
    "currency": "COP"
  },
  "kpis": {
    "income": 0,
    "expenses": 0,
    "net_flow": 0,
    "savings": {
      "month": 0,
      "monthly_goal": 0,
      "annual_accumulated": 0,
      "annual_goal": 0
    }
  },
  "expenses_by_category": [
    { "category": "...", "amount": 0 }
  ],
  "expenses_by_account": [
    { "account": "...", "amount": 0 }
  ],
  "net_flow_series": [
    { "month": "2026-01", "income": 0, "expenses": 0, "net_flow": 0 }
  ],
  "daily_net_flow": [
    { "date": "2026-07-01", "value": 0 }
  ],
  "previous_month": {
    "month": "2026-06",
    "expenses_by_category": [
      { "category": "...", "amount": 0 }
    ]
  },
  "pending": [
    {
      "id": "...",
      "date": "2026-07-09",
      "amount": 0,
      "merchant": "...",
      "description": "...",
      "type": "Income|Expense|Transfer"
    }
  ],
  "error": null
}
```

`generated_at` es ISO-8601 con offset `-05:00` (America/Bogota). `net_flow_series`
trae exactamente 12 filas (mes actual + 11 anteriores), una por mes, incluso en
cero. `daily_net_flow` trae una fila por día calendario desde el 1° del mes
actual hasta hoy inclusive (días sin actividad quedan planos, valor
acumulado); la fecha de la última fila siempre es la fecha calendario actual
en America/Bogota — el frontend deriva "hoy" de ahí, nunca del reloj del
navegador. `previous_month.expenses_by_category` es `[]` (nunca `null`, nunca
ausente) cuando el mes anterior no tuvo gastos Confirmed. `error` es `null` en
el caso feliz; en error, el resto del envelope se omite (ver amendment de auth
abajo).

### Reglas de construcción (trazadas a §2)

- Solo transacciones **Confirmed** alimentan `kpis` y las series (regla 3).
- `savings` viaja separado de `net_flow` (regla 2); se calcula vía
  `TransferPurposes.counts_as_savings = Yes` sobre Transfers Confirmadas
  (regla 1).
- Montos siempre positivos; el signo lo pone el frontend, no el dato (regla 5).
- `expenses_by_account` = `account_from` de los Expenses — no existe otra
  columna de método de pago en el modelo.
- La serie de 12 meses (`net_flow_series`) se calcula server-side; la ventana
  es una constante fija de 12, no un `Setting` (principio 5 — no
  configurabilidad especulativa).
- `daily_net_flow` reusa la misma regla de Confirmed-only y `amount` con signo
  por reporte (reglas 2, 3, 5); ventana fija (1° del mes actual → hoy), no un
  `Setting`.
- `previous_month` reusa `aggregateExpensesByCategory_` tal cual sobre la
  ventana del mes calendario anterior — mismo agregador, mismas reglas, otra
  ventana de fechas.

### AUTH — enmienda ratificada (dos capas)

Apps Script no puede emitir códigos HTTP custom (`ContentService` siempre
responde 200). El contrato de auth se resuelve en dos capas:

- **Capa 1 (`doGet`, este endpoint):** valida `e.parameter.key` contra el
  Script Property `API_SECRET`. Sin match → responde
  `{"contract_version":"1.1","error":"unauthorized"}` con HTTP 200 (limitación
  dura de Apps Script).
- **Capa 2 (Etapa 4, server route de SvelteKit `+server.js`):** traduce
  `error != null` del body al status HTTP real (401/500) antes de que llegue
  al navegador.

El secreto viaja por query param porque `doGet` no puede leer headers; esto se
mitiga porque solo el server route, server-side, conoce y llama esa URL —
nunca se expone al cliente del navegador.

**Enmienda aditiva (Etapa 4, sin bump de versión — sigue `"1.0"`):** la capa 2
introduce un tercer valor de `error`, generado por el proxy mismo (nunca por
Apps Script): `"upstream"` → HTTP 502. Significa Apps Script inalcanzable,
timeout (>25s) o respuesta no-JSON. Mapa completo de la capa 2:
`"unauthorized"` → 401, `"internal"` (u otro `error != null` del backend) →
500, `"upstream"` → 502, `error: null` → 200. Toda respuesta del proxy lleva
`Cache-Control: no-store` (regla de live read de esta sección).

### Restricciones de envelope (ya ratificadas, vigentes)

- Live read en cada refresh (sin snapshots cacheados).
- Secret requerido — sin match, `error: "unauthorized"` (ver amendment arriba).
- Un solo payload de dashboard (no paginado, no multi-endpoint).

## §4 Lección Gemini (junio 2026)

Contratos de datos explícitos + monitoreo existen porque una deprecación
silenciosa de `gemini-2.0-flash` degradó la clasificación por semanas antes
de detectarse. Cambios de modelo pasan exclusivamente por `GeminiGate.js`
(Etapa 8) — un solo archivo, nunca un cambio disperso.
