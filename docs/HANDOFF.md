# 2penny — Engineering Handoff (2026-07-13 12:58)

## Branch & stage
- branch: master | roadmap stage: 7 Cutover + retiro del dashboard doGet v1.0 (🟡 SIGUIENTE, re-evaluar ADR-0004) — **Task 0 (read-only inventory) DONE this session**, evidence below; strategic session / plan file NOT started.

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook - Anyone)
- /exec URL unchanged since last stage: yes — `clasp deployments` run this session (read-only, 2026-07-13, output below): same 7 deployments, @12 and @21 byte-identical to Stage 6 closure baseline. Zero clasp write commands this session.
- Legacy v1.0 dashboard doGet deployment identified (Task 0): `AKfycbzVpXDarjXx2laafzUiuOFwDSlgPd_gnlQVGsaJ26vdthxMOWYdoN6V-HtY1ivOy_Sq @20` ("UI-3 Night Ledger restyle") — cross-confirmed by ROADMAP.md:55.

## In-flight tasks (with file paths)
- None in code. Stage 7 Task 0 inventory complete (zero mutations); findings reported in-session, NOT yet written into a plan file. Untracked evidence file at repo root: `stage7-task0-double-heading-desktop.png` (move to docs/evidence/stage-7/ when created).

## Next planned step
- Stage 7 strategic session → plan file, fed by Task 0 findings: (a) demolition list = `backend/src/DashboardPage.html` (712 lines, only ref Dashboard.js:35; also the in-repo legacy verbatim reference — keep-or-kill is a decision) + 5 Dashboard.js functions ONLY: `doGet_legacy_v1` (L33-44), `buildDashboardData_` (L52-84), `aggregateCumulativeNetFlow_` (L205-230), `buildPendingRows_` (L232-247), `countPending_` (L249-255); (b) top-3 empty-month fallback design gated by contract fact below; (c) double-heading fix (`frontend/src/routes/+page.svelte` L198 ledger list vs L230 chart card); (d) CATEGORY_SHORT proposal awaiting Camilo's ratification; (e) re-evaluate ADR-0004.

## Known landmines
- **Dashboard.js is a MIXED file — never demolish wholesale.** Its loaders/aggregators (`loadAllTransactions_`, `loadTransferPurposeSavingsMap_`, `loadSettingsMap_`, `aggregateMonth_`, `aggregateSavings_`, `aggregateExpensesByCategory_`, `aggregateExpensesByAccount_`, COL_* constants L10-23) are consumed by Api.js (@21 json-api, production) and MonthlySummary.js (Telegram). Only the 5 functions listed above are display-exclusive.
- **Contract fact (curl-verified, authenticated):** `/api/dashboard` payload has NO previous-month category breakdown — `expenses_by_category` is current-month only (Api.js:69); `net_flow_series` is 12 months but income/expenses/net_flow only. Top-3 empty-month fallback needs a contract amendment on json-api @21 (webhook @12 untouchable) if it wants prior-month categories.
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill. Note: trimming Dashboard.js + `clasp push` touches @HEAD only; pinned @20 keeps serving old code until its retirement is executed deliberately.
- Cloudflare Access auth from CLI/session: Playwright browser profile holds NO Access session; login = email OTP to camilofu94@gmail.com (code readable via Gmail MCP), then the browser session works for /api/dashboard JSON and screenshots. Unauthenticated curl → 302 (invariant: proxy not public).
- Pages production branch is `main`, git branch is `master`: every `wrangler pages deploy` MUST carry `--branch=main` (ADR-0014). Project `2penny`, output dir `frontend/.svelte-kit/cloudflare`.
- Observation (registered, NO ruling, do not fix without GO): doughnut canvas rendered empty in the full-page Playwright screenshot while line/bar painted — probable full-page-screenshot vs canvas-animation artifact, undiagnosed.
- Doughnut slide ~41px dead space at ≤480px — registered in ADR-0019, NO ruling.
- R3 (ADR-0019): line chart monthly semantics is a TEMPORARY concession — target = daily cumulative feed via contract amendment (json-api @21 only).
- `npm run check` not gated in frontend-ci.yml (backlog); 0 errors as of `0c4ea2f`.
- Legacy repo `pacc0/penny` NEVER touched (ADR-0004, re-evaluation pending at Stage 7 opening).
- Chrome junction for Playwright MCP: `%LOCALAPPDATA%\Google\Chrome\Application` → `%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64`; remove before installing real Chrome.
- Node pinned to 24 (dev + CI, ADR-0013).

## Evidence attached
```
$ git branch --show-current
master

$ git status --short
?? stage7-task0-double-heading-desktop.png   (only new file; tree otherwise clean)

$ git log --oneline -5
7ffd9d8 docs: engineering handoff - stage 6 closed, stage 7 next, no in-flight work (checkpoint-code)
6190c7d docs: close Stage 6 - ADR-0019, ROADMAP stage 6 CERRADA / stage 7 next (stage-closer)
0c4ea2f fix(charts): R4 - line chart fills its card (240->320px slide)
02a92f0 feat(charts): task 3 - Gastos por Categoria doughnut (CategoryChart.svelte)
4447fe9 feat(charts): task 2 - Gastos por Metodo de Pago horizontal bar + chart carousel dots

$ clasp deployments   (run from backend/, read-only, Stage 7 Task 0, 2026-07-13)
Found 7 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbzdNzeJA4szrgDEbfNYzDuXV8oyJS1F8J-u4B33ckaQDeNc7WJh03kZn8z5sjrfEvQ4 @11
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)
- AKfycby1gkwO5fSnRFMAfZ15Or7Mi_dh9ITYl2zuuspzi21Kr-VWqEGzhlyurJnisnwjsVGk @1 - Phase 2 initial deployment
- AKfycbz23K-9eRvUrtQidkEWb2dH95yRvZ9haLFP4luLXAfu4OcFdyKTg-z7-KOAabz9kGEU @6 - Phase 3 - HtmlService webhook response fix
- AKfycbzVpXDarjXx2laafzUiuOFwDSlgPd_gnlQVGsaJ26vdthxMOWYdoN6V-HtY1ivOy_Sq @20 - UI-3 Night Ledger restyle

Stage 7 Task 0 evidence: curl -sI https://2penny.pages.dev/api/dashboard
(unauth) → 302 to cloudflareaccess.com (proxy not public). Authenticated
(Access email OTP) GET /api/dashboard → contract 1.0 JSON, period 2026-07,
expenses_by_category = 6 current-month rows, net_flow_series = 12 months,
pending = 1 row, error: null. Screenshot of double-heading state:
stage7-task0-double-heading-desktop.png (repo root, untracked).
CATEGORY_SHORT proposal source: frontend/src/lib/charts/palette.ts
(14 expense categories) — proposal in session transcript, unratified.
```
