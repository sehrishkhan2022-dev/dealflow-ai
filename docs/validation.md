# Phase 0 validation

Validated in the current cloud instance on 28 October 2026. This is local development evidence, not a production release or fresh-task restoration claim.

| Check | Command / observation | Result |
| --- | --- | --- |
| SQLite backend | `docker compose exec -T api php artisan test --compact` | 20 tests, 70 assertions passed |
| PostgreSQL backend | `docker compose exec -T api vendor/bin/phpunit --configuration phpunit.pgsql.xml` | 20 tests, 70 assertions passed against isolated `dealflow_test` |
| PHP formatting | `docker compose exec -T api vendor/bin/pint --test` | Passed |
| Frontend lint | `npm run lint` in `apps/web` | Passed |
| TypeScript | `npm run typecheck` in `apps/web` | Passed, strict mode |
| Components | `npm test` in `apps/web` | 3 tests passed |
| Production frontend build | `npm run build` in `apps/web` | Passed |
| Chromium smoke | `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`, with local `DEMO_PASSWORD` exported | 5 tests passed; none skipped |
| Frontend audit | `npm audit --audit-level=low` | Zero vulnerabilities reported |
| Composer advisory scan | `composer audit` with platform CA configured | Blocked: proxy denies `packagist.org/api/security-advisories/` (403). No clean-audit claim. |
| Stack setup | `./scripts/cloud-setup.sh` | Built, installed locked dependencies, migrated, seeded, started all services and checked readiness |
| Runtime health | Local request to `/api/v1/health` through frontend rewrite | HTTP 200; PostgreSQL/Redis OK; providers mock |
| Redis worker | `docker compose exec -T api php artisan dealflow:queue-probe` | Job acknowledged and completed |
| Repository hygiene | `git diff --check`; status inspection | Existing AGENTS.md preserved; generated dependencies, credentials, logs and test artifacts ignored |

Backend checks cover registration and password hashing, input validation, session login/logout, signed verification, invalid reset tokens, role permissions, two-tenant denial, membership uniqueness, client role/demo flag rejection, auth throttling, repeatable labeled seeds, stateless dependency health and disabled provider side effects. Tests force isolated database/cache/session settings; demo accounts remain present after both database suites.

Browser checks cover marketing-to-registration navigation, actual seeded login, authorized member listing, logout, mobile navigation/empty states without horizontal overflow, guest rejection, CSRF rejection and registration's verification gate. They use the real API, not route mocks. Component tests exercise successful login, server rejection and registration routing.

Development screenshots: `screenshots/overview-desktop.png` and `screenshots/overview-mobile.png`. Business counters are explicitly empty Phase 0 placeholders. Keyboard labels, drawer navigation and responsive layout were checked; this is not a complete WCAG audit.

## Diagnosed and resolved during validation

- Reused the platform CA for Composer TLS. GitHub API downloads were blocked, so locked packages use the official codeload archives at the original references. No signature, TLS or checksum verification was disabled.
- Resolved the Docker builder's cloud proxy hostname explicitly; normal Compose remains portable.
- Added `--no-reload` to Laravel's development server so container variables survive child startup.
- Disabled login submission until hydration and used POST on credential forms to prevent native GET fallback.
- Kept signed verification URLs relative through the frontend proxy.
- Configured unauthenticated API errors independently of Laravel's absent HTML login route.
- Forced PHPUnit settings in both environment adapters and checked test database safety before test traits can migrate.
- Kept health independent of session/CSRF cookie generation, with regression tests for an unavailable Redis dependency.

## Remaining limitations

Composer advisory scan needs `packagist.org` network access. The saved cloud draft includes Packagist network destinations and reusable installation/start instructions; reviewing/saving/publishing that draft is separate from current runtime validation. GitHub Actions is authored but has not executed remotely. No production mail delivery, live provider behavior, production deployment, backup restoration or new-task snapshot restoration has been tested. Phases 1–3 remain outside this review increment.
