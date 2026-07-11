# 2penny — Stage 4 Execution Plan: Real Data via SvelteKit Server Route Proxy

> **For Claude Code.** Ratified in the UI chat session (2026-07-11). The
> proxy is a SvelteKit server route (`+server.js`, adapter-cloudflare) — NOT
> a separate Cloudflare Pages Function. Execute task by task; show every
> verification block's real output; STOP where marked.

## Context & rules

- Repo: `C:\Users\Camilo\Documents\VS Projects\2penny` (remote `pacc0/2penny`
  — verify with `git remote -v` at session start).
- Secrets are injected via the Cloudflare dashboard by Camilo (manual step),
  NOT `wrangler secret put`. Claude Code only verifies they resolve.
- No new dependency — `fetch` + `AbortController` are platform-native.
- Zero backend changes this stage — the Stage 2 `/exec` endpoint (ADR-0010,
  ADR-0011) is consumed as-is, unmodified.
- Contract version stays 1.0 — `"upstream"` is an additive error value, not
  a version bump.

---

## TASK 1 — ADR-0002: second Access application (HARD STOP)

**Manual, by Camilo:** create a second Cloudflare Access application covering
`*.2penny.pages.dev` (wildcard, preview URLs) in the Cloudflare dashboard,
**without editing the existing Access application** that covers
`2penny.pages.dev` production.

**Claude Code verification (read-only):**
```
curl.exe -sI https://b06ac578.2penny.pages.dev
```
Required: `HTTP/2 302` with a `location:` header pointing at
`*.cloudflareaccess.com`.

**HARD GATE:** do not proceed past this task until Camilo confirms the
Access application exists AND this curl output is captured verbatim. No real
data is deployed without this evidence.

Record evidence in the closing report; no commit (dashboard-only change, no
repo artifact).

---

## TASK 2 — Secret injection (manual) + resolution check

**Manual, by Camilo:** in the Cloudflare Pages dashboard, project `2penny`,
Production environment, add two **Secret**-type variables:
- `APPS_SCRIPT_EXEC_URL`
- `API_SECRET`

**Claude Code verification:** cannot read secret values (by design). Verify
resolution indirectly — Task 3's implementation reads `platform.env.API_SECRET`
and `platform.env.APPS_SCRIPT_EXEC_URL`; a real (non-"upstream"/non-"internal")
response from the deployed proxy in Task 5's evidence battery is the proof
`platform.env` resolved. Do not fabricate a "yes it works" before that
evidence exists.

No commit (dashboard-only change).

---

## TASK 3 — Rewrite `frontend/src/routes/api/dashboard/+server.js`

Replace the Stage 3 mock with a real fetch to the Apps Script `/exec`
endpoint, per ADR-0010's two-layer auth and this stage's additive mapping:

1. Read `platform.env.APPS_SCRIPT_EXEC_URL` and `platform.env.API_SECRET`
   (SvelteKit's `platform` binding under adapter-cloudflare — see
   `RequestEvent.platform.env` in `src/app.d.ts` if a type needs declaring).
2. Build the request: `${APPS_SCRIPT_EXEC_URL}?key=${API_SECRET}`.
3. `AbortController` with a 25s timeout wrapping the fetch.
4. Response mapping (additive to ADR-0010, no contract version bump):
   - Fetch throws (timeout, network error) → HTTP 502, body
     `{"contract_version":"1.0","error":"upstream"}`.
   - Response body doesn't parse as JSON → HTTP 502, same `"upstream"` body.
   - Body parses, `error === "unauthorized"` → HTTP 401, body passed through.
   - Body parses, `error === "internal"` → HTTP 500, body passed through.
   - Body parses, `error === null` → HTTP 200, body passed through unchanged.
5. Every response (all 4 paths) sets header `Cache-Control: no-store` (live
   read per DATA_CONTRACT.md §3 — no snapshot caching, matches the existing
   `+page.js` `prerender = false` override).
6. Delete `MOCK_DASHBOARD` and its JSDoc block entirely — no mock fallback,
   no feature flag to switch back (Stage 3's mock is superseded, not kept
   alive; git history is the rollback path if ever needed).

Commit: `feat(frontend): real Apps Script fetch in dashboard proxy (Stage 4)`

Verification: `npm run build` succeeds; local reasoning only for now (real
`platform.env` isn't available under plain `npm run dev` / `vite preview` —
full exercise happens in Task 5 against the deployed proxy). Do not claim
this task "works" from a local run alone.

---

## TASK 4 — DATA_CONTRACT.md §3 additive amendment

Add `"upstream"` alongside the existing `"unauthorized"` / `"internal"`
error values in §3's AUTH amendment section, documenting:
- Meaning: Apps Script unreachable, timed out (>25s), or returned a
  non-JSON response.
- HTTP mapping: 502.
- Additive — does not bump `contract_version` (still `"1.0"`).
- Update the "Capa 2" line to name the SvelteKit server route, not "Pages
  Function" (same terminology fix as HANDOFF.md, applied at the source of
  truth).

Commit: `docs(contract): additive "upstream" error value (Stage 4, no version bump)`

---

## TASK 5 — Evidence battery

Exercise all 3 real error modes plus the happy path against the **deployed**
proxy (behind Access, authenticated):

1. Happy path: real data renders in the shell, `error: null`, values are
   plausible real numbers (not the Stage 3 mock's fake ones).
2. `"unauthorized"` (401): force via a temporarily wrong `API_SECRET` value
   comparison path, or by hitting `/exec` directly without the query param
   — confirm the proxy still returns 401 with the passthrough body.
3. `"internal"` (500): trigger via whatever Stage 2 `doGet` internal-error
   path exists (e.g. malformed Sheet state), or document if this path is
   only reachable by code inspection, not live trigger — say so, don't fake
   it.
4. `"upstream"` (502): trigger via a temporarily wrong `APPS_SCRIPT_EXEC_URL`
   (points at a dead URL) — confirm 502 + `"upstream"` body, then restore
   the correct URL and re-verify happy path still works.
5. `curl.exe -sI https://b06ac578.2penny.pages.dev` (or current preview
   hash) → 302 to Access — re-confirms Task 1's gate still holds after all
   deploys in this stage.

Report every curl/response verbatim. No summary without the paired output.

---

## OUT of scope

- Chart.js / real charting (Stage 6 — `net_flow_series` stays a plain table).
- Night Ledger visual redesign (Stage 5).
- Any backend (`clasp`) command beyond the read-only `clasp deployments`
  check stage-closer runs at closure — this stage touches `/frontend` and
  `/docs` only.
- Retrying or caching upstream responses — a 502 surfaces as-is; no
  speculative resilience beyond the one 25s timeout already specified.
