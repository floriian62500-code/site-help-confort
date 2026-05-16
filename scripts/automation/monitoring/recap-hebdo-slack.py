#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
recap-hebdo-slack.py
--------------------
Génère et envoie un récapitulatif hebdomadaire de l'activité des automatisations
Help Confort sur les 7 derniers jours :
  - Nb d'exécutions OK / KO par script
  - Durée moyenne et durée max
  - Nb d'alertes Slack envoyées
  - Indicateurs de tendance

Lancé chaque lundi à 8h00 via launchd com.helpconfort.recap-hebdo-slack.

Auteur : Help Confort — Phase 7 récap hebdo
Date   : 2026-05-16
"""

import json
import os
import re
import subprocess
import datetime as dt
from pathlib import Path
from collections import defaultdict

HOME = Path.home()
LOG_DIR = Path(os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort"))
HEALTH_DIR = LOG_DIR / "health"

NOTIFY_SLACK = Path(
    os.environ.get(
        "HC_NOTIFY_SCRIPT",
        HOME / "Documents/Claude/Projects/SITE INTERNET/scripts/automation/monitoring/notify-slack.sh",
    )
)

# Scripts à analyser (mêmes que check-health)
SCRIPTS = [
    "refresh-fb-token",
    "sync-social",
    "monitoring-uptime",
    "audit-matin",
    "recap-business",
    "scan-regressions-soir",
    "rapport-hebdo",
    "template-post",
]


def parse_iso(s: str) -> dt.datetime | None:
    if not s:
        return None
    s_norm = re.sub(r"([+-]\d{2})(\d{2})$", r"\1:\2", s)
    try:
        return dt.datetime.fromisoformat(s_norm)
    except Exception:
        return None


def lire_executions(nom: str, depuis: dt.datetime) -> list[dict]:
    """Récupère toutes les exécutions du log .wrapper.log pour ce script."""
    log = LOG_DIR / f"{nom}.wrapper.log"
    if not log.exists():
        return []

    executions = []
    current = None
    for ligne in log.read_text(encoding="utf-8", errors="ignore").splitlines():
        m_start = re.match(r"\[(.+?)\] === Démarrage", ligne)
        m_end = re.match(r"\[(.+?)\] === Fin .+? exit=(\d+) .+? durée=(\d+)s", ligne)
        if m_start:
            current = {"start": parse_iso(m_start.group(1))}
        elif m_end and current:
            current["end"] = parse_iso(m_end.group(1))
            current["exit"] = int(m_end.group(2))
            current["duree"] = int(m_end.group(3))
            if current["end"] and current["end"] >= depuis:
                executions.append(current)
            current = None
    return executions


def compter_alertes_slack(depuis: dt.datetime) -> tuple[int, int]:
    """Retourne (nb_total, nb_errors) sur les 7 derniers jours."""
    log = LOG_DIR / "slack-notifications.log"
    if not log.exists():
        return 0, 0
    total = 0
    errors = 0
    for ligne in log.read_text(encoding="utf-8", errors="ignore").splitlines():
        m = re.match(r"\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\]", ligne)
        if not m:
            continue
        try:
            ts = dt.datetime.strptime(m.group(1), "%Y-%m-%d %H:%M:%S").replace(
                tzinfo=dt.timezone.utc
            )
        except ValueError:
            continue
        if ts.replace(tzinfo=None) >= depuis.replace(tzinfo=None):
            total += 1
            if m.group(2).lower() in ("error", "err"):
                errors += 1
    return total, errors


def construire_message() -> str:
    """Construit le message Slack au format Markdown léger."""
    now = dt.datetime.now().astimezone()
    depuis = now - dt.timedelta(days=7)

    lignes = []
    lignes.append(f"*Récapitulatif hebdomadaire automatisations Help Confort*")
    lignes.append(f"_Période : {depuis.strftime('%d/%m/%Y')} → {now.strftime('%d/%m/%Y')}_")
    lignes.append("")

    total_runs = 0
    total_echecs = 0

    lignes.append("*Exécutions par script :*")
    for nom in SCRIPTS:
        execs = lire_executions(nom, depuis)
        if not execs:
            lignes.append(f"• `{nom}` — aucune exécution enregistrée")
            continue
        nb = len(execs)
        nb_ko = sum(1 for e in execs if e["exit"] != 0)
        nb_ok = nb - nb_ko
        durees = [e["duree"] for e in execs]
        duree_moy = sum(durees) // len(durees)
        duree_max = max(durees)
        total_runs += nb
        total_echecs += nb_ko

        taux_ok = (nb_ok / nb) * 100
        emoji = ":white_check_mark:" if nb_ko == 0 else ":warning:"
        lignes.append(
            f"{emoji} `{nom}` — {nb} runs, {taux_ok:.0f}% OK "
            f"(durée moy. {duree_moy}s, max {duree_max}s)"
        )

    lignes.append("")
    lignes.append(f"*Total :* {total_runs} runs, {total_echecs} échecs sur la semaine.")

    nb_alertes, nb_alertes_err = compter_alertes_slack(depuis)
    lignes.append(
        f"*Alertes Slack émises :* {nb_alertes} ({nb_alertes_err} de niveau error)"
    )

    # Indicateur santé global
    if total_runs == 0:
        sante = ":grey_question: Aucune donnée"
    elif total_echecs == 0:
        sante = ":green_circle: Excellent"
    elif total_echecs / max(total_runs, 1) < 0.05:
        sante = ":yellow_circle: Bon (<5% d'échec)"
    else:
        sante = ":red_circle: À surveiller (>5% d'échec)"
    lignes.append(f"*Santé globale :* {sante}")

    lignes.append("")
    lignes.append("_Détail des logs : ~/Library/Logs/helpconfort/ — Dashboard : ~/Documents/HelpConfort/dashboard-automation.html_")

    return "\n".join(lignes)


def main() -> int:
    message = construire_message()
    # On envoie via notify-slack.sh
    if not NOTIFY_SLACK.exists():
        print("notify-slack.sh introuvable, affichage seulement :")
        print(message)
        return 1
    subprocess.run(
        [str(NOTIFY_SLACK), "ok", "Récap hebdo Help Confort", message],
        check=False,
    )
    print("Récap envoyé.")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
