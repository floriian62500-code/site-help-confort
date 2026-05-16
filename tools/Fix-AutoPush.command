#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# FIX AUTO-PUSH v2 — HELP Confort
# ═══════════════════════════════════════════════════════════════
# Met à jour le daemon launchd avec la version ROBUSTE :
#   - Auto-commit des fichiers modifiés
#   - Cleanup automatique des locks
#   - Retry 3× sur push failed
#   - Notification macOS si échec persistant
#   - Auto-deploy Supabase si migrations changées
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
NEW_DIR="$HOME/Library/Application Support/HelpConfort"
NEW_SCRIPT="$NEW_DIR/autopush.sh"
LOG="$NEW_DIR/autopush.log"
LABEL="com.helpconfort.autopush"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔧 Fix Auto-Push v2 — version robuste                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Créer le dossier non protégé
mkdir -p "$NEW_DIR"
echo "✅ Dossier : $NEW_DIR"

# ── 2. Vider les locks et écrire le NOUVEAU script robuste
rm -f "$REPO/.git/index.lock" "$REPO/.git/HEAD.lock" 2>/dev/null
echo "🔓 Locks Git nettoyés (si présents)"

cat > "$NEW_SCRIPT" << 'SCRIPT'
#!/bin/bash
# AUTO-PUSH ROBUSTE — HELP Confort (v2)
REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
LOG="$HOME/Library/Application Support/HelpConfort/autopush.log"
DEPLOY_LOG="$HOME/Library/Application Support/HelpConfort/supabase-deploy.log"
ENV_FILE="$HOME/Library/Application Support/HelpConfort/.env"
STATE_FILE="$HOME/Library/Application Support/HelpConfort/state"

cd "$REPO" 2>/dev/null || exit 0
[ -d .git ] || exit 0

# Rotation log
for f in "$LOG" "$DEPLOY_LOG"; do
  if [ -f "$f" ] && [ "$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)" -gt 1048576 ]; then
    tail -200 "$f" > "$f.tmp" 2>/dev/null && mv "$f.tmp" "$f"
  fi
done

log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }
dlog() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$DEPLOY_LOG"; }
notify() { osascript -e "display notification \"$2\" with title \"$1\" sound name \"Glass\"" 2>/dev/null || true; }

# Cleanup locks
rm -f .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock 2>/dev/null
find .git/objects -name "tmp_obj_*" -mmin +5 -delete 2>/dev/null

# Auto-commit des fichiers modifiés
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
  git add -A 2>>"$LOG"
  git commit -m "Auto-push $(date '+%Y-%m-%d %H:%M') — $CHANGED fichier(s)" >/dev/null 2>>"$LOG" \
    && log "📝 commit auto ($CHANGED fichiers)"
fi

# Fetch
if ! git fetch origin main --quiet 2>>"$LOG"; then
  log "⚠ fetch failed"
  exit 0
fi

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "0" > "$STATE_FILE" 2>/dev/null
  exit 0
fi

# Migrations Supabase ?
MIGRATIONS_CHANGED=$(git diff --name-only "$REMOTE..$LOCAL" 2>/dev/null | grep -E '^supabase/migrations/.*\.sql$' || true)

# PUSH avec retry 3×
PUSH_OK=0
for attempt in 1 2 3; do
  if git push origin main --quiet 2>>"$LOG"; then
    PUSH_OK=1
    break
  fi
  log "⏳ push tentative $attempt/3 échouée"
  sleep 2
done

if [ "$PUSH_OK" = "1" ]; then
  log "✅ push $LOCAL"
  echo "0" > "$STATE_FILE" 2>/dev/null

  if [ -n "$MIGRATIONS_CHANGED" ]; then
    dlog "🔧 Nouvelles migrations :"
    echo "$MIGRATIONS_CHANGED" | sed 's/^/  - /' >> "$DEPLOY_LOG"
    [ -f "$ENV_FILE" ] && { set -a; source "$ENV_FILE"; set +a; }
    if ! command -v supabase >/dev/null 2>&1; then
      dlog "⚠ supabase CLI absent"
    elif [ -z "$SUPABASE_DB_PASSWORD" ]; then
      dlog "⚠ SUPABASE_DB_PASSWORD absent"
    elif supabase db push --linked --password "$SUPABASE_DB_PASSWORD" --yes >>"$DEPLOY_LOG" 2>&1; then
      dlog "✅ Migrations déployées"
    else
      dlog "❌ Échec deploy migrations"
    fi
  fi
else
  FAIL=$(cat "$STATE_FILE" 2>/dev/null || echo "0")
  FAIL=$((FAIL + 1))
  echo "$FAIL" > "$STATE_FILE" 2>/dev/null
  log "❌ push failed ($LOCAL) — échec #$FAIL"
  if [ "$FAIL" = "3" ]; then
    notify "Auto-push HELP Confort" "⚠️ 3 échecs consécutifs. Auth GitHub à vérifier (Setup-Git-Auth.command)"
    log "🔔 Notification envoyée"
  fi
fi

exit 0
SCRIPT

chmod +x "$NEW_SCRIPT"
echo "✅ Script v2 robuste écrit : $NEW_SCRIPT"

# ── 3. Plist launchd (toutes les 60 sec)
cat > "$PLIST" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key><string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$NEW_SCRIPT</string>
    </array>
    <key>StartInterval</key><integer>60</integer>
    <key>RunAtLoad</key><true/>
    <key>StandardOutPath</key><string>/dev/null</string>
    <key>StandardErrorPath</key><string>/dev/null</string>
</dict>
</plist>
PLIST
echo "✅ Plist écrit : $PLIST"

# ── 4. Recharger le service launchd
launchctl unload "$PLIST" 2>/dev/null
if launchctl load "$PLIST" 2>&1; then
  echo "✅ Service launchd rechargé"
else
  echo "❌ Erreur de chargement"
  exit 1
fi

# ── 5. Premier run forcé pour pousser les commits en attente
echo ""
echo "⏳ Premier run (push des commits en attente)…"
bash "$NEW_SCRIPT" 2>&1
sleep 2

echo ""
echo "📄 5 dernières lignes du log :"
if [ -f "$LOG" ] && [ -s "$LOG" ]; then
  tail -5 "$LOG" | sed 's/^/   /'
else
  echo "   (log vide — c'est OK si rien à pousser)"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🎉 Daemon v2 installé et démarré !                      ║"
echo "║                                                          ║"
echo "║  Différences vs v1 :                                     ║"
echo "║   ✅ Auto-commit des fichiers modifiés                   ║"
echo "║   ✅ Cleanup automatique des locks Git                   ║"
echo "║   ✅ Retry 3× sur push failed                            ║"
echo "║   ✅ Notification macOS si 3 échecs consécutifs          ║"
echo "║                                                          ║"
echo "║  Vous n'aurez plus à manipuler manuellement.             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Fenêtre fermée dans 8 secondes…"
sleep 8
osascript -e 'tell application "Terminal" to close (every window whose name contains "Fix-AutoPush")' 2>/dev/null &
exit 0
