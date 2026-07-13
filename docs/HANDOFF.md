# 2penny — Engineering Handoff (2026-07-13 14:05)

## Branch & stage
- branch: master | roadmap stage: 7 Cutover + retiro del dashboard doGet v1.0 (✅ CERRADA 2026-07-13) — **Stage 8 (Endurecimiento: clasp-guard.yml, GeminiGate, Canary) is 🟡 SIGUIENTE, re-evaluar ADR-0003. No in-flight work.**

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook — Anyone)
- /exec URL unchanged since Stage 6 baseline: yes — `clasp deployments` re-run at Stage 7 closure (2026-07-13): 3 deployments (`@HEAD` + `@12` + `@21` json-api `AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF`), both byte-identical to every prior stage's baseline. Down from 7 at Stage 7 open — the legacy dashboard (@20) and 3 stale deployments (@11/@1/@6) were swept THIS stage (see ADR-0020), the only deployment-count change in project history, and it was deliberate/planned/verified at every step, not drift.
- Four Telegram smoke tests this stage, all confirmed via authenticated Google Sheet reads (not narrative): rows `706df91b…`, `03480531…`, `23382aa0…`, `a6065914…` (closure test, "bombombun" $4.000, 2026-07-13 14:02:02).

## In-flight tasks (with file paths)
- None. Stage 7 fully closed: plan (`docs/plans/stage-7-cutover.md`), governance commit, deployment sweep, dead-code removal, frontend amendments, and closure ADR all landed and pushed.

## Next planned step
- Open Stage 8 (Endurecimiento) with a strategic session: `.github/workflows/clasp-guard.yml` (verify webhook deploymentId post-push), `GeminiGate.js` (model-change single-file gate), `Canary.js` (trivial call + Telegram alert). Re-evaluate ADR-0003 (dedicated clasp account) — only relevant once `CLASPRC_JSON` enters GitHub Secrets, which Stage 8 may trigger.
- Backlog item ready to pick up whenever: the bundled `@21` contract amendment (daily cumulative net-flow feed + previous-month category breakdown, ROADMAP "Backlog técnico") — touches json-api deployment @21 only, webhook @12 untouchable, needs its own plan.

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill.
- **Stage 7 changed the deployment count for the first time ever (7→3).** Any FUTURE `clasp deployments` baseline comparison must use 3 entries (`@HEAD`+`@12`+`@21`), not the historical 7 — update any tooling/memory that hardcoded "7 deployments" as the invariant.
- `Dashboard.js` is now PURELY shared loaders/aggregators (`loadAllTransactions_`, `loadTransferPurposeSavingsMap_`, `loadSettingsMap_`, `aggregateMonth_`, `aggregateSavings_`, `aggregateExpensesByCategory_`, `aggregateExpensesByAccount_`, `COL_*` constants) consumed by `Api.js` (@21) and `MonthlySummary.js` (Telegram) — the v1.0-only functions and `DashboardPage.html` are gone (git history preserves them if ever needed).
- Cloudflare Access auth from CLI/session: Playwright browser profile holds NO Access session; login = email OTP to camilofu94@gmail.com (code readable via Gmail MCP), then the browser session works for /api/dashboard JSON and screenshots. Unauthenticated curl → 302 (invariant: proxy not public).
- Pages production branch is `main`, git branch is `master`: every `wrangler pages deploy` MUST carry `--branch=main` (ADR-0014). Project `2penny`, output dir `frontend/.svelte-kit/cloudflare`.
- **Pages preview environments have no secrets** (discovered this stage): `wrangler pages deploy --branch=<anything but main>` gets a hash URL with NO `API_SECRET`/`APPS_SCRIPT_EXEC_URL` bound → `/api/dashboard` 500s "internal". Real-data evidence this stage was gathered via direct Production deploys (`--branch=main`), Etapa 6 precedent. If preview-based evidence is ever needed again, secrets must be seeded per-environment first (`wrangler pages secret put --env=preview`).
- `npm run check` not gated in frontend-ci.yml (backlog, unchanged since Stage 5); 0 errors as of `a0d89f3`.
- **`pacc0/penny` (legacy repo) is now ARCHIVED** (read-only), confirmed 2026-07-13T19:00:14Z via `gh repo view pacc0/penny --json isArchived`. ADR-0004 (keep it active) is superseded by ADR-0020. The `git remote -v` session-start check in CLAUDE.md still applies (verifies THIS repo is `pacc0/2penny`, unaffected by the legacy repo's archival).
- Chrome junction for Playwright MCP: `%LOCALAPPDATA%\Google\Chrome\Application` → `%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64`; remove before installing real Chrome.
- Node pinned to 24 (dev + CI, ADR-0013).

## Evidence attached
```
$ git branch --show-current
master

$ git status --short
(clean)

$ git log --oneline -5
6392bb9 docs: stage 7 closure - record pacc0/penny archival + smoke test #4
e364303 docs: close stage 7 - ADR-0020, ROADMAP stage 7 CERRADA / stage 8 next
a0d89f3 fix(frontend): stage 7 - compress Mes column so A56 table needs no h-scroll
d3279cc feat(frontend): stage 7 task 3 - CATEGORY_SHORT, top-3 categories, doughnut amendments
f9aff63 feat(backend): stage 7 task 2 - remove v1.0 doGet dashboard dead code

$ clasp deployments   (run from backend/, read-only, Stage 7 closure, 2026-07-13)
Found 3 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)

$ gh repo view pacc0/penny --json isArchived,archivedAt,name
{"archivedAt":"2026-07-13T19:00:14Z","isArchived":true,"name":"penny"}

$ curl -sI https://2penny.pages.dev/ | head -1
HTTP/1.1 302 Found
$ curl -sI https://845924c7.2penny.pages.dev/ | head -1
HTTP/1.1 302 Found

Stage 7 full evidence: docs/DECISIONS.md ADR-0020, docs/plans/stage-7-cutover.md,
docs/evidence/stage-7/ (7 screenshots incl. A56 real-device checks).
```
