// Color themes from the sketch: Cobra (R/G), O/B, Neon, Green (mono).
export const THEMES = {
	cobra: { label: 'Cobra', sub: 'Red / Green', up: '#4ade80', down: '#f87171' },
	ob: { label: 'O/B', sub: 'Orange / Blue', up: '#fb923c', down: '#60a5fa' },
	neon: { label: 'Neon', sub: 'Lime / Pink', up: '#d4ff3f', down: '#ff3fd4' },
	green: { label: 'Green', sub: 'Monochrome', up: '#34d399', down: '#14532d' }
};

export const DISPLAY_MODES = [
	{ id: 'pro', label: 'Pro' },
	{ id: 'equity', label: 'Equity change' },
	{ id: 'price', label: 'Price current' }
];

export const GRID_SIZES = [
	{ id: 'one', label: '1×1' },
	{ id: 'list', label: 'List' },
	{ id: 'adaptive', label: 'Adaptive' }
];
