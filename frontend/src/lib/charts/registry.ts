// Single Chart.js registration module (ADR-0018): tree-shaken manual
// registration — only what the three contracted charts use.
import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from 'chart.js';

Chart.register(
  LineController,
  BarController,
  DoughnutController,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

// Semantic-hue bridge (ADR-0018 D6): getComputedStyle read once, cached —
// legacy pattern. tokens.css stays the single source of truth; no value
// is ever retyped here.
let rootStyle: CSSStyleDeclaration | undefined;
export function token(name: string): string {
  rootStyle ??= getComputedStyle(document.documentElement);
  return rootStyle.getPropertyValue(name).trim();
}

// Chart.js defaults per DESIGN.md §5, logic-verbatim from the legacy
// reference (backend/src/DashboardPage.html): restrained load/update
// animation, fully disabled under prefers-reduced-motion. Guarded: charts
// are client-only, but SvelteKit still evaluates this module during SSR.
if (typeof document !== 'undefined') {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Chart.defaults.font.family = token('--font-text');
  Chart.defaults.font.size = 12;
  Chart.defaults.font.weight = 700;
  Chart.defaults.color = token('--ink-muted');
  Chart.defaults.animation = reducedMotion ? false : { duration: 400, easing: 'easeOutQuad' };
}

export { Chart };
