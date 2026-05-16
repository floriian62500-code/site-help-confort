#!/bin/bash
# -----------------------------------------------------------------------------
# health-wrapper.sh
# -----------------------------------------------------------------------------
# Wrapper universel pour les scripts automatisés Help Confort.
# Exécute la commande passée en argument, mesure la durée, écrit un fichier
# témoin daté, alerte Slack si le code de sortie n'est pas 0.
#
# Usage :
#   health-wrapper.sh <nom_script> <commande...>
#
# Exemple :
#   health-wrapper.sh audit-matin /usr/bin/python3 /path/to/audit-matin.py
#
# Fichier témoin produit :
#   $HEALTH_DIR/<nom_script>.last  (JSON avec timestamp, exit_code, duration)
# -----------------------------------------------------------------------------

set -u

if [ "$#" -lt 2 ]; then
  echo "Usage : $0 <nom_script> <commande...>" >&2
  exit 64
fi

NOM_SCRIPT="$1"
shift

LOG_DIR="${HC_LOG_DIR:-$HOME/Library/Logs/helpconfort}"
HEALTH_DIR="$LOG_DIR/health"
SCRIPT_LOG="$LOG_DIR/${NOM_SCRIPT}.wrapper.log"
TEMOIN="$HEALTH_DIR/${NOM_SCRIPT}.last"

mkdir -p "$HEALTH_DIR"

NOTIFY_SLACK="${HC_NOTIFY_SCRIPT:-$(dirname "$0")/notify-slack.sh}"

NOW_ISO=$(date "+%Y-%m-%dT%H:%M:%S%z")
START_EPOCH=$(date +%s)

echo "[$NOW_ISO] === Démarrage $NOM_SCRIPT ===" >> "$SCRIPT_LOG"
echo "[$NOW_ISO] Commande : $*" >> "$SCRIPT_LOG"

# Exécution avec capture stdout/stderr
"$@" >> "$SCRIPT_LOG" 2>&1
EXIT_CODE=$?

END_EPOCH=$(date +%s)
DURATION=$((END_EPOCH - START_EPOCH))
END_ISO=$(date "+%Y-%m-%dT%H:%M:%S%z")

# Écriture du fichier témoin (JSON simple)
cat > "$TEMOIN" <<JSON
{
  "nom": "$NOM_SCRIPT",
  "derniere_execution": "$END_ISO",
  "exit_code": $EXIT_CODE,
  "duree_secondes": $DURATION,
  "commande": "$(printf '%s ' "$@" | sed 's/"/\\"/g')"
}
JSON

echo "[$END_ISO] === Fin $NOM_SCRIPT — exit=$EXIT_CODE — durée=${DURATION}s ===" >> "$SCRIPT_LOG"

# Alerte Slack si échec
if [ "$EXIT_CODE" -ne 0 ]; then
  if [ -x "$NOTIFY_SLACK" ]; then
    TAIL_OUTPUT=$(tail -n 15 "$SCRIPT_LOG" 2>/dev/null | sed 's/[`*_]/ /g' | head -c 1500)
    "$NOTIFY_SLACK" error \
      "Échec script $NOM_SCRIPT (exit=$EXIT_CODE)" \
      "Durée : ${DURATION}s — Dernier extrait du log :\n\`\`\`${TAIL_OUTPUT}\`\`\`\nLog complet : ${SCRIPT_LOG}" \
      >> "$SCRIPT_LOG" 2>&1 || true
  fi
fi

# Garder un log léger : rotation à 5 Mo
LOG_SIZE=$(stat -f%z "$SCRIPT_LOG" 2>/dev/null || stat -c%s "$SCRIPT_LOG" 2>/dev/null || echo 0)
if [ "$LOG_SIZE" -gt 5242880 ]; then
  mv "$SCRIPT_LOG" "${SCRIPT_LOG}.1"
  echo "[$END_ISO] Log rotated (>5Mo)" > "$SCRIPT_LOG"
fi

exit "$EXIT_CODE"
