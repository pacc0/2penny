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
