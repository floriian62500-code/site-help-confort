#!/bin/bash
# Garde-fou de WIP : quand la dérive dépasse un seuil, on n'ouvre plus de nouveau gros lot
# (contrôle CHATGPT-2026-09-24-RELEASE-CATCHUP-REVIEW-1, point 2).
#
#   bash scripts/tests/garde-wip.test.sh
#
# Tout se joue dans un dépôt temporaire : ni le vrai dépôt, ni le vrai verrou de session.
set -u
RACINE="$(cd "$(dirname "$0")/../.." && pwd)"      # résolu AVANT tout cd

BAC=$(mktemp -d "${TMPDIR:-/tmp}/garde-wip.XXXXXX")
trap 'rm -rf "$BAC"' EXIT
PASS=0; FAIL=0
ok() { PASS=$((PASS+1)); echo "  ✅ $1"; }
ko() { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }

# ── Bac à sable : un dépôt avec un `main` en retard, et de quoi mesurer la dérive
mkdir -p "$BAC/repo/scripts/release" "$BAC/repo/docs/release" "$BAC/support"
cp "$RACINE/scripts/release/derive.mjs" "$BAC/repo/scripts/release/derive.mjs"
cd "$BAC/repo"
git init -q -b main .
git config user.email test@local; git config user.name Test
echo base > f.txt; git add -A; git commit -q -m "base"
git checkout -q -b recette

release_vide() {
  cat > "$BAC/repo/docs/release/CURRENT-RELEASE.json" <<'JSON'
{ "statut": "AUCUNE_RELEASE_ACTIVE", "release_branch": null, "elements": [] }
JSON
}
release_active() {
  cat > "$BAC/repo/docs/release/CURRENT-RELEASE.json" <<'JSON'
{ "statut": "RELEASE_EN_COURS", "release_branch": "release/essai", "elements": [] }
JSON
}
avance() {  # $1 commits fonctionnels d'avance sur main
  for i in $(seq 1 "$1"); do echo "l$i" >> f.txt; git commit -q -am "feat: lot $i"; done
}

# Le script sous test, recâblé sur le bac à sable (verrou et dépôt temporaires)
SESSION="$BAC/worksession.sh"
sed -e "s#^REPO=\"/Users.*#REPO=\"$BAC/repo\"#" \
    -e "s#^SUPPORT=\"\$HOME.*#SUPPORT=\"$BAC/support\"#" \
    "$RACINE/scripts/ops/worksession.sh" > "$SESSION"
grep -q "REPO=\"$BAC/repo\"" "$SESSION" || { echo "❌ recâblage impossible (format inattendu)"; exit 1; }
lancer() { HC_REPO="$BAC/repo" HC_SUPPORT="$BAC/support" bash "$SESSION" "$@" >/dev/null 2>&1; }
verrou_pose() { [ -f "$BAC/support/autopush.worksession" ]; }

echo "GARDE-FOU DE WIP (bac à sable : $BAC)"

# ── 1. Sous le seuil : rien ne change, le travail s'ouvre normalement
release_vide
avance 3
lancer start "refonte de la page contact"; C=$?
{ [ "$C" = "0" ] && verrou_pose; } && ok "sous le seuil : un lot ordinaire s'ouvre (code 0)" \
  || ko "sous le seuil : un lot ordinaire s'ouvre" "code $C, verrou $(verrou_pose && echo posé || echo absent)"
lancer stop

# ── 2. Au-dessus du seuil : un gros lot ordinaire est refusé, et rien n'est posé
avance 35
lancer start "refonte de la page contact"; C=$?
{ [ "$C" = "3" ] && ! verrou_pose; } && ok "seuil franchi : le gros lot ordinaire est refusé (code 3), aucun verrou posé" \
  || ko "seuil franchi : refus attendu" "code $C, verrou $(verrou_pose && echo posé || echo absent)"

# La raison doit être lisible : un refus muet ne sert à personne.
SORTIE=$(HC_REPO="$BAC/repo" HC_SUPPORT="$BAC/support" bash "$SESSION" start "refonte page contact" 2>&1)
echo "$SORTIE" | grep -q "OUVERTURE REFUSÉE" && echo "$SORTIE" | grep -q "go-florian" \
  && ok "le refus dit pourquoi, et comment passer outre" \
  || ko "le refus doit être explicite" "sortie : $(echo "$SORTIE" | tr '\n' ' ' | cut -c1-90)"

# ── 3. Ce qui reste autorisé quand le seuil est franchi
for LIB in "P0 fuite de données" "P1 prix faux en ligne" "correctif bandeau" "secu jeton révoqué" \
           "release/rattrapage préparation" "retour arrière du lot 4"; do
  lancer start "$LIB"; C=$?
  { [ "$C" = "0" ] && verrou_pose; } && ok "autorisé malgré le seuil : « $LIB »" \
    || ko "devrait rester autorisé : « $LIB »" "code $C"
  lancer stop
done

# ── 4. L'autorisation explicite de Florian passe outre, par drapeau ou par variable
lancer start "refonte de la page contact" --go-florian; C=$?
{ [ "$C" = "0" ] && verrou_pose; } && ok "--go-florian ouvre le lot malgré le seuil" || ko "--go-florian doit ouvrir" "code $C"
lancer stop
HC_GO_FLORIAN=1 HC_REPO="$BAC/repo" HC_SUPPORT="$BAC/support" bash "$SESSION" start "refonte page contact" >/dev/null 2>&1; C=$?
{ [ "$C" = "0" ] && verrou_pose; } && ok "HC_GO_FLORIAN=1 ouvre le lot malgré le seuil" || ko "HC_GO_FLORIAN doit ouvrir" "code $C"
lancer stop

# ── 5. Une release corrective active lève le blocage : la sortie de crise a commencé
release_active
lancer start "refonte de la page contact"; C=$?
{ [ "$C" = "0" ] && verrou_pose; } && ok "release active : le blocage est levé" || ko "release active : devrait ouvrir" "code $C"
lancer stop
release_vide

# ── 6. Mesure impossible : on avertit, on ne bloque pas (une référence absente n'est pas une dérive)
git branch -m main main-renommee
SORTIE=$(HC_REPO="$BAC/repo" HC_SUPPORT="$BAC/support" bash "$SESSION" start "refonte page contact" 2>&1); C=$?
{ [ "$C" = "0" ] && verrou_pose; } && ok "dérive non mesurable : le lot s'ouvre (on ne bloque pas sur un « je ne sais pas »)" \
  || ko "dérive non mesurable : devrait ouvrir" "code $C"
echo "$SORTIE" | grep -q "non mesurable" && ok "et le dit clairement" || ko "l'avertissement doit être visible" "$(echo "$SORTIE" | tr '\n' ' ' | cut -c1-80)"
lancer stop
git branch -m main-renommee main

# ── 7. La garde ne touche pas au reste du verrou
avance 5
lancer start "P0 vérification"; lancer renew; C=$?
[ "$C" = "0" ] && ok "renew n'est pas soumis à la garde (un lot en cours doit pouvoir durer)" || ko "renew doit rester libre" "code $C"
lancer stop
lancer status; [ "$?" = "0" ] && ok "status reste consultable sans verrou" || ko "status doit répondre" "code non nul"

# ── 8. Interrupteur pour les cas où la mesure n'a pas de sens (tests, machine hors ligne)
HC_GARDE_WIP=0 HC_REPO="$BAC/repo" HC_SUPPORT="$BAC/support" bash "$SESSION" start "refonte page contact" >/dev/null 2>&1; C=$?
[ "$C" = "0" ] && ok "HC_GARDE_WIP=0 désactive la garde (échappatoire documentée)" || ko "l'interrupteur doit marcher" "code $C"
lancer stop

echo ""
echo "RÉSULTAT GARDE WIP : $PASS PASS / $FAIL FAIL"
echo ""
[ "$FAIL" = "0" ] || exit 1
