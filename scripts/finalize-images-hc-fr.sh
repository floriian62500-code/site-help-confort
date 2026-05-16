#!/usr/bin/env bash
# Push final pour les images : applique le clear sur 23 posts pas matchés
set -e
cd "$(dirname "$0")/.."
SQL_FILE="admin-pro/imports/clear_bad_images_2026-05-16.sql"
TS=$(date +%Y%m%d%H%M%S)
MIGRATION="supabase/migrations/${TS}_clear_bad_images.sql"

echo "📋 Vider image_after pour les 23 posts sans image embedded fiable"
cp "$SQL_FILE" "$MIGRATION"

echo "🚀 supabase db push…"
echo Y | supabase db push 2>&1 | tee /tmp/sb-push-clear.log

if grep -q "Finished\|completed\|applied" /tmp/sb-push-clear.log; then
  echo ""
  echo "✅ Terminé !"
  echo ""
  echo "🎯 État final :"
  echo "   • 33 posts avec leur VRAIE image embedded (de l'xlsx HC France)"
  echo "   • 23 posts sans image → tu uploades à la validation"
  echo ""
  echo "👉 Recharge avec Cmd+Shift+R (force refresh cache) :"
  echo "   https://depan59-62.fr/admin-pro/realisations.html"
else
  echo "❌ Échec — voir /tmp/sb-push-clear.log"
fi
