#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# AUTO-PUSH HELP Confort — v3.2 (2026-09-23 : verrou de session de travail, directive 5796732231 §5)
#                            v3.1 (2026-09-22 : preuve de vie) · v3 (2026-09-20, directive 5732805778)
#
# Ce que fait ce script, toutes les 60 s :
#   1. si la copie de travail est stable depuis DEBOUNCE secondes, il committe ;
#   2. il pousse la branche courante vers LA MÊME branche distante, en avance rapide
#      seulement, et UNIQUEMENT si elle fait partie de BRANCHES_AUTORISEES.
#
# Ce qu'il ne fait JAMAIS :
#   - pousser sur main / master (production) ;
#   - forcer un push (ni --force, ni --force-with-lease) ;
#   - appliquer une migration Supabase (écriture PROD = décision humaine) ;
#   - stocker un jeton : l'authentification passe par `gh auth git-credential`.
#
# Deux mécanismes distincts, à ne pas confondre :
#
#   1. ARRÊT D'URGENCE (général, humain, sans expiration)
#      Pose :    touch "$SUPPORT/autopush.off"   (ou .autopush-off dans le dépôt)
#      Reprise : rm "$SUPPORT/autopush.off"
#      Tant qu'il est là, le démon ne fait RIEN. C'est un interrupteur, il ne se lève pas tout seul.
#
#   2. VERROU DE SESSION DE TRAVAIL (automatique, posé pendant un lot, avec expiration)
#      Pose :    scripts/ops/worksession.sh start "libellé du lot"
#      Retrait : scripts/ops/worksession.sh stop
#      Pendant un lot, le démon ne committe ni ne pousse : il ne capture donc plus d'état
#      intermédiaire (le 2026-09-23, il a publié deux fois un travail en cours, dont une fonction
#      momentanément cassée). À la fin du lot, la sauvegarde repart d'elle-même.
#      Sécurité : un verrou oublié expire au bout de WORKSESSION_TTL et le démon reprend, en le
#      signalant — un verrou abandonné ne doit jamais geler les sauvegardes pour toujours.
# Retour arrière :   cp "$SUPPORT/autopush.sh.bak-<date>" "$SUPPORT/autopush.sh"
# Voir docs/ops/AUTO-PUSH.md dans le repo.
# ─────────────────────────────────────────────────────────────────────────────
set -u
PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
REMOTE_URL="https://github.com/floriian62500-code/site-help-confort.git"
BRANCHES_AUTORISEES="recette integration/lot1-lot2-vs-prod"
DEBOUNCE=180   # secondes de stabilité avant de committer

SUPPORT="$HOME/Library/Application Support/HelpConfort"
LOG="$SUPPORT/autopush.log"
STATE="$SUPPORT/autopush.state"      # hash de l'état + date de première observation
FAILS="$SUPPORT/autopush.fails"
LOCK="$SUPPORT/autopush.lock"        # répertoire = verrou atomique
OFF="$SUPPORT/autopush.off"
WORKSESSION="$SUPPORT/autopush.worksession"   # verrou de lot (voir en-tête) ; le dépôt peut aussi en porter un
WORKSESSION_TTL=5400                          # 90 min : au-delà, le verrou est considéré abandonné

DRY=0; ONCE=0
for a in "$@"; do
  case "$a" in --dry-run) DRY=1 ;; --once) ONCE=1 ;; esac
done

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }
notify() { osascript -e "display notification \"$2\" with title \"$1\"" 2>/dev/null || true; }
git_auth() { git -c credential.helper= -c 'credential.helper=!gh auth git-credential' "$@"; }

# ── Arrêt d'urgence
[ -f "$OFF" ] && exit 0
[ -f "$REPO/.autopush-off" ] && exit 0

# ── Verrou de session de travail : un lot est en cours, on ne capture pas d'état intermédiaire.
#    Le verrou du dépôt (.autopush-worksession) et celui du support sont équivalents ; le plus
#    récent des deux fait foi pour l'expiration.
verrou_actif() {
  local f age
  for f in "$WORKSESSION" "$REPO/.autopush-worksession"; do
    [ -f "$f" ] || continue
    age=$(( $(date +%s) - $(stat -f%m "$f" 2>/dev/null || echo 0) ))
    if [ "$age" -lt "$WORKSESSION_TTL" ]; then
      VERROU_FICHIER="$f"; VERROU_AGE="$age"; return 0
    fi
    # Expiré : on le retire et on reprend — mais on le dit, sinon un oubli passe inaperçu.
    rm -f "$f" 2>/dev/null
    log "🔓 verrou de session expiré (${age}s > ${WORKSESSION_TTL}s) — sauvegardes reprises"
    notify "Auto-push HELP Confort" "Verrou de session expiré et levé : les sauvegardes reprennent"
  done
  return 1
}
if verrou_actif; then
  # Preuve de vie quand même : en lot, le démon est vivant, il attend. La surveillance ne doit pas
  # crier à la panne (c'est exactement l'erreur commise le 2026-09-20 avec l'arrêt d'urgence).
  touch "$SUPPORT/autopush.heartbeat" 2>/dev/null
  log "⏸ session de travail en cours depuis ${VERROU_AGE}s ($(head -1 "$VERROU_FICHIER" 2>/dev/null)) — ni commit ni push"
  exit 0
fi

# ── Preuve de vie pour la surveillance (scripts/automation/monitoring-uptime.sh) : un passage actif
#    la rafraîchit même quand il n'y a rien à pousser. En pause, elle vieillit : c'est voulu.
touch "$SUPPORT/autopush.heartbeat" 2>/dev/null

# ── Rotation du journal
if [ -f "$LOG" ] && [ "$(stat -f%z "$LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  tail -300 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

# ── Verrou (un seul exemplaire à la fois ; verrou figé > 10 min = repris)
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -d "$LOCK" ] && [ -n "$(find "$LOCK" -maxdepth 0 -mmin +10 2>/dev/null)" ]; then
    log "🔓 verrou figé depuis plus de 10 min, repris"
    rm -rf "$LOCK"; mkdir "$LOCK" 2>/dev/null || exit 0
  else
    exit 0
  fi
fi
trap 'rm -rf "$LOCK"' EXIT INT TERM

cd "$REPO" 2>/dev/null || exit 0
[ -d .git ] || exit 0

# ── Garde 1 : branche autorisée (jamais main)
BRANCHE=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
case " $BRANCHES_AUTORISEES " in
  *" $BRANCHE "*) : ;;
  *) log "⛔ branche « $BRANCHE » hors périmètre (autorisées : $BRANCHES_AUTORISEES) — rien fait"; exit 0 ;;
esac

# ── Garde 2 : opération git en cours (rebase, merge, cherry-pick) → on ne touche à rien
for m in rebase-merge rebase-apply MERGE_HEAD CHERRY_PICK_HEAD BISECT_LOG; do
  [ -e ".git/$m" ] && { log "⏸ opération git en cours ($m) — rien fait"; exit 0; }
done
[ -e .git/index.lock ] && { log "⏸ index.lock présent — rien fait"; exit 0; }

# ── Commit, seulement si la copie de travail est stable depuis DEBOUNCE secondes
PORCELAIN=$(git status --porcelain 2>/dev/null)
if [ -n "$PORCELAIN" ]; then
  HASH=$(printf '%s' "$PORCELAIN" | shasum | cut -d' ' -f1)
  MAINTENANT=$(date +%s)
  VU_HASH=""; VU_DATE=0
  [ -f "$STATE" ] && { VU_HASH=$(cut -d' ' -f1 "$STATE" 2>/dev/null); VU_DATE=$(cut -d' ' -f2 "$STATE" 2>/dev/null); }
  [ "$VU_HASH" = "$HASH" ] || { echo "$HASH $MAINTENANT" > "$STATE"; VU_DATE=$MAINTENANT; }
  AGE=$(( MAINTENANT - ${VU_DATE:-$MAINTENANT} ))
  if [ "$AGE" -lt "$DEBOUNCE" ]; then
    exit 0   # édition probablement en cours (Claude ou Florian) : on attend
  fi
  N=$(printf '%s\n' "$PORCELAIN" | wc -l | tr -d ' ')
  if [ "$DRY" = "1" ]; then
    log "🧪 [dry-run] committerait $N fichier(s) sur $BRANCHE"
  else
    git add -A 2>>"$LOG"
    if git commit -q -m "chore(auto): sauvegarde automatique $(date '+%Y-%m-%d %H:%M') — $N fichier(s)" 2>>"$LOG"; then
      log "📝 commit auto ($N fichier(s)) sur $BRANCHE"
      rm -f "$STATE"
    fi
  fi
fi

# ── Rien à pousser ?
if ! git_auth fetch "$REMOTE_URL" "$BRANCHE" --quiet 2>>"$LOG"; then
  log "⚠ fetch impossible ($BRANCHE)"; exit 0
fi
LOCAL=$(git rev-parse HEAD)
DISTANT=$(git rev-parse FETCH_HEAD 2>/dev/null || echo "")
[ "$LOCAL" = "$DISTANT" ] && { echo 0 > "$FAILS"; exit 0; }

# ── Garde 3 : avance rapide seulement (jamais de force, jamais de merge implicite)
if [ -n "$DISTANT" ] && ! git merge-base --is-ancestor "$DISTANT" "$LOCAL" 2>/dev/null; then
  log "⛔ $BRANCHE a divergé du distant ($DISTANT) — aucune action automatique, intervention humaine requise"
  notify "Auto-push HELP Confort" "Branche $BRANCHE divergée : résoudre à la main (aucun force-push)"
  exit 0
fi

# ── Garde 4 : migrations Supabase = décision humaine (jamais appliquées ici)
MIG=$(git diff --name-only "${DISTANT:-$LOCAL}..$LOCAL" 2>/dev/null | grep -E '^supabase/migrations/.*\.sql$' || true)
[ -n "$MIG" ] && log "ℹ️ migrations dans ce lot (application = décision humaine, jamais automatique) : $(echo "$MIG" | tr '\n' ' ')"

# ── Push
if [ "$DRY" = "1" ]; then
  log "🧪 [dry-run] pousserait $LOCAL → $BRANCHE"
  exit 0
fi
OK=0
for essai in 1 2 3; do
  if git_auth push "$REMOTE_URL" "HEAD:$BRANCHE" --quiet 2>>"$LOG"; then OK=1; break; fi
  log "⏳ push $BRANCHE, tentative $essai/3 échouée"
  sleep 3
done

if [ "$OK" = "1" ]; then
  log "✅ push $LOCAL → $BRANCHE"
  echo 0 > "$FAILS"
else
  F=$(cat "$FAILS" 2>/dev/null || echo 0); F=$((F + 1)); echo "$F" > "$FAILS"
  log "❌ push $BRANCHE échoué ($LOCAL) — échec #$F"
  case "$F" in 3|30|300) notify "Auto-push HELP Confort" "$F échecs de push sur $BRANCHE — vérifier « gh auth status »" ;; esac
fi
exit 0
