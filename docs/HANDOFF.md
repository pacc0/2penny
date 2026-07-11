# 2penny — Engineering Handoff (2026-07-09 23:10)

## Branch & stage
- branch: master | roadmap stage: 4 Datos reales vía SvelteKit server route proxy (EN CURSO — gate: ADR-0002 resuelto antes de cerrar)

## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: `AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` (Telegram webhook - Anyone)
- /exec URL unchanged since last stage: yes — `clasp deployments` run this session shows the same 7 deployments (same ids/versions) as the Stage 3 closure baseline; no clasp write command executed this session.

## In-flight tasks (with file paths)
- None in-flight. Stage 3 closed (commit `aa500d9`); Stage 4 not yet started — no plan file exists yet at `docs/plans/` for Stage 4.

## Next planned step
- Write/approve `docs/plans/stage-4-*.md` (SvelteKit server route proxy `+server.js`: inject `API_SECRET` server-side, replace `frontend/src/routes/api/dashboard/+server.js` mock with a real fetch to the Stage 2 `/exec` endpoint). Gate: ADR-0002 (second Access policy covering preview URLs) must resolve before this stage closes.

## Known landmines
- clasp footgun: never let the /exec URL silently change — `clasp push` only updates @HEAD, never touches versioned deployments; a new `clasp deploy` mints a NEW url and breaks whatever depends on the old one. Use the clasp-deploy skill.
- ADR-0002 gap is now DEMONSTRATED, not just theoretical: Stage 3's hash-based preview URL (`https://b06ac578.2penny.pages.dev`) is publicly reachable with no Access protection — currently mock-only, but Stage 4 puts real financial data behind that same preview-URL surface. Hard deadline: resolve before Stage 4 closes.
- `.claspignore` patterns are resolved relative to `rootDir` (`src`), not repo root — a repo-root-relative pattern silently ignores everything (bit us in Stage 2, see ADR-0012).
- `frontend/vite.config.js` (not `svelte.config.js` — this `sv` CLI version scaffolds adapter config into vite.config.js) sets `adapter-cloudflare` and forces Svelte runes mode.
- `frontend/src/routes/+page.js` deliberately overrides `+layout.js`'s `prerender = true` with `prerender = false` — required by DATA_CONTRACT.md §3's live-read rule. Do not remove this override when building on the shell.
- Node version: dev machine and CI both pinned to 24 (bumped from a stale 22 assumption in Stage 1 scaffolding — see ADR-0013).

## Evidence attached
```
$ git branch --show-current
master

$ git status --short
(clean)

$ git log --oneline -5
aa500d9 docs: close stage 3 — ADR-0013, roadmap status update (stage-closer)
9ccaf9c docs(frontend): README with local dev, deploy, mock/real proxy swap note
2bc81ea docs(plans): amend stage 3 node precondition to 24 (matches CI)
1b22934 feat(frontend): dashboard shell rendering contract v1.0 (mock)
08131e3 feat(frontend): /api/dashboard mock proxy (contract v1.0 shape)

$ clasp deployments   (run from backend/)
Found 7 deployments.
- AKfycbw0c5iuRK2kDx8zDqAwj4ZAOI0fcqWRYISHcU_DMgo @HEAD
- AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12 - Telegram webhook - Anyone
- AKfycbzdNzeJA4szrgDEbfNYzDuXV8oyJS1F8J-u4B33ckaQDeNc7WJh03kZn8z5sjrfEvQ4 @11
- AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF @21 - json-api v1 (contract 1.0)
- AKfycby1gkwO5fSnRFMAfZ15Or7Mi_dh9ITYl2zuuspzi21Kr-VWqEGzhlyurJnisnwjsVGk @1 - Phase 2 initial deployment
- AKfycbz23K-9eRvUrtQidkEWb2dH95yRvZ9haLFP4luLXAfu4OcFdyKTg-z7-KOAabz9kGEU @6 - Phase 3 - HtmlService webhook response fix
- AKfycbzVpXDarjXx2laafzUiuOFwDSlgPd_gnlQVGsaJ26vdthxMOWYdoN6V-HtY1ivOy_Sq @20 - UI-3 Night Ledger restyle
```
