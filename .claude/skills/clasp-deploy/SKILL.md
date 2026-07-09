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
