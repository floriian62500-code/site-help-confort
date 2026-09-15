#!/usr/bin/env bash
# start-e2e-local.sh — E2E LOCAL isolé en UNE commande (voie A). ZÉRO PROD.
# Réponse lot ChatGPT 5509915252. Fail-closed : ABORT si Docker absent, CLI absente,
# projet lié = PROD, ou cible API != localhost. Aucun --linked, aucun db push distant,
# aucun secret PROD, RESEND vide (0 email). Usage : bash scripts/test/start-e2e-local.sh
set -euo pipefail
cd "$(dirname "$0")/../.."   # racine repo

PROD_REF="btcbjwqiivhpwoszomhg"
abort(){ echo "❌ ABORT: $*" >&2; exit 3; }

echo "== 1/9 Docker =="
command -v docker >/dev/null 2>&1 || abort "Docker non installé."
docker info >/dev/null 2>&1 || abort "Démon Docker non démarré → ouvre Docker Desktop puis relance."

echo "== 2/9 Supabase CLI =="
command -v supabase >/dev/null 2>&1 || abort "Supabase CLI non installée."

echo "== 3/9 Garde anti-PROD (projet lié) =="
if [ -f supabase/.temp/project-ref ]; then
  LINKED="$(tr -d '[:space:]' < supabase/.temp/project-ref || true)"
  [ "$LINKED" = "$PROD_REF" ] && abort "projet lié = PROD ($PROD_REF). Refus."
fi

echo "== 4/9 supabase start (local seulement) =="
supabase start   # jamais --linked

echo "== 5/9 Garde : cible API doit être localhost =="
ENV_OUT="$(supabase status -o env 2>/dev/null || true)"
API_URL="$(printf '%s\n' "$ENV_OUT" | sed -nE 's/^API_URL="?([^"]+)"?/\1/p' | head -1)"
ANON="$(printf '%s\n' "$ENV_OUT" | sed -nE 's/^ANON_KEY="?([^"]+)"?/\1/p' | head -1)"
SRK="$(printf '%s\n' "$ENV_OUT" | sed -nE 's/^SERVICE_ROLE_KEY="?([^"]+)"?/\1/p' | head -1)"
DB_URL="$(printf '%s\n' "$ENV_OUT" | sed -nE 's/^DB_URL="?([^"]+)"?/\1/p' | head -1)"
case "$API_URL" in
  http://127.0.0.1:*|http://localhost:*) echo "   cible OK: $API_URL" ;;
  *) abort "API_URL='$API_URL' n'est pas localhost." ;;
esac
[ -n "$ANON" ] && [ -n "$SRK" ] && [ -n "$DB_URL" ] || abort "clés/URL locales introuvables (supabase status)."

echo "== 6/9 bootstrap.sql (LOCAL uniquement) =="
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/local-test/bootstrap.sql

echo "== 7/9 functions serve (env TEST, RESEND vide → 0 email) =="
printf 'SUPABASE_URL=%s\nSUPABASE_SERVICE_ROLE_KEY=%s\nRESEND_API_KEY=\n' "$API_URL" "$SRK" > supabase/local-test/functions.env
supabase functions serve --env-file supabase/local-test/functions.env >/tmp/hc-e2e-fns.log 2>&1 &
FN_PID=$!
trap 'kill "$FN_PID" 2>/dev/null || true' EXIT
sleep 7

echo "== 8/9 E2E (harnais + guard fail-closed) =="
set +e
LOCAL_SUPA="$API_URL" LOCAL_ANON="$ANON" node scripts/test/e2e-local.mjs
RC=$?
set -e

echo "== 9/9 purge fixtures LOCALES =="
psql "$DB_URL" -c "delete from public.leads where source ilike '%e2e%' or message ilike '%NE PAS TRAITER%';" || true

echo "----"
[ "$RC" = "0" ] && echo "✅ FULL_E2E_LOCAL=PASS" || echo "⚠️ E2E RC=$RC (voir /tmp/hc-e2e-fns.log)"
echo "Pour tout arrêter : supabase stop"
exit "$RC"
