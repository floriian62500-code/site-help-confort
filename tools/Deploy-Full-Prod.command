#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Deploy-Full-Prod.command
# Deploy automatisé du site HELP Confort vers Netlify PROD.
# Ne dépend PAS de GitHub — pousse directement le contenu local.
#
# USAGE : double-clique ce fichier.
#
# PRÉ-REQUIS (une seule fois) :
#   1. Va sur https://app.netlify.com/user/applications#personal-access-tokens
#   2. "New access token" → nom "HC Deploy Prod" → Generate
#   3. Copie le token
#   4. Colle-le dans le fichier tools/.netlify-access-token (crée le fichier si absent)
#      Exemple : echo "nfp_xxxxxxxxxxxxx" > tools/.netlify-access-token
#
# Créé le 2026-07-25 pour automatiser les deploys sans dépendance GitHub.
# ═══════════════════════════════════════════════════════════════

set -e

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
SITE_ID="remarkable-dragon-364e2b"
TOKEN_FILE="$REPO/tools/.netlify-access-token"
ZIP_TMP="/tmp/hc-deploy-$(date +%s).zip"

cd "$REPO"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  🚀 HELP Confort — Deploy PROD via Netlify API"
echo "══════════════════════════════════════════════════════════════"
echo ""

# ── 1. Vérification token ──
if [ ! -f "$TOKEN_FILE" ]; then
  echo "❌ Fichier de token manquant : tools/.netlify-access-token"
  echo ""
  echo "Procédure une-fois :"
  echo "  1. Va sur https://app.netlify.com/user/applications#personal-access-tokens"
  echo "  2. Clique 'New access token' → nom 'HC Deploy Prod' → Generate"
  echo "  3. Copie le token qui s'affiche"
  echo "  4. Colle-le ici quand demandé :"
  echo ""
  read -p "Token Netlify (nfp_...) : " NETLIFY_TOKEN
  if [ -z "$NETLIFY_TOKEN" ]; then
    echo "❌ Aucun token fourni. Annulation."
    exit 1
  fi
  echo "$NETLIFY_TOKEN" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  echo "✓ Token sauvegardé dans $TOKEN_FILE"
fi

NETLIFY_TOKEN=$(cat "$TOKEN_FILE" | tr -d '\n\r ')
if [ -z "$NETLIFY_TOKEN" ]; then
  echo "❌ Token vide dans $TOKEN_FILE"
  exit 1
fi

# ── 2. Génération du ZIP (exclusions sécurité) ──
echo "▶ Génération du ZIP (exclusions sécurité)..."
rm -f "$ZIP_TMP"
zip -qr "$ZIP_TMP" . \
  -x "*.DS_Store*" \
  -x ".agent1-lock" \
  -x ".env*" \
  -x ".gitignore" \
  -x ".git/*" \
  -x ".github/*" \
  -x ".autopush/*" \
  -x ".helpconfort/*" \
  -x ".test-rm-perm" \
  -x "secrets/*" \
  -x "tools/*" \
  -x "scripts/*" \
  -x "logs/*" \
  -x "docs/*" \
  -x "supabase/*" \
  -x "*.md" \
  -x "*.command" \
  -x "*.docx" \
  -x "*.xlsx" \
  -x "*.py" \
  -x "**/audits/*" \
  -x "images/_backup_*/*" \
  -x "*.log"

ZIP_SIZE=$(du -h "$ZIP_TMP" | cut -f1)
echo "  ✓ ZIP créé : $ZIP_TMP ($ZIP_SIZE)"
echo ""

# ── 3. Upload vers Netlify API ──
echo "▶ Upload vers Netlify (site: $SITE_ID)..."
RESPONSE=$(curl -sS -X POST \
  -H "Authorization: Bearer $NETLIFY_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary "@$ZIP_TMP" \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys")

DEPLOY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOY_URL=$(echo "$RESPONSE" | grep -o '"deploy_ssl_url":"[^"]*"' | head -1 | cut -d'"' -f4)
STATE=$(echo "$RESPONSE" | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DEPLOY_ID" ]; then
  echo ""
  echo "❌ Erreur Netlify. Réponse :"
  echo "$RESPONSE" | head -c 500
  echo ""
  echo ""
  echo "Vérifie que ton token Netlify est valide."
  read -p "Appuie Entrée pour fermer..."
  exit 1
fi

echo "  ✓ Deploy créé : $DEPLOY_ID"
echo "  ✓ État initial : $STATE"
echo ""

# ── 4. Attente que le deploy soit ready ──
echo "▶ Attente publication (30-90 sec)..."
for i in {1..30}; do
  sleep 3
  STATE=$(curl -sS -H "Authorization: Bearer $NETLIFY_TOKEN" \
    "https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys/${DEPLOY_ID}" \
    | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "  Tentative $i/30 · état: $STATE"
  if [ "$STATE" = "ready" ]; then
    break
  fi
  if [ "$STATE" = "error" ]; then
    echo "❌ Erreur pendant la publication Netlify."
    break
  fi
done

# ── 5. Nettoyage ──
rm -f "$ZIP_TMP"

echo ""
echo "══════════════════════════════════════════════════════════════"
if [ "$STATE" = "ready" ]; then
  echo "  ✅ DEPLOY RÉUSSI"
  echo "  URL prod : https://www.depan59-62.fr"
  echo "  Preview deploy : $DEPLOY_URL"
  echo "  Deploy ID : $DEPLOY_ID"
else
  echo "  ⚠ Deploy créé mais état = $STATE (vérifier Netlify dashboard)"
  echo "  Preview deploy : $DEPLOY_URL"
fi
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Appuie Entrée pour fermer..."
read
