#!/usr/bin/env bash
set -euo pipefail
cd /workspace/dealflow-ai
export DOCKER_CONFIG=/workspace/.docker
export npm_config_cache=/workspace/.npm
export NEXT_TELEMETRY_DISABLED=1
# Cloud tasks already have isolated checkouts. Reuse this checkout.
python - <<'PY'
from pathlib import Path
import secrets
root = Path('.env')
if not root.exists():
    root.write_text('DB_DATABASE=dealflow\nDB_USERNAME=dealflow\nDB_PASSWORD='+secrets.token_urlsafe(24)+'\nDEMO_PASSWORD='+secrets.token_urlsafe(20)+'\n')
api = Path('apps/api/.env')
if not api.exists():
    api.write_text(Path('apps/api/.env.example').read_text())
for path in [root, api]:
    path.chmod(0o600)
PY
# Resolve the configured cloud proxy for the Docker builder's namespace.
build_options=()
if [[ -n "${HTTP_PROXY:-}" ]]; then
  proxy_hostname="$(python -c 'import os,urllib.parse; print(urllib.parse.urlparse(os.environ["HTTP_PROXY"]).hostname)')"
  proxy_address="$(getent ahostsv4 "$proxy_hostname" | awk 'NR==1 {print $1; exit}')"
  [[ -n "$proxy_address" ]]
  build_options+=(--add-host "$proxy_hostname:$proxy_address" --build-arg HTTP_PROXY --build-arg HTTPS_PROXY)
fi
docker build "${build_options[@]}" -f infra/docker/api.Dockerfile -t dealflow-api .
docker compose stop web
npm --prefix apps/web ci
npm --prefix apps/web run build
docker compose up -d --wait postgres redis
composer_options=(-e COMPOSER_HOME=/tmp/composer)
if [[ -n "${NODE_EXTRA_CA_CERTS:-}" && -r "$NODE_EXTRA_CA_CERTS" ]]; then
  composer_options+=(-v "$NODE_EXTRA_CA_CERTS:/tmp/platform-ca.pem:ro" -e COMPOSER_CAFILE=/tmp/platform-ca.pem)
fi
docker compose run --rm "${composer_options[@]}" api composer install --no-interaction --prefer-dist
if ! grep -q '^APP_KEY=base64:' apps/api/.env; then
  docker compose run --rm api php artisan key:generate
fi
docker compose run --rm api php artisan migrate --force
docker compose run --rm api php artisan db:seed --force
docker compose up -d --no-build api worker web
curl --retry 10 --retry-connrefused --retry-all-errors --retry-delay 1 --fail --silent --show-error http://127.0.0.1:8000/api/v1/health
docker compose exec -T api php artisan dealflow:queue-probe
