#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# import-pubs-hc-fr.sh — Importe les 55 publications HC France en DB
# v2 : utilise supabase db push (pas besoin de password — credentials déjà
# en cache depuis supabase link).
# ═══════════════════════════════════════════════════════════════════════════
set -e

cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"
PROJECT_REF="btcbjwqiivhpwoszomhg"
SQL_FILE="$PROJECT_DIR/admin-pro/imports/import_55_publications_2026-05-16.sql"
TS=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="$PROJECT_DIR/supabase/migrations/${TS}_import_55_pubs_hc_fr.sql"

echo "📂 SQL source  : $SQL_FILE"
echo "📂 Migration   : $MIGRATION_FILE"
[ -f "$SQL_FILE" ] || { echo "❌ SQL source introuvable"; exit 1; }

# ─── Copie le SQL comme migration ───
cp "$SQL_FILE" "$MIGRATION_FILE"
echo "✓ Migration créée"

# ─── Push via supabase CLI (utilise les credentials cachés) ───
echo ""
echo "🚀 Push via supabase CLI…"
cd "$PROJECT_DIR"

# Push automatique (sans interaction Y/n)
if echo "Y" | supabase db push 2>&1 | tee /tmp/supabase-push.log; then
  if grep -q "Finished\|completed\|applied" /tmp/supabase-push.log; then
    echo ""
    echo "✅ Import des 55 publications terminé !"
    echo ""
    echo "👉 Ouvre : https://depan59-62.fr/admin-pro/realisations.html"
    echo "   Onglet ACTUS → 55 posts en attente de validation"
    exit 0
  fi
fi

# Si échec, restore (supprime la migration locale)
echo ""
echo "❌ supabase db push a échoué — la migration locale est gardée pour debug"
echo "   Fichier : $MIGRATION_FILE"
echo ""
echo "Logs détaillés : cat /tmp/supabase-push.log"
exit 1
