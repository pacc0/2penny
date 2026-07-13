<script>
	import { Chart, token } from '$lib/charts/registry';
	import { enableTapTooltip } from '$lib/charts/tapTooltip';
	import { formatCOP, formatCompactCOP } from '$lib/format.js';

	/** @type {{ rows: Array<{ account: string, amount: number }> }} */
	let { rows } = $props();

	/** @type {HTMLCanvasElement} */
	let canvas;

	// Gastos por Método de Pago — horizontal bars, Expense Coral, rounded per
	// DESIGN.md §5. Config logic-verbatim from the legacy reference
	// (backend/src/DashboardPage.html); data keys adapted to contract v1.0
	// (expenses_by_account rows carry account/amount vs legacy account/total).
	$effect(() => {
		const chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: rows.map((row) => row.account),
				datasets: [
					{
						data: rows.map((row) => row.amount),
						backgroundColor: token('--expense-coral'),
						borderRadius: 6,
						borderSkipped: false
					}
				]
			},
			options: {
				indexAxis: 'y',
				maintainAspectRatio: false,
				interaction: { mode: 'nearest', intersect: true },
				events: ['mousemove', 'mouseout', 'click'], // touch driven by enableTapTooltip below
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: (ctx) => formatCOP(ctx.parsed.x ?? 0) } }
				},
				scales: {
					x: {
						grid: { color: token('--hairline') },
						border: { display: false },
						ticks: { callback: (value) => formatCompactCOP(Number(value)) }
					},
					y: {
						grid: { display: false },
						border: { display: false },
						ticks: {
							callback: function (value) {
								const label = this.getLabelForValue(Number(value));
								return label.length > 18 ? label.slice(0, 17) + '…' : label;
							}
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
	<canvas bind:this={canvas} role="img" aria-label="Gastos por Método de Pago"></canvas>
</div>

<style>
	/* Legacy .chart-wrap--bar: fixed 320px, flex-shrink 0. The same 320px is
	   the ratified ≤480px slide height (plan v2 table, R2), so no media
	   override is needed. */
	.chart-wrap {
		position: relative;
		height: 320px;
		flex-shrink: 0;
	}
</style>
