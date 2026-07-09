# 2penny — Project Governance (root context)

Personal single-user finance system. Google Workspace backend + Svelte 5 frontend on Cloudflare.
Planning happens in Spanish; all written agent instructions and code artifacts are in English.

## Supreme law: the five-principles filter
Every proposal MUST pass all five before any code is written:
1. Solves a REAL problem in the CURRENT phase (not hypothetical/future).
2. Is the SIMPLEST solution that works.
3. Adds NO unnecessary abstraction.
4. Fits a SINGLE user (no multi-tenant, no auth systems, no scaling).
5. Defers complexity that can be safely deferred.
If a proposal fails any principle, reject it and say which one.

## Evidence over narrative (hard rule)
NEVER claim state without proof. Confirm with real output: git diff, git status,
clasp deployments, HTTP response codes, screenshots. A summary is not evidence.
If you have not run the command, say "unverified" - do not assert.

## Scope discipline
- Zero monetary cost is UNBREAKABLE. Any proposal with a cost is rejected by default;
  the only paid escape hatch is a pre-agreed custom domain (Camilo's call only).
- Single user. No feature exists to serve "other users."

## The deployment footgun (READ BEFORE ANY BACKEND DEPLOY)
clasp push updates @HEAD ONLY. It does NOT update versioned deployments.
The Telegram webhook runs on a PINNED versioned deployment with a STABLE /exec URL.
Creating a NEW deployment changes the URL and BREAKS the webhook.
Never improvise a deploy; use the clasp-deploy skill once it exists (Stage 1).

## Response style (terse by default)
Default to TERSE, CLI-style output. Optimize for reading time and cognitive agility.
DEFAULT (terse): command confirmations, script runs, pass/fail reports, mechanical
refactors, file creation, git operations, deploys. One line per result. Terse !=
evidence-free: every confirmation carries proof inline (exit code, file path,
git hash, HTTP status, deployment id). Show errors verbatim, never soften them.
ESCALATE to consultant mode (rich prose) only for: architecture/design decisions,
database/auth/API-contract flow decisions, complex multi-file debugging, or when
explicitly asked ("explain", "why", "consultemos").

## Language split
Planning conversations: Spanish. Agent instructions, code, commit messages: English.

## Where things live (populated in Stage 1)
- Governance: /docs
- Skills: .claude/skills/
- Pipeline: Architect -> Guardian Gate 1 -> HUMAN approval -> Developer -> Reviewer
  -> Guardian Gate 2 -> HUMAN merge.

## Session start
Run `git remote -v` at session start; if it points to pacc0/penny, STOP —
wrong repo (ADR-0004). Governance lives in /docs (PRINCIPLES.md is supreme
law); backend deploys ONLY via the clasp-deploy skill.
