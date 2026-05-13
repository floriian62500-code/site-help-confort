#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# CHANGE DOMAIN — HELP! Confort → Dépan'59-62
# ═══════════════════════════════════════════════════════════════
# Lance ce script UNIQUEMENT quand votre nouveau domaine est acheté
# et que vous voulez basculer toutes les URLs canoniques.
#
# Avant de lancer :
#   1. Achetez depan-59-62.fr (ou un autre nom si vous changez d'avis)
#   2. Configurez le DNS pour pointer vers Netlify
#   3. Dans Netlify : ajoutez le custom domain
#   4. Une fois le domaine répondant, lancez ce script
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
OLD_DOMAIN="helpconfort-saintomer.fr"
NEW_DOMAIN_DEFAULT="depan-59-62.fr"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔀 Change Domain — HELP! Confort                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable"; sleep 5; exit 1; }

# Demander le nouveau domaine
echo "Domaine actuel  : $OLD_DOMAIN"
echo ""
read -r -p "Nouveau domaine (Entrée pour utiliser '$NEW_DOMAIN_DEFAULT') : " NEW_DOMAIN
if [ -z "$NEW_DOMAIN" ]; then
  NEW_DOMAIN="$NEW_DOMAIN_DEFAULT"
fi
NEW_DOMAIN=$(echo "$NEW_DOMAIN" | sed 's|https\?://||' | sed 's|www\.||' | sed 's|/$||')

echo ""
echo "→ Remplacement : $OLD_DOMAIN → $NEW_DOMAIN"
echo ""

# Compter avant
TOTAL_AVANT=$(grep -rEc "$OLD_DOMAIN" --include="*.html" --include="*.xml" --include="*.txt" --include="*.json" --include="*.md" . 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')
echo "Occurrences trouvées dans le repo : $TOTAL_AVANT"
echo ""

read -r -p "Confirmer le remplacement ? (oui/non) : " CONFIRM
if [ "$CONFIRM" != "oui" ]; then
  echo "Annulé."
  exit 0
fi

# Backup le sitemap au cas où
cp sitemap.xml "sitemap.xml.backup-$(date +%Y%m%d-%H%M%S)"

# Faire le remplacement
echo ""
echo "→ Remplacement en cours…"

# Tous les fichiers HTML / XML / TXT / JSON / MD
find . \( -name "*.html" -o -name "*.xml" -o -name "*.txt" -o -name "*.json" -o -name "*.md" \) \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -not -path "./tools/*backup*" \
  -exec sed -i.bak "s|$OLD_DOMAIN|$NEW_DOMAIN|g" {} \;

# Nettoyer les fichiers .bak créés par sed
find . -name "*.bak" -not -path "./.git/*" -delete 2>/dev/null

# Vérifier
TOTAL_APRES=$(grep -rEc "$OLD_DOMAIN" --include="*.html" --include="*.xml" --include="*.txt" --include="*.json" --include="*.md" . 2>/dev/null | awk -F: '{s+=$2} END {print s+0}')

echo "Occurrences restantes après : $TOTAL_APRES"

if [ "$TOTAL_APRES" -eq 0 ]; then
  echo "✅ Remplacement complet réussi !"
else
  echo "⚠️  Il reste $TOTAL_APRES occurrences — peut être normal si dans .git/, README ou cas particulier."
fi

echo ""
echo "──────────────────────────────────────────────────────────"
echo "  Prochaines étapes :"
echo "  1. Vérifier visuellement avec votre éditeur que les URLs sont OK"
echo "  2. Le daemon auto-push poussera dans la minute"
echo "  3. Netlify redéploiera automatiquement"
echo "  4. Vérifier https://$NEW_DOMAIN dans 5 minutes"
echo "──────────────────────────────────────────────────────────"
echo ""
echo "Appuie sur Entrée pour fermer…"
read -r
exit 0
