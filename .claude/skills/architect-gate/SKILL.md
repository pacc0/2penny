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
