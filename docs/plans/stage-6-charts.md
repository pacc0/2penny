# Stage 6 Plan — Charts (Night Ledger)

**Version:** v2 (2026-07-12, Commit 0a — height table filled verbatim from `backend/src/DashboardPage.html`; chart Tasks 1–3 unblocked. v1 RATIFIED 2026-07-12.)
**Date:** 2026-07-12
**Governing inputs:** ADR-0018 (chart library), DESIGN.md §2 (Category Colors, locked 2026-07-05), DESIGN.md §5 (Chart.js mapping + mandatory touch-tooltip pattern), DASHBOARD.md v2.2 §3.3 (frozen chart-type contract), DESIGN.md §3 (carousel spec, Stage 5), legacy reference `backend/src/DashboardPage.html` (verbatim-logic source).

## Invariants (violating any of these halts execution)

1. Telegram webhook deployment @12 (`...WLNnIxDDeWDvCPMc4e5W`) untouched. Zero clasp mutations; read-only `clasp deployments` verification at closure only.
2. Zero backend changes. The `/api/dashboard` proxy and JSON contract are consumed as-is; no field is added, removed, or reshaped.
3. Zero new dependencies beyond `chart.js@4.5.1` (exact pin). `package.json` diff at stage closure shows exactly one new entry.
4. Verbatim Token Rule: surface-token values are never retyped by hand. Category palette/emoji maps are copied byte-identical from the legacy reference.
5. Deploys: `--branch=main` explicitly. Source pushes: `git push origin master`.
6. Session-start ritual: `git remote -v` confirms `pacc0/2penny`.

## Ratified executive decisions (chat 2026-07-12)

- **D1:** Chart.js 4.5.1, npm, tree-shaken manual registration, no wrapper (ADR-0018).
- **D2:** Verbatim-logic port of legacy chart configs and `enableTapTooltip`; lifecycle adapted to Svelte 5 runes (`$effect` init/teardown, reactive props).
- **D3:** `CATEGORY_COLOR` / `CATEGORY_EMOJI` as strictly-typed TS constants in `lib/` (data dictionaries, not tokens).
- **D4:** Single plan, incremental execution, one commit per task for isolated rollback.
- **D5:** Mobile ≤480px: `maintainAspectRatio: false` + fixed-height slide container; canvas fills 100% of the bounding box.
- **D6 (P1, ratified 2026-07-12):** Semantic-hue bridge — `token(name)` helper (single `getComputedStyle` read per token at chart init, legacy pattern) used **only** for the four surface tokens feeding chart configs: `--income-green`, `--expense-coral`, `--hairline`, `--ink-muted`. Preserves the Verbatim Token Rule single source of truth. Category palette stays pure TS per D3.
- **D7 (ratified 2026-07-12):** `tapTooltip.ts` returns a cleanup function (removing both canvas-level and document-level listeners) consumed by the component `$effect` teardown. Lifecycle adaptation within the verbatim-logic mandate.

## Task 0 — Governance + setup

**Commit 0a (docs, must land before any code):**
- Register ADR-0018 in `docs/DECISIONS.md` (final ratified text, including the D6 token-bridge and D7 teardown companion decisions).
- Amend DESIGN.md §5: delivery note — Chart.js 4.5.1 now enters via npm exact pin + tree-shaken registration (CDN clause is legacy-scoped); the §5 option mappings and the touch-tooltip pattern remain binding verbatim. Amend DESIGN.md §6 "Do" bullet referencing "inside the HtmlService sandbox" with a 2penny-scoped note.
- Fill **⛔ PENDING-EXTRACTION** slide heights (see Task 0 verification) and bump this plan to v2. **No chart task executes against v1.**

**Commit 0b (setup):**
- `npm install chart.js@4.5.1 --save-exact` (run in `frontend/`).
- `frontend/src/lib/charts/registry.ts`: single registration module — `Chart.register(LineController, BarController, DoughnutController, LineElement, PointElement, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip)`; set `Chart.defaults.font.family` to the body stack and `Chart.defaults.color` = `token('--ink-muted')` per D6.
- `frontend/src/lib/charts/tapTooltip.ts`: logic-verbatim port of `enableTapTooltip(chart, canvas, mode)` — non-passive `touchstart`, `getElementsAtEventForMode(evt, mode, { intersect: false }, true)`, `setActiveElements`, `preventDefault`; document-level dismiss listener; return a teardown function removing **both** listeners (the legacy page never unmounts; Svelte components do — the document-level listener must not leak across mounts).
- `frontend/src/lib/charts/palette.ts`: `CATEGORY_COLOR` (14) and `CATEGORY_EMOJI` (18) copied byte-identical from the legacy reference, typed against the category union.
- Formatters: verify whether `formatCOP` / `formatCompactCOP` / `formatDayMonth` already exist in the Stage 5 shell `lib/`; **reuse if present, port logic-verbatim if absent** (evidence: file path + import site, or new file diff). `Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 })` for compact COP.

**Verification / evidence (Task 0):**
- Extract the three chart-container heights (desktop and ≤480px carousel slide) from the legacy reference CSS in `backend/src/DashboardPage.html`; record the verbatim values into the table below; bump plan to v2. **These values are deliberately NOT invented here — evidence over narrative.**

| Chart | Desktop container height | ≤480px slide height |
|---|---|---|
| Evolución del Flujo Neto (line) | `flex: 1; min-height: 240px;` (`.chart-wrap--line`, line 130) | `min-height: 240px` (no mobile override; base rule in effect) |
| Gastos por Método de Pago (bar) | `height: 320px;` (`.chart-wrap--bar`, line 126) | `height: 320px` (no mobile override; base rule in effect) |
| Gastos por Categoría (doughnut) | `height: 312px;` (`.chart-wrap--doughnut`, line 127) | `height: 280px` (`@media (max-width: 768px)` override, line 213 — cascades to ≤480px; no separate 480px rule) |

**Extraction note (verbatim finding, 2026-07-12):** in the legacy reference the `.carousel-slide` class wraps ONLY hero/KPI cards — charts are never carousel slides; at ≤480px they stack single-column keeping the heights above. The "≤480px slide height" column therefore records the *effective legacy height at that viewport*, which the D5 fixed-height slide containers adopt. `flex-shrink: 0` is set on the bar and doughnut wraps; the line wrap uses `flex: 1` to fill its `chart-card` (Round 13).

- `git log --oneline` showing 0a before 0b; `npm ls chart.js` output showing 4.5.1; build passes; bundle report noting the chart chunk size.

## Task 1 — Evolución del Flujo Neto (line)

- `frontend/src/lib/components/NetFlowChart.svelte`: canvas + `$effect` creating the chart on mount, destroying on teardown (`chart.destroy()` + tapTooltip teardown).
- Config logic-verbatim from legacy: single dataset, `token('--income-green')` border/background, `borderWidth: 2`, `pointRadius: 0`, `pointHoverRadius: 4`, `tension: 0.3`; `interaction: { mode: 'index', intersect: false }`; `events: ['mousemove','mouseout','click']`; no legend; tooltip label via `formatCOP`; x-axis `formatDayMonth` labels, `maxTicksLimit: 8`, `maxRotation: 0`, no grid; y-axis `--hairline` grid, `formatCompactCOP` ticks; `maintainAspectRatio: false`.
- `enableTapTooltip(chart, canvas, 'index')`.
- `prefers-reduced-motion`: animations disabled (port the legacy defaults block).
- Wire into the page layout / carousel slide with the v2 fixed heights.

**Evidence:** screenshot desktop + A56 (real device or exact 395×893 emulation); tap shows tooltip, tap-outside dismisses, desktop hover intact; console clean; commit hash.
**Rollback:** revert this commit; dashboard renders without the line chart.

## Task 2 — Gastos por Método de Pago (horizontal bar)

- `frontend/src/lib/components/PaymentMethodChart.svelte`.
- Config logic-verbatim: `indexAxis: 'y'`, single series `token('--expense-coral')`, `borderRadius: 6`, `borderSkipped: false`; `interaction: { mode: 'nearest', intersect: true }`; mouse-only events; tooltip `formatCOP(ctx.parsed.x)`; x-axis `--hairline` grid + `formatCompactCOP`; y-axis labels truncated at 18 chars with ellipsis; `maintainAspectRatio: false`.
- `enableTapTooltip(chart, canvas, 'nearest')`.

**Evidence:** same pattern as Task 1; label truncation verified with the longest real account name.
**Rollback:** revert commit.

## Task 3 — Gastos por Categoría (doughnut)

- `frontend/src/lib/components/CategoryChart.svelte`.
- Config logic-verbatim: `cutout: '58%'`, per-category colors from `palette.ts` with `token('--ink-muted')` fallback for unmapped categories (degraded, never broken); `borderRadius: 6`, `spacing: 2`, `borderWidth: 0`; **no legend**; emoji-title tooltips (emoji map, name fallback) + amount/percentage body; mouse-only events; `maintainAspectRatio: false`.
- `enableTapTooltip(chart, canvas, 'nearest')`.

**Evidence:** same pattern; tooltip shows emoji title + COP + percentage against real data; unmapped-category fallback proven (temporary local mock or code-path inspection — no production data mutation).
**Rollback:** revert commit.

## Stage closure requirements

- Full-dashboard screenshots desktop + A56 with real data; user authenticated check on the reference device.
- CI green; deploy `--branch=main`; both URLs 302 to cloudflareaccess.
- `package.json`/`package-lock.json` diff: exactly `chart.js@4.5.1`.
- Read-only webhook integrity check: @12 and @21 identical to baseline.
- Closure ADR (next number at closure) with per-task evidence, per Stage 5 precedent.
- ROADMAP.md status update.

## Explicitly out of scope

- Any chart beyond the three contracted; chart plugins (zoom, annotations, datalabels); date-range controls; backend or data-contract changes; the `npm run check` CI gap (remains backlog); Stage 7/8 items.
