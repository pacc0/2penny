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

# ADR-0019 — Stage 6 closure: three charts live, Chart.js integrated tree-shaken, webhook untouched

**Status:** CLOSURE RECORD — 2026-07-13. Authenticated real-data check by Camilo on the reference device (Galaxy A56): PASS, with one visual amendment (R4).
**Stage:** 6 (Charts) — CERRADA.

## Per-task evidence (commit hashes)

- `cf9fef7` docs(governance): Stage 6 plan v1 + ADR-0018 ratified verbatim.
- `bf26849` Commit 0a: DESIGN.md §5/§6 ported from legacy with npm-delivery + sandbox-scope amendments; height table filled verbatim from `backend/src/DashboardPage.html` (line `flex:1;min-height:240px`, bar `320px`, doughnut `312px` / `280px` ≤768px); plan → v2. Extraction finding: legacy charts were never carousel slides.
- `45c90b3` Commit 0b: `chart.js@4.5.1` exact pin; `registry.ts` (tree-shaken registration: 3 controllers, 4 elements, 2 scales, Tooltip + `token()` bridge + legacy defaults block, SSR-guarded); `tapTooltip.ts` (logic-verbatim, returns teardown per D7); `palette.ts` (`CATEGORY_COLOR` 14 / `CATEGORY_EMOJI` 18, byte-identical, typed); `formatCOP`/`formatCompactCOP`/`formatDayMonth` ported into `lib/format.js` (absent from Stage 5 — only `formatCurrency` existed). svelte-check 0 errors.
- `3133f5c` R1/R2 docs: D6 token list → five tokens (`--font-text` added, Verbatim Token Rule rationale); slide-height column ratified.
- `4fbb012` Task 1 — Evolución del Flujo Neto (line): `NetFlowChart.svelte`, `$effect` lifecycle (chart.destroy + tapTooltip teardown), config logic-verbatim. Evidence: desktop + A56 screenshots, tap/dismiss/hover proofs, reduced-motion `options.animation === false`, console clean.
- `8feb6a5` R3 docs: monthly net-flow semantics + daily-feed debt registered (see R3 below).
- `4447fe9` Task 2 — Gastos por Método de Pago (horizontal bar): `PaymentMethodChart.svelte` logic-verbatim; chart-carousel dots activated (Stage 5 dot spec); truncation verified (18-char boundary intact; 30-char → 17+`…`). Same evidence battery.
- `02a92f0` Task 3 — Gastos por Categoría (doughnut): `CategoryChart.svelte` logic-verbatim; unmapped-category fallback proven with a temporary mock row (`--ink-muted` arc + name-title tooltip; zero production data); emoji/COP/percentage tooltip verified. Same evidence battery.
- `0c4ea2f` R4 — line slide 240px→320px (see R4 below).

## Bundle (real figures — corrects ADR-0018's optimistic wording)

Pre-stage baseline page node: 9,348 B raw / 2,705 B gzip. Final: 188,726 B raw / 63,922 B gzip. **Stage cost: ~179 kB raw / ~61 kB gzip** — tree-shaken registration trims little from Chart.js core (~60 kB gzip of it); the "well under the full ~70KB" framing in ADR-0018 was optimistic. Accepted: single dependency, exact pin, no runtime CDN.

## Ratified decisions R1–R4

- **R1:** `token()` bridge extended to `--font-text` (five tokens total) — retyping the font stack in TS would violate the Verbatim Token Rule for the same reason as the four hues.
- **R2:** fixed ≤480px slide heights: line 240px (superseded by R4), bar 320px, doughnut 280px; the line's legacy `flex:1;min-height:240px` converts to a fixed height inside its slide (indeterminate height contradicts D5); desktop keeps legacy behavior.
- **R3 (temporary scope-protecting concession, NOT a final design decision):** the line chart consumes contract v1.0's `net_flow_series` (12 monthly rows) as-is; the legacy daily cumulative series does not exist in the contract, and reopening the backend contract mid-stage would violate stage governance. Monthly semantics ships in Stage 6 only as an accepted interim; **target state = restoring the daily cumulative feed** via a future contract amendment (ROADMAP "Backlog técnico": touches json-api deployment @21 only — webhook @12 untouchable; `formatDayMonth` returns).
- **R4 (ratified 2026-07-13, origin: Camilo's authenticated check on the real A56):** line slide 240px→320px at ≤480px. Root cause verified before the change: the carousel track stretches every slide to the tallest (bar, 397px card); the fixed 240px wrap left a measured 81px of dead space. After: 1px. Desktop untouched (fresh-load check: 240px, no dead space). Registered observation, no ruling: the doughnut slide carries 41px dead space by the same mechanism.

## Two legacy bugs found and fixed (both latent in the legacy build)

1. **`Chart.defaults.animation` descriptor replacement:** the legacy wholesale assignment (`= { duration, easing }`) breaks hover color interpolation on the 4.5.1 ESM build — first hover throws `Animation.tick: this._fn is not a function` (reproduced, instrumented, bisected to the `backgroundColor`/`borderColor` hover animations). Fix: mutate `duration`/`easing` on the existing descriptor; values stay legacy-verbatim (400ms easeOutQuad).
2. **Doughnut animates under `prefers-reduced-motion`:** `DoughnutController` ships a type-level animation override (`animateRotate`) that shadows the root `animation = false`. Fix: `Chart.overrides.doughnut.animation = false` under reduce. Verified: all three charts report `options.animation === false`.

## Contract-key adaptations (invariant 2 — contract consumed as-is)

- Task 1: `net_flow_series` (monthly) replaces legacy daily `cumulativeNetFlow`; axis via `formatMonthAbbr` (es-CO table; `formatDayMonth` needs a day component monthly keys lack).
- Task 2: `expenses_by_account` rows are `account`/`amount` (legacy `account`/`total`).
- Task 3: `expenses_by_category` rows are `category`/`amount` (legacy `category`/`total`); percentage precision fixed at 1 decimal — legacy read `settings.percentagePrecision` from the Settings sheet, which the contract does not carry.

## Instruction correction (interaction key, Task 3)

The Task 3 GO dictated `interaction: { mode: 'nearest', intersect: false }` "per the legacy doughnut config" — but the legacy doughnut config carries **no** interaction key (Chart.js defaults: nearest, intersect true); `intersect: false` exists only inside `enableTapTooltip`'s manual touch hit test, and plan v2's Task 3 block lists no interaction either. The dictated key was implemented, produced observable artifacts (hover over the empty center hole popped a nearest-arc tooltip; hover-state residue persisted after tap-dismiss), and was reverted to legacy-verbatim. Both artifacts disappeared.

## Authenticated-check rulings

- (a) Bar-chart x-tick rotation at 395px: **ratified as shipped** (legacy sets `maxRotation: 0` only on the line chart).
- (b) 18-char label truncation vs the real longest account name: **ratified as shipped**.
- (c) Percentage precision 1 decimal: **ratified as shipped**.
- (d) Double "Gastos por categoría" heading (ledger list + chart card): **registered as a Stage 7 item** — structural fix is cutover territory.

## Dependency clarification (invariant 3)

`git diff 0053896..HEAD -- frontend/package.json`: exactly one new entry, `"chart.js": "4.5.1"`. The lockfile additionally carries `@kurkle/color@0.3.4` — chart.js's single transitive dependency, shipped with the exact pin. Invariant 3 satisfied as written (package.json gains exactly one entry).

## Deploy + integrity evidence

- Deployments (Production, `--branch=main` explicit): `80ffe8e1` (Tasks 1–3), `611add22` (R4, final). Both `2penny.pages.dev` and the hash URL: 302 → `2penny-pages.cloudflareaccess.com` (wildcard intact).
- CI `frontend-ci` green through the stage: `29219263699`, `29231679930`, `29232477396`; the closure push run is recorded in the session log.
- `clasp deployments` (read-only, twice during closure): 7 deployments identical to the Stage 4/5 baseline — webhook `...WLNnIxDDeWDvCPMc4e5W @12` and json-api `@21` unchanged. **Zero clasp mutations in the stage**; local dev data came from the Stage 5 scratchpad mock-upstream pattern (`127.0.0.1:8788`), never real secrets.
- Real data confirmed by Camilo in an authenticated browser on the reference device.

## Deferred (registered, not closed here)

1. Daily cumulative net-flow feed (R3 target state) → ROADMAP "Backlog técnico".
2. Double "Gastos por categoría" heading → Stage 7.
3. `npm run check` still not a CI gate (ADR-0017 note 2) — unchanged; check is 0 errors as of `0c4ea2f`.
4. Doughnut-slide dead space (41px, same mechanism as R4) — observation only, awaiting a ruling if it bothers on-device.

**Fecha:** 2026-07-13.

# ADR-0020 — Stage 7 closure: v1.0 dashboard retired, deployments swept, frontend cutover complete

**Status:** CLOSURE RECORD — 2026-07-13. Executed against `docs/plans/stage-7-cutover.md` v1 (ratified).
**Stage:** 7 (Cutover + retiro del dashboard doGet v1.0) — CERRADA.
**Supersedes:** ADR-0004 (legacy repo `pacc0/penny` stays active) — see "Legacy repo" section below.

## Per-task evidence (commit hashes)

- `b64fc73` Task G: plan file + Task 0 evidence relocated to `docs/evidence/stage-7/`.
- Task 1 (no code commit — clasp mutation only, evidence in session log): baseline 7 deployments confirmed identical to Task 0; `clasp undeploy` on `...HtY1ivOy_Sq @20` (legacy dashboard) — `clasp deployments` after: 6 entries, `@12`/`@21` byte-identical; curl on the retired `/exec` URL → `HTTP 404` "No se encontró la página" (Google Drive error page, verbatim). Telegram smoke test #1 confirmed live (bot responded; a bad test message correctly hit the semantic-validation branch, `TelegramNaturalLanguage.js:19`, proving webhook @12 unaffected). Sweep of `@11`, `@1`, `@6` one at a time, `clasp deployments` verified after each — final: 3 entries (`@HEAD`+`@12`+`@21`). Telegram smoke test #2 confirmed via authenticated Sheet read (row `706df91b…` "crema para la abuela" $69.400, Confirmed).
- `f9aff63` Task 2: deleted `DashboardPage.html` (758 lines) + 5 display-exclusive `Dashboard.js` functions (`doGet_legacy_v1`, `buildDashboardData_`, `aggregateCumulativeNetFlow_`, `buildPendingRows_`, `countPending_`); shared loaders/aggregators/`COL_*` untouched (grep: zero dangling references, exit 1). `clasp push` → @HEAD only; `clasp deployments` verified `@12`/`@21` intact; authenticated `/api/dashboard` unchanged (contract 1.0, 9 keys, `error: null`). Telegram smoke test #3 confirmed (row `03480531…` "Crema Dermaskin" $25.000, Confirmed).
- `d3279cc` Task 3: `CATEGORY_SHORT` typed const (ratified table verbatim) in `palette.ts`; doughnut tooltip title → emoji + `CATEGORY_SHORT` (see D2 supersession below); doughnut ≤480px slide 280px→320px (dead space measured 41px→1px); Top-3 category component replaces the ledger list (3-column, share of month expenses, `CATEGORY_COLOR` fill on `--hairline` track, dignified empty state per R1). `npm run check`: 0 errors/290 files. Worst-case label ("Suscripciones") measured 116/116px at 395px — no overflow, no stacked fallback needed.
- `a0d89f3` Task 3 addendum (requested by Camilo after the on-device check): net-flow table at ≤480px was splitting 4 columns equally (25% each), pushing "Neto" off-screen. Recompressed to Mes 16% / amounts 28% each, dropped the `min-width: 480px` that forced the scroll. Verified: `table.scrollWidth === scroller.clientWidth` (364px both), no horizontal overflow.
- Production deploys (Production, `--branch=main` explicit): `787cfa1c` (Task 3 first pass), `845924c7` (table-compression fix, final). Both `2penny.pages.dev` and the hash URL: `302` → `2penny-pages.cloudflareaccess.com` (wildcard intact, re-verified at closure).
- CI `frontend-ci`: green through the stage (`29275636696` for `d3279cc`; backend-only commits `b64fc73`/`f9aff63` don't trigger it — path filter is `frontend/**`).

## Camilo's on-device confirmation (Galaxy A56, real data)

Three checks confirmed PASS: Top-3 categories render; doughnut tap shows the new emoji+short-name tooltip; doughnut paints on the real device (resolves the Task 0 empty-canvas observation as a full-page-screenshot artifact, not a defect — confirmed on a real device, not just emulation).

## D2 supersession (conscious, Stage 6 decision revisited)

Stage 6's D2 (ADR-0018) mandated verbatim-logic port of the legacy tooltip content, which used the full category name as the emoji-title. Stage 7 replaces the tooltip title with emoji + `CATEGORY_SHORT` (ratified R4) for consistency with the new Top-3 list, which needs the short form to fit three columns at 395px. This is a deliberate, scoped exception to D2 — the *mechanics* (D7 teardown, canvas+document listeners) remain byte-identical; only the tooltip's *content template* changed.

## Empty-month concession (R1, registered — not resolved this stage)

Empty-month Top-3 renders a dignified empty state (3 dash rows, 0%, empty bar) — not tested against real data this stage (July 2026 had 6 expense categories). The previous-month fallback remains deferred: **target state** = a future backend-only stage amending the json-api contract on `@21` once, delivering BOTH the daily cumulative net-flow feed (ADR-0019 R3 debt) AND the previous-month category breakdown, in the same contract amendment. ROADMAP "Backlog técnico" updated accordingly (see below).

## Deployment sweep — final state

| Before (Task 0 baseline) | After (Stage 7 close) |
|---|---|
| 7 deployments: `@HEAD`, `@12` (webhook), `@11`, `@21` (json-api), `@1`, `@6`, `@20` (legacy dashboard) | 3 deployments: `@HEAD`, `@12` (webhook), `@21` (json-api) |

`@12` (`AKfycbzqbEYJTZiiorI2wEPJ7romqGUxFURobfRUQ_4JDeMHOdkFWLNnIxDDeWDvCPMc4e5W`) and `@21` (`AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF`) byte-identical throughout, re-verified at closure (`clasp deployments` → 3 entries, unchanged). Zero URL changes. Four Telegram smoke tests confirmed across the stage, all verified via authenticated Sheet reads, none via narrative alone — closure smoke test (#4, post-archival) landed row `a6065914…` "bombombun" $4.000, Confirmed, 2026-07-13 14:02:02.

## Legacy repo `pacc0/penny` — ADR-0004 superseded

**Decisión:** ADR-0004 ("mantener el repo legacy activo, no archivarlo aún") queda superseded. Camilo archivó `pacc0/penny` manually in GitHub Settings — Claude Code never received destructive GitHub permissions, this was a human-only action, out of band from this session's tool access.
**Verification:** `gh repo view pacc0/penny --json isArchived,archivedAt` → `{"isArchived":true,"archivedAt":"2026-07-13T19:00:14Z"}`. Confirmed 2026-07-13.

## Deferred (registered, not closed here)

1. Empty-month previous-category fallback (R1 concession) → future @21-only contract amendment stage, bundled with the daily cumulative net-flow feed (ADR-0019 R3).
2. `npm run check` still not a CI gate (ADR-0017 note 2, ADR-0019 deferred item 3) — unchanged.

**Fecha:** 2026-07-13.

## ADR-0021 — Stage 8 hardening: clasp-guard, GeminiGate, Canary (three rulings)

**Contexto:** `docs/plans/stage-8-hardening.md` (Etapa 8, zero-deployment
stage). Tres decisiones ratificadas.

**D1 — `CLASPRC_JSON` con cuenta personal en GitHub Secrets; cuenta
dedicada DIFERIDA.** ADR-0003 preveía re-evaluar la cuenta clasp dedicada
"cuando `CLASPRC_JSON` entre a GitHub Secrets" — ese momento es ahora, pero
la decisión es mantener `camilofu94@gmail.com`. **Justificación:** el riesgo
que ADR-0003 anticipaba (rotación de credenciales tras exponer el secret a
CI) es real recién si el repo se hace público o gana un segundo
colaborador; ninguna de las dos es cierta hoy. **Trigger de
re-evaluación:** (a) el repo pasa a público, o (b) entra un segundo
colaborador con acceso al repo/CI. Registrado, no construido — Principio 5.

**D2 — `GeminiGate.js` en código, push a `@HEAD` solamente; `@12` sigue
corriendo su versión pineada con el modelo hardcodeado.** El endurecimiento
mueve `GEMINI_MODEL_`/`GEMINI_API_BASE_URL_` a un archivo único
(`backend/src/GeminiGate.js`) para que el próximo bump de modelo sea un
diff de una línea — pero esta Etapa 8 es zero-deployment, así que el
cambio vive en `@HEAD` sin publicarse. **Divergencia documentada:** `@HEAD`
y `@12` divergen a partir de este commit (ubicación del código, NO el
valor del modelo — `gemini-3.1-flash-lite` permanece byte-idéntico).
**Activación diferida** al próximo bump legítimo in-place de `@12`
(deprecación de `gemini-3.1-flash-lite`, mayo 2027, o antes si Google la
adelanta) — ese bump publica `@HEAD` (con `GeminiGate.js` ya en su lugar)
sobre el deployment pineado existente, vía la skill `clasp-deploy`, nunca
un deployment nuevo.

**D3 — `clasp-guard` es verificación read-only, no gate de publicación.**
Triggers: push a `backend/**` en `master`, `workflow_dispatch`, cron
semanal. El job corre `clasp deployments` (comando de solo lectura,
permitido) y compara byte a byte contra dos constantes de entorno
(deploymentId de `@12` y de `@21`) fijadas en el propio workflow, cada una
comentada `canonical — see ADR-0021; NEVER edit without an ADR`. Si algún
id falta o difiere, el job falla ruidosamente (`exit 1` + `::error::`).
El workflow NUNCA ejecuta `clasp deploy`/`undeploy`/`create-deployment`/
`version` — verifica, no publica. El secret `CLASPRC_JSON` nunca se
imprime en logs.

**Fecha:** 2026-07-17.

# ADR-0022 — Stage 8 closure: clasp-guard live, GeminiGate + Canary shipped, zero deployments

**Status:** CLOSURE RECORD — 2026-07-17. Executed against
`docs/plans/stage-8-hardening.md` v1 (ratified) + ADR-0021 (D1/D2/D3) +
FIX-1 ruling (credential-write defect).
**Stage:** 8 (Endurecimiento) — CERRADA.

## Per-task evidence (commit hashes)

- `cfa29b5` T1: plan + ADR-0021.
- `ae3be0e` T2: `clasp-guard.yml` activated (replaces Stage 1's inert
  placeholder).
- `676ce6d` T3: `GeminiGate.js` — `GEMINI_MODEL_`/`GEMINI_API_BASE_URL_`
  relocated out of `GeminiClient.js`, value unchanged
  (`gemini-3.1-flash-lite`). `clasp push` (@HEAD only); `@12`/`@21`
  verified unchanged.
- `6af466b` T4: `Canary.js` (`runCanary()`), reusing `getGeminiApiKey_`,
  `GEMINI_MODEL_`/`GEMINI_API_BASE_URL_`, `sendTelegramMessage_` — no new
  abstractions. `clasp push` (@HEAD only); `@12`/`@21` verified unchanged.
- `7484be4` / `4b7209a` T5: OPERATIONS.md §7 manual-steps runbook,
  ROADMAP.md EN CURSO status, HANDOFF.md refresh.
- `5376520` FIX-1: credential-write defect corrected (see below).

**Zero deploy commands used throughout the stage** — `clasp push`,
`clasp status`, `clasp deployments` only. `@12`/`@21` verified
byte-identical against the ADR-0020 baseline at stage open (T0), mid-stage
twice (post-`676ce6d` push, post-`6af466b` push), and at close (below).

## FIX-1 — credential-write defect and correction

**Defect:** the original "Write clasp credentials" step interpolated
`${{ secrets.CLASPRC_JSON }}` directly inside a `run:` shell script
(`echo "${{ secrets.CLASPRC_JSON }}" > ...`). The shell stripped the
JSON payload's double quotes before the file was written, producing an
invalid `.clasprc.json`. **Evidence:** guard run #2 on `master` failed with
`clasp` parse error "Expected property name" at line 2, column 3.
**Correction (`5376520`):** the secret is now passed through an `env:`
block (`CLASPRC: ${{ secrets.CLASPRC_JSON }}`) and written with
`printf '%s' "$CLASPRC" > "$HOME/.clasprc.json"` — no shell interpolation
of the secret's content, no quote-stripping. `clasp` pinned to `3.3.0`
(parity with the local toolchain); `actions/checkout` and
`actions/setup-node` bumped to `v5` (clears the Node 20 deprecation
warning, unrelated but bundled in the same fix commit).
**Rule going forward, this repo, all workflows:** `${{ secrets.* }}` may
appear ONLY inside an `env:` block, never inside a `run:` script. Audited
`clasp-guard.yml` end-to-end at fix time — no other direct interpolation
existed or exists.

## Human evidence (ratified by governance, not re-derived here)

- **Canary trigger:** daily time-driven trigger for `runCanary` active in
  the Apps Script UI (screenshot provided by Camilo), publishing source
  "Principal"/@HEAD, per ADR-0021 D2 (the model-config relocation lives on
  @HEAD; @12 keeps its pinned, hardcoded-model version until the next
  legitimate in-place bump).
- **Guard green:** run #3 on `master`, first successful run after fix
  commit `5376520` — both canonical deploymentIds verified present.
- **Guard red (forced-failure test):** run #4 on throwaway branch
  `guard-failure-test` (deleted post-test, both locally and on
  `origin`) — both `WEBHOOK_DEPLOYMENT_ID` and `JSON_API_DEPLOYMENT_ID`
  deliberately altered by one character each; both assertions fired
  independently, each with its ADR-0021-referenced `::error::` message.

## Forced-failure test deviation (accepted)

`docs/OPERATIONS.md` §7 step 4 specified altering ONE constant; the actual
test altered BOTH. **Accepted per governance ruling** — this is a superset
of the planned proof: it demonstrated the two assertions fire
independently (not just that the job fails on some drift) in a single run.
**Known limitation, registered, not blocking:** single-constant isolation
(proving the OTHER assertion still passes when only one id is altered) was
not formally, separately tested. Per Principle 5 (defer complexity that
can be safely deferred), no further forced-failure runs are required —
the two `grep -qF` checks are independent by construction (no shared
state, no short-circuit between them beyond `FAIL=1`), so isolated failure
of either is a code-reading guarantee, not an inference from this test
alone.

## Path deviation from plan (accepted)

`docs/plans/stage-8-hardening.md` did not explicitly state a directory for
`GeminiGate.js`/`Canary.js`; both landed in `backend/src/`, matching every
other backend file's actual location (`.clasp.json` `rootDir: "src"`).
Accepted by governance ruling — this is the repo's real structure, not a
deviation requiring correction.

## Final deployment verification (stage close)

`clasp deployments` re-run 2026-07-17 at closure: 3 entries
(`@HEAD`+`@12`+`@21`), both pinned ids byte-identical to the ADR-0020
baseline and to every mid-stage check. See HANDOFF.md for the verbatim
output.

## Deferred (registered, not opened this stage)

1. `@21` contract amendment (daily cumulative net-flow feed + previous-
   month category breakdown, bundled, single redeploy) — remains
   ROADMAP "Backlog técnico". Not opened as Stage 9 here; next-stage
   candidate only.
2. Single-constant forced-failure isolation (see deviation note above) —
   registered as a known gap, not a blocker.

**Fecha:** 2026-07-17.