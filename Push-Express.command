#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# PUSH EXPRESS — HELP! Confort
# ═══════════════════════════════════════════════════════════════
# Double-clic = git add . + commit (message auto) + push
# Aucune question posée. Idéal pour pousser rapidement.
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"

clear
echo "🚀 Push Express en cours…"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable"; sleep 4; exit 1; }

# Nettoyer locks
for lock in .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock; do
  [ -f "$lock" ] && rm -f "$lock"
done

# Rien à pousser ?
if [ -z "$(git status --porcelain)" ]; then
  echo "ℹ️  Rien à pousser. Fenêtre fermée dans 3 sec…"
  sleep 3
  osascript -e 'tell application "Terminal" to close (every window whose name contains "Push-Express")' 2>/dev/null &
  exit 0
fi

BRANCH=$(git branch --show-current)
CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
MSG="Mise à jour site — $(date '+%Y-%m-%d %H:%M') — $CHANGED fichier(s)"

echo "📝 $CHANGED fichier(s) — message : « $MSG »"
echo ""

git add -A && git commit -m "$MSG" && git push origin "$BRANCH"

EXIT=$?
echo ""

if [ $EXIT -eq 0 ]; then
  echo "✅ Push réussi vers $BRANCH ! Netlify redéploie sous ~30 sec."
  sleep 4
  osascript -e 'tell application "Terminal" to close (every window whose name contains "Push-Express")' 2>/dev/null &
else
  echo "❌ Échec. Causes :"
  echo "   - Auth GitHub expirée → ouvrir GitHub Desktop et faire un push manuel."
  echo "   - Conflit avec origin → faire 'git pull' d'abord."
  echo ""
  echo "Appuie sur Entrée pour fermer…"
  read -r
fi

exit $EXIT
