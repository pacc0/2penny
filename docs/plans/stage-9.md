# Stage 9 — @21 contract amendment 1.0 → 1.1

Governance: ADR-0023. Webhook @12 untouchable throughout.

Preconditions: clean tree on master, guard green, ADR-0023 committed.

## T0 — CONSUMED at opening (manual, Camilo)

Real-browser Access OTP login; sanitized pre-amendment `/api/dashboard`
payload captured 2026-07-17T22:36:12-05:00 (contract_version 1.0).
Committed verbatim as `docs/evidence/stage-9/baseline-payload.json`,
sha256 `23989bc7c6ad8e3ea343c8d9c8d14bd99d842a94fa3e78bbe766afe0a118219d`.
This is the authoritative baseline for T6. No longer an open task — the
T3→T4 stop point no longer waits on it.

## T1 — Enumerate pinned-@21-vs-@HEAD diff

Locate the commit/version @21 was last deployed from via stage closure
records + `clasp versions`; diff against HEAD, `backend/` scope.
Evidence: file list + per-file one-line justification. **STOP for
ruling** if anything beyond the GeminiGate relocation (Stage 8,
ADR-0021 D2) + Stage 9 changes appears.

## T2 — Implement amendment in backend/src

`buildDailyNetFlowSeries_` (reuse existing aggregators; America/Bogota
day boundaries), previous-month breakdown builder (reuse category
aggregator with prior-month window), envelope wiring, `contract_version`
`'1.1'` on all three paths. Update the contract documentation and
`frontend/src/lib/contract.js` typedef in the same commit. Evidence:
code + unit-style verification of the daily series invariants
(first = 1st of month, last = today Bogota, flat segments present,
monotonic date step).

## T3 — clasp push to @HEAD only

Exercise `doGet` via the @HEAD deployment with secret (curl 200 + new
keys present + old keys byte-shape intact; curl without secret still
`unauthorized` WITH `contract_version` `1.1`). @12/@21 untouched —
verify with `clasp deployments`.

Additionally: verify the amended backend emits `previous_month` with
`month: '2026-06'` and an empty `expenses_by_category` array (`[]`,
not `null`, not absent) — the baseline shows June 2026 has zero
Confirmed expenses, so this exercises the empty-previous-month
contract shape against real data (see T7 link 3).

## T4 — In-place redeploy of @21 via clasp-deploy skill

Precondition: T1 ruling clean (or accepted per ruling) and T3 passed —
no longer gated on T0, which is already consumed. Evidence: `clasp
deployments` before/after — @21 deploymentId IDENTICAL
(`AKfycbx6...rsIF`), version number incremented, @12 byte-identical
(`AKfycbz...4e5W`). First live guard test follows on push.

## T5 — clasp-guard run on the real backend/** push

Link + green result.

## T6 — Payload diff: baseline-payload.json vs fresh post-amendment capture

Diff target: `docs/evidence/stage-9/baseline-payload.json` (file) vs a
fresh live capture taken after T4. Additivity assertion: added keys
exactly `{daily_net_flow, previous_month}`; the only changed value is
`contract_version` `'1.0'` → `'1.1'`; `generated_at` differs by nature
and is excluded from the assertion.

## T7 — Frontend

`NetFlowChart.svelte` to `daily_net_flow` with `formatDayMonth`
restored (`format.js:59` — currently dead, zero call sites). Top-3
fallback is a three-link chain, not a binary:

1. Current month has data → normal Top-3.
2. Current month empty, `previous_month.expenses_by_category`
   non-empty → fallback with month label.
3. Both empty → Stage 7's dignified empty state remains the terminal
   state.

The baseline proves link 3 is reachable with real data today (June
2026 is empty) — T3 exercises this shape against the live backend.
Defensive reads per D3 (ADR-0023). Evidence: local render + no console
errors.

## T8 — Pages production deploy

Verification on the reference device (Samsung Galaxy A56 5G) with real
data: daily line chart, and the Top-3 fallback exercised as far as
real data allows (July has expenses — document what could/could not
be exercised live).

## T9 — Closure

`npm run check` micro-ruling + one-line workflow change; ADR-0023
closure notes (incl. D2 review); ROADMAP backlog updates (retire R3 +
Stage 7 concession entries); handoff commit.

## Stop points

After T1 (diff ruling), after T3 (pre-redeploy authorization), after
T6 (additivity confirmation), after T8 (closure authorization).
Deviations of any kind: STOP and report with evidence; no
improvisation.
