# 2penny — Stage 3 Execution Plan: Svelte 5 Shell + Mock Proxy on Pages

> **For Claude Code.** Gate 1 passed (2026-07-09): proxy as SvelteKit server
> route (adapter-cloudflare), mock lives in the proxy from day one, deploy via
> Direct Upload (wrangler). Execute task by task; show every verification
> block's real output; STOP on any failure.

## Context & rules

- Repo: `C:\Users\Camilo\Documents\VS Projects\2penny` (remote `pacc0/2penny`).
- This stage touches ONLY `/frontend` (+ docs). **Zero backend changes** — no
  clasp commands except the read-only integrity check at closure.
- Stage 5 does the visual redesign. Stage 3 styling is MINIMAL: structure +
  tokens only. The design-tokens skill applies from the first line of CSS.
- Stage 6 does charts. `net_flow_series` renders as a plain table for now.
- Chart.js is NOT installed in this stage (no speculative dependencies).
- JavaScript with JSDoc (no TypeScript — single dev, contract typed via
  JSDoc typedef; simplest thing that works).
- Node 22 (matches frontend-ci.yml), npm (CI runs `npm ci`).
- The production Cloudflare Pages project is `2penny` (Direct Upload,
  `2penny.pages.dev`, behind Access).

---

## TASK 0 — Preconditions

```
git remote -v            # pacc0/2penny
git status --short       # clean
node --version           # v22.x — STOP if major differs from CI (22)
npx wrangler --version   # installed; if not: npm i -g wrangler, then wrangler login status check
```
Also verify `frontend/` contains only README.md.

---

## TASK 1 — Scaffold SvelteKit in `/frontend`

1. From repo root: `npx sv create frontend` — choose: **SvelteKit minimal**
   template, **JavaScript with JSDoc**, no extra add-ons (no eslint/prettier/
   playwright/vitest — deferrable complexity; NO testing per project doctrine).
   If the CLI refuses a non-empty directory, scaffold in a temp dir and move
   contents in, preserving the existing README.md.
2. `cd frontend && npm install`.
3. `npm i -D @sveltejs/adapter-cloudflare` and set it in `svelte.config.js`.
4. Delete demo/boilerplate content not needed (keep the skeleton lean).

Commit: `feat(frontend): sveltekit skeleton (svelte 5, jsdoc, adapter-cloudflare)`

Verification:
```
cd frontend && npm run build      # must succeed
git show --stat HEAD
```
Report the generated tree (src/routes, svelte.config.js, package.json deps —
confirm svelte major version is 5.x).

---

## TASK 2 — Static shell configuration

1. `src/routes/+layout.js`: `export const prerender = true;` (the page shell
   is static; the server route stays dynamic).
2. `src/routes/api/dashboard/+server.js` must NOT be prerendered (server
   routes are dynamic by default under adapter-cloudflare — verify in build
   output that it lands in the worker, not as a static file).
3. `src/app.html`: set lang="es", title "2penny", dark color-scheme meta.

Commit: `feat(frontend): prerendered shell config`

Verification: `npm run build` output showing the prerendered page AND the
dynamic server route.

---

## TASK 3 — `src/lib/styles/tokens.css` (VERBATIM)

1. Read `docs/DESIGN.md` §2 Tokens (VERBATIM). Copy the `:root` block into
   `frontend/src/lib/styles/tokens.css`, byte-identical, with header comment:
   `/* VERBATIM copy of docs/DESIGN.md §2 — do not edit directly. Source of
   truth: DESIGN.md (Verbatim Token Rule). */`
2. Import it in `src/routes/+layout.svelte`.
3. **STOP if DESIGN.md §2 is missing any token category the shell needs**
   (background, text, semantic income/expense colors) — ask, never invent.

Commit: `feat(frontend): night ledger tokens.css (verbatim from DESIGN.md)`

Verification: `git diff --stat HEAD~1` + a diff-check proving the :root block
in tokens.css is identical to the one in DESIGN.md (e.g. extract both blocks
to temp files and `git diff --no-index` them → empty diff).

---

## TASK 4 — Mock proxy: `src/routes/api/dashboard/+server.js`

1. Build the mock from the contract shape (docs/DATA_CONTRACT.md §3), NOT
   from stage2-evidence-1.json values — same shape, **fake sanitized numbers**
   (the evidence file holds real financial data; it stays untracked and must
   not be copied into the repo).
2. Mock content: contract_version "1.0"; period 2026-07/COP/Standard; plausible
   fake kpis; 4 categories; 2 accounts; 12-month net_flow_series with varied
   fake values (so the Stage 6 chart has something to show); 2 pending rows
   (so the review section renders); error null.
3. Implementation:
   ```javascript
   /** Mock proxy — Stage 3. Stage 4 replaces the mock with the real
    *  Apps Script fetch + secret from platform env. Contract v1.0. */
   export async function GET() {
     return Response.json(MOCK_DASHBOARD);
   }
   ```
4. JSDoc typedef of the contract in `src/lib/contract.js` (single place),
   mock annotated with it.

Commit: `feat(frontend): /api/dashboard mock proxy (contract v1.0 shape)`

Verification: `npm run build` + local run (`npm run preview` or
`wrangler pages dev`) + `curl.exe -s http://localhost:<port>/api/dashboard`
showing the mock JSON.

---

## TASK 5 — Shell page: render the contract

`src/routes/+page.svelte` + `+page.js` (universal load fetching
`/api/dashboard` — same-origin, no CORS, works identically in Stage 4):

- Sections, in order (structure only, minimal token-based styling):
  1. Header: "2penny" + period.month + generated_at.
  2. KPI row: Income, Expenses, Net Flow, Savings month/goal — figures with
     `font-variant-numeric: tabular-nums` (design-tokens mandate).
  3. Expenses by category (list: name + amount).
  4. Expenses by account (list).
  5. Net flow series (plain 12-row table — chart in Stage 6).
  6. Pending transactions (list; show "sin pendientes" if empty).
  7. Error state: if payload.error !== null, render a single error line
     instead of the dashboard (this is the contract's error channel — wire it
     now so Stage 4 gets it for free).
- Svelte 5 runes ($props/$state/$derived as needed — no legacy stores).
- Currency formatting: `Intl.NumberFormat('es-CO', { style:'currency',
  currency: payload.period.currency, maximumFractionDigits: 0 })` in a small
  `src/lib/format.js` helper.
- Anti-slop applies: no emoji icons, no gradients, hierarchy via size/weight/
  space. Plain ≠ ugly, but Stage 5 owns beauty — do not decorate.

Commit: `feat(frontend): dashboard shell rendering contract v1.0 (mock)`

Verification: local screenshot (wrangler pages dev / preview) saved to a
local scratch path (NOT committed) + describe what renders per section.

---

## TASK 6 — Deploy (Direct Upload) + evidence

1. `cd frontend && npm run build`
2. `npx wrangler pages deploy` targeting project **2penny**, production
   branch (so it lands on `2penny.pages.dev`, which Access covers — NOT a
   preview URL, which Access does not cover; ADR-0002).
3. Evidence battery:
   - Deploy command output (deployment id + URL) verbatim.
   - `curl.exe -sI https://2penny.pages.dev` → Access interception (302 to
     cloudflareaccess.com login) — proves the shell is NOT publicly readable.
   - Camilo, in the browser: log in via Access → dashboard renders the mock.
     Confirm sections 1–6 visible. (Human-observed evidence, screenshot to
     local scratch.)
   - In the authenticated browser session: open
     `https://2penny.pages.dev/api/dashboard` → mock JSON behind Access.
4. Push commits: `git push`. Then check GitHub Actions: **frontend-ci fires
   for the first time** (paths filter now matches). Evidence: the run URL and
   its green status. If it fails, fix within scope (build config only) before
   closing the stage.

---

## TASK 7 — Wrap

- Update `frontend/README.md`: how to run locally (`npm run dev`), build,
  deploy (wrangler Direct Upload), and the mock/real proxy swap note.
- Final report: git log --oneline of stage commits; deploy URL + id; the
  Access-interception curl; CI run link; confirmation that no clasp/backend
  command was executed this stage (webhook integrity trivially intact —
  stage-closer still runs its read-only `clasp deployments` check).
- Remind: closure via stage-closer with Camilo's sign-off.

## OUT of scope
- Real data / secret / env vars (Stage 4). Night Ledger redesign (Stage 5).
- Chart.js (Stage 6). Second Access policy (ADR-0002 — deadline: before
  Stage 4 closes; NOT this stage).
