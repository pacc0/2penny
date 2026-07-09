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
