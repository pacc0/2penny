// Overrides the layout's prerender=true: this route's load() must run
// per-request (live read, no cached snapshot — DATA_CONTRACT.md §3),
// not once at build time.
export const prerender = false;

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const res = await fetch('/api/dashboard');
  /** @type {import('$lib/contract.js').DashboardContract} */
  const payload = await res.json();
  return { payload };
}
