#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
check-health.py
---------------
Vérifie toutes les heures que chaque script automatisé Help Confort a bien
tourné dans son créneau attendu. Alerte Slack si :
  - le fichier témoin .last est introuvable
  - le fichier témoin date d'avant la dernière exécution attendue
  - le dernier exit_code n'est pas 0

Génère aussi statut-health.json (utilisable pour un dashboard).

Auteur : Help Confort — Phase 4 observabilité
Date   : 2026-05-16
"""

import json
import os
import sys
import subprocess
import datetime as dt
from pathlib import Path

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------
HOME = Path.home()

LOG_DIR = Path(os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort"))
HEALTH_DIR = LOG_DIR / "health"
STATUS_FILE = HEALTH_DIR / "statut-health.json"

NOTIFY_SLACK = Path(
    os.environ.get(
        "HC_NOTIFY_SCRIPT",
        HOME / "Documents/Claude/Projects/SITE INTERNET/scripts/automation/monitoring/notify-slack.sh",
    )
)

# Inventaire des scripts attendus :
#   "frequency_minutes" indique l'intervalle maximal acceptable entre deux runs.
#   Au-delà, on considère que le script a manqué un créneau.
#   On ajoute une marge de tolérance de 30 % via TOLERANCE_FACTOR.
TOLERANCE_FACTOR = 1.3

SCRIPTS_ATTENDUS = {
    # Phase 1
    "refresh-fb-token":        {"frequency_minutes": 60 * 24,    "criticite": "high"},
    "sync-social":             {"frequency_minutes": 60 * 24,    "criticite": "medium"},
    "monitoring-uptime":       {"frequency_minutes": 60,         "criticite": "high"},
    # Phase 2
    "audit-matin":             {"frequency_minutes": 60 * 24,    "criticite": "high"},
    "recap-business":          {"frequency_minutes": 60 * 24,    "criticite": "medium"},
    "scan-regressions-soir":   {"frequency_minutes": 60 * 24,    "criticite": "medium"},
    "rapport-hebdo":           {"frequency_minutes": 60 * 24 * 7, "criticite": "low"},
    # Phase 3
    "template-post":           {"frequency_minutes": 60 * 24,    "criticite": "medium"},
}


# -----------------------------------------------------------------------------
def lire_temoin(nom: str) -> dict | None:
    """Charge le fichier .last d'un script si présent."""
    p = HEALTH_DIR / f"{nom}.last"
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return {"corrompu": True, "path": str(p)}


def parse_iso(s: str) -> dt.datetime | None:
    """Parse une chaîne ISO 8601 avec offset (avec ou sans deux-points)."""
    if not s:
        return None
    # Normalisation : ajouter deux-points dans offset +HHMM si absent
    import re
    s_norm = re.sub(r"([+-]\d{2})(\d{2})$", r"\1:\2", s)
    try:
        return dt.datetime.fromisoformat(s_norm)
    except Exception:
        pass
    # Tentative supplémentaire : sans offset (suppose UTC)
    try:
        d = dt.datetime.fromisoformat(s_norm.split("+")[0].split("-")[0])
        return d.replace(tzinfo=dt.timezone.utc)
    except Exception:
        return None


def envoyer_alerte(niveau: str, titre: str, message: str) -> None:
    """Envoie une notification Slack via le script bash."""
    if not NOTIFY_SLACK.exists():
        print(f"[WARN] notify-slack.sh introuvable : {NOTIFY_SLACK}")
        return
    try:
        subprocess.run(
            [str(NOTIFY_SLACK), niveau, titre, message],
            check=False,
            timeout=15,
        )
    except Exception as e:
        print(f"[ERROR] envoi Slack échoué : {e}")


# -----------------------------------------------------------------------------
def main() -> int:
    HEALTH_DIR.mkdir(parents=True, exist_ok=True)
    now = dt.datetime.now().astimezone()
    rapport = {
        "verifie_le": now.isoformat(),
        "scripts": [],
        "anomalies": 0,
    }

    anomalies_textes = []

    for nom, params in SCRIPTS_ATTENDUS.items():
        freq = params["frequency_minutes"]
        criticite = params["criticite"]
        tolerance = dt.timedelta(minutes=freq * TOLERANCE_FACTOR)

        temoin = lire_temoin(nom)
        statut = {"nom": nom, "criticite": criticite, "frequence_min": freq}

        if temoin is None:
            statut["statut"] = "absent"
            statut["message"] = "Aucun fichier témoin trouvé."
            rapport["anomalies"] += 1
            anomalies_textes.append(f"[{criticite}] {nom} : aucun témoin (jamais exécuté ?)")
            rapport["scripts"].append(statut)
            continue

        if temoin.get("corrompu"):
            statut["statut"] = "corrompu"
            statut["message"] = f"Témoin illisible : {temoin.get('path')}"
            rapport["anomalies"] += 1
            anomalies_textes.append(f"[{criticite}] {nom} : témoin corrompu")
            rapport["scripts"].append(statut)
            continue

        last_exec = parse_iso(temoin.get("derniere_execution", ""))
        exit_code = temoin.get("exit_code", -1)

        statut["derniere_execution"] = temoin.get("derniere_execution")
        statut["exit_code"] = exit_code
        statut["duree_secondes"] = temoin.get("duree_secondes")

        if last_exec is None:
            statut["statut"] = "date-invalide"
            rapport["anomalies"] += 1
            anomalies_textes.append(f"[{criticite}] {nom} : date d'exécution illisible")
        elif (now - last_exec) > tolerance:
            statut["statut"] = "manque-creneau"
            statut["retard_secondes"] = int((now - last_exec).total_seconds())
            rapport["anomalies"] += 1
            anomalies_textes.append(
                f"[{criticite}] {nom} : pas tourné depuis "
                f"{int((now - last_exec).total_seconds() / 60)} min "
                f"(seuil {int(freq * TOLERANCE_FACTOR)} min)"
            )
        elif exit_code != 0:
            statut["statut"] = "echec-dernier-run"
            rapport["anomalies"] += 1
            anomalies_textes.append(f"[{criticite}] {nom} : dernier exit={exit_code}")
        else:
            statut["statut"] = "ok"

        rapport["scripts"].append(statut)

    # Écriture du rapport JSON (pour dashboard ou audit)
    STATUS_FILE.write_text(json.dumps(rapport, indent=2, ensure_ascii=False), encoding="utf-8")

    # Envoi alerte si anomalies (consolidée en un seul message)
    if anomalies_textes:
        haute_criticite = any("[high]" in a for a in anomalies_textes)
        niveau = "error" if haute_criticite else "warn"
        message = "\n".join(f"• {a}" for a in anomalies_textes)
        envoyer_alerte(
            niveau,
            f"Healthcheck Help Confort : {len(anomalies_textes)} anomalie(s)",
            message,
        )

    print(f"Check terminé : {len(rapport['scripts'])} scripts, "
          f"{rapport['anomalies']} anomalie(s).")
    print(f"Rapport : {STATUS_FILE}")
    return 0 if rapport["anomalies"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
