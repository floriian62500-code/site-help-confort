#!/bin/bash
# Garde-fous du démon auto-push (directive 5732805778), joués dans un bac à sable :
# dépôt temporaire + remote locale, jamais le vrai dépôt ni GitHub.
#
#   bash scripts/tests/autopush.test.sh [chemin/vers/autopush.sh]
#
# Par défaut : ~/Library/Application Support/HelpConfort/autopush.sh
set -u
SRC="${1:-$HOME/Library/Application Support/HelpConfort/autopush.sh}"
[ -f "$SRC" ] || { echo "❌ script introuvable : $SRC"; exit 1; }

BAC=$(mktemp -d "${TMPDIR:-/tmp}/autopush-test.XXXXXX")
trap 'rm -rf "$BAC"' EXIT
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "  ✅ $1"; }
ko()  { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }

# ── Bac à sable : une « remote » locale + une copie de travail
git init -q --bare "$BAC/remote.git"
git init -q -b recette "$BAC/repo"
cd "$BAC/repo"
git config user.email test@local; git config user.name Test
echo v1 > fichier.txt; git add -A; git commit -q -m init
git push -q "$BAC/remote.git" HEAD:recette
git push -q "$BAC/remote.git" HEAD:main

# ── Script sous test, recâblé sur le bac à sable (aucune authentification réseau)
mkdir -p "$BAC/support"
sed -e "s#^REPO=.*#REPO=\"$BAC/repo\"#" \
    -e "s#^REMOTE_URL=.*#REMOTE_URL=\"$BAC/remote.git\"#" \
    -e "s#^SUPPORT=.*#SUPPORT=\"$BAC/support\"#" \
    -e "s#^DEBOUNCE=.*#DEBOUNCE=0#" \
    -e "s#git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \"\$@\"#git \"\$@\"#" \
    "$SRC" > "$BAC/autopush.sh"
chmod +x "$BAC/autopush.sh"
LOG="$BAC/support/autopush.log"
run() { bash "$BAC/autopush.sh" "$@" >/dev/null 2>&1; }
distant() { git -C "$BAC/remote.git" rev-parse "$1" 2>/dev/null; }

echo "Garde-fous auto-push (bac à sable : $BAC)"

# 1. Cycle nominal : modification → commit → push sur recette
echo v2 > fichier.txt
run
[ "$(distant recette)" = "$(git rev-parse HEAD)" ] && ok "cycle réel : modification committée puis poussée sur recette" \
  || ko "cycle réel" "distant=$(distant recette) local=$(git rev-parse HEAD)"
git log -1 --pretty=%s | grep -q '^chore(auto): sauvegarde automatique' \
  && ok "message de commit explicite (repérable dans l'historique)" || ko "message de commit" "$(git log -1 --pretty=%s)"

# 2. Jamais main : sur une branche hors liste blanche, aucune action
MAIN_AVANT=$(distant main)
git checkout -q main 2>/dev/null || git checkout -q -b main
HEAD_AVANT=$(git rev-parse HEAD)
echo danger > fichier.txt
run
[ "$(distant main)" = "$MAIN_AVANT" ] && [ "$(git rev-parse HEAD)" = "$HEAD_AVANT" ] \
  && ok "branche main : aucun commit, aucun push (liste blanche)" || ko "branche main" "distant=$(distant main) attendu=$MAIN_AVANT head=$(git rev-parse --short HEAD)"
grep -q '⛔ branche « main » hors périmètre' "$LOG" && ok "refus journalisé pour la branche main" || ko "refus journalisé" "absent du journal"
git checkout -q -- . ; git checkout -q recette

# 3. Divergence : jamais de force-push
git push -q "$BAC/remote.git" HEAD:recette 2>/dev/null
# quelqu'un d'autre pousse un commit que la copie locale n'a pas
git clone -q "$BAC/remote.git" "$BAC/autre" -b recette
( cd "$BAC/autre" && git config user.email a@b && git config user.name Autre && echo ailleurs > autre.txt && git add -A && git commit -q -m "commit distant" && git push -q origin recette )
DIV_AVANT=$(distant recette)
echo v3 > fichier.txt
run
[ "$(distant recette)" = "$DIV_AVANT" ] && ok "branche divergée : le distant n'est pas écrasé (aucun force-push)" \
  || ko "divergence" "le distant a été réécrit"
grep -q 'a divergé du distant' "$LOG" && ok "divergence signalée pour intervention humaine" || ko "divergence signalée" "absent du journal"
grep -vE '^\s*#' "$SRC" | grep -qE '\-\-force|force-with-lease' && ko "aucun force dans le script" "trouvé hors commentaire" || ok "aucun --force / --force-with-lease dans le code"

# 4. Jamais de migration Supabase appliquée
grep -vE '^\s*#' "$SRC" | grep -q 'supabase db push' && ko "aucun déploiement Supabase automatique" "trouvé" || ok "aucun déploiement Supabase automatique"

# 5. Aucun secret dans le script
grep -vE '^\s*#' "$SRC" | grep -qE 'gh(p|o|u|s|r)_[A-Za-z0-9]{20,}|password|token=' && ko "aucun secret en clair" "motif trouvé" || ok "aucun secret en clair dans le script"
grep -q 'gh auth git-credential' "$SRC" && ok "authentification déléguée à gh (trousseau macOS)" || ko "authentification gh" "absente"

# 6. Kill-switch
git push -q "$BAC/remote.git" HEAD:recette 2>/dev/null || true
touch "$BAC/support/autopush.off"
echo v4 > fichier.txt
AVANT=$(git rev-parse HEAD)
run
[ "$(git rev-parse HEAD)" = "$AVANT" ] && ok "kill-switch : plus aucun commit ni push tant que le fichier existe" || ko "kill-switch" "a quand même committé"
rm "$BAC/support/autopush.off"

# 7. Verrou : deux exécutions simultanées, une seule agit
mkdir -p "$BAC/support/autopush.lock"           # verrou déjà pris
run
[ "$(git rev-parse HEAD)" = "$AVANT" ] && ok "verrou pris : l'exécution concurrente ne fait rien" || ko "verrou" "a agi malgré le verrou"
rmdir "$BAC/support/autopush.lock"

# 8. Opération git en cours : on ne touche à rien
touch "$BAC/repo/.git/MERGE_HEAD"
run
[ "$(git rev-parse HEAD)" = "$AVANT" ] && ok "merge en cours : aucune action" || ko "merge en cours" "a agi"
rm "$BAC/repo/.git/MERGE_HEAD"

# 9. Anti-rebond : avec le réglage réel, une édition récente n'est pas committée
sed -e "s#^DEBOUNCE=.*#DEBOUNCE=180#" "$BAC/autopush.sh" > "$BAC/autopush-deb.sh"
rm -f "$BAC/support/autopush.state"
echo v5 > fichier.txt
bash "$BAC/autopush-deb.sh" >/dev/null 2>&1
[ "$(git rev-parse HEAD)" = "$AVANT" ] && ok "anti-rebond : une modification fraîche attend la stabilité (180 s)" || ko "anti-rebond" "a committé immédiatement"

echo
echo "RÉSULTAT GARDE-FOUS AUTO-PUSH : $PASS PASS / $FAIL FAIL"
[ "$FAIL" = "0" ] || exit 1
