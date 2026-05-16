#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Deploy notify-lead + weekly-recap — script tout-en-un
# Date : 2026-05-16
# ═══════════════════════════════════════════════════════════════════════════
# Lancer depuis le dossier projet :
#   cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
#   bash scripts/deploy-notify-functions.sh
# ═══════════════════════════════════════════════════════════════════════════

set -u  # exit si variable non définie (pas -e car on veut continuer après erreurs douces)

PROJECT_REF="btcbjwqiivhpwoszomhg"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo -e "\n${BOLD}${BLUE}━━━━ $1 ━━━━${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; }

cd "$(dirname "$0")/.." || { err "Impossible de cd au dossier projet"; exit 1; }
echo -e "${BOLD}📂 Dossier projet :${NC} $(pwd)"
echo -e "${BOLD}🔗 Projet Supabase :${NC} $PROJECT_REF\n"

# ─── Étape 1 : Vérifie que les fonctions existent localement ────────────
step "1/6 — Vérification des sources"
for fn in notify-lead weekly-recap; do
  if [ -f "supabase/functions/$fn/index.ts" ]; then
    ok "supabase/functions/$fn/index.ts trouvé"
  else
    err "supabase/functions/$fn/index.ts MANQUANT"
    exit 1
  fi
done

# ─── Étape 2 : Liste les secrets ────────────────────────────────────────
step "2/6 — Vérification des secrets Supabase"
SECRETS_OUTPUT=$(supabase secrets list --project-ref "$PROJECT_REF" 2>&1)
echo "$SECRETS_OUTPUT"
if echo "$SECRETS_OUTPUT" | grep -q "RESEND_API_KEY"; then
  ok "RESEND_API_KEY présent"
else
  warn "RESEND_API_KEY ABSENT — les emails ne partiront pas."
  warn "Pour l'ajouter :"
  warn "  supabase secrets set RESEND_API_KEY=re_xxxxxx --project-ref $PROJECT_REF"
  read -r -p "Continuer quand même ? [o/N] " ans
  [ "$ans" != "o" ] && [ "$ans" != "O" ] && exit 1
fi

# ─── Étape 3 : Deploy notify-lead ───────────────────────────────────────
step "3/6 — Déploiement notify-lead (avec --no-verify-jwt)"
if supabase functions deploy notify-lead --no-verify-jwt --project-ref "$PROJECT_REF"; then
  ok "notify-lead déployé"
else
  err "Échec deploy notify-lead — vérifie l'erreur ci-dessus"
  exit 1
fi

# ─── Étape 4 : Deploy weekly-recap ──────────────────────────────────────
step "4/6 — Déploiement weekly-recap"
if supabase functions deploy weekly-recap --project-ref "$PROJECT_REF"; then
  ok "weekly-recap déployé"
else
  err "Échec deploy weekly-recap — vérifie l'erreur ci-dessus"
  exit 1
fi

# ─── Étape 5 : Migration cron ───────────────────────────────────────────
step "5/6 — Migration pg_cron (20260516120000_cron_weekly_recap.sql)"
echo -e "${YELLOW}⚠ Cette étape pousse la migration en DB. Annule maintenant si tu n'as pas committé tes autres migrations en attente.${NC}"
read -r -p "Appliquer la migration ? [o/N] " ans
if [ "$ans" = "o" ] || [ "$ans" = "O" ]; then
  # db push n'accepte pas --project-ref (utilise le projet linké automatiquement)
  if supabase db push; then
    ok "Migration appliquée"
  else
    warn "supabase db push a échoué — applique manuellement via SQL Editor :"
    warn "  https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    warn "Contenu : supabase/migrations/20260516120000_cron_weekly_recap.sql"
  fi
else
  warn "Migration sautée — applique-la manuellement via SQL Editor :"
  warn "  https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
fi

# ─── Étape 6 : Rappels manuels ──────────────────────────────────────────
step "6/6 — Étapes manuelles restantes (SQL Editor)"
cat <<'EOF'
Va sur :
  https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/sql/new

Et exécute (1 SEULE FOIS, remplace <SERVICE_ROLE_KEY> par la clé secret
récupérée sur https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/settings/api ) :

  alter system set app.settings.supabase_url = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  alter system set app.settings.service_role_key = '<SERVICE_ROLE_KEY>';
  select pg_reload_conf();

Puis vérifie que le cron est actif :

  select jobname, schedule, active from cron.job where jobname = 'weekly-recap-monday-8am';

→ doit retourner :  weekly-recap-monday-8am | 0 6 * * 1 | t

Pour tester immédiatement weekly-recap (envoi forcé) :

  select net.http_post(
    url     := 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/weekly-recap',
    headers := jsonb_build_object('Content-Type','application/json',
               'Authorization','Bearer ' || current_setting('app.settings.service_role_key', true)),
    body    := '{"force": true}'::jsonb
  );

Pour tester notify-lead :
- Ouvre https://depan59-62.fr/contact.html, remplis avec tes vraies coordonnées
- Tu reçois l'email <30s sur saint-omer@helpconfort.com

EOF

ok "Script terminé. Suis les instructions ci-dessus pour finaliser."
echo ""
echo "Voir les logs en live :"
echo "  supabase functions logs notify-lead --tail --project-ref $PROJECT_REF"
echo "  supabase functions logs weekly-recap --tail --project-ref $PROJECT_REF"
