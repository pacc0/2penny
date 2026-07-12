<script>
	import { formatCurrency } from '$lib/format.js';

	/** @type {{ data: { payload: Promise<import('$lib/contract.js').DashboardContract> } }} */
	let { data } = $props();
</script>

<main>
	{#await data.payload}
		<!-- Skeleton mirrors the real layout (zero CLS): header, 4 KPI ghost
		     cards, ghost list rows, 12 ghost table rows. -->
		<header>
			<h1>2penny</h1>
			<p class="period"><span class="ghost ghost-period">&nbsp;</span></p>
		</header>

		<section class="kpis">
			{#each Array(4) as _, i (i)}
				<div class="kpi">
					<span class="label"><span class="ghost ghost-label">&nbsp;</span></span>
					<span class="value"><span class="ghost ghost-value">&nbsp;</span></span>
				</div>
			{/each}
		</section>

		<section>
			<h2>Gastos por categoría</h2>
			<ul>
				{#each Array(5) as _, i (i)}
					<li><span class="ghost ghost-row">&nbsp;</span></li>
				{/each}
			</ul>
		</section>

		<section>
			<h2>Gastos por cuenta</h2>
			<ul>
				{#each Array(3) as _, i (i)}
					<li><span class="ghost ghost-row">&nbsp;</span></li>
				{/each}
			</ul>
		</section>

		<section>
			<h2>Flujo neto — últimos 12 meses</h2>
			<table>
				<thead>
					<tr><th>Mes</th><th>Ingresos</th><th>Gastos</th><th>Neto</th></tr>
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
			<p class="error">Error: {payload.error}</p>
		{:else}
			<header>
				<h1>2penny</h1>
				<p class="period">{payload.period.month} · generado {payload.generated_at}</p>
			</header>

			<section class="kpis">
				<div class="kpi">
					<span class="label">Ingresos</span>
					<span class="value income">{fmt(payload.kpis.income)}</span>
				</div>
				<div class="kpi">
					<span class="label">Gastos</span>
					<span class="value expense">{fmt(payload.kpis.expenses)}</span>
				</div>
				<div class="kpi">
					<span class="label">Flujo neto</span>
					<span class="value">{fmt(payload.kpis.net_flow)}</span>
				</div>
				<div class="kpi">
					<span class="label">Ahorro (mes / meta)</span>
					<span class="value">{fmt(payload.kpis.savings.month)} / {fmt(payload.kpis.savings.monthly_goal)}</span>
				</div>
			</section>

			<section>
				<h2>Gastos por categoría</h2>
				<ul>
					{#each payload.expenses_by_category as row (row.category)}
						<li><span>{row.category}</span><span class="value">{fmt(row.amount)}</span></li>
					{/each}
				</ul>
			</section>

			<section>
				<h2>Gastos por cuenta</h2>
				<ul>
					{#each payload.expenses_by_account as row (row.account)}
						<li><span>{row.account}</span><span class="value">{fmt(row.amount)}</span></li>
					{/each}
				</ul>
			</section>

			<section>
				<h2>Flujo neto — últimos 12 meses</h2>
				<table>
					<thead>
						<tr><th>Mes</th><th>Ingresos</th><th>Gastos</th><th>Neto</th></tr>
					</thead>
					<tbody>
						{#each payload.net_flow_series as row (row.month)}
							<tr>
								<td>{row.month}</td>
								<td class="value">{fmt(row.income)}</td>
								<td class="value">{fmt(row.expenses)}</td>
								<td class="value">{fmt(row.net_flow)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>

			<section>
				<h2>Pendientes</h2>
				{#if payload.pending.length === 0}
					<p>sin pendientes</p>
				{:else}
					<ul>
						{#each payload.pending as row (row.id)}
							<li>
								<span>{row.date} · {row.merchant} · {row.description}</span>
								<span class="value">{fmt(row.amount)}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}
	{:catch}
		<p class="error">Error: upstream</p>
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

	.error {
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
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		background: var(--surface);
		border-radius: var(--rounded-md);
	}

	.label {
		color: var(--ink-muted);
		font-size: 0.875rem;
	}

	.value {
		font-family: var(--font-numeric);
		font-variant-numeric: tabular-nums;
	}

	.income {
		color: var(--income-green);
	}

	.expense {
		color: var(--expense-coral);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		justify-content: space-between;
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid var(--hairline);
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
	.kpi .ghost {
		background: var(--surface-raised);
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

	.ghost-row {
		width: 100%;
	}
</style>
