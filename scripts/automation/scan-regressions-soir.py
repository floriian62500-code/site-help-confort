#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
scan-regressions-soir.py
------------------------
Compare l'audit du jour (audit-matin) avec celui de la veille pour détecter
des régressions techniques :
  - Une page qui devient inaccessible
  - Une augmentation de temps de réponse > 50 %
  - Une augmentation de taille HTML > 30 %

Exécuté à 22h00 chaque jour.
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


def charger_audit(date_iso: str) -> dict | None:
    p = AUDIT_DIR / f"audit-{date_iso}.json"
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    log = logging.getLogger("scan-regressions-soir")

    aujourdhui = dt.date.today()
    hier = aujourdhui - dt.timedelta(days=1)

    audit_a = charger_audit(aujourdhui.isoformat())
    audit_h = charger_audit(hier.isoformat())

    if not audit_a:
        log.warning("Pas d'audit aujourd'hui (%s), rien à comparer.", aujourdhui)
        return 0
    if not audit_h:
        log.info("Pas d'audit hier (%s), première journée — aucune comparaison possible.", hier)
        return 0

    pages_a = {p["url"]: p for p in audit_a.get("pages", [])}
    pages_h = {p["url"]: p for p in audit_h.get("pages", [])}

    regressions = []

    for url, page_a in pages_a.items():
        page_h = pages_h.get(url)
        if not page_h:
            continue

        # 1. Page accessible avant, inaccessible aujourd'hui
        if page_h.get("ok") and not page_a.get("ok"):
            regressions.append(f"{url} : était OK hier, est maintenant en {page_a.get('erreur', 'erreur inconnue')}")
            continue

        # 2. Temps de réponse dégradé
        if page_h.get("duree_ms", 0) > 0 and page_a.get("duree_ms", 0) > 0:
            ratio = page_a["duree_ms"] / page_h["duree_ms"]
            if ratio > 1.5 and page_a["duree_ms"] > 1500:
                regressions.append(
                    f"{url} : temps de réponse x{ratio:.1f} "
                    f"({page_h['duree_ms']} ms → {page_a['duree_ms']} ms)"
                )

        # 3. Taille HTML qui explose
        if page_h.get("taille_ko", 0) > 0 and page_a.get("taille_ko", 0) > 0:
            ratio = page_a["taille_ko"] / page_h["taille_ko"]
            if ratio > 1.3 and page_a["taille_ko"] > 50:
                regressions.append(
                    f"{url} : taille HTML x{ratio:.1f} "
                    f"({page_h['taille_ko']} Ko → {page_a['taille_ko']} Ko)"
                )

    if not regressions:
        log.info("Aucune régression détectée par rapport à hier.")
        return 0

    log.warning("%d régression(s) détectée(s).", len(regressions))

    # Alerte Slack
    notify = os.environ.get("HC_NOTIFY_SCRIPT", "")
    if notify and Path(notify).exists():
        import subprocess
        msg = "\n".join(f"• {r}" for r in regressions[:15])
        subprocess.run(
            [notify, "warn", f"Régressions techniques détectées ({len(regressions)})",
             f"Comparaison {hier} vs {aujourdhui} :\n{msg}"],
            check=False,
        )

    return 1


if __name__ == "__main__":
    sys.exit(main())
