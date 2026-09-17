// MarketSim — simulated market data engine for the MoneyGrid demo.
// ALL DATA IS FICTIONAL. Prices random-walk on a timer; nothing here
// touches a real feed. Alerts + breaking-news toasts included.

export const TICKER_DEFS = [
	{ sym: 'NVDA', name: 'NVIDIA', base: 184.12 },
	{ sym: 'MSFT', name: 'Microsoft', base: 512.44 },
	{ sym: 'TSLA', name: 'Tesla', base: 251.3 },
	{ sym: 'AAPL', name: 'Apple', base: 257.88 },
	{ sym: 'TTWO', name: 'Take-Two', base: 209.83 },
	{ sym: 'ORCL', name: 'Oracle', base: 249.15 },
	{ sym: 'SPY', name: 'S&P 500 ETF', base: 658.4 },
	{ sym: 'GLD', name: 'Gold ETF', base: 341.2 }
];

const NEWS_POOL = [
	['Futures tick up', 'Traders eye tomorrow’s inflation print'],
	['Chips rally', 'AI names lead the morning session'],
	['Oil slides', 'Crude dips on inventory build'],
	['Fed watch', 'Rate path in focus after jobs data'],
	['Gold shines', 'Safe-haven bid lifts bullion'],
	['Mega-caps mixed', 'Rotation under the surface'],
	['Gaming pops', 'Take-Two rides release buzz'],
	['Cloud strong', 'Enterprise spend holds up']
];

const rnd = () => Math.random();
let toastSeq = 1;
let alertSeq = 1;

export const fmtPrice = (p) =>
	p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtPct = (p) => `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;

export class MarketSim {
	tickers = $state([]);
	alerts = $state([]);
	toasts = $state([]);
	breaking = $state(true);
	#tickTimer = null;
	#newsTimer = null;

	constructor() {
		this.reset();
	}

	reset() {
		this.tickers = TICKER_DEFS.map((d) => {
			const open = d.base * (1 + (rnd() - 0.5) * 0.004);
			const hist = [];
			let p = open;
			for (let i = 0; i < 48; i++) {
				p *= 1 + (rnd() - 0.5) * 0.0022;
				hist.push(p);
			}
			return {
				sym: d.sym,
				name: d.name,
				open,
				price: hist[hist.length - 1],
				prev: hist[hist.length - 2],
				hist,
				flash: 0
			};
		});
	}

	changePct(t) {
		return ((t.price - t.open) / t.open) * 100;
	}

	tickDir(t) {
		return t.price >= t.prev ? 1 : -1;
	}

	tick() {
		for (const t of this.tickers) {
			t.prev = t.price;
			t.price = Math.max(1, t.price * (1 + (rnd() - 0.5) * 0.003));
			t.hist.push(t.price);
			if (t.hist.length > 48) t.hist.shift();
		}
		this.checkAlerts();
	}

	addAlert(sym, cond, price) {
		if (!sym || !(price > 0)) return;
		this.alerts = [
			...this.alerts,
			{ id: alertSeq++, sym, cond, price: Number(price), armed: true, fired: false }
		];
		this.toast('ok', 'Alert set', `${sym} ${cond === 'above' ? '≥' : '≤'} $${fmtPrice(price)}`);
	}

	removeAlert(id) {
		this.alerts = this.alerts.filter((a) => a.id !== id);
	}

	checkAlerts() {
		for (const a of this.alerts) {
			if (!a.armed) continue;
			const t = this.tickers.find((x) => x.sym === a.sym);
			if (!t) continue;
			const hit = a.cond === 'above' ? t.price >= a.price : t.price <= a.price;
			if (hit) {
				a.armed = false;
				a.fired = true;
				t.flash++;
				this.toast(
					'alert',
					`${a.sym} ${a.cond === 'above' ? 'above' : 'below'} $${fmtPrice(a.price)}`,
					`Now $${fmtPrice(t.price)} (${fmtPct(this.changePct(t))})`
				);
			}
		}
	}

	toast(kind, title, sub = '') {
		const id = toastSeq++;
		this.toasts = [...this.toasts, { id, kind, title, sub }];
		setTimeout(() => {
			this.toasts = this.toasts.filter((x) => x.id !== id);
		}, 5200);
	}

	dismissToast(id) {
		this.toasts = this.toasts.filter((x) => x.id !== id);
	}

	#scheduleNews() {
		clearTimeout(this.#newsTimer);
		if (!this.breaking) return;
		this.#newsTimer = setTimeout(
			() => {
				const [title, sub] = NEWS_POOL[Math.floor(rnd() * NEWS_POOL.length)];
				this.toast('breaking', title, `${sub} · demo`);
				this.#scheduleNews();
			},
			45000 + rnd() * 45000
		);
	}

	start() {
		this.stop();
		this.#tickTimer = setInterval(() => this.tick(), 2000);
		this.#scheduleNews();
	}

	setBreaking(on) {
		this.breaking = on;
		this.#scheduleNews();
	}

	stop() {
		clearInterval(this.#tickTimer);
		clearTimeout(this.#newsTimer);
		this.#tickTimer = this.#newsTimer = null;
	}
}

export const market = new MarketSim();
