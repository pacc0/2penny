// Overrides the layout's prerender=true: this route's load() must run
// per-request (live read, no cached snapshot — DATA_CONTRACT.md §3),
// not once at build time.
export const prerender = false;

/** @type {import('./$types').PageLoad} */
export function load({ fetch }) {
  // Streamed: the promise is returned unawaited so the shell renders
  // immediately and {#await} shows the skeleton. Still one real fetch
  // per request; proxy stays no-store.
  return {
    /** @type {Promise<import('$lib/contract.js').DashboardContract>} */
    payload: fetch('/api/dashboard').then((res) => res.json())
  };
}
