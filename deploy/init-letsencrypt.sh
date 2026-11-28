#!/usr/bin/env bash
# Primer arranque: levanta nginx con un certificado temporal, pide el real a Let's Encrypt
# y recarga nginx. Después la renovación es automática (contenedor certbot).
#   ./deploy/init-letsencrypt.sh            → certificado real
#   STAGING=1 ./deploy/init-letsencrypt.sh  → pruebas (sin límites de Let's Encrypt)
set -euo pipefail
cd "$(dirname "$0")"

[ -f .env ] || { echo "Falta deploy/.env (copia deploy/.env.example)"; exit 1; }
set -a; . ./.env; set +a
: "${DOMAIN:?}" "${LETSENCRYPT_EMAIL:?Define LETSENCRYPT_EMAIL en deploy/.env}"

DC=(docker compose -f docker-compose.prod.yml --env-file .env)
STAGING_ARG=""; [ "${STAGING:-0}" = "1" ] && STAGING_ARG="--staging"

echo "### Construyendo y levantando backend y frontend…"
"${DC[@]}" up -d --build backend frontend

echo "### Creando certificado temporal para $DOMAIN (nginx no arranca sin certificado)…"
"${DC[@]}" run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/$DOMAIN &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem -subj /CN=localhost"

echo "### Levantando nginx…"
"${DC[@]}" up -d nginx

echo "### Apartando el certificado temporal (se mueve, no se borra)…"
"${DC[@]}" run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/dummy &&
  mv /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/dummy/$DOMAIN-\$(date +%s)"

echo "### Solicitando el certificado real a Let's Encrypt…"
"${DC[@]}" run --rm --entrypoint certbot certbot certonly --webroot -w /var/www/certbot \
  $STAGING_ARG --email "$LETSENCRYPT_EMAIL" --agree-tos --no-eff-email --non-interactive \
  -d "$DOMAIN" -d "www.$DOMAIN"

"${DC[@]}" exec nginx nginx -s reload
"${DC[@]}" up -d certbot
echo "### Listo: https://$DOMAIN"
