<script>
	import { formatCurrency, formatDayMonth, formatMonthAbbr } from '$lib/format.js';
	import { CATEGORY_COLOR, CATEGORY_SHORT } from '$lib/charts/palette';
	import NetFlowChart from '$lib/components/NetFlowChart.svelte';
	import PaymentMethodChart from '$lib/components/PaymentMethodChart.svelte';
	import CategoryChart from '$lib/components/CategoryChart.svelte';

	/** @type {{ data: { payload: Promise<import('$lib/contract.js').DashboardContract> } }} */
	let { data } = $props();

	// ≤480px carousel dot sync (legacy DashboardPage.html Round 14 pattern).
	// Harmless at desktop: the track is display:contents there, never scrolls.
	let activeSlide = $state(0);
	/** @param {Event} e */
	function syncDots(e) {
		const t = /** @type {HTMLElement} */ (e.currentTarget);
		activeSlide = Math.round(t.scrollLeft / t.clientWidth);
	}

	// Chart carousel (Stage 6): own scroll state, same dot pattern.
	let activeChartSlide = $state(0);
	/** @param {Event} e */
	function syncChartDots(e) {
		const t = /** @type {HTMLElement} */ (e.currentTarget);
		activeChartSlide = Math.round(t.scrollLeft / t.clientWidth);
	}
</script>

{#snippet errorState(/** @type {string} */ code)}
	<!-- Error restraint (Task 7): title + one line naming the contract
	     error value verbatim; --alert-red on the status word only. The
	     proxy never forwards upstream URL/body, so nothing secret can
	     render here. -->
	<div class="state">
		<svg class="state-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
			<path d="M8 1.5 15 14H1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
			<path d="M8 6v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			<circle cx="8" cy="12" r="0.9" fill="currentColor" />
		</svg>
		<div>
			<p class="state-title">No se pudo cargar el tablero</p>
			<p class="state-line">El servidor respondió <span class="error-word">{code}</span>.</p>
		</div>
	</div>
{/snippet}

<main>
	{#await data.payload}
		<!-- Skeleton mirrors the real layout (zero CLS): header, 4 KPI ghost
		     cards, ghost list rows, 12 ghost table rows. -->
		<header>
			<h1>2penny</h1>
			<p class="period"><span class="ghost ghost-period">&nbsp;</span></p>
		</header>

		<section class="kpis">
			<div class="carousel-wrap">
				<div class="carousel-track" onscroll={syncDots}>
					{#each Array(4) as _, i (i)}
						<div class="kpi">
							<span class="label"><span class="ghost ghost-label">&nbsp;</span></span>
							<span class="hero"><span class="ghost ghost-value">&nbsp;</span></span>
							<span class="delta"><span class="ghost ghost-delta">&nbsp;</span></span>
						</div>
					{/each}
				</div>
				<div class="carousel-dots" aria-hidden="true">
					{#each Array(4) as _, i (i)}
						<span class="dot" class:active={i === activeSlide}></span>
					{/each}
				</div>
			</div>
		</section>

		<section>
			<h2>Gastos por categoría</h2>
			<div class="top3">
				{#each Array(3) as _, i (i)}
					<div class="top3-cell">
						<span class="label"><span class="ghost ghost-label">&nbsp;</span></span>
						<span class="top3-pct"><span class="ghost ghost-delta">&nbsp;</span></span>
						<div class="top3-track"></div>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2>Gastos por cuenta</h2>
			<ul>
				{#each Array(3) as _, i (i)}
					<li><span class="ghost ghost-row">&nbsp;</span></li>
				{/each}
			</ul>
		</section>

		<!-- Chart carousel skeleton mirrors the real chart cards (zero CLS):
		     same cards, ghosts at each chart wrap's fixed height. -->
		<section>
			<div class="carousel-wrap">
				<div class="carousel-track">
					<div class="chart-card">
						<h2>Evolución del flujo neto</h2>
						<span class="ghost ghost-chart">&nbsp;</span>
					</div>
					<div class="chart-card">
						<h2>Gastos por método de pago</h2>
						<span class="ghost ghost-chart-bar">&nbsp;</span>
					</div>
					<div class="chart-card">
						<h2>Gastos por categoría</h2>
						<span class="ghost ghost-chart-doughnut">&nbsp;</span>
					</div>
				</div>
				<div class="carousel-dots" aria-hidden="true">
					{#each Array(3) as _, i (i)}
						<span class="dot" class:active={i === 0}></span>
					{/each}
				</div>
			</div>
		</section>

		<section>
			<h2>Flujo neto — últimos 12 meses</h2>
			<div class="table-scroll">
				<table>
					<thead>
						<tr><th>Mes</th><th class="num">Ingresos</th><th class="num">Gastos</th><th class="num">Neto</th></tr>
					</thead>
					<tbody>
						{#each Array(12) as _, i (i)}
							<tr>
								<td><span class="ghost">&nbsp;</span></td>
								<td><span class="ghost">&nbsp;</span></td>
								<td><span class="ghost">&nbsp;</span></td>
								<td><span class="ghost">&nbsp;</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section>
			<h2>Pendientes</h2>
			<ul>
				{#each Array(3) as _, i (i)}
					<li><span class="ghost ghost-row">&nbsp;</span></li>
				{/each}
			</ul>
		</section>
	{:then payload}
		{@const fmt = (/** @type {number} */ amount) => formatCurrency(amount, payload.period.currency)}
		{#if payload.error}
			{@render errorState(payload.error)}
		{:else}
			<header>
				<h1>2penny</h1>
				<p class="period">{payload.period.month} · generado {payload.generated_at}</p>
			</header>

			<!-- KPI deltas: last vs. previous net_flow_series row. Verified in
			     backend Api.js: series[11].month === period.month by
			     construction (same todayIso builds both). Savings: month vs
			     monthly_goal. -->
			{@const curr = payload.net_flow_series[payload.net_flow_series.length - 1]}
			{@const prev = payload.net_flow_series[payload.net_flow_series.length - 2]}
			{@const deltas = [
				{ label: 'Ingresos', value: payload.kpis.income, d: curr.income - prev.income, favorableUp: true, note: 'vs mes anterior' },
				{ label: 'Gastos', value: payload.kpis.expenses, d: curr.expenses - prev.expenses, favorableUp: false, note: 'vs mes anterior' },
				{ label: 'Flujo neto', value: payload.kpis.net_flow, d: curr.net_flow - prev.net_flow, favorableUp: true, note: 'vs mes anterior' },
				{ label: 'Ahorro', value: payload.kpis.savings.month, d: payload.kpis.savings.month - payload.kpis.savings.monthly_goal, favorableUp: true, note: 'vs meta' }
			]}
			<section class="kpis">
				<div class="carousel-wrap">
					<div class="carousel-track" onscroll={syncDots}>
						{#each deltas as card (card.label)}
							{@const favorable = card.favorableUp ? card.d >= 0 : card.d <= 0}
							<div class="kpi">
								<span class="label">{card.label}</span>
								<span class="hero">{fmt(card.value)}</span>
								<span class="delta" class:favorable class:unfavorable={!favorable}>
									{#if card.d >= 0}
										<svg viewBox="0 0 8 8" width="8" height="8" aria-hidden="true"><path d="M4 1l3.5 6h-7z" fill="currentColor" /></svg>
									{:else}
										<svg viewBox="0 0 8 8" width="8" height="8" aria-hidden="true"><path d="M4 7L0.5 1h7z" fill="currentColor" /></svg>
									{/if}
									{card.d >= 0 ? '+' : '−'}{fmt(Math.abs(card.d))}
									<span class="delta-note">{card.note}</span>
								</span>
							</div>
						{/each}
					</div>
					<div class="carousel-dots" aria-hidden="true">
						{#each Array(4) as _, i (i)}
							<span class="dot" class:active={i === activeSlide}></span>
						{/each}
					</div>
				</div>
			</section>

			<!-- Top-3 categories (Stage 7 + Stage 9 A3 three-link chain):
			     1) current month has data -> normal Top-3 (share of current
			        month's total expenses).
			     2) current month empty, previous_month has data (contract 1.1,
			        ADR-0023) -> fallback to previous month's Top-3, share of
			        ITS total (not current month's, which is 0), with a visible
			        month label. Defensive (D3): previous_month absent/malformed
			        degrades to (), same as pre-amendment.
			     3) both empty -> Stage 7's dignified empty state (plan R1):
			        three dash rows, 0%, empty bar. -->
			{@const currentTop3 = payload.expenses_by_category.slice(0, 3)}
			{@const previousCategories = Array.isArray(payload.previous_month?.expenses_by_category)
				? payload.previous_month.expenses_by_category
				: []}
			{@const previousTotal = previousCategories.reduce((sum, row) => sum + row.amount, 0)}
			{@const previousTop3 = previousCategories.slice(0, 3)}
			{@const top3Mode = currentTop3.length > 0 ? 'current' : previousTop3.length > 0 ? 'previous' : 'empty'}
			{@const top3Rows = top3Mode === 'current' ? currentTop3 : previousTop3}
			{@const top3Total = top3Mode === 'current' ? payload.kpis.expenses : previousTotal}
			<section>
				<h2>Gastos por categoría</h2>
				{#if top3Mode === 'previous'}
					<!-- Copy provisional, Camilo's to finalize (same convention as
					     the Pending caught-up state above). -->
					<p class="top3-note">
						Mostrando {formatMonthAbbr(payload.previous_month.month)} {payload.previous_month.month.substring(0, 4)}
						— sin gastos registrados este mes
					</p>
				{/if}
				<div class="top3">
					{#if top3Mode !== 'empty'}
						{#each top3Rows as row (row.category)}
							{@const short =
								CATEGORY_SHORT[
									/** @type {import('$lib/charts/palette').ExpenseCategory} */ (row.category)
								] ?? row.category}
							{@const fill =
								CATEGORY_COLOR[
									/** @type {import('$lib/charts/palette').ExpenseCategory} */ (row.category)
								] ?? 'var(--ink-muted)'}
							{@const share = row.amount / top3Total}
							<div class="top3-cell">
								<span class="label">{short}</span>
								<span class="top3-pct">{(share * 100).toFixed(1)}%</span>
								<div class="top3-track">
									<div class="top3-fill" style="width: {share * 100}%; background: {fill};"></div>
								</div>
							</div>
						{/each}
					{:else}
						{#each Array(3) as _, i (i)}
							<div class="top3-cell">
								<span class="label">—</span>
								<span class="top3-pct">0%</span>
								<div class="top3-track"></div>
							</div>
						{/each}
					{/if}
				</div>
			</section>

			<section>
				<h2>Gastos por cuenta</h2>
				<ul>
					{#each payload.expenses_by_account as row (row.account)}
						<li><span>{row.account}</span><span class="value expense-amt">−{fmt(row.amount)}</span></li>
					{/each}
				</ul>
			</section>

			<!-- Charts (Stage 6): carousel structure per D5 — desktop unwraps via
			     display:contents (no carousel there); ≤480px the track scrolls
			     with fixed-height slides (R2) and dots. -->
			<!-- Net-flow line (Stage 9, ADR-0023 D1/D3): daily_net_flow when
			     present (contract 1.1) restores the daily x-axis (R3 target
			     state); defensive fallback to net_flow_series (monthly, R3
			     concession) if daily_net_flow is absent/malformed — the
			     pre-amendment behavior, no version gate. "Today" always comes
			     from the series' own last entry, never new Date(). -->
			{@const dailySeries = Array.isArray(payload.daily_net_flow) && payload.daily_net_flow.length > 0
				? payload.daily_net_flow
				: null}
			{@const netFlowLabels = dailySeries
				? dailySeries.map((row) => formatDayMonth(row.date))
				: payload.net_flow_series.map((row) => formatMonthAbbr(row.month))}
			{@const netFlowValues = dailySeries
				? dailySeries.map((row) => row.value)
				: payload.net_flow_series.map((row) => row.net_flow)}
			<section>
				<div class="carousel-wrap">
					<div class="carousel-track" onscroll={syncChartDots}>
						<div class="chart-card">
							<h2>Evolución del flujo neto</h2>
							<NetFlowChart labels={netFlowLabels} values={netFlowValues} />
						</div>
						<div class="chart-card">
							<h2>Gastos por método de pago</h2>
							<PaymentMethodChart rows={payload.expenses_by_account} />
						</div>
						<div class="chart-card">
							<h2>Gastos por categoría</h2>
							<CategoryChart rows={payload.expenses_by_category} />
						</div>
					</div>
					<div class="carousel-dots" aria-hidden="true">
						{#each Array(3) as _, i (i)}
							<span class="dot" class:active={i === activeChartSlide}></span>
						{/each}
					</div>
				</div>
			</section>

			<section>
				<h2>Flujo neto — últimos 12 meses</h2>
				<div class="table-scroll">
					<table>
						<thead>
							<tr><th>Mes</th><th class="num">Ingresos</th><th class="num">Gastos</th><th class="num">Neto</th></tr>
						</thead>
						<tbody>
							{#each payload.net_flow_series as row (row.month)}
								<tr>
									<td>{row.month}</td>
									<td class="value num">{fmt(row.income)}</td>
									<td class="value num">{fmt(row.expenses)}</td>
									<td class="value num">{fmt(row.net_flow)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section>
				<h2>Pendientes</h2>
				{#if payload.pending.length === 0}
					<!-- Decision C: caught-up state carries ZERO CTA — Pending
					     only comes from Gmail import; a Telegram CTA would be
					     a false affordance. Copy is Camilo's to finalize. -->
					<div class="state">
						<svg class="state-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
							<path d="M3 8.5l3.5 3.5L13 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						<div>
							<p class="state-title">Todo al día</p>
							<p class="state-line">No hay transacciones pendientes de confirmar.</p>
						</div>
					</div>
				{:else}
					<ul>
						{#each payload.pending as row (row.id)}
							<li>
								<span>{row.date} · {row.merchant} · {row.description}</span>
								<span class="value {row.type === 'income' ? 'income-amt' : 'expense-amt'}"
									>{row.type === 'income' ? '+' : '−'}{fmt(row.amount)}</span
								>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}
	{:catch}
		{@render errorState('upstream')}
	{/await}
</main>

<style>
	main {
		max-width: 720px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xl);
	}

	header {
		margin-bottom: var(--spacing-lg);
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		line-height: 1.2;
	}

	.period {
		margin: var(--spacing-xs) 0 0;
		color: var(--ink-muted);
		font-size: 0.875rem;
	}

	/* Empty/error states: functional SVG + title + one line, no CTA. */
	.state {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) 0;
	}

	.state-icon {
		flex-shrink: 0;
		margin-top: var(--spacing-xs);
		color: var(--ink-muted);
	}

	.state-title {
		margin: 0;
		font-weight: 700;
	}

	.state-line {
		margin: var(--spacing-xs) 0 0;
		font-size: 0.875rem;
		color: var(--ink-muted);
	}

	/* Contract error value only — never a URL, never a body. */
	.error-word {
		color: var(--alert-red);
	}

	section {
		margin-bottom: var(--spacing-xl);
	}

	h2 {
		font-size: 1rem;
		margin-bottom: var(--spacing-sm);
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md);
	}

	.kpi {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		/* Luminance gradient, both endpoints surface tokens (ADR-0015). */
		background: linear-gradient(var(--surface-raised), var(--surface));
		border: 1px solid var(--hairline);
		border-radius: var(--rounded-lg);
	}

	.label {
		color: var(--ink-muted);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Hero figure: single value per card — Averia 700 (decision A). */
	.hero {
		font-family: var(--font-numeric);
		font-weight: 700;
		font-size: 1.5rem;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
	}

	.delta {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}

	.delta.favorable {
		color: var(--income-green);
	}

	.delta.unfavorable {
		color: var(--expense-coral);
	}

	.delta-note {
		color: var(--ink-muted);
	}

	/* Ledger amount columns: Nunito + tabular-nums, no monospace, no Averia
	   (decision A). Color goes on the amount only, always with a sign. */
	.value {
		font-family: var(--font-text);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.income-amt {
		color: var(--income-green);
	}

	.expense-amt {
		color: var(--expense-coral);
	}

	/* Stage 9 A3 fallback-link note — same tokens as .period/.state-line
	   (no new colors, no new tokens). */
	.top3-note {
		margin: 0 0 var(--spacing-sm);
		font-size: 0.8125rem;
		color: var(--ink-muted);
	}

	/* Top-3 categories (Stage 7): three stat cells side by side — label,
	   share of month expenses, small progress bar. Track = --hairline; fill
	   comes from CATEGORY_COLOR (data dictionary, ADR-0018 D3), inline. */
	.top3 {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-md);
	}

	.top3-cell {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.top3-pct {
		font-family: var(--font-text);
		font-weight: 700;
		font-size: 1.125rem;
		font-variant-numeric: tabular-nums;
	}

	/* 6px bar: glyph-scale dimension like the 7px carousel dot. */
	.top3-track {
		height: 6px;
		border-radius: var(--rounded-pill);
		background: var(--hairline);
		overflow: hidden;
	}

	.top3-fill {
		height: 100%;
		border-radius: var(--rounded-pill);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--hairline);
	}

	li .value {
		flex-shrink: 0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		/* Fixed layout: column widths identical in skeleton and data
		   branches (zero CLS at swap). */
		table-layout: fixed;
	}

	th,
	td {
		text-align: left;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--hairline);
	}

	th {
		color: var(--ink-muted);
		font-weight: normal;
		font-size: 0.875rem;
	}

	/* Numeric headers sit right-aligned over their numeric columns. */
	.num {
		text-align: right;
	}

	/* Wide content scrolls inside its own container; the page body never
	   scrolls horizontally (DESIGN.md §3). */
	.table-scroll {
		overflow-x: auto;
	}

	/* Chart card (Stage 6): legacy chart-card pattern (flex column, label
	   above chart) on the shell's card surface. Desktop height is content-
	   driven: the chart wrap inside is flex:1 with min-height 240px. */
	.chart-card {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		padding: var(--spacing-md);
		/* Luminance gradient, both endpoints surface tokens (ADR-0015). */
		background: linear-gradient(var(--surface-raised), var(--surface));
		border: 1px solid var(--hairline);
		border-radius: var(--rounded-lg);
	}

	/* ≤480px carousel, desktop default "not there" (legacy Round 14):
	   display:contents unwraps wrap/track so the KPI cards stay direct
	   grid children of .kpis. */
	.carousel-wrap,
	.carousel-track {
		display: contents;
	}

	.carousel-dots {
		display: none;
	}

	/* ≤768px: spacing steps down one token; KPI grid stays 2×2. */
	@media (max-width: 768px) {
		main {
			padding: var(--spacing-md) var(--spacing-sm) var(--spacing-lg);
		}

		section {
			margin-bottom: var(--spacing-lg);
		}

		.kpis {
			gap: var(--spacing-sm);
		}

		.top3 {
			gap: var(--spacing-sm);
		}
	}

	/* ≤480px: KPI cards become the legacy scroll-snap carousel
	   (DESIGN.md §3 as re-amended 2026-07-12; reference implementation
	   backend/src/DashboardPage.html Rounds 13–15). */
	@media (max-width: 480px) {
		.kpis {
			grid-template-columns: 1fr;
		}

		/* Round 15 fix: min-width:0 so the wrap respects the 1fr column
		   instead of inheriting the nowrap track's min-content width. */
		.carousel-wrap {
			display: block;
			min-width: 0;
		}

		.carousel-track {
			display: flex;
			min-width: 0;
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
		}

		.carousel-track::-webkit-scrollbar {
			display: none;
		}

		.kpi {
			flex: 0 0 100%;
			width: 100%;
			scroll-snap-align: center;
		}

		/* Chart cards are fixed-height carousel slides at ≤480px (plan v2
		   heights, ratified R2). */
		.chart-card {
			flex: 0 0 100%;
			width: 100%;
			scroll-snap-align: center;
		}

		.carousel-dots {
			display: flex;
			justify-content: center;
			gap: var(--spacing-sm);
			margin-top: var(--spacing-sm);
		}

		/* 7px dot: legacy reference dimension (glyph-scale, not a spacing
		   token concern). */
		.dot {
			width: 7px;
			height: 7px;
			border-radius: var(--rounded-pill);
			background: var(--ink-muted);
		}

		.dot.active {
			background: var(--progress-amber);
		}

		/* Mes needs far less room than an amount column (7 chars vs.
		   currency-formatted figures) — an equal 25% split was the reason
		   Neto fell off-screen. Dropping the min-width lets the fixed
		   layout actually use this proportion instead of forcing a wider
		   table than the viewport; .table-scroll stays as the safety net
		   for any future overflow. */
		table {
			font-size: 0.8125rem;
		}

		th:first-child,
		td:first-child {
			width: 16%;
		}

		th:not(:first-child),
		td:not(:first-child) {
			width: 28%;
		}

		th,
		td {
			padding: var(--spacing-xs);
		}
	}

	/* Skeleton ghosts — static bar on --surface; shimmer is a pure-luminance
	   rgba(255,255,255,0.08) sweep (plan Task 4). 300ms delay: sub-300ms
	   loads only ever see the static ghost, no flash. No spinners. */
	.ghost {
		display: block;
		background: var(--surface);
		border-radius: var(--rounded-sm);
		position: relative;
		overflow: hidden;
	}

	.ghost::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.08),
			transparent
		);
		animation: shimmer 1.5s infinite;
		animation-delay: 300ms;
	}

	@keyframes shimmer {
		to {
			transform: translateX(100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ghost::after {
			animation: none;
		}
	}

	/* Bars inside KPI cards sit on --surface, so they step up one surface. */
	.kpi .ghost,
	.chart-card .ghost {
		background: var(--surface-raised);
	}

	/* Chart ghosts match each chart wrap's fixed height (zero CLS at swap). */
	.ghost-chart {
		height: 240px;
	}

	/* R4: the line slide is 320px at ≤480px (fills the stretched card). */
	@media (max-width: 480px) {
		.ghost-chart {
			height: 320px;
		}
	}

	.ghost-chart-bar {
		height: 320px;
	}

	/* Mirrors CategoryChart's wrap: 312px desktop, 280px ≤768px (legacy
	   breakpoint), 320px ≤480px (Stage 7 slide height). */
	.ghost-chart-doughnut {
		height: 312px;
	}

	@media (max-width: 768px) {
		.ghost-chart-doughnut {
			height: 280px;
		}
	}

	@media (max-width: 480px) {
		.ghost-chart-doughnut {
			height: 320px;
		}
	}

	.ghost-period {
		width: 40%;
	}

	.ghost-label {
		width: 50%;
	}

	.ghost-value {
		width: 75%;
	}

	.ghost-delta {
		width: 60%;
	}

	.ghost-row {
		width: 100%;
	}
</style>
