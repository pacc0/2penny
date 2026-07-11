/** Real proxy — Stage 4. Fetches the Apps Script /exec endpoint with the
 *  server-side secret and maps body errors to real HTTP status (ADR-0010
 *  layer 2, plus additive "upstream" → 502). Contract v1.0. */

const TIMEOUT_MS = 25000;

/** @param {unknown} body @param {number} status */
function respond(body, status) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

function upstream() {
  return respond({ contract_version: '1.0', error: 'upstream' }, 502);
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform }) {
  const url = platform?.env?.APPS_SCRIPT_EXEC_URL;
  const key = platform?.env?.API_SECRET;
  if (!url || !key) {
    return respond({ contract_version: '1.0', error: 'internal' }, 500);
  }

  let res;
  try {
    res = await fetch(`${url}?key=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
  } catch {
    return upstream(); // timeout or network failure
  }

  let body;
  try {
    body = await res.json();
  } catch {
    return upstream(); // non-JSON response (e.g. Apps Script error page)
  }

  if (body.error === 'unauthorized') return respond(body, 401);
  if (body.error != null) return respond(body, 500);
  return respond(body, 200);
}
