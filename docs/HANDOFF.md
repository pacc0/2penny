# 2penny — Engineering Handoff (2026-07-17 22:10)

## Branch & stage
- branch: master | roadmap stage: 8 Endurecimiento (✅ CERRADA 2026-07-17, ADR-0022) — **Stage 9 not opened. No in-flight work.**

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook — Anyone)
- /exec URL unchanged since Stage 7 baseline: yes — `clasp deployments` re-run at Stage 8 closure (2026-07-17 22:09): still 3 deployments (`@HEAD` + `@12` + `@21`), both pinned ids byte-identical to ADR-0020's recorded baseline, verified at stage open, twice mid-stage (post-GeminiGate.js push, post-Canary.js push), and at close. Zero-deployment stage held throughout: only `clasp push`/`clasp status`/`clasp deployments` were used — never `clasp deploy`/`undeploy`/`create-deployment`/`version`.

## In-flight tasks (with file paths)
- None. Stage 8 fully closed: plan (`docs/plans/stage-8-hardening.md`), ADR-0021 (rulings) + ADR-0022 (closure, FIX-1 defect/correction, accepted deviations), `.github/workflows/clasp-guard.yml` (live, fixed), `backend/src/GeminiGate.js`, `backend/src/Canary.js`, `docs/OPERATIONS.md` §7–9, ROADMAP.md Stage 8 CERRADA all landed and pushed to `origin/master`.

## Next planned step
- No stage opened. Backlog candidate ready to pick up whenever: the bundled `@21` contract amendment (daily cumulative net-flow feed + previous-month category breakdown, ROADMAP "Backlog técnico") — touches json-api deployment `@21` only, webhook `@12` untouchable, needs its own plan.
- Standing operational task (human, not a stage): weekly `clasp-guard` runs on its own schedule (Monday 13:00 UTC) + on any `backend/**` push to `master`; `runCanary` runs daily via its Apps Script trigger. Neither needs Code's attention unless one alerts/fails.

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill.
- **`${{ secrets.* }}` must NEVER appear inside a `run:` script in any workflow in this repo — only inside an `env:` block.** FIX-1 (commit `5376520`) corrected exactly this defect in `clasp-guard.yml` (direct interpolation → shell stripped JSON quotes → invalid `.clasprc.json`, evidence: guard run #2 parse error). Apply the same `env:` + `printf '%s'` pattern to any future workflow that touches a secret.
- `GEMINI_MODEL_`/`GEMINI_API_BASE_URL_` live in `backend/src/GeminiGate.js`, not `GeminiClient.js` — the next model bump edits ONE file, then `clasp push`, then a manual in-place republish of `@12` via clasp-deploy (never a new deployment). ADR-0021 D2: this is a documented `@HEAD`/`@12` divergence (code location only, model value unchanged since Stage 8).
- `Canary.js`'s `runCanary()` is alert-on-failure only — **silence means healthy**, a Telegram message means the pinned Gemini model call failed (OPERATIONS.md §9).
- **The Apps Script project's title is still "Penny Gmail Ingestion"** (legacy name) — it hosts `@12` (webhook), `@21` (json-api), AND the Gmail-ingestion triggers (`ingestLuloEmails`, `sendMonthlySummary`). Cosmetic only, not renamed (OPERATIONS.md §8) — do not mistake it for a different/legacy project.
- Stage 7 changed the deployment count baseline to 3 (`@HEAD`+`@12`+`@21`) — still holds, unchanged through Stage 8.
- `Dashboard.js` is purely shared loaders/aggregators (`loadAllTransactions_`, `loadTransferPurposeSavingsMap_`, `loadSettingsMap_`, `aggregateMonth_`, `aggregateSavings_`, `aggregateExpensesByCategory_`, `aggregateExpensesByAccount_`, `COL_*` constants) consumed by `Api.js` (@21) and `MonthlySummary.js` (Telegram) — unchanged this stage.
- Cloudflare Access auth from CLI/session: Playwright browser profile holds NO Access session; login = email OTP to camilofu94@gmail.com, then the browser session works for /api/dashboard JSON and screenshots. Unauthenticated curl → 302.
- Pages production branch is `main`, git branch is `master`: every `wrangler pages deploy` MUST carry `--branch=main` (ADR-0014).
- Pages preview environments have no secrets — `wrangler pages deploy --branch=<anything but main>` gets a hash URL with no `API_SECRET`/`APPS_SCRIPT_EXEC_URL` bound.
- `npm run check` not gated in frontend-ci.yml (backlog, unchanged since Stage 5).
- `pacc0/penny` (legacy repo) is ARCHIVED (read-only) — `git remote -v` session-start check in CLAUDE.md still verifies THIS repo is `pacc0/2penny`.
- Node pinned to 24 (dev + CI, ADR-0013).

## Evidence attached
```
$ git branch --show-current
master

$ git status --short
(clean)

$ git log --oneline -8
89e643d docs: close Stage 8 - ADR-0022, ROADMAP Stage 8 CERRADA
5376520 fix(ci): pass CLASPRC_JSON via env to survive shell quoting; pin clasp 3.3.0
4b7209a docs: engineering handoff refresh - stage 8 T2-T4 landed, manual steps pending (checkpoint-code)
7484be4 docs: Stage 8 manual-steps runbook + ROADMAP EN CURSO status
6af466b feat(backend): add Canary.js — trivial Gemini health check
676ce6d refactor(backend): relocate Gemini model config to GeminiGate.js
ae3be0e ci: activate clasp-guard as read-only deploymentId verification
cfa29b5 docs: Stage 8 plan + ADR-0021 (clasp-guard, GeminiGate, Canary rulings)

$ clasp deployments   (run from backend/, read-only, re-verified 2026-07-17 22:09)
Found 3 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)

$ git branch -a | grep guard-failure-test
(no output — deleted locally and on origin post-closure)

Stage 8 full evidence: docs/DECISIONS.md ADR-0021 + ADR-0022,
docs/plans/stage-8-hardening.md, docs/OPERATIONS.md §7-9.
```
