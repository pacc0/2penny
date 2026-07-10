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
