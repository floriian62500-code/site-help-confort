#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Verrou de session de travail (directive 5796732231 §5).
#
# Pendant un lot, l'auto-sauvegarde ne doit pas committer ni pousser : sinon elle publie un état
# intermédiaire sous un message générique — c'est arrivé deux fois le 2026-09-23, dont une fois
# avec une fonction momentanément cassée poussée sur recette.
#
#   scripts/ops/worksession.sh start "libellé du lot"   pose le verrou
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

case "${1:-status}" in
  start)
    LIBELLE="${2:-lot en cours}"
    printf '%s — depuis %s (pid %s)\n' "$LIBELLE" "$(date '+%Y-%m-%d %H:%M:%S')" "$$" > "$VERROU"
    echo "🔒 session de travail ouverte : $LIBELLE"
    echo "   l'auto-sauvegarde ne committera ni ne poussera jusqu'à « worksession.sh stop »"
    echo "   (expiration automatique au bout de $((TTL / 60)) min si on oublie)"
    ;;
  renew)
    if [ -f "$VERROU" ]; then
      A=$(age "$VERROU")
      touch "$VERROU"
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
