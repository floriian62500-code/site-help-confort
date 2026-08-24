#!/usr/bin/env bash
# Tests des gardes runner (préflight + postflight). Sandbox isolée, aucun effet sur le repo réel.
set -u
PF="scripts/control/runner-preflight.sh"
POST="scripts/control/runner-postflight.sh"
SB="$(mktemp -d)"; trap 'rm -rf "$SB"' EXIT
mkdir -p "$SB/inbox" "$SB/outbox"
export PF_INBOX="$SB/inbox" PF_OUTBOX="$SB/outbox" PF_STOP="$SB/RUNNER_STOP" PF_BRANCH="recette"
pass=0; fail=0
check(){ local name="$1" expect="$2" got; got="$(bash "$PF" 2>/dev/null | tail -1)";
  if echo "$got" | grep -q "$expect"; then echo "  ✅ PREFLIGHT $name → $got"; pass=$((pass+1));
  else echo "  ❌ PREFLIGHT $name → attendu '$expect', obtenu '$got'"; fail=$((fail+1)); fi; }
checkpost(){ local name="$1" expect="$2"; shift 2; local got; got="$(env "$@" bash "$POST" 2>/dev/null | tail -1)";
  if echo "$got" | grep -q "$expect"; then echo "  ✅ POSTFLIGHT $name → $got"; pass=$((pass+1));
  else echo "  ❌ POSTFLIGHT $name → attendu '$expect', obtenu '$got'"; fail=$((fail+1)); fi; }

echo "— PRÉFLIGHT —"
# 1. mauvais nom
rm -f "$SB/inbox"/* "$SB/RUNNER_STOP"; : > "$SB/inbox/CP-XX-bad.md"
check "mauvais nom CP" "SKIP aucun CP inbox valide"
# 2. valide + auteur OK + commit control-only
rm -f "$SB/inbox"/*; : > "$SB/inbox/CP-9001-test-valide.md"
PF_TEST_AUTHOR_LOGIN="floriian62500-code" PF_COMMIT_FILES="docs/control/inbox/chatgpt/CP-9001-test-valide.md" check "valide + auteur OK" "PROCESS"
# 3. mauvais auteur
PF_TEST_AUTHOR_LOGIN="attaquant-random" check "auteur non autorisé" "SKIP CP-9001 auteur non autorisé"
# 4. doublon
: > "$SB/outbox/CP-9001.md"
PF_TEST_AUTHOR_LOGIN="floriian62500-code" check "doublon (outbox existe)" "SKIP CP-9001 déjà traité"
rm -f "$SB/outbox/CP-9001.md"
# 5. kill-switch
: > "$SB/RUNNER_STOP"
PF_TEST_AUTHOR_LOGIN="floriian62500-code" check "kill-switch" "SKIP kill-switch"
rm -f "$SB/RUNNER_STOP"
# 6. branche non-recette
PF_BRANCH="main" PF_TEST_AUTHOR_LOGIN="floriian62500-code" check "branche non-recette" "SKIP branche non-recette"
# 7. commit mélange control + applicatif
PF_TEST_AUTHOR_LOGIN="floriian62500-code" PF_COMMIT_FILES=$'docs/control/inbox/chatgpt/CP-9001-test-valide.md\nindex.html' check "commit mélangé (CP + code)" "SKIP CP-9001 commit mélange"

echo "— POSTFLIGHT —"
STAT="$SB/status.json"; echo '{"ok":true}' > "$STAT"
OK_CHANGED=$'docs/control/outbox/claude/RUN-2026-01-01-0000.md\ndocs/control/runner-status.json'
# 8. cas nominal OK
checkpost "nominal OK" "OK postflight" POST_BRANCH=recette POST_STATUS="$STAT" POST_CHANGED="$OK_CHANGED"
# 9. tentative modif workflow => FAIL
checkpost "modif garde-fou (workflow)" "FAIL diff touche un garde-fou" POST_BRANCH=recette POST_STATUS="$STAT" POST_CHANGED=$'.github/workflows/claude-runner-oauth.yml\ndocs/control/outbox/claude/RUN-x.md\ndocs/control/runner-status.json'
# 10. absence outbox => FAIL
checkpost "outbox manquant" "FAIL aucun outbox" POST_BRANCH=recette POST_STATUS="$STAT" POST_CHANGED='docs/control/runner-status.json'
# 11. runner-status JSON invalide => FAIL
BADSTAT="$SB/bad.json"; echo '{invalid' > "$BADSTAT"
checkpost "runner-status JSON invalide" "FAIL runner-status.json invalide" POST_BRANCH=recette POST_STATUS="$BADSTAT" POST_CHANGED="$OK_CHANGED"
# 12. branche != recette => FAIL
checkpost "branche != recette" "FAIL branche != recette" POST_BRANCH=main POST_STATUS="$STAT" POST_CHANGED="$OK_CHANGED"

echo ""; echo "RÉSULTAT GARDES RUNNER : $pass PASS / $fail FAIL"
exit $((fail>0?1:0))
