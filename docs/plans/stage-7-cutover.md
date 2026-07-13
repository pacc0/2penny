# Stage 7 Plan — Cutover + retiro del dashboard doGet v1.0

**Version:** v1 (RATIFIED 2026-07-13)
**Date:** 2026-07-13
**Governing inputs:** ROADMAP.md Etapa 7 (strangler-fig cutover), Task 0 read-only inventory (2026-07-13, evidence in HANDOFF.md `1e2578b`), ADR-0004 (legacy repo, re-evaluated here), ADR-0014 (`--branch=main`), ADR-0019 (R3 concession precedent), DESIGN.md §2 (Verbatim Token Rule), DATA_CONTRACT.md (contract 1.0 unchanged).

## Objective

The new shell (`2penny.pages.dev`) replaces the v1.0 Apps Script `doGet` dashboard as the only visual source of truth. Legacy display deployment @20 and stale deployments @11/@1/@6 are retired; display-exclusive dead code is removed from @HEAD; the frontend absorbs the ratified UI amendments (CATEGORY_SHORT tooltips, doughnut slide height, Top-3 category list, dignified empty state).

## Supreme invariant (violating this halts execution)

Telegram webhook **@12** (`AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W`) and json-api **@21** (`AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF`) are UNTOUCHABLE. `clasp deployments` is verified after EVERY clasp mutation, not just at task end. If either id ever differs from the Task 0 baseline: STOP immediately, report, touch nothing.

## Ratified rulings (chat 2026-07-13)

- **R1 — Empty-month Top-3 = dignified empty state.** When `expenses_by_category` is empty, the Top-3 list renders 3 rows: dash (—) as name, 0% and empty bar. The previous-month fallback is DEFERRED (R3-style concession, see Concession below) — it requires a contract amendment on @21 and is out of scope for this stage.
- **R2 — Demolition scope.** Delete `backend/src/DashboardPage.html` entirely (712 lines; keep-or-kill resolved: KILL — git history preserves the verbatim reference) plus the 5 display-exclusive `Dashboard.js` functions listed in the Demolition inventory. Nothing else in `Dashboard.js` is touched.
- **R3 — Stale deployment sweep.** Deployments @11, @1, @6 (no consumers, superseded milestones) are removed in Task 1, one at a time, with `clasp deployments` verification after each. Final state: @HEAD + @12 + @21 (3 entries).
- **R4 — CATEGORY_SHORT ratified.** The table proposed at Task 0 is ratified verbatim (see below).

## Concession (R3-style, registered)

**Empty-month previous-month fallback: deferred.** Target state: a future backend-only stage amends the json-api contract on @21 **once**, delivering BOTH the daily cumulative net-flow feed (ADR-0019 R3 debt, ROADMAP "Backlog técnico") AND the previous-month category breakdown for the Top-3 fallback. One contract amendment, one @21 redeploy, webhook @12 untouched. The dignified empty state is the accepted interim, not the spec.

## Demolition inventory (from Task 0, verified read-only 2026-07-13)

| Target | Location | Notes |
|---|---|---|
| `DashboardPage.html` | `backend/src/DashboardPage.html` (712 lines) | Only reference: `Dashboard.js:35`. KILL per R2. |
| `doGet_legacy_v1` | `Dashboard.js` L33–44 | Display-exclusive. |
| `buildDashboardData_` | `Dashboard.js` L52–84 | Display-exclusive. |
| `aggregateCumulativeNetFlow_` | `Dashboard.js` L205–230 | Display-exclusive. |
| `buildPendingRows_` | `Dashboard.js` L232–247 | Display-exclusive. |
| `countPending_` | `Dashboard.js` L249–255 | Display-exclusive. |

**DO NOT TOUCH (mixed-file landmine):** `loadAllTransactions_`, `loadTransferPurposeSavingsMap_`, `loadSettingsMap_`, `aggregateMonth_`, `aggregateSavings_`, `aggregateExpensesByCategory_`, `aggregateExpensesByAccount_`, `COL_*` constants (L10–23) — consumed by `Api.js` (@21, production) and `MonthlySummary.js` (Telegram).

| Deployment | Id (suffix) | Fate |
|---|---|---|
| @20 "UI-3 Night Ledger restyle" | `...HtY1ivOy_Sq` | Retire (Task 1, first). |
| @11 (unlabeled) | `...n8z5sjrfEvQ4` | Sweep (Task 1). |
| @1 "Phase 2 initial deployment" | `...JnisnwjsVGk` | Sweep (Task 1). |
| @6 "Phase 3 - HtmlService webhook response fix" | `...KOAabz9kGEU` | Sweep (Task 1). |

## CATEGORY_SHORT (ratified R4, verbatim from Task 0 proposal)

| Categoría | SHORT |
|---|---|
| Obligación Mamá | Mamá |
| Obligación Papá | Papá |
| Vivienda / Arriendo | Vivienda |
| Servicios | Servicios |
| Suscripciones | Suscripciones |
| Alimentación | Alimentación |
| Restaurantes / Domicilios | Restaurantes |
| Transporte | Transporte |
| Compras Personales | Compras |
| Salud / Bienestar | Salud |
| Mascotas | Mascotas |
| Viajes | Viajes |
| Ocio / Entretenimiento | Ocio |
| Imprevistos / Emergencias | Imprevistos |

Criterio: palabra dominante en compuestos; nombres de una sola palabra quedan intactos.

## Task G — Governance commit (no production mutation)

- This plan file; move `stage7-task0-double-heading-desktop.png` → `docs/evidence/stage-7/`.
- **Evidence:** git hash + CI status.

## Task 1 — Deployment demolition (clasp mutation zone)

- Baseline `clasp deployments` (must match Task 0: 7 deployments).
- Retire @20; verify @12/@21; curl old @20 /exec URL (capture verbatim proof it no longer serves).
- Telegram smoke test #1 (bot response + row via authenticated /api/dashboard).
- Sweep @11 → @1 → @6, one at a time, `clasp deployments` after EACH.
- Telegram smoke test #2. Final: 3 entries.
- **Evidence:** every `clasp deployments` output verbatim, curl output, bot responses.
- **Rollback:** a removed versioned deployment can be re-created from its version number (`clasp deploy -V n`) — but this mints a NEW url; the strangler-fig safety net for @20 ends deliberately here.

## Task 2 — Dead code removal (@HEAD only)

- Delete `DashboardPage.html`; remove the 5 functions per inventory; `clasp push` (@HEAD only).
- Verify @12/@21 intact; authenticated curl /api/dashboard → contract 1.0 unchanged.
- Telegram smoke test #3. Commit + push, CI green.
- **Evidence:** git diff stat, `clasp deployments`, curl JSON keys, bot response.
- **Rollback:** git revert + `clasp push`.

## Task 3 — Frontend amendments (no backend contact)

- `CATEGORY_SHORT` typed const in `frontend/src/lib/charts/palette.ts` (ratified table verbatim).
- Doughnut tooltip: line 1 = emoji + CATEGORY_SHORT; line 2 = amount + percentage (1 decimal). D7 teardown mechanics untouched — content template only. (Conscious supersession of D2 verbatim tooltip content — recorded in closure ADR.)
- Doughnut slide wrap 280px → 320px; measure dead space (target ≤ a few px, R4-Stage-6 precedent).
- Top-3 component replaces the ledger list rows in `+page.svelte` (~L200–202 + skeleton twin): 3 highest-spend categories, each row = CATEGORY_SHORT + % of total month expenses + progress bar (fill `CATEGORY_COLOR[category]`, track `var(--hairline)`). Existing tokens ONLY. Both headings remain. % computed client-side.
- Empty state per R1. Layout side-by-side 3 columns; if rows don't breathe at 395px, STOP — stacked fallback needs a ruling.
- **Evidence:** `npm run check` clean; screenshots desktop + real data; deploy preview; authenticated A56 check (tooltip tap, top-3, doughnut slide measured); doughnut empty-canvas observation resolved (artifact vs defect).
- **Rollback:** revert commits.

## Task 4 — Closure

- Closure ADR in DECISIONS.md: supersedes ADR-0004 (legacy repo archived); D2 tooltip supersession; empty-month concession + target; sweep record with final deployment list.
- ROADMAP.md: Stage 7 done, Stage 8 next; backlog @21 entry covers BOTH daily feed AND previous-month categories.
- Production deploy `--branch=main`; both URLs 302 to Access; authenticated A56 final check.
- Camilo manually archives `pacc0/penny` (Code never gets destructive GitHub permissions); verify via `gh repo view pacc0/penny --json isArchived`.
- Final `clasp deployments` (3 entries, @12/@21 identical to baseline) + Telegram smoke test #4 + handoff commit.

## Global stop condition

If ANY assumption fails (unexpected deployment count, auth failure, missing function signature, check errors), STOP at that point and report findings verbatim. Never improvise around a failed assumption.
