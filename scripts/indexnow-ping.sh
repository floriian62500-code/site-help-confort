#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# indexnow-ping.sh — Notifie Bing/Yandex/Seznam des nouvelles URLs
# Usage : ./indexnow-ping.sh                  (ping toutes les URLs du sitemap)
#         ./indexnow-ping.sh url1 url2 ...    (ping URLs spécifiques)
# ═══════════════════════════════════════════════════════════════
set -e

KEY="9e0e7a806c9dc08d00dc44da895a8a1b"
HOST="www.depan59-62.fr"
KEY_URL="https://${HOST}/${KEY}.txt"
SITEMAP="https://${HOST}/sitemap.xml"

# Récupère les URLs à indexer
if [ "$#" -eq 0 ]; then
  echo "→ Récupération du sitemap..."
  URLS=$(curl -s "$SITEMAP" | grep -oE '<loc>[^<]+</loc>' | sed -E 's|</?loc>||g')
else
  URLS="$@"
fi

# Construit le JSON
URLS_JSON=$(echo "$URLS" | awk 'BEGIN{ORS=""} {print "\""$0"\","}' | sed 's/,$//')
PAYLOAD="{\"host\":\"${HOST}\",\"key\":\"${KEY}\",\"keyLocation\":\"${KEY_URL}\",\"urlList\":[${URLS_JSON}]}"

echo "→ Envoi à IndexNow (Bing/Yandex)..."
echo "$PAYLOAD" | head -c 200
echo "..."

# Bing IndexNow API (relaie aux autres moteurs partenaires)
HTTP_CODE=$(curl -s -o /tmp/indexnow-resp.txt -w "%{http_code}" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw "$PAYLOAD")

echo ""
echo "→ HTTP $HTTP_CODE"
cat /tmp/indexnow-resp.txt 2>/dev/null
echo ""
echo "→ Réponses attendues : 200 (OK) / 202 (Accepted)"
echo "→ Codes erreur : 400 (bad request) / 403 (clé invalide) / 422 (URLs invalides)"
