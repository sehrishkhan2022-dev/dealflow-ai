# Start Here: DealFlow AI in Codex

## Setup

1. Create a new Git repository named `dealflow-ai`.
2. Copy this package's `AGENTS.md` into the repository root.
3. Copy `DealFlow_AI_Development_Spec.md` into `docs/DealFlow_AI_Development_Spec.md`.
4. Open the repository in Codex and run the task below.
5. Review and test Phase 0 before moving to Phase 1.

## Prompt 1 — Build the foundation

Read `AGENTS.md` and `docs/DealFlow_AI_Development_Spec.md`. Implement Phase 0 only. Build a working Next.js + TypeScript frontend and Laravel API, PostgreSQL, Redis, Docker local environment, authenticated multi-tenant workspace system, RBAC foundation, accessible DealFlow UI shell, seeded demonstration workspace, API health check, migrations, automated tests and clear README. Follow the design tokens and route plan. Do not connect Gmail, call live AI, send emails or add payments. Implement provider abstractions/mocks only. Run tests and report what passed, failed and remains.

## Prompt 2 — Core MVP after review

Using the approved Phase 0, implement Phase 1 from the specification. Build lead CRUD, CSV import/preview, activity timeline, deterministic opportunity rules, Recovery Inbox and detail pages, AI adapter with strict structured-output validation and default mock provider, draft editing/versioned approval, audit logging and real analytics. Add strong two-tenant authorization tests and realistic fixtures. Do not send outbound email. Run tests and report results.

## Prompt 3 — Integrations after approval

Implement Phase 2, including secure OAuth integration, Gmail sync, revocation, deduplication, versioned approval enforcement, idempotent send queue and provider acknowledgments. Use sandbox/test accounts and do not activate live customer connections without explicit approval. Include security and failure-path tests. Report provider verification or scope blockers explicitly.

## Prompt 4 — Paid beta and deployment

Implement Phase 3: billing-provider abstraction, eligible hosted billing integration, verified webhook handling, usage entitlements, admin/team settings, deletion/export requests, production metrics, monitoring and deployment playbook. Do not assume Stripe is supported for the merchant entity; confirm eligibility. Add release checklist, staging tests and rollback procedure.

## Product acceptance walkthrough

User creates workspace -> adds a lead -> imports timeline/events -> rules detect a missed follow-up -> user reviews evidence -> AI prepares a draft -> authorized user edits/approves -> system logs approval -> (once integration is verified) approved message is sent exactly once -> delivery/reply and confirmed deal outcomes update factual analytics.
