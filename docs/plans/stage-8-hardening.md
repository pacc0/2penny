# Stage 8 Plan — Endurecimiento (production guardrails, zero-deployment stage)

**Version:** v1 (RATIFIED 2026-07-17)
**Date:** 2026-07-17
**Governing inputs:** ROADMAP.md Etapa 8, OPERATIONS.md §6 (Gemini deprecation
incident, June 2026), ADR-0003 (clasp personal account, re-evaluation
trigger), DECISIONS.md ADR-0020 (Stage 7 closure baseline: 3 deployments).

## Objective

Ship the guardrails that let 2penny run without constant supervision, with
**zero deployments** in this stage: `.github/workflows/clasp-guard.yml`
(read-only deploymentId verification), `backend/src/GeminiGate.js` (model
string in one file), `backend/src/Canary.js` (trivial Gemini health check,
alert-on-failure via Telegram). `clasp push` only (updates `@HEAD`); no
`clasp deploy`/`create-deployment`/`undeploy`/`version` anywhere in this
stage.

## Supreme invariant (violating this halts execution)

Telegram webhook **@12**
(`AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W`)
and json-api **@21**
(`AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF`)
are UNTOUCHABLE. Verified against `docs/DECISIONS.md:583` (ADR-0020) at Task
0 baseline. `clasp deployments` is checked after every `clasp push`. If
either id ever differs: STOP immediately, report, touch nothing.

## Tasks

- **T0 — Baseline.** `git remote -v` + `git status --short` (clean,
  `pacc0/2penny`); `clasp deployments`, byte-compare both ids against
  ADR-0020's recorded values. STOP on mismatch.
- **T1 — Governance.** This plan; ADR-0021 in DECISIONS.md (D1 CLASPRC_JSON
  personal account deferred, D2 GeminiGate `@HEAD`/`@12` divergence
  accepted, D3 clasp-guard is read-only verification).
- **T2 — clasp-guard.yml.** Replaces the Stage 1 inert placeholder
  (`workflow_dispatch`-only echo). Triggers: push to `master` on
  `backend/**`, `workflow_dispatch`, weekly cron. Asserts both canonical
  deploymentIds (env constants, commented "canonical — see ADR-0021") are
  present in `clasp deployments` output; exits 1 loudly otherwise. Never
  echoes `secrets.CLASPRC_JSON`. No deploy commands in the workflow.
- **T3 — GeminiGate.js.** Moves `GEMINI_MODEL_` / `GEMINI_API_BASE_URL_` out
  of `GeminiClient.js` into their own file — one place to bump the model
  string on the next deprecation. No behavior change; value stays
  `gemini-3.1-flash-lite`. `clasp push` (HEAD only), verify ids unchanged.
- **T4 — Canary.js.** `runCanary()`: one trivial Gemini call through
  `GeminiGate.js` + `getGeminiApiKey_()` (reused from `GeminiClient.js`); on
  failure, `sendTelegramMessage_()` (reused from `TelegramClient.js`); on
  success, `Logger.log` only — no message, zero noise. `clasp push`, verify
  ids unchanged.
- **T5 — Docs.** OPERATIONS.md "Stage 8 manual steps (Camilo)" section
  (secret creation, daily trigger, workflow_dispatch green run, forced-
  failure test); ROADMAP.md Etapa 8 → EN CURSO; HANDOFF.md refresh via
  checkpoint-code.

## Evidence requirements

`clasp deployments` output pasted verbatim at T0 and after every push (T3,
T4) — must be byte-identical each time. Grep confirming the Gemini model
string exists in exactly one file after T3. Git log/status for every commit.

## Rollback

Delete `.github/workflows/clasp-guard.yml` (reverts to Stage 1's inert
placeholder) or revert its commit. `GeminiGate.js`/`Canary.js`: revert their
commits — both only ever touch `@HEAD`, never a pinned deployment, so
rollback has zero production blast radius.

## NO-CHANGES

- `@12` (Telegram webhook) and `@21` (json-api) are never redeployed this
  stage — `clasp push` only touches `@HEAD`.
- No `clasp deploy`, `clasp undeploy`, `clasp create-deployment`, `clasp
  version`.
- No GitHub Secrets created by Code (human-only, Camilo's GitHub Settings).
- No Apps Script trigger created by Code (human-only, Apps Script UI).
- `Gemini` model string value unchanged (`gemini-3.1-flash-lite`) — this is
  a relocation, not a bump.
- Stage is NOT closed here — closure requires `stage-closer` after the
  guard's first green `workflow_dispatch` run and the forced-failure test
  evidence exist (both human-gated, see OPERATIONS.md).
