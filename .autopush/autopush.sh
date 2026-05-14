#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AUTO-PUSH ROBUSTE — HELP! Confort
# ═══════════════════════════════════════════════════════════════
# Daemon launchd : toutes les 60 sec
# Features :
#   - Cleanup automatique des locks Git
#   - Auto-commit des fichiers modifiés (data daemon plus passif)
#   - Retry 3× sur push failed (avec délai)
#   - Notification macOS si échec persistant (3 échecs consécutifs)
#   - Auto-deploy Supabase si migrations changées
#   - Log détaillé avec rotation
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
LOG="$REPO/.autopush/autopush.log"
DEPLOY_LOG="$REPO/.autopush/supabase-deploy.log"
ENV_FILE="$REPO/.autopush/.env"
STATE_FILE="$REPO/.autopush/state"   # compte les échecs consécutifs

cd "$REPO" 2>/dev/null || exit 0
[ -d .git ] || exit 0

# ─── Rotation log si > 1 Mo ──────────────────────────────────────────
for f in "$LOG" "$DEPLOY_LOG"; do
  if [ -f "$f" ] && [ "$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)" -gt 1048576 ]; then
    tail -200 "$f" > "$f.tmp" 2>/dev/null && mv "$f.tmp" "$f"
  fi
done

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }
dlog() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$DEPLOY_LOG"; }

# ─── Notification macOS (uniquement si échec persistant) ─────────────
notify() {
  osascript -e "display notification \"$2\" with title \"$1\" sound name \"Glass\"" 2>/dev/null || true
}

# ─── Cleanup des locks Git (au cas où) ───────────────────────────────
rm -f .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock 2>/dev/null
# tmp_obj_* résiduels (résidus d'un git add interrompu)
find .git/objects -name "tmp_obj_*" -mmin +5 -delete 2>/dev/null

# ─── Auto-commit des fichiers modifiés — avec DEBOUNCE 15 min ─────────
# Pour économiser les crédits Netlify : ne commit/push que si le dernier
# fichier modifié date d'au moins 15 minutes (= batch les changements
# au lieu de pusher 60 fois par heure).
# → ~4 deploys/heure max au lieu de 60 (économie ~95% de crédits).
# Pour pusher tout de suite, fais "cd repo && git add -A && git commit -m ... && git push"
# manuellement depuis ton terminal.
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  # Trouve le fichier modifié le plus récent (en secondes depuis epoch)
  NEWEST_MODIFIED=$(git status --porcelain | awk '{print $2}' | while read f; do
    [ -f "$f" ] && stat -f "%m" "$f" 2>/dev/null || stat -c "%Y" "$f" 2>/dev/null
  done | sort -nr | head -1)
  NOW=$(date +%s)
  AGE_SEC=$((NOW - NEWEST_MODIFIED))
  MIN_AGE=900   # 15 minutes = 900 secondes

  if [ "$AGE_SEC" -lt "$MIN_AGE" ]; then
    # < 15 min → on attend que Florian/Claude finisse d'éditer
    log "⏸ debounce : dernière modif il y a ${AGE_SEC}s (< ${MIN_AGE}s), j'attends"
    exit 0
  fi

  CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
  git add -A 2>>"$LOG"
  if git commit -m "Auto-push $(date '+%Y-%m-%d %H:%M') — $CHANGED fichier(s)" >/dev/null 2>>"$LOG"; then
    log "📝 commit auto ($CHANGED fichiers, batch de ${AGE_SEC}s)"
  fi
fi

# ─── Fetch silencieux pour comparer HEAD à origin/main ───────────────
if ! git fetch origin main --quiet 2>>"$LOG"; then
  log "⚠ fetch failed (network ou auth)"
  # On n'incrémente pas l'échec ici — pourrait être un souci réseau temporaire
  exit 0
fi

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

# ─── Rien à pousser : reset compteur d'échec, silence total ──────────
if [ "$LOCAL" = "$REMOTE" ]; then
  echo "0" > "$STATE_FILE" 2>/dev/null
  exit 0
fi

# ─── Détection des migrations + Edge Functions Supabase modifiées ────
MIGRATIONS_CHANGED=$(git diff --name-only "$REMOTE..$LOCAL" 2>/dev/null | grep -E '^supabase/migrations/.*\.sql$' || true)
FUNCTIONS_CHANGED=$(git diff --name-only "$REMOTE..$LOCAL" 2>/dev/null | grep -E '^supabase/functions/[^/]+/.*\.ts$' | awk -F'/' '{print $3}' | sort -u || true)

# ─── PUSH avec retry (3 tentatives, délai 2s entre chaque) ───────────
PUSH_OK=0
for attempt in 1 2 3; do
  if git push origin main --quiet 2>>"$LOG"; then
    PUSH_OK=1
    break
  fi
  log "⏳ push tentative $attempt/3 échouée, retry…"
  sleep 2
done

if [ "$PUSH_OK" = "1" ]; then
  log "✅ push $LOCAL"
  echo "0" > "$STATE_FILE" 2>/dev/null  # reset compteur

  # ─── Auto-deploy Supabase si nouvelles migrations ─────────────────
  if [ -n "$MIGRATIONS_CHANGED" ]; then
    dlog "🔧 Nouvelles migrations détectées :"
    echo "$MIGRATIONS_CHANGED" | sed 's/^/  - /' >> "$DEPLOY_LOG"

    if [ -f "$ENV_FILE" ]; then
      set -a
      # shellcheck disable=SC1090
      source "$ENV_FILE"
      set +a
    fi

    if ! command -v supabase >/dev/null 2>&1; then
      dlog "⚠ supabase CLI non trouvé (brew install supabase/tap/supabase)"
    elif [ -z "$SUPABASE_DB_PASSWORD" ]; then
      dlog "⚠ SUPABASE_DB_PASSWORD non défini dans $ENV_FILE"
    elif supabase db push --linked --password "$SUPABASE_DB_PASSWORD" --yes >>"$DEPLOY_LOG" 2>&1; then
      dlog "✅ Migrations déployées"
    else
      dlog "❌ Échec deploy migrations"
    fi
  fi

  # ─── Auto-deploy Edge Functions si modifiées ──────────────────────
  if [ -n "$FUNCTIONS_CHANGED" ]; then
    dlog "⚡ Edge Functions modifiées :"
    echo "$FUNCTIONS_CHANGED" | sed 's/^/  - /' >> "$DEPLOY_LOG"

    if command -v supabase >/dev/null 2>&1; then
      while IFS= read -r fn; do
        [ -z "$fn" ] && continue
        [[ "$fn" == _* ]] && continue   # skip _shared, etc.

        # Detect verify_jwt = false dans config.toml → fonction publique
        local_flag=""
        if grep -A2 "^\[functions\.$fn\]" "$REPO/supabase/config.toml" 2>/dev/null | grep -q "verify_jwt = false"; then
          local_flag="--no-verify-jwt"
        fi

        if supabase functions deploy "$fn" --project-ref btcbjwqiivhpwoszomhg $local_flag >>"$DEPLOY_LOG" 2>&1; then
          dlog "✅ Function '$fn' déployée${local_flag:+ (publique)}"
        else
          dlog "❌ Échec deploy '$fn'"
        fi
      done <<< "$FUNCTIONS_CHANGED"
    fi
  fi
else
  # ─── 3 échecs consécutifs → notification macOS ─────────────────────
  FAIL_COUNT=$(cat "$STATE_FILE" 2>/dev/null || echo "0")
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "$FAIL_COUNT" > "$STATE_FILE" 2>/dev/null
  log "❌ push failed ($LOCAL) — échec consécutif #$FAIL_COUNT"

  if [ "$FAIL_COUNT" = "3" ]; then
    notify "Auto-push HELP! Confort" "⚠️ 3 échecs consécutifs de push. Vérifiez votre auth GitHub (PAT expiré ?). Détails : ~/Library/Application Support/HelpConfort/autopush.log"
    log "🔔 Notification envoyée (3 échecs)"
  fi
  if [ "$FAIL_COUNT" = "10" ]; then
    notify "Auto-push HELP! Confort" "🚨 10 échecs. Daemon en attente. Relancez tools/Setup-Git-Auth.command pour refixer l'auth."
  fi
fi

exit 0
