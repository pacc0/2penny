# 2penny — Stage 2 Execution Plan: Headless JSON Endpoint (Apps Script)

> **For Claude Code.** Gate 1 passed in the strategic chat session (2026-07-09):
> data contract v1.0 ratified, two-layer auth amendment ratified, doGet rename
> strategy ratified. Execute task by task. Evidence over narrative — show every
> verification block's real output. If any verification fails, STOP.

## Context & hard invariants

- Working repo: `C:\Users\Camilo\Documents\VS Projects\2penny` (remote `pacc0/2penny`).
- The Apps Script project is LIVE IN PRODUCTION. It currently has (at minimum)
  two versioned deployments: the **Telegram webhook** (doPost) and the
  **v1.0 dashboard** (doGet HTML).
- **INVARIANT 1 — webhook:** the webhook deployment is NEVER touched. Its
  deploymentId and /exec URL must be byte-identical before and after this stage.
- **INVARIANT 2 — v1.0 dashboard:** its deployment stays PINNED to its current
  version forever (until Stage 7). It is NEVER bumped to a new version — the
  new code renames its doGet, so bumping it would break it.
- **INVARIANT 3 — this stage creates ONE new versioned deployment** (the JSON
  API). Creating a new deployment is correct here because it is a NEW endpoint
  — this is the documented exception to the clasp-deploy "never create new"
  rule, which protects EXISTING endpoints.
- The live script (via `clasp clone`/`clasp pull`) is the source of truth for
  code migration — NOT the legacy repo files, which may have drifted.
- Secrets: the API secret lives in Script Properties, set manually by Camilo
  via the Apps Script editor (project convention). NEVER hardcoded, never
  committed, never printed in evidence output.
- Language: code and commits in English; DATA_CONTRACT §3 update in Spanish.

---

## TASK 0 — Preconditions

```
git remote -v          # must show pacc0/2penny (NOT pacc0/penny)
git status --short     # clean tree expected
clasp --version        # 3.3.0+
clasp login --status   # logged in as camilofu94@gmail.com
```
Also ask Camilo for the scriptId if not already known (visible in the legacy
repo's .clasp.json or the Apps Script editor URL). STOP until provided.

---

## TASK 1 — `docs/DATA_CONTRACT.md` §3: write the ratified contract

Replace the §3 placeholder with the ratified contract (Spanish narrative,
JSON shape verbatim as ratified):

- **Versión de contrato: 1.0.** Cambios breaking → ADR + bump de versión.
- The full JSON envelope as ratified in chat (contract_version, generated_at
  ISO-8601 with -05:00 offset, period{month, calendar_mode, currency},
  kpis{income, expenses, net_flow, savings{month, monthly_goal,
  annual_accumulated, annual_goal}}, expenses_by_category[],
  expenses_by_account[], net_flow_series[] (12 rolling months),
  pending[]{id, date, amount, merchant, description, type}, error).
- **Reglas de construcción (trazadas a §2):** solo Confirmed alimenta kpis y
  series (regla 3); savings vía TransferPurposes.counts_as_savings (regla 1),
  separado de net_flow (regla 2); montos siempre positivos, el signo lo pone
  el frontend (regla 5); expenses_by_account = account_from de los Expenses
  (no existe otra columna de método de pago); serie de 12 meses móviles
  calculada server-side; ventana fija 12 (constante, no Setting — principio 5).
- **AUTH — enmienda ratificada (dos capas):** Apps Script no puede emitir
  códigos HTTP custom (ContentService siempre responde 200). Capa 1: doGet
  valida `e.parameter.key` contra Script Properties; sin match →
  `{"error":"unauthorized"}` (HTTP 200). Capa 2 (Etapa 4): la Pages Function
  traduce `error != null` al status HTTP real (401/500) hacia el navegador.
  El secreto viaja por query param — limitación dura de Apps Script (doGet no
  lee headers); mitigado porque solo la Pages Function server-side conoce y
  llama esa URL.

Commit: `docs(contract): ratified JSON endpoint contract v1.0 (two-layer auth amendment)`

Verification: `git show --stat HEAD` + print the §3 JSON block.

---

## TASK 2 — Migrate live code into `/backend` via clasp

Steps:
1. In a TEMP directory outside the repo: `clasp clone <scriptId>` — pulls the
   LIVE code. Do not clone inside /backend directly (clone creates its own
   .clasp.json layout).
2. Copy the pulled files into `backend/src/` (including `appsscript.json`).
3. Create `backend/.clasp.json`: `{ "scriptId": "<scriptId>", "rootDir": "src" }`
   (committed — private repo, scriptId alone grants no access).
4. Create `backend/.claspignore` (ignore non-src files if needed).
5. Inventory: list every migrated file and locate the legacy `doGet` (the HTML
   dashboard entry point) and `doPost` (webhook). Report file names and line
   numbers.

Commit: `feat(backend): migrate live Apps Script code (clasp clone snapshot)`

Verification:
```
git ls-files backend
```
Plus: the inventory table (file → contains doGet/doPost/triggers → lines).
STOP if no doGet or no doPost is found (wrong script cloned).

---

## TASK 3 — Rename legacy doGet + write `Api.js`

### 3.1 Rename (INVARIANT 2 mechanics)
In the migrated file containing the HTML-dashboard `doGet`, rename it to
`doGet_legacy_v1` and add this comment above it:
```javascript
// RENAMED in Stage 2: the v1.0 dashboard deployment is PINNED to the pre-Stage-2
// version and still serves this function there. Never bump that deployment.
// Retirement: Stage 7. See docs/DECISIONS.md ADR-0011.
```
Touch NOTHING else in legacy files — no refactors, no cleanup (out of scope).

### 3.2 `backend/src/Api.js`
```javascript
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
```
`buildDashboardPayload_()` (same file): reads the sheets per DATA_CONTRACT §1
and assembles the §3 envelope applying the construction rules verbatim:
- Filter `status === 'Confirmed'` for all kpis and series (rule 3).
- `kpis.income/expenses` = current month sums by transaction_type; `net_flow`
  = income − expenses (rule 2).
- `savings.month` = sum of Confirmed Transfers whose transfer_purpose maps to
  `counts_as_savings = Yes` in TransferPurposes, current month (rule 1);
  `monthly_goal` from Settings; `annual_accumulated` = same rule, year to
  date; `annual_goal` = monthly_goal × 12 unless a Settings row overrides.
- `expenses_by_category` / `expenses_by_account` (account_from), current
  month, Confirmed Expenses only, amounts positive (rule 5), sorted desc.
- `net_flow_series`: last 12 calendar months including current, one row per
  month even if zeros.
- `pending`: transactions with status Pending, minimal fields per contract.
- `period.month` = current month (America/Bogota); `calendar_mode` and
  `currency` from Settings; `generated_at` = now, ISO-8601 with offset.
- Read Settings keys tolerantly (untyped sheet): trim, case-insensitive keys.

Commit: `feat(backend): headless JSON doGet (contract v1.0) + legacy doGet renamed`

Verification: `git show --stat HEAD` + full diff of the rename hunk.

---

## TASK 4 — Manual step for Camilo (STOP and hand over)

Print these instructions and WAIT — do not proceed until Camilo confirms:
1. Generate a long random secret (≥32 chars), e.g. in the shell:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Apps Script editor → Project Settings → Script Properties → add
   `API_SECRET` = <that value>. Keep the value in your password manager;
   Stage 4 needs it for the Pages Function env var.
3. Reply "done" (never paste the secret into this chat/session).

---

## TASK 5 — Deploy (new pinned deployment) + evidence battery

Follow clasp-deploy discipline, with the documented Stage-2 exception
(new endpoint → new deployment):

1. `clasp deployments` → capture BEFORE output verbatim (all ids).
2. `clasp push` (updates @HEAD only).
3. Create a new versioned deployment for the API: `clasp deploy
   --description "json-api v1 (contract 1.0)"` — or via editor if clasp
   version requires. Settings: Execute as **Me**, access **Anyone**.
4. `clasp deployments` → capture AFTER output. Diff vs BEFORE:
   - webhook deploymentId: IDENTICAL (INVARIANT 1)
   - v1.0 dashboard deploymentId AND its pinned version: IDENTICAL (INVARIANT 2)
   - exactly ONE new deployment added (INVARIANT 3)
5. Record the new deployment's /exec URL in a LOCAL note for Camilo (NOT in
   the repo — the URL is half of the auth surface; Stage 4 stores it as a
   Pages env var alongside the secret).

### Evidence battery (all four required, output verbatim, secret masked):
```
curl -L "<exec-url>?key=<SECRET>"      # expect: 200, JSON matching contract v1.0
curl -L "<exec-url>"                   # expect: 200 body {"contract_version":"1.0","error":"unauthorized"}
curl -L "<exec-url>?key=wrong"         # expect: same unauthorized body
```
(`-L` is mandatory: Apps Script serves through a 302 to googleusercontent.)
Mask the real key as `<SECRET>` when pasting evidence.
4th evidence: Camilo sends a test Telegram message → confirm it lands in the
Transactions sheet (webhook alive). 5th: open the v1.0 dashboard URL in the
browser → still serves the HTML dashboard (pinned version intact).

Validate the JSON body against the contract: every §3 key present, correct
types, `net_flow_series` length 12, no negative amounts, `error: null`.

---

## TASK 6 — ADRs + wrap

Append to `docs/DECISIONS.md`:
- **ADR-0010 — Auth de dos capas del endpoint JSON.** Apps Script no emite
  códigos HTTP custom; capa 1 = error en body (200), capa 2 = Pages Function
  traduce a 401/500 (Etapa 4). Secreto por query param (doGet no lee headers),
  mitigado por uso exclusivo server-side. Enmienda a restricción ratificada,
  aprobada por Camilo 2026-07-09.
- **ADR-0011 — Estrategia doGet: rename + pinning.** Un proyecto Apps Script
  admite un solo doGet global. El legacy se renombra a `doGet_legacy_v1`; el
  deployment v1.0 queda pinneado a la versión previa (snapshot inmutable) y
  JAMÁS se bumpea; se retira en Etapa 7. Excepción documentada de clasp-deploy:
  endpoint NUEVO = deployment nuevo (la regla "nunca crear" protege endpoints
  existentes).

Commit: `docs(decisions): ADR-0010 two-layer auth, ADR-0011 doGet rename + pinning`
Push: `git push`.

Final report: git log --oneline of stage commits; the BEFORE/AFTER
`clasp deployments` diff; the four curl/Telegram/dashboard evidences.
Then remind: Stage 2 closes via the stage-closer skill with Camilo's sign-off
— this time webhook integrity verification is REAL, not not-applicable.

## OUT of scope
- Pages Function proxy and env vars (Stage 4). Frontend (Stage 3).
- Any refactor of legacy code, GeminiGate, Canary (Stage 8).
- No changes to Cloudflare. No second Access policy (ADR-0002, deadline Stage 4).
