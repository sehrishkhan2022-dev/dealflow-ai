# ADR 0001: Phase 0 foundation

Accepted for local development, pending product review.

- Build Phase 0 as directed by the start prompt and AGENTS.md. Later route destinations show explicit milestone/empty states; they do not imply implemented features.
- Use Laravel 12 on PHP 8.4 and Next.js 16 on Node 24. Composer's platform setting pins dependency resolution to PHP 8.4. Locked GitHub distributions use official `codeload.github.com` archives at their original immutable refs because the cloud proxy denies `api.github.com`. TLS verification remains enabled; no checksums were removed or altered. Future Composer updates may restore API URLs and require network configuration review.
- Use UUIDs for users, workspaces and membership records; Laravel's internal queue bookkeeping retains its framework-managed numeric IDs. Those tables carry no tenant-owned business records in Phase 0.
- Use same-origin session cookies and CSRF via Next.js rewrites rather than client-stored bearer tokens. Relative signed verification links support the proxy without trusting arbitrary hosts. API/worker local configuration is injected by Compose; `artisan serve --no-reload` preserves it.
- Keep only identity and workspace tables in scope. No premature schema for later lead/draft/billing state machines. Use disconnected provider contracts that fail closed.
- Seed only labeled local/test workspaces and members. No invented leads, pipeline or recovered revenue. Application counters explicitly describe the foundation's lack of records.
- Verification/reset mail uses Laravel's local log transport. Local logs contain sensitive one-use links; ignore them in Git and never enable that transport for production.
- Test against both in-memory SQLite and an isolated PostgreSQL database. Force test cache/session/queue overrides and refuse non-test database names. Runtime health and a harmless Redis job establish actual dependency readiness.
- The cloud Docker builder requires the configured egress proxy address to resolve. The initial build was verified using a build-time host mapping and standard HTTP proxy build arguments; this machine-specific mapping is not committed to portable Compose configuration. Debian package signatures and HTTPS package verification remain enabled.

Reference docs consulted: Next.js bundled layout/page and development-origin documentation; official Laravel 12 authentication and email verification docs from `laravel/docs` on GitHub. Live provider policies are deferred until those providers are in scope.
