#!/bin/bash
# 2026-06-02 — Supprime tous les fichiers parasites du projet
# Florian : double-clique ce fichier dans Finder pour nettoyer.

set -e
cd "$(dirname "$0")"

echo "🧹 Nettoyage du projet : $(pwd)"
echo ""

# Liste avant
echo "=== Fichiers à supprimer ==="
echo "→ Doublons Mac (* 2.ext):"
find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null
echo ""
echo "→ Backups (*.bak, *.original, *-OLD.*, *-bak.*):"
find . -maxdepth 3 -type f \( -name "*.bak" -o -name "*.original" -o -name "*-OLD.*" -o -name "*-bak.*" \) -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -100
echo ""
echo "→ .DS_Store:"
find . -name ".DS_Store" -not -path "*/.git/*" 2>/dev/null | head -20
echo ""

read -p "❓ Confirmer la suppression de tous ces fichiers ? (o/N) " confirm
if [[ ! "$confirm" =~ ^[oOyY]$ ]]; then
  echo "❌ Annulé."
  exit 0
fi

# Suppression
echo ""
echo "🗑  Suppression en cours..."
find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f -delete 2>/dev/null
find . -maxdepth 3 -type f \( -name "*.bak" -o -name "*.original" -o -name "*-OLD.*" -o -name "*-bak.*" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -delete 2>/dev/null
find . -name ".DS_Store" -not -path "*/.git/*" -delete 2>/dev/null
echo "✅ Nettoyage terminé"
echo ""

# Bilan
echo "=== Restant éventuellement ==="
echo "  ' 2.' : $(find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')"
echo "  .bak : $(find . -maxdepth 3 -name "*.bak" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')"
echo "  .DS_Store : $(find . -name ".DS_Store" -not -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')"

# Push automatique via LaunchAgent (le watcher détecte les suppressions)
echo ""
echo "📤 Le LaunchAgent va automatiquement pousser le nettoyage dans 1-2 min."
echo ""
read -p "Appuyez sur Entrée pour fermer..."
