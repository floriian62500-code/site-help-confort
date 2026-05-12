#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# PUSH AUTO — HELP! Confort
# ═══════════════════════════════════════════════════════════════
# Usage :
#   - Double-clique sur ce fichier depuis Finder
#   - Tape un message de commit (ou laisse vide pour message auto)
#   - Le script fait : git add . → git commit → git push
#   - Tu peux refermer la fenêtre quand c'est terminé
#
# Pré-requis :
#   - GitHub Desktop a déjà été utilisé au moins une fois pour
#     que l'authentification soit stockée dans le trousseau macOS
#   - Si ça refuse de pousser : ouvrir GitHub Desktop, faire un
#     push manuel pour rafraîchir l'auth, puis ce script
#     remarchera.
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🚀 Push Auto — HELP! Confort                            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable : $REPO"; sleep 5; exit 1; }

# ── 1. Nettoyer les éventuels locks Git
for lock in .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock; do
  [ -f "$lock" ] && rm -f "$lock" && echo "  🔓 Lock supprimé : $lock"
done

# ── 2. Vérif état du dépôt
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ Pas un dépôt Git. Annulation."
  sleep 5
  exit 1
fi

BRANCH=$(git branch --show-current)
echo "  📍 Branche courante : $BRANCH"
echo ""

# ── 3. Liste des changements
CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$CHANGED" = "0" ]; then
  echo "  ℹ️  Rien à pousser. Le dépôt est à jour."
  echo ""
  echo "──────────────────────────────────────────────────────────"
  echo "  Cette fenêtre se ferme automatiquement dans 4 secondes…"
  echo "──────────────────────────────────────────────────────────"
  sleep 4
  osascript -e 'tell application "Terminal" to close (every window whose name contains "Push-Auto")' 2>/dev/null &
  exit 0
fi

echo "  📝 $CHANGED fichier(s) modifié(s) :"
echo ""
git status --short | head -30 | sed 's/^/     /'
echo ""

# ── 4. Demander message de commit
DEFAULT_MSG="Mise à jour site — $(date '+%Y-%m-%d %H:%M')"
echo "──────────────────────────────────────────────────────────"
echo "  💬 Message de commit ?"
echo "     (Entrée pour utiliser : « $DEFAULT_MSG »)"
echo "──────────────────────────────────────────────────────────"
read -r -p "  > " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="$DEFAULT_MSG"
fi

echo ""
echo "  📦 Commit avec message : « $COMMIT_MSG »"
echo ""

# ── 5. add + commit + push
git add -A
if ! git commit -m "$COMMIT_MSG"; then
  echo ""
  echo "❌ Commit échoué. Voir l'erreur ci-dessus."
  echo ""
  echo "  Appuie sur Entrée pour fermer…"
  read -r
  exit 1
fi

echo ""
echo "  ⬆️  Push vers origin/$BRANCH…"
echo ""

if git push origin "$BRANCH" 2>&1; then
  echo ""
  echo "  ✅ Push réussi ! Netlify va redéployer dans ~30 secondes."
  echo ""
  echo "  🌐 https://github.com/floriian62500-code/site-help-confort"
  echo ""
else
  echo ""
  echo "❌ Push échoué."
  echo ""
  echo "  Causes possibles :"
  echo "    - Authentification expirée → ouvre GitHub Desktop,"
  echo "      fais un Push manuel pour rafraîchir le token."
  echo "    - Le dépôt distant a changé (pull d'abord) :"
  echo "        cd \"$REPO\" && git pull origin $BRANCH"
  echo ""
  echo "  Appuie sur Entrée pour fermer…"
  read -r
  exit 1
fi

echo "──────────────────────────────────────────────────────────"
echo "  Cette fenêtre se ferme automatiquement dans 6 secondes…"
echo "──────────────────────────────────────────────────────────"
sleep 6
osascript -e 'tell application "Terminal" to close (every window whose name contains "Push-Auto")' 2>/dev/null &
exit 0
