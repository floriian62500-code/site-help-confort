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

# (5) outbox obligatoire : un run PROCESS doit produire un nouvel outbox RUN-*.md
if ! printf '%s\n' "$CHANGED" | grep -qE '(^|/)docs/control/outbox/claude/RUN-[0-9A-Za-z._-]+\.md$'; then
  echo "FAIL aucun outbox RUN-*.md produit (push silencieux refusé)"; exit 1
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

echo "OK postflight"
