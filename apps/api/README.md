# DealFlow API

Laravel 12 identity and workspace API. See the root README for setup and tests, `packages/contracts/openapi.json` for the implemented contract and `docs/adr/0001-foundation.md` for architecture decisions.

Run tests with `php artisan test` for isolated SQLite, or `vendor/bin/phpunit --configuration phpunit.pgsql.xml` for the separate `dealflow_test` PostgreSQL database. Never use a production database for tests.
