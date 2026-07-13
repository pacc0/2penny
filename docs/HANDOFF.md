# 2penny — Engineering Handoff (2026-07-13 02:55)

## Branch & stage
- branch: master | roadmap stage: 6 Charts (Chart.js) (✅ CERRADA 2026-07-13, ADR-0019) → stage 7 Cutover + retiro doGet v1.0 (🟡 SIGUIENTE, re-evaluar ADR-0004)

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook - Anyone)
- /exec URL unchanged since last stage: yes — `clasp deployments` run at Stage 6 closure (read-only, 2026-07-13, output below) shows the same 7 deployments, ids/versions identical to the Stage 4/5 baseline (@HEAD, @12 webhook, @11, @21 json-api, @1, @6, @20). Zero clasp write commands executed during Stage 6.

## In-flight tasks (with file paths)
- None. Stage 6 fully executed and closed: 10 commits `cf9fef7`..`6190c7d`, one per plan-v2 task plus R-amendments; all pushed; working tree clean, in sync with origin/master.

## Next planned step
- Open a Stage 7 strategic session (Cutover + retiro del dashboard doGet v1.0; strangler-fig cutover). At opening: re-evaluate ADR-0004 (legacy repo archival). Registered Stage 7 item from ADR-0019 ruling (d): the double "Gastos por categoría" heading (ledger list section + chart card, `frontend/src/routes/+page.svelte`).

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill.
- Pages production branch is `main`, git branch is `master`: every `wrangler pages deploy` MUST carry `--branch=main` (ADR-0014). Project name `2penny`, output dir `frontend/.svelte-kit/cloudflare`. Latest Production deployment: `611add22` (2026-07-13, R4 final).
- `frontend/.dev.vars` (gitignored, dummy values only: `127.0.0.1:8788` + `dev-mock`) enables local dev against a scratchpad mock upstream (`mock-upstream.js`, session scratchpad — gone with the session; recreate to contract v1.0 shape per `frontend/src/lib/contract.js`). Without it, plain `vite dev` shows the error state. Real secrets live ONLY in Cloudflare Pages env.
- Chart.js 4.5.1 ESM gotchas, both fixed in `frontend/src/lib/charts/registry.ts` (ADR-0019): (1) NEVER replace `Chart.defaults.animation` with a fresh object — breaks hover color interpolation (`Animation.tick: this._fn is not a function`); mutate duration/easing instead. (2) Under reduced motion, `Chart.overrides.doughnut.animation = false` is also required — the DoughnutController type-level override shadows the root default.
- R3 (ADR-0019): the line chart's monthly semantics is a TEMPORARY concession — target = daily cumulative feed via contract amendment (ROADMAP "Backlog técnico"; touches json-api `@21` only, webhook `@12` untouchable; `formatDayMonth` returns).
- Doughnut slide carries ~41px dead space at ≤480px (same track-stretch mechanism R4 fixed for the line chart) — registered observation in ADR-0019, NO ruling; do not fix without Camilo's GO.
- `npm run check` does NOT gate in `frontend-ci.yml` — backlog (ADR-0017 note 2, ADR-0019 deferred item 3). Check is 0 errors as of `0c4ea2f`; keep it that way manually until gated.
- Zero-CLS skeleton depends on explicit body `line-height` (base.css), `table-layout: fixed`, and the chart ghosts matching each chart wrap's height (`ghost-chart` 240px desktop / 320px ≤480px per R4, `ghost-chart-bar` 320px, `ghost-chart-doughnut` 312/280px) — all in `frontend/src/routes/+page.svelte`.
- Legacy repo `pacc0/penny` is NEVER touched (ADR-0004) but its local copy (`VS Projects/Penny/penny`) is the read-only verbatim reference; the in-repo reference is `backend/src/DashboardPage.html`.
- Chrome junction for Playwright MCP: `%LOCALAPPDATA%\Google\Chrome\Application` → `%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64`. Reversal: `Remove-Item "$env:LOCALAPPDATA\Google\Chrome\Application"`. Remove before installing real Chrome (ADR-0017 note 1).
- Node pinned to 24 (dev + CI, ADR-0013).

## Evidence attached
```
$ git branch --show-current
master

$ git status --short
(empty — clean tree, in sync with origin/master)

$ git log --oneline -5
6190c7d docs: close Stage 6 - ADR-0019, ROADMAP stage 6 CERRADA / stage 7 next (stage-closer)
0c4ea2f fix(charts): R4 - line chart fills its card (240->320px slide)
02a92f0 feat(charts): task 3 - Gastos por Categoria doughnut (CategoryChart.svelte)
4447fe9 feat(charts): task 2 - Gastos por Metodo de Pago horizontal bar + chart carousel dots
8feb6a5 docs(stage-6): register R3 monthly net-flow semantics + daily-feed debt

$ clasp deployments   (run from backend/, read-only, Stage 6 closure 2026-07-13)
Found 7 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbzdNzeJA4szrgDEbfNYzDuXV8oyJS1F8J-u4B33ckaQDeNc7WJh03kZn8z5sjrfEvQ4 @11
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)
- AKfycby1gkwO5fSnRFMAfZ15Or7Mi_dh9ITYl2zuuspzi21Kr-VWqEGzhlyurJnisnwjsVGk @1 - Phase 2 initial deployment
- AKfycbz23K-9eRvUrtQidkEWb2dH95yRvZ9haLFP4luLXAfu4OcFdyKTg-z7-KOAabz9kGEU @6 - Phase 3 - HtmlService webhook response fix
- AKfycbzVpXDarjXx2laafzUiuOFwDSlgPd_gnlQVGsaJ26vdthxMOWYdoN6V-HtY1ivOy_Sq @20 - UI-3 Night Ledger restyle

Stage 6 production evidence: deployments 80ffe8e1 (Tasks 1-3) and
611add22 (R4, final), both Production/main via explicit --branch=main;
curl -sI https://2penny.pages.dev → 302 Location:
https://2penny-pages.cloudflareaccess.com/...; hash URL 302 +
Www-Authenticate: Cloudflare-Access (wildcard intact); CI frontend-ci
runs 29219263699 / 29231679930 / 29232477396 / 29233421193 all success.
Bundle: page node 188,726 B raw / 63,922 B gzip (baseline 9,348/2,705)
— stage cost ~61 kB gzip; sole package.json addition chart.js@4.5.1
(transitive @kurkle/color@0.3.4 in lockfile only). Camilo authenticated
check on real A56: PASS + R4. Screenshots: docs/evidence/stage-6/.
```
