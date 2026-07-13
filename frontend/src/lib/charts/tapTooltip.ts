import type { Chart, InteractionMode } from 'chart.js';

// Real-device tap fix, shared by all three charts with a tooltip (line, bar,
// donut). Logic-verbatim port of the legacy enableTapTooltip
// (backend/src/DashboardPage.html): Chart.js's own default touch binding
// (touchstart/touchmove in `events`) is passive — it never calls
// preventDefault — so on some real devices the browser's scroll/gesture
// disambiguation can swallow or delay the touch before Chart's own handler
// reliably fires at all (confirmed via on-device diagnostic: hit-testing was
// fine, the built-in handler just wasn't consistently running). Each chart
// drops touch out of its own `events` (mouse-only — zero desktop impact) and
// this helper becomes the sole, explicit touch driver: non-passive
// `touchstart` + manual hit test + preventDefault. `mode` matches whatever
// interaction mode the chart already uses ('index' for the line chart,
// 'nearest' for bar/donut) — intersect is always false here since
// exact-target precision is what breaks touch.
//
// Lifecycle adaptation (ADR-0018 D7): returns a teardown removing BOTH
// listeners. The legacy page never unmounts; Svelte components do — the
// document-level dismiss listener must not leak across mounts.
export function enableTapTooltip(
  chart: Chart,
  canvas: HTMLCanvasElement,
  mode: InteractionMode
): () => void {
  const onCanvasTouch = (evt: TouchEvent) => {
    const points = chart.getElementsAtEventForMode(evt, mode, { intersect: false }, true);
    chart.tooltip?.setActiveElements(
      points.map((p) => ({ datasetIndex: p.datasetIndex, index: p.index })),
      // getCenterPoint exists at runtime but is missing from chart.js's public Element type.
      points.length
        ? (points[0].element as unknown as { getCenterPoint(): { x: number; y: number } }).getCenterPoint()
        : { x: 0, y: 0 }
    );
    chart.update();
    evt.preventDefault();
  };
  // Tap anywhere outside this chart dismisses its tooltip.
  const onDocumentTouch = (evt: TouchEvent) => {
    if (canvas.contains(evt.target as Node)) return;
    chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
    chart.update();
  };
  canvas.addEventListener('touchstart', onCanvasTouch, { passive: false });
  document.addEventListener('touchstart', onDocumentTouch, { passive: true });
  return () => {
    canvas.removeEventListener('touchstart', onCanvasTouch);
    document.removeEventListener('touchstart', onDocumentTouch);
  };
}
