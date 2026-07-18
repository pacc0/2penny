<script>
	import { Chart, token } from '$lib/charts/registry';
	import { enableTapTooltip } from '$lib/charts/tapTooltip';
	import { CATEGORY_COLOR, CATEGORY_EMOJI, CATEGORY_SHORT } from '$lib/charts/palette';
	import { formatCOP } from '$lib/format.js';

	/** @type {{ rows: Array<{ category: string, amount: number }> }} */
	let { rows } = $props();

	/** @type {HTMLCanvasElement} */
	let canvas;

	// Legacy formatPct read settings.percentagePrecision (Settings sheet);
	// contract v1.0 carries no settings object — precision fixed at 1
	// (adaptation, same class as the Task 1/2 contract-key notes).
	/** @param {number} n */
	const formatPct = (n) => (n * 100).toFixed(1) + '%';

	// Gastos por Categoría — doughnut, fixed per-category palette per
	// DESIGN.md §2 "Category Colors" (locked 2026-07-05). No legend —
	// category identification is tooltip-only: emoji title + amount and
	// percentage body. Config logic-verbatim from the legacy reference
	// (backend/src/DashboardPage.html); data keys adapted to contract v1.0
	// (expenses_by_category rows carry category/amount vs legacy
	// category/total). An unmapped category renders in --ink-muted and
	// keeps its name as the tooltip title — degraded, never broken.
	$effect(() => {
		const colors = rows.map(
			(row) =>
				CATEGORY_COLOR[/** @type {import('$lib/charts/palette').ExpenseCategory} */ (row.category)] ||
				token('--ink-muted')
		);
		const total = rows.reduce((sum, row) => sum + row.amount, 0);
		const chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels: rows.map((row) => row.category),
				datasets: [
					{
						data: rows.map((row) => row.amount),
						backgroundColor: colors,
						borderRadius: 6,
						spacing: 2,
						borderWidth: 0
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				layout: { padding: 0 }, // ADR-0029: canvas fills the wrapper edge-to-edge
				cutout: '58%', // legacy note: was 62% — ring thickness (1-cutout) up ~10%
				// No interaction key — legacy-verbatim: the doughnut uses Chart.js
				// defaults (nearest, intersect true) for mouse hover; intersect:false
				// exists only inside enableTapTooltip's manual touch hit test.
				// Mouse-only: touch is driven entirely by enableTapTooltip below
				// (legacy race fix — Chart's own passive touch binding cleared the
				// manually-set active elements mid-tap).
				events: ['mousemove', 'mouseout', 'click'],
				plugins: {
					legend: { display: false },
					tooltip: {
						displayColors: false,
						callbacks: {
							// Stage 7: emoji + short name (D2 content consciously superseded,
							// stage-7-cutover plan). Unmapped category keeps its full name.
							title: (items) => {
								const name = /** @type {import('$lib/charts/palette').ExpenseCategory} */ (
									items[0].label
								);
								const emoji = CATEGORY_EMOJI[name];
								const short = CATEGORY_SHORT[name];
								return emoji && short ? emoji + ' ' + short : name;
							},
							label: (ctx) => formatCOP(ctx.parsed) + ' (' + formatPct(ctx.parsed / total) + ')'
						}
					}
				}
			}
		});
		const teardownTap = enableTapTooltip(chart, canvas, 'nearest');
		return () => {
			teardownTap();
			chart.destroy();
		};
	});
</script>

<div class="chart-wrap">
	<!-- role="img" + aria-label is the correct exposure for a canvas chart
	     (legacy pattern); Svelte's lint disagrees on canvas semantics. -->
	<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
	<canvas bind:this={canvas} role="img" aria-label="Gastos por Categoría"></canvas>
</div>

<style>
	/* Legacy .chart-wrap--doughnut: 312px desktop (+20% over the 260px
	   baseline), 280px below 768px (width-constrained there, the full
	   height would only add empty space) — the 280px is also the ratified
	   ≤480px slide height (plan v2 table, R2). */
	.chart-wrap {
		position: relative;
		height: 312px;
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.chart-wrap {
			height: 280px;
		}
	}

	/* ADR-0030: standalone card (out of the carousel) — fixed square
	   aspect, width-capped so the card can't grow disproportionately
	   tall on the A56, centered. Chart.js centers the ring's circle in
	   the canvas (radius = min dimension), so it can never render as an
	   ellipse at any width. */
	@media (max-width: 480px) {
		.chart-wrap {
			height: auto;
			aspect-ratio: 1 / 1;
			width: 100%;
			max-width: 280px;
			margin-inline: auto;
		}
	}

	/* >=1200px (ADR-0030, Iteration 5): the doughnut card is Column B's
	   flexible absorber — the wrap fills whatever height the column
	   grants (card-level 180px floor lives in +page.svelte); the circle
	   centers inside the canvas per the Chart.js note above. */
	@media (min-width: 1200px) {
		.chart-wrap {
			height: auto;
			flex: 1;
			min-height: 0;
		}
	}
</style>
