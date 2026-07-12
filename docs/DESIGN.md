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
Samsung Galaxy A56 5G (395×893 CSS viewport). Nota: los detalles de layout
(grids, filas, carousels) se re-derivan en la Etapa 5; aquí solo se hereda
la doctrina de breakpoints, no la implementación de layout legacy.

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
- **Mandatos:** cifras con `tabular-nums`; monospace en columnas
  numéricas/ledger; alto contraste, densidad profesional estética
  terminal/ledger; jerarquía por tamaño/peso/espacio, no por ruido de
  color. Anclas positivas: densidad terminal/ledger, densidad informativa
  tipo Bloomberg, contención tipo Linear/Vercel.
