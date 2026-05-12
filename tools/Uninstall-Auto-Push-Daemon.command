#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# UNINSTALL AUTO-PUSH DAEMON — HELP! Confort
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
SCRIPT="$REPO/.auto-push-loop.sh"
LOGFILE="$REPO/.auto-push.log"
PLIST_NAME="com.helpconfort.autopush"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"

clear
echo ""
echo "🛑 Désinstallation Auto-Push Daemon…"
echo ""

# Décharger le service
if [ -f "$PLIST_PATH" ]; then
  launchctl unload "$PLIST_PATH" 2>/dev/null
  rm -f "$PLIST_PATH"
  echo "✅ Service launchd retiré"
else
  echo "ℹ️  Service launchd non installé"
fi

# Supprimer le script
[ -f "$SCRIPT" ] && rm -f "$SCRIPT" && echo "✅ Script de boucle supprimé"

# Garder le log au cas où
[ -f "$LOGFILE" ] && echo "📄 Log conservé : $LOGFILE (à supprimer manuellement si voulu)"

echo ""
echo "Le dépôt revient à un état normal. Vous pouvez réinstaller à tout moment."
echo ""
echo "Appuie sur Entrée pour fermer…"
read -r
exit 0
