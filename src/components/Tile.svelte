<!-- svelte-ignore a11y_no_static_element_interactions -->
<script>
	import { fmtPrice, fmtPct } from '../lib/market.svelte.js';

	let { t, display, theme, change } = $props();

	const up = $derived(change >= 0);
	const color = $derived(up ? theme.up : theme.down);

	// restart the flash animation every time an alert fires (keyed overlay below)
	let el = $state(null);

	function sparkPath(hist, w, h) {
		if (!hist || hist.length < 2) return '';
		const min = Math.min(...hist);
		const max = Math.max(...hist);
		const span = max - min || 1;
		const step = w / (hist.length - 1);
		return hist
			.map((p, i) => `${(i * step).toFixed(1)},${(h - ((p - min) / span) * (h - 4) - 2).toFixed(1)}`)
			.join(' ');
	}
</script>

<div class="tile glass" bind:this={el} style="--uc:{color}">
	{#key t.flash}
		{#if t.flash > 0}<span class="flashfx"></span>{/if}
	{/key}
	<div class="flex items-baseline justify-between gap-2">
		<span class="sym">{t.sym}</span>
		{#if display === 'pro'}
			<span class="pct" style="color:{color}">{fmtPct(change)}</span>
		{/if}
	</div>

	{#if display === 'pro'}
		<div class="price">{fmtPrice(t.price)}</div>
		<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
			<polyline points={sparkPath(t.hist, 100, 28)} fill="none" stroke={color} stroke-width="1.6" />
		</svg>
	{:else if display === 'equity'}
		<div class="hero-num" style="color:{color}">{fmtPct(change)}</div>
	{:else}
		<div class="hero-num">{fmtPrice(t.price)}</div>
	{/if}
</div>

<style>
	.tile {
		width: 100%;
		height: 100%;
		border-radius: 18px;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2px;
		overflow: hidden;
		position: relative;
	}
	.tile .flashfx {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: var(--uc);
		pointer-events: none;
		animation: tileflash 0.9s ease-out;
	}
	@keyframes tileflash {
		0% { opacity: 0.35; }
		100% { opacity: 0; }
	}
	.sym {
		font-weight: 700;
		letter-spacing: 0.08em;
		font-size: clamp(11px, 1.6vh, 14px);
		color: rgba(255, 255, 255, 0.85);
	}
	.pct {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		font-size: clamp(11px, 1.6vh, 14px);
	}
	.price {
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		font-size: clamp(20px, 3.4vh, 30px);
		line-height: 1.05;
	}
	.hero-num {
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		font-size: clamp(30px, 6vh, 54px);
		line-height: 1;
	}
	.spark {
		width: 100%;
		height: 26px;
		margin-top: 4px;
		opacity: 0.9;
	}
</style>
