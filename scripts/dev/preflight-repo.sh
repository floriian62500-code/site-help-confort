#!/usr/bin/env bash
# preflight-repo.sh — garde ENVIRONNEMENT : refuse toute commande de dev si on n'est pas
# dans le repo HELP CONFORT (site-help-confort) sur la branche recette.
# Cause : le harness peut avoir son cwd sur un AUTRE projet (ex. click-and-clock) et un
# preview/build lancé par `name` partirait du mauvais repo. Sourcer/exécuter ce script AVANT.
# Usage : bash scripts/dev/preflight-repo.sh  (exit 0 = OK, exit 1 = ABORT)
set -euo pipefail
TOP="$(git rev-parse --show-toplevel 2>/dev/null || echo '')"
REMOTE="$(git remote get-url origin 2>/dev/null || echo '')"
BRANCH="$(git branch --show-current 2>/dev/null || echo '')"
FAIL=0
case "$TOP" in
  */SITE\ INTERNET) : ;;
  *) echo "ABORT: toplevel inattendu ($TOP) — attendu .../SITE INTERNET"; FAIL=1 ;;
esac
case "$REMOTE" in
  *site-help-confort*) : ;;
  *) echo "ABORT: remote inattendu (repo non HELP CONFORT)"; FAIL=1 ;;   # ne jamais logguer le token
esac
if [ "$BRANCH" != "recette" ]; then echo "ABORT: branche '$BRANCH' — attendu 'recette'"; FAIL=1; fi
for f in catalogue.html assets/hc-cart.js index.html; do
  [ -f "$f" ] || { echo "ABORT: fichier cible manquant: $f"; FAIL=1; }
done
if [ "$FAIL" = "0" ]; then echo "PREFLIGHT-REPO OK: HELP CONFORT / recette"; fi
exit $FAIL
