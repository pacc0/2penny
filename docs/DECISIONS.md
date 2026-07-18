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

## ADR-0023 — @21 contract amendment 1.0 → 1.1 (Stage 9)

Status: Ratified 2026-07-17. Amends the json-api contract served by
deployment @21. Webhook @12 is untouchable throughout this stage.

Context: two registered concessions block visible dashboard function:
R3 (ADR-0019, Stage 6) — line chart consumes 12 monthly net_flow_series
rows instead of the legacy daily cumulative series; and the Stage 7
concession — empty-month Top-3 renders a dignified empty state because
the contract carries no previous-month breakdown. ROADMAP mandates one
amendment, one @21 redeploy, for both.

D1 — Amendment is strictly additive. Two new top-level keys:
  daily_net_flow: [{ date: 'YYYY-MM-DD', value }] — cumulative net
  flow by calendar day, 1st of current month through today inclusive,
  zero-transaction days present as flat segments, computed server-side,
  Confirmed-only. Contractual guarantee carried over from monolith
  v1.0: the last entry's date always equals the current America/Bogota
  calendar date; the frontend derives "today" from it, never from the
  browser clock.
  previous_month: { month: 'YYYY-MM', expenses_by_category:
  [{ category, amount }] } — previous closed calendar month,
  Confirmed-only, sorted descending, same row shape as the existing
  expenses_by_category. month is included so the Top-3 fallback can
  label its data source.
  contract_version bumps to '1.1' on all three response paths
  (success, unauthorized, internal error — Api.js L11/L15/L51 pattern).
  No existing key changes name, shape, or semantics.

D2 — net_flow_series (monthly, 12 rows) REMAINS in contract 1.1
despite losing its consumer. Rationale: removal would make the
amendment breaking and couple backend/frontend deploy order for zero
functional gain; ~12 rows of dead weight is an acceptable cost and a
possible future annual-view input. Registered for closure review: if
no consumer or concrete annual-view plan exists at stage close, its
removal is recorded as a candidate for a future contract 2.0.

Evidence note (added at Stage 9 opening, T0 baseline capture): the
`docs/evidence/stage-9/baseline-payload.json` snapshot (2026-07-17
22:36:12-05:00) shows `net_flow_series` carrying 11 of its 12 rows at
flat zero — real transaction history only begins 2026-07. This
strengthens the closure-review case for retiring the monthly series in
a future contract 2.0 (no consumer AND no historical data behind it).
Decision unchanged: it stays in 1.1 for additivity.

D3 — Frontend does NOT gate on contract_version. Defensive reads of
the new keys only (render degrades gracefully if absent). Rationale:
single user, operator-coordinated deploys, guard + Canary already own
system health; a hard version gate is coupling that taxes every future
amendment.

D4 — Doughnut slide dead space stays deferred (cosmetic, no stage
owner). This stage is contract, not cosmetics.

D5 — The pending `npm run check` gate in frontend-ci.yml (ADR-0017
backlog) attaches to Stage 9 closure as a micro-task with its own
mini-ruling; it is not a stage task.

D6 — Redeploy precondition: before the in-place @21 redeploy, the
diff between @21's currently pinned version and @HEAD must be
enumerated file-by-file and ruled on. Known pre-existing divergence:
GeminiGate.js relocation (Stage 8, ADR-0021 D2) rides along in this
bump. Ruling recorded here: this is inert for the doGet path —
GeminiGate belongs to the webhook flow and @12 stays pinned; the @21
bump does NOT constitute ADR-0021 D2's "legitimate in-place bump of
@12" and does not activate GeminiGate. Any OTHER unexpected file in
that diff is a STOP condition.

Errata note: the Stage 9 opening task spec asserted no version field
existed in the payload ("expected: none"); evidence showed
contract_version: '1.0' already present on all paths. Recorded as a
governance-side assumption error; code was correct.

## ADR-0023 D6-R1 (T1 ruling, 2026-07-17)

ADRs are immutable — this addendum supersedes D6's enumeration; D6
itself is left as written above.

D6-R1: T1 evidence showed the pinned-@21 window is `10fd47f..HEAD`
(@21 pinned since Stage 2 closure; traceability chain intact per
`docs/DECISIONS.md:134-139`). D6's enumeration was incomplete — it
named only the Stage 8 GeminiGate divergence and missed that ALL
ratified Stage 7/8 backend changes ride in this bump. Recorded as a
governance-side enumeration error. Full accepted manifest for the T4
redeploy (5 files):
  - `Dashboard.js` modified (`f9aff63`, Stage 7: legacy display
    functions deleted; shared aggregators verified intact by that
    commit's dangling-ref grep)
  - `DashboardPage.html` deleted (`f9aff63`, Stage 7)
  - `GeminiClient.js` modified (`676ce6d`, Stage 8 / ADR-0021 D2)
  - `GeminiGate.js` added (`676ce6d`, Stage 8 / ADR-0021 D2) — inert
    for doGet per D6
  - `Canary.js` added (`6af466b`, Stage 8) — trigger-invoked only,
    inert for doGet

Plus, once T2 lands, Stage 9's own changes. Any file appearing in the
pre-T4 verification diff beyond this manifest + Stage 9 commits
remains a STOP condition.

Bonus finding recorded: the deleted `aggregateCumulativeNetFlow_`
(recoverable at `f9aff63^`) is the production-validated v1.0 daily
cumulative logic — T2 resurrects it rather than reimplementing.

## ADR-0023 closure notes (T9, 2026-07-18)

ADRs are immutable — this section appends closure findings; D1-D6 and
D6-R1 above are left as written.

**1. D2 closure review (ratified ruling).** `net_flow_series` acquired
a NEW consumer in T7 — it is the D3 degradation path (the line chart
falls back to it when `daily_net_flow` is absent or malformed). It is
no longer unconsumed dead weight; removing it in a future contract 2.0
would eliminate the defensive fallback entirely. Status changes from
"removal candidate" to **"retained as degradation target"** — any
future removal proposal must supply a replacement degradation
strategy. The 11/12-zero-rows evidence (baseline capture) stands
recorded but no longer drives toward removal.

**2. Governance assumption errors #1-#5, enumerated with the pattern.**
- #1 — `contract_version` "expected: none" (Stage 9 opening task) —
  it already existed on all three paths.
- #2 — curling `@HEAD` with `?secret=` (T3 instruction) — wrong param
  name (`key`, not `secret`); separately, `@HEAD`'s URL is
  editor-session-only per Stage 1 doctrine, not exercisable by
  anonymous curl regardless of param name.
- #3 — a "today" header element (T8 item 0) — assumed from monolith
  memory; the 2penny header never had one (period.month +
  generated_at only, zero `new Date()` calls anywhere).
- #4 — Cloudflare Pages auto-deploy on push (T8 step 2) — never
  existed; every Production deploy in this repo's history, this stage
  included, is a manual `wrangler pages deploy --branch=main`.
- #5 — "push triggers frontend-ci" for the `npm run check` gate (T9
  Part A) — true only for `frontend/**` paths; a
  `.github/workflows/**`-only commit doesn't match the path filter,
  requiring `workflow_dispatch` to exercise the gate's first run.

**Lesson, recorded verbatim:** specs must be written against the
current system's code/doctrine, not from memory of the prior system
(the legacy monolith, or an assumed-generic CI/deploy setup).
**Counterweight, also recorded:** all five were caught by the STOP
discipline before causing any damage to production, the webhook, or
the guard — the process worked exactly as designed.

**3. Collapsed-gate rulings (explicit, not drift).** The post-T6 stop
point collapsed conditional on all-PASS (the stop existed for
additivity confirmation; the mechanical assertions ARE that
confirmation). T5 folded into T4 (the guard fired for real on the T4
push, rather than via a separate `workflow_dispatch` exercise). Both
were explicit governance rulings made in-session, not scope drift.

**4. `@21` nomenclature note.** `clasp deployments` now lists the
json-api deployment as `@22` — that is Apps Script's version number,
not its identity. Identity = deploymentId
`AKfycbx6H0I12mnUT830S7-FHplkRIcpbeg5mHz4qZxkegv_0RB7m8VHlXgSBtlsgz16rsIF`,
unchanged throughout Stage 9, guard-verified before and after the T4
redeploy. Future docs should refer to "the json-api deployment" by
deploymentId, not by `@NN` — the number will keep incrementing on
every future in-place redeploy while the ID stays sacred.

**5. Evidence index (`docs/evidence/stage-9/`).**
| File | sha256 |
|---|---|
| `baseline-payload.json` | `23989bc7c6ad8e3ea343c8d9c8d14bd99d842a94fa3e78bbe766afe0a118219d` |
| `t3-head-authorized.json` | `70fe5c2cd2a0d13264456263ec9a88dd5bdb45f4ee6cd369b141a3a0c5e6419f` |
| `t3-head-unauthorized.json` | `a7db3cbdd9ebc8bbf91baa3cc4c53f2e02cae68f920f394783c943f270fc7461` |
| `t6-production-payload.json` | `0ad3868519219b238b2e79f5f375f06f8002d7b4274b2a3529af7c0f3461dd79` |

Sequence note: last known contract 1.0 capture at 23:19:00 (pre-T4
redeploy); T4 completed between 23:19 and 23:23; `t6-production-payload.json`
(generated_at 23:23:47) is the first confirmed-live contract 1.1 capture.

**6. Telegram smoke-test drift — bonus end-to-end evidence.** Camilo's
post-redeploy Telegram smoke-test transaction (+1000 COP expense,
Alimentación/Efectivo) traversed the full pipeline: `@12` ingest →
Sheet write → served by `@21` v22. Traced mechanically consistent
across every affected field: `kpis.expenses`/`kpis.net_flow`,
`expenses_by_category["Alimentación"]`,
`expenses_by_account["Efectivo"]`, the `net_flow_series` 2026-07 row,
and `daily_net_flow`'s last entry — all agree exactly (see T6 evidence
commit `033996b`).

**Fecha:** 2026-07-18.

**Fecha:** 2026-07-17.

## ADR-0024 — Typography refresh (supersedes the DESIGN.md typography paragraph rationale following §2, and the legacy-repo ADR-0003 Nunito/Averia tabular-digits argument)

**Status:** Ratified by Camilo, 2026-07-18. **Conditional on the Stage 10
T2 typography spike passing** (Space Grotesk must produce true
`tabular-nums` alignment on real currency figures — see Stage 10 plan,
`docs/plans/stage-10-desktop-refresh.md`, T2). If the spike fails, this
ADR is superseded by a follow-up addendum, not edited (ADRs are
immutable in this repo — precedent: ADR-0023 D6-R1, closure notes).

**Decision:** `--font-text` becomes IBM Plex Sans Condensed.
`--font-numeric` becomes Space Grotesk (covers both numeric/tabular
figures and display type, e.g. the app wordmark — no separate
`--font-display` token introduced; reusing `--font-numeric` for the one
existing display use avoids an unrequested new token, per Principle 3).

**Renumbering note:** the originating instruction block referred to
this as "ADR-0020," reusing "ADR-0021" and "ADR-0022" for the token and
layout ADRs below. Those three numbers are already taken in this file
(ADR-0020 = Stage 7 closure, ADR-0021 = Stage 8 hardening rulings,
ADR-0022 = Stage 8 closure — all above, dated 2026-07-13/07-17). This
is a governance-side numbering error (spec drafted without reading the
current end of this file), not a deliberate revision — renumbered here
to ADR-0024/0025/0026, the next free sequence after ADR-0023. Logged
per the established pattern (ADR-0023 closure notes, errors #1-#5).

**Supersession-target correction:** the instruction named "DESIGN.md
§3" as the section carrying the superseded typography rationale.
§3 in this repo's DESIGN.md is "Responsive" (breakpoints), not
typography — typography lives in an untitled paragraph immediately
after the §2 tokens block. Corrected to the right target; no numbered
§3 typography section exists to mark superseded.

**ADR-0003 clarification (same pattern as ADR-0016's traceability
note):** *this* repo's own ADR-0003 ("clasp con cuenta personal") is
untouched by this ADR — it concerns Apps Script account ownership, not
fonts. The "Nunito tabular-digits argument" being superseded belongs to
the **legacy repo `pacc0/penny`'s** ADR-0003 (font delivery/tabular
digits spike), referenced here only as prior rationale that this
2penny-local typography choice now overrides; the legacy repo's own
DECISIONS.md is not edited (ADR-0004/ADR-0020 legacy-repo boundary).

**Anti-slop directive check (corrected framing):** `.claude/skills/
design-tokens` does not name "Space Grotesk" specifically as a veto —
it prohibits Inter/Roboto/Arial/system-font as *display* type and
generic AI-default palettes, with no per-font geometric-sans
enumeration. The instruction's framing ("vetoes it as an AI-convergent
default") overstates what the skill text actually says. Recorded
factually: this is Camilo's deliberate executive typography choice,
adopted as a single named exception to the skill's general spirit
(avoid AI-convergent defaults) even though the skill's literal text
does not name this font. The skill's other prohibitions (no decorative
gradients, no emoji-as-icons, no shadcn look, etc.) remain in full
force, untouched by this ADR.

**Fecha:** 2026-07-18.

## ADR-0025 — Night Ledger token additions (Stage 10)

**Status:** Ratified by Camilo, 2026-07-18.

**Decision:** three new color tokens added to the Night Ledger palette:
- `--savings-teal-tint: #85DBE6` — hero-card surface only (Ahorro KPI),
  per the Two-Volume Rule (DESIGN.md §5 KPI cards: hero cards use
  pastel-tint surfaces with `--ink-on-tint` text).
- `--delta-positive-on-tint: #0E7A3A` — text-on-pastel only (KPI delta
  figures on tinted hero surfaces).
- `--delta-negative-on-tint: #C2410C` — text-on-pastel only, same scope.

**Amendment to DESIGN.md §4 anti-slop (radial luminance overlay):** a
radial gradient,
`radial-gradient(120% 120% at 100% 100%, rgba(0,0,0,0.18), transparent 55%)`,
is permitted ONLY as a `background-image` layered on tinted hero-card
surfaces (Ingresos/Gastos/Ahorro). This is a luminance overlay on an
existing surface token (darkens toward one corner of an already-tinted
surface), the same category of exception ADR-0015 already carved out
for linear luminance gradients — not a new decorative-gradient
allowance. The decorative-gradient and hue-gradient prohibitions in
DESIGN.md §4 stand unchanged for everything else; glassmorphism/
`backdrop-filter` remains a hard FAIL with zero exceptions (ADR-0015).

**Fecha:** 2026-07-18.

## ADR-0027 — Desktop grid v2 + mobile header exception (supersedes ADR-0026's row contract)

**Status:** Ratified by Camilo, 2026-07-18. Stage 10, Iteration 2 (layout
amendment).

**Renumbering note (same pattern as ADR-0024's, see that entry):** the
originating instruction block called this "ADR-0023," referring to the
prior row-contract ADR as "ADR-0022." Both numbers are already taken in
this file (ADR-0023 = Stage 9 contract amendment, ADR-0022 = Stage 8
closure). The row contract this ADR actually supersedes is **ADR-0026**
(Desktop grid layout, ratified earlier the same day). Renumbered here to
ADR-0027, the next free sequence after ADR-0026. Governance-side
numbering error, not a deliberate revision — logged per the ADR-0023/
ADR-0024 precedent.

**Decision, part 1 — desktop grid v2 (>=1200px only):** ADR-0026's Rows
2-4 (net-flow/category row, payment/top3/pending row, full-width split
table row) are replaced by ONE 3-column region:
`grid-template-columns: minmax(0,6fr) minmax(0,3fr) minmax(0,4fr); gap: 20px`.
Container max-width (1520px), side padding (48px), header row, and the
4-hero-card row are unchanged from ADR-0026.

- **Column A (6fr):** Evolución del flujo neto (line) above Gastos por
  método de pago (bars), stacked, 20px gap. Netflow gets the larger
  share (spec: flex 3), payment the smaller (flex 2) — implemented via
  explicit `min-height` on each chart's wrapper (480px / 320px, an exact
  3:2 ratio) rather than a literal flex-container ratio, since forcing
  a true nested flex column here would require relocating the doughnut
  chart out of the mobile carousel's DOM subtree (see implementation
  note below). Both charts keep `maintainAspectRatio: false` and the
  existing dynamic bar-count sizing rules.
- **Column B (3fr):** Gastos por categoría (doughnut, no legend) on top,
  Top categorías below, Pendientes below that. The doughnut's grid cell
  spans the same two row-tracks as Column A's combined height, so it
  visually "absorbs leftover space" the same way Column C's table does;
  its canvas wrapper keeps a fixed 312px height, centered vertically
  within the taller cell via internal flex centering. Top categorías and
  Pendientes each get their own dedicated auto-sized grid row (shared
  with no other column), so their box height is exactly their natural
  content height — no stretch, no dead space, by construction rather
  than by override.
- **Column C (4fr):** "Flujo neto — últimos 12 meses" as ONE 12-row
  table, full region height (spans the same two row-tracks as Column
  A/B). The 6+6 split and its vertical hairline are removed entirely —
  `.table-desktop-split`/`.table-half` deleted. Rows fill the card
  height evenly via a flex-distributed `<tbody>` (`thead`/`tbody`
  `display: contents`, each `<tr>` a flex row; header row `flex: none`,
  the 12 data rows `flex: 1` each) so the last row ends near the card
  bottom.
- **Tablet (769-1199px):** unchanged from ADR-0026 — full-width stack in
  source order, single 12-row table (no split logic exists anywhere in
  the codebase after this amendment, at any breakpoint).

**Implementation note (mobile-DOM-preservation constraint, decided here,
not a STOP trigger):** achieving Column A/B as literal nested flex
containers was evaluated and rejected. The doughnut chart is one of
three slides in the ≤480px chart carousel (`carousel-track`, scroll-snap,
3 dots); Top categorías and Pendientes are separate top-level sections
elsewhere in DOM order. Grouping doughnut+Top-categorías+Pendientes
under one physical wrapper div would either (a) require moving the
doughnut out of `carousel-track`, dropping the mobile carousel from 3
slides to 2 — a real mobile behavioral regression, or (b) require
relocating Top categorías/Pendientes in the DOM, which — even neutralized
visually via flex `order` — was judged an unnecessary risk for a purely
cosmetic desktop refinement. The shipped implementation reuses the
technique ADR-0026 already established (shared explicit grid row-tracks,
each column occupying only the rows it needs, zero DOM reordering) rather
than introducing wrapper elements. Zero DOM nodes moved; zero mobile
markup touched beyond the Task T3 header exception below.

**Decision, part 2 — mobile header exception (<=768px), the ONE
sanctioned mobile structural change:** the header adopts the desktop
header pattern — flex, space-between, baseline-aligned: "2penny" left at
32px bold (Space Grotesk), the period (e.g. "2026-07") right, muted, on
the same line. The "generado &lt;timestamp&gt;" line was already deleted
at all viewports (ADR-0026). Verified no wrap at 395px viewport width.
The mobile-integrity rule remains in force for everything else — this is
the only exception, per the originating instruction's explicit STOP
condition 1.

**Fecha:** 2026-07-18.

## ADR-0028 — Desktop grid v3: two-column region (supersedes ADR-0027's three-column contract)

**Status:** Ratified by Camilo, 2026-07-18. Stage 10, Iteration 3 (layout
amendment).

**Context:** ADR-0027's three-column region (6fr/3fr/4fr) had the
doughnut chart's grid cell span the same two row-tracks as Column A
(netflow+payment), so it would "absorb leftover space" and align with
Column A/C's bottom edge. In practice this made the doughnut CARD
grossly oversized — the card's box grew to match Column A's ~800px
combined chart height while the doughnut's own canvas stayed a fixed
312px, leaving a large empty band inside the card. This was visible the
moment the table stopped sharing that row-track (see decision below) —
with only Column A's charts left to size the row, the mismatch between
"card height" and "canvas height" in Column B became obvious rather
than being masked by three competing columns.

**Decision:** replace the 3-column region with a 2-column region:
`grid-template-columns: minmax(0,2fr) minmax(0,1fr); gap: 20px; align-items: start`.
`align-items: start` is the load-bearing change — it stops CSS Grid's
default `stretch` from forcing Column B's cards to fill the row height
at all, which is what let the doughnut's cell grow oversized in the
first place.

- **Column A (2fr):** net-flow line chart, then payment-method bars,
  stacked — unchanged from Iteration 2 (480px/320px min-heights, exact
  3:2 proportion retained as plain fixed values, no row-track sharing).
- **Column B (1fr):** doughnut, Top categorías, the 12-month table, and
  Pendientes, stacked, ALL natural content height, zero stretching.
  The doughnut's canvas wrapper drops from 312px to 280px (fixed); its
  card is exactly title + wrapper + padding. The table drops the
  Iteration-2 flex-distributed-rows technique entirely (that technique
  existed only to fill a stretched cell that no longer exists) — it
  reverts to a compact ledger density (26-30px rows, ~13px font),
  sized to its own 12 rows and nothing more. Because Column B no longer
  shares row-tracks with Column A or a table column, the two columns'
  bottoms are NOT expected to align — Column B simply ends where its
  content ends, which may be shorter or taller than Column A.
- **Tablet (769-1199px):** unchanged — single-column stack in source
  order (line chart, bars, doughnut, Top categorías, table, Pendientes).
- **Mobile (<=768px):** zero changes. The Iteration 2 header exception
  stands; verified the ≤480px chart carousel is unaffected (3 dots/3
  cards) since this amendment only touches the >=1200px media query.

**Superseded:** ADR-0027's three-column contract (6fr/3fr/4fr,
doughnut/table row-track sharing) — that ADR's mobile-DOM-preservation
implementation note (shared grid row-tracks instead of flex wrappers,
to avoid moving the doughnut out of the mobile carousel) remains valid
reasoning and is carried forward unchanged into v3; only the column
count and the stretch-vs-natural-height sizing model change.

**Implementation note + measured deviation (added at T4, 2026-07-18):**
Column B's four cards still cannot be a literal flex column — same
constraint as ADR-0027 (the doughnut must stay physically inside
`carousel-track`'s DOM for the ≤480px carousel's 3 dots/3 cards to
survive). The shipped implementation instead spans Column A's two chart
cards across the SAME four implicit row-tracks Column B's four cards
occupy (`netflow: row 3 / span 2`, `payment: row 5 / span 2`, one row
each for doughnut/Top categorías/table/Pendientes) — CSS Grid's track-
growth algorithm then only needs to add slack to whichever rows a
taller spanning item forces open, rather than one row absorbing an
entire mismatched column's height (Iteration 2's failure mode).
Measured at 1920px and 1280px (identical at both): doughnut card height
**359px** (spec ceiling 380px, PASS); doughnut→Top-categorías and
Top-categorías→table gaps measured **58px** each (20px grid gap + 38px
of track growth forced by the net-flow chart's 480px min-height
exceeding the doughnut+Top-categorías combined natural height by 76px,
split evenly across the two rows by the browser's track-sizing
algorithm); table→Pendientes gap measured a clean **20px** (payment's
320px requirement is already smaller than table+Pendientes' combined
natural height, so no track growth occurs there). The 38px excess is
the residual of a proven CSS constraint (two independently-flowing
columns of different item counts cannot share row-tracks without a
subgrid or wrapper), not an implementation oversight — accepted as
representing a >90% reduction from Iteration 2's ~620px doughnut
overshoot. Table rows measured 27px (spec: 26-30px); current-month row
(last, `tbody tr:last-child`) confirmed `font-weight: 600`.

**Tablet DOM-order deviation (logged, not corrected):** the instruction
listed the tablet source order as "line chart, bars, doughnut, Top
categorías, table, Pendientes," implying Top categorías moves to after
the chart carousel. The repo's actual DOM order (unchanged since
Iteration 2) is kpis → Top categorías → charts → table → Pendientes —
Top categorías comes BEFORE the charts, not after. Reordering it would
require moving its DOM position, and mobile (<=768px) has no CSS
override for section order at all (plain document flow — DOM order IS
visual order there), so any DOM move would also shift mobile's visual
order, which T3's "zero changes" guard forbids. Left as-is: tablet keeps
today's actual source order. Same governance-assumption-error pattern
already documented repeatedly in this file (ADR-0023 closure notes,
ADR-0024's renumbering note) — the instruction was drafted against an
assumed sequence rather than the current DOM.

**Fecha:** 2026-07-18.

## ADR-0026 — Desktop grid layout (defines the >768px row contract in this repo)

**Status:** Ratified by Camilo, 2026-07-18.

**Context correction:** the instruction described this ADR as updating
"DASHBOARD.md row contract for >768px." No `DASHBOARD.md` exists
anywhere in this repo (`docs/` or otherwise) — it is a legacy-repo
(`pacc0/penny`) content-contract doc, referenced elsewhere in this
repo's own DESIGN.md/ROADMAP.md only by external section number
(e.g. "DASHBOARD.md §Row 2", "DASHBOARD.md v2.2") as citation of prior
content authority, never ported or recreated locally. There is
therefore no local file to "update." This ADR instead serves as the
row-contract record for 2penny's own desktop (≥769px) layout,
living here and in `docs/plans/stage-10-desktop-refresh.md`; the
mobile (≤768px) structure is unchanged and remains governed by
DESIGN.md §3.

**Decision:** desktop (≥769px) layout is a 5-row grid: Row 0
header (wordmark + period, no timestamp line), Row 1 four hero KPI
cards (Ingresos/Gastos/Ahorro/Flujo Neto), Row 2 net-flow line (2/3) +
category doughnut (1/3, no legend), Row 3 payment-method bars (2/3) +
stacked Top-3-categorías/Pendientes column (1/3), Row 4 one full-width
12-month table split into two 6-month groups side by side. Tablet
(769–1199px) collapses hero cards to 2×2 and stacks rows 2–4 full-width
in source order with a single 12-row table. Full row-by-row spec: see
the Stage 10 plan doc (`docs/plans/stage-10-desktop-refresh.md`, T4).
The "Gastos por cuenta" text-list section is deleted at all viewports
(superseded by the payment-methods bar chart, which already carries
the same per-account data).

**Fecha:** 2026-07-18.

## ADR-0029 — Desktop grid v4, Option B (supersedes ADR-0028's two-column contract)

**Status:** Ratified by Camilo, 2026-07-18. Stage 10, Iteration 4 (layout
amendment, final).

**Decision (four parts):**

**a. Pendientes moves to Column A**, below the payment-methods bars,
full 2fr width. DOM position is unchanged (mobile has no section-order
CSS override, per the established pattern from ADR-0028's tablet-order
deviation) — only its `grid-column`/`grid-row` placement changes at
`>=1200px`.

**b. The 12-month table becomes a 6-month table at ALL viewports**
(content-contract change, frontend-only): the frontend slices the last
6 entries of the existing `net_flow_series` payload — no backend change,
no contract version bump. Title becomes "Flujo neto — últimos 6 meses"
everywhere (mobile, tablet, desktop).

**c. The 3-bar category-summary card is retitled "Top categorías"** at
all viewports, fixing the duplicated "Gastos por categoría" title it
shared with the doughnut chart (a defect present since Stage 7, per
ADR-0020's deferred item 2 — resolved here as a side effect of this
iteration, not a separately-scoped fix).

**d. Equal-height rule:** each desktop column contains exactly ONE
elastic card (Column A: the net-flow line chart; Column B: the 6-month
table); every other card is natural content height. `align-items:
stretch` replaces ADR-0028's `align-items: start` at the outer grid.

**Implementation — no wrapper, same technique as ADR-0027/0028:** the
doughnut must remain physically inside `carousel-track`'s DOM (mobile
carousel: 3 dots/3 cards) — this rules out literal flex-column wrappers
for either side, same constraint as the prior two iterations. Instead:
- Row 3: net-flow (elastic, `align-self: stretch`, `min-height: 320px`)
  shares a row with the doughnut (natural, `align-self: start`).
- Row 4: payment bars (natural/fixed) shares a row with Top categorías
  (natural) — both `align-self: start`, no elastic item in this row.
- Row 5: Pendientes (natural, `align-self: start`) shares the FINAL row
  with the 6-month table (elastic, `align-self: stretch`).

Because Pendientes and the table share the SAME terminal row-line, and
neither has anything after it in its own column, their bottoms are
mathematically guaranteed to align exactly — grid row boundaries are
shared lines; two items whose spans both end at the same line end at
the same pixel, independent of whatever happened in earlier rows. This
is the load-bearing trick that satisfies the "align within 2px" result
contract without a wrapper.

**Consequence, accepted:** rows 3 and 4 do NOT have this guarantee (the
doughnut and Top categorías are shorter than their row-mates, netflow
and payment respectively, leaving grid-track space after them before
the next row begins). This is empty GRID GAP between cards, not dead
space INSIDE any card (every natural-height card's own box is exactly
its content height — zero internal waste) — T4's gate (c) explicitly
scopes "no empty band inside any card," not inter-card spacing, so this
is compliant as specified, if visually looser than a hand-tuned design
would be. Measured values logged at T4.

**Table row compression (T2's `tbody` flex rows, extended) — measured,
with a considered-and-rejected alternative:** the `<tbody>` rows use
`flex: 1 1 0; max-height: 44px` with NO min-height floor, so the table's
own box imposes nothing on Row 5 — its height is dictated by Pendientes
alone (defeating flex's implicit `min-height:auto` content-floor
required explicit `min-height:0` on `<table>`, `tr`, and `td`/`th` — a
well-known flexbox gotcha, not obvious from the spec text). Verified
**0px delta** (the T4 gate) at 1920px with three mock pending-data
sizes: 0 items (Pendientes 110px → table rows 1px), 3 items (Pendientes
167px → rows 10px), 6 items (Pendientes 290px → rows 31px, comfortably
in the "compact ledger" range).

A `min-height` floor on `.table-section` (tried at 220-250px) was
evaluated to fix the 0-item case's 1px rows and REJECTED: it broke the
2px alignment gate outright in the 3-item case too (which is a
thoroughly ordinary amount of pending transactions, not an edge case),
producing an 83px delta for a 5px legibility gain. The explicit,
measured T4 gate is treated as authoritative over an inferred
legibility preference the spec doesn't actually mandate a minimum for
— T2 only specifies a MAX (44px cap) and says "log actual values,"
anticipating variability rather than guaranteeing a floor. Zero pending
items is also not a hypothetical: it is the actual state observed in
production as recently as the Stage 9 evidence capture
(`docs/evidence/stage-9/baseline-payload.json`: `"pending":[]`). The
1px-row outcome in that state is flagged here explicitly for Camilo's
on-device review — this is exactly the kind of visual judgment call the
established workflow reserves for his sign-off, not a call for Claude
Code to make unilaterally by trading away an explicit gate.

**Pending-row field deviation:** the spec's row format ("YYYY-MM-DD ·
MERCHANT · account") names a field the contract does not carry —
`DATA_CONTRACT.md`'s `pending` rows are `id`/`date`/`amount`/`merchant`/
`description`/`type`, no `account`. Same governance-assumption-error
pattern documented repeatedly in this file. Kept the existing, correct,
working field (`description`) in its place. Also kept the existing
income/expense color distinction (`--income-green`/`--expense-coral`)
rather than forcing every amount to expense coral as the spec's literal
wording suggested — pending transactions carry a real `type` field and
can actually be income, and the current code already handles both
correctly; forcing coral on income rows would be a regression.

**Bonus fix, discovered verifying the above (in scope — same rows T2
modifies):** `row.type === 'income'` compared against the WRONG case —
`DATA_CONTRACT.md` documents `type` as `"Income|Expense|Transfer"`
(capitalized). Every pending row rendered expense-coral with a minus
sign regardless of actual type, since the comparison never matched.
Corrected to `row.type === 'Income'`. Pre-existing defect, unrelated to
this iteration's own changes, but trivial and directly in the code this
iteration touches — fixed rather than left for a future stage per the
root-cause-over-symptom principle.

**Fecha:** 2026-07-18.

### Addendum (Iteration 4.1, 2026-07-18) — legibility floor supersedes the alignment-at-any-cost ruling

**Ruling:** data legibility outranks bottom-edge alignment. The
Iteration 4 design (no min-height floor on the table, so it always
matches Pendientes exactly, even down to 1px rows) is corrected: the
6-month table's data rows now carry `min-height: 24px` at all times,
and the table card carries a computed effective minimum height (title +
header row + 6 rows at a 26px reference height + card padding —
hardcoded, derived in a code comment at the CSS rule). The 44px per-row
cap from Iteration 4 stands.

**On the "line chart absorbs the surplus" mechanism:** investigated and
found NOT mechanically available under the current (wrapper-free) grid
architecture. Column A's rows (net-flow, payment, Pendientes) and
Column B's rows (doughnut, Top categorías, table) are independent CSS
Grid row-tracks computed by the browser with no cross-row communication
— net-flow's own row (row 3) has no path to influence row 5's height
(shared by Pendientes and the table) regardless of how much it
stretches. This is the same structural fact already established in
ADR-0027/0028/0029: true cross-column height propagation requires a
flex-column wrapper per column, which remains incompatible with the
doughnut's mandatory physical position inside the mobile chart
carousel's DOM. Making net-flow "stretch" changes nothing about row 5.

**Consequence, measured (not hypothetical):** with the legibility floor
in place, Pendientes (still natural height, unstretched, per its own
explicit contract) will fall short of the table's floored bottom edge
by a growing margin as Pendientes has fewer items — this is the direct,
unavoidable trade of choosing legibility over alignment when they
conflict, exactly as this addendum's ruling directs. Per-state
measurements (0/1/4 mock pending items) are recorded in this addendum's
closure notes below, with the conflict called out explicitly rather
than papered over.

**Fecha:** 2026-07-18.

#### Closure notes (Iteration 4.1 gates, 2026-07-18)

Measured via Playwright against `vite dev` + the Stage-9 mock-upstream
pattern (`127.0.0.1:8788` serving `t6-production-payload.json` with
0/1/4 synthetic pending rows). `npm run check` (0 errors, 0 warnings)
and `npm run build` both exit 0.

**Gate (a) — row legibility: PASS.** All 6 data rows measure exactly
24.00px in every state at both 1920x1080 and 1280x800 (floor engaged;
44px cap never reached). Mobile 395x893 untouched: rows 28.5px natural,
unchanged.

**Gate (b) — bottom alignment <= 2px: FAIL in all three states — the
conflict the addendum's ruling anticipated.** Table card holds at
251.27px (its 246px floor + intrinsic content rounding); Pendientes
stays natural height. Identical at both desktop viewports:

| pending items | Pendientes height | table height | bottom delta |
|---|---|---|---|
| 0 | 110.27px | 251.27px | 141px |
| 1 (production) | 85.27px | 251.27px | 166px |
| 4 | 208.27px | 251.27px | 43px |

Per the ruling, legibility is kept and the misalignment is accepted and
recorded — the "line chart absorbs the surplus" mechanism is not
mechanically available (see addendum body); alignment would return only
if Pendientes' natural height reached ~251px (≈6 pending items).

**Gate (c) — no scroll: PASS.** No page horizontal scroll and no nested
scrollbars at either desktop viewport in any state; mobile's
carousel-track horizontal scroller is pre-existing carousel behavior.

**Fecha:** 2026-07-18.
