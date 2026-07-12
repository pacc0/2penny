# Stage 5 Plan — Night Ledger visual redesign (shell only)

Status: DRAFT — awaiting Camilo approval. No task executes before ratification.

## Scope

Frontend-only restyle of the existing dashboard shell to Night Ledger
doctrine (DESIGN.md §1–§4, ADR-0015). Markup + vanilla CSS only.

**Out of scope:** Chart.js / any chart implementation (Stage 6); backend /
clasp (zero write commands this stage); data contract changes; new npm
dependencies; `nextlevelbuilder/ui-ux-pro-max-skill` in any form (ADR-0015).

**Governing rules:** Verbatim Token Rule (tokens.css is the only source of
color/spacing/radius/type; missing token → STOP and ask). Luminance
gradients only, endpoints = existing surface tokens (ADR-0015).
Glassmorphism / `backdrop-filter` / blur / glow / drop-shadow: FAIL, no
exceptions. The `design-tokens` skill is invoked before every CSS-writing
task. Every `wrangler pages deploy` carries `--branch=main`.

## Open decisions (ratify with this plan)

- **A — Monospace ledger column has no token.** DESIGN.md §4 mandates
  monospace in ledger/amount columns, but §2 defines no `--font-mono` and
  its typography note says numeric columns use Nunito + `tabular-nums`.
  Inventing a stack violates the Verbatim Token Rule.
  **Proposal:** additive §2 amendment adding
  `--font-mono: ui-monospace, 'Cascadia Code', Consolas, monospace;`
  (system stacks only — no font download, no dependency) + verbatim sync to
  tokens.css. **Reject ⇒** Task 1 is dropped and ledger columns use Nunito +
  `tabular-nums` per §2; §4 stays as aspiration until a token exists.
- **B — Doctrine fonts are referenced but never loaded.** `--font-text` /
  `--font-numeric` name Nunito Variable and Averia Sans Libre; nothing
  loads them, so production renders Trebuchet/Segoe fallbacks today.
  **Proposal:** self-host woff2 files (OFL license, zero cost) in
  `frontend/static/fonts/` + `@font-face` in a new `fonts.css`. Static
  assets, not npm dependencies. No CDN (external runtime request rejected).
- **C — Empty-state CTA target.** Pending-empty state needs exactly one
  CTA; the only real action is registering a movement via the Telegram bot.
  Camilo supplies the `t.me/...` deep link at Task 7 (or rejects the CTA —
  then title + line only, deviation from pattern noted).

## Assumption to verify in-task

`net_flow_series` (12 rolling months) has its LAST row = current
`period.month` — KPI deltas are derived as last vs. previous row. Task 5
verifies this against live payload before wiring; if false, deltas come
from whatever row matches `period.month`.

---

## Task 0 — Preconditions

No files. Confirm clean start.

**VERIFICATION**
```
git remote -v            → pacc0/2penny
git status --short       → clean
node --version           → v24.x (ADR-0013)
cd frontend && npm run dev → serves; browser shows current Stage 4 shell
```

## Task 1 — `--font-mono` token amendment (BLOCKED on decision A)

- `docs/DESIGN.md` §2: add `--font-mono` line to the verbatim `:root`
  block (additive) + one typography sentence: ledger/amount columns use
  `--font-mono` with `tabular-nums`; §2's Nunito note now covers non-ledger
  numeric text only.
- `frontend/src/lib/styles/tokens.css`: verbatim re-sync of the block.
- Commit: `docs(design): additive --font-mono token (Stage 5, decision A)`.

**VERIFICATION**
```
diff of DESIGN.md §2 block vs tokens.css :root → byte-identical
git show --stat HEAD → only the 2 files above
```

## Task 2 — Self-host doctrine fonts (decision B)

- `frontend/static/fonts/nunito-variable.woff2` (latin, wght axis),
  `averia-sans-libre-{300,400,700}.woff2` (latin).
- New `frontend/src/lib/styles/fonts.css`: four `@font-face` rules,
  `font-display: swap`, family names exactly `'Nunito Variable'` /
  `'Averia Sans Libre'` (must match tokens verbatim).
- `frontend/src/routes/+layout.svelte`: `import '$lib/styles/fonts.css';`.

**VERIFICATION**
```
ls frontend/static/fonts → 4 .woff2 files, sizes logged
dev server: GET /fonts/nunito-variable.woff2 → 200
DevTools computed font-family on body → "Nunito Variable" (not Trebuchet)
Screenshot: docs/evidence/stage-5/task2-fonts.png
```

## Task 3 — Base shell + focus doctrine

- New `frontend/src/lib/styles/base.css`: body `margin:0`,
  `background: var(--bg)`, `color: var(--ink)`,
  `font-family: var(--font-text)`; global
  `:focus-visible { outline: 2px solid var(--savings-teal); outline-offset: 2px; }`
  (single focus color, ring not color-shift).
- `frontend/src/routes/+layout.svelte`: import base.css.
- `frontend/src/routes/+page.svelte`: header block restyled — `h1` +
  period line (`--ink-muted`), container `max-width` kept, page gutters via
  spacing tokens. No visual chrome on the page background (gradients on
  cards only, never on `--bg` — ADR-0015).

**VERIFICATION**
```
Full-page screenshot: body background #0B0B0D edge-to-edge (no white gutters)
Tab through page: visible 2px ring on every focusable element
docs/evidence/stage-5/task3-base.png
```

## Task 4 — Streaming load + skeleton screens

- `frontend/src/routes/+page.js`: return the fetch promise unawaited
  (`return { payload: fetch('/api/dashboard').then(r => r.json()) }`).
  Live-read rule intact: still one real fetch per request, proxy still
  `no-store`, `prerender = false` untouched (do NOT remove the override).
- `frontend/src/routes/+page.svelte`: wrap content in
  `{#await data.payload}` — skeleton branch mirrors the real layout
  (4 KPI ghost cards, ghost list rows, ghost table rows) to zero CLS.
  Shimmer: CSS-only, `rgba(255,255,255,0.08)` sweep over `--surface`,
  `animation-delay: 300ms` so sub-300ms loads show a static ghost, never a
  flash. No spinners.

**VERIFICATION**
```
DevTools network throttle "Slow 4G": skeleton renders, then data swaps in
Layout shift: CLS 0 in DevTools performance overlay during swap
Skeleton screenshot: docs/evidence/stage-5/task4-skeleton.png
npm run check → 0 errors
```

## Task 5 — KPI hero cards

- `frontend/src/routes/+page.svelte` (markup + scoped CSS):
  - 4 cards (income, expenses, net flow, savings) — within the 4–6 max.
  - Anatomy per card: Label (small, uppercase, `--ink-muted`) → Value
    (hero, `--font-numeric` Averia 700, largest element on card) → Delta
    (smaller, Nunito `tabular-nums`).
  - Deltas: income/expenses/net vs. previous month from `net_flow_series`
    (verify assumption first — see header). Savings delta = month vs.
    `monthly_goal`. Conditional color on the DELTA only
    (`--income-green` / `--expense-coral`), ALWAYS paired with ▲/▼ SVG
    glyph (never color alone). Card value stays `--ink`.
  - Surface: `linear-gradient(var(--surface-raised), var(--surface))`
    (luminance only, both endpoints surface tokens — ADR-0015), border
    `1px solid var(--hairline)`, radius `var(--rounded-lg)`. No shadow.

**VERIFICATION**
```
Live payload check: net_flow_series[11].month === period.month (log output)
Screenshot: gradient imperceptible at a glance (subtlety test) —
docs/evidence/stage-5/task5-kpis.png
grep the diff for 'linear-gradient' → endpoints are surface tokens only
grep the diff for 'box-shadow|backdrop-filter|blur' → 0 matches
```

## Task 6 — Ledger sections (lists + 12-month table)

- `frontend/src/routes/+page.svelte`:
  - Categories / accounts / pending → ledger rows: text left, amount right,
    single-direction horizontal `--hairline` separators, NO zebra, NO card
    borders, row padding `--spacing-sm`/`--spacing-md`.
  - Amount column: `--font-mono` (or Nunito per decision A fallback) +
    `tabular-nums`, right-aligned; income/expense color on the AMOUNT only
    with explicit +/− sign; row text stays `--ink`.
  - Net-flow table: numeric headers right-aligned over their columns,
    header row `--ink-muted`, all numeric cells `tabular-nums`, hairline
    rows only.

**VERIFICATION**
```
Screenshot: amounts align vertically digit-for-digit (tabular check) —
docs/evidence/stage-5/task6-ledger.png
grep diff for 'nth-child(even)|zebra' → 0 matches
Visual: no full-row coloring anywhere; sign present on every colored amount
```

## Task 7 — Empty + error states

- `frontend/src/routes/+page.svelte`:
  - Pending empty: positive title ("Todo al día"), one line ("Los
    movimientos pendientes aparecerán aquí."), ONE CTA → Telegram deep
    link from decision C. No illustration, no emoji, functional SVG only.
    Never "No data".
  - Error branch (401/500/502 payloads): same restraint — title, one line
    naming the error value verbatim, `--alert-red` on the status word only.

**VERIFICATION**
```
Force empty pending (mock payload in dev) → screenshot
docs/evidence/stage-5/task7-empty.png
Force error (dev fetch to dead route) → error state renders, no raw JSON
```

## Task 8 — Responsive (768 / 480, A56 reference)

- `frontend/src/routes/+page.svelte` media queries:
  - ≥769px: KPI grid 4-up (or 2×2 — pick by density at build time).
  - ≤768px: KPI grid 2×2; spacing steps down one token.
  - ≤480px: KPI grid 1-up or 2-up compact; 12-month table wrapped in
    `overflow-x: auto` container (page body never scrolls horizontally).

**VERIFICATION**
```
Playwright viewport 395×893 (Galaxy A56): full-page screenshot, no
horizontal body scroll — docs/evidence/stage-5/task8-a56.png
Also 768×1024 and 1280×800 screenshots.
```

## Task 9 — Accessibility & contrast battery

No new files — fixes fold into +page.svelte / base.css if a pair fails.

**VERIFICATION** (computed, not narrated)
```
Contrast ratios computed (WebAIM/CLI) for every pair actually used:
  --ink / --bg, --ink / --surface, --ink / --surface-raised,
  --ink-muted / (same three),
  --income-green, --expense-coral, --alert-red / their real backgrounds,
  gradient text pairs checked against DARKEST endpoint (--surface).
All normal text ≥ 4.5:1, large text & UI ≥ 3:1 — log the numbers.
Keyboard-only pass: every interactive element reachable, ring visible.
```

## Task 10 — Build, deploy, production battery

- `npm run check` + `npm run build` clean.
- Deploy: `wrangler pages deploy --branch=main` (landmine: NEVER omit the
  flag). Zero clasp commands this stage.

**VERIFICATION**
```
npm run check → 0 errors; npm run build → exit 0
wrangler pages deployment list → new deployment marked Production
curl -sI https://2penny.pages.dev → 302 cloudflareaccess (Access intact)
curl -sI https://<new-hash>.2penny.pages.dev → 302 (wildcard intact)
Camilo, authenticated browser: real data renders in new shell (200)
CI frontend-ci → green run id logged
git log --oneline (stage commits) + push to origin/master
```
