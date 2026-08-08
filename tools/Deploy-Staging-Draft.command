#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Deploy-Staging-Draft.command
# Déploie la branche d'intégration sur Netlify en mode DRAFT (preview).
#
# GARANTIE : NE MODIFIE JAMAIS LA PRODUCTION.
#   - Aucun "--prod" n'est utilisé (impossible de publier le site live).
#   - Un deploy DRAFT crée une URL de permalien unique
#     (https://<deploy-id>--remarkable-dragon-364e2b.netlify.app)
#     sans changer le deploy "published" servi sur https://depan59-62.fr.
#
# Pré-requis : token Netlify (nfp_...) dans tools/.netlify-access-token
#   (fichier exclu du déploiement et du dépôt).
#
# Usage : ./tools/Deploy-Staging-Draft.command   (ou double-clic)
# Créé le 2026-08-02 — recette Lot 1/2 avant mise en prod.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
SITE_ID="remarkable-dragon-364e2b"
TOKEN_FILE="$REPO/tools/.netlify-access-token"
PUBDIR="$(mktemp -d /tmp/hc-staging-pub.XXXXXX)"

cleanup() { rm -rf "$PUBDIR"; }
trap cleanup EXIT

echo "══════════════════════════════════════════════════════════════"
echo "  🧪 HELP Confort — Deploy STAGING (Netlify DRAFT — prod intacte)"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── 1. Token (jamais affiché) ──
if [ ! -f "$TOKEN_FILE" ]; then
  echo "❌ Token absent : tools/.netlify-access-token"
  echo "   Génère-le sur https://app.netlify.com/user/applications#personal-access-tokens"
  exit 1
fi
NETLIFY_AUTH_TOKEN="$(tr -d '\n\r ' < "$TOKEN_FILE")"
[ -n "$NETLIFY_AUTH_TOKEN" ] || { echo "❌ Token vide dans $TOKEN_FILE"; exit 1; }
export NETLIFY_AUTH_TOKEN

# ── 2. Contexte git (informatif) ──
cd "$REPO"
BRANCH="$(git branch --show-current 2>/dev/null || echo '?')"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo '?')"
echo "▶ Contenu déployé : branche $BRANCH @ $COMMIT"

# ── 3. Répertoire de publication (exclusions sécurité validées) ──
echo "▶ Copie du contenu déployable (exclusions de sécurité)…"
rsync -a \
  --exclude='.git/' --exclude='.github/' --exclude='.autopush/' \
  --exclude='.helpconfort/' --exclude='.claude/' \
  --exclude='.DS_Store' --exclude='.agent1-lock' --exclude='.test-rm-perm' \
  --exclude='.env' --exclude='.env.*' --exclude='.gitignore' \
  --exclude='secrets/' --exclude='tools/' --exclude='scripts/' \
  --exclude='logs/' --exclude='docs/' --exclude='supabase/' \
  --exclude='audits/' --exclude='images/_backup_*/' \
  --exclude='*.md' --exclude='*.command' --exclude='*.docx' \
  --exclude='*.xlsx' --exclude='*.py' --exclude='*.log' \
  "$REPO/" "$PUBDIR/"

# ── 4. Garde-fou anti-fuite : abandon si un secret subsiste ──
if find "$PUBDIR" \( -name '.env' -o -name '.env.*' -o -name '*.pem' \
     -o -path '*/secrets/*' -o -name '.netlify-access-token' \
     -o -name '*service_account*.json' \) 2>/dev/null | grep -q .; then
  echo "❌ ABANDON : fichier sensible détecté dans le contenu à déployer."
  exit 1
fi
echo "  ✓ $(find "$PUBDIR" -type f | wc -l | tr -d ' ') fichiers, aucun secret détecté"

# ── 5. Déploiement DRAFT (JAMAIS --prod) ──
echo "▶ Déploiement Netlify DRAFT (npx netlify-cli)…"
OUT="$(npx --yes netlify-cli deploy \
  --dir="$PUBDIR" \
  --site="$SITE_ID" \
  --alias="recette-lot12" \
  --no-build \
  --message="staging draft $BRANCH @ $COMMIT" \
  --json)"

DRAFT_URL="$(printf '%s' "$OUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log(j.deploy_url||"")}catch(e){console.log("")}})')"
DEPLOY_ID="$(printf '%s' "$OUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log(j.deploy_id||j.deployId||"")}catch(e){console.log("")}})')"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ✅ DRAFT déployé — PRODUCTION NON MODIFIÉE"
echo "  URL preview : ${DRAFT_URL:-<voir sortie ci-dessus>}"
echo "  Deploy ID   : ${DEPLOY_ID:-?}"
echo "══════════════════════════════════════════════════════════════"
