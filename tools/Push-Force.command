#!/bin/bash
# ════════════════════════════════════════════════════════
#  🚀 Push-Force — rebase + push (résout les divergences)
#  Usage : double-clique sur ce fichier
# ════════════════════════════════════════════════════════

cd "$(dirname "$0")/.." || exit 1
REPO="$(pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🚀 Push-Force — rebase + push                          ║"
echo "║  Dossier : $REPO"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

echo "  ⏳ Fetch des derniers commits remote…"
git fetch origin main 2>&1 | sed 's/^/     /'

LOCAL_AHEAD=$(git rev-list --count HEAD ^origin/main 2>/dev/null)
LOCAL_BEHIND=$(git rev-list --count origin/main ^HEAD 2>/dev/null)

echo ""
echo "  📊 État : $LOCAL_AHEAD commits locaux à pousser, $LOCAL_BEHIND commits remote à intégrer"
echo ""

if [ "$LOCAL_AHEAD" = "0" ] && [ "$LOCAL_BEHIND" = "0" ] ; then
  echo "  ✅ Déjà à jour. Rien à faire."
  echo ""
  echo "  Fenêtre fermée dans 3 sec…"
  sleep 3
  exit 0
fi

if [ "$LOCAL_BEHIND" != "0" ] ; then
  echo "  🔄 Rebase des $LOCAL_BEHIND commits remote sur tes $LOCAL_AHEAD commits locaux…"
  git pull --rebase origin main 2>&1 | sed 's/^/     /'
  REBASE_OK=$?
  if [ $REBASE_OK -ne 0 ] ; then
    echo ""
    echo "  ❌ Rebase échoué — conflits à résoudre manuellement."
    echo "     Lance : cd \"$REPO\" && git status"
    echo ""
    read -p "  Appuie sur Entrée pour fermer…"
    exit 1
  fi
fi

echo ""
echo "  🚀 Push vers origin/main…"
git push origin main 2>&1 | sed 's/^/     /'
PUSH_OK=$?

echo ""
if [ $PUSH_OK -eq 0 ] ; then
  NEW_HEAD=$(git rev-parse --short HEAD)
  echo "  ✅ Push OK ! HEAD = $NEW_HEAD"
  echo "  ⏳ Netlify va déployer dans 1-2 min."
  echo ""
  echo "     → Suivi déploiement :"
  echo "       https://app.netlify.com/projects/remarkable-dragon-364e2b/deploys"
else
  echo "  ❌ Push échoué. Vérifie tes credentials Git."
  echo "     Lance : tools/Setup-Git-Auth.command"
fi

echo ""
echo "  Fenêtre fermée dans 5 sec…"
sleep 5
