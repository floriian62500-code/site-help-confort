#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# DÉBLOQUER GIT — HELP Confort
# ═══════════════════════════════════════════════════════════════
# Si GitHub Desktop affiche "A lock file already exists" :
# 👉 Double-clique sur ce fichier (depuis Finder, dans ton dossier
#    SITE INTERNET).
# Une fenêtre Terminal s'ouvre, fait le ménage en 1 seconde,
# tu peux refermer et retourner sur GitHub Desktop.
# ═══════════════════════════════════════════════════════════════

REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔓 Déblocage Git en cours — HELP Confort               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$REPO" || { echo "❌ Dossier introuvable : $REPO"; sleep 5; exit 1; }

cleaned=0

# Lock principal
if [ -f ".git/index.lock" ]; then
  rm -f .git/index.lock && {
    echo "  ✅ Supprimé : .git/index.lock"
    cleaned=$((cleaned + 1))
  }
fi

# Locks secondaires (refs, HEAD, etc.)
for lock in .git/HEAD.lock .git/config.lock .git/packed-refs.lock .git/shallow.lock; do
  if [ -f "$lock" ]; then
    rm -f "$lock" && {
      echo "  ✅ Supprimé : $lock"
      cleaned=$((cleaned + 1))
    }
  fi
done

# Locks dans refs/ (branches, tags)
ref_locks=$(find .git/refs -name "*.lock" 2>/dev/null)
if [ -n "$ref_locks" ]; then
  echo "$ref_locks" | while read -r f; do
    rm -f "$f" && echo "  ✅ Supprimé : $f"
  done
fi

# Lock de l'index sans .lock (vieux bug)
if [ -f ".git/index" ] && [ ! -s ".git/index" ]; then
  echo "  ⚠️  Index vide détecté (potentiellement corrompu) — non touché par sécurité"
fi

echo ""
if [ $cleaned -gt 0 ]; then
  echo "  🎉 $cleaned verrou(s) supprimé(s). Git est débloqué !"
else
  echo "  ℹ️  Aucun verrou détecté. Git est déjà OK."
fi
echo ""
echo "  ➡️  Retourne dans GitHub Desktop et clique sur 'Commit' à nouveau."
echo ""
echo "──────────────────────────────────────────────────────────────"
echo "  Cette fenêtre se ferme automatiquement dans 5 secondes…"
echo "──────────────────────────────────────────────────────────────"
sleep 5
osascript -e 'tell application "Terminal" to close (every window whose name contains "Débloquer-Git")' 2>/dev/null &
exit 0
