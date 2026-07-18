# 2penny — Engineering Handoff (2026-07-17 21:35)

## Branch & stage
- branch: master | roadmap stage: 8 Endurecimiento (🟡 EN CURSO — T2–T4 delivered, closure pending Camilo's manual steps)

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook — Anyone)
- /exec URL unchanged since Stage 7 baseline: yes — `clasp deployments` re-run 2026-07-17 21:34 after two `clasp push` calls this stage (GeminiGate.js relocation, Canary.js addition): still 3 deployments (`@HEAD` + `@12` + `@21`), both pinned ids byte-identical to ADR-0020's recorded baseline. Zero-deployment stage held: `clasp push` only, never `clasp deploy`.

## In-flight tasks (with file paths)
- Stage 8 T2–T4 code/CI landed and pushed. T5 (this handoff) is the last Code-side task.
- **Not started by Code (human-only, ADR-0021 D1/D3, `docs/OPERATIONS.md` §7):** GitHub Secret `CLASPRC_JSON`, Apps Script daily trigger for `runCanary`, first `clasp-guard` green `workflow_dispatch` run, forced-failure test (altered ID on throwaway branch → red → branch deleted). Stage does not close until this evidence exists.

## Next planned step
- Camilo runs the 4 manual steps in `docs/OPERATIONS.md` §7. Once green + red run evidence exists, invoke `stage-closer` to close Stage 8 (writes the closure ADR, flips ROADMAP to CERRADA).

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill.
- **`clasp-guard.yml` will fail every run until `CLASPRC_JSON` exists as a GitHub Secret** — this is expected, not a defect; do not "fix" it by weakening the assertion.
- `GEMINI_MODEL_`/`GEMINI_API_BASE_URL_` now live in `backend/src/GeminiGate.js`, not `GeminiClient.js` — the next model bump edits ONE file, GeminiGate.js, then `clasp push`, then a manual in-place republish of `@12` via clasp-deploy (never a new deployment). See ADR-0021 D2 for the documented @HEAD/@12 divergence (code location only, model value unchanged).
- `Canary.js`'s `runCanary()` has no schedule until Camilo creates the Apps Script trigger manually (Code cannot create Apps Script triggers).
- Stage 7 changed the deployment count baseline to 3 (`@HEAD`+`@12`+`@21`) — still holds, unchanged this stage.
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

$ git log --oneline -6
7484be4 docs: Stage 8 manual-steps runbook + ROADMAP EN CURSO status
6af466b feat(backend): add Canary.js — trivial Gemini health check
676ce6d refactor(backend): relocate Gemini model config to GeminiGate.js
ae3be0e ci: activate clasp-guard as read-only deploymentId verification
cfa29b5 docs: Stage 8 plan + ADR-0021 (clasp-guard, GeminiGate, Canary rulings)
cea25ac docs: engineering handoff refresh - stage 7 closed, stage 8 next, tree clean (checkpoint-code)

$ clasp deployments   (run from backend/, read-only, re-verified 2026-07-17 21:34)
Found 3 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)

Stage 8 full evidence: docs/DECISIONS.md ADR-0021, docs/plans/stage-8-hardening.md,
docs/OPERATIONS.md §7 (manual steps runbook).
```
