# 2penny — Engineering Handoff (2026-07-18 07:33)

## Branch & stage
- branch: master | roadmap stage: 10 Desktop layout & design refresh (🟡 EN CURSO — deployed to production, pending Camilo's A56 + desktop confirmation).

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook — Anyone)
- json-api: `AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF` — now shows `@22` / "contract 1.1" (version number incremented by Stage 9's redeploy before this stage opened; deploymentId itself unchanged, per ADR-0023's nomenclature note).
- `clasp deployments` re-run at Stage 10 (2026-07-18 07:32, read-only): still 3 deployments (`@HEAD` + `@12` + `@22`). Zero backend files touched this stage — Stage 10 is frontend/docs-only by scope; no clasp write commands (`deploy`/`undeploy`/`create-deployment`/`version`) were ever available or needed.

## In-flight tasks (with file paths)
- Stage 10 implementation is done, pushed to `origin/master`, and deployed to production (`wrangler pages deploy --branch=main`, deployment `f855eb29`, commit `f8c6b4a`, explicitly authorized by Camilo). Verified `Production`/`main` in `wrangler pages deployment list`; both `2penny.pages.dev` and the hash URL return `302` (Access wildcard intact).
- **Only remaining step: Camilo's on-device confirmation** (A56 real device + a real desktop browser at >=1200px) — that's the one thing this session can't do itself.
- Files: `docs/DECISIONS.md` (ADR-0024/0025/0026), `docs/DESIGN.md` (typography + token frontmatter + §4 amendment), `docs/plans/stage-10-desktop-refresh.md`, `frontend/static/fonts/{space-grotesk-variable,ibm-plex-sans-condensed-400,ibm-plex-sans-condensed-600}.woff2` + 2 OFL license files (Nunito/Averia removed — zero remaining consumers), `frontend/src/lib/styles/{tokens.css,fonts.css}`, `frontend/src/lib/styles/base.css` (comment fix), `frontend/src/routes/+layout.svelte` (preload swap), `frontend/src/routes/+page.svelte` (desktop grid, hero tints, split table, 2 eliminations), `frontend/src/lib/components/PaymentMethodChart.svelte` (T5 container sizing).

## Next planned step
1. Camilo confirms on the real A56 device (mobile must look byte-identical to pre-Stage-10 minus the two eliminations) and on a real desktop browser (>=1200px grid) at https://2penny.pages.dev.
2. Once confirmed: a follow-up `stage-closer` pass marks Stage 10 ✅ CERRADA in ROADMAP.md (currently 🟡 EN CURSO).

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill. **Irrelevant this stage** — zero backend files touched, scope was `frontend/` + `docs/` only per the ratified plan's forbidden-zone rule.
- Pages production branch is `main`, git branch is `master`: every `wrangler pages deploy` MUST carry `--branch=main` (ADR-0014).
- Pages preview environments have no secrets — `wrangler pages deploy --branch=<anything but main>` gets a hash URL with no `API_SECRET`/`APPS_SCRIPT_EXEC_URL` bound.
- **No Cloudflare Pages auto-deploy exists in this repo** (ADR-0023 assumption error #4) — every Production deploy in this repo's history has been a manual `wrangler pages deploy --branch=main`. Don't assume a push alone puts anything live.
- The desktop (>=1200px) grid dissolves several `<section>` wrappers via `display:contents` (same technique the KPI/chart carousels already used at every width above 480px) — if you add a NEW top-level section to the dashboard, it will NOT automatically appear in the desktop grid; it needs an explicit `grid-column`/`grid-row` rule in the `@media (min-width: 1200px)` block in `+page.svelte`, or it'll render wherever the grid's implicit auto-placement puts it.
- The 12-month table has TWO markups now: `.table-scroll` (single table, all viewports <1200px) and `.table-desktop-split` (two 6-month halves, >=1200px only, same `net_flow_series` data sliced). Both exist in the DOM at all times; CSS `display:none`/`display:flex` toggles which one is visible. Don't edit one without checking whether the other needs the same data-shape change.
- `Nunito Variable` / `Averia Sans Libre` were deleted this stage (fonts + @font-face) — if anything still references those family names, it will silently fall through to the CSS fallback stack, not error.
- `npm run check` not gated in frontend-ci.yml (backlog, unchanged since Stage 5 — still open, ADR-0023 D5 registered it as a Stage 9 micro-task that didn't end up needing further action).
- `pacc0/penny` (legacy repo) is ARCHIVED (read-only) — `git remote -v` session-start check in CLAUDE.md still verifies THIS repo is `pacc0/2penny`.
- Node pinned to 24 (dev + CI, ADR-0013).
- Local dev testing this stage used a throwaway Node mock upstream server (scratchpad, not committed) serving a real captured contract-1.1 payload (`docs/evidence/stage-9/t6-production-payload.json`) with 3 synthetic `pending` rows added for visual completeness — normal `.dev.vars` (`APPS_SCRIPT_EXEC_URL=http://127.0.0.1:8788/exec`) already pointed there, nothing project-side changed.

## Evidence attached
```
$ git branch --show-current
master

$ git status --short
(clean)

$ git log --oneline -6
3629c15 feat(frontend): payment chart fills stretched card height >=1200px (T5)
b447fa7 feat(frontend): desktop grid layout >=1200px (T4, ADR-0026)
54c44a4 feat(frontend): wire Space Grotesk/IBM Plex Sans Condensed into tokens.css (T3)
52e036a feat(frontend): self-host Space Grotesk + IBM Plex Sans Condensed (T2 spike passed)
f24f486 docs: Stage 10 governance - ADR-0024/0025/0026 (typography, tokens, desktop grid)
b55b287 docs: stage 9 closed - contract 1.1 live, daily series + prev-month fallback delivered (handoff)

$ npm run check   (frontend/, 2026-07-18)
1784377828639 START
1784377828641 COMPLETED 290 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS

$ npm run build   (frontend/, 2026-07-18)
✓ built in 4.70s   (exit 0)

$ clasp deployments   (run from backend/, read-only, 2026-07-18 07:32)
Found 3 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @22 - json-api - contract 1.1

Screenshots (scratchpad, ephemeral, not committed):
- stage10-final/stage10-t7-final-1920x1080.png
- stage10-final/stage10-t7-final-1024x768.png
- stage10-final/stage10-t7-final-395x893.png
- stage10-t2-typography-spike.png (T2 gate evidence)

Stage 10 full evidence: docs/DECISIONS.md ADR-0024/0025/0026,
docs/plans/stage-10-desktop-refresh.md, docs/ROADMAP.md Etapa 10.
```
