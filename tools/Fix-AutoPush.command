#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# FIX AUTO-PUSH — HELP! Confort
# ═══════════════════════════════════════════════════════════════
# Corrige le bug "Operation not permitted" du daemon auto-push
# en déplaçant le script dans une zone non protégée par macOS.
#
# Symptôme : .autopush/autopush.log affiche
# "/bin/bash: ...autopush.sh: Operation not permitted"
#
# Cause : macOS (Ventura+) protège ~/Documents/. Les services
# launchd ne peuvent pas exécuter de scripts depuis ~/Documents
# sans Full Disk Access (à éviter pour la sécurité).
#
# Fix : déplacer le script dans ~/Library/Application Support/HelpConfort/
# (zone non protégée, accessible par launchd sans config spéciale).
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
echo "║  🔧 Fix Auto-Push — déplacement vers zone non protégée   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Créer le nouveau dossier
mkdir -p "$NEW_DIR"
echo "✅ Dossier créé : $NEW_DIR"

# ── 2. Écrire le script auto-push (avec chemin repo hardcodé)
cat > "$NEW_SCRIPT" << 'SCRIPT'
#!/bin/bash
# Auto-push silencieux — HELP! Confort
# Exécuté toutes les 60 sec par launchd depuis ~/Library/Application Support/HelpConfort/
set -e
REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
LOG="$HOME/Library/Application Support/HelpConfort/autopush.log"

cd "$REPO" 2>/dev/null || exit 0
[ -d .git ] || exit 0

# Cleanup locks + tmp objects
rm -f .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock 2>/dev/null
find .git/objects -name "tmp_obj_*" -delete 2>/dev/null

# Rotation log si > 1 Mo
if [ -f "$LOG" ] && [ "$(stat -f%z "$LOG" 2>/dev/null || stat -c%s "$LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  tail -200 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }

# Commit auto des changements pending
if [ -n "$(git status --porcelain)" ]; then
  CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
  git add -A 2>/dev/null
  if git commit -m "Auto-push $(date '+%Y-%m-%d %H:%M') — $CHANGED fichier(s)" >/dev/null 2>&1; then
    log "commit OK ($CHANGED fichiers)"
  fi
fi

# Fetch silencieux + comparaison HEAD
git fetch origin main --quiet 2>/dev/null || { log "fetch failed"; exit 0; }
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

# Rien à pousser : silence total
[ "$LOCAL" = "$REMOTE" ] && exit 0

# Push
if git push origin main --quiet 2>>"$LOG"; then
  log "✅ push $LOCAL"
else
  log "❌ push failed ($LOCAL)"
fi

exit 0
SCRIPT

chmod +x "$NEW_SCRIPT"
echo "✅ Script copié : $NEW_SCRIPT"

# ── 3. Mettre à jour le plist pour pointer vers le nouveau chemin
cat > "$PLIST" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$NEW_SCRIPT</string>
    </array>
    <key>StartInterval</key>
    <integer>60</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/dev/null</string>
    <key>StandardErrorPath</key>
    <string>/dev/null</string>
</dict>
</plist>
PLIST
echo "✅ Plist mis à jour : $PLIST"

# ── 4. Recharger le service
launchctl unload "$PLIST" 2>/dev/null
if launchctl load "$PLIST" 2>&1; then
  echo "✅ Service rechargé"
else
  echo "❌ Échec du rechargement"
  exit 1
fi

# ── 5. Forcer un premier run pour valider
echo ""
echo "⏳ Test d'exécution (1 run forcé)…"
bash "$NEW_SCRIPT" 2>&1
sleep 2

# ── 6. Vérifier le log
echo ""
echo "📄 Log actuel :"
if [ -f "$LOG" ] && [ -s "$LOG" ]; then
  tail -5 "$LOG" | sed 's/^/   /'
else
  echo "   (log vide — c'est OK si rien n'avait à être poussé)"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🎉 Fix appliqué !                                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Le script tourne maintenant depuis :"
echo "    $NEW_SCRIPT"
echo ""
echo "  Les logs sont dans :"
echo "    $LOG"
echo ""
echo "  Pour suivre en temps réel :"
echo "    tail -f \"$LOG\""
echo ""
echo "──────────────────────────────────────────────────────────"
echo "  Fenêtre fermée dans 6 sec…"
echo "──────────────────────────────────────────────────────────"
sleep 6
osascript -e 'tell application "Terminal" to close (every window whose name contains "Fix-AutoPush")' 2>/dev/null &
exit 0
