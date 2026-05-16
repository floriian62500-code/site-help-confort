#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SETUP GIT AUTH — HELP Confort
# ═══════════════════════════════════════════════════════════════
# À LANCER UNE SEULE FOIS, après quoi Push-Express marchera tout
# seul sans GitHub Desktop.
#
# Ce script :
#   1. Active le credential.helper osxkeychain (utilise le trousseau
#      macOS pour stocker l'auth GitHub)
#   2. Force la pré-authentification en faisant un fetch (qui va
#      demander login/PAT une seule fois, puis le mémoriser)
#   3. Vérifie que tout est OK
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔐 Setup Git Auth — HELP Confort                       ║"
echo "║  (À lancer une seule fois)                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable"; sleep 5; exit 1; }

# ── 1. Activer credential.helper osxkeychain (local au repo + global)
echo "  ⚙️  Activation du credential.helper osxkeychain…"
git config --local credential.helper osxkeychain
git config --global credential.helper osxkeychain 2>/dev/null
echo "  ✅ credential.helper = osxkeychain"
echo ""

# ── 2. Vérifier user.name/email
NAME=$(git config user.name)
EMAIL=$(git config user.email)
if [ -z "$NAME" ] || [ -z "$EMAIL" ]; then
  echo "  ⚠️  user.name ou user.email manquant. Configuration…"
  [ -z "$NAME" ] && git config user.name "Florian Dhaillecourt"
  [ -z "$EMAIL" ] && git config user.email "florian.dhaillecourt@helpconfort.com"
fi
echo "  👤 Auteur : $(git config user.name) <$(git config user.email)>"
echo ""

# ── 3. Tester la connexion (1er fetch qui va demander l'auth si pas encore mémorisée)
echo "  🌐 Test de connexion à GitHub…"
echo "     Si une fenêtre demande tes identifiants :"
echo "       • Login : ton pseudo GitHub (floriian62500-code)"
echo "       • Password : un Personal Access Token (PAS le vrai"
echo "         mot de passe — GitHub ne l'accepte plus depuis 2021)"
echo ""
echo "     Comment générer un Personal Access Token (PAT) :"
echo "       1. https://github.com/settings/tokens/new"
echo "       2. Note : « Push depuis Mac Florian »"
echo "       3. Expiration : 1 an (ou No expiration)"
echo "       4. Scopes : cocher seulement « repo » (toutes les sous-cases)"
echo "       5. Generate token → copier le token affiché (ghp_xxxxx…)"
echo "       6. Le coller comme password quand Git demande"
echo ""
echo "  → Lancement du test fetch dans 4 sec…"
sleep 4

if git fetch origin 2>&1; then
  echo ""
  echo "  🎉 Connexion à GitHub OK ! Auth mémorisée dans le trousseau."
  echo ""
  echo "  ✅ Tu peux maintenant utiliser Push-Express.command sans GitHub Desktop."
  echo ""
else
  echo ""
  echo "  ❌ Connexion échouée."
  echo ""
  echo "  Vérifications :"
  echo "    1. Ton PAT a-t-il le scope 'repo' coché ?"
  echo "    2. As-tu bien collé le PAT (et pas ton mot de passe) ?"
  echo "    3. Le PAT n'a-t-il pas expiré ?"
  echo ""
  echo "  Pour effacer un mauvais identifiant mémorisé et recommencer :"
  echo "    Ouvrir « Trousseaux d'accès » (Spotlight → Trousseaux)"
  echo "    Chercher « github.com » → supprimer l'entrée"
  echo "    Relancer ce script"
  echo ""
fi

echo "──────────────────────────────────────────────────────────"
echo "  Appuie sur Entrée pour fermer…"
echo "──────────────────────────────────────────────────────────"
read -r
exit 0
