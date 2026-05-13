#!/bin/bash
# Auto-push silencieux : pousse origin/main si HEAD diffère
# + Auto-deploy des migrations Supabase si elles ont changé
set -e

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
LOG="$REPO/.autopush/autopush.log"
DEPLOY_LOG="$REPO/.autopush/supabase-deploy.log"
ENV_FILE="$REPO/.autopush/.env"

cd "$REPO" || exit 0

# Rotation log si > 1 Mo
if [ -f "$LOG" ] && [ "$(stat -f%z "$LOG" 2>/dev/null || stat -c%s "$LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  tail -200 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi
if [ -f "$DEPLOY_LOG" ] && [ "$(stat -f%z "$DEPLOY_LOG" 2>/dev/null || stat -c%s "$DEPLOY_LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  tail -200 "$DEPLOY_LOG" > "$DEPLOY_LOG.tmp" 2>/dev/null && mv "$DEPLOY_LOG.tmp" "$DEPLOY_LOG"
fi

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }
dlog() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$DEPLOY_LOG"; }

# Fetch silencieux pour comparer HEAD à origin/main
git fetch origin main --quiet 2>/dev/null || { log "fetch failed"; exit 0; }

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

# Rien à pousser : silence total
[ "$LOCAL" = "$REMOTE" ] && exit 0

# Détection des migrations Supabase modifiées dans les commits qu'on va pousser
MIGRATIONS_CHANGED=$(git diff --name-only "$REMOTE..$LOCAL" 2>/dev/null | grep -E '^supabase/migrations/.*\.sql$' || true)

# Push (sortie capturée en log, jamais stdout)
if git push origin main --quiet 2>>"$LOG"; then
  log "✅ push $LOCAL"

  # ─── Auto-deploy Supabase si nouvelles migrations ─────────────────────
  if [ -n "$MIGRATIONS_CHANGED" ]; then
    dlog "🔧 Nouvelles migrations détectées :"
    echo "$MIGRATIONS_CHANGED" | sed 's/^/  - /' >> "$DEPLOY_LOG"

    # Charge .env si présent (peut définir SUPABASE_DB_PASSWORD)
    if [ -f "$ENV_FILE" ]; then
      set -a
      # shellcheck disable=SC1090
      source "$ENV_FILE"
      set +a
    fi

    # Vérif que supabase CLI est dispo
    if ! command -v supabase >/dev/null 2>&1; then
      dlog "⚠ supabase CLI non trouvé dans le PATH (essayez : brew install supabase/tap/supabase)"
      exit 0
    fi

    # Vérif que SUPABASE_DB_PASSWORD est défini
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
      dlog "⚠ SUPABASE_DB_PASSWORD non défini. Crée $ENV_FILE avec : SUPABASE_DB_PASSWORD=ton_mot_de_passe"
      exit 0
    fi

    # Push les migrations (idempotent : ne réapplique pas celles déjà en base)
    if supabase db push --linked --password "$SUPABASE_DB_PASSWORD" --yes >>"$DEPLOY_LOG" 2>&1; then
      dlog "✅ Migrations déployées sur Supabase"
    else
      dlog "❌ Échec deploy migrations (voir détails ci-dessus)"
    fi
  fi
else
  log "❌ push failed ($LOCAL)"
fi

exit 0
