#!/bin/bash
# -----------------------------------------------------------------------------
# notify-slack.sh
# -----------------------------------------------------------------------------
# Poste un message sur le webhook Slack défini par HC_SLACK_WEBHOOK.
# Usage : notify-slack.sh <niveau> <titre> <message...>
#   niveau : "ok" | "warn" | "error"
#
# Exit codes :
#   0 = envoyé
#   1 = webhook non configuré (log only)
#   2 = erreur curl
# -----------------------------------------------------------------------------

set -u

NIVEAU="${1:-info}"
TITRE="${2:-(sans titre)}"
shift 2 || true
MESSAGE="${*:-}"

LOG_DIR="${HC_LOG_DIR:-$HOME/Library/Logs/helpconfort}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/slack-notifications.log"

case "$NIVEAU" in
  ok)    EMOJI=":white_check_mark:" ;;
  warn)  EMOJI=":warning:" ;;
  error) EMOJI=":rotating_light:" ;;
  *)     EMOJI=":information_source:" ;;
esac

NOW=$(date "+%Y-%m-%d %H:%M:%S")
HOSTNAME=$(hostname -s)

echo "[$NOW] [$NIVEAU] $TITRE : $MESSAGE" >> "$LOG_FILE"

if [ -z "${HC_SLACK_WEBHOOK:-}" ]; then
  echo "[$NOW] [WARN] HC_SLACK_WEBHOOK non défini. Notification loggée uniquement." >> "$LOG_FILE"
  exit 1
fi

# Échapper les guillemets et backslashes pour JSON
ESCAPED_MESSAGE=$(printf '%s' "$MESSAGE" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read())[1:-1])")
ESCAPED_TITRE=$(printf '%s' "$TITRE" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read())[1:-1])")

PAYLOAD=$(cat <<JSON
{
  "text": "$EMOJI *$ESCAPED_TITRE*",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "$EMOJI *$ESCAPED_TITRE*\n$ESCAPED_MESSAGE"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "Help Confort automatisation — $HOSTNAME — $NOW"
        }
      ]
    }
  ]
}
JSON
)

HTTP_CODE=$(curl -sS -o /tmp/slack-resp.$$ -w "%{http_code}" \
  -X POST -H 'Content-Type: application/json' \
  --data "$PAYLOAD" \
  "$HC_SLACK_WEBHOOK" 2>>"$LOG_FILE") || {
    echo "[$NOW] [ERROR] curl a échoué pour Slack." >> "$LOG_FILE"
    rm -f /tmp/slack-resp.$$
    exit 2
}

if [ "$HTTP_CODE" != "200" ]; then
  echo "[$NOW] [ERROR] Slack a répondu HTTP $HTTP_CODE : $(cat /tmp/slack-resp.$$)" >> "$LOG_FILE"
  rm -f /tmp/slack-resp.$$
  exit 2
fi

rm -f /tmp/slack-resp.$$
echo "[$NOW] [OK] Notification Slack envoyée ($NIVEAU)." >> "$LOG_FILE"
exit 0
