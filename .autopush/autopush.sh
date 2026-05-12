#!/bin/bash
# Auto-push silencieux : pousse origin/main si HEAD diffère
set -e

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
LOG="$REPO/.autopush/autopush.log"

cd "$REPO" || exit 0

# Rotation log si > 1 Mo
if [ -f "$LOG" ] && [ "$(stat -f%z "$LOG" 2>/dev/null || stat -c%s "$LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  tail -200 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }

# Fetch silencieux pour comparer HEAD à origin/main
git fetch origin main --quiet 2>/dev/null || { log "fetch failed"; exit 0; }

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

# Rien à pousser : silence total
[ "$LOCAL" = "$REMOTE" ] && exit 0

# Push (sortie capturée en log, jamais stdout)
if git push origin main --quiet 2>>"$LOG"; then
  log "✅ push $LOCAL"
else
  log "❌ push failed ($LOCAL)"
fi

exit 0
