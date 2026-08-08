#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Push-Force-Fix-Sitemap.command
# Double-clique ce fichier pour :
#   1. Rebase la branche main locale sur origin/main
#   2. Push le fix critique sitemap (SITE_URL depan59-62.fr)
#   3. Débloquer la divergence git 37↑ / 60↓
#
# Créé le 2026-07-03 par Cowork suite au fix Search Console
# "Page avec redirection" (Edge Function sitemap v6 en prod).
# ═══════════════════════════════════════════════════════════════

set -e

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
cd "$REPO"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  HELP Confort — Push Fix Sitemap"
echo "══════════════════════════════════════════════════════════════"
echo ""

echo "▶ État actuel :"
git status -sb | head -3
echo ""

echo "▶ Fetch origin main..."
git fetch origin main

AHEAD=$(git rev-list --count origin/main..HEAD)
BEHIND=$(git rev-list --count HEAD..origin/main)
echo "  ahead: $AHEAD | behind: $BEHIND"
echo ""

if [ "$BEHIND" -gt 0 ]; then
  echo "▶ Rebase main sur origin/main (absorb $BEHIND commits distants)..."
  git pull --rebase origin main || {
    echo ""
    echo "⚠️  Conflit de rebase détecté. Options :"
    echo "   git rebase --abort         # annule tout"
    echo "   git rebase --skip          # skip le commit en cours"
    echo "   git status                 # voir les fichiers en conflit"
    read -p "Appuie sur Entrée pour ouvrir un shell interactif..."
    exec $SHELL
  }
  echo "  ✅ Rebase OK"
  echo ""
fi

echo "▶ Push vers origin main..."
git push origin main
echo "  ✅ Push OK"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  Terminé. La branche main est synchronisée."
echo "  Fix sitemap SITE_URL depan59-62.fr désormais dans le repo."
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Appuie sur Entrée pour fermer..."
read
