# DealFlow AI

A multi-tenant, human-guided lead recovery application. This increment implements **Phase 0 only**, following the supplied development specification and the repository review gate. Lead recovery, imports, AI drafting, Gmail, sending and billing are deliberately reserved for later phases.

## What works

- Next.js 16 / React / strict TypeScript marketing, pricing, registration, login, password recovery, verification notice, workspace onboarding and responsive authenticated shell.
- Laravel 12 API with UUID identities, secure HTTP-only sessions, CSRF, session rotation, hashed passwords, email verification, password reset, throttled authentication and consistent JSON errors.
- Transactional workspace creation, unique memberships and owner/admin/manager/agent/viewer role foundation. Server queries resolve workspaces through authenticated membership; cross-tenant IDs return 404. Owners, admins and sales managers can list team members; agents and viewers cannot.
- PostgreSQL persistence, Redis sessions/cache/jobs, independent worker and dependency-aware health check.
- Explicitly labeled Demo Studio workspace with two demonstration members. All business counters remain zero; no illustrative revenue or opportunities are fabricated.
- Disconnected provider interfaces throw on generation, sending and billing. No provider credentials are required.
- OpenAPI 3.1 in `packages/contracts/openapi.json`, CI, API/tenant tests, component tests and Playwright desktop/mobile smoke tests.

## Start locally

Prerequisites: Docker Engine with Compose v2. Node 24 is needed only for host-side frontend development/testing. The API Docker image provides PHP 8.4, Composer and required extensions.

```sh
cp .env.example .env
# Edit .env: use unique local DB_PASSWORD and DEMO_PASSWORD (12+ characters).
./scripts/setup.sh
```

This builds the API, installs locked dependencies, creates a local encryption key only if absent, migrates and seeds the database, and starts PostgreSQL, Redis, API, worker and Next.js. Repeating setup preserves the encryption key and existing accounts. Demo seeding adds missing fixtures without resetting passwords; change a demo password explicitly when rotating it. Volumes retain PostgreSQL data. `docker compose down` stops services; **adding `-v` deletes development data**.

The frontend listens on port 3000 and proxies `/api/*` to the API on port 8000. Both published ports bind to loopback for local development. Database and Redis are not published. The development server uses `--no-reload` to preserve injected container configuration. PHP source changes are picked up per request; restart API/worker after environment or worker-code changes.

Sign in as `owner@demo.dealflow.test` or `viewer@demo.dealflow.test` using your local `DEMO_PASSWORD`. There is no public shared password or authentication bypass. New users must verify email before creating a workspace. In local development, `MAIL_MAILER=log` captures verification/reset emails in `apps/api/storage/logs/laravel.log`; treat that file as sensitive, never commit or share it. These local one-use links are not a production mail service. Open links on the same frontend hostname used to log in.

```sh
curl --fail http://localhost:3000/api/v1/health
# Expected: status, database and redis are "ok"; providers is "mock".
docker compose exec api php artisan dealflow:queue-probe
# Expected: Redis-backed queue job completed.
```

For host-side frontend work, omit the Compose web service, then:

```sh
cd apps/web
npm ci
npm run dev
```

The default API target is `http://127.0.0.1:8000`; `API_URL` overrides it server-side. No secret belongs in a `NEXT_PUBLIC_*` variable.

## Verify

```sh
# PHP style, isolated in-memory SQLite tests
docker compose exec api vendor/bin/pint --test
docker compose exec api php artisan test

# PostgreSQL tests use ONLY a separate database named dealflow_test.
docker compose exec postgres createdb -U dealflow dealflow_test # once
docker compose exec api vendor/bin/phpunit --configuration phpunit.pgsql.xml

cd apps/web
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
# Export your local DEMO_PASSWORD, then run against the running stack:
npm run test:e2e
```

If Chromium is already installed, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` instead of downloading a browser. E2E demo tests are explicitly skipped if `DEMO_PASSWORD` is absent; export it to run all checks. Component tests mock the API; E2E tests exercise the actual Laravel/Redis/PostgreSQL stack, including CSRF rejection. Browser registration tests create uniquely named test users in the local development database, never production. Both PHP test configurations force test cache/session/queue settings; the test base refuses databases other than `:memory:` or names ending in `_test` before migrations run.

For dependency checks: `npm audit` in `apps/web`, and `docker compose exec api composer audit`. CI runs these commands along with tests and builds. See `docs/validation.md` for actual current-instance results and limitations.

## Architecture and boundaries

`apps/web` contains presentation and the same-origin API rewrite. `apps/api` owns identity, session security, membership, validation and authorization. `workspace_members` has database foreign keys, role constraints and a unique `(workspace_id, user_id)` pair. Tenant IDs from clients never grant access. API errors use `{error:{code,message,details},request_id}`. Form submissions use POST and login stays disabled until hydration, so credentials cannot fall back into a GET query string.

Auth endpoints live under Laravel's **web middleware** at `/api/v1` intentionally: this supplies session and CSRF protection; `routes/api.php` is a marker, not a second unprotected route set. The health endpoint skips session startup so Redis outages can return 503. Verification links use signed relative paths so signatures survive the frontend proxy. Reset tokens expire and are single-use through Laravel's broker. The `auth.session` middleware invalidates sessions after a password hash change.

See `docs/adr/0001-foundation.md` for choices and the supplied `docs/DealFlow_AI_Development_Spec.md` for the roadmap. Prototype navigation explicitly labels future features; only implemented backend operations are exposed. The timezone, region, roles and workspace names shown in the dashboard are server data. The empty business metrics are Phase 0 placeholders labeled as such, not an analytics implementation.

## Review gate and remaining work

Stop here for Phase 0 review. Phase 1 begins with DF-006 lead schema/CRUD, CSV import, activity, deterministic detection, Recovery Inbox, evidence-validated mock AI, draft approvals and factual analytics. Team invitations, billing, exports/deletion and settings mutations belong to later phases; their navigation is informational. No real provider connections, emails, payments, production deployment or platform-admin access have been implemented.

Before any production release: configure HTTPS, secure cookies, trusted proxy origins, actual email delivery, account recovery monitoring, MFA for privileged roles, secret management, CSP/HSTS at the edge, retention/deletion, backups and restore drills. Use separate environments and never seed production. The supplied processing notice is a development limitation, not legal terms or a production DPA. This foundation is for local development and review.
