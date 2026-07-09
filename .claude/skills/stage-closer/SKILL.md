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
