<script>
	import { market } from '../lib/market.svelte.js';

	const ICONS = { alert: '🔔', breaking: '⚡', ok: '✓' };
</script>

<div class="toasts" aria-live="polite">
	{#each market.toasts as t (t.id)}
		<button class="toast glass kind-{t.kind}" onclick={() => market.dismissToast(t.id)}>
			<span class="ico">{ICONS[t.kind] ?? '•'}</span>
			<span class="txt">
				<strong>{t.kind === 'breaking' ? 'BREAKING · ' : ''}{t.title}</strong>
				{#if t.sub}<small>{t.sub}</small>{/if}
			</span>
		</button>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		top: calc(env(safe-area-inset-top, 0px) + 64px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 60;
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: min(92vw, 380px);
		pointer-events: none;
	}
	.toast {
		pointer-events: auto;
		display: flex;
		gap: 10px;
		align-items: center;
		text-align: left;
		border-radius: 16px;
		padding: 10px 14px;
		color: #fff;
		animation: drop 0.35s cubic-bezier(0.22, 1, 0.36, 1);
		cursor: pointer;
	}
	@keyframes drop {
		from { transform: translateY(-14px); opacity: 0; }
	}
	.ico { font-size: 18px; }
	.txt { display: flex; flex-direction: column; gap: 1px; }
	.txt strong { font-size: 13px; }
	.txt small { font-size: 11px; opacity: 0.7; }
	.kind-breaking { border-color: rgba(255, 80, 80, 0.45); }
	.kind-alert { border-color: rgba(255, 200, 60, 0.45); }
</style>
