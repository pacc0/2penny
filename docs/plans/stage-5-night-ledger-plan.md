# Stage 5 Plan — Night Ledger visual redesign (shell only)

Status: DRAFT v2 — decisions A/B/C ratified in-session (2026-07-12,
ADR-0016 for B). Awaiting Camilo ratification of the plan itself. No task
executes before ratification.

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

## Ratified decisions (Camilo, 2026-07-12)

- **A — No `--font-mono` token.** Ledger/column numerals use
  `var(--font-text)` (Nunito) + `font-variant-numeric: tabular-nums`.
  `--font-numeric` (Averia, proportional per the legacy ADR-0003 spike) is
  reserved for single-value hero figures. Task 1 is a corrective DESIGN.md
  §4 edit to remove the monospace mandate. Zero new tokens.
- **B — Self-host doctrine fonts (ADR-0016,** supersedes-in-part legacy
  `pacc0/penny` ADR-0003 delivery mechanism**).** Exactly 3 woff2 files:
  Nunito Variable (one variable file covers 500/700), Averia 400, Averia
  700. Averia 300 exists but is unused — not shipped. Latin subset only
  (covers Spanish; NO latin-ext). `font-display: swap`; optional preload of
  the above-the-fold face. No CDN, no npm dependency, zero cost.
- **C — Pending empty state carries ZERO CTA.** Per DATA_MODEL.md
  Status/Source Rules, Pending only comes from Gmail import awaiting
  review; Telegram entries are born Confirmed and never enter this queue —
  a Telegram CTA would be a false affordance. The empty-state pattern reads
  "at most 1 CTA; resolved/caught-up states carry zero" — this is the
  correct application of the pattern, NOT a deviation. Copy: positive,
  present-tense, no nudge to spend (final wording is Camilo's).

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

## Task 1 — Corrective DESIGN.md §4 typography edit (decision A)

- `docs/DESIGN.md` §4 Mandatos: replace "monospace en columnas
  numéricas/ledger" with: ledger/column numerals use `var(--font-text)`
  (Nunito) + `font-variant-numeric: tabular-nums`; `--font-numeric`
  (Averia, proportional — legacy ADR-0003 spike) reserved for single-value
  hero figures. This aligns §4 with §2's existing typography note. No token
  changes; tokens.css untouched.
- Commit: `docs(design): §4 ledger typography correction — tabular Nunito,
  no monospace (Stage 5, decision A)`.

**VERIFICATION**
```
git show --stat HEAD → only docs/DESIGN.md
git diff HEAD~1 -- frontend/src/lib/styles/tokens.css → empty (untouched)
grep -n "monospace" docs/DESIGN.md → 0 mandate hits remaining
```

## Task 2 — Self-host doctrine fonts (decision B, ADR-0016)

- `frontend/static/fonts/`: exactly 3 files — `nunito-variable.woff2`
  (latin, wght axis), `averia-sans-libre-400.woff2`,
  `averia-sans-libre-700.woff2`. Latin subset only. No Averia 300, no
  italics — zero dead weights.
- New `frontend/src/lib/styles/fonts.css`: three `@font-face` rules,
  `font-display: swap`, family names exactly `'Nunito Variable'` /
  `'Averia Sans Libre'` (must match the existing token stacks verbatim —
  `@font-face` wires files to EXISTING tokens, touches no token values).
- `frontend/src/routes/+layout.svelte`: `import '$lib/styles/fonts.css';`
  + optional `<link rel="preload">` for `nunito-variable.woff2`
  (above-the-fold face).

**VERIFICATION**
```
ls frontend/static/fonts → exactly 3 .woff2 files, sizes logged
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
  - Amount column: `var(--font-text)` + `font-variant-numeric:
    tabular-nums` (decision A — no monospace, no Averia in columns),
    right-aligned; income/expense color on the AMOUNT only with explicit
    +/− sign; row text stays `--ink`.
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
  - Pending empty (decision C — ZERO CTA, correct pattern application for
    a caught-up state): positive present-tense title + one supporting line
    (e.g. "Todo al día — no hay transacciones pendientes de confirmar.";
    final wording is Camilo's) + functional SVG. No CTA, no illustration,
    no emoji. Never "No data", never a nudge to spend/log.
  - Error branch (401/500/502 payloads): same restraint — title, one line
    naming the error value verbatim, `--alert-red` on the status word only.

**VERIFICATION**
```
Force empty pending (mock payload in dev) → screenshot
docs/evidence/stage-5/task7-empty.png
Force error (dev fetch to dead route) → error state renders, no raw JSON
grep diff for '<a |<button' inside the empty-state block → 0 matches
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
