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
