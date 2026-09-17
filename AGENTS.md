# MoneyGrid — project notes

Stock-grid demo (Svelte 5 + Vite + Tailwind). Deploys to Cloudflare Pages
project `moneygrid`; custom domain moneygrid.dogs.red.

- Branch: `master`. Push directly; no PRs (standing user rule).
- Commits as `Jack <noreply@anthropic.com>`.
- All market data is SIMULATED and labeled demo — never imply a real feed.
- Phone-first: one screen, no scroll, 44px touch targets.
- Build: `npm run build` → `dist/`. Deploy: `wrangler pages deploy dist --project-name moneygrid --branch master`.
- Cloudflare: free tier only. Never ask the user for tokens (standing order).
