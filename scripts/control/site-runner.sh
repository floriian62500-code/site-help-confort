#!/bin/bash
set -u

REPO_DIR="${HC_REPO_DIR:-$HOME/site-help-confort}"
LOG_DIR="$HOME/Library/Logs/helpconfort-claude-runner"
STATE_DIR="$HOME/.helpconfort-claude-runner"
mkdir -p "$LOG_DIR" "$STATE_DIR"
LOG="$LOG_DIR/runner.log"
LOCK="$STATE_DIR/lock"

export PATH="$HOME/.npm-global/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

log(){ printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG"; }

if ! mkdir "$LOCK" 2>/dev/null; then exit 0; fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

if [ ! -d "$REPO_DIR/.git" ]; then log "ERROR repo missing: $REPO_DIR"; exit 2; fi
cd "$REPO_DIR" || exit 2

git fetch origin recette >> "$LOG" 2>&1 || { log "ERROR git fetch"; exit 3; }
git checkout recette >> "$LOG" 2>&1 || { log "ERROR checkout recette"; exit 3; }
git pull --ff-only origin recette >> "$LOG" 2>&1 || { log "ERROR pull recette"; exit 3; }

LATEST="$(find docs/control/inbox/chatgpt -type f -name '*.md' -print 2>/dev/null | sort | tail -1)"
[ -n "$LATEST" ] || { log "No inbox file"; exit 0; }
SHA="$(git rev-parse HEAD)"
TOKEN="${SHA}:${LATEST}"
LAST="$(cat "$STATE_DIR/last-token" 2>/dev/null || true)"
[ "$TOKEN" != "$LAST" ] || { log "No new instruction"; exit 0; }

CLAUDE_BIN="$(command -v claude || true)"
[ -n "$CLAUDE_BIN" ] || { log "ERROR claude CLI not found PATH=$PATH"; exit 4; }

log "START instruction=$LATEST sha=$SHA claude=$CLAUDE_BIN"
PROMPT="Tu travailles sur le depot Help Confort, branche recette uniquement. Lis d'abord $LATEST puis docs/control/runner-status.json, les issues GitHub ouvertes prioritaires et le dernier outbox Claude. Execute la directive sans attendre Florian. Ne touche jamais a main/prod, Stripe LIVE ou secrets. Teste reellement les parcours concernes. Ecris ton compte rendu dans docs/control/outbox/claude/ avec SHA, tests, blocages et next_action. Puis poursuis le prochain travail executable du backlog au lieu de t'arreter uniquement au rapport."

"$CLAUDE_BIN" -p "$PROMPT" >> "$LOG" 2>&1
RC=$?
if [ "$RC" -eq 0 ]; then
  printf '%s' "$TOKEN" > "$STATE_DIR/last-token"
  date '+%Y-%m-%dT%H:%M:%S%z' > "$STATE_DIR/heartbeat"
  log "PASS instruction=$LATEST"
else
  log "ERROR claude exit=$RC instruction=$LATEST"
fi
exit "$RC"
