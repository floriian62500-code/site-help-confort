#!/usr/bin/env bash
# runner-preflight.sh — validation anti-injection AVANT d'invoquer Claude dans le runner autonome.
# Sort un chemin de CP à traiter sur stdout (dernière ligne = PROCESS <path> ou SKIP <raison>).
# Aucune exécution de contenu : ne fait que sélectionner/valider un fichier d'inbox de confiance.
set -euo pipefail

INBOX="docs/control/inbox/chatgpt"
OUTBOX="docs/control/outbox/claude"
STOP="docs/control/RUNNER_STOP"
# Allowlist des auteurs autorisés (login GitHub OU email). Adapter si un connecteur ChatGPT dédié est ajouté.
ALLOWLIST_LOGINS="floriian62500-code helpconfort"
ALLOWLIST_EMAILS="florian.dhaillecourt@helpconfort.com"

# 0. kill-switch
if [ -f "$STOP" ]; then echo "SKIP kill-switch ($STOP présent)"; exit 0; fi

# 1. dernier CP au format strict CP-####-*.md
latest=""
for f in $(ls -1 "$INBOX"/CP-[0-9][0-9][0-9][0-9]-*.md 2>/dev/null | sort); do
  base="$(basename "$f")"
  # format strict
  echo "$base" | grep -Eq '^CP-[0-9]{4}-[a-z0-9-]+\.md$' || continue
  latest="$f"
done
[ -n "$latest" ] || { echo "SKIP aucun CP inbox valide"; exit 0; }

cpid="$(basename "$latest" | grep -oE '^CP-[0-9]{4}')"

# 2. dedup : déjà traité si un outbox correspondant existe (test robuste, sans faux négatif sous set -e)
dedup=0
[ -f "$OUTBOX/${cpid}.md" ] && dedup=1
for g in "$OUTBOX/${cpid}-"*.md; do [ -f "$g" ] && dedup=1; done
if [ "$dedup" = "1" ]; then
  echo "SKIP $cpid déjà traité (outbox présent)"; exit 0
fi

# 3. allowlist auteur du dernier commit ayant modifié ce fichier
author_login="$(git log -1 --format='%an' -- "$latest" 2>/dev/null || true)"
author_email="$(git log -1 --format='%ae' -- "$latest" 2>/dev/null || true)"
ok=0
for l in $ALLOWLIST_LOGINS; do [ "$author_login" = "$l" ] && ok=1; done
for e in $ALLOWLIST_EMAILS; do [ "$author_email" = "$e" ] && ok=1; done
if [ "$ok" != "1" ]; then
  echo "SKIP $cpid auteur non autorisé (login='$author_login' email='$author_email')"; exit 0
fi

echo "PROCESS $latest"
