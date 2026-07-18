# Stage 10 — Desktop Layout & Design Refresh (ratified plan)

Ratified verbatim as the governing instruction block for Stage 10.
Execution agent: Claude Code (Sonnet). Governance authority: this block.
Scope: `frontend/` ONLY. Forbidden: `backend/`, any Apps Script file,
clasp config, or anything related to the Telegram webhook. Touching
those = STOP immediately and report.

Renumbering note (see `docs/DECISIONS.md` ADR-0024): this instruction
block originally referred to "ADR-0020/0021/0022" for the three new
ADRs below. Those numbers were already taken (Stage 7/8 closures) —
renumbered to ADR-0024/0025/0026 at execution time. Text below is
otherwise verbatim from the ratified instruction.

## OPERATING RULES

- Work autonomously. Do NOT stop to ask questions except under the four
  STOP conditions in the final section. For any other ambiguity: make the
  most conservative choice consistent with this spec, and log it in a
  "DEVIATIONS" section of the final report.
- Evidence discipline: every task closes with real tool output (git hash,
  build exit code, file paths, screenshot files). Narrative claims are not
  evidence.
- Commit per task (T1..T7), conventional messages, branch: master.
  Do NOT push until T7 verification passes.

## T0 — SESSION OPEN

1. Run `git remote -v` — MUST show pacc0/2penny. If it shows pacc0/penny,
   STOP (wrong repo).
2. Run `git status --short` — MUST be clean. If dirty, STOP and report.

## T1 — GOVERNANCE DOCS (before any code)

Write these, in English, then commit:
1. `docs/DECISIONS.md` — append (never edit prior entries):
   - ADR-0024 "Typography refresh (supersedes DESIGN.md typography
     rationale and the legacy-repo ADR-0003 Nunito tabular-digits
     argument)": Camilo's executive decision. font-text: IBM Plex Sans
     Condensed. font-numeric/display: Space Grotesk. Record explicitly:
     Space Grotesk is adopted DESPITE the anti-slop directive in
     `.claude/skills/design-tokens` (which vetoes AI-convergent display
     defaults in spirit, though it does not name this font literally) —
     deliberate owner override, single exception, the anti-slop rule
     otherwise remains in force. Conditional on the T2 spike passing.
   - ADR-0025 "Night Ledger token additions": savings-teal-tint #85DBE6
     (hero surface only, per Two-Volume Rule); delta-positive-on-tint
     #0E7A3A; delta-negative-on-tint #C2410C (both text-on-pastel only).
     Amendment: a radial luminance overlay
     `radial-gradient(120% 120% at 100% 100%, rgba(0,0,0,0.18), transparent 55%)`
     is permitted ONLY on tinted hero-card surfaces; it is a luminance
     gradient on an existing token, not a decorative gradient; the
     decorative-gradient prohibition stands for everything else.
   - ADR-0026 "Desktop grid layout (row contract for >768px)": 3-row
     grid + full-width 12-month table row, per the plan doc. (No local
     `DASHBOARD.md` exists in this repo to "update" — see ADR-0026 for
     the correction; this plan doc plus the ADR are the row-contract
     record.)
2. `docs/plans/stage-10-desktop-refresh.md` — this file.
3. `docs/DESIGN.md` — update frontmatter and the typography section per
   ADR-0024/0025 (this file IS editable; only DECISIONS.md is
   append-only). Add the new tokens to the frontmatter verbatim. Update
   the typography section, marking the previous Two Families choice as
   superseded by ADR-0024.

Evidence: git hash of the governance commit.

## T2 — TYPOGRAPHY SPIKE (gate for everything visual)

1. Self-host (ADR-0016 pattern, woff2 in `frontend/static/fonts/`, OFL
   licenses committed): Space Grotesk 500,700; IBM Plex Sans Condensed
   400,600.
2. Build a throwaway test page (do not commit it) rendering a column of
   amounts ($ 4.994.966 / $ 172.000 / $ 2.358.012) in Space Grotesk with
   `font-variant-numeric: tabular-nums`, and labels in IBM Plex Sans
   Condensed.
3. Verify digits align vertically (screenshot + measure: all rows same
   pixel width for equal digit counts).

STOP CONDITION 1: if Space Grotesk does not produce true tabular
alignment, STOP and report with the screenshot. Do not substitute
another font.

Evidence: screenshot file path + measured widths.

## T3 — TOKENS

Update `frontend/src/lib/styles/tokens.css` as a VERBATIM copy of the
updated DESIGN.md frontmatter (Verbatim Token Rule): new color tokens,
new font-family stacks, `@font-face` declarations. Fallback stacks:
Space Grotesk -> IBM Plex Sans Condensed -> system; IBM Plex Sans
Condensed -> system. All numeric elements get `tabular-nums`.

Evidence: git diff summary + hash.

## T4 — DESKTOP LAYOUT (media queries; nothing below 769px may change)

Breakpoint tiers:
- **>=1200px (full desktop):** container max-width 1520px, side padding
  48px, grid gap 20px everywhere.
  - **Row 0 (header):** flex space-between, baseline-aligned. Left:
    "2penny" ~42px bold (Space Grotesk). Right: period "2026-07" muted.
    The "generado &lt;timestamp&gt;" line is DELETED (all viewports).
  - **Row 1:** 4 hero cards, equal width, order: Ingresos, Gastos,
    Ahorro, Flujo Neto.
    - Ingresos surface `var(--income-green-tint)`; Gastos
      `var(--expense-coral-tint)`; Ahorro `var(--savings-teal-tint)`.
      Title + amount in `var(--ink-on-tint)`. Each tinted card gets the
      ADR-0025 radial overlay via `background-image`.
    - Flujo Neto keeps the current dark surface and its existing
      colors.
    - Deltas on tinted cards: positive `var(--delta-positive-on-tint)`,
      negative `var(--delta-negative-on-tint)`. Dark card keeps current
      delta colors.
  - **Row 2:** Evolución del flujo neto (line chart) 2/3 width; Gastos
    por categoría (doughnut) 1/3, no legend/labels (hover tooltip
    already covers it).
  - **Row 3:** Gastos por método de pago (bars) 2/3; right 1/3 column
    stacks two cards: "Top categorías" then "Pendientes".
    - Top categorías: the 3 categories side by side in 3 columns; label
      on top, large percentage, mini progress bar below, existing
      colors (blue, magenta, green).
    - Payment bars card: 1-4 dynamic rows filling card height with
      `justify-content: space-evenly`. Bar heights/gaps: 1 row -> 96px;
      2 -> 52px/28px gap; 3 -> 40px/20px; 4 -> 32px/16px. Each row:
      account label left, orange bar on grey track, amount right in
      orange (existing expense-coral tokens).
  - **Row 4:** "Flujo neto — últimos 12 meses" as ONE full-width card
    split into TWO side-by-side 6-month groups (left: oldest 6, right:
    most recent 6), each group with its own Mes/Ingresos/Gastos/Neto
    header, tabular-nums, a vertical hairline (`var(--hairline)`)
    separating the groups. No new data, no sparklines, no additions.
- **769-1199px (tablet):** hero cards 2x2; rows 2-4 stack full-width in
  source order; 12-month table reverts to a single 12-row table.
- **<=768px (mobile, A56):** the current layout is UNTOUCHED except:
  (a) the "Gastos por cuenta" text list is removed (all viewports),
  (b) the generated-timestamp line is removed (all viewports),
  (c) global tokens (fonts, hero tints, delta colors) apply naturally.
  The mobile DOM order, sections, carousels, and chart sizes must
  remain byte-identical in structure.

STOP CONDITION 2: if any change you are making would alter the mobile
(<=768px) structure or distribution beyond (a)-(c), STOP and report
before proceeding.

Also DELETE (all viewports): the "Gastos por cuenta" section — its data
lives only in the payment-methods bar chart now.

Do NOT add any element not listed here.

Evidence: git hash per component touched.

## T5 — CHART ADJUSTMENTS

Chart.js 4.5.1 stays; tree-shaken registration stays. Only container
sizing and the doughnut legend removal change. `maintainAspectRatio:
false` and explicit wrapper heights remain mandatory. Reduced-motion
behavior (including the doughnut animateRotate fix) must not regress.

Evidence: git hash.

## T6 — QUALITY GATES

Run and report exit codes for: `npm run check`, `npm run build`, and
the existing test suite if present. All must pass.

Evidence: command outputs verbatim.

## T7 — VERIFICATION & CLOSE

1. Local screenshots (dev server or preview build) at 1920x1080,
   1024x768, and 395x893 (A56 viewport). Save to a temp dir, report
   paths.
2. Confirm the 395x893 render is structurally identical to production
   mobile minus the two eliminations.
3. Handoff commit summarizing the stage; then push master (Cloudflare
   Pages auto-deploys — **governance note:** ADR-0023 closure notes,
   assumption error #4, records that no such auto-deploy actually
   exists in this repo's history; every Production deploy has been a
   manual `wrangler pages deploy --branch=main`. Treat "push triggers
   deploy" as false; a manual deploy step will be required for
   production visibility, or reported as pending Camilo's manual
   trigger). Report the deployment URL for Camilo's on-device A56
   verification — production sign-off remains his.

Evidence: screenshot paths, final `git log --oneline` of the stage,
push output, deployment URL.

## STOP CONDITIONS (the ONLY reasons to halt)

1. Typography spike failure (T2).
2. Mobile structural integrity at risk (T4).
3. Anything requiring changes outside `frontend/` + `docs/`, or touching
   secrets, auth, the Pages Function contract, or backend files.
4. An ambiguity whose resolution would materially change the visual
   contract described above (not minor spacing/sizing — decide those
   yourself and log them under DEVIATIONS).

Everything else: decide, proceed, log.

## Iteration 2 (layout amendment)

Ratified verbatim as the governing instruction block for this amendment.
See `docs/DECISIONS.md` ADR-0027 for the renumbering note (originating
text referred to "ADR-0023"/"ADR-0022"; both already taken) and for the
implementation decision on Column A/B (explicit min-height ratio instead
of nested flex wrappers, to avoid touching the mobile chart carousel's
DOM).

Amends the ratified Stage 10 plan. Scope: `frontend/` + `docs/` ONLY.
Backend, clasp, webhook: forbidden.

### T1 — Governance

Append ADR-0027 "Desktop grid v2 + mobile header exception (supersedes
the ADR-0026 row contract)":
- Rows 2-4 of the desktop grid are replaced by a single 3-column region
  (spec below). The 12-month table moves from a bottom full-width split
  card to a full-height right column as a single 12-row table; the
  two-group 6+6 split is retired.
- Mobile exception: the <=768px header adopts the desktop header
  pattern (large title + right-aligned date, same baseline). This is
  the ONLY sanctioned mobile structural change; the mobile-integrity
  rule remains in force for everything else.

### T2 — Desktop layout v2 (>=1200px only)

Replace the former rows 2, 3 and 4 with ONE grid region:
`grid-template-columns: minmax(0,6fr) minmax(0,3fr) minmax(0,4fr); gap: 20px;`
(container max-width 1520px and 48px padding unchanged; header and the 4
hero cards row unchanged).

**Column A (6fr)** — flex column, gap 20px:
- Card: Evolución del flujo neto (line chart), flex: 3.
- Card: Gastos por método de pago (bars), flex: 2.
- Both keep explicit chart-wrapper heights via flex sizing;
  `maintainAspectRatio: false` stays; dynamic 1-4 bar sizing rules from
  the ratified plan stay.

**Column B (3fr)** — flex column, gap 20px:
- Card: Gastos por categoría (doughnut, no legend), flex: 1 — this card
  absorbs ALL leftover vertical space; doughnut stays centered within it
  (its canvas wrapper keeps a fixed height, 312px, centered vertically).
- Card: Top categorías — natural content height. Keep the 3-across
  columns.
- Card: Pendientes — natural content height, directly below, no
  stretching, no dead space above or below it.

**Column C (4fr):**
- Card: "Flujo neto — últimos 12 meses" as ONE single table, 12 rows,
  full region height (grid stretch). Remove the 6+6 split and its
  vertical hairline entirely.
- Distribute rows to fill the card height evenly so the last row ends
  near the card bottom — no large empty band below the table.
- Columns Mes / Ingresos / Gastos / Neto, tabular-nums, right-aligned
  numerics, unchanged data.

**TABLET (769-1199px):** unchanged from the ratified plan — everything
stacks full-width in source order; the table renders as the same single
12-row table (no split logic remains anywhere).

### T3 — Mobile header (<=768px)

The ONLY mobile change (per ADR-0027 exception):
- Header becomes flex, space-between, baseline-aligned: "2penny" left at
  32px bold (Space Grotesk), period "2026-07" right, muted, on the same
  line.
- Verify no wrap at 395px viewport width.

Everything else at <=768px stays byte-identical in structure.

STOP CONDITION 1: any other mobile structural change required -> STOP.

### T4 — Gates & verification

1. `npm run check` + `npm run build` + tests: all pass, exit codes
   reported.
2. Screenshots: 1920x1080, 1280x800, 1024x768, 395x893. Verify at
   1920x1080: (a) column C table bottom aligns with column A bars-card
   bottom within ~24px; (b) no empty band around Pendientes; (c) no
   horizontal scroll at any width.
3. Handoff commit, push master, report deployment URL and final
   `git log --oneline` for the iteration.

### Stop conditions (the only two)

1. Mobile structure beyond the T3 header exception would be affected.
2. Resolving an ambiguity would materially change the visual contract
   above (three-column structure, card order, table unification).

Everything else: decide, proceed, log under DEVIATIONS.

## Iteration 3 (layout amendment v3)

Ratified verbatim as the governing instruction block for this amendment.
See `docs/DECISIONS.md` ADR-0028 for the full rationale: Iteration 2's
doughnut card grew oversized once its grid cell spanned Column A's full
row-track height while its canvas stayed a fixed 312px.

Amends Stage 10. Scope: `frontend/` + `docs/` ONLY. Backend, clasp,
webhook: forbidden. Does NOT deploy — production deploy is always
Camilo's manual wrangler step.

### T2 — Desktop layout v3 (>=1200px only)

Replace the 3-column region (6fr/3fr/4fr) with:
`grid-template-columns: minmax(0,2fr) minmax(0,1fr); gap: 20px; align-items: start;`
(container 1520px / 48px padding / header / hero row: unchanged)

**Column A (2fr)** — stack, gap 20px, exactly as today:
1. Evolución del flujo neto (line chart card).
2. Gastos por método de pago (bars card).

Keep current explicit wrapper heights (the 3:2 proportion from
Iteration 2 remains as fixed min-heights, 480px/320px);
`maintainAspectRatio: false` and the dynamic 1-4 bar rules stay.

**Column B (1fr)** — vertical stack, gap 20px, ALL cards natural content
height, none stretched, in this exact order:
1. Gastos por categoría (doughnut, no legend). No flex-grow / row-track
   stretching. Canvas wrapper: fixed height 280px, doughnut centered.
   Card height = title + wrapper + padding, nothing more.
2. Top categorías — 3 columns side by side, unchanged content. Natural
   height.
3. Flujo neto — últimos 12 meses: single 12-row table, compact ledger
   density: row height ~26-30px, font-size ~13px, tabular-nums,
   right-aligned numerics, hairline row separators. Current month row
   (last) gets font-weight 600. No fill-height distribution.
4. Pendientes — natural height, last in the stack.

Column bottoms do NOT need to align. No dead space inside any card.

**Tablet (769-1199px):** unchanged — single column, source order: line
chart, bars, doughnut, top categorías, table, pendientes.

### T3 — Mobile guard (<=768px)

Zero changes. Verify by DOM/structure check that mobile markup is
unaffected (carousel: 3 dots / 3 cards).

STOP CONDITION 1: any mobile structural impact -> STOP.

### T4 — Gates & verification

1. `npm run check` + `npm run build`: exit codes reported.
2. Playwright measurements at 1920x1080 and 1280x800: doughnut card
   height <= 380px; 20px gaps between Column B cards, no dead bands;
   no horizontal scroll/nested scrollbars at 1920/1280/1024/395; table
   rows within 26-30px height.
3. Handoff commit + push origin/master. Do not deploy.

### Stop conditions (the only two)

1. Mobile structure would be affected (T3).
2. An ambiguity whose resolution would change the contract above
   (column count, card order, natural-height rule).

Everything else: decide, proceed, log under DEVIATIONS.
