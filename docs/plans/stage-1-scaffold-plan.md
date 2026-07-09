# 2penny — Stage 1 Execution Plan: Monorepo Scaffold + Governance Docs

> **For Claude Code.** Gate 1 (Architect + Guardian) was passed in the strategic
> chat session on 2026-07-09. Execute this plan task by task, in order. Do not
> improvise beyond it. Evidence over narrative: every task ends with a
> verification block whose output you must show verbatim.

## Context

- Working repo: `C:\Users\Camilo\Documents\VS Projects\2penny` (git initialized,
  commit `c4341b1` contains `.gitignore` + `CLAUDE.md`).
- Legacy repo (READ-ONLY reference): `C:\Users\Camilo\Documents\VS Projects\Penny\penny`.
  **Never modify, commit to, or run git commands that write in the legacy repo.**
- Language split: `/docs` governance files are written in **Spanish**;
  `.claude/` skills, agents, workflows, code comments, and commit messages are
  in **English**. Verbatim-copied token blocks keep their original language.
- Hard rules:
  1. **Verbatim Token Rule** — Night Ledger token values are COPIED from the
     legacy repo, never retyped from memory. If a source block cannot be
     located, STOP and ask; do not invent values.
  2. Conventional Commits.
  3. If any verification fails, STOP and report; do not continue to the next task.

---

## TASK 0 — Preconditions

Steps:
1. `cd "C:\Users\Camilo\Documents\VS Projects\2penny"`
2. Confirm repo identity and state.

Verification:
```
git remote -v            # must NOT point to pacc0/penny (legacy)
git log --oneline -3     # must include c4341b1
git status --short       # note any untracked files
dir "C:\Users\Camilo\Documents\VS Projects\Penny\penny"   # legacy path exists
```
Expected: legacy path exists; `c4341b1` present in log. If the working tree has
uncommitted changes, list them and ask before proceeding.

---

## TASK 1 — Cleanup: remove `stage0-docs/index.zip` from the tree

Rationale (ratified): work file, not governance/code. `git rm` + gitignore, **no
history rewrite** (no secrets involved; purging history on a days-old repo is
complexity that solves no real problem — the file remains in history, disappears
from the tree).

Steps:
1. `git rm --cached stage0-docs/index.zip` (use `git rm` without `--cached` if
   the local file should also be deleted — keep the local file, so use `--cached`).
2. Append to `.gitignore`:
   ```
   # local work files
   stage0-docs/
   *.zip
   ```
3. Commit: `chore: remove stage0 work zip from tree and ignore local work files`

Verification:
```
git ls-files | findstr zip     # expected: empty output
git log --oneline -1
```

---

## TASK 2 — Directory skeleton

Create (git tracks files, not dirs — placeholder files below give each dir content):

```
frontend/README.md
backend/README.md
docs/            (files created in Tasks 3–8)
.claude/skills/  (files created in Tasks 9–10)
.claude/agents/  (file created in Task 11)
.github/workflows/ (files created in Task 12)
```

`frontend/README.md` content:
```markdown
# frontend

Svelte 5 (runes) static shell → Cloudflare Pages (`2penny.pages.dev`), behind
Cloudflare Access. Real content arrives in Stage 3. See /docs/ROADMAP.md.
```

`backend/README.md` content:
```markdown
# backend

Google Apps Script managed via clasp. Migration of the legacy script and the
headless JSON endpoint arrive in Stage 2. The Telegram webhook deployment is
NEVER touched outside the clasp-deploy skill procedure. See /docs/ROADMAP.md.
```

No commit yet — commit together with Task 3–8 as the governance commit? **No.**
Commit now, separately: `chore: scaffold monorepo directory skeleton`

Verification:
```
git ls-files
```
Expected: the two README files listed.

---

## TASK 3 — `docs/PRINCIPLES.md` (Spanish)

Create with this content (adjust nothing conceptually):

```markdown
# PRINCIPLES.md — Filtro de los Cinco Principios (ley suprema)

Toda propuesta (feature, refactor, herramienta, dependencia, abstracción) debe
pasar LOS CINCO. Uno que falle = REJECT con justificación escrita.

1. **Problema real** — resuelve un problema que existe HOY, no uno hipotético.
2. **Solución más simple** — no existe una alternativa más simple que lo resuelva.
3. **Sin abstracción innecesaria** — no introduce capas, tooling o indirección
   que no compre un beneficio proporcional.
4. **Single-user fit** — dimensionado para un solo usuario (Camilo); nada de
   escala multiusuario, auth compleja ni infraestructura especulativa.
5. **Complejidad diferible se difiere** — si puede posponerse con seguridad,
   se pospone y se registra (ROADMAP/DECISIONS), no se construye "por si acaso".

## Reglas duras asociadas
- **Evidence over narrative:** el estado del sistema se confirma con salida
  real (git, HTTP, diffs, screenshots), nunca con resúmenes sin verificar.
- **Costo monetario cero:** free tier. Única excepción pre-acordada: dominio
  propio (~10 USD/año) como Plan B de Access — no activado (Etapa 0 dio PASS).
- Las decisiones se bloquean formalmente (DECISIONS.md); revisitarlas exige
  revocación explícita, no re-litigio casual.
```

Do not commit yet (governance docs commit at end of Task 8).

---

## TASK 4 — `docs/DESIGN.md` (extraction + anti-slop)

Steps:
1. In the LEGACY repo, locate the Night Ledger token source(s):
   - `docs/DESIGN.md` (token frontmatter / sections §2 Colors, §3 Typography)
   - the `:root { ... }` custom-properties block in the dashboard HTML
     (search: `grep -rn ":root" --include=*.html` in the legacy repo; expected
     in `DashboardPage.html` or similar under an apps-script folder).
2. Create the new `docs/DESIGN.md` (Spanish narrative, verbatim token blocks)
   with this structure:
   - **Header:** "DESIGN.md — Night Ledger v2. Fuente de verdad de tokens
     (Verbatim Token Rule): `frontend/src/lib/styles/tokens.css` (Etapa 3) será
     copia verbatim de los bloques de esta sección, marcada 'do not edit
     directly'."
   - **§1 North Star** — copy/adapt the legacy "Night Ledger" creative north
     star paragraph (near-black ledger, money glows, semantic color, soft
     rounded geometry; rejected: light SaaS-cream, decorative gradients).
   - **§2 Tokens (VERBATIM)** — paste the complete `:root` block from legacy,
     inside a fenced `css` block, untouched. Also paste the legacy typography
     values (Nunito text / Averia Sans Libre numerals, tabular-nums) and the
     14-category color+emoji palette if defined as tokens.
   - **§3 Responsive** — inherit legacy breakpoints doctrine: 768px and 480px;
     reference device Samsung Galaxy A56 5G (395×893). Note: layout specifics
     will be re-derived in Stage 5; only the breakpoint doctrine is inherited.
   - **§4 Anti-slop / Taste** — write this section with exactly these rules:
     - Los tokens Night Ledger son la ÚNICA fuente de color, espaciado, radio y
       tipografía. Si falta un token: STOP y preguntar; nunca inventar.
     - Prohibiciones (cada una es un FAIL): paletas genéricas de IA
       (indigo/violeta/morado sobre blanco, look SaaS por defecto); gradientes
       decorativos o efectos glow/neón; emoji como iconos (solo SVG y solo
       funcionales); look default shadcn/Tailwind o drop-shadow uniforme en
       todas las cards; Inter/Roboto/Arial/system-font como tipografía display;
       iconos decorativos sin función.
     - Mandatos: cifras con `tabular-nums`; monospace en columnas
       numéricas/ledger; alto contraste, densidad profesional estética
       terminal/ledger; jerarquía por tamaño/peso/espacio, no por ruido de
       color. Anclas positivas: densidad terminal/ledger, densidad informativa
       tipo Bloomberg, contención tipo Linear/Vercel.
3. **If any token block cannot be found in the legacy repo, STOP and ask.**

Verification:
```
findstr /c:":root" docs\DESIGN.md    # the verbatim block is present
```
Plus: show a 10-line excerpt of the pasted `:root` block AND the legacy source
path it was copied from, side by side.

---

## TASK 5 — `docs/DATA_CONTRACT.md`

Steps:
1. Read legacy `docs/DATA_MODEL.md` (v1.3) and `docs/DASHBOARD.md` (v2.2).
   If either is missing at those paths, search the legacy repo
   (`git ls-files | findstr /i "DATA_MODEL DASHBOARD"` inside legacy, read-only)
   and report what you found before proceeding.
2. Create `docs/DATA_CONTRACT.md` (Spanish) with:
   - **§1 Fuente de verdad:** Google Sheets, editable a mano. Hojas y columnas:
     inherit the sheet/column inventory and Reporting Rules CONCEPTS from
     legacy DATA_MODEL.md — summarize faithfully, cite the legacy doc version
     inherited from (e.g. "hereda de DATA_MODEL.md v1.3 del repo legacy").
   - **§2 Reglas de reporting:** the rules that govern what counts in each KPI
     (copy the rule list, not the prose).
   - **§3 Contrato del endpoint JSON (Etapa 2 — PENDIENTE):** placeholder
     section stating: shape TBD in Stage 2; the contract will be defined here
     BEFORE `Api.js` is written; breaking changes require an ADR. Include the
     agreed envelope constraints already ratified: live read on refresh (no
     snapshots), secret required (401 without it), single dashboard payload.
   - **§4 Lección Gemini (junio 2026):** contratos de datos explícitos +
     monitoreo existen porque una deprecación silenciosa degradó clasificación
     por semanas. Cambios de modelo pasan por `GeminiGate.js` (Etapa 8).

Verification: show the section headers (`findstr /n "^#" docs\DATA_CONTRACT.md`)
and the legacy files/versions actually read.

---

## TASK 6 — `docs/DECISIONS.md` (ADR log, Spanish)

Create with a short intro ("Registro de ADRs. Formato: contexto → decisión →
evidencia/justificación → fecha. Revocar exige entrada nueva, no edición.") and
these eight entries, dated 2026-07-09 unless noted:

- **ADR-0001 — Cloudflare Pages sobre Workers (plataforma frontend).**
  Contexto: detour evaluando Workers Sites/estático. Decisión: Cloudflare Pages
  (Direct Upload) + Pages Functions. Justificación: integración Access validada
  en Etapa 0 con evidencia (cookie `CF_Authorization`), modelo estático + proxy
  encaja exacto, adapter oficial `@sveltejs/adapter-cloudflare`,
  `adapter-cloudflare-workers` deprecado. Confirmado explícitamente por Camilo.
- **ADR-0002 — Gap de Access en preview URLs (riesgo aceptado temporal).**
  Contexto: el fix del wildcard para proteger producción REEMPLAZÓ la cobertura
  de previews (`hash.2penny.pages.dev` quedó público) en vez de sumarla.
  Decisión: riesgo aceptado mientras no haya datos reales. **Deadline duro:
  crear la segunda política de Access ANTES de cerrar la Etapa 4** (primer
  cableado de datos financieros reales). stage-closer debe verificar esto en
  el cierre de Etapa 4.
- **ADR-0003 — clasp con cuenta personal.** `camilofu94@gmail.com` durante toda
  la migración. Re-evaluación obligatoria en Etapa 8, cuando `CLASPRC_JSON`
  entre a GitHub Secrets (ahí el riesgo de rotación de credenciales se vuelve
  real). Razón: migrar ownership de Apps Script con webhook activo es fricción
  real hoy; el beneficio de la cuenta dedicada solo se materializa en Etapa 8.
- **ADR-0004 — Repo legacy `pacc0/penny` permanece activo.** Referencia de
  consulta durante la migración. Riesgo aceptado: commit accidental al repo
  equivocado. Mitigación: verificar `git remote -v` al inicio de cada sesión de
  Claude Code (regla en CLAUDE.md). Re-evaluar archivado en Etapa 7 (cutover).
- **ADR-0005 — Reviewer como subagent de contexto fresco.** Única excepción de
  subagent del proyecto (`.claude/agents/reviewer.md`, read-only: Read, Grep,
  Glob, Bash; sin Edit/Write). Justificación: el aislamiento de contexto es la
  feature (revisión sin los supuestos del autor). Architect/Guardian/Developer
  siguen siendo skills en el hilo principal (los gates deben ser visibles).
- **ADR-0006 — Disciplina de output terso.** Reversión parcial del descarte de
  "caveman": la terseness se adopta como regla de CLAUDE.md (no como skill),
  con evidencia inline obligatoria (exit codes, hashes, HTTP status).
- **ADR-0007 — Motor de grafos rechazado.** El concepto de graph engine /
  Graphify para transacciones falla el filtro de cinco principios. Sankey vía
  `chartjs-chart-sankey` queda como complejidad diferible, no descartada.
- **ADR-0008 — Anti-slop vía design-tokens + DESIGN.md.** El enforcement de
  gusto visual vive en la skill `design-tokens` (tiempo de escritura de código)
  y en DESIGN.md §Anti-slop (governance). No se crea skill `ui-taste` separada
  (duplicación).

Verification: `findstr /n "ADR-" docs\DECISIONS.md` shows the eight IDs.

---

## TASK 7 — `docs/OPERATIONS.md` (runbook, Spanish)

Create with these sections (concise, single-user runbook — no enterprise prose):

1. **Deploy backend (Apps Script):** SIEMPRE vía la skill `clasp-deploy`. Regla
   de oro: `clasp push` solo actualiza `@HEAD`; publicar = actualizar el
   deployment versionado EXISTENTE (nunca crear uno nuevo → cambiaría la URL
   `/exec` y rompería el webhook de Telegram). Verificación obligatoria:
   `clasp deployments` antes/después, deploymentId del webhook sin cambios.
2. **Deploy frontend:** Cloudflare Pages Direct Upload (Etapas 1–3); CI llega
   después. Producción: `2penny.pages.dev` tras Access.
3. **Rollback:** por etapa, según la tabla de ROADMAP.md (cada etapa define el
   suyo). Principio strangler-fig: v1.0 sigue viva hasta la Etapa 7.
4. **Límites free tier a conocer:** Pages Functions comparte los 100.000
   requests/día de Workers (reset a medianoche UTC; Error 1027 al exceder).
   Sobra para single-user con live read por refresh.
5. **Seguridad:** gap de Access en preview URLs (ver ADR-0002, deadline Etapa 4).
   Secretos: nunca en el repo; `CLASPRC_JSON` va a GitHub Secrets solo en
   Etapa 8; el secreto del endpoint JSON vive server-side en la Pages Function.
6. **Lección operativa (incidente Gemini, junio 2026):** deprecación silenciosa
   de `gemini-2.0-flash` degradó la clasificación semanas antes de detectarse.
   Guardarraíles resultantes (Etapa 8): `GeminiGate.js` (cambio de modelo en un
   solo archivo) + `Canary.js` (llamada trivial periódica + alerta Telegram;
   vigilar deprecación de `gemini-3.1-flash-lite`, mayo 2027).

Verification: `findstr /n "^#\|^[0-9]" docs\OPERATIONS.md`

---

## TASK 8 — `docs/ROADMAP.md` (Spanish) + governance commit

Create with:
- **Principio rector:** strangler-fig — v1.0 viva en producción durante todo el
  proceso. Cada etapa: objetivo, entregable, evidencia, rollback, NO-cambia.
- **Tabla de estado:**

| Etapa | Nombre | Estado |
|---|---|---|
| 0 | Spike de infraestructura (Access sobre pages.dev) | ✅ CERRADA 2026-07-09 |
| 1 | Scaffold del monorepo + docs de gobernanza | 🔵 EN CURSO |
| 2 | Endpoint JSON headless en Apps Script (deployment separado) | ⚪ |
| 3 | Shell Svelte 5 + mock data en Pages tras Access | ⚪ |
| 4 | Datos reales vía Pages Function proxy | ⚪ (gate: ADR-0002 resuelto antes de cerrar) |
| 5 | Rediseño visual Night Ledger | ⚪ |
| 6 | Charts (Chart.js) | ⚪ |
| 7 | Cutover + retiro del dashboard doGet v1.0 | ⚪ (re-evaluar ADR-0004) |
| 8 | Endurecimiento: clasp-guard.yml, GeminiGate, Canary | ⚪ (re-evaluar ADR-0003) |

- **Etapa 0 — evidencia de cierre (registrada):** hostname `2penny.pages.dev`
  reservado (proyecto Pages, Direct Upload); Access sobre producción validado
  con evidencia de red (cookie `CF_Authorization` + login real); clasp v3.3.0
  logueado (`camilofu94@gmail.com`, `.clasprc.json` 632B); scaffold mínimo
  commiteado (`c4341b1`).
- **Etapas 1–8 — detalle:** for each stage, write objetivo / entregable /
  evidencia / rollback / NO-cambia as ratified in Phase 2 (summarized above in
  this plan's context and in the stage descriptions from the strategic
  sessions). Keep each stage under ~10 lines. Critical invariants to state
  verbatim in stages 2 and 7: the Telegram webhook `doPost`, classification
  waterfall, and monthly summary are NEVER touched; stage 2 evidence requires
  `clasp deployments` showing BOTH deployments with the webhook deploymentId
  unchanged (before/after comparison) + curl 200-with-secret / 401-without.
- **Nota de proceso:** las skills `checkpoint-chat`, `checkpoint-code` y
  `stage-closer` son entregables de Etapa 1; `stage-closer` debe existir ANTES
  de cerrar la Etapa 1 (se usa para cerrarla).

Then commit ALL of /docs (Tasks 3–8):
`docs: governance set — principles, design tokens, data contract, ADR log, ops runbook, roadmap`

Verification:
```
git show --stat HEAD
git ls-files docs
```
Expected: 6 files under docs/.

---

## TASK 9 — The 7 pipeline skills (`.claude/skills/<name>/SKILL.md`, English)

Create each file with YAML frontmatter (`name`, `description`) and a terse body.
Keep every skill under ~40 lines. Content:

### 9.1 `strategic-session/SKILL.md`
```markdown
---
name: strategic-session
description: Use when starting an architecture, scope, or design discussion for
  2penny. Enforces discussion-before-code and the five-principles filter.
---
# strategic-session

Hard gate: NO implementation code until a design is presented and the user
approves it explicitly.

## Workflow
1. State the problem in one paragraph. Confirm it is a REAL problem (principle 1).
2. Explore options critically; discard bad ones with written justification.
3. Run the five-principles filter (see /docs/PRINCIPLES.md) on the surviving option.
4. Present the design and STOP for human approval.
5. On approval, invoke the writing-plans skill. Never skip to code.
```

### 9.2 `writing-plans/SKILL.md`
```markdown
---
name: writing-plans
description: Use after a spec is approved, to break it into small file-by-file
  tasks with evidence-based verification steps. No TDD.
---
# writing-plans

## Rules
- Map every file created/modified with its exact path.
- Each task: small, self-contained, ordered.
- Each task ends with a VERIFICATION BLOCK of observable evidence (command
  output, HTTP response, screenshot path). Never a narrative claim.
- TDD is deliberately excluded (project doctrine: manual validation, never
  formalized testing). The verification block replaces red-green-refactor.
- Plans live in docs/plans/ and are committed before execution.
```

### 9.3 `architect-gate/SKILL.md`
```markdown
---
name: architect-gate
description: Use when a proposal or plan must be checked against the
  five-principles filter before human approval. Produces PASS/REJECT.
---
# architect-gate

Run /docs/PRINCIPLES.md principles 1–5, one by one, citing evidence for each.
Output format:

| # | Principle | Verdict | Why |
|---|-----------|---------|-----|

Final verdict: PASS (all five) or REJECT (name the failing principle(s) with
technical justification). Never write code. Never soften a REJECT.
```

### 9.4 `guardian-gate/SKILL.md`
```markdown
---
name: guardian-gate
description: Use at Gate 1 (before development) and Gate 2 (before merge) to
  verify compliance with governance docs. Blocks on narrative evidence.
---
# guardian-gate

## Gate 1 (plan → dev)
- Plan complies with PRINCIPLES.md, DATA_CONTRACT.md, DESIGN.md.
- Any backend deploy step routes through the clasp-deploy skill. A plan that
  touches the webhook deployment any other way = BLOCK.

## Gate 2 (code → merge)
- Demand REAL evidence: git diff, `clasp deployments` output, HTTP responses,
  screenshots. Verify the webhook deploymentId is unchanged when backend touched.
- Narrative-only evidence ("it works", "deployed successfully") = BLOCK.
```

### 9.5 `reviewer-checklist/SKILL.md`
```markdown
---
name: reviewer-checklist
description: Use after implementation for a fresh-context quality review against
  project doctrine. Manual validation only — there are no tests to run.
---
# reviewer-checklist

Review with fresh eyes (also used by the reviewer subagent):
- [ ] Readability: a future single maintainer understands it without archaeology.
- [ ] Design tokens: every color/spacing/radius/type value traces to tokens.css
      verbatim (Verbatim Token Rule). Flag any invented value.
- [ ] Anti-slop: no violations of DESIGN.md §Anti-slop prohibitions.
- [ ] No hardcoded secrets, keys, or /exec URLs.
- [ ] Data contract intact (DATA_CONTRACT.md not violated silently).
- [ ] Deploy integrity: no deployment URL/id changed unexpectedly.
Output: finding list (location → problem → fix), one line each, then verdict.
```

### 9.6 `clasp-deploy/SKILL.md`
```markdown
---
name: clasp-deploy
description: Use ANY time backend Apps Script code must reach production.
  Encodes the webhook-preserving deploy procedure. Non-negotiable.
---
# clasp-deploy

The footgun: `clasp push` only updates @HEAD — installed users never see it,
and creating a NEW deployment changes the /exec URL and silently breaks the
Telegram webhook.

## Procedure
1. `clasp deployments` — capture BEFORE state (all deploymentIds).
2. `clasp push` — uploads to @HEAD only.
3. Publish by UPDATING the existing versioned deployment (Manage deployments →
   edit → Version dropdown → New version → Deploy). NEVER create a new one for
   an existing endpoint.
4. `clasp deployments` — capture AFTER state. The webhook deploymentId MUST be
   byte-identical to BEFORE. If it changed: STOP, alert, roll back.
5. Smoke test: send a test Telegram message; confirm ingestion.

Rules: the /dev (@HEAD) URL is test-only, editor-only; never shared, never used
as a webhook. Paste real command output as evidence at every step.
```

### 9.7 `design-tokens/SKILL.md`
```markdown
---
name: design-tokens
description: Use when writing or editing ANY CSS/visual code — enforces the
  Verbatim Token Rule and anti-slop directives.
---
# design-tokens

Night Ledger tokens from frontend/src/lib/styles/tokens.css are the ONLY source
of color, spacing, radius and type. Never invent values. If a token is missing,
STOP and ask. Source of truth: /docs/DESIGN.md.

## Anti-slop directives (enforced at code-writing time)

HARD PROHIBITIONS (each is a fail):
- No generic/AI-default palettes: no indigo/violet/purple gradients, no
  purple-on-white SaaS look.
- No decorative gradients or glow/neon effects.
- No emoji as icons — SVG only, and only when functional.
- No default shadcn/Tailwind look; no uniform drop-shadow on every card.
- No Inter/Roboto/Arial/system-font default for display type.
- No decorative icons without a function.

MANDATES:
- Figures use tabular-nums; monospace for numeric/ledger columns.
- High contrast, dense, professional "ledger/terminal" aesthetic.
- Hierarchy via size/weight/space, not via color noise.
- Positive anchors: terminal/ledger density, Bloomberg-like information
  density, Linear/Vercel restraint.
Reference of record: /docs/DESIGN.md (Anti-slop / Taste section).
```

No commit yet (skills commit at end of Task 10).

---

## TASK 10 — The 3 process skills (verbatim from ratified specs)

### 10.1 `.claude/skills/checkpoint-chat/SKILL.md` — EXACT content:
```markdown
---
name: checkpoint-chat
description: Generates a pasteable architectural-state summary to cleanly start
  a fresh 2penny UI chat thread. Use when the user says "checkpoint", "handoff
  this chat", "start a new thread", "estoy saturando el contexto", or a chat
  session grows long and hallucination/bloat risk rises.
---
# checkpoint-chat

Produce ONE self-contained Markdown block the user can paste into a brand-new
Claude chat to resume 2penny planning with zero re-explanation.

## Workflow
1. Scan the current conversation only (do not invent state).
2. Fill every section below. If a section is empty, write "none".
3. Output the block verbatim inside a single fenced code block. No prose around it.

## Output format
```
# 2penny — Chat Checkpoint (<YYYY-MM-DD HH:MM>)
## Locked decisions (do NOT re-litigate)
- <bullet list of decisions confirmed this session>
## Current roadmap stage
- Stage <n>: <name> — status <not started|in progress|blocked|done>
## Evidence state
- <what has been verified with proof: HTTP, git, deploy id, screenshot>
## Open questions
- <undecided items needing an answer>
## Explicitly NOT decided / out of scope
- <items deliberately deferred>
## Next intended step
- <the single next action>
```
## Rules
- Terse. No narrative. Facts only (evidence-over-narrative).
- Never include secrets, API keys, or the Apps Script /exec URL value.
```

### 10.2 `.claude/skills/checkpoint-code/SKILL.md` — EXACT content:
```markdown
---
name: checkpoint-code
description: Writes a standardized engineering handoff file to docs/HANDOFF.md so
  a fresh Claude Code session resumes 2penny without re-reading history. Use when
  the user says "checkpoint code", "write handoff", "wrap up session", or context
  is high (~60%) before a /clear.
---
# checkpoint-code

## Workflow
1. Run and capture REAL evidence (never summarize from memory):
   - `git branch --show-current`, `git status --short`, `git log --oneline -5`
   - current roadmap stage from /docs/ROADMAP.md
   - last verified Apps Script deployment id and confirm /exec URL unchanged
2. Write docs/HANDOFF.md using the exact format below (overwrite).
3. Print a one-line confirmation with the file path and git hash.

## Output file format (docs/HANDOFF.md)
```
# 2penny — Engineering Handoff (<YYYY-MM-DD HH:MM>)
## Branch & stage
- branch: <name> | roadmap stage: <n> <name> (<status>)
## Verified deployment (WEBHOOK INTEGRITY)
- Apps Script deployment id: <id>
- /exec URL unchanged since last stage: <yes/no + evidence>
## In-flight tasks (with file paths)
- <task> — <path/to/file> — <state>
## Next planned step
- <single next action>
## Known landmines
- clasp footgun: never let the /exec URL silently change
- <other project-specific gotchas>
## Evidence attached
- <git status/log excerpts, HTTP codes, deploy ids>
```
## Rules
- Evidence over narrative: paste real command output, do not paraphrase.
- Reference files by path; do not paste large diffs.
- Never write secrets into the file.
```

### 10.3 `.claude/skills/stage-closer/SKILL.md` — EXACT content:
```markdown
---
name: stage-closer
description: Runs the evidence checklist to close a 2penny roadmap stage. Use when
  the user says "close stage", "cerrar etapa", or a stage's work is done and needs
  sign-off. Collects proof, writes the DECISIONS.md entry, verifies webhook
  deployment id unchanged, and updates ROADMAP.md status.
---
# stage-closer

## Workflow
1. Collect evidence for the stage's acceptance criteria (screenshots paths,
   command outputs, HTTP responses). Refuse to proceed if any criterion lacks
   proof.
2. Verify the Apps Script /exec deployment id is UNCHANGED (clasp footgun).
   If changed, STOP and flag it — do not close the stage.
3. Append a DECISIONS.md entry (ADR-style: context, decision, evidence, date).
4. Update ROADMAP.md: set stage status to done, mark next stage active.
5. Print terse confirmation: stage number, DECISIONS.md hash, ROADMAP diff.

## Rules
- Evidence over narrative. No proof, no close.
- Never close a stage if webhook integrity is unverified.
```

Commit Tasks 9+10 together:
`feat(claude): ten SKILL.md files — pipeline gates, deploy procedure, checkpoints, stage-closer`

Verification:
```
git ls-files .claude/skills
```
Expected: exactly 10 SKILL.md paths.

---

## TASK 11 — Reviewer subagent (`.claude/agents/reviewer.md`)

Per ADR-0005. Create:

```markdown
---
name: reviewer
description: Fresh-context, read-only code reviewer for 2penny. Reviews diffs
  and files against project doctrine without the author's assumptions. Use
  PROACTIVELY after any implementation task completes, before Guardian Gate 2.
tools: Read, Grep, Glob, Bash
---
# reviewer (read-only)

You did NOT write this code. Review it cold, against the repo's governing docs:
/docs/PRINCIPLES.md, /docs/DESIGN.md (incl. Anti-slop), /docs/DATA_CONTRACT.md.

Apply the reviewer-checklist skill items:
readability; Verbatim Token Rule (flag any color/spacing/type value not in
tokens.css); anti-slop prohibitions; no hardcoded secrets or /exec URLs; data
contract intact; no deployment URL/id drift (run `clasp deployments` via Bash
if backend files changed — read-only command).

Output: one line per finding (path:line → problem → suggested fix), then a
verdict: APPROVE or REQUEST-CHANGES. You cannot edit files — never try.
```

Commit: `feat(claude): reviewer subagent — fresh-context, read-only (ADR-0005)`

Verification: `git ls-files .claude/agents` → one file.

---

## TASK 12 — GitHub workflows

### 12.1 `.github/workflows/frontend-ci.yml` (dormant until Stage 3 — path filter)
```yaml
name: frontend-ci
on:
  push:
    paths: ["frontend/**"]
  pull_request:
    paths: ["frontend/**"]
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
```

### 12.2 `.github/workflows/clasp-guard.yml` (INERT stub — Stage 8 deliverable)
```yaml
name: clasp-guard
# Stage 8 guardrail — INTENTIONALLY INERT until Stage 8 (see docs/ROADMAP.md).
# Final version will verify webhook deployment-id integrity after backend
# pushes, using the CLASPRC_JSON secret (never committed), and fail on drift.
on:
  workflow_dispatch:
jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - run: echo "clasp-guard is a Stage 8 deliverable. Inert by design." 
```

Commit: `ci: frontend build workflow (path-filtered) + inert clasp-guard stub for stage 8`

Verification: `git ls-files .github` → two files.

---

## TASK 13 — Root `README.md` + CLAUDE.md reconciliation

### 13.1 `README.md` (create if absent):
```markdown
# 2penny

Single-user personal finance system. Svelte 5 static shell on Cloudflare Pages
(behind Cloudflare Access) + Pages Function proxy → headless JSON endpoint in
Google Apps Script. Google Sheets is the source of truth. Telegram ingestion,
Gemini classification waterfall, monthly AI summary — all in Apps Script.

Governance lives in /docs (start with PRINCIPLES.md — the five-principles
filter is supreme law). Roadmap: /docs/ROADMAP.md. Process skills: .claude/.
```

### 13.2 CLAUDE.md — reconcile, do not rewrite:
1. Verify the "Response style (terse by default)" section exists (it was
   committed in `c4341b1`-era work). If absent, STOP and report.
2. APPEND (only if not already present) a short "Session start" rule:
   - `Run git remote -v at session start; if it points to pacc0/penny, STOP —
     wrong repo (ADR-0004).`
   - One-line pointers: governance in /docs (PRINCIPLES.md is supreme law);
     backend deploys ONLY via the clasp-deploy skill.
3. Keep CLAUDE.md under 150 lines total. If appending would exceed it, report
   instead of trimming on your own.

Commit: `docs: root README + CLAUDE.md session-start guard`

Verification:
```
git log --oneline -8
git ls-files
```

---

## TASK 14 — Final evidence report (no commit)

Produce, verbatim:
1. `git log --oneline` (all Stage 1 commits, Conventional format).
2. `git ls-files` (full tree — expected ~25 files).
3. Confirmation line per governance doc: path + first heading.
4. Reminder to the user: Stage 1 is NOT closed by this plan — closure runs
   through the stage-closer skill (which now exists), in a follow-up step, and
   requires the user's sign-off.

## Explicitly OUT of scope for this plan
- No Svelte project init (`npm create`), no package.json — that is Stage 3.
- No Apps Script code migration — that is Stage 2.
- No changes to the legacy repo, to Cloudflare, or to any deployment.
- No second Access policy (tracked by ADR-0002, deadline Stage 4).
