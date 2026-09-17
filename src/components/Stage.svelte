<script>
	import Tile from './Tile.svelte';
	import { market } from '../lib/market.svelte.js';

	let { grid, hero, display, theme } = $props();

	const GAP = 10;
	let box = $state(null);
	let W = $state(0);
	let H = $state(0);

	$effect(() => {
		if (!box) return;
		const ro = new ResizeObserver(() => {
			W = box.clientWidth;
			H = box.clientHeight;
		});
		ro.observe(box);
		return () => ro.disconnect();
	});

	function layout() {
		const n = market.tickers.length;
		if (!W || !H || !n) return [];
		if (grid === 'list') {
			const rh = (H - GAP * (n - 1)) / n;
			return market.tickers.map((t, i) => ({ t, x: 0, y: i * (rh + GAP), w: W, h: rh, show: true }));
		}
		if (grid === 'one') {
			const s = Math.min(W * 0.94, H * 0.74, 460);
			const cx = (W - s) / 2;
			const cy = (H - s * 0.78) / 2;
			return market.tickers.map((t, i) =>
				i === hero
					? { t, x: cx, y: cy, w: s, h: s * 0.78, show: true }
					: { t, x: W / 2, y: H / 2, w: 0, h: 0, show: false }
			);
		}
		let cols = Math.max(1, Math.round(Math.sqrt((n * W) / H)));
		cols = Math.min(cols, n);
		const rows = Math.ceil(n / cols);
		const cw = (W - GAP * (cols - 1)) / cols;
		const ch = (H - GAP * (rows - 1)) / rows;
		return market.tickers.map((t, i) => {
			const c = i % cols;
			const r = Math.floor(i / cols);
			return { t, x: c * (cw + GAP), y: r * (ch + GAP), w: cw, h: ch, show: true };
		});
	}

	const rects = $derived(layout());
</script>

<div class="stage" bind:this={box}>
	{#each rects as r (r.t.sym)}
		<div
			class="cell"
			class:hidden={!r.show}
			style="left:{r.x}px;top:{r.y}px;width:{Math.max(r.w, 0)}px;height:{Math.max(r.h, 0)}px"
		>
			<Tile t={r.t} {display} {theme} change={market.changePct(r.t)} />
		</div>
	{/each}
</div>

<style>
	.stage {
		position: relative;
		width: 100%;
		height: 100%;
		touch-action: none;
	}
	.cell {
		position: absolute;
		transition:
			left 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			top 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			width 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			height 0.55s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.35s ease;
	}
	.cell.hidden {
		opacity: 0;
		pointer-events: none;
	}
</style>
