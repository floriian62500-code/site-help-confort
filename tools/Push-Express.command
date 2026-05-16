#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# PUSH EXPRESS — HELP Confort
# ═══════════════════════════════════════════════════════════════
# Double-clic = nettoyage + git add . + commit (message auto) + push
# Aucune question posée. Idéal pour pousser rapidement.
#
# Pré-requis : avoir lancé Setup-Git-Auth.command une fois.
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"

clear
echo "🚀 Push Express en cours…"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable"; sleep 4; exit 1; }

# ── Nettoyer les locks
for lock in .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock; do
  [ -f "$lock" ] && rm -f "$lock" && echo "🔓 Lock supprimé : $lock"
done

# ── Nettoyer les fichiers temporaires d'objets (résidus de tentatives ratées)
TMP_COUNT=$(find .git/objects -name "tmp_obj_*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TMP_COUNT" != "0" ]; then
  echo "🧹 Nettoyage de $TMP_COUNT fichier(s) temporaire(s) Git…"
  find .git/objects -name "tmp_obj_*" -delete 2>/dev/null
fi

# ── Rien à pousser ?
if [ -z "$(git status --porcelain)" ]; then
  echo ""
  echo "ℹ️  Rien à pousser. Le dépôt est à jour."
  echo ""
  echo "Fenêtre fermée dans 3 sec…"
  sleep 3
  osascript -e 'tell application "Terminal" to close (every window whose name contains "Push-Express")' 2>/dev/null &
  exit 0
fi

BRANCH=$(git branch --show-current)
CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
MSG="Mise à jour site — $(date '+%Y-%m-%d %H:%M') — $CHANGED fichier(s)"

echo ""
echo "📝 $CHANGED fichier(s) modifié(s)"
echo "💬 Message : « $MSG »"
echo ""

# ── add + commit + push
git add -A

if ! git commit -m "$MSG"; then
  echo ""
  echo "❌ Commit échoué. Voir l'erreur ci-dessus."
  echo ""
  echo "Appuie sur Entrée pour fermer…"
  read -r
  exit 1
fi

echo ""
echo "⬆️  Push vers origin/$BRANCH…"
echo ""

if git push origin "$BRANCH" 2>&1; then
  echo ""
  echo "✅ Push réussi ! Netlify redéploie sous ~30 sec."
  echo "🌐 https://github.com/floriian62500-code/site-help-confort"
  echo ""
  echo "Fenêtre fermée dans 5 sec…"
  sleep 5
  osascript -e 'tell application "Terminal" to close (every window whose name contains "Push-Express")' 2>/dev/null &
  exit 0
else
  echo ""
  echo "❌ Push échoué."
  echo ""
  echo "Causes possibles :"
  echo "  • Authentification expirée → lance Setup-Git-Auth.command"
  echo "  • Conflit avec origin → fais d'abord : git pull origin $BRANCH"
  echo ""
  echo "Appuie sur Entrée pour fermer…"
  read -r
  exit 1
fi
