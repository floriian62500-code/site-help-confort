#!/bin/bash
# 2026-06-01 — Supprime les doublons Mac " 2.ext" du projet
# Florian : double-clique ce fichier dans Finder pour nettoyer.

set -e
cd "$(dirname "$0")"

echo "🧹 Nettoyage doublons Mac dans : $(pwd)"
echo ""

# Liste avant
echo "=== Fichiers à supprimer ==="
find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null
echo ""

read -p "❓ Confirmer la suppression de tous ces fichiers ? (o/N) " confirm
if [[ ! "$confirm" =~ ^[oOyY]$ ]]; then
  echo "❌ Annulé."
  exit 0
fi

# Suppression
echo ""
echo "🗑  Suppression en cours..."
find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f -delete
echo "✅ Doublons supprimés"
echo ""

# Reste-t-il ?
remaining=$(find . -name "* 2.*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l)
echo "Fichiers \" 2.\" restants : $remaining"

# Push automatique via LaunchAgent (le watcher détecte les suppressions)
echo ""
echo "📤 Le LaunchAgent va automatiquement pousser le nettoyage dans 1-2 min."
echo ""
read -p "Appuyez sur Entrée pour fermer..."
