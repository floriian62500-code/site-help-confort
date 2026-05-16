#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# import-pubs-hc-fr.sh — Importe les 55 publications HC France en DB
# ═══════════════════════════════════════════════════════════════════════════
# Lance UNE FOIS : bash scripts/import-pubs-hc-fr.sh
#
# Le script :
#  1. Lit le fichier SQL admin-pro/imports/import_55_publications_2026-05-16.sql
#  2. Envoie via psql vers la DB Supabase distante
#  3. Affiche le compteur final
# ═══════════════════════════════════════════════════════════════════════════
set -e

PROJECT_REF="btcbjwqiivhpwoszomhg"
SQL_FILE="/Users/HP/Documents/Claude/Projects/SITE INTERNET/admin-pro/imports/import_55_publications_2026-05-16.sql"
ENV_FILE="$HOME/.helpconfort/phase2.env"

echo "📂 SQL : $SQL_FILE"
[ -f "$SQL_FILE" ] || { echo "❌ Fichier SQL introuvable"; exit 1; }

# ─── Récupère le DB password ───
DB_PASSWORD=""
if [ -f "$ENV_FILE" ]; then
  DB_PASSWORD=$(grep -E '^SUPABASE_DB_PASSWORD|^DB_PASSWORD' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "$DB_PASSWORD" ]; then
  echo ""
  echo "🔑 Besoin du mot de passe DB Postgres (1x — il sera sauvegardé)"
  echo "   À récupérer : https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
  echo ""
  read -s -p "DB Password : " DB_PASSWORD
  echo ""
  # Sauve pour la prochaine fois
  mkdir -p "$(dirname "$ENV_FILE")"
  if [ -f "$ENV_FILE" ]; then
    grep -v '^SUPABASE_DB_PASSWORD' "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"
  fi
  echo "SUPABASE_DB_PASSWORD=$DB_PASSWORD" >> "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "✓ Password sauvegardé dans $ENV_FILE (chmod 600)"
fi

# ─── URL-encode le password pour psql ───
DB_PASSWORD_ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$DB_PASSWORD")

# ─── Connexion : ipv4 pooler (plus stable que direct) ───
CONN_URL="postgres://postgres.$PROJECT_REF:$DB_PASSWORD_ENCODED@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"

echo ""
echo "🚀 Connexion à la DB et exécution du SQL…"

# Test connexion d'abord
if ! psql "$CONN_URL" -c "select 1" > /dev/null 2>&1; then
  echo "❌ Échec connexion via pooler eu-west-3. Test direct…"
  CONN_URL="postgres://postgres:$DB_PASSWORD_ENCODED@db.$PROJECT_REF.supabase.co:5432/postgres"
  if ! psql "$CONN_URL" -c "select 1" > /dev/null 2>&1; then
    echo "❌ Échec connexion directe aussi."
    echo "   → Mot de passe DB probablement incorrect."
    echo "   → Réinitialise-le ici : https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
    echo "   → Puis relance le script"
    rm -f "$ENV_FILE" 2>/dev/null
    exit 1
  fi
fi
echo "✓ Connexion OK"

# ─── Exécute le SQL d'import ───
echo ""
echo "📥 Import des 55 publications…"
psql "$CONN_URL" -f "$SQL_FILE" -v ON_ERROR_STOP=1

echo ""
echo "✅ Import terminé"
echo ""
echo "👉 Ouvre : https://depan59-62.fr/admin-pro/realisations.html"
echo "   Onglet ACTUS → tu vois les 55 posts en attente de validation"
