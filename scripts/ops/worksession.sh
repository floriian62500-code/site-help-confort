#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Verrou de session de travail (directive 5796732231 §5).
#
# Pendant un lot, l'auto-sauvegarde ne doit pas committer ni pousser : sinon elle publie un état
# intermédiaire sous un message générique — c'est arrivé deux fois le 2026-09-23, dont une fois
# avec une fonction momentanément cassée poussée sur recette.
#
#   scripts/ops/worksession.sh start "libellé du lot"   pose le verrou (et contrôle la dérive)
#   scripts/ops/worksession.sh renew                    repousse l'expiration (lot qui dure)
#   scripts/ops/worksession.sh stop                     le retire ; la sauvegarde repart seule
#   scripts/ops/worksession.sh status                   dit s'il y en a un, depuis quand
#
# ⚠️ Un lot qui dure plus de 90 minutes DOIT se renouveler : sinon le verrou expire en cours de
# route et l'auto-sauvegarde reprend au milieu du travail. C'est arrivé le 2026-09-23 à 22 h 11 —
# le mécanisme a fonctionné exactement comme prévu, mais le lot durait 90 minutes de plus.
#
# Ce n'est PAS l'arrêt d'urgence : celui-ci reste `touch .autopush-off`, sans expiration, et se
# lève à la main. Le verrou de session, lui, expire tout seul au bout de 90 minutes — un verrou
# oublié ne doit jamais geler les sauvegardes.
#
# ---------------------------------------------------------------------------------------------
# GARDE-FOU DE WIP (contrôle CHATGPT-2026-09-24-RELEASE-CATCHUP-REVIEW-1, point 2).
#
# « start » est le seul endroit où un nouveau lot s'ouvre : c'est donc là que la règle anti-dérive
# doit mordre. Si un seuil de `scripts/release/derive.mjs` est franchi ET qu'aucune release
# corrective n'est active, l'ouverture d'un **nouveau gros lot** est refusée.
#
# Restent toujours autorisés, parce que les interdire aggraverait la situation :
#   · un correctif P0 ou P1, la sécurité, un retour arrière ;
#   · la préparation d'une release (c'est la sortie de la dérive) ;
#   · une autorisation explicite de Florian : `--go-florian` ou HC_GO_FLORIAN=1.
# Le libellé du lot sert de déclaration : il doit contenir le mot qui décrit sa nature.
#
# L'alerte générale en CI reste non bloquante : rendre la CI rouge en permanence noierait le
# signal. C'est ici, au moment d'ouvrir le travail, que le refus a un sens — et il est
# contournable en une commande, donc il informe sans emprisonner.
# ---------------------------------------------------------------------------------------------
# ─────────────────────────────────────────────────────────────────────────────
set -u
REPO="/Users/HP/Documents/Claude/Projects/SITE INTERNET"
SUPPORT="$HOME/Library/Application Support/HelpConfort"
VERROU="$SUPPORT/autopush.worksession"
TTL=5400

# Un dépôt passé en paramètre d'environnement sert aux tests.
REPO="${HC_REPO:-$REPO}"
SUPPORT="${HC_SUPPORT:-$SUPPORT}"
VERROU="$SUPPORT/autopush.worksession"

mkdir -p "$SUPPORT" 2>/dev/null

age() { echo $(( $(date +%s) - $(stat -f%m "$1" 2>/dev/null || echo 0) )); }

# Un lot dont le libellé annonce une correction, la sécurité ou une release n'est pas « un nouveau
# gros lot » : c'est la sortie de crise. On le laisse passer, en le disant.
lot_exempte() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' \
    | grep -Eq '(^|[^a-z])(p0|p1|secu|securite|s\xc3\xa9curit\xc3\xa9|hotfix|correctif|fix|release|rollback|retour arri)'
}

# Une release corrective active lève le blocage : le travail de sortie a commencé.
release_active() {
  node -e '
    const fs = require("fs");
    try {
      const r = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      process.exit(r.release_branch && r.statut !== "AUCUNE_RELEASE_ACTIVE" ? 0 : 1);
    } catch (e) { process.exit(1); }
  ' "$REPO/docs/release/CURRENT-RELEASE.json" 2>/dev/null
}

garde_wip() {
  local libelle="$1" force="$2" code
  [ "${HC_GARDE_WIP:-1}" = "0" ] && return 0
  [ ! -f "$REPO/scripts/release/derive.mjs" ] && return 0

  node "$REPO/scripts/release/derive.mjs" --strict >/dev/null 2>&1; code=$?
  [ "$code" = "0" ] && return 0
  if [ "$code" = "3" ]; then
    echo "⚠️ dérive non mesurable (référence main absente en local) : le lot s'ouvre, mais la mesure n'a pas eu lieu." >&2
    return 0
  fi

  if [ "$force" = "1" ]; then
    echo "⚠️ seuil de dérive franchi — ouverture forcée sur autorisation explicite de Florian." >&2
    return 0
  fi
  if lot_exempte "$libelle"; then
    echo "⚠️ seuil de dérive franchi — lot autorisé car correctif, sécurité ou release (« $libelle »)." >&2
    return 0
  fi
  if release_active; then
    echo "⚠️ seuil de dérive franchi — lot autorisé : une release corrective est active." >&2
    return 0
  fi

  node "$REPO/scripts/release/derive.mjs" 2>/dev/null | sed -n '/🚨/,$p' >&2
  cat >&2 <<'RAISON'

⛔ OUVERTURE REFUSÉE — un seuil de dérive est franchi et aucune release corrective n'est active.
   Ouvrir un nouveau gros lot maintenant éloignerait encore recette de main.

   Restent autorisés, en le disant dans le libellé :
     · correctif P0 / P1, sécurité, retour arrière   → « P0 … », « correctif … », « secu … »
     · préparation d'une release                     → « release … »
     · décision explicite de Florian                 → --go-florian  (ou HC_GO_FLORIAN=1)
RAISON
  return 1
}

case "${1:-status}" in
  start)
    LIBELLE="${2:-lot en cours}"
    FORCE=0
    for a in "$@"; do [ "$a" = "--go-florian" ] && FORCE=1; done
    [ "${HC_GO_FLORIAN:-0}" = "1" ] && FORCE=1
    garde_wip "$LIBELLE" "$FORCE" || exit 3
    printf '%s — depuis %s (pid %s)\n' "$LIBELLE" "$(date '+%Y-%m-%d %H:%M:%S')" "$$" > "$VERROU"
    rm -f "$SUPPORT/autopush.worksession.preavis" 2>/dev/null   # nouveau lot : le préavis se réarme
    echo "🔒 session de travail ouverte : $LIBELLE"
    echo "   l'auto-sauvegarde ne committera ni ne poussera jusqu'à « worksession.sh stop »"
    echo "   (expiration automatique au bout de $((TTL / 60)) min si on oublie)"
    ;;
  renew)
    if [ -f "$VERROU" ]; then
      A=$(age "$VERROU")
      touch "$VERROU"
      rm -f "$SUPPORT/autopush.worksession.preavis" 2>/dev/null   # prolongée : le préavis se réarme
      echo "🔄 session prolongée (elle courait depuis ${A}s) — encore $((TTL / 60)) min"
    else
      echo "⚠️ aucune session en cours : rien à prolonger (utiliser « start »)" >&2
      exit 1
    fi
    ;;
  stop)
    if [ -f "$VERROU" ]; then
      echo "🔓 session de travail fermée après $(age "$VERROU")s — l'auto-sauvegarde reprend"
      rm -f "$VERROU"
    else
      echo "ℹ️ aucune session de travail en cours"
    fi
    rm -f "$REPO/.autopush-worksession" 2>/dev/null
    ;;
  status)
    if [ -f "$VERROU" ]; then
      A=$(age "$VERROU")
      if [ "$A" -lt "$TTL" ]; then
        echo "🔒 session en cours depuis ${A}s : $(head -1 "$VERROU")"
      else
        echo "⚠️ verrou expiré (${A}s > ${TTL}s) : le démon le lèvera au prochain passage"
      fi
      exit 0
    fi
    echo "✅ aucune session de travail : l'auto-sauvegarde est active"
    ;;
  *)
    echo "usage : worksession.sh start \"libellé\" | renew | stop | status" >&2
    exit 2
    ;;
esac
