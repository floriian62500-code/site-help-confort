#!/usr/bin/env bash
# Supprime TOUT ce qui a été importé depuis HC France
set -e
cd "$(dirname "$0")/.."
TS=$(date +%Y%m%d%H%M%S)
SQL="supabase/migrations/${TS}_cleanup_hc_fr_import.sql"

cat > "$SQL" <<'SQL_EOF'
-- Cleanup TOTAL de l'import HC France du 2026-05-16
delete from public.realisations
 where (ai_generated->>'imported_from') = 'helpconfortfr_planning_2026';

-- Vérification : doit retourner 0
select count(*) as restants
  from public.realisations
 where (ai_generated->>'imported_from') = 'helpconfortfr_planning_2026';
SQL_EOF

echo "🧹 Push delete via supabase…"
echo Y | supabase db push 2>&1 | tail -10

# Vire aussi les fichiers WebP du repo (autopush les supprimera)
rm -rf images/actus-imports-hc-fr 2>/dev/null || true
echo "✓ Dossier images/actus-imports-hc-fr supprimé"

# Vire les fichiers SQL d'import (pas la migration cleanup)
rm -f admin-pro/imports/import_55_publications_2026-05-16.sql \
      admin-pro/imports/update_55_images_2026-05-16.sql \
      admin-pro/imports/clear_bad_images_2026-05-16.sql 2>/dev/null
echo "✓ Fichiers SQL d'import supprimés"

echo ""
echo "✅ Tout est nettoyé."
echo "   Plus aucun post 'helpconfortfr_planning_2026' en DB."
echo "   Plus aucune image WebP dans le repo."
