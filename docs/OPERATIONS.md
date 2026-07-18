# OPERATIONS.md — Runbook

## 1. Deploy backend (Apps Script)

SIEMPRE vía la skill `clasp-deploy`. Regla de oro: `clasp push` solo
actualiza `@HEAD`; publicar = actualizar el deployment versionado
EXISTENTE (nunca crear uno nuevo → cambiaría la URL `/exec` y rompería el
webhook de Telegram). Verificación obligatoria: `clasp deployments`
antes/después, deploymentId del webhook sin cambios.

## 2. Deploy frontend

Cloudflare Pages Direct Upload (Etapas 1–3); CI llega después. Producción:
`2penny.pages.dev` tras Access.

## 3. Rollback

Por etapa, según la tabla de ROADMAP.md (cada etapa define el suyo).
Principio strangler-fig: v1.0 sigue viva hasta la Etapa 7.

## 4. Límites free tier a conocer

Pages Functions comparte los 100.000 requests/día de Workers (reset a
medianoche UTC; Error 1027 al exceder). Sobra para single-user con live
read por refresh.

## 5. Seguridad

Gap de Access en preview URLs (ver ADR-0002, deadline Etapa 4). Secretos:
nunca en el repo; `CLASPRC_JSON` va a GitHub Secrets solo en Etapa 8; el
secreto del endpoint JSON vive server-side en la Pages Function.

## 6. Lección operativa (incidente Gemini, junio 2026)

Deprecación silenciosa de `gemini-2.0-flash` degradó la clasificación
semanas antes de detectarse. Guardarraíles resultantes (Etapa 8):
`GeminiGate.js` (cambio de modelo en un solo archivo) + `Canary.js`
(llamada trivial periódica + alerta Telegram; vigilar deprecación de
`gemini-3.1-flash-lite`, mayo 2027).

## 7. Stage 8 manual steps (Camilo)

Code never receives destructive GitHub/Apps Script permissions — these four
steps are human-only, out of band from any Claude Code session. See
ADR-0021 (D1/D3) and `docs/plans/stage-8-hardening.md`.

1. **Create GitHub Secret `CLASPRC_JSON`.** Repo Settings → Secrets and
   variables → Actions → New repository secret, name `CLASPRC_JSON`, value
   = the full content of local `~/.clasprc.json`. Never paste the value in
   chat, a commit, or a log — copy it directly from the file.
2. **Create a daily time-driven trigger for `runCanary`.** Apps Script
   editor (script id in `backend/.clasp.json`) → Triggers (clock icon) →
   Add Trigger → function `runCanary`, event source Time-driven, Day timer,
   pick any hour. This is the only way `Canary.js` actually runs — pushing
   the code does not schedule it.
3. **Run `clasp-guard` via `workflow_dispatch` and confirm green.** Actions
   tab → clasp-guard → Run workflow → confirm the run succeeds (both
   deploymentIds verified). This is the first real signal the secret from
   step 1 is correct.
4. **Forced-failure test.** From a throwaway branch, deliberately alter one
   of the two ID constants in `.github/workflows/clasp-guard.yml`, push,
   run `workflow_dispatch` on that branch, confirm the run fails red with
   the expected `::error::` message, then delete the branch. This proves
   the guard actually catches drift, not just that it runs.

Stage 8 closes (via `stage-closer`) only after steps 3 and 4 have evidence
attached — a green run and a red run, both real.
