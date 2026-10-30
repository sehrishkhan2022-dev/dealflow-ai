<!-- Converted from the user-supplied DealFlow_AI_Codex_Development_Spec.docx. -->

## DealFlow AI — Full SaaS Development Specification

Version: 1.0Status: Implementation-ready planning baselineAudience: Product owner, software engineering team, OpenAI CodexProduct type: Multi-tenant B2B SaaSTarget launch: Private beta, then paid productionPrimary stack: Next.js + TypeScript, Laravel API, PostgreSQL, Redis, OpenAI API

Build principle: Ship a reliable lead-recovery assistant, not a replacement CRM. Every external message is human-approved in MVP. Demo charts must never be passed off as real customer metrics.

### 1. Executive product definition

DealFlow AI is an AI-assisted revenue-recovery platform for B2B professional service companies. It connects to authorized inboxes and lead sources, detects unanswered inquiries and stalled proposals, presents evidence-backed opportunities in a Recovery Inbox, generates relevant follow-up drafts, and tracks approval, sending, replies, meeting bookings and verified deal outcomes.

Main promise: Stop losing sales opportunities because nobody followed up.

Ideal early customers: Digital agencies, development agencies, SEO agencies, consultancies, and B2B service teams with 5–50 employees and deal values typically above USD 1,000. Initial markets: US, UK, Canada and Australia.

Core differentiation: Works alongside a company’s existing email/CRM stack, provides explainable opportunity detection and controlled execution, and measures actual next-step and deal outcomes. AI generation is not the product’s only value.

#### 1.1 Product objectives

Identify actionable missed follow-ups and stalled deals within authorized sources.

Reduce time from opportunity detection to approved next action.

Ensure no duplicate or unwanted outbound sequences are triggered.

Produce auditable, source-linked AI recommendations.

Give teams verified reporting on responses, meetings and closed-won outcomes.

Maintain strong workspace isolation, privacy and controlled API consumption.

#### 1.2 Non-goals for MVP

Do not build a full CRM, LinkedIn automation, WhatsApp automations, automated voice calling, a drag-and-drop workflow editor, full white-labeling, autonomous prospecting, bulk cold email, a mobile application, or unrestricted AI agents. These can be later roadmap candidates only after user demand is validated.

#### 1.3 Product success criteria (proposed hypotheses)

| Measure | Private-beta target | Instrumentation |
| --- | --- | --- |
| Design partners | 5 paying businesses | Subscription records |
| Opportunity review precision | At least 90% on manually evaluated sample | Reviewer labels and reason codes |
| Weekly activation | At least 70% of enrolled workspaces act on a suggestion | Events / audit logs |
| Review-to-action turnaround | Median under one business day | Detection and approval timestamps |
| Pilot renewal interest | At least 4 of 5 | Explicit renewal decisions |
| Reliable delivery | No duplicate sends in retry and webhook tests | Idempotency logs |

Targets are validation hypotheses, not guaranteed results or industry facts.

### 2. User roles and multi-tenancy

| Role | Permission summary |
| --- | --- |
| Platform super-admin | SaaS-wide tenants, health, plan catalog, support access via audited controls; no routine customer message access |
| Workspace owner | Billing, members, policies, connections, exports, deletion |
| Workspace admin | Members, connections if allowed, workflows, all workspace leads |
| Sales manager | All leads, assignment, approval, reporting |
| Sales agent | Assigned leads, draft editing, permitted approvals |
| Viewer | Read-only permitted records and reports |

Isolation: Every customer-owned database record contains workspace_id; all queries are scoped through workspace-aware services/policies, not only frontend filters. Audit global admin overrides. Never allow tenant IDs supplied by clients to override authenticated membership.

#### 2.1 Principal journeys

Owner onboarding: Sign up -> verify email -> create workspace -> pick region and timezone -> accept data-processing terms -> invite users -> connect Gmail with least-needed scopes -> select lead source -> set detection thresholds -> run an initial scan -> review findings.

Sales agent recovery: Open Recovery Inbox -> filter by value, aging and assigned owner -> inspect lead and source evidence -> edit AI draft -> approve -> send through authorized integration -> record send result -> stop follow-ups automatically on reply or opt-out -> track outcome.

Manager oversight: View leads needing action -> reassign opportunity -> investigate detection quality -> review approvals and failures -> inspect genuine revenue outcomes -> export report.

Admin billing: View usage -> change plan -> manage payment method -> download invoices -> review limits / overages -> cancel and export data.

### 3. UI and experience design

The supplied interactive prototype is a visual reference, not a production source of truth. Build clean, accessible responsive screens with a left navigation, top workspace header, purple primary accent, navy sidebar, neutral white cards, clear status badges and fast keyboard-accessible actions.

#### 3.1 Routes and pages

| Route | Page | Acceptance requirement |
| --- | --- | --- |
| / | Marketing homepage | Value proposition, benefits, pricing, FAQ, demo/registration CTAs |
| /pricing | Pricing | Plans, limits, FAQs, feature comparison |
| /login, /register | Auth | Validation, recovery, verification, rate limiting |
| /onboarding | Workspace setup | Progress, connect source, select thresholds |
| /app/:workspace/overview | Dashboard | Real counters, recent activity, priority opportunities, reporting period |
| /app/:workspace/recovery | Recovery Inbox | Search, filters, sorting, pagination, bulk assignment; no bulk send in MVP |
| /app/:workspace/leads | Lead list | Import, inspect, assign, change stage, merge duplicates |
| /app/:workspace/leads/:id | Lead detail | Contacts, events, linked source excerpts, drafts, timeline, actions |
| /app/:workspace/drafts | Approval queue | Draft preview, editing, approve/reject with reason, send status |
| /app/:workspace/workflows | Rule settings | Inactivity thresholds, stop rules, business hours, dry-run test |
| /app/:workspace/analytics | Analytics | Funnel, response rate, approvals, meetings, confirmed outcomes, date filters |
| /app/:workspace/integrations | Connections | OAuth status, sync health, reconnect, disconnect, permissions |
| /app/:workspace/team | Members | Invite, role change, remove, reassignment safeguards |
| /app/:workspace/billing | Billing | Plan, subscription, usage, invoices, payment portal |
| /app/:workspace/settings | Settings | Timezone, data retention, exports, notifications, deletion requests |
| /admin | Platform admin | Tenant/plan/usage overview, support logs, incident status; strict access |

#### 3.2 UI components

AppShell, WorkspaceSwitcher, Sidebar, TopBar, MetricCard, LeadTable, OpportunityCard, RiskReasonList, EvidenceTimeline, DraftEditor, ApprovalToolbar, SourceConnectionCard, RuleEditor, UsageMeter, BillingPlanCard, AuditEventList, EmptyState, ErrorState, Skeleton, ConfirmDialog, Toast, DataTablePagination.

#### 3.3 Design tokens

| Token | Proposed value |
| --- | --- |
| Primary / CTA | #6557E8 |
| Sidebar | #131D35 |
| Heading | #182842 |
| Muted text | #8995A8 |
| Border | #E5E9F1 |
| Surface | #FFFFFF |
| App background | #F5F7FC |
| Success | #159775 |
| Warning | #B7791F |
| Danger | #CE4B58 |
| Body type | Inter or system UI fallback |
| Heading type | Inter, 600–800 weights |

Responsive: full navigation on desktop, collapsible rail or drawer on tablet/mobile. Tables should support horizontal scroll and mobile column condensation. Follow WCAG 2.2 AA as a design and test target: labels, focus order, contrast, ARIA and validation messages.

#### 3.4 UI states and behaviors

Every page must support loading, error, empty, success and forbidden states. Never display illustrative business metrics as real values. In unconnected workspaces, provide clearly marked demo mode with seeded records, not fabricated live analytics. All buttons must have working handlers or be explicitly disabled.

### 4. Technical architecture

Monorepo: apps/web (Next.js, React, TypeScript), apps/api (Laravel), optional packages/contracts (OpenAPI/generated TS client), infra/ and docs/.

Backend: Laravel provides REST endpoints, policies, validation, scheduled jobs and queues. PostgreSQL stores transactional records, Redis backs queues and rate limits. A worker processes Gmail sync, classification and delivery retries. S3-compatible object storage can store exports and attachments when needed.

AI: OpenAI API server-side only. Use structured JSON outputs with strict schema validation, deterministic opportunity rules and idempotent downstream execution. Model name and generation parameters belong in environment-based configuration. Do not expose keys or raw sensitive prompts in client bundles.

Identity: Use Laravel-managed authentication with secure HTTP-only cookies for same-site flows and CSRF protection, or a carefully reviewed token approach for a separate frontend domain. Prefer session-based flows when practical. Email verification, password reset and optional MFA for owner/admin are required for production.

Integrations: Google OAuth for Gmail and Google Calendar. Implement the narrowest scopes justified by features, encrypted token storage, refresh handling, reconnect flows, documented provider verification requirements and a sandbox/testing plan. CSV and inbound webhook support offer onboarding without Gmail.

Billing: Stripe Billing for eligible business entities/regions, using server-created Checkout/Portal sessions and verified webhooks. Do not assume availability for every country; provide a billing-provider abstraction and enable payments only after merchant eligibility is confirmed.

Data flow: source event -> normalization -> deduplication -> lead linking -> rule evaluation -> optional LLM classification -> recommendation -> user review -> approval -> send job -> provider acknowledgment -> reply detection -> outcome analytics.

#### 4.1 Repository skeleton

dealflow-ai/  AGENTS.md  README.md  .env.example  docker-compose.yml  apps/    web/      app/      components/      features/      lib/      tests/    api/      app/Domain/        Workspaces/        Leads/        Opportunities/        Messages/        Integrations/        Automations/        Billing/        Analytics/      app/Http/Controllers/Api/V1/      app/Jobs/      app/Policies/      database/migrations/      database/seeders/      routes/api.php      tests/Feature/      tests/Unit/  packages/    contracts/  infra/    docker/    deployment/  docs/    adr/    api/    security/

#### 4.2 Environments

local, test, staging, production with distinct database, queues, API keys, encryption keys, webhook secrets, OAuth redirect URIs and billing mode. Production data must never be used in automated development tests.

### 5. Data model — PostgreSQL

Use UUID or ULID primary keys consistently. Add created_at, updated_at and appropriate deleted_at fields. Use database constraints and foreign keys. Index (workspace_id, status), (workspace_id, created_at), provider external IDs and due timestamps. The following is a logical schema; migrations should make data types and constraints explicit.

| Table | Important fields | Purpose |
| --- | --- | --- |
| users | id, name, email unique, password_hash, verified_at, mfa state | Identity |
| workspaces | id, name, slug unique, region, timezone, status, settings jsonb | Tenant |
| workspace_members | workspace_id, user_id, role, invited_at, accepted_at | RBAC membership |
| invitations | workspace_id, email, role, token_hash, expires_at | Invite workflow |
| contacts | id, workspace_id, name, email_normalized, phone, company_id, opt_out_at | People |
| companies | id, workspace_id, name, domain, industry | Accounts |
| leads | id, workspace_id, company_id, primary_contact_id, title, stage, value_minor, currency, owner_id, last_activity_at, source_type | Pipeline items |
| lead_sources | id, workspace_id, type, display_name, status, config | Imported sources |
| integrations | id, workspace_id, provider, account_identity, scope_set, status, encrypted_token_ref, last_sync_at | Authorized connections |
| source_events | id, workspace_id, integration_id, provider_event_id, fingerprint, payload_minimized, occurred_at | Ingested activity |
| messages | id, workspace_id, lead_id, source_event_id, direction, provider_message_id, subject, body_redacted_or_encrypted, sent_at, received_at, status | Message records |
| opportunities | id, workspace_id, lead_id, rule_id, type, reason_codes jsonb, evidence_refs jsonb, score, state, detected_at, resolved_at | Detected gaps |
| opportunity_rules | id, workspace_id, type, threshold_business_days, filters jsonb, enabled, stop_conditions jsonb | Deterministic rules |
| ai_runs | id, workspace_id, opportunity_id, task_type, prompt_version, model, input_hash, output_schema_version, tokens_in, tokens_out, status, error_code | AI audit and usage |
| drafts | id, workspace_id, opportunity_id, subject, body, version, status, author_type, reviewed_by, approved_at, rejected_at | Reviewable content |
| send_jobs | id, workspace_id, draft_id, integration_id, idempotency_key unique, state, attempts, provider_message_id, last_error | Delivery tracking |
| tasks | id, workspace_id, lead_id, assignee_id, kind, due_at, state | Team action list |
| appointments | id, workspace_id, lead_id, provider_event_id, starts_at, status | Booked meetings |
| deal_outcomes | id, workspace_id, lead_id, result, confirmed_amount_minor, currency, confirmed_at, confirmed_by, evidence | Verified commercial outcomes |
| audit_logs | id, workspace_id nullable, actor_id, action, resource_type, resource_id, metadata_redacted, ip_hash, occurred_at | Security and product audit |
| subscriptions | workspace_id, plan_code, billing_provider, external_customer_id, external_subscription_id, status, current_period_end | Billing state |
| usage_ledger | workspace_id, metric, quantity, source_id, period_start, period_end | Metering and limits |
| webhook_receipts | provider, event_id unique, received_at, processed_at, result | Replay protection |

#### 5.1 Business constraints

A contact can belong to multiple leads within the same workspace; cross-workspace links are forbidden.

Money uses integer minor units plus ISO currency, never float.

Evidence references point to authorized, access-controlled source events/messages.

provider_event_id and inbound webhooks must be idempotent within provider/integration scope.

An opportunity must not reopen repeatedly for identical evidence and rule version.

Only an approved draft matching the current immutable version may be sent.

One outbound email uses one durable idempotency key, including retries.

Opt-out, reply, disconnected account, expired OAuth, inactive subscription or forbidden business hour must halt sending as configured.

Soft deletion must not be the only privacy deletion mechanism; implement eventual hard deletion and backup retention policy.

### 6. API specification (v1)

Base path: /api/v1. JSON over HTTPS. Provide OpenAPI 3.1 spec generated/maintained with code. Standard error shape: { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} }, "request_id": "..." }. Paginated lists use cursor or page pagination consistently, documented sort/filter options and stable ordering.

| Method | Endpoint | Function | Auth |
| --- | --- | --- | --- |
| POST | /auth/register | Account registration | Public, throttled |
| POST | /auth/login | Login | Public, throttled |
| POST | /auth/logout | Logout | Authenticated |
| GET | /me | Identity + memberships | Authenticated |
| POST | /workspaces | Create workspace | Authenticated |
| GET | /workspaces/:workspaceId | Workspace details | Member |
| POST | /workspaces/:workspaceId/invitations | Invite user | Owner/admin |
| GET | /workspaces/:workspaceId/leads | Filtered/paginated leads | Member with lead read |
| POST | /workspaces/:workspaceId/leads | Create lead | Lead write |
| POST | /workspaces/:workspaceId/leads/import | Upload CSV and preview/mapping | Admin/sales manager |
| GET | /workspaces/:workspaceId/leads/:id | Lead, timeline, evidence | Scoped read |
| PATCH | /workspaces/:workspaceId/leads/:id | Assign/update lead | Lead write |
| GET | /workspaces/:workspaceId/opportunities | Recovery queue | Scoped read |
| GET | /workspaces/:workspaceId/opportunities/:id | Details + evidence | Scoped read |
| POST | /workspaces/:workspaceId/opportunities/:id/draft | Generate draft | Draft create + usage check |
| PATCH | /workspaces/:workspaceId/drafts/:id | Edit draft, version increment | Editor |
| POST | /workspaces/:workspaceId/drafts/:id/approve | Approve exact version | Approver |
| POST | /workspaces/:workspaceId/drafts/:id/reject | Reject with reason | Approver |
| POST | /workspaces/:workspaceId/drafts/:id/send | Queue approved message | Send permission |
| GET | /workspaces/:workspaceId/send-jobs/:id | Delivery status | Scoped read |
| GET/PUT | /workspaces/:workspaceId/rules | Manage thresholds and stop rules | Admin |
| POST | /workspaces/:workspaceId/scans | Request async scan | Authorized, throttled |
| GET | /workspaces/:workspaceId/scans/:id | Scan status | Scoped read |
| GET | /workspaces/:workspaceId/analytics | Aggregated factual metrics | Analytics read |
| GET | /workspaces/:workspaceId/integrations | Provider status | Admin |
| POST | /workspaces/:workspaceId/integrations/google/start | Start OAuth (redirect URL) | Admin |
| GET | /integrations/google/callback | Complete OAuth | OAuth state verified |
| DELETE | /workspaces/:workspaceId/integrations/:id | Revoke/disconnect | Admin |
| POST | /webhooks/billing | Signed billing events | Webhook verification |
| POST | /webhooks/lead-source/:token | Authenticated inbound leads | Secret/signature |
| GET | /workspaces/:workspaceId/billing | Subscription and usage | Owner |
| POST | /workspaces/:workspaceId/billing/checkout | Hosted checkout | Owner |
| POST | /workspaces/:workspaceId/billing/portal | Hosted customer portal | Owner |
| GET | /workspaces/:workspaceId/audit | Limited audit history | Owner/admin |
| POST | /workspaces/:workspaceId/export | Async privacy/data export | Owner |

#### 6.1 Key payload examples

Opportunity list record

{  "id": "opp_01...",  "lead_id": "lead_01...",  "type": "proposal_stalled",  "state": "needs_review",  "priority_score": 72,  "reason_codes": ["NO_REPLY_AFTER_PROPOSAL"],  "detected_at": "2026-10-28T06:00:00Z",  "evidence": [{"source_event_id":"evt_01...","summary":"Proposal sent, no later customer response"}],  "suggested_action": "draft_follow_up"}

Approve draft request

{"expected_version":3,"decision":"approve","note":"Reviewed for accuracy"}

Delivery response

{"send_job_id":"job_01...","state":"queued","idempotency_key":"opaque-key"}

### 7. AI and opportunity detection design

#### 7.1 Deterministic detection before LLM

unanswered_inbound: an inbound lead event has no qualifying human/outbound response after configured business-day threshold.

proposal_stalled: a marked proposal-sent event has no qualifying reply/next step by the threshold.

post_meeting_gap: a completed meeting lacks a recorded next-step message/task within threshold.

follow_up_due: an explicitly scheduled task is due and not completed.

Exclude spam, newsletters, receipts, autoresponders, internal email, bounced messages, opt-outs and leads with recent meaningful contact. Respect company timezone, weekends and configured holidays. Store a compact, explainable evidence set.

#### 7.2 Scoring

Start with transparent heuristics, not black-box conversion predictions. Example: age overdue (0–40 points), explicit expressed intent (0–25), proposal stage (0–20), declared deal value band (0–15). Cap at 100. Show reason codes and allow managers to tune thresholds; do not equate score with a statistical probability of closing.

#### 7.3 LLM responsibilities

Classify a conversation as actionable / non-actionable / uncertain.

Summarize the customer’s expressed need in 2–3 sentences.

Extract only supported facts and source event IDs.

Draft a courteous, context-aware email using approved tone and business details.

Highlight missing information; never invent commitments, pricing, deadlines or claims.

#### 7.4 Structured output schema

{  "actionable": true,  "classification": "proposal_stalled",  "confidence_label": "medium",  "reason_codes": ["NO_REPLY_AFTER_PROPOSAL"],  "customer_need_summary": "Asked for a website redesign proposal.",  "evidence_event_ids": ["evt_01..."],  "recommended_action": "draft_follow_up",  "draft_subject": "Following up on the website proposal",  "draft_body": "Hello ...",  "warnings": []}

Validate with a strict backend schema. Reject nonexistent evidence IDs and untrusted tool directives. Treat source email/body as untrusted text: it must never override system instructions or trigger side effects.

#### 7.5 AI workflow safeguards

First check workspace plan/usage, source authorization and rule eligibility.

Retrieve minimum required source excerpts, not full mailbox history.

Redact unnecessary personal data in logs; configure retention.

Run deterministic detection and AI classification with bounded time/cost.

Store prompt version, model/config identity and token usage metadata.

Validate JSON and reference IDs; use fallback needs_human_review on error.

Present all proposed drafts in approval queue.

After explicit approval, freeze draft version and enqueue the send job.

Re-check opt-out, reply, provider connection and duplication before actual sending.

Audit all transitions and expose the outcome to the user.

No automatic external sending in MVP. A UI approval must not falsely be recorded as a successful provider send.

### 8. Integration requirements

#### 8.1 Gmail

Use Google OAuth authorization code flow with PKCE/state where applicable. Connect only the customer’s approved account. Start with read-oriented sync and draft approval; request send permissions when actually enabling provider delivery. Implement incremental synchronization where supported, scheduled polling fallback, history-gap reconciliation, sender/recipient deduplication, thread association, revoked credentials, rate limits and sync health indicators.

Do not claim integration is complete until OAuth consent/verification, required scopes, token refresh, real send tests and disconnect/revocation behavior are validated. Gmail restricted scopes may introduce verification and independent security-assessment requirements depending on usage; confirm the current Google policies before production launch.

#### 8.2 Web form and CSV

Webhook supports HMAC signature or unique secret, replay resistance and spam controls. CSV wizard previews columns, maps email/name/company/value/stage/source, validates rows, shows import errors, and avoids duplicate contacts. Large imports run asynchronously.

#### 8.3 Calendar and CRM (P1)

Google Calendar is an optional integration to record meetings, with explicit authorization. First CRM adapter may be HubSpot or another provider selected from customer interviews. CRM write-back is opt-in and audited. Avoid two-way sync loops with provider IDs and conflict policies.

### 9. Approval, messaging and workflow states

Opportunity states: detected -> needs_review -> draft_ready -> in_progress -> resolved | dismissed; allow reopening only with new material evidence.

Draft states: generated -> edited -> approved | rejected -> send_queued -> sent | failed | cancelled. Approval invalidates if the content changes. Track version, approved_version, actor and timestamp.

Send-job states: queued -> processing -> sent | retryable_failure | permanent_failure | cancelled. At-least-once queue execution requires idempotency guard; never silently repeat a provider send. Persist provider response ID. A message isn’t sent just because the queue job started.

Stop conditions: meaningful inbound reply, explicit opt-out, complaint, bounce, user cancellation, disconnected integration, revoked authorization, closed-won/lost deal, already scheduled meeting, expired opportunity, exceeded plan limit or suppression policy.

### 10. Metrics and attribution

| Metric | Definition |
| --- | --- |
| Open opportunities | Leads in nonterminal active stages |
| Needs follow-up | Unresolved actionable opportunities |
| Pipeline at risk | Sum of unique lead values behind active flagged opportunities; deduplicated per lead; not revenue |
| Draft approval rate | Approved drafts / reviewed drafts during interval |
| Send success rate | Provider-confirmed messages sent / attempted valid sends |
| Reply rate | Leads with meaningful reply after approved follow-up / sent follow-ups in eligible cohort |
| Booking rate | Verified meetings attributable by documented rules / eligible leads |
| Confirmed recovered revenue | Only explicitly confirmed closed-won value; attribution labeled as assisted, not causal proof |

All dashboards display date range, timezone and data freshness. For initially sparse data, show accurate zero/empty states, not prefilled KPI counters. Exclude test tenants from platform reporting.

### 11. Subscription plans and limits

| Plan | Monthly USD (hypothesis) | Monitored leads / month | AI actions / month | Intended segment |
| --- | --- | --- | --- | --- |
| Starter | 49 | 250 | 100 | Solo operators |
| Growth | 129 | 1,000 | 500 | Small agencies |
| Scale | 299 | 5,000 | 2,000 | Sales teams |

AI action must be defined as one completed classification or generation operation, with appropriate failed-action treatment. Treat input/sync usage and billable AI requests separately where needed to prevent abuse. Set quotas on scans, OAuth accounts, workers and large imports. Configure notifications at 80% and 100% usage. API-cost accounting and billing ledger must be idempotent.

All prices are proposed tests, not market-validated willingness to pay. Merchant eligibility and sales tax/VAT collection require separate review.

### 12. Security, privacy and compliance requirements

Enforce HTTPS, secure cookies, CSRF protection, strict CORS, HSTS and CSP where applicable.

Require tenant-aware authorization on every read and mutation; automate cross-tenant tests.

Encrypt provider credentials with managed encryption at rest and enforce secret rotation.

Use password hashing, verification, reset tokens, rate limiting and optional MFA.

Apply RBAC for send approvals, source connections, billing and exports.

Minimize third-party personal data sent to AI; restrict logs and retention.

Audit approvals, sends, connection changes, imports, exports, role changes and deletions.

Expose export and deletion workflows with documented backup/retention timelines.

Honor opt-outs, applicable email rules (including CAN-SPAM, GDPR/UK GDPR and local requirements as relevant) and provider terms.

Require signed and idempotent billing webhooks, avoid trusting redirect success alone.

Reject malicious attachments and untrusted prompt-injection instructions found in email content.

Maintain incident response, backup restore testing, access review and dependency scanning.

Security release gate: No production launch with cross-tenant access, duplicate-send risk, broken OAuth token revocation, missing permission checks, publicly exposed AI credentials or insecure webhook verification.

### 13. Background jobs and operational concerns

Jobs: SyncMailbox, IngestSourceEvent, NormalizeEvent, LinkContactLead, EvaluateOpportunityRules, GenerateOpportunityDraft, QueueApprovedSend, SendApprovedMessage, ReconcileProviderStatus, UpdateUsageLedger, AggregateAnalytics, ProcessDataExport, ProcessDeletionRequest.

Use bounded retries with exponential backoff and dead-letter/failed-job review. Log structured request_id, workspace_id, job_id, provider, attempt, duration and error category; never include raw tokens or unrestricted message bodies. Add health checks, queue lag metrics, error-rate alerts, provider quota monitoring and spend budgets per workspace.

Backup PostgreSQL with tested restoration; define RPO/RTO for launch (provisional RPO 24 hours, RTO 8 hours; improve before enterprise sales). Provide separate staging and production environments.

### 14. Automated testing strategy

| Layer | Required tests |
| --- | --- |
| Unit | Scoring, business-day calculation, dedupe keys, entitlement checks, amount arithmetic |
| API integration | Auth, validation, pagination, RBAC, rate limits, stable error shapes |
| Tenant isolation | Every lead, message, opportunity, integration and export across two independent workspaces |
| AI boundary | Schema validation, hallucinated evidence rejection, prompt injection, model timeout and fallback |
| Messaging | Approval version race, idempotent retries, opt-out/reply stop, provider transient/permanent failures |
| Webhooks | Invalid signature, repeated event, out-of-order event and missing customer |
| UI/E2E | Signup -> import -> detection -> review -> approve -> simulated send -> outcome tracking |
| Accessibility | Keyboard, contrast, focus, labels, errors and mobile navigation |
| Performance | Paginated 10,000-lead tenant, concurrent scans, queue backpressure |
| Operations | Restore backup, rotate secrets, revoked OAuth, restart workers, roll back deployment |

Target a CI gate including lint, TypeScript check, unit/API tests, migration test, vulnerability/dependency scan and Playwright smoke tests. Do not bypass failing tests by weakening assertions.

### 15. Acceptance criteria by feature

Signup and workspace: A verified owner can create one workspace, invite team members and view only authorized data. Invalid invitations expire. Duplicate memberships are prevented.

CSV import: Valid file yields preview and clear error rows; an authorized user imports records without duplicates. Importing the same file twice does not multiply leads.

Detection: Given a lead with a sent proposal and no reply after configured business-day threshold, system produces one flagged opportunity with correct evidence. A reply before threshold prevents it. Re-scan does not duplicate it.

Draft: Generating a draft uses source evidence and outputs editable content. Missing facts are not invented. Failure creates a recoverable user-visible state.

Approval/send: An authorized approver approves an exact version; edited content forces reapproval. Unauthorized agents cannot send. Idempotent send is confirmed by provider acknowledgment, not by queue submission.

Analytics: Numbers derive from production records within selected dates. No invented sample KPI appears in live mode. Cross-tenant records do not contribute.

Billing: Trial/plan entitlement is backend enforced, webhook events are signature-verified and replay safe. Cancellation changes access according to policy, not solely based on UI state.

### 16. Milestones and Codex task order

#### Phase 0 — Foundation and architecture (first)

Initialize monorepo, README, AGENTS.md, Docker services and environment templates.

Establish Laravel API, Next.js UI, PostgreSQL migrations, Redis queue and CI.

Implement auth, workspace isolation, RBAC, feature tests and sample seed data.

Build static marketing page and authenticated application shell.

Produce OpenAPI contracts and a working local setup guide.

Done when: Developers can start the whole stack locally with one documented command sequence; seeded workspace dashboard is accessible; cross-tenant tests pass.

#### Phase 1 — Lead management and recovery (launch core)

Contacts, companies, leads CRUD and CSV import with mappings and preview.

Lead timeline and activity normalization.

Deterministic detection rules, scan jobs, Recovery Inbox filters.

AI classification, generated drafts, approval/rejection and audit logs.

Analytics based on real records, not illustrations.

Done when: A new account can import data, detect a stalled proposal, review evidence, generate a draft and approve it without leaving the app.

#### Phase 2 — Authorized send and integrations

Google OAuth and Gmail sync with production-safe scope selection.

Encrypted tokens, revocation and sync health.

Approved message send through verified Gmail provider flow.

Reply detection, opt-out and stop conditions.

Idempotency and end-to-end delivery tests.

Done when: A permitted user can link a test account and send an approved message exactly once, with provider-confirmed state and auditable outcome.

#### Phase 3 — Commercial readiness

Stripe abstraction and hosted checkout/portal where eligible.

Subscription plan limits, usage metering and billing webhooks.

Team invites, settings, notifications, exports/deletion workflows.

Operational dashboards, backups, security and accessibility audits.

Deployment to staging and production with rollback plan.

Done when: Five pilot workspaces can be onboarded, billed where supported, monitored and supported without manual database edits.

#### Phase 4 — Post-MVP roadmap (only after customer feedback)

Google Calendar, first CRM adapter, agency reseller accounts, configurable branded templates, richer scoring, suggested next-best actions and additional authorized channels. Evaluate each against retention and revenue evidence.

### 17. Development tickets (initial backlog)

| ID | Priority | Ticket | Depends on |
| --- | --- | --- | --- |
| DF-001 | P0 | Initialize monorepo, Docker, environment and CI | None |
| DF-002 | P0 | Authentication, verification and password reset | DF-001 |
| DF-003 | P0 | Workspace creation and RBAC | DF-002 |
| DF-004 | P0 | Tenant-aware query and policy foundation | DF-003 |
| DF-005 | P0 | Dashboard shell, navigation and design tokens | DF-001 |
| DF-006 | P0 | Contacts, companies, leads schema and APIs | DF-004 |
| DF-007 | P0 | CSV import preview, mapping and job | DF-006 |
| DF-008 | P0 | Source activity and lead timeline | DF-006 |
| DF-009 | P0 | Opportunity rules, scoring and idempotent scans | DF-008 |
| DF-010 | P0 | Recovery Inbox list, filters and evidence detail | DF-009 |
| DF-011 | P0 | AI adapter, schema validation and mock provider | DF-009 |
| DF-012 | P0 | Draft editor and approval state machine | DF-011 |
| DF-013 | P0 | Audit logs, usage ledger and event tracking | DF-003 |
| DF-014 | P1 | Google OAuth, token encryption and reconnect | DF-013 |
| DF-015 | P1 | Gmail incremental sync and deduplication | DF-014 |
| DF-016 | P1 | Send-job queue with idempotency safeguards | DF-012, DF-014 |
| DF-017 | P1 | Provider-confirmed send status, reply stop rules | DF-015, DF-016 |
| DF-018 | P1 | Real metrics and analytics endpoint/UI | DF-013, DF-017 |
| DF-019 | P1 | Billing and entitlement abstraction | DF-013 |
| DF-020 | P1 | Stripe hosted sessions and verified webhooks | DF-019 |
| DF-021 | P1 | Workspace settings, exports, deletions | DF-013 |
| DF-022 | P1 | Security, accessibility, performance and release QA | All P0/P1 |

### 18. Definition of Done (every pull request)

Scoped ticket addressed with documented trade-offs; no unrelated refactor.

Code follows existing project conventions and receives lint/type checks.

Migration is reversible or includes explicit rollback instructions.

Includes unit/feature tests covering happy path, invalid input and tenant boundary.

User action has correct loading, success, failure and empty states.

External side effects are disabled/mockable in tests and local demo mode.

No secret, sensitive message body or credential leaks into logs/source control.

OpenAPI/docs updated when contract changes.

Relevant tests run locally and commands/results summarized.

### 19. Local setup and environment variables

Provide documented examples with placeholders only:

APP_ENV=localAPP_URL=http://localhost:8000WEB_URL=http://localhost:3000DB_CONNECTION=pgsqlDB_HOST=postgresDB_PORT=5432DB_DATABASE=dealflowDB_USERNAME=dealflowDB_PASSWORD=CHANGE_ME_LOCALREDIS_HOST=redisQUEUE_CONNECTION=redisAI_PROVIDER=openaiOPENAI_API_KEY=AI_MODEL=GOOGLE_CLIENT_ID=GOOGLE_CLIENT_SECRET=GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/integrations/google/callbackBILLING_PROVIDER=stripeSTRIPE_SECRET_KEY=STRIPE_WEBHOOK_SECRET=APP_DEMO_MODE=true

Do not commit actual secrets. App encryption keys must be generated locally and injected securely in deployment. APP_DEMO_MODE must not enable unsafe production bypasses.

### 20. Deployment architecture

Web: Next.js container or managed web hosting.API: Laravel application container behind reverse proxy/load balancer.Workers: Independent Laravel queue workers / scheduler.Database: Managed PostgreSQL with automatic backups.Cache/queue: Redis with memory, persistence and eviction policies fit for jobs.Storage: S3-compatible object storage for exports.Monitoring: Error tracker, structured logs, uptime checks and queue telemetry.

Deploy via a CI pipeline with migrations, smoke tests, release tags and rollback. Use staging OAuth and billing test accounts. Prefer infrastructure-as-code as complexity grows; first launch can use a simple documented VPS/container deployment if securely operated.

### 21. Risks and explicit launch decisions

| Risk / decision | Required mitigation |
| --- | --- |
| Gmail approval/verification delays | Ship CSV/webhook workflows first; treat live send as a separate gate |
| Customer mailbox privacy | Least scopes, encryption, minimization, deletion and processor policies |
| Duplicate email send | Transactional idempotency, provider reconciliation and retry-safe state machine |
| Hallucinated sales facts | Evidence-linked JSON, manual approval, prohibited claims, tests |
| Provider API / AI costs | Usage ledger, quotas, per-tenant budget limits, throttling |
| Platform overscope | Ship Phase 1 before multi-channel features |
| Pricing assumptions | Paid pilot interviews and retention tests |
| Billing eligibility | Confirm business/entity eligibility; abstract provider |
| Regulatory differences | Jurisdictional counsel review before wide outbound capability |

### 22. Codex execution protocol

Use small, testable PR-sized increments. Codex must inspect repository state before editing, explain assumptions in pull-request notes, implement only the requested milestone, run tests and report exact commands/results. Never claim a feature works unless tests or a reproducible manual check confirm it. Do not create simulated provider connections that appear live. Never automatically send real messages during tests.

Recommended build sequence: DF-001 -> DF-005 -> DF-002 -> DF-003 -> DF-004 -> DF-006 -> DF-007 -> DF-008 -> DF-009 -> DF-010 -> DF-011 -> DF-012, then integration and commercialization phases.

#### First Codex task prompt

Read AGENTS.md and docs/DealFlow_AI_Development_Spec.md completely.Implement ONLY Phase 0 foundation: monorepo skeleton, local Dockerservices, Laravel API, Next.js + TypeScript app, PostgreSQL + Redis,authentication base, workspace roles, tenant isolation foundation,responsive dashboard shell, example seed data, tests and a README.Do not implement Gmail, live AI calls, outbound sending or billing yet.Use mocked interfaces for later providers. Keep TypeScript strict;validate server inputs; use workspace-aware authorization. Supply.env.example with placeholders, setup commands, test commands,and a concise completion report. Stop after Phase 0 and list open items.

#### Next Codex task prompt (after Phase 0 reviewed)

Read AGENTS.md and the approved specification. Implement Phase 1 only:contacts, companies, leads, secure CSV import, source-event timeline,rule-based opportunity detection, Recovery Inbox, evidence-based AIclassification via a provider abstraction, editable drafts, versionedapproval, audit logs and factual analytics. Use a mock AI provider bydefault, real OpenAI calls only with explicit configured credentials.Do not enable external sending. Include tenant-boundary tests, schemavalidation tests, prompt-injection tests, README updates and E2E smokecoverage. Run all checks and report outcomes before proceeding.

### 23. Product launch checklist

☐ Interviews and first paid pilots recorded

☐ Auth, workspace and RBAC reviewed

☐ Tenant-isolation tests pass

☐ Source authorization and revocation tested

☐ AI draft accuracy and no-hallucination review completed

☐ Send approvals, version races and idempotency verified

☐ No live sending in unapproved or demo workspaces

☐ Billing webhooks and entitlement enforcement verified

☐ Data processing notices, privacy policy and retention documented

☐ Backups and restore drill verified

☐ Accessibility and responsive QA completed

☐ CI/CD and production rollback documented

☐ Monitoring, support and incident owners assigned

☐ First five paying pilot customers onboarded with consent

### 24. Reference notes

Provider documentation, authentication/scopes, API availability, pricing and compliance requirements change. Before implementation or production deployment, Codex or engineering must verify current official documentation for Laravel, Next.js, Google Workspace Gmail API, OpenAI API and Stripe Billing. The architecture above defines required product behavior but is not a claim of platform approval, certification or regulatory compliance.
