#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
rapport-hebdo.py
----------------
Synthèse hebdomadaire du dimanche 22h30 :
  - Bilan des audits techniques (7 derniers jours)
  - Bilan business cumulé si Supabase configuré
  - Régressions notables

Poste un récap consolidé sur Slack et écrit un JSON archive.
"""

import os
import sys
import json
import logging
import datetime as dt
from pathlib import Path

HOME = Path.home()
LOG_DIR = Path(os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort"))
AUDIT_DIR = LOG_DIR / "audits"
RECAP_DIR = LOG_DIR / "recaps-business"
HEBDO_DIR = LOG_DIR / "rapports-hebdo"


def charger_jsons(dossier: Path, depuis: dt.date) -> list[dict]:
    if not dossier.exists():
        return []
    rapports = []
    for fichier in sorted(dossier.glob("*.json")):
        try:
            d = json.loads(fichier.read_text(encoding="utf-8"))
            date_str = d.get("date", "")
            try:
                date_obj = dt.date.fromisoformat(date_str)
                if date_obj >= depuis:
                    rapports.append(d)
            except ValueError:
                continue
        except Exception:
            continue
    return rapports


def main() -> int:
    HEBDO_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    log = logging.getLogger("rapport-hebdo")

    aujourdhui = dt.date.today()
    depuis = aujourdhui - dt.timedelta(days=7)

    audits = charger_jsons(AUDIT_DIR, depuis)
    recaps = charger_jsons(RECAP_DIR, depuis)

    total_anomalies = sum(a.get("nb_anomalies", 0) for a in audits)
    jours_avec_anomalies = sum(1 for a in audits if a.get("nb_anomalies", 0) > 0)

    rapport = {
        "semaine_du": depuis.isoformat(),
        "semaine_au": aujourdhui.isoformat(),
        "audits_realises": len(audits),
        "anomalies_techniques_cumulees": total_anomalies,
        "jours_avec_anomalies": jours_avec_anomalies,
    }

    # Synthèse business si données présentes
    if recaps:
        rapport["business"] = {
            "leads_cumules": sum(r.get("leads", 0) for r in recaps),
            "contrats_cumules": sum(r.get("contrats", 0) for r in recaps),
            "interventions_cumulees": sum(r.get("interventions", 0) for r in recaps),
            "avis_cumules": sum(r.get("avis", 0) for r in recaps),
        }
        notes = [r.get("note_moyenne_jour") for r in recaps if r.get("note_moyenne_jour")]
        if notes:
            rapport["business"]["note_moyenne_semaine"] = round(sum(notes) / len(notes), 2)
    else:
        rapport["business"] = "non disponible (Supabase non configuré)"

    fichier = HEBDO_DIR / f"hebdo-{aujourdhui.isoformat()}.json"
    fichier.write_text(json.dumps(rapport, indent=2, ensure_ascii=False), encoding="utf-8")
    log.info("Rapport hebdo écrit : %s", fichier)

    # Message Slack
    notify = os.environ.get("HC_NOTIFY_SCRIPT", "")
    if notify and Path(notify).exists():
        import subprocess
        msg_lignes = [
            f"*Semaine du {depuis.strftime('%d/%m')} au {aujourdhui.strftime('%d/%m/%Y')}*",
            f"• Audits techniques : {len(audits)} réalisés, "
            f"{total_anomalies} anomalies au total ({jours_avec_anomalies} jours touchés)",
        ]
        if isinstance(rapport["business"], dict):
            b = rapport["business"]
            msg_lignes.append(
                f"• Business : {b['leads_cumules']} leads, {b['contrats_cumules']} contrats, "
                f"{b['interventions_cumulees']} interventions, {b['avis_cumules']} avis"
            )
            if "note_moyenne_semaine" in b:
                msg_lignes.append(f"• Note moyenne de la semaine : {b['note_moyenne_semaine']}/5")
        else:
            msg_lignes.append("• Business : Supabase non configuré, métriques indisponibles")

        subprocess.run(
            [notify, "ok", "Rapport hebdo Help Confort", "\n".join(msg_lignes)],
            check=False,
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
