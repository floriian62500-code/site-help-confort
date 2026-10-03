#!/usr/bin/env bash
# monitoring-uptime.sh
# Check HTTP des pages critiques + cleanup locks Git + check autopush
# Remplace l'agent IA helpconfort-hourly-monitoring
# Exécuté toutes les heures par launchd (silencieux si OK)

set -euo pipefail

# === Configuration ===
PROJECT_DIR="$HOME/Documents/Claude/Projects/SITE INTERNET"
LOG_FILE="$HOME/Library/Logs/helpconfort-automation.log"
ALERT_FILE="$PROJECT_DIR/docs/ALERT-MONITORING.md"
AUTOPUSH_LOG="$HOME/Library/Application Support/HelpConfort/autopush.log"

URLS=(
  "https://depan59-62.fr"
  "https://depan59-62.fr/admin-pro/"
  "https://depan59-62.fr/contrats-entretien.html"
)

# === Préparation ===
mkdir -p "$(dirname "$LOG_FILE")"
TIMESTAMP=$(date -Iseconds)
HHMM=$(date +"%H:%M")

log() {
  echo "[$TIMESTAMP][monitoring] $*" >> "$LOG_FILE"
}

ALERTS=()

# === 1. Check HTTP uptime ===
for URL in "${URLS[@]}"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 15 --retry 1 "$URL" 2>/dev/null || echo "000")
  if [ "$CODE" != "200" ]; then
    ALERTS+=("HTTP $CODE sur $URL")
  fi
done

# === 2. Cleanup locks .git vides > 5 min (auto-fix autorisé) ===
if [ -d "$PROJECT_DIR/.git" ]; then
  LOCKS_CLEANED=$(find "$PROJECT_DIR/.git" -maxdepth 2 -name "*.lock" -size 0 -mmin +5 2>/dev/null | wc -l | tr -d ' ')
  if [ "$LOCKS_CLEANED" -gt 0 ]; then
    find "$PROJECT_DIR/.git" -maxdepth 2 -name "*.lock" -size 0 -mmin +5 -delete 2>/dev/null || true
    log "Auto-fix: $LOCKS_CLEANED lock(s) .git supprimé(s)"
  fi
fi

# === 3. Check santé autopush ===
# v3.1 (2026-09-22) : le démon rafraîchit « autopush.heartbeat » à chaque passage actif. On distingue
# une PAUSE volontaire (kill-switch) d'un démon ARRÊTÉ, et on n'alerte que s'il reste du travail en attente.
AUTOPUSH_DIR="$(dirname "$AUTOPUSH_LOG")"
HEARTBEAT="$AUTOPUSH_DIR/autopush.heartbeat"
if [ -n "$(cd "$PROJECT_DIR" 2>/dev/null && git status --porcelain 2>/dev/null | grep -v 'docs/ALERT-MONITORING.md')" ]; then
  if [ -f "$AUTOPUSH_DIR/autopush.off" ] || [ -f "$PROJECT_DIR/.autopush-off" ]; then
    OFF_FILE="$AUTOPUSH_DIR/autopush.off"; [ -f "$OFF_FILE" ] || OFF_FILE="$PROJECT_DIR/.autopush-off"
    if find "$OFF_FILE" -mmin +65 2>/dev/null | grep -q .; then
      ALERTS+=("Auto-push EN PAUSE depuis plus d'une heure (kill-switch $(basename "$OFF_FILE")) et fichiers en attente — pour reprendre : rm \"$OFF_FILE\"")
    fi
  elif [ -f "$HEARTBEAT" ]; then
    if ! find "$HEARTBEAT" -mmin -65 2>/dev/null | grep -q .; then
      ALERTS+=("Auto-push ne tourne plus (dernier passage > 65 min) et fichiers en attente — vérifier : launchctl list | grep autopush")
    fi
  elif [ -f "$AUTOPUSH_LOG" ] && ! find "$AUTOPUSH_LOG" -mmin -65 2>/dev/null | grep -q .; then
    ALERTS+=("Autopush ne tourne plus (heartbeat > 65 min) ET fichiers en attente")
  fi
fi

# === Reporting ===
if [ ${#ALERTS[@]} -eq 0 ]; then
  log "Monitoring $HHMM OK"
  # Supprime un éventuel ALERT précédent si tout est OK depuis cette run
  rm -f "$ALERT_FILE" 2>/dev/null || true
  exit 0
fi

# === Cas alertes ===
log "Monitoring $HHMM ALERT (${#ALERTS[@]} problème(s))"

mkdir -p "$(dirname "$ALERT_FILE")"
{
  echo "# 🚨 ALERTE Monitoring HELP Confort — $TIMESTAMP"
  echo ""
  echo "## Problèmes détectés"
  echo ""
  for ALERT in "${ALERTS[@]}"; do
    echo "- $ALERT"
  done
  echo ""
  echo "## Actions recommandées"
  echo ""
  echo "- Vérifier l'état du site : https://depan59-62.fr"
  echo "- Console Supabase : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg"
  echo "- Console Netlify : https://app.netlify.com"
  echo ""
  echo "## Diagnostic auto"
  echo ""
  echo "- Locks Git nettoyés automatiquement si présents"
  echo "- Logs détaillés : \`$LOG_FILE\`"
} > "$ALERT_FILE"

osascript -e 'display notification "Voir ALERT-MONITORING.md" with title "🚨 HELP Confort — Monitoring" sound name "Glass"' 2>/dev/null || true

exit 1
