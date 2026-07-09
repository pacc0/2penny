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
