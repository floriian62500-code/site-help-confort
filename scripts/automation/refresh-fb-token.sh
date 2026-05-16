#!/usr/bin/env bash
# refresh-fb-token.sh
# Maintient le Page Access Token Facebook permanent en appelant l'Edge Function Supabase
# Remplace l'agent IA helpconfort-keep-fb-token-alive
# Exécuté quotidiennement à 4h15 par launchd

set -euo pipefail

# === Configuration ===
PROJECT_DIR="$HOME/Documents/Claude/Projects/SITE INTERNET"
# Sources .env recherchées (priorité décroissante).
# La convention runtime côté Florian est ~/.helpconfort/phase2.env ; le
# fichier .autopush/.env reste un fallback pour rétro-compatibilité.
ENV_FILES=(
  "$HOME/.helpconfort/phase2.env"
  "$PROJECT_DIR/.autopush/.env"
)
LOG_FILE="$HOME/Library/Logs/helpconfort-automation.log"
ALERT_FILE="$PROJECT_DIR/docs/ALERT-FB-TOKEN.md"
EDGE_FUNCTION_URL="https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/refresh-meta-token"

# === Préparation ===
mkdir -p "$(dirname "$LOG_FILE")"
TIMESTAMP=$(date -Iseconds)

log() {
  echo "[$TIMESTAMP][refresh-fb-token] $*" >> "$LOG_FILE"
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

# === Appel Edge Function ===
RESPONSE=$(curl -s -m 30 -X POST \
  "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' || echo '{"ok":false,"error":"curl_failed"}')

OK=$(echo "$RESPONSE" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('ok', False))" 2>/dev/null || echo "False")

# === Cas OK : silencieux ===
if [ "$OK" = "True" ]; then
  TOKEN_SOURCE=$(echo "$RESPONSE" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('token_source', 'unknown'))" 2>/dev/null || echo "unknown")
  log "FB token OK (source: $TOKEN_SOURCE)"
  # Supprime un éventuel ALERT précédent
  rm -f "$ALERT_FILE" 2>/dev/null || true
  exit 0
fi

# === Cas KO : alerte ===
ERROR=$(echo "$RESPONSE" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('error', 'unknown'))" 2>/dev/null || echo "parse_error")
log "FB token EXPIRED - erreur: $ERROR"

mkdir -p "$(dirname "$ALERT_FILE")"
cat > "$ALERT_FILE" <<EOF
# 🚨 Token Facebook mort — action requise

**Date** : $TIMESTAMP
**Erreur** : $ERROR

## Action recommandée

1. Va sur https://developers.facebook.com/tools/explorer/
2. Sélectionne ton app HC + Get User Access Token
3. Permissions : pages_show_list, pages_read_engagement, pages_manage_posts, pages_read_user_content
4. Generate Access Token
5. Dans la barre URL Explorer, tape \`me/accounts\` puis Submit
6. Copie le \`access_token\` de la page HC
7. Colle dans https://depan59-62.fr/admin-pro/settings.html#section-meta → Save

Une fois fait, je détecterai automatiquement la mise à jour à la prochaine exécution (demain 4h15) et reprendrai le refresh permanent.

## Causes possibles
- L'app Meta a été révoquée par Florian dans Facebook (Settings → Apps)
- Le mot de passe Facebook a été changé récemment
- L'admin de la page n'est plus l'utilisateur lié à l'app
- Limitation Facebook (sanction, throttling)
EOF

# Notification macOS
osascript -e 'display notification "Token Facebook expiré — voir docs/ALERT-FB-TOKEN.md" with title "🚨 HELP! Confort — Token FB" sound name "Glass"' 2>/dev/null || true

exit 1
