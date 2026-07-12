---
name: design-tokens
description: Use when writing or editing ANY CSS/visual code — enforces the
  Verbatim Token Rule and anti-slop directives.
---
# design-tokens

Night Ledger tokens from frontend/src/lib/styles/tokens.css are the ONLY source
of color, spacing, radius and type. Never invent values. If a token is missing,
STOP and ask. Source of truth: /docs/DESIGN.md.

## Anti-slop directives (enforced at code-writing time)

HARD PROHIBITIONS (each is a fail):
- No generic/AI-default palettes: no indigo/violet/purple gradients, no
  purple-on-white SaaS look.
- No decorative gradients or glow/neon effects. Sole exception (ADR-0015):
  luminance linear-gradients whose BOTH endpoints are existing surface
  tokens (--surface ↔ --surface-raised, or either → --bg); hue gradients
  remain a fail. No backdrop-filter/glassmorphism, no exceptions (ADR-0015).
- No emoji as icons — SVG only, and only when functional.
- No default shadcn/Tailwind look; no uniform drop-shadow on every card.
- No Inter/Roboto/Arial/system-font default for display type.
- No decorative icons without a function.

MANDATES:
- Figures use tabular-nums; ledger/numeric columns use var(--font-text)
  (Nunito) + tabular-nums — no monospace. var(--font-numeric) (Averia,
  proportional) is for single-value hero figures only (Stage 5 decision A).
- High contrast, dense, professional "ledger/terminal" aesthetic.
- Hierarchy via size/weight/space, not via color noise.
- Positive anchors: terminal/ledger density, Bloomberg-like information
  density, Linear/Vercel restraint.
Reference of record: /docs/DESIGN.md (Anti-slop / Taste section).
