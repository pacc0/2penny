# DESIGN.md — Night Ledger v2

**Fuente de verdad de tokens (Verbatim Token Rule):**
`frontend/src/lib/styles/tokens.css` (Etapa 3) será copia verbatim de los
bloques de la sección §2 de este documento, marcada "do not edit directly".

## §1 North Star

**"The Night Ledger."** Un ledger casi negro donde el dinero mismo brilla:
el chrome estructural se retrae hacia neutros oscuros, y cada color en
pantalla carga un significado financiero. Geometría suave y redondeada
(cards, barras, segmentos de doughnut) mantiene la densidad amigable en vez
de clínica. Rechazado: dashboards estilo SaaS-crema claros, gradientes
decorativos, y cualquier color que decore en vez de informar.

Heredado de `docs/DESIGN.md` v1.3 del repo legacy (`pacc0/penny`).

## §2 Tokens (VERBATIM)

Bloque `:root` copiado verbatim de
`apps-script/DashboardPage.html` (repo legacy), líneas 13–45.

```css
:root {
  /* Do not edit directly — source: docs/DESIGN.md */
  --bg: #0B0B0D;
  --surface: #161619;
  --surface-raised: #1F1F24;
  --hairline: #26262B;
  --ink: #F0F0EE;
  --ink-muted: #9A9AA3;
  --ink-on-tint: #101014;
  --income-green: #3ECF8E;
  --income-green-tint: #BDE7CB;
  --expense-coral: #FF8A4C;
  --expense-coral-tint: #FFCBB0;
  --savings-teal: #26C6DA;
  --progress-amber: #FFC53D;
  --progress-amber-tint: #FFE7B0;
  --alert-red: #EF4444;
  --pending-grey: #C7C7CE;
  --pending-grey-bg: #2A2A30;
  --chart-extra-1: #8B8BF5;
  --chart-extra-2: #E36FB1;
  --font-text: 'Nunito Variable', 'Trebuchet MS', 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif;
  --font-numeric: 'Averia Sans Libre', 'Nunito Variable', 'Trebuchet MS', 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif;
  --rounded-sm: 6px;
  --rounded-md: 10px;
  --rounded-lg: 14px;
  --rounded-pill: 999px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

**Tipografía (verbatim, frontmatter de `docs/DESIGN.md` v1.3 legacy):**
`font-text` = Nunito Variable (rounded geometric sans, todo texto/labels/UI);
`font-numeric` = Averia Sans Libre (numerales; pesos 300/400/700 solo,
hero-KPI en 700). Columnas numéricas y tabla usan Nunito con
`font-variant-numeric: tabular-nums` (Averia es proporcional, no uniforme —
solo vale para el valor único de una hero/KPI card).

**Paleta de 14 categorías (verbatim, `docs/DESIGN.md` §2 legacy):**
- Obligación Mamá 👩 — `#F472B6`
- Obligación Papá 👨 — `#4F8EF7`
- Vivienda / Arriendo 🏠 — `#8B5CF6`
- Servicios ⚡ — `#FACC15`
- Suscripciones 🔄 — `#6366F1`
- Alimentación 🛒 — `#22C55E`
- Restaurantes / Domicilios 🍽️ — `#FB923C`
- Transporte 🚗 — `#A63F99`
- Compras Personales 🛍️ — `#D946EF`
- Salud / Bienestar 🩺 — `#8B1E3F`
- Mascotas 🐾 — `#84CC16`
- Viajes ✈️ — `#0EA5E9`
- Ocio / Entretenimiento 🎮 — `#3EA630`
- Imprevistos / Emergencias 🚨 — `#F59E0B`

## §3 Responsive

Dos breakpoints heredados de la doctrina legacy: **768px** y **480px**
(single user, tres contextos: desktop, tablet/phone-landscape,
phone-portrait). Dispositivo de referencia para el contexto más ajustado:
Samsung Galaxy A56 5G (395×893 CSS viewport).

**Re-derivación de Etapa 5 (ratificada por Camilo 2026-07-12; revisada por
Camilo en la sesión de ejecución del mismo día — carousel confirmado):**
grid de KPIs 4-up (≥769px) → 2×2 (≤768px) → en **≤480px las KPI cards SÍ
heredan el carousel scroll-snap del legacy** (implementación de referencia:
`backend/src/DashboardPage.html`, UI-3 Rounds 13–15): track flex con
`overflow-x: auto` + `scroll-snap-type: x mandatory`, un slide por página
(`flex: 0 0 100%`, `scroll-snap-align: center`), scrollbar oculto, dots
indicadores debajo (`--ink-muted`; activo `--progress-amber`), wrap con
`min-width: 0` para no reventar la columna (fix Round 15). El fold del
pending-hero al badge NO se hereda: el nuevo shell no tiene pending-hero
(pendientes es una sección ledger con empty state "al día", decisión C del
plan de Etapa 5). Contenido ancho (tabla de 12 meses) scrollea horizontal
dentro de su propio contenedor; el body de la página nunca scrollea
horizontal.

## §4 Anti-slop / Taste

- Los tokens Night Ledger son la ÚNICA fuente de color, espaciado, radio y
  tipografía. Si falta un token: STOP y preguntar; nunca inventar.
- **Prohibiciones (cada una es un FAIL):** paletas genéricas de IA
  (indigo/violeta/morado sobre blanco, look SaaS por defecto); gradientes
  decorativos o efectos glow/neón; emoji como iconos (solo SVG y solo
  funcionales); look default shadcn/Tailwind o drop-shadow uniforme en
  todas las cards; Inter/Roboto/Arial/system-font como tipografía display;
  iconos decorativos sin función.
- **Excepción única de gradiente — luminancia (ADR-0015):** se permiten
  linear gradients cuyos DOS extremos son tokens de superficie existentes
  (`--surface` → `--surface-raised`, o cualquiera de los dos → `--bg`),
  solo para sugerir caída de luz en cards/superficies. Los gradientes de
  matiz (hue) siguen siendo FAIL duro; los decorativos de cualquier color
  saturado, también. Glassmorphism / `backdrop-filter`: FAIL duro SIN
  excepciones, incluidos sticky headers (ADR-0015).
- **Mandatos:** cifras con `tabular-nums`; columnas numéricas/ledger usan
  `var(--font-text)` (Nunito) + `font-variant-numeric: tabular-nums` — sin
  monospace; `var(--font-numeric)` (Averia, proporcional — spike del
  ADR-0003 legacy) queda reservada para la cifra única de una hero/KPI card
  (decisión A, Etapa 5); alto contraste, densidad profesional estética
  terminal/ledger; jerarquía por tamaño/peso/espacio, no por ruido de
  color. Anclas positivas: densidad terminal/ledger, densidad informativa
  tipo Bloomberg, contención tipo Linear/Vercel.

## §5 Components

Ported verbatim from legacy `docs/DESIGN.md` v1.3 (`pacc0/penny`) §5
"Components" at Stage 6 Commit 0a. The option mappings and the touch-tooltip
pattern remain **binding verbatim**.

> **2penny delivery amendment (Stage 6, ADR-0018):** Chart.js 4.5.1 now
> enters via npm exact pin (`--save-exact`) + tree-shaken manual registration
> (`frontend/src/lib/charts/registry.ts`). Any CDN/jsdelivr delivery clause
> is legacy-scoped and does not apply to 2penny.

Everything below maps to real Chart.js 4.x options or plain CSS — nothing requires plugins or extra libraries.

**Layout spacing comes from the spacing scale:** page padding `spacing.xl`, grid/row gaps `spacing.lg` on desktop and `spacing.md` below the breakpoint, intra-card gaps (label-to-value, icon-to-text) `spacing.xs`–`spacing.sm`, card padding `{spacing.md} {spacing.lg}`. Badge padding is optical, set per-component, and exempt from the scale.

- **KPI cards:** Surface background, Hairline border, `rounded.lg` (14px), label above display value. Hero cards (Gastos; Flujo Neto) use the pastel-tint surfaces with `ink-on-tint` text per the Two-Volume Rule; Flujo Neto swaps green-tint/coral-tint by sign via a CSS class.
- **Progress bars:** 10px-high track in Raised, `rounded.pill` fill colored by threshold — Alert Red <50%, Progress Amber 50–90%, Income Green >90% (carried from DASHBOARD.md §Row 2).
- **Badges:** `badge-pending` pill, Label type. One meaning = one color, matching the charts.
- **Pending table:** Hairline row separators only (no zebra), Raised header, amounts right-aligned tabular. Dates remain stored and transported as ISO 8601 (`YYYY-MM-DD`, unchanged); on-screen the pending table and the trend-line axis both trim display to day + abbreviated es-CO month, no year (e.g. "21 Jul") — a prototype-iteration crowding fix, Camilo-approved.
- **Charts (Chart.js 4.5.1 mapping):** rounded bars = `borderRadius: 6` + `borderSkipped: false` on the bar dataset; rounded doughnut segments = `borderRadius: 6` + `spacing: 2` on the doughnut dataset; typeface = `Chart.defaults.font.family` set to the body stack; ink/grid = `Chart.defaults.color` = Ink Muted and grid lines at Hairline. Series mapping, frozen at UI-3: **Gastos por Categoría** = doughnut, per-category `CATEGORY_COLOR` palette (§2), no legend, emoji-title tooltips (§2's emoji map, name fallback for anything unmapped); **Gastos por Método de Pago** = horizontal bar (`indexAxis: 'y'`), single-series Expense Coral; **Evolución del Flujo Neto** (cumulative line) unchanged — Income Green, `tension: 0.3`, sign read from the axis rather than a segment-color flip. Chart Extra 1/2 are currently unused by any chart — retained as documented series fillers for a future doughnut needing more than the semantic five hues (Camilo-approved keep, not dead tokens to prune).

- **Touch tooltips — required pattern for any chart with a tooltip:** Chart.js's own default touch binding (touchstart/touchmove inside `options.events`) is passive and unreliable on real devices — confirmed via on-device diagnostic that hit-testing itself was not the problem. Every chart with a tooltip therefore restricts `options.events` to `['mousemove', 'mouseout', 'click']` (mouse-only; desktop hover is unaffected) and drives all touch interaction through one shared helper, `enableTapTooltip(chart, canvas, mode)` (defined once in apps-script/DashboardPage.html). The helper adds a non-passive `touchstart` listener that runs `chart.getElementsAtEventForMode(evt, mode, { intersect: false }, true)`, sets the resulting elements active, and calls `preventDefault`; a second, document-level `touchstart` listener dismisses the tooltip on any tap outside the chart's canvas. `mode` matches whatever interaction mode the chart already uses (`'index'` for the line chart, `'nearest'` for the bar and doughnut charts); `intersect` is always `false`. Applied identically to all three charts with tooltips — Evolución del Flujo Neto (line), Gastos por Método de Pago (bar), Gastos por Categoría (doughnut). Any future chart added to this dashboard that needs a tooltip must reuse this helper rather than re-implementing touch handling.

## §6 Do's and Don'ts

Ported verbatim from legacy `docs/DESIGN.md` v1.3 (`pacc0/penny`) §6 at
Stage 6 Commit 0a. Sandbox-era delivery phrasing is legacy-scoped; the
semantic rules remain binding.

### Do:
- **Do** trace every colored element to one semantic token; a reviewer should name the meaning from the hue alone.
- **Do** keep black-on-pastel text at ≥ 4.5:1 (current worst case 13.0:1) and re-verify if any tint changes.
- **Do** express everything as vanilla CSS custom properties + Chart.js 4.x options inside the HtmlService sandbox.
  - *2penny scope note (Stage 6, ADR-0018): the HtmlService sandbox is legacy-only. In 2penny this rule reads: vanilla CSS custom properties (`tokens.css`) + Chart.js 4.x options inside Svelte 5 components; the four semantic hues feeding chart configs are bridged via the `token()` helper (ADR-0018 D6), never retyped.*
- **Do** keep all labels Spanish, identifiers English, dates ISO 8601 in storage/payload with day + abbreviated month on display, COP with thousands separators and no decimals (DASHBOARD.md §3.4).

### Don't:
- **Don't** use pure red (#EF4444) for anything except over-budget and <50% progress.
- **Don't** let Savings Teal drift green or Income Green drift teal — saving must never read as income.
- **Don't** add frameworks, build steps, chart plugins, or any JS library beyond Chart.js 4.5.1.
- **Don't** use box-shadows, gradients (including gradient text), side-stripe borders, nested cards, or uppercase tracked eyebrows.
- **Don't** add, remove, or redefine any KPI, metric, or data element — DASHBOARD.md v2.2 and DATA_MODEL.md v1.3 own content; this file owns only how it looks.
