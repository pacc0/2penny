# frontend

Svelte 5 (runes) shell → Cloudflare Pages (`2penny.pages.dev`), behind
Cloudflare Access. See /docs/ROADMAP.md.

## Local dev

```
npm install
npm run dev          # dev server with HMR
npm run build        # production build (adapter-cloudflare)
npm run preview       # serve the production build locally
```

## Deploy (Direct Upload, no git provider — ADR-0001)

```
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=2penny --branch=main
```
Deploys to a unique preview URL AND aliases `2penny.pages.dev` (production,
covered by Cloudflare Access). Preview URLs are NOT covered by Access yet
(ADR-0002 — gap closes before Stage 4 closes).

## Mock vs real data

`src/routes/api/dashboard/+server.js` currently returns a hardcoded mock
matching contract v1.0 (`docs/DATA_CONTRACT.md` §3, typed via
`src/lib/contract.js`). Stage 4 replaces the mock body with a real fetch to
the Apps Script JSON endpoint (Stage 2), injecting `API_SECRET` from a
platform env var — the route signature and shape stay the same, so
`+page.js`'s `fetch('/api/dashboard')` call is unchanged.

The root page (`+page.js`) overrides the layout's `prerender = true` with
`prerender = false`: this route does a live per-request read (contract §3 —
no cached snapshots), so it cannot be baked into static HTML at build time.
