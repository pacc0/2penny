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
