#!/usr/bin/env bash
# Despliegue en el VPS: trae main y reconstruye backend + frontend.
# Lo ejecuta GitHub Actions por SSH (llave restringida a este script) o a mano: ./deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

exec 9>/tmp/agromap-deploy.lock
flock -n 9 || { echo "Ya hay un despliegue en curso"; exit 1; }

echo "### Actualizando código ($(git rev-parse --short HEAD) → origin/main)…"
git fetch --prune origin main
git checkout main
git merge --ff-only origin/main
echo "### Versión: $(git log -1 --format='%h %s')"

DC=(docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env)
echo "### Construyendo y levantando backend y frontend…"
"${DC[@]}" up -d --build --wait backend frontend

docker image prune -f >/dev/null
"${DC[@]}" ps
echo "### Despliegue completado"
