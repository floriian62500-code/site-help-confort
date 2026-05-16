#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# setup-actu-generator.sh — Tout-en-un :
#   1. Cleanup des 55 posts HC France (l'import bancal)
#   2. Deploy de l'Edge Function actu-generator
#   3. Affiche le lien vers la nouvelle page
# ═══════════════════════════════════════════════════════════════════════════
set -e
cd "$(dirname "$0")/.."
PROJECT_REF="btcbjwqiivhpwoszomhg"

echo "════════════════════════════════════════════════"
echo "  Setup générateur d'actus IA HC Saint-Omer/DK"
echo "════════════════════════════════════════════════"

# ─── 1. Cleanup ───
echo ""
echo "🧹 [1/3] Cleanup des 55 posts HC France importés…"
TS=$(date +%Y%m%d%H%M%S)
CLEAN_MIG="supabase/migrations/${TS}_cleanup_hc_fr_import.sql"
cat > "$CLEAN_MIG" <<'SQL'
delete from public.realisations
 where (ai_generated->>'imported_from') = 'helpconfortfr_planning_2026';
SQL
echo Y | supabase db push 2>&1 | tail -5

# Vire les fichiers locaux d'import
rm -rf "images/actus-imports-hc-fr" 2>/dev/null || true
rm -f admin-pro/imports/import_55_publications_2026-05-16.sql \
      admin-pro/imports/update_55_images_2026-05-16.sql \
      admin-pro/imports/clear_bad_images_2026-05-16.sql 2>/dev/null || true
echo "✓ Cleanup OK"

# ─── 2. Deploy Edge Function ───
echo ""
echo "🚀 [2/3] Déploiement de l'Edge Function actu-generator…"
supabase functions deploy actu-generator --no-verify-jwt --project-ref "$PROJECT_REF"

# ─── 3. Vérif ANTHROPIC_API_KEY ───
echo ""
echo "🔑 [3/3] Vérification ANTHROPIC_API_KEY…"
HAS_KEY=$(supabase secrets list --project-ref "$PROJECT_REF" 2>/dev/null | grep -c "ANTHROPIC_API_KEY" || echo 0)
if [ "$HAS_KEY" -gt 0 ]; then
  echo "✓ ANTHROPIC_API_KEY présent dans les secrets Supabase"
else
  echo "⚠ ANTHROPIC_API_KEY ABSENT — la fonction ne pourra pas appeler Claude."
  echo "  Soit :"
  echo "    1) Configure dans app_settings.claude.api_key (Réglages back-office)"
  echo "    2) Ajoute en secret : supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx --project-ref $PROJECT_REF"
fi

echo ""
echo "════════════════════════════════════════════════"
echo "  ✅ SETUP TERMINÉ"
echo "════════════════════════════════════════════════"
echo ""
echo "👉 Ouvre : https://depan59-62.fr/admin-pro/actu-generator.html"
echo "   (lien aussi dans la sidebar : Comm → Contenu & posts → 🤖 Générateur actus IA)"
echo ""
echo "Workflow :"
echo "  1. Tape un mot-clé (ou clique une suggestion)"
echo "  2. Clic Générer → Claude propose 3 actus"
echo "  3. Sélectionne celles qui te plaisent"
echo "  4. Sauvegarder → elles arrivent en pile validation"
echo "  5. Tu uploades ta photo terrain à la validation"
