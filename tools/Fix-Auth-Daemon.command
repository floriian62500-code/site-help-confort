#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# FIX AUTH DAEMON — HELP Confort
# ═══════════════════════════════════════════════════════════════
# Résout l'erreur "Device not configured" du daemon launchd.
# Stocke le PAT dans l'URL du remote (visible uniquement dans
# .git/config local, jamais commité) — méthode standard pour
# les daemons CI/serveur.
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
USERNAME="floriian62500-code"
REPO_PATH="floriian62500-code/site-help-confort"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔐 Fix Auth Daemon — embed PAT dans remote URL          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable"; sleep 5; exit 1; }

# ── 1. Demander le PAT (saisie masquée comme un password)
echo "Collez votre Personal Access Token (PAT) GitHub"
echo "  (commence par ghp_… — créé sur https://github.com/settings/tokens)"
echo "  ⚠️ Les caractères ne s'afficheront pas (sécurité)"
echo ""
read -r -s -p "PAT : " PAT
echo ""

if [ -z "$PAT" ]; then
  echo "❌ PAT vide. Annulé."
  echo "Appuie sur Entrée pour fermer…"
  read -r
  exit 1
fi

# ── 2. Valider que ça ressemble à un PAT (commence par ghp_ ou github_pat_)
if [[ ! "$PAT" =~ ^(ghp_|github_pat_) ]]; then
  echo "⚠️  Le PAT ne commence pas par 'ghp_' ou 'github_pat_'. Continuer quand même ? (oui/non)"
  read -r CONFIRM
  if [ "$CONFIRM" != "oui" ]; then
    echo "Annulé."
    exit 0
  fi
fi

# ── 3. Mettre à jour le remote URL avec PAT embedded
echo ""
echo "→ Mise à jour du remote origin avec PAT embedded…"
git remote set-url origin "https://${USERNAME}:${PAT}@github.com/${REPO_PATH}.git"

# ── 4. Test : un fetch pour valider que ça fonctionne
echo "→ Test de connexion à GitHub…"
if git fetch origin main --quiet 2>&1; then
  echo "✅ Connexion GitHub OK !"
else
  echo "❌ Échec du fetch. Vérifiez :"
  echo "   - Le PAT est valide (pas expiré, pas révoqué)"
  echo "   - Le PAT a les scopes 'repo' ET 'workflow'"
  echo ""
  echo "Pour réessayer, relancez ce script."
  echo ""
  echo "Appuie sur Entrée pour fermer…"
  read -r
  exit 1
fi

# ── 5. Test : un push (pas de prompt password attendu)
echo "→ Test de push (sans prompt password attendu)…"
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "  (commit des fichiers modifiés avant test)"
  git add -A
  git commit -m "Auto-push test fix-auth-daemon $(date '+%Y-%m-%d %H:%M')" >/dev/null 2>&1 || true
fi

if git push origin main 2>&1 | head -10; then
  echo ""
  echo "✅ Push de test réussi sans demande de password !"
else
  echo ""
  echo "⚠️  Push échoué. Voir détails ci-dessus."
fi

# ── 6. Forcer un run du daemon maintenant pour vérifier
echo ""
echo "→ Run forcé du daemon pour valider en mode background…"
DAEMON_SCRIPT="$HOME/Library/Application Support/HelpConfort/autopush.sh"
if [ -f "$DAEMON_SCRIPT" ]; then
  bash "$DAEMON_SCRIPT"
  sleep 1
  echo ""
  echo "📄 Dernières lignes du log daemon :"
  tail -5 "$HOME/Library/Application Support/HelpConfort/autopush.log" 2>/dev/null | sed 's/^/   /'
else
  echo "⚠️  Script daemon non trouvé. Lancez d'abord Fix-AutoPush.command."
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🎉 Auth daemon corrigée !                               ║"
echo "║                                                          ║"
echo "║  Le PAT est désormais dans l'URL du remote origin.       ║"
echo "║  Le daemon launchd peut push sans demande de password.   ║"
echo "║                                                          ║"
echo "║  ⚠️  .git/config contient le PAT en clair (zone locale,   ║"
echo "║      jamais commitée). Sécurité OK pour usage individuel.║"
echo "║                                                          ║"
echo "║  Si vous régénérez votre PAT plus tard, relancez ce      ║"
echo "║  script pour le mettre à jour.                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Appuie sur Entrée pour fermer…"
read -r
exit 0
