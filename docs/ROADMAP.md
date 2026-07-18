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
| 6 | Charts (Chart.js) | ✅ CERRADA 2026-07-13 |
| 7 | Cutover + retiro del dashboard doGet v1.0 | ✅ CERRADA 2026-07-13 |
| 8 | Endurecimiento: clasp-guard.yml, GeminiGate, Canary | ✅ CERRADA 2026-07-17 |
| 10 | Desktop layout & design refresh (tipografía, tokens, grid >=1200px) | 🟡 EN CURSO — deploy a producción hecho, pendiente confirmación de Camilo (A56 + desktop) |

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

### Etapa 6 — evidencia de cierre (registrada)

9 commits (`cf9fef7`..`0c4ea2f`) pusheados a `origin/master`. Tres charts
en producción (línea, barra horizontal, doughnut) con carousel de 3 slides
y dots en ≤480px. `chart.js@4.5.1` pin exacto — única entrada nueva en
package.json (transitiva `@kurkle/color@0.3.4` en el lockfile); costo real
de bundle ~61 kB gzip sobre baseline. Deployments Production/`main`:
`80ffe8e1` (Tasks 1–3) y `611add22` (R4, final); 302 de Access en ambas
URLs; CI verde. Check autenticado de Camilo en el A56 real: PASS + R4
(slide de línea 240→320px, espacio muerto verificado 81px→1px). R3:
semántica mensual del flujo neto = concesión temporal, target = feed
diario acumulado (Backlog técnico). Dos bugs legacy encontrados y
corregidos (descriptor de animación; doughnut animando bajo
reduced-motion). Webhook `@12`/json-api `@21` idénticos, cero clasp de
escritura. Ver ADR-0019 en DECISIONS.md.

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

### Etapa 7 — evidencia de cierre (registrada)

6 commits (`b64fc73`..`a0d89f3`) pusheados a `origin/master`, más un
addendum de Task 3 pedido por Camilo tras el check en dispositivo (columna
"Mes" de la tabla de 12 meses comprimida en ≤480px). Deployment @20
(dashboard v1.0) retirado + sweep de @11/@1/@6 — 7→3 deployments, `@12`
(webhook) y `@21` (json-api) byte-idénticos en cada paso. `DashboardPage.html`
(758 líneas) + 5 funciones display-exclusive borradas de `Dashboard.js`;
loaders/aggregators compartidos intactos. `CATEGORY_SHORT` ratificado,
Top-3 de categorías reemplaza la lista de ledger, doughnut slide 280→320px
(espacio muerto 41px→1px). Tres smoke tests de Telegram confirmados vía
lectura autenticada del Sheet. Deploy final Production/`main` (`845924c7`);
ambas URLs 302 de Access. Check autenticado de Camilo en el A56 real: 3/3
PASS (top-3, tooltip, doughnut pinta en dispositivo real — resuelve la
observación de canvas-vacío de Etapa 6 como artefacto de screenshot, no
defecto). Ver ADR-0020 en DECISIONS.md — incluye la supersesión consciente
de D2 (contenido del tooltip) y la concesión de empty-month (R1, diferida).
ADR-0004 superseded: archivado de `pacc0/penny` es acción manual pendiente
de Camilo (Code nunca recibe permisos destructivos de GitHub).

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
  entra a GitHub Secrets) — **resuelto en ADR-0021 D1: cuenta personal
  se mantiene, migración diferida** (trigger: repo público o segundo
  colaborador).

### Cierre (2026-07-17, ADR-0022)

Zero-deployment stage: `clasp push` únicamente, `@HEAD`. `@12`/`@21`
re-verificados byte-idénticos al abrir, dos veces mid-stage, y al cerrar.

- ✅ T0 baseline verificado contra ADR-0020 (sin mismatch).
- ✅ T1 — plan + ADR-0021 (`cfa29b5`).
- ✅ T2 — `clasp-guard.yml` activado, reemplaza el placeholder inerte de
  Etapa 1 (`ae3be0e`).
- ✅ T3 — `GeminiGate.js` creado, `GEMINI_MODEL_`/`GEMINI_API_BASE_URL_`
  relocados desde `GeminiClient.js`, sin cambio de valor (`676ce6d`).
- ✅ T4 — `Canary.js` (`runCanary()`), reutiliza helpers existentes, alerta
  solo en fallo (`6af466b`).
- ✅ FIX-1 (`5376520`) — defecto de escritura de credenciales corregido
  (interpolación directa del secret en `run:` → JSON inválido); patrón
  `env:` + `printf` adoptado, `clasp` fijado a 3.3.0.
- ✅ Evidencia humana ratificada: trigger diario de `runCanary` activo;
  guard run #3 verde (post-`5376520`); guard run #4 rojo (fallo forzado en
  `guard-failure-test`, ambas constantes alteradas, ambas aserciones
  dispararon independientemente; rama eliminada post-prueba).
- Detalle completo, desviaciones aceptadas y evidencia: **ADR-0022**.

## Etapa 10 — Desktop layout & design refresh

- **Objetivo:** tipografía nueva (Space Grotesk + IBM Plex Sans
  Condensed), tokens Night Ledger adicionales (hero tints + delta-on-
  tint), y un grid de escritorio real (>=1200px) — hasta ahora
  "desktop" solo renderizaba la columna angosta de 720px de siempre.
  Alcance: `frontend/` + `docs/` únicamente.
- **Entregable:** 5-row grid >=1200px (header, 4 hero cards
  reordenadas visualmente, netflow+doughnut, payment+Top3/Pendientes,
  tabla de 12 meses partida en dos grupos de 6); tablet (769-1199px) y
  mobile (<=768px) sin cambios estructurales, solo tokens nuevos
  aplicados globalmente + dos eliminaciones (Gastos por cuenta,
  timestamp "generado").
- **Evidencia:** ADR-0024/0025/0026, plan ratificado
  (`docs/plans/stage-10-desktop-refresh.md`), 5 commits
  (`f24f486`..`3629c15`), `npm run check`/`npm run build` exit 0,
  screenshots 1920×1080/1024×768/395×893 (scratchpad de la sesión).
- **Rollback:** revertir los 5 commits del rango — ningún archivo
  `backend/` tocado, sin riesgo de webhook.
- **NO-cambia:** DOM/estructura mobile (<=768px), contrato de datos,
  Chart.js (mismos 3 tipos, mismo registro tree-shaken), webhook `@12`.
- **Deploy a producción:** `f855eb29` (`wrangler pages deploy --branch=main`,
  autorizado explícitamente por Camilo), commit `f8c6b4a`. Verificado
  `Production`/`main` en `wrangler pages deployment list`; ambas URLs
  (`2penny.pages.dev` y el hash) devuelven `302` de Access (wildcard
  intacto). El deploy NO se dispara automático al pushear (corrección de
  la premisa original, ver ADR-0023 assumption error #4) — por eso fue un
  paso manual separado.
- **Pendiente de cierre:** confirmación de Camilo en el A56 real y en un
  desktop real (>=1200px).

## Backlog técnico

- ~~**@21 contract amendment (Stage 6 R3 + Stage 7 R1, bundled):** amend
  the backend JSON contract ONCE to carry BOTH (a) a daily cumulative
  net-flow series, restoring the line chart's daily granularity (Stage 6
  debt), AND (b) a previous-month category breakdown, unblocking the
  Top-3 empty-month fallback (Stage 7 concession). One @21 redeploy for
  both, not two.~~ **✅ ENTREGADO — Etapa 9 (2026-07-18).** Contract 1.1
  live in production: `daily_net_flow` + `previous_month` delivered in a
  single in-place @21 redeploy (deploymentId
  `AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF`
  unchanged, version 21→22; webhook `@12` untouched throughout). Backend:
  `dd7e996`. Frontend consumption: `1c291d4`. `formatDayMonth` is live
  again (zero call sites → restored). Governance: ADR-0023 (+ D6-R1,
  closure notes). Evidence: `docs/evidence/stage-9/`.
- **`npm run check` sin gate en CI:** candidato registrado al cierre de
  Etapa 5 (ADR-0017, nota operativa 2).
- **Optional "today" header label** — must derive from `daily_net_flow`
  last entry per DASHBOARD.md §2.4 (never client clock). Registered
  Stage 9 T8 (item 0 ruling): the 2penny header shows no "today"
  element today (period.month + generated_at only), so the guarantee
  holds vacuously; a visible "hoy" label is a product decision, not a
  correctness gap.

## Nota de proceso

Las skills `checkpoint-chat`, `checkpoint-code` y `stage-closer` son
entregables de Etapa 1; `stage-closer` debe existir ANTES de cerrar la
Etapa 1 (se usa para cerrarla).
