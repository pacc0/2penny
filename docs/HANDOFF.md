# 2penny — Engineering Handoff (2026-07-11 12:33)

## Branch & stage
- branch: master | roadmap stage: 5 Rediseño visual Night Ledger (EN CURSO — no plan file yet)

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook - Anyone)
- /exec URL unchanged since last stage: yes — `clasp deployments` run this session at Stage 4 closure shows the same 7 deployments (same ids/versions) as the Stage 3 baseline; zero clasp write commands executed this session.

## In-flight tasks (with file paths)
- None in-flight. Stage 4 closed (ADR-0014, commit `160cc25`, pushed to `origin/master`). Stage 5 not yet started — no plan file exists at `docs/plans/` for Stage 5.

## Next planned step
- Write/approve `docs/plans/stage-5-*.md` (Night Ledger visual redesign; frontend-only, `docs/DESIGN.md` + design-tokens skill govern; Verbatim Token Rule applies to any tokens.css change).

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD; a new `clasp deploy` mints a NEW url. Use the clasp-deploy skill.
- **Pages production branch is `main`, but the git repo's branch is `master`.** Every `wrangler pages deploy` MUST pass `--branch=main` or it silently lands as Preview and production keeps serving the old build (bit us in Stage 4, see ADR-0014).
- Cloudflare Pages secrets (`APPS_SCRIPT_EXEC_URL`, `API_SECRET`, Production env) only take effect on the NEXT deployment, not on save.
- The dashboard proxy is a SvelteKit server route (`frontend/src/routes/api/dashboard/+server.js`), NOT a separate Pages Function. It maps body errors to HTTP: `"unauthorized"`→401, other non-null→500, `"upstream"` (proxy-generated: timeout/network/non-JSON)→502; 25s timeout; `Cache-Control: no-store` on every response. Contract still 1.0 (`"upstream"` is additive, DATA_CONTRACT.md §3).
- ADR-0002 RESOLVED: wildcard Access app covers `*.2penny.pages.dev` — all preview hashes 302 to Access. Do not touch the two Access applications.
- `frontend/src/routes/+page.js` deliberately overrides `+layout.js`'s `prerender = true` with `prerender = false` — DATA_CONTRACT.md §3 live-read rule. Do not remove.
- `frontend/vite.config.js` (not `svelte.config.js`) holds adapter-cloudflare config and forces runes mode.
- Node pinned to 24 (dev + CI, ADR-0013).

## Evidence attached
```
$ git branch --show-current
master

$ git status --short --branch
## master...origin/master   (clean, synced)

$ git log --oneline -5
160cc25 docs: close stage 4 — ADR-0014, roadmap status update (stage-closer)
bf9147a docs(contract): additive "upstream" error value (Stage 4, no version bump)
a91bef7 feat(frontend): real Apps Script fetch in dashboard proxy (Stage 4)
e986445 docs: fix Pages Function terminology in ROADMAP.md Etapa 4 title
f2ea871 docs(plans): stage 4 execution plan — real data via server route proxy

$ clasp deployments   (run from backend/, at Stage 4 closure this session)
Found 7 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbzdNzeJA4szrgDEbfNYzDuXV8oyJS1F8J-u4B33ckaQDeNc7WJh03kZn8z5sjrfEvQ4 @11
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)
- AKfycby1gkwO5fSnRFMAfZ15Or7Mi_dh9ITYl2zuuspzi21Kr-VWqEGzhlyurJnisnwjsVGk @1 - Phase 2 initial deployment
- AKfycbz23K-9eRvUrtQidkEWb2dH95yRvZ9haLFP4luLXAfu4OcFdyKTg-z7-KOAabz9kGEU @6 - Phase 3 - HtmlService webhook response fix
- AKfycbzVpXDarjXx2laafzUiuOFwDSlgPd_gnlQVGsaJ26vdthxMOWYdoN6V-HtY1ivOy_Sq @20 - UI-3 Night Ledger restyle

Stage 4 battery (this session, production 2penny.pages.dev behind Access):
- Happy path: HTTP 200, real data (deployment f56010a9) — human-observed
- 401 "unauthorized" forced via corrupted API_SECRET (deployment f9e9dc3c)
- 502 "upstream" forced via dead exec URL (deployment 1e07b2d2)
- Preview URLs b06ac578 / 05a342b7 / f56010a9: all 302 -> cloudflareaccess
- /api/dashboard unauthenticated: 302 (not publicly reachable)
```
