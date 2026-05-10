#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Compresse videos/hero-metier.mp4 (130 Mo → ~3 Mo)
# Lance ce script depuis le dossier SITE INTERNET/.
# Nécessite ffmpeg installé (brew install ffmpeg sur Mac)
# Durée : ~1-3 minutes selon la machine
# ═══════════════════════════════════════════════════════════════════════

set -e
cd "$(dirname "$0")/.."

VIDEO="videos/hero-metier.mp4"

if [ ! -f "$VIDEO" ]; then
    echo "❌ $VIDEO introuvable"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg n'est pas installé."
    echo "   Mac : brew install ffmpeg"
    echo "   Ubuntu : sudo apt install ffmpeg"
    exit 1
fi

OLD_SIZE=$(du -h "$VIDEO" | cut -f1)
echo "📹 Taille avant : $OLD_SIZE"
echo "🔄 Compression en cours (peut prendre 1-3 min)..."

# Sauvegarde l'original au cas où
cp "$VIDEO" "${VIDEO}.original"

# Compression : 1080p max, H.264 CRF 28, pas de son (vidéo de fond), faststart
ffmpeg -y -i "${VIDEO}.original" \
  -vf "scale='min(1920,iw)':-2,fps=30" \
  -c:v libx264 -preset slow -crf 28 \
  -an \
  -movflags +faststart \
  -loglevel error \
  -stats \
  "$VIDEO"

NEW_SIZE=$(du -h "$VIDEO" | cut -f1)
echo ""
echo "✓ Compression terminée"
echo "  Avant : $OLD_SIZE"
echo "  Après : $NEW_SIZE"
echo ""
echo "📦 Original sauvegardé dans : ${VIDEO}.original"
echo "   Si la qualité te convient → supprime le .original"
echo "   Si la qualité est dégradée → restaure avec :"
echo "      mv ${VIDEO}.original $VIDEO"
