#!/usr/bin/env bash
# sync-social.sh
# Synchronise les posts Facebook et avis Google via 2 Edge Functions Supabase
# Remplace l'agent IA helpconfort-sync-social
# Exécuté quotidiennement à 6h30 par launchd

set -euo pipefail

# === Configuration ===
PROJECT_DIR="$HOME/Documents/Claude/Projects/SITE INTERNET"
# Sources .env (priorité décroissante) — convention runtime Florian.
ENV_FILES=(
  "$HOME/.helpconfort/phase2.env"
  "$PROJECT_DIR/.autopush/.env"
)
LOG_FILE="$HOME/Library/Logs/helpconfort-automation.log"
ALERT_FILE="$PROJECT_DIR/docs/ALERT-SYNC.md"
SB_URL="https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1"

# === Préparation ===
mkdir -p "$(dirname "$LOG_FILE")"
TIMESTAMP=$(date -Iseconds)
DATE_FR=$(date +"%d/%m/%Y")

log() {
  echo "[$TIMESTAMP][sync-social] $*" >> "$LOG_FILE"
}

# === Vérification .env ===
ENV_LOADED=0
for ENV_FILE in "${ENV_FILES[@]}"; do
  if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    ENV_LOADED=1
    log "env chargé : $ENV_FILE"
  fi
done

if [ "$ENV_LOADED" -eq 0 ]; then
  log "ERREUR: aucun fichier .env trouvé (cherché : ${ENV_FILES[*]})"
  exit 1
fi

if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  log "ERREUR: SUPABASE_SERVICE_ROLE_KEY absent du .env (attendu dans ${ENV_FILES[0]})"
  exit 1
fi

# === Fonction helper appel Edge Function ===
call_edge() {
  local endpoint="$1"
  curl -s -m 60 -X POST \
    "$SB_URL/$endpoint" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null || echo '{"ok":false,"error":"curl_failed"}'
}

parse_field() {
  local json="$1"
  local field="$2"
  echo "$json" | /usr/bin/python3 -c "import sys,json
try:
  d = json.load(sys.stdin)
  print(d.get('$field', ''))
except: print('')" 2>/dev/null || echo ""
}

# === 1. Sync Facebook posts ===
FB_RESPONSE=$(call_edge "sync-facebook-posts")
FB_OK=$(parse_field "$FB_RESPONSE" "ok")
FB_IMPORTED=$(parse_field "$FB_RESPONSE" "imported")
FB_SKIPPED=$(parse_field "$FB_RESPONSE" "skipped")
FB_ERROR=$(parse_field "$FB_RESPONSE" "error")

# === 2. Sync Reviews Google ===
REV_RESPONSE=$(call_edge "sync-reviews")
REV_OK=$(parse_field "$REV_RESPONSE" "ok")
REV_IMPORTED=$(parse_field "$REV_RESPONSE" "imported")
REV_SKIPPED=$(parse_field "$REV_RESPONSE" "skipped")
REV_ERROR=$(parse_field "$REV_RESPONSE" "error")

# === Reporting ===
if [ "$FB_OK" = "True" ] && [ "$REV_OK" = "True" ]; then
  log "Sync OK · FB: ${FB_IMPORTED:-0} imports / ${FB_SKIPPED:-0} ignorés · Reviews: ${REV_IMPORTED:-0} imports / ${REV_SKIPPED:-0} ignorés"
  rm -f "$ALERT_FILE" 2>/dev/null || true
  exit 0
fi

# === Cas erreur ===
log "Sync ERROR · FB: ${FB_ERROR:-OK} · Reviews: ${REV_ERROR:-OK}"

mkdir -p "$(dirname "$ALERT_FILE")"
cat > "$ALERT_FILE" <<EOF
# ⚠️ Erreur sync $DATE_FR

**Date** : $TIMESTAMP

- **Facebook** : ${FB_ERROR:-OK} (imports: ${FB_IMPORTED:-0}, ignorés: ${FB_SKIPPED:-0})
- **Reviews Google** : ${REV_ERROR:-OK} (imports: ${REV_IMPORTED:-0}, ignorés: ${REV_SKIPPED:-0})

## Action recommandée

Si l'erreur FB mentionne "expired token" ou "Invalid OAuth", le \`page_access_token\` Meta a expiré.
Renouveler dans Réglages → Facebook + Instagram → re-générer le long-lived token via Graph API Explorer (durée 60j max).

Sinon, vérifier les logs Supabase : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/logs/edge-functions
EOF

osascript -e 'display notification "Erreur sync FB/Reviews — voir docs/ALERT-SYNC.md" with title "⚠️ HELP! Confort — Sync" sound name "Glass"' 2>/dev/null || true

exit 1
