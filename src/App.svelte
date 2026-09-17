<script>
	import { onMount } from 'svelte';
	import Stage from './components/Stage.svelte';
	import SettingsPanel from './components/SettingsPanel.svelte';
	import Toasts from './components/Toasts.svelte';
	import { market } from './lib/market.svelte.js';
	import { THEMES } from './lib/themes.js';

	const LS_KEY = 'moneygrid-settings-v1';

	let settings = $state({ display: 'pro', grid: 'adaptive', theme: 'cobra' });
	let hero = $state(0);
	let panelOpen = $state(false);
	let clock = $state('');
	let panelEl = $state(null);

	const theme = $derived(THEMES[settings.theme] ?? THEMES.cobra);
	const armedCount = $derived(market.alerts.filter((a) => a.armed).length);

	// ---- panel drag / swipe ----
	let dragDX = $state(0); // px offset; 0 = open
	let dragging = $state(false);
	let gesture = null;

	const panelW = () => panelEl?.offsetWidth || 340;

	function gStart(e, fromEdge) {
		const t = e.touches[0];
		gesture = {
			x0: t.clientX,
			y0: t.clientY,
			dx0: panelOpen ? 0 : panelW(),
			wasOpen: panelOpen,
			fromEdge,
			decided: false
		};
	}

	function gMove(e) {
		if (!gesture) return;
		const t = e.touches[0];
		const dx = t.clientX - gesture.x0;
		const dy = t.clientY - gesture.y0;
		if (!gesture.decided) {
			if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
			gesture.decided = true;
			// only hijack horizontal-dominant gestures (panel keeps vertical scroll)
			if (Math.abs(dx) <= Math.abs(dy) * 1.3) {
				gesture = null;
				return;
			}
			dragging = true;
		}
		const w = panelW();
		dragDX = Math.min(w, Math.max(0, gesture.dx0 + dx));
	}

	function gEnd() {
		if (!gesture) return;
		const w = panelW();
		if (dragging) {
			panelOpen = dragDX < w * 0.45;
		} else if (gesture.fromEdge) {
			panelOpen = true;
		}
		dragging = false;
		gesture = null;
	}

	const panelX = $derived(dragging ? dragDX : panelOpen ? 0 : panelW() + 8);

	function pick(key, val) {
		settings[key] = val;
		try {
			localStorage.setItem(LS_KEY, JSON.stringify(settings));
		} catch {}
		if (key === 'grid' && val !== 'one') hero = 0;
	}

	function nudge(d) {
		hero = (hero + d + market.tickers.length) % market.tickers.length;
	}

	onMount(() => {
		try {
			const raw = localStorage.getItem(LS_KEY);
			if (raw) settings = { ...settings, ...JSON.parse(raw) };
		} catch {}
		market.setBreaking(true);
		market.start();
		const ct = setInterval(() => {
			clock = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
		}, 1000);
		clock = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
		// 1x1 auto-advance
		const at = setInterval(() => {
			if (settings.grid === 'one' && !panelOpen && !dragging) nudge(1);
		}, 7000);
		return () => {
			clearInterval(ct);
			clearInterval(at);
			market.stop();
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="app">
	<header>
		<div class="brand">
			<span class="word">MONEYGRID</span>
			<span class="live"><i></i>LIVE</span>
		</div>
		<div class="hctl">
			<span class="clock">{clock}</span>
			<button class="iconbtn" onclick={() => (panelOpen = true)} aria-label="Alerts">
				🔔
				{#if armedCount > 0}<b class="badge">{armedCount}</b>{/if}
			</button>
			<button class="iconbtn" onclick={() => (panelOpen = !panelOpen)} aria-label="Settings">⚙</button>
		</div>
	</header>

	<main>
		<Stage grid={settings.grid} {hero} display={settings.display} {theme} />
		{#if settings.grid === 'one'}
			<div class="pager">
				<button class="parrow" onclick={() => nudge(-1)} aria-label="Previous">‹</button>
				<div class="dots">
					{#each market.tickers as t, i (t.sym)}
						<button
							class="dot"
							class:on={i === hero}
							onclick={() => (hero = i)}
							aria-label={t.sym}
						></button>
					{/each}
				</div>
				<button class="parrow" onclick={() => nudge(1)} aria-label="Next">›</button>
			</div>
		{/if}
	</main>

	<footer>Demo data · simulated feed</footer>

	{#if panelOpen && !dragging}
		<div class="scrim" onclick={() => (panelOpen = false)}></div>
	{/if}

	{#if !panelOpen}
		<div
			class="edge"
			ontouchstart={(e) => gStart(e, true)}
			ontouchmove={gMove}
			ontouchend={gEnd}
			ontouchcancel={gEnd}
		></div>
	{/if}

	<aside
		bind:this={panelEl}
		class="drawer"
		class:nodrag={!dragging}
		style="transform:translateX({panelX}px)"
		ontouchstart={(e) => gStart(e, false)}
		ontouchmove={gMove}
		ontouchend={gEnd}
		ontouchcancel={gEnd}
	>
		<SettingsPanel {settings} onPick={pick} />
	</aside>

	<Toasts />
</div>

<style>
	.app {
		height: 100dvh;
		max-height: 100dvh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background:
			radial-gradient(120% 60% at 20% -10%, rgba(90, 60, 220, 0.16), transparent 60%),
			radial-gradient(120% 60% at 90% 110%, rgba(20, 180, 160, 0.1), transparent 60%),
			#050508;
		color: #fff;
		user-select: none;
		-webkit-user-select: none;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(env(safe-area-inset-top, 0px) + 10px) 16px 8px;
		flex: none;
	}
	.brand { display: flex; align-items: center; gap: 10px; }
	.word { font-weight: 900; letter-spacing: 0.18em; font-size: 15px; }
	.live {
		display: flex; align-items: center; gap: 5px;
		font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
		color: #4ade80;
	}
	.live i {
		width: 7px; height: 7px; border-radius: 50%;
		background: #4ade80;
		animation: pulse 1.6s infinite;
	}
	@keyframes pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.4; transform: scale(0.8); }
	}
	.hctl { display: flex; align-items: center; gap: 6px; }
	.clock { font-size: 13px; font-variant-numeric: tabular-nums; opacity: 0.75; margin-right: 4px; }
	.iconbtn {
		position: relative;
		width: 44px; height: 44px;
		display: grid; place-items: center;
		font-size: 19px;
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	.badge {
		position: absolute; top: 4px; right: 4px;
		min-width: 18px; height: 18px;
		border-radius: 9px; padding: 0 5px;
		background: #fbbf24; color: #000;
		font-size: 10px; font-weight: 800;
		display: grid; place-items: center;
	}
	main { position: relative; flex: 1; min-height: 0; padding: 2px 12px 0; }
	.pager {
		position: absolute;
		left: 0; right: 0; bottom: 6px;
		display: flex; align-items: center; justify-content: center;
		gap: 18px;
		pointer-events: none;
	}
	.pager button { pointer-events: auto; }
	.parrow {
		width: 44px; height: 44px; border-radius: 50%;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.14);
		font-size: 26px; line-height: 1; color: #fff;
		display: grid; place-items: center;
	}
	.dots { display: flex; gap: 7px; }
	.dot {
		width: 8px; height: 8px; border-radius: 50%;
		background: rgba(255, 255, 255, 0.25);
		transition: all 0.3s;
	}
	.dot.on { background: #fff; transform: scale(1.25); }
	footer {
		flex: none;
		text-align: center;
		font-size: 10px;
		opacity: 0.35;
		padding: 4px 0 calc(env(safe-area-inset-bottom, 0px) + 6px);
		letter-spacing: 0.06em;
	}
	.scrim {
		position: fixed; inset: 0; z-index: 40;
		background: rgba(0, 0, 0, 0.35);
		animation: fade 0.3s ease;
	}
	@keyframes fade { from { opacity: 0; } }
	.edge {
		position: fixed; top: 0; right: 0; bottom: 0;
		width: 26px; z-index: 45;
		touch-action: pan-y;
	}
	.drawer {
		position: fixed; top: 0; right: 0; bottom: 0;
		width: min(350px, 88vw);
		z-index: 50;
		will-change: transform;
		touch-action: pan-y;
	}
	.drawer.nodrag { transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1); }
</style>
