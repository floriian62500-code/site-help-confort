#!/bin/bash
REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
LOGFILE="$REPO/.auto-push.log"

cd "$REPO" || exit 1

# Garde-fou : pas de boucle infinie si Git est cassé
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Pas un repo Git" >> "$LOGFILE"
  exit 1
fi

# Nettoyer locks + tmp objects
for lock in .git/index.lock .git/HEAD.lock .git/config.lock .git/packed-refs.lock; do
  [ -f "$lock" ] && rm -f "$lock"
done
find .git/objects -name "tmp_obj_*" -delete 2>/dev/null

# Rien à pousser ?
if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

BRANCH=$(git branch --show-current)
CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
MSG="Auto-push — $(date '+%Y-%m-%d %H:%M') — $CHANGED fichier(s)"

# Log
{
  echo ""
  echo "═══════════════════════════════════════"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $CHANGED fichier(s) à pousser"
  echo "Branche : $BRANCH"
  echo "Message : $MSG"
} >> "$LOGFILE"

# Add + commit + push
{
  git add -A 2>&1
  git commit -m "$MSG" 2>&1
  git push origin "$BRANCH" 2>&1
} >> "$LOGFILE"

if [ $? -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Push réussi" >> "$LOGFILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Push échoué" >> "$LOGFILE"
fi

# Rotation log si > 1 Mo
if [ -f "$LOGFILE" ] && [ $(stat -f%z "$LOGFILE" 2>/dev/null || echo 0) -gt 1048576 ]; then
  tail -200 "$LOGFILE" > "$LOGFILE.tmp" && mv "$LOGFILE.tmp" "$LOGFILE"
fi
