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
