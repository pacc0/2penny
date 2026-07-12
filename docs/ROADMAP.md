# ROADMAP.md

**Principio rector:** strangler-fig — v1.0 viva en producción durante todo
el proceso. Cada etapa: objetivo, entregable, evidencia, rollback,
NO-cambia.

## Tabla de estado

| Etapa | Nombre | Estado |
|---|---|---|
| 0 | Spike de infraestructura (Access sobre pages.dev) | ✅ CERRADA 2026-07-09 |
| 1 | Scaffold del monorepo + docs de gobernanza | ✅ CERRADA 2026-07-09 |
| 2 | Endpoint JSON headless en Apps Script (deployment separado) | ✅ CERRADA 2026-07-09 |
| 3 | Shell Svelte 5 + mock data en Pages tras Access | ✅ CERRADA 2026-07-09 |
| 4 | Datos reales vía SvelteKit server route proxy | ✅ CERRADA 2026-07-11 |
| 5 | Rediseño visual Night Ledger | ✅ CERRADA 2026-07-12 |
| 6 | Charts (Chart.js) | 🟡 EN INICIACIÓN — plan pendiente de ratificación |
| 7 | Cutover + retiro del dashboard doGet v1.0 | ⚪ (re-evaluar ADR-0004) |
| 8 | Endurecimiento: clasp-guard.yml, GeminiGate, Canary | ⚪ (re-evaluar ADR-0003) |

## Etapa 0 — evidencia de cierre (registrada)

Hostname `2penny.pages.dev` reservado (proyecto Pages, Direct Upload);
Access sobre producción validado con evidencia de red (cookie
`CF_Authorization` + login real); clasp v3.3.0 logueado
(`camilofu94@gmail.com`, `.clasprc.json` 632B); scaffold mínimo commiteado
(`c4341b1`).

## Etapa 1 — Scaffold del monorepo + docs de gobernanza

- **Objetivo:** estructura de repo, gobernanza escrita, skills del pipeline.
- **Entregable:** /docs (6 archivos), 10 SKILL.md, reviewer subagent,
  workflows CI dormidos, README raíz.
- **Evidencia:** `git log`, `git ls-files` (este plan, Task 14).
- **Rollback:** revert de los commits de la Etapa 1 (sin dependencias
  externas, sin deploy).
- **NO-cambia:** ningún código de producción, Cloudflare, ni el repo legacy.

## Etapa 2 — Endpoint JSON headless en Apps Script

- **Objetivo:** exponer los datos del dashboard como JSON, deployment
  separado del webhook de Telegram.
- **Entregable:** `Api.js` + deployment versionado nuevo con su propia
  `/exec` URL; contrato definido en DATA_CONTRACT.md §3 ANTES del código.
- **Evidencia:** `clasp deployments` mostrando AMBOS deployments
  (webhook + api) con el deploymentId del webhook sin cambios
  (before/after); curl 200 con secret, 401 sin secret.
- **Rollback:** eliminar el deployment nuevo; el webhook no se toca.
- **NO-cambia:** `doPost` del webhook de Telegram, waterfall de
  clasificación, resumen mensual — NUNCA se tocan.

### Etapa 2 — evidencia de cierre (registrada)

6 commits (`2c44e64`..`10fd47f`) pusheados a `origin/master`. `clasp
deployments` BEFORE/AFTER: webhook (`@12`) y dashboard v1.0 (`@20`)
idénticos, un solo deployment nuevo (`@21 "json-api v1 (contract 1.0)"`).
Batería de evidencia 5/5 contra DATA_CONTRACT.md §3. Integridad de webhook:
REAL (primera etapa donde aplica). Ver ADR-0010, ADR-0011, ADR-0012 en
DECISIONS.md (incluye 2 incidentes manejados: `.claspignore` roto,
rotación de secreto).

## Etapa 3 — Shell Svelte 5 + mock data en Pages tras Access

- **Objetivo:** shell estático Svelte 5 (runes) desplegado en Cloudflare
  Pages, con datos mock, protegido por Access.
- **Entregable:** `frontend/` con proyecto Svelte 5, `tokens.css` copia
  verbatim de DESIGN.md §2, adapter-cloudflare.
- **Evidencia:** screenshot del shell tras login de Access; `npm run
  build` exitoso.
- **Rollback:** despublicar el proyecto Pages; v1.0 sigue siendo la
  única fuente real.
- **NO-cambia:** ningún dato real; solo mocks.

### Etapa 3 — evidencia de cierre (registrada)

9 commits (`aea7951`..`9ccaf9c`) pusheados a `origin/master`. Deploy a
Cloudflare Pages proyecto `2penny` rama `main`; alias de producción
`2penny.pages.dev` confirmado protegido por Access (`302`); secciones 1–6
confirmadas en navegador autenticado; CI `frontend-ci` verde (primer run,
`29068207599`). Integridad de webhook: verificada de nuevo, sin cambios.
Ver ADR-0013 en DECISIONS.md — incluye 2 desviaciones aceptadas (Node
22→24; page shell SSR-per-request en vez de prerender estático) y la
primera instancia concreta del gap de ADR-0002 (URL de preview con hash
públicamente alcanzable, solo datos mock por ahora — refuerza el deadline
de cerrar ese gap antes de cerrar la Etapa 4).

## Etapa 4 — Datos reales vía SvelteKit server route proxy

- **Objetivo:** el shell consume el endpoint real de la Etapa 2 a través
  de un server route de SvelteKit como proxy (secret server-side).
- **Entregable:** server route (`+server.js`) que inyecta el secret y
  reenvía al `/exec` de la Etapa 2; live read en cada refresh, sin
  snapshots.
- **Evidencia:** HTTP 200 con datos reales en el shell; HTTP 401 al
  llamar el endpoint sin pasar por el proxy.
- **Rollback:** revertir el proxy al mock (git history); v1.0 no se
  afecta.
- **NO-cambia:** el secreto nunca vive client-side.
- **Gate de cierre:** ADR-0002 (segunda política de Access para previews)
  debe estar resuelto ANTES de cerrar esta etapa.

**CERRADA 2026-07-11.** Gate ADR-0002 resuelto (wildcard
`*.2penny.pages.dev`, preview URLs → 302 de Access). Proxy real con mapeo
401/500/502 (`"upstream"` aditivo, contrato sigue 1.0). Batería completa:
200 datos reales, 401 y 502 forzados en vivo, `/api/dashboard` no público.
Ver ADR-0014 en DECISIONS.md — incluye el incidente de deploy
(`--branch=main` obligatorio: la rama de producción de Pages es `main`,
no `master`) y la nota de que los secretos solo aplican al siguiente
deployment.

## Etapa 5 — Rediseño visual Night Ledger

- **Objetivo:** aplicar el sistema visual completo de DESIGN.md sobre el
  shell con datos reales.
- **Entregable:** componentes Svelte con tokens verbatim, layout
  responsive derivado de la doctrina de breakpoints (768px/480px).
- **Evidencia:** screenshots desktop + Galaxy A56 5G viewport (395×893).
- **Rollback:** revert de los commits de UI; datos y proxy no se tocan.
- **NO-cambia:** ningún token inventado fuera de DESIGN.md.

### Etapa 5 — evidencia de cierre (registrada)

12 commits (`318678a`..`dc3dd0a`) pusheados a `origin/master`, uno por
task del plan v4. Deployment `72a5dcdc` Production/`main`; 302 de Access
en producción y en el hash nuevo (wildcard intacto); CI `frontend-ci`
verde (`29206387119`); datos reales confirmados por Camilo en navegador
autenticado y dispositivo de referencia. Decisión D revisada en el gate de
ejecución: carousel legacy heredado en ≤480px (DESIGN.md §3 re-enmendado).
CLS del swap de skeleton = 0 medido; batería de contraste 13/13 PASS;
integridad de webhook re-verificada (`@12`/`@21` idénticos, cero clasp de
escritura). Cero dependencias npm nuevas (diff de package.json vacío).
Ver ADR-0017 en DECISIONS.md — incluye las 2 notas operativas (junction de
Chrome para Playwright MCP; gap de `npm run check` sin gate en CI como
candidato de backlog).

## Etapa 6 — Charts (Chart.js)

- **Objetivo:** gráficos de gastos por categoría, por método de pago,
  evolución de flujo neto.
- **Entregable:** integración Chart.js siguiendo DESIGN.md §5
  (Components) y anti-slop.
- **Evidencia:** screenshots de cada chart con datos reales.
- **Rollback:** revert de los commits de charts; el resto del shell
  sigue funcionando.
- **NO-cambia:** ninguna métrica nueva — todo trazable a
  DATA_CONTRACT.md §2.

## Etapa 7 — Cutover + retiro del dashboard doGet v1.0

- **Objetivo:** el nuevo shell reemplaza al dashboard v1.0 como fuente de
  verdad visual para el usuario.
- **Entregable:** v1.0 `doGet` marcado deprecated o retirado; usuario
  usando exclusivamente `2penny.pages.dev`.
- **Evidencia:** confirmación explícita de Camilo tras uso real; último
  acceso registrado al `doGet` legacy.
- **Rollback:** re-habilitar `doGet` v1.0 (sigue existiendo hasta este
  punto por diseño strangler-fig).
- **NO-cambia:** `doPost` del webhook de Telegram, waterfall de
  clasificación, resumen mensual — NUNCA se tocan, ni en el cutover.
- **Re-evaluar:** ADR-0004 (archivado del repo legacy).

## Etapa 8 — Endurecimiento

- **Objetivo:** guardrails de producción para operar sin supervisión
  constante.
- **Entregable:** `.github/workflows/clasp-guard.yml` activo (verifica
  deploymentId del webhook tras cada push backend), `GeminiGate.js`
  (cambio de modelo en un solo archivo), `Canary.js` (llamada trivial +
  alerta Telegram).
- **Evidencia:** corrida de clasp-guard en CI; log de Canary.
- **Rollback:** desactivar el workflow (`workflow_dispatch` manual,
  vuelve a inerte).
- **NO-cambia:** el procedimiento de clasp-deploy sigue siendo manual
  para el humano; clasp-guard solo verifica, no publica.
- **Re-evaluar:** ADR-0003 (cuenta clasp dedicada, cuando `CLASPRC_JSON`
  entra a GitHub Secrets).

## Nota de proceso

Las skills `checkpoint-chat`, `checkpoint-code` y `stage-closer` son
entregables de Etapa 1; `stage-closer` debe existir ANTES de cerrar la
Etapa 1 (se usa para cerrarla).
