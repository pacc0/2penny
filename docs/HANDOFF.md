# 2penny — Engineering Handoff (2026-07-18 15:55)

## Branch & stage
- branch: master | roadmap stage: 10 Desktop layout & design refresh (🟡 EN CURSO — Iteration 4.1 deployed to production, pending Camilo's on-device confirmation).

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook — Anyone)
- /exec URL unchanged since last stage: **yes** — `clasp deployments` re-run 2026-07-18 15:53 (read-only): still 3 deployments (`@HEAD` + webhook `@12` + json-api `@22`), byte-identical to the previous handoff's listing. Zero backend files touched across Stage 10 iterations 1–4.1; no clasp write commands run.

## In-flight tasks (with file paths)
- Stage 10 Iteration 4.1 (legibility floor) is DONE: committed `ed077d7`, pushed to `origin/master`, deployed to Pages production (`wrangler pages deploy --branch=main`, deployment `ca0405eb`, source commit `ed077d7`, explicitly authorized by Camilo — "deploy manual"). Verified `Production`/`main` in `wrangler pages deployment list`; `2penny.pages.dev` and the hash URL both return `302` (Access intact).
- Iteration 4.1 outcome — **gate (b) failed BY RULING, not by accident**: the ADR-0029 addendum ruled data legibility outranks bottom-edge alignment. Rows hold 24px in all states (gate a PASS), no scrollbars (gate c PASS), but Pendientes/table bottom delta is 141/166/43px at 0/1/4 pending — the "line chart absorbs the surplus" mechanism is structurally unavailable (independent grid row-tracks; see addendum). Per-state measurements are in DECISIONS.md ADR-0029 addendum closure notes.
- Files this iteration: `frontend/src/routes/+page.svelte` (table card `min-height: 246px` with derivation comment; `tbody tr` `min-height: 24px` / `max-height: 44px` — desktop `@media (min-width: 1200px)` block only), `docs/DECISIONS.md` (ADR-0029 Iteration 4.1 addendum + closure notes).
- **Only remaining step: Camilo's on-device confirmation** (A56 real device + real desktop browser >=1200px) at https://2penny.pages.dev — the accepted misalignment is visible at low pending counts; Camilo decides whether it's livable or Stage 10 needs another iteration.

## Next planned step
1. Camilo confirms on-device (A56 + desktop >=1200px). The known visual: at 1 pending item (current production data), Pendientes' bottom edge sits ~166px above the table's — accepted trade per the legibility ruling.
2. Once confirmed: `stage-closer` pass marks Stage 10 ✅ CERRADA in ROADMAP.md.

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Backend deploys ONLY via the clasp-deploy skill. Irrelevant this stage (frontend/docs-only scope).
- Pages production branch is `main`, git branch is `master`: every `wrangler pages deploy` MUST carry `--branch=main` (ADR-0014).
- Pages preview environments have no secrets — deploying to any branch but `main` gets a hash URL with no `API_SECRET`/`APPS_SCRIPT_EXEC_URL` bound.
- **No Cloudflare Pages auto-deploy** (ADR-0023 assumption error #4) — a push alone puts nothing live; every Production deploy is a manual `wrangler pages deploy --branch=main`.
- The desktop (>=1200px) grid dissolves `<section>` wrappers via `display:contents` — a NEW top-level dashboard section needs explicit `grid-column`/`grid-row` rules in the `@media (min-width: 1200px)` block of `+page.svelte` or auto-placement puts it somewhere arbitrary.
- **SUPERSEDED by ADR-0030 (Iteration 5, 2026-07-18):** the old landmine "per-column flex wrappers are structurally dead because the doughnut must live inside the mobile carousel's DOM" no longer applies — ADR-0030 extracted the doughnut from the carousel (now 2 slides) into a standalone card, and desktop now DOES use per-column flex wrappers (`.dash-col-a`/`.dash-col-b`, one flexible absorber per column: line chart / doughnut). Bottom alignment is now by construction (0.00px measured). New structural fact to respect instead: the `.dash-col` wrappers group DOM by desktop column and dissolve below 1200px via `display:contents`, with `main` as a flex column and explicit `order` values producing the mobile stacking — if you add a new top-level section, give it BOTH an `order` (mobile position) and a column/flex rule (desktop position).
- Table markup is desktop/mobile shared since Iteration 4 (single 6-month table, `net_flow_series.slice(-6)`); the Stage-10-original `.table-desktop-split` (two 6-month halves) no longer exists. Since ADR-0030 the table card is natural height on desktop — Iteration 4/4.1's elastic-row machinery (24/44px clamps, 246px floor) was deleted.
- `npm run check` not gated in frontend-ci.yml (backlog since Stage 5).
- `pacc0/penny` (legacy repo) is ARCHIVED — session-start `git remote -v` check must show `pacc0/2penny`.
- Node pinned to 24 (dev + CI, ADR-0013).
- Local dev gate testing pattern (Stage 9/10): throwaway Node mock upstream on `127.0.0.1:8788` (scratchpad, never committed) serving `docs/evidence/stage-9/t6-production-payload.json` with synthetic `pending` rows; `frontend/.dev.vars` already points `APPS_SCRIPT_EXEC_URL` there. Iteration 4.1 added a `/set?n=N` control endpoint to switch pending count between Playwright passes.
- Playwright MCP gotcha hit this session: after an MCP reconnect, a stale Chrome held the profile lock AND the first measurement sweep returned corrupted (stale-state) numbers. If measurements look impossible, kill the `mcp-chrome-*` process and re-run; verify state propagation with curl first.

## Evidence attached
```
$ git branch --show-current
master

$ git status --short
(clean)

$ git log --oneline -5
ed077d7 feat(frontend): Iteration 4.1 legibility floor - 24px row min, 246px table floor
8c12fcf docs: Stage 10 Iteration 4.1 governance - legibility floor addendum to ADR-0029
8245395 feat(frontend): desktop grid v4 Option B - Pendientes to Col A, 6-month table (T2-T4)
ad2d221 docs: Stage 10 Iteration 4 governance - ADR-0029 desktop grid v4 (Option B)
29e8c31 feat(frontend): desktop grid v3 - 2-column region, natural-height Col B (T2-T4)

$ npm run check   (frontend/, 2026-07-18)
COMPLETED 290 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS

$ npm run build   (frontend/, 2026-07-18)
✔ done   (exit 0)

$ npx wrangler pages deploy .svelte-kit/cloudflare --project-name=2penny --branch=main
✨ Deployment complete! https://ca0405eb.2penny.pages.dev

$ npx wrangler pages deployment list --project-name=2penny   (top row)
ca0405eb-48cd-4c76-bab4-0654da4f168c | Production | main | ed077d7

$ curl.exe -sI https://2penny.pages.dev            → HTTP/1.1 302 Found
$ curl.exe -sI https://ca0405eb.2penny.pages.dev   → HTTP/1.1 302 Found

$ clasp deployments   (backend/, read-only, 2026-07-18 15:53)
Found 3 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @22 - json-api - contract 1.1

Iteration 4.1 gate measurements (Playwright, both 1920x1080 and 1280x800 identical):
pending 0: rows 6x24.00px, table 251.27px, Pendientes 110.27px, delta 141px
pending 1: rows 6x24.00px, table 251.27px, Pendientes  85.27px, delta 166px
pending 4: rows 6x24.00px, table 251.27px, Pendientes 208.27px, delta  43px
mobile 395x893: rows 28.5px natural (untouched), no page h-scroll in any state.

Full record: docs/DECISIONS.md ADR-0029 + Iteration 4/4.1 addendum + closure notes.
```
