#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  cp .env.example .env
  echo 'Edit .env: set unique local DB_PASSWORD and DEMO_PASSWORD (12+ characters), then rerun scripts/setup.sh.'
  exit 1
fi
if grep -q 'CHANGE_ME' .env; then
  echo 'Replace CHANGE_ME placeholders in .env before setup.'
  exit 1
fi
[ -f apps/api/.env ] || cp apps/api/.env.example apps/api/.env
chmod 600 .env apps/api/.env
docker compose build api worker
docker compose up -d --wait postgres redis
docker compose run --rm api composer install --no-interaction --prefer-dist
if ! grep -q '^APP_KEY=base64:' apps/api/.env; then
  docker compose run --rm api php artisan key:generate
fi
docker compose run --rm api php artisan migrate --force
docker compose run --rm api php artisan db:seed --force
docker compose run --rm --no-deps web npm ci
docker compose up -d api worker web
echo 'Stack started. Check /api/v1/health and run docker compose exec api php artisan dealflow:queue-probe.'
