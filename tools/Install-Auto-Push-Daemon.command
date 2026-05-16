#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# INSTALL AUTO-PUSH DAEMON — HELP Confort
# ═══════════════════════════════════════════════════════════════
# Installe un service launchd qui surveille le dépôt et pousse
# automatiquement TOUTE modification vers GitHub, sans intervention.
#
# Une fois lancé :
#   - Le service tourne en tâche de fond (~0% CPU)
#   - Toutes les 60 secondes, il vérifie s'il y a des changements
#   - S'il y en a → commit + push automatique
#   - Le service démarre tout seul à chaque ouverture de session
#
# Pour DÉSINSTALLER plus tard : double-cliquer sur
# Uninstall-Auto-Push-Daemon.command
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
SCRIPT="$REPO/.auto-push-loop.sh"
LOGFILE="$REPO/.auto-push.log"
PLIST_NAME="com.helpconfort.autopush"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🤖 Installation Auto-Push Daemon — HELP Confort        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable"; sleep 5; exit 1; }

# ── 0. Pré-requis : credential.helper doit être configuré
HELPER=$(git config --get credential.helper)
if [ -z "$HELPER" ]; then
  echo "⚠️  credential.helper non configuré."
  echo ""
  echo "Lance d'abord Setup-Git-Auth.command et reviens ici ensuite."
  echo ""
  echo "Appuie sur Entrée pour fermer…"
  read -r
  exit 1
fi
echo "✅ credential.helper = $HELPER"

# ── 1. Écrire le script de boucle (ce que le daemon va exécuter)
cat > "$SCRIPT" << 'LOOP'
#!/bin/bash
REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
LOGFILE="$REPO/.auto-push.log"

cd "$REPO" || exit 1

# Garde-fou : pas de boucle infinie si Git est cassé
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Pas un repo Git" >> "$LOGFILE"
  exit 1
fi

# Nettoyer locks + tmp objects
for lock in .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock; do
  [ -f "$lock" ] && rm -f "$lock"
done
find .git/objects -name "tmp_obj_*" -delete 2>/dev/null

# Rien à pousser ?
if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

BRANCH=$(git branch --show-current)
CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
MSG="Auto-push — $(date '+%Y-%m-%d %H:%M') — $CHANGED fichier(s)"

# Log
{
  echo ""
  echo "═══════════════════════════════════════"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $CHANGED fichier(s) à pousser"
  echo "Branche : $BRANCH"
  echo "Message : $MSG"
} >> "$LOGFILE"

# Add + commit + push
{
  git add -A 2>&1
  git commit -m "$MSG" 2>&1
  git push origin "$BRANCH" 2>&1
} >> "$LOGFILE"

if [ $? -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Push réussi" >> "$LOGFILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Push échoué" >> "$LOGFILE"
fi

# Rotation log si > 1 Mo
if [ -f "$LOGFILE" ] && [ $(stat -f%z "$LOGFILE" 2>/dev/null || echo 0) -gt 1048576 ]; then
  tail -200 "$LOGFILE" > "$LOGFILE.tmp" && mv "$LOGFILE.tmp" "$LOGFILE"
fi
LOOP

chmod +x "$SCRIPT"
echo "✅ Script de boucle créé : $SCRIPT"

# ── 2. Créer le plist launchd
mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST_PATH" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$PLIST_NAME</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$SCRIPT</string>
    </array>
    <key>StartInterval</key>
    <integer>60</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$LOGFILE</string>
    <key>StandardErrorPath</key>
    <string>$LOGFILE</string>
    <key>WorkingDirectory</key>
    <string>$REPO</string>
</dict>
</plist>
PLIST

echo "✅ Plist créé : $PLIST_PATH"

# ── 3. Charger le service
# Décharger s'il existait déjà (idempotence)
launchctl unload "$PLIST_PATH" 2>/dev/null
if launchctl load "$PLIST_PATH" 2>&1; then
  echo "✅ Service launchd chargé : $PLIST_NAME"
else
  echo "❌ Échec du chargement launchd. Voir l'erreur ci-dessus."
  exit 1
fi

# ── 4. Initialiser le log
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Auto-push daemon démarré" > "$LOGFILE"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🎉 Daemon installé et lancé !                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  ▶ Toutes les 60 secondes, le daemon vérifie le dépôt."
echo "  ▶ S'il y a des changements, il commit + push automatiquement."
echo "  ▶ Tout est journalisé dans : $LOGFILE"
echo ""
echo "  Pour voir le log en temps réel (terminal) :"
echo "    tail -f \"$LOGFILE\""
echo ""
echo "  Pour désinstaller : Uninstall-Auto-Push-Daemon.command"
echo ""
echo "──────────────────────────────────────────────────────────"
echo "  Appuie sur Entrée pour fermer…"
echo "──────────────────────────────────────────────────────────"
read -r
exit 0
