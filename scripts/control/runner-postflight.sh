#!/usr/bin/env bash
# runner-postflight.sh — gardes APRÈS Claude, AVANT commit/push autonome.
# Sort "OK postflight" (exit 0) ou "FAIL <raison>" (exit 1). Rien n'est poussé si FAIL.
# Testable : POST_CHANGED (liste fichiers), POST_BRANCH (branche), POST_STATUS (chemin runner-status).
set -u

CHANGED="${POST_CHANGED:-$(git diff --name-only; git diff --cached --name-only)}"
BRANCH="${POST_BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)}"
STATUS="${POST_STATUS:-docs/control/runner-status.json}"
REMOTE="${POST_REMOTE:-$(git remote get-url origin 2>/dev/null || echo unknown)}"
EXPECT_REMOTE_RE="${POST_EXPECT_REMOTE_RE:-site-help-confort(\.git)?$}"

# (3) garde branche DURE : uniquement recette (détecte un changement de branche pendant l'exécution)
if [ "$BRANCH" != "recette" ]; then
  echo "FAIL branche != recette ($BRANCH)"; exit 1
fi

# (6) garde remote : origin doit rester le dépôt attendu (détecte une altération de remote par Claude)
if ! printf '%s' "$REMOTE" | grep -Eq "$EXPECT_REMOTE_RE"; then
  echo "FAIL remote origin inattendu ($REMOTE)"; exit 1
fi

# (4) garde fichiers sensibles : un CP métier ne doit JAMAIS auto-modifier ses propres garde-fous/secrets.
#     Tout changement runner/workflow/secret => repasse par PR humaine dédiée.
if printf '%s\n' "$CHANGED" | grep -qE '(^|/)\.github/workflows/|^scripts/control/(runner-|claude-runner)|\.plist$|(^|/)\.env($|\.)|(^|/)secrets?(/|\.)|CLAUDE_CODE_OAUTH_TOKEN'; then
  echo "FAIL diff touche un garde-fou/secret (workflow/preflight/postflight/plist/env/secret) — passer par PR humaine"; exit 1
fi

# (5) outbox obligatoire : un run PROCESS doit produire un NOUVEAU outbox RUN-*.md (créé, pas juste modifié).
# On exige un fichier AJOUTÉ (git status ?? ou A), un vieux RUN modifié (M) ne suffit pas.
NEW_OUTBOX="${POST_NEW_OUTBOX:-$(git status --porcelain -- docs/control/outbox/claude/ 2>/dev/null \
  | grep -E '^(\?\?|A ).*RUN-[^/]+\.md$' | sed -E 's/^...//')}"
if [ -z "$NEW_OUTBOX" ]; then
  echo "FAIL aucun NOUVEAU outbox RUN-*.md créé ce run (un vieux RUN modifié ne suffit pas)"; exit 1
fi

# (5) runner-status.json doit être présent, modifié et JSON valide
if ! printf '%s\n' "$CHANGED" | grep -qE '(^|/)docs/control/runner-status\.json$'; then
  echo "FAIL runner-status.json non mis à jour (heartbeat manquant)"; exit 1
fi
if ! python3 -c "import json,sys;json.load(open('$STATUS'))" 2>/dev/null; then
  echo "FAIL runner-status.json invalide (JSON)"; exit 1
fi
# (5) cohérence : champs obligatoires présents et non vides (heartbeat/state/last_report)
if ! python3 -c "import json,sys;d=json.load(open('$STATUS'));\
k=[x for x in ('heartbeat','state','last_report') if not d.get(x)];\
sys.exit(1 if k else 0)" 2>/dev/null; then
  echo "FAIL runner-status.json incohérent (heartbeat/state/last_report manquant)"; exit 1
fi

# (5bis) last_report doit pointer EXACTEMENT vers le NOUVEL outbox de ce run
LR="$(python3 -c "import json;print(json.load(open('$STATUS')).get('last_report',''))" 2>/dev/null)"
if ! printf '%s\n' "$NEW_OUTBOX" | grep -qxF "$LR"; then
  echo "FAIL last_report ('$LR') ne pointe pas vers le nouvel outbox de ce run"; exit 1
fi

# (5ter) heartbeat = timestamp ISO 8601 valide ET récent (fenêtre [now-2h, now+5min])
if ! python3 - "$STATUS" "${POST_NOW:-}" <<'PY' 2>/dev/null
import json,sys,datetime
d=json.load(open(sys.argv[1])); hb=d.get('heartbeat','')
try:
    t=datetime.datetime.fromisoformat(hb.replace('Z','+00:00'))
except Exception:
    sys.exit(1)
now = datetime.datetime.fromisoformat(sys.argv[2].replace('Z','+00:00')) if sys.argv[2] else datetime.datetime.now(datetime.timezone.utc)
if t.tzinfo is None: t=t.replace(tzinfo=datetime.timezone.utc)
delta=(now-t).total_seconds()
sys.exit(0 if -300 <= delta <= 7200 else 1)
PY
then
  echo "FAIL heartbeat absent/non-ISO/non-récent"; exit 1
fi

echo "OK postflight"
