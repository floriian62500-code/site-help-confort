#!/usr/bin/env bash
# Tests du préflight anti-injection. Sandbox isolée (aucun effet sur le repo réel).
set -u
PF="scripts/control/runner-preflight.sh"
SB="$(mktemp -d)"; trap 'rm -rf "$SB"' EXIT
mkdir -p "$SB/inbox" "$SB/outbox"
export PF_INBOX="$SB/inbox" PF_OUTBOX="$SB/outbox" PF_STOP="$SB/RUNNER_STOP"
export PF_BRANCH="recette"   # défaut des tests = sur recette (sauf test #6)
pass=0; fail=0
check(){ local name="$1" expect="$2" got; got="$(bash "$PF" 2>/dev/null | tail -1)"; 
  if echo "$got" | grep -q "$expect"; then echo "  ✅ $name → $got"; pass=$((pass+1));
  else echo "  ❌ $name → attendu '$expect', obtenu '$got'"; fail=$((fail+1)); fi; }

# 1. mauvais nom CP (format invalide)
rm -f "$SB/inbox"/* "$SB/RUNNER_STOP"; : > "$SB/inbox/CP-XX-bad.md"
check "mauvais nom CP" "SKIP aucun CP inbox valide"

# 2. instruction valide + auteur autorisé
rm -f "$SB/inbox"/*; : > "$SB/inbox/CP-9001-test-valide.md"
PF_TEST_AUTHOR_LOGIN="floriian62500-code" check "valide + auteur OK" "PROCESS"

# 3. mauvais auteur
PF_TEST_AUTHOR_LOGIN="attaquant-random" check "auteur non autorisé" "SKIP CP-9001 auteur non autorisé"

# 4. doublon déjà traité
: > "$SB/outbox/CP-9001.md"
PF_TEST_AUTHOR_LOGIN="floriian62500-code" check "doublon (outbox existe)" "SKIP CP-9001 déjà traité"
rm -f "$SB/outbox/CP-9001.md"

# 5. kill-switch présent
: > "$SB/RUNNER_STOP"
PF_TEST_AUTHOR_LOGIN="floriian62500-code" check "kill-switch" "SKIP kill-switch"
rm -f "$SB/RUNNER_STOP"

# 6. branche autre que recette => SKIP sûr
PF_BRANCH="main" PF_TEST_AUTHOR_LOGIN="floriian62500-code" check "branche non-recette (main)" "SKIP branche non-recette"

echo ""; echo "RÉSULTAT PRÉFLIGHT : $pass PASS / $fail FAIL"
exit $((fail>0?1:0))
