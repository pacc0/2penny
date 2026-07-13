# DECISIONS.md

Registro de ADRs. Formato: contexto → decisión → evidencia/justificación →
fecha. Revocar exige entrada nueva, no edición.

## ADR-0001 — Cloudflare Pages sobre Workers (plataforma frontend)

**Contexto:** detour evaluando Workers Sites/estático.
**Decisión:** Cloudflare Pages (Direct Upload) + Pages Functions.
**Justificación:** integración Access validada en Etapa 0 con evidencia
(cookie `CF_Authorization`), modelo estático + proxy encaja exacto, adapter
oficial `@sveltejs/adapter-cloudflare`, `adapter-cloudflare-workers`
deprecado. Confirmado explícitamente por Camilo.
**Fecha:** 2026-07-09.

## ADR-0002 — Gap de Access en preview URLs (riesgo aceptado temporal)

**Contexto:** el fix del wildcard para proteger producción REEMPLAZÓ la
cobertura de previews (`hash.2penny.pages.dev` quedó público) en vez de
sumarla.
**Decisión:** riesgo aceptado mientras no haya datos reales. **Deadline
duro: crear la segunda política de Access ANTES de cerrar la Etapa 4**
(primer cableado de datos financieros reales). stage-closer debe verificar
esto en el cierre de Etapa 4.
**Fecha:** 2026-07-09.

## ADR-0003 — clasp con cuenta personal

**Contexto:** migración completa del backend Apps Script.
**Decisión:** `camilofu94@gmail.com` durante toda la migración.
Re-evaluación obligatoria en Etapa 8, cuando `CLASPRC_JSON` entre a GitHub
Secrets (ahí el riesgo de rotación de credenciales se vuelve real).
**Justificación:** migrar ownership de Apps Script con webhook activo es
fricción real hoy; el beneficio de la cuenta dedicada solo se materializa
en Etapa 8.
**Fecha:** 2026-07-09.

## ADR-0004 — Repo legacy `pacc0/penny` permanece activo

**Contexto:** referencia de consulta durante la migración.
**Decisión:** mantener el repo legacy activo, no archivarlo aún.
**Riesgo aceptado:** commit accidental al repo equivocado. **Mitigación:**
verificar `git remote -v` al inicio de cada sesión de Claude Code (regla en
CLAUDE.md). Re-evaluar archivado en Etapa 7 (cutover).
**Fecha:** 2026-07-09.

## ADR-0005 — Reviewer como subagent de contexto fresco

**Contexto:** decidir si el pipeline Developer → Reviewer usa un subagent o
una skill en el hilo principal.
**Decisión:** única excepción de subagent del proyecto
(`.claude/agents/reviewer.md`, read-only: Read, Grep, Glob, Bash; sin
Edit/Write).
**Justificación:** el aislamiento de contexto es la feature (revisión sin
los supuestos del autor). Architect/Guardian/Developer siguen siendo
skills en el hilo principal (los gates deben ser visibles).
**Fecha:** 2026-07-09.

## ADR-0006 — Disciplina de output terso

**Contexto:** evaluación de la skill "caveman" para forzar tersedad.
**Decisión:** reversión parcial del descarte de "caveman": la terseness se
adopta como regla de CLAUDE.md (no como skill), con evidencia inline
obligatoria (exit codes, hashes, HTTP status).
**Fecha:** 2026-07-09.

## ADR-0007 — Motor de grafos rechazado

**Contexto:** propuesta de un graph engine / Graphify para visualizar
transacciones.
**Decisión:** rechazado — falla el filtro de cinco principios.
**Justificación:** Sankey vía `chartjs-chart-sankey` queda como
complejidad diferible, no descartada.
**Fecha:** 2026-07-09.

## ADR-0008 — Anti-slop vía design-tokens + DESIGN.md

**Contexto:** dónde vive el enforcement de gusto visual.
**Decisión:** el enforcement de gusto visual vive en la skill
`design-tokens` (tiempo de escritura de código) y en DESIGN.md
§Anti-slop (governance). No se crea skill `ui-taste` separada
(duplicación).
**Fecha:** 2026-07-09.

## ADR-0009 — Cierre Etapa 1 (scaffold + gobernanza)

**Contexto:** Etapa 1 (scaffold del monorepo + docs de gobernanza)
completada task por task según `docs/plans/stage-1-scaffold-plan.md`.
**Decisión:** cerrar la Etapa 1, marcar la Etapa 2 como próxima activa.
**Evidencia:** 9 commits (`c4341b1`..`e2d8fc0`); 6 docs de gobernanza en
`docs/`; 10 `SKILL.md` en `.claude/skills/`; 1 subagent reviewer en
`.claude/agents/`; 2 workflows CI dormidos en `.github/workflows/`;
`README.md` raíz. Integridad de webhook: sin cambios — `backend/`
contiene únicamente el stub `README.md` (commit `0fd402a`), ningún
comando `clasp` fue ejecutado en esta etapa (no aplica aún, sin código
Apps Script en el repo).
**Fecha:** 2026-07-09.

## ADR-0010 — Auth de dos capas del endpoint JSON

**Contexto:** Apps Script no emite códigos HTTP custom (`ContentService`
siempre responde 200); el endpoint JSON headless necesita autenticación.
**Decisión:** auth de dos capas. Capa 1 (`doGet`, Etapa 2) valida
`e.parameter.key` contra `API_SECRET` en Script Properties; sin match →
`error` en el body (HTTP 200). Capa 2 (Pages Function, Etapa 4) traduce
`error != null` a status HTTP real (401/500) antes de llegar al navegador.
El secreto viaja por query param porque `doGet` no puede leer headers;
mitigado porque solo la Pages Function, server-side, conoce y llama esa URL.
**Justificación:** enmienda a la restricción ratificada originalmente
("secret requerido, 401 sin él"), necesaria por la limitación dura de
Apps Script de no poder emitir códigos HTTP custom. Aprobada por Camilo
2026-07-09.
**Fecha:** 2026-07-09.

## ADR-0011 — Estrategia doGet: rename + pinning

**Contexto:** un proyecto Apps Script admite un solo `doGet` global; el
deployment v1.0 (dashboard HTML) y el nuevo endpoint JSON no pueden
coexistir como dos funciones `doGet` distintas en el mismo @HEAD.
**Decisión:** el legacy `doGet` (dashboard HTML, en `Dashboard.js`) se
renombra a `doGet_legacy_v1`. El deployment v1.0 queda pinneado a la
versión previa (snapshot inmutable de código) y JAMÁS se bumpea a una
nueva versión; se retira en Etapa 7. El nuevo `doGet` (en `Api.js`) sirve
el endpoint JSON, desplegado como un deployment NUEVO — excepción
documentada de la disciplina clasp-deploy ("nunca crear deployment
nuevo"), que protege endpoints EXISTENTES, no aplica a un endpoint nuevo.
**Fecha:** 2026-07-09.

## ADR-0012 — Cierre Etapa 2 (endpoint JSON headless)

**Contexto:** Etapa 2 completada task por task según
`docs/plans/stage-2-json-endpoint-plan.md`.
**Decisión:** cerrar la Etapa 2, marcar la Etapa 3 como próxima activa.
**Evidencia:** 6 commits (`2c44e64`..`10fd47f`), pusheados a
`origin/master`. `clasp deployments` BEFORE/AFTER: 6 → 7 deployments;
webhook (`...4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12`) y dashboard v1.0
(`...HtY1ivOy_Sq @20`) idénticos antes/después — verificado dos veces
(durante la Tarea 5 y de nuevo en el cierre); un solo deployment nuevo
agregado (`...H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF
@21 "json-api v1 (contract 1.0)"`). Batería de evidencia 5/5: key válida →
JSON completo validado contra DATA_CONTRACT.md §3 (12 filas en
`net_flow_series`, sin montos negativos, `error: null`); sin key y con key
incorrecta → mismo `{"contract_version":"1.0","error":"unauthorized"}`;
webhook de Telegram vivo (mensaje de prueba llegó a Transactions); dashboard
v1.0 sigue sirviendo HTML en su versión pinneada. **Integridad de webhook:
REAL, no N/A** — primera etapa donde esta verificación aplica de verdad.

**Incidentes manejados durante la etapa:**
1. **`.claspignore` roto (commit `b970c96`).** `clasp push` reportó "Script
   is already up to date" sin pushear nada; `clasp status` confirmó que
   `backend/src/` entero quedó como "Untracked". Causa raíz: clasp resuelve
   los patrones de `.claspignore` relativos a `rootDir` (`src`), no a la
   raíz del repo — el patrón original (`**/**` + `!src/**`) ignoraba todo.
   Corregido con patrones relativos a `rootDir` antes de crear el
   deployment nuevo (Tarea 5). Sin impacto en producción — detectado antes
   del deploy, no después.
2. **Rotación de `API_SECRET` a mitad de etapa (reportado por Camilo, NO
   verificado con evidencia de comando en esta sesión).** Camilo reporta
   que el secreto fue rotado tras una fuga y que la key vieja/filtrada
   ahora responde `unauthorized`. Se registra como evidencia narrada de
   Camilo, no como evidencia verificada por Claude Code — distinción
   explícita por la regla de evidencia-sobre-narrativa. No bloquea el
   cierre porque el comportamiento esperado (key inválida → `unauthorized`)
   ya quedó verificado con evidencia de comando real en la batería 5/5
   (evidencias 2 y 3, este mismo cierre).

**Fecha:** 2026-07-09.

## ADR-0013 — Cierre Etapa 3 (shell Svelte 5 + mock proxy)

**Contexto:** Etapa 3 completada task por task según
`docs/plans/stage-3-svelte-shell-plan.md`.
**Decisión:** cerrar la Etapa 3, marcar la Etapa 4 como próxima activa.
**Evidencia:** 9 commits (`aea7951`..`9ccaf9c`), pusheados a
`origin/master`. Deploy a Cloudflare Pages, proyecto `2penny`, rama `main`
(`https://b06ac578.2penny.pages.dev`, 14 archivos); alias de producción
`2penny.pages.dev` confirmado protegido por Access (`curl -sI` → `302` a
`cloudflareaccess.com`); Camilo confirmó en navegador autenticado: secciones
1–6 del dashboard renderizan, `/api/dashboard` sirve el mock JSON detrás de
Access. CI `frontend-ci` corrió por primera vez (path filter ahora aplica) —
run `29068207599`, verde. **Integridad de webhook: verificada de nuevo**,
`clasp deployments` — `...4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W @12` idéntico a la
línea base del cierre de Etapa 2; ningún comando de escritura clasp/backend
se ejecutó esta etapa.

**Desviaciones del plan ratificado (ambas aceptadas por Camilo):**
1. **Node 22 → 24.** La máquina de desarrollo corre Node 24, no 22 como
   originalmente scaffoldeado en Etapa 1 / planeado en el plan de Etapa 3.
   Corregido bumpeando `frontend-ci.yml` (commit `667bccc`) y enmendando
   inline la precondición Task 0 del plan de Etapa 3 (commit `2bc81ea`), en
   vez de fijar el entorno de desarrollo a un runtime obsoleto.
2. **Prerender.** La Task 2 del plan ratificado fijó `+layout.js` con
   `prerender = true`, buscando un shell estático. Esto entraba en conflicto
   directo con la regla de DATA_CONTRACT.md §3 ("live read en cada refresh,
   sin snapshots cacheados"), porque el `load()` de `+page.js` lee
   `/api/dashboard` y, sin corrección, habría quedado horneado en HTML
   estático en tiempo de build. Verificado: antes del fix,
   `.svelte-kit/output/prerendered/pages/index.html` se generaba; tras
   agregar `export const prerender = false` en `+page.js`, ese output
   estático desapareció y la ruta pasó a aparecer en el bundle del
   worker/servidor (`entries/endpoints/api/dashboard/_server.js`), no como
   archivo estático. Aceptado porque el shell estático era un medio
   (velocidad), no un fin, y la regla de live-read del contrato gana. El
   shell de la página ahora es SSR-por-request, no prerenderizado estático.

**Nota — primera instancia concreta del gap de ADR-0002:** la URL de
preview con hash de esta etapa (`https://b06ac578.2penny.pages.dev`) es
públicamente alcanzable SIN protección de Access — confirmado: solo el
alias de producción `2penny.pages.dev` devolvió `302` de Access; la URL de
preview con hash respondió `HTTP 200` con el contenido real del mock, sin
challenge de auth. Hasta ahora el riesgo de ADR-0002 era teórico/aceptado;
esta etapa lo demuestra con un deployment real. Actualmente solo expone
datos MOCK (sin datos financieros reales todavía), pero esto refuerza el
deadline duro de ADR-0002: la segunda política de Access que cubra URLs de
preview debe resolverse ANTES de cerrar la Etapa 4 — la etapa donde datos
financieros reales fluirán por primera vez por esta misma superficie de
preview URLs.
**Fecha:** 2026-07-09.

## ADR-0014 — Cierre Etapa 4 (datos reales vía server route proxy)

**Contexto:** Etapa 4 completada task por task según
`docs/plans/stage-4-real-data-plan.md`. Corrección de terminología aplicada
en HANDOFF.md, ROADMAP.md y DATA_CONTRACT.md: el proxy es un server route
de SvelteKit (`+server.js`, adapter-cloudflare), no una "Pages Function"
separada.
**Decisión:** cerrar la Etapa 4, marcar la Etapa 5 como próxima activa.
**Evidencia:**
- **Gate ADR-0002 RESUELTO (Task 1, hard stop):** segunda aplicación de
  Access con wildcard `*.2penny.pages.dev` creada por Camilo (dashboard,
  sin tocar la app existente). Verificado:
  `curl -sI https://b06ac578.2penny.pages.dev` → `HTTP/1.1 302 Found`,
  `Location: https://2penny-pages.cloudflareaccess.com/...` — capturado dos
  veces (apertura del gate y cierre de etapa). El wildcard cubre también
  los hashes nuevos generados durante la etapa (`05a342b7`, `f56010a9`:
  ambos 302).
- **Secretos (Task 2):** `APPS_SCRIPT_EXEC_URL` y `API_SECRET` cargados
  por Camilo vía dashboard (Production, tipo Secret). Resolución de
  `platform.env` probada por el happy path desplegado (no por narrativa).
- **Proxy real (Task 3, commit `a91bef7`):** fetch al `/exec` de Etapa 2
  con secret server-side, timeout 25s (`AbortSignal.timeout`),
  `Cache-Control: no-store` en toda respuesta. Mapeo:
  `"unauthorized"` → 401, cualquier otro `error != null` del backend → 500,
  `"upstream"` (proxy-generado: timeout / red / no-JSON) → 502,
  `error: null` → 200 passthrough.
- **Contrato (Task 4, commit `bf9147a`):** enmienda aditiva `"upstream"`
  en DATA_CONTRACT.md §3, sin bump de versión (sigue `"1.0"`).
- **Batería (Task 5):** 200 con datos reales en el shell tras Access
  (observado por Camilo, deployment `f56010a9`); 401 `"unauthorized"`
  forzado con `API_SECRET` corrupto (deployment `f9e9dc3c`); 502
  `"upstream"` forzado con URL muerta (deployment `1e07b2d2`); happy path
  re-verificado tras restaurar (200, datos reales). El modo `"internal"`
  (500) no es disparable en vivo sin corromper estado del backend —
  documentado por inspección de código (bindings de `platform.env`
  ausentes también → 500 `"internal"`). `/api/dashboard` sin autenticar →
  302 de Access (el proxy no es públicamente alcanzable).
- **Integridad de webhook:** `clasp deployments` (read-only) al cierre:
  7 deployments, webhook `...WLNnIxDDeWDvCPMc4e5W @12` idéntico al
  baseline de Etapa 3. Cero comandos clasp de escritura en la etapa.

**Incidente manejado durante la etapa:** el primer deploy usó
`--branch=master` (rama git del repo) y aterrizó como **Preview** — la
rama de producción del proyecto Pages es `main`, no `master`. Producción
siguió sirviendo el mock de Etapa 3 hasta el re-deploy con
`--branch=main` (deployment `d0e4ba1d`, verificado `Production` en
`wrangler pages deployment list`). Landmine registrado: todo
`wrangler pages deploy` debe llevar `--branch=main`. Nota operativa
adicional: cambios de secretos en Pages solo aplican en el SIGUIENTE
deployment (no al guardar), por eso cada toggle de la batería requirió
re-deploy.
**Fecha:** 2026-07-11.

## ADR-0015 — Excepción de gradiente de luminancia; glassmorphism rechazado sin excepciones

**Contexto:** arranque de Etapa 5 (rediseño visual Night Ledger). Se evaluó
el repo externo `nextlevelbuilder/ui-ux-pro-max-skill` como fuente de
patrones y la pregunta de si DESIGN.md §4 admite algún gradiente.
**Decisión (tres partes, ratificadas por Camilo 2026-07-12):**
1. **Gradientes de luminancia permitidos (enmienda aditiva a DESIGN.md §4):**
   linear gradients cuyos DOS extremos son tokens de superficie existentes
   (`--surface` → `--surface-raised`, o cualquiera de los dos → `--bg`),
   usados únicamente para sugerir caída de luz en cards/superficies. Los
   gradientes de matiz (hue) siguen siendo FAIL duro. Los gradientes
   decorativos de cualquier color saturado siguen siendo FAIL duro.
2. **Glassmorphism / `backdrop-filter`: evaluado y RECHAZADO explícitamente
   por Camilo.** Sigue siendo FAIL duro SIN excepciones — incluidos sticky
   headers. No se re-litiga casualmente; revocar exige ADR nuevo.
3. **`nextlevelbuilder/ui-ux-pro-max-skill` RECHAZADO como fuente de
   patrones:** no se instala, no se importa, no se emulan sus defaults
   (asume Tailwind/shadcn y recomienda glassmorphism/gradientes/paletas
   SaaS claras — todos FAIL duro bajo §4).
**Fecha:** 2026-07-12.

## ADR-0016 — Fuentes self-hosted en Cloudflare Pages (supersede parcial del ADR-0003 legacy)

**Contexto:** la Etapa 5 exige cargar las fuentes de doctrina (Nunito
Variable, Averia Sans Libre): los tokens `--font-text` / `--font-numeric`
las nombran pero nada las carga — producción renderiza hoy los fallbacks
(Trebuchet/Segoe). El ADR-0003 del repo legacy `pacc0/penny` fijó la
entrega vía CDN jsdelivr y rechazó el self-hosting de woff2 porque Apps
Script/HtmlService no tiene hosting de assets estáticos.
**Decisión (ratificada por Camilo 2026-07-12):** self-hostear los woff2 en
`frontend/static/fonts/` + `@font-face`. Se supersede ÚNICAMENTE el
mecanismo de entrega del ADR-0003 legacy; la adopción tipográfica (Nunito +
Averia) queda intacta.
**Justificación:** la restricción que forzó el CDN es nula en Cloudflare
Pages — `frontend/static/` es hosting estático nativo y gratuito. El pin a
jsdelivr fue un second-best forzado por el entorno viejo. Self-host es
estrictamente mejor en el nuevo: cero dependencia runtime de terceros (las
fuentes sobreviven una caída de jsdelivr), cero requests a terceros, edge
cache gratis, same-origin.
**Alcance:** 3 archivos exactos — Nunito Variable (un variable-file cubre
500/700), Averia Sans Libre 400 y 700 (la 300 existe pero no se usa: no se
embarca, cero dead weights). Subset `latin` únicamente (cubre ñ/á/é/í/ó/ú/ü;
NO latin-ext). `font-display: swap`; preload opcional de la face
above-the-fold. `@font-face` conecta archivos a los tokens EXISTENTES —
cero valores de token tocados (Verbatim Token Rule intacta). Assets
estáticos, no dependencias npm; costo cero.
**Nota de trazabilidad:** el ADR-0003 supersedido es el del repo LEGACY
`pacc0/penny` (entrega de fuentes). El ADR-0003 de ESTE repo (clasp con
cuenta personal) no tiene relación alguna y no se toca. La línea de estado
"Superseded in part by ADR-0016 (font delivery mechanism)" pertenece al
DECISIONS.md del legacy, que este repo no edita (ADR-0004: legacy es solo
consulta) — queda pendiente de Camilo registrarla allá si lo desea.
**Fecha:** 2026-07-12.

## ADR-0017 — Cierre Etapa 5 (rediseño visual Night Ledger)

**Contexto:** Etapa 5 ejecutada task por task según
`docs/plans/stage-5-night-ledger-plan.md` v4 (`318678a`). Las dos
confirmaciones pendientes del gate se resolvieron en la sesión de
ejecución: **decisión D REVISADA** (el carousel scroll-snap del legacy en
≤480px SÍ se hereda — DESIGN.md §3 re-enmendado; implementación de
referencia `backend/src/DashboardPage.html` Rounds 13–15) y focus ring
confirmado en `--ink` neutro.
**Decisión:** cerrar la Etapa 5, marcar la Etapa 6 (Charts) como próxima
activa.
**Evidencia:**
- **Commits de etapa:** `318678a`..`dc3dd0a` (12 commits, uno por task más
  gate/evidencia), pusheados a `origin/master`.
- **Fuentes (Task 2, ADR-0016):** exactamente 3 woff2 latin en
  `frontend/static/fonts/` (37.6/38.3/39.1 KB, magic `wOF2` verificado);
  `GET /fonts/nunito-variable.woff2` → 200; font-family computada en
  `main` → `"Nunito Variable"`; preload con `crossorigin`.
- **Skeleton streaming (Task 4):** `+page.js` retorna la promesa sin
  await (`prerender = false` intacto, un solo fetch por request); CLS del
  swap = **0** (PerformanceObserver, cero entradas layout-shift) tras
  line-height explícito (line boxes inmunes al font swap) y
  `table-layout: fixed`.
- **KPI heroes (Task 5):** supuesto `net_flow_series[11].month ===
  period.month` demostrado por construcción en `backend/src/Api.js`
  (mismo `todayIso` genera ambos) y verificado en payload en vivo
  (`assumptionHolds: true`). Gradiente de luminancia con extremos
  `--surface-raised`→`--surface` (ADR-0015); grep del diff: cero
  `box-shadow|backdrop-filter|blur`.
- **Ledger (Task 6):** columnas numéricas en Nunito + `tabular-nums`
  (decisión A, sin monospace); todo monto coloreado lleva signo explícito;
  cero zebra; hairlines únicos.
- **Estados (Task 7, decisión C):** empty de pendientes con CERO CTA
  (grep del bloque: 0 anchors/buttons); errores renderizan el valor de
  contrato verbatim (`upstream` 502 vía socket muerto, `unauthorized` 401)
  con `--alert-red` solo en la palabra de estado; cero fugas
  (`script.google|APPS_SCRIPT|key=`: 0 hits en markup renderizado).
- **Responsive (Task 8, decisión D revisada):** A56 395×893 — slide
  364px = viewport del track (1 slide por página), sin scroll horizontal
  del body (medido `false`), dot activo avanza 0→1 con scroll
  programático; 768/1024 y 1280/800 — track `display: contents`, dots
  `none`. Tabla de 12 meses scrollea dentro de `.table-scroll`.
- **Contraste/a11y (Task 9):** 13/13 pares WCAG PASS computados (peor:
  `--alert-red`/`--bg` 5.23:1 ≥ 4.5); ring de 2px `--ink` visible en las
  dos regiones scrolleables enfocables por teclado
  (`docs/evidence/stage-5/task9-contrast.txt`).
- **Deploy (Task 10):** `npm run check` 0 errores, `npm run build` exit 0;
  deployment `72a5dcdc` **Production**, branch `main` (ADR-0014
  respetado); `curl -sI` → 302 Cloudflare Access en `2penny.pages.dev` y
  en `72a5dcdc.2penny.pages.dev` (wildcard intacto); CI `frontend-ci`
  verde (run `29206387119`); datos reales confirmados por Camilo en
  navegador autenticado (dispositivo de referencia incluido).
- **Integridad de webhook:** `clasp deployments` (read-only) al cierre:
  7 deployments idénticos al baseline de Etapa 4 — webhook
  `...WLNnIxDDeWDvCPMc4e5W @12` y json-api `@21` sin cambios. Cero
  comandos clasp de escritura en la etapa (el mock de desarrollo fue un
  server Node local en `127.0.0.1:8788`; ningún deployment de Apps Script
  creado por ningún medio).
- **Gaps de gobernanza pre-cierre (resueltos con evidencia):**
  `frontend/.dev.vars` contiene solo dummies (`127.0.0.1:8788` +
  `dev-mock`), nunca entró a la historia (`git log --all` vacío,
  `.gitignore:9`); `git diff 160cc25..dc3dd0a -- frontend/package.json`
  vacío (cero dependencias npm nuevas, lockfile incluido); el fold del
  pending-hero NO tiene equivalente en el nuevo shell (no existe
  pending-hero; registrado en DESIGN.md §3 línea 98 y plan v4, `318678a`).

**Notas operativas:**
1. **Junction de Chrome (tooling, reversible):** Playwright MCP exige
   Chrome en `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`; la
   máquina no tiene Chrome/Edge y el instalador del sistema pide admin.
   Se creó una junction NTFS
   `%LOCALAPPDATA%\Google\Chrome\Application` →
   `%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64` (Chrome for
   Testing 149, cache de usuario, sin admin, costo cero). Reversión:
   `Remove-Item "$env:LOCALAPPDATA\Google\Chrome\Application"` (borra solo
   la junction). Quitarla antes de instalar Chrome real.
2. **`npm run check` no gatea en `frontend-ci.yml` (candidato a backlog,
   NO se cierra en esta etapa):** descubierto en Task 4 — el HEAD de
   Etapa 4 traía 3 errores de svelte-check (2× tipado `Platform.env` en
   `+server.js`, 1 implicit-any) con CI verde (`29068207599`), demostrado
   con stash-run de `npm run check` sobre HEAD limpio. Corregido en etapa
   vía declaración `App.Platform.env` en `app.d.ts` (`878d105`); check
   ahora 0 errores. Añadir check como gate de CI queda como candidato de
   backlog para una etapa futura (fuera de alcance aquí).
**Fecha:** 2026-07-12.

# ADR-0018 — Chart library for the 2penny frontend: Chart.js 4.5.1 via npm, tree-shaken, no wrapper

**Status:** RATIFIED — chat session 2026-07-12 (Camilo). Pending registration in `docs/DECISIONS.md` (Stage 6 plan, Commit 0a).
**Stage:** 6 (Charts)
**Supersedes:** the delivery mechanism of legacy ADR-0001's charting validation (jsdelivr CDN inside the HtmlService sandbox). The library choice itself is continuity; the delivery mechanism changes.

## Context

Stage 6 integrates the three dashboard charts (Evolución del Flujo Neto — line; Gastos por Método de Pago — horizontal bar; Gastos por Categoría — doughnut) into the Svelte 5 shell, fed by real data via the `/api/dashboard` proxy.

The legacy dashboard pinned Chart.js 4.5.1 from the jsdelivr CDN because the HtmlService sandbox allowed no build step. 2penny has a real build (SvelteKit + Vite on Cloudflare Pages), so the decision was formally re-opened at Stage 5 closure ("Explicitly NOT decided") and re-evaluated against the five-principles filter rather than inherited by inertia.

Constraints that bind any candidate:

- Must render all three chart types in the frozen DASHBOARD.md v2.2 contract, including a doughnut with per-category palette, no legend, and emoji-title tooltips.
- Must support the mandatory touch-tooltip pattern from DESIGN.md §5 (`enableTapTooltip`, mouse-only `options.events`, non-passive `touchstart` + manual hit test) — battle-tested on the reference device (Galaxy A56).
- `prefers-reduced-motion` support, Night Ledger tokens, es-CO formatting.
- Zero monetary cost; single new dependency at most; acceptable bundle weight on mid-range mobile.

## Options considered

1. **Chart.js 4.5.1 via npm, tree-shaken manual registration, no wrapper — SELECTED.**
   Covers all three chart types natively. DESIGN.md §5 is already written in Chart.js 4.x vocabulary (borderRadius/spacing/cutout mappings, `Chart.defaults` typography/ink rules), and the hard-won `enableTapTooltip` helper ports logic-verbatim. Verified 2026-07-12: v4.5.1 remains the latest release — the pinned legacy version has zero API drift. npm + `package-lock.json` gives a reproducible exact pin and removes the runtime CDN dependency the legacy ADR accepted as a trade-off (net improvement). Tree-shaken registration (only the three controllers, their elements, two scales, and the Tooltip plugin) keeps the bundle well under the full ~70KB build.

2. **Native Svelte SVG (zero dependencies) — REJECTED (principles 2, 5).**
   Its only virtue is zero deps. It re-solves solved problems: arc math for the doughnut, axis/scale layout, resize handling, tooltip positioning, and — critically — the touch-race mitigation that took multiple on-device rounds to get right in the legacy. Perpetual maintenance debt on artisanal chart code for one user.

3. **uPlot (~15KB) — REJECTED (hard technical disqualification).**
   uPlot is a time-series/XY engine by design; it does not render doughnut/pie charts. Adopting it would force either (a) redefining the category chart's type, which violates the frozen DASHBOARD.md v2.2 content contract this stage may not touch, or (b) a second library for the doughnut alone — two solutions for one problem, failing principles 2 and 3 simultaneously.

4. **D3 (modular) — REJECTED (principles 2, 3, 4).**
   Low-level power tooling for bespoke data-viz. Every interaction (tooltips, touch, transitions) is hand-built. Massive over-capability for three static personal-finance charts.

5. **Svelte wrappers (svelte-chartjs, LayerChart) — REJECTED (principle 3).**
   A wrapper inserts a young dependency between Svelte 5 runes and the library to save roughly 30 lines of `$effect`/`onDestroy` lifecycle code per component. Chart.js is instantiated directly in the component lifecycle instead.

6. **CDN continuity (jsdelivr pin, literal legacy port) — REJECTED.**
   The CDN's only justification was the sandbox, which no longer exists. npm + lockfile is strictly superior: reproducible builds, tree-shaking, no external runtime network dependency.

## Decision

Add `chart.js@4.5.1` (exact pin, `--save-exact`) as the frontend's charting dependency. Register components manually in a single module (`frontend/src/lib/charts/registry.ts`): `LineController`, `BarController`, `DoughnutController`, `LineElement`, `PointElement`, `BarElement`, `ArcElement`, `CategoryScale`, `LinearScale`, `Tooltip`. No wrapper library. Chart instances are created and destroyed directly inside Svelte 5 component lifecycles.

Companion decisions ratified in the same session:

- **Verbatim-logic port:** the legacy `enableTapTooltip` heuristic and the DESIGN.md §5 chart options are ported with their internal logic intact; only the lifecycle adapts to runes.
- **Category palette home:** `CATEGORY_COLOR` (14 entries) and `CATEGORY_EMOJI` (18 entries) live as strictly-typed TS constants in `lib/` — they are data dictionaries, not surface tokens. Values copied byte-identical from the legacy reference.
- **Mobile strategy:** `maintainAspectRatio: false` + fixed-height parent container per carousel slide; the canvas fills 100% of that bounding box.
- **Semantic-hue bridge (P1, ratified):** a `token(name)` helper (single `getComputedStyle(document.documentElement)` read per token at chart init — the legacy pattern) bridges exactly four surface tokens into chart configs: `--income-green`, `--expense-coral`, `--hairline`, `--ink-muted`. This preserves the Verbatim Token Rule's single source of truth (`tokens.css`); no hex value is retyped in TS. The category palette remains a pure TS dictionary per the prior bullet. *Amended 2026-07-12: token() bridge extended to `--font-text` (five tokens total), same single-source rationale; retyping the font stack in TS would violate the Verbatim Token Rule for the same reason as the four hues.*
- **Lifecycle adaptation (ratified):** the ported `tapTooltip.ts` returns a cleanup function removing both its listeners (canvas-level and document-level) for use in the component's `$effect` teardown — a lifecycle adaptation within the verbatim-logic mandate, not a heuristic change (the legacy page never unmounts; Svelte components do).

## Consequences

**Benefits:** DESIGN.md §5 remains valid vocabulary with a one-line delivery amendment (CDN → npm) instead of a rewrite; the touch-tooltip asset is preserved; exact-pin reproducibility; runtime CDN dependency eliminated; tree-shaken bundle footprint.

**Trade-offs accepted:** first charting dependency enters `frontend/package.json` (the diff was deliberately zero through Stage 5); canvas rendering means chart internals are not styleable via CSS tokens directly — semantic hues must be bridged into JS (mechanism specified in the Stage 6 plan).

**Risks:** none novel. v4.5.1 is the current release; if a future 4.x patch lands, the exact pin means upgrades are deliberate, ADR-gated decisions, consistent with the Gemini-deprecation lesson.

## Validation required (encoded as Stage 6 plan evidence)

- Bundle: build output showing the chart chunk size with tree-shaken registration.
- On-device (A56): tap tooltip works on all three charts; tap-outside dismisses; desktop hover unaffected.
- `prefers-reduced-motion`: animations fully disabled.
- Console clean; CI green; webhook deployment @12 byte-identical (read-only check).