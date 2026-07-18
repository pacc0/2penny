<script>
	import { Chart, token } from '$lib/charts/registry';
	import { enableTapTooltip } from '$lib/charts/tapTooltip';
	import { formatCOP, formatCompactCOP } from '$lib/format.js';

	// Labels/values are pre-formatted by the caller (+page.svelte), which
	// picks daily_net_flow (contract 1.1, ADR-0023) or falls back to
	// net_flow_series (R3, monthly) when daily_net_flow is absent/malformed
	// (D3) — this component stays shape-agnostic, no monthly semantics here.
	/** @type {{ labels: string[], values: number[] }} */
	let { labels, values } = $props();

	/** @type {HTMLCanvasElement} */
	let canvas;

	// Evolución del Flujo Neto — line, Income Green, tension 0.3. Config
	// logic-verbatim from the legacy reference (backend/src/DashboardPage.html).
	$effect(() => {
		const chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						data: values,
						borderColor: token('--income-green'),
						backgroundColor: token('--income-green'),
						borderWidth: 2,
						pointRadius: 0,
						pointHoverRadius: 4,
						tension: 0.3
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				events: ['mousemove', 'mouseout', 'click'], // touch driven by enableTapTooltip below
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: (ctx) => formatCOP(ctx.parsed.y ?? 0) } }
				},
				scales: {
					x: {
						grid: { display: false },
						border: { display: false },
						ticks: { maxTicksLimit: 8, maxRotation: 0 }
					},
					y: {
						grid: { color: token('--hairline') },
						border: { display: false },
						ticks: { callback: (value) => formatCompactCOP(Number(value)) }
					}
				}
			}
		});
		const teardownTap = enableTapTooltip(chart, canvas, 'index');
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
	<canvas bind:this={canvas} role="img" aria-label="Evolución del Flujo Neto"></canvas>
</div>

<style>
	/* Legacy .chart-wrap--line: flex:1 fills the card, min-height 240px.
	   ≤480px: fixed 320px (R4, ratified 2026-07-13 post-authenticated-check,
	   supersedes R2's 240px) — the carousel track stretches every slide to
	   the tallest (bar, 320px), so 240px left 81px dead space in the card. */
	.chart-wrap {
		position: relative;
		flex: 1;
		min-height: 240px;
	}

	@media (max-width: 480px) {
		.chart-wrap {
			flex: none;
			height: 320px;
			min-height: 0;
		}
	}
</style>
