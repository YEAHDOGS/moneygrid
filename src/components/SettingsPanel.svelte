<script>
	import { market, fmtPrice } from '../lib/market.svelte.js';
	import { THEMES, DISPLAY_MODES, GRID_SIZES } from '../lib/themes.js';

	let { settings, onPick } = $props();

	let aSym = $state('NVDA');
	let aCond = $state('above');
	let aPrice = $state('');

	function addAlert() {
		market.addAlert(aSym, aCond, parseFloat(aPrice));
		aPrice = '';
	}
</script>

<div class="panel glass-strong">
	<h2>Settings</h2>

	<section>
		<h3>Display</h3>
		<div class="seg">
			{#each DISPLAY_MODES as m (m.id)}
				<button class:active={settings.display === m.id} onclick={() => onPick('display', m.id)}>
					{m.label}
				</button>
			{/each}
		</div>
	</section>

	<section>
		<h3>Grid size</h3>
		<div class="seg">
			{#each GRID_SIZES as g (g.id)}
				<button class:active={settings.grid === g.id} onclick={() => onPick('grid', g.id)}>
					{g.label}
				</button>
			{/each}
		</div>
	</section>

	<section>
		<h3>Color</h3>
		<div class="swatches">
			{#each Object.entries(THEMES) as [id, th] (id)}
				<button
					class="sw"
					class:active={settings.theme === id}
					onclick={() => onPick('theme', id)}
					aria-label={th.label}
				>
					<span class="dot" style="background:{th.up}"></span>
					<span class="dot" style="background:{th.down}"></span>
					<small>{th.label}</small>
				</button>
			{/each}
		</div>
	</section>

	<section>
		<h3>🔔 Alert system</h3>
		{#if market.alerts.length === 0}
			<p class="muted">No alerts. Prices are simulated demo data.</p>
		{/if}
		<ul class="alerts">
			{#each market.alerts as a (a.id)}
				<li class:fired={a.fired}>
					<span><strong>{a.sym}</strong> {a.cond === 'above' ? '≥' : '≤'} ${fmtPrice(a.price)}</span>
					{#if !a.armed}<em>hit</em>{/if}
					<button class="x" onclick={() => market.removeAlert(a.id)} aria-label="Remove alert">✕</button>
				</li>
			{/each}
		</ul>
		<div class="addrow">
			<select bind:value={aSym} aria-label="Ticker">
				{#each market.tickers as t (t.sym)}<option value={t.sym}>{t.sym}</option>{/each}
			</select>
			<div class="seg tiny">
				<button class:active={aCond === 'above'} onclick={() => (aCond = 'above')}>≥</button>
				<button class:active={aCond === 'below'} onclick={() => (aCond = 'below')}>≤</button>
			</div>
			<input
				type="number"
				inputmode="decimal"
				placeholder="Price"
				bind:value={aPrice}
				aria-label="Alert price"
			/>
			<button class="go" onclick={addAlert}>Add</button>
		</div>
	</section>

	<section>
		<h3>⚡ Breaking news</h3>
		<label class="switch">
			<input
				type="checkbox"
				checked={market.breaking}
				onchange={(e) => market.setBreaking(e.currentTarget.checked)}
			/>
			<span class="track"><span class="thumb"></span></span>
			<small>Simulated headlines</small>
		</label>
	</section>

	<p class="foot">Demo data · simulated feed<br />Made by DOGS</p>
</div>

<style>
	.panel {
		height: 100%;
		padding: calc(env(safe-area-inset-top, 0px) + 18px) 20px 24px;
		overflow-y: auto;
		color: #fff;
	}
	h2 { font-size: 22px; font-weight: 800; margin-bottom: 18px; letter-spacing: 0.02em; }
	section { margin-bottom: 22px; }
	h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.6; margin-bottom: 10px; }
	.seg {
		display: flex;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 14px;
		padding: 3px;
		gap: 3px;
	}
	.seg button {
		flex: 1;
		padding: 9px 4px;
		border-radius: 11px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.65);
		transition: all 0.25s;
		min-height: 44px;
	}
	.seg button.active {
		background: rgba(255, 255, 255, 0.16);
		color: #fff;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
	}
	.seg.tiny button { min-height: 40px; padding: 6px 10px; flex: none; }
	.swatches { display: flex; gap: 10px; }
	.sw {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px 4px 10px;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.05);
		min-height: 44px;
		transition: all 0.25s;
	}
	.sw.active { border-color: rgba(255, 255, 255, 0.45); background: rgba(255, 255, 255, 0.12); }
	.dot { width: 18px; height: 18px; border-radius: 50%; }
	.sw small { font-size: 10px; opacity: 0.7; color: #fff; }
	.muted { font-size: 12px; opacity: 0.55; margin-bottom: 8px; }
	.alerts { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
	.alerts li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 13px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 12px;
		padding: 9px 12px;
		color: #fff;
	}
	.alerts li.fired { opacity: 0.6; }
	.alerts em { font-size: 10px; text-transform: uppercase; opacity: 0.7; margin-left: 8px; }
	.x { opacity: 0.5; padding: 6px; font-size: 12px; color: #fff; }
	.addrow { display: flex; gap: 6px; align-items: stretch; }
	.addrow select,
	.addrow input {
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		color: #fff;
		font-size: 13px;
		padding: 0 10px;
		min-height: 44px;
	}
	.addrow select { width: 76px; }
	.addrow select option { color: #000; }
	.addrow input { flex: 1; min-width: 0; }
	.go {
		background: rgba(255, 255, 255, 0.16);
		border-radius: 12px;
		padding: 0 14px;
		font-weight: 700;
		font-size: 13px;
		color: #fff;
		min-height: 44px;
	}
	.switch { display: flex; align-items: center; gap: 12px; cursor: pointer; min-height: 44px; }
	.switch input { display: none; }
	.track {
		width: 46px; height: 27px; border-radius: 999px;
		background: rgba(255, 255, 255, 0.14);
		position: relative; transition: background 0.25s; flex: none;
	}
	.thumb {
		position: absolute; top: 3px; left: 3px; width: 21px; height: 21px;
		border-radius: 50%; background: #fff; transition: left 0.25s;
	}
	.switch input:checked + .track { background: #4ade80; }
	.switch input:checked + .track .thumb { left: 22px; }
	.switch small { color: #fff; opacity: 0.7; font-size: 12px; }
	.foot { text-align: center; font-size: 10px; opacity: 0.4; margin-top: 8px; line-height: 1.6; }
</style>
