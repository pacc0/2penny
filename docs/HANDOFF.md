# 2penny — Engineering Handoff (2026-07-12 15:21)

## Branch & stage
- branch: master | roadmap stage: 6 Charts (Chart.js) (🟡 EN INICIACIÓN — plan pendiente de ratificación). Stage 5 CLOSED 2026-07-12 (ADR-0017).

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook - Anyone)
- /exec URL unchanged since last stage: yes — `clasp deployments` run this session (read-only, Stage 5 closure battery) shows the same 7 deployments (ids/versions identical to the Stage 4 baseline: @HEAD, @12 webhook, @11, @21 json-api, @1, @6, @20). Zero clasp write commands executed during Stage 5.

## In-flight tasks (with file paths)
- None. Stage 5 fully executed and closed (`318678a`..`dc3dd0a`, one commit per plan-v4 task; closure `fadd792`; roadmap semantics fix `a851713`). Working tree clean, in sync with origin/master.
- Stage 6 has NO plan yet — do not write chart code before a plan lands in `docs/plans/` and is ratified (strategic-session → architect-gate → writing-plans pipeline).

## Next planned step
- Open a Stage 6 strategic session (Charts, Chart.js per ROADMAP; DESIGN.md §5 + anti-slop govern) to produce and ratify `docs/plans/stage-6-charts-plan.md`. Note: plan must reconcile "no new npm dependencies" doctrine with Chart.js (roadmap names it as the Stage 6 deliverable — needs explicit ratification of the dependency).

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill.
- Pages production branch is `main`, git branch is `master`: every `wrangler pages deploy` MUST carry `--branch=main` (ADR-0014). Project name `2penny`, output dir `frontend/.svelte-kit/cloudflare`.
- `frontend/.dev.vars` (gitignored, dummy values only: `127.0.0.1:8788` + `dev-mock`) enables local dev against a scratchpad mock upstream (`mock-upstream.js`, session scratchpad — gone with the session; recreate if needed). Without it, plain `vite dev` shows the error state (`internal`) because `platform.env` bindings don't exist. Real secrets live ONLY in Cloudflare Pages env.
- Chrome junction for Playwright MCP: `%LOCALAPPDATA%\Google\Chrome\Application` → `%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64` (Chrome for Testing). Reversal: `Remove-Item "$env:LOCALAPPDATA\Google\Chrome\Application"`. Remove before installing real Chrome (ADR-0017 note 1).
- `npm run check` does NOT gate in `frontend-ci.yml` — backlog candidate, deliberately not closed in Stage 5 (ADR-0017 note 2). Check is currently 0 errors; keep it that way manually until gated.
- Zero-CLS skeleton depends on explicit body `line-height` (base.css) and `table-layout: fixed` (+page.svelte) — removing either reintroduces font-swap layout shift.
- Legacy repo `pacc0/penny` is NEVER touched (ADR-0004). The ≤480px carousel doctrine now lives in THIS repo (DESIGN.md §3 re-amended, decision D revised; reference implementation `backend/src/DashboardPage.html` Rounds 13–15).
- Node pinned to 24 (dev + CI, ADR-0013).

## Evidence attached
```
$ git branch --show-current
master

$ git status --short --branch
## master...origin/master   (clean, in sync)

$ git log --oneline -5
a851713 docs(roadmap): stage 6 status corrected to initiation - no ratified plan yet (governance semantics)
fadd792 docs: close Stage 5 - ADR-0017, ROADMAP stage 5 done / stage 6 active (stage-closer)
dc3dd0a docs(evidence): re-encode task 9 battery log as UTF-8 (was UTF-16/binary to git)
7d77773 docs(evidence): task 9 contrast + keyboard battery - 13/13 WCAG pairs pass, ring visible on both scroll regions (Stage 5 Task 9)
45cd264 feat(frontend): responsive 768/480 - legacy scroll-snap KPI carousel at <=480px, table scroll container (Stage 5 Task 8)

$ clasp deployments   (run from backend/, read-only, Stage 5 closure)
Found 7 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbzdNzeJA4szrgDEbfNYzDuXV8oyJS1F8J-u4B33ckaQDeNc7WJh03kZn8z5sjrfEvQ4 @11
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)
- AKfycby1gkwO5fSnRFMAfZ15Or7Mi_dh9ITYl2zuuspzi21Kr-VWqEGzhlyurJnisnwjsVGk @1 - Phase 2 initial deployment
- AKfycbz23K-9eRvUrtQidkEWb2dH95yRvZ9haLFP4luLXAfu4OcFdyKTg-z7-KOAabz9kGEU @6 - Phase 3 - HtmlService webhook response fix
- AKfycbzVpXDarjXx2laafzUiuOFwDSlgPd_gnlQVGsaJ26vdthxMOWYdoN6V-HtY1ivOy_Sq @20 - UI-3 Night Ledger restyle

Stage 5 production evidence: deployment 72a5dcdc Production/main;
curl -sI https://2penny.pages.dev → 302 cloudflareaccess;
CI frontend-ci run 29206387119 success; contrast battery
docs/evidence/stage-5/task9-contrast.txt (13/13 PASS).
```
