#!/bin/bash
# 2026-06-03 — Nettoyage AUTO (sans confirmation) du projet
# Florian : double-clique ce fichier dans Finder pour nettoyer.

cd "$(dirname "$0")"

echo "🧹 Nettoyage AUTO du projet : $(pwd)"
echo ""

# Suppression immédiate sans confirmation
find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f -delete 2>/dev/null
find . -maxdepth 3 -type f \( -name "*.bak" -o -name "*.original" -o -name "*-OLD.*" -o -name "*-bak.*" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -delete 2>/dev/null
find . -name ".DS_Store" -not -path "*/.git/*" -delete 2>/dev/null
rm -f images/mascotte.png images/mascotte-opt.png images/mascotte1.png images/mascotte-with-bg.png images/_to_delete_*.png 2>/dev/null

# Bilan
echo "✅ Nettoyage terminé"
echo ""
echo "=== Restant éventuellement ==="
echo "  ' 2.'      : $(find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')"
echo "  .bak       : $(find . -maxdepth 3 -name "*.bak" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')"
echo "  .DS_Store  : $(find . -name ".DS_Store" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')"
echo "  PNG masc.  : $(ls images/mascotte*.png images/_to_delete_*.png 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "📤 Le LaunchAgent push automatiquement dans 1-2 min."
echo ""
echo "Cette fenêtre se fermera dans 5 secondes..."
sleep 5
# Auto-close du Terminal
osascript -e 'tell application "Terminal" to close (every window whose name contains "Cleanup-Doublons")' 2>/dev/null &
exit 0
