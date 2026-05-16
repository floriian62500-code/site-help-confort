#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# import-photos-hc-fr.sh — Attache les 65 photos aux 55 posts HC France
# ═══════════════════════════════════════════════════════════════════════════
# Pré-requis : import-pubs-hc-fr.sh déjà exécuté (les 55 posts sont en DB)
# Les photos doivent être présentes dans /images/actus-imports-hc-fr/
# (générées par le script Python en amont)
# ═══════════════════════════════════════════════════════════════════════════
set -e

cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"
SQL_FILE="$PROJECT_DIR/admin-pro/imports/update_55_images_2026-05-16.sql"
PHOTOS_DIR="$PROJECT_DIR/images/actus-imports-hc-fr"
TS=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="$PROJECT_DIR/supabase/migrations/${TS}_update_55_images_hc_fr.sql"

echo "📂 SQL  : $SQL_FILE"
echo "📂 Photos : $PHOTOS_DIR"
[ -f "$SQL_FILE" ] || { echo "❌ SQL d'update introuvable"; exit 1; }
[ -d "$PHOTOS_DIR" ] || { echo "❌ Dossier photos absent"; exit 1; }

PHOTO_COUNT=$(ls "$PHOTOS_DIR"/*.webp 2>/dev/null | wc -l | tr -d ' ')
echo "✓ $PHOTO_COUNT photos prêtes à être servies par Netlify"

# Push les photos via autopush (elles sont déjà dans le repo)
echo ""
echo "📤 Les photos seront live sur https://depan59-62.fr/images/actus-imports-hc-fr/"
echo "   dès que Netlify aura déployé (1-2 min après autopush)."

# ─── Migration UPDATE ───
cp "$SQL_FILE" "$MIGRATION_FILE"
echo ""
echo "🚀 Push UPDATE via supabase CLI…"
cd "$PROJECT_DIR"

if echo "Y" | supabase db push 2>&1 | tee /tmp/supabase-push-photos.log; then
  if grep -q "Finished\|completed\|applied" /tmp/supabase-push-photos.log; then
    echo ""
    echo "✅ UPDATE images terminé !"
    echo ""
    echo "👉 Ouvre dans 2 minutes : https://depan59-62.fr/admin-pro/realisations.html"
    echo "   Onglet ACTUS → les 55 posts ont maintenant une image"
    echo "   (laisse 1-2 min à Netlify pour déployer les photos)"
    exit 0
  fi
fi

echo "❌ Échec — voir /tmp/supabase-push-photos.log"
exit 1
