#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
audit-matin.py
--------------
Audit technique quotidien du site Help Confort, exécuté à 7h00.

Vérifie :
  - Disponibilité (HTTP 200) de l'URL principale
  - Temps de réponse
  - Taille HTML (signal de bloat)
  - Disponibilité des pages critiques (contact, métiers)
  - Présence de mots-clés métier basiques dans le HTML d'accueil

Génère un rapport JSON daté dans ~/Library/Logs/helpconfort/audits/
et envoie une alerte Slack si l'un des seuils est dépassé.

Configuration : ~/.helpconfort/phase2.env
"""

import os
import sys
import json
import time
import logging
import datetime as dt
from pathlib import Path
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

HOME = Path.home()
LOG_DIR = Path(os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort"))
AUDIT_DIR = LOG_DIR / "audits"
CONFIG_FILE = Path(os.environ.get("HC_CONFIG_PHASE2", HOME / ".helpconfort/phase2.env"))


# -----------------------------------------------------------------------------
def charger_config(path: Path) -> dict:
    """Charge un fichier .env simple (KEY=VALUE), gère les commentaires en fin de ligne."""
    import re
    conf = {}
    if not path.exists():
        return conf
    for ligne in path.read_text(encoding="utf-8").splitlines():
        ligne = ligne.strip()
        if not ligne or ligne.startswith("#"):
            continue
        if "=" in ligne:
            k, _, v = ligne.partition("=")
            # Retirer commentaire en fin de ligne (précédé d'un espace)
            v = re.split(r"\s+#", v, maxsplit=1)[0].strip()
            # Retirer guillemets optionnels
            if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                v = v[1:-1]
            conf[k.strip()] = v
    return conf


def fetch_url(url: str, timeout: int = 10) -> dict:
    """Fait une requête GET, retourne dict avec status, duree_ms, taille_ko."""
    req = urlrequest.Request(url, headers={"User-Agent": "HelpConfort-Audit/1.0"})
    start = time.time()
    try:
        with urlrequest.urlopen(req, timeout=timeout) as resp:
            corps = resp.read()
            duree = int((time.time() - start) * 1000)
            return {
                "url": url,
                "status": resp.status,
                "duree_ms": duree,
                "taille_ko": len(corps) // 1024,
                "ok": True,
                "preview": corps[:500].decode("utf-8", "ignore") if resp.status == 200 else "",
            }
    except HTTPError as e:
        return {"url": url, "status": e.code, "duree_ms": int((time.time() - start) * 1000),
                "taille_ko": 0, "ok": False, "erreur": f"HTTP {e.code}"}
    except URLError as e:
        return {"url": url, "status": 0, "duree_ms": int((time.time() - start) * 1000),
                "taille_ko": 0, "ok": False, "erreur": f"URL error: {e.reason}"}
    except Exception as e:
        return {"url": url, "status": 0, "duree_ms": int((time.time() - start) * 1000),
                "taille_ko": 0, "ok": False, "erreur": str(e)}


def main() -> int:
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    log = logging.getLogger("audit-matin")

    conf = charger_config(CONFIG_FILE)
    base = conf.get("HC_SITE_URL", "https://helpconfort.com").rstrip("/")
    pages = [p.strip() for p in conf.get("HC_PAGES_CRITIQUES", "/").split(",") if p.strip()]
    seuil_tps = int(conf.get("HC_SEUIL_TEMPS_REPONSE_MS", 3000))
    seuil_taille = int(conf.get("HC_SEUIL_TAILLE_HTML_KO", 500))

    log.info("Audit de %s sur %d pages", base, len(pages))

    rapport = {
        "date": dt.date.today().isoformat(),
        "execute_le": dt.datetime.now().astimezone().isoformat(),
        "base": base,
        "pages": [],
        "anomalies": [],
    }

    # Audit de la page d'accueil avec analyse contenu
    accueil = fetch_url(base)
    if accueil["ok"]:
        preview = accueil.get("preview", "").lower()
        mots_attendus = ["plomberie", "serrurerie", "électricité"]
        absents = [m for m in mots_attendus if m not in preview]
        if absents:
            rapport["anomalies"].append(f"Page d'accueil : mots métier absents → {absents}")
    accueil.pop("preview", None)
    rapport["pages"].append(accueil)

    # Audit des autres pages
    for path in pages:
        if path == "/":
            continue  # déjà fait
        url = base + path
        res = fetch_url(url)
        res.pop("preview", None)
        rapport["pages"].append(res)

        if not res["ok"]:
            rapport["anomalies"].append(f"{path} : {res.get('erreur', 'inaccessible')}")
        elif res["duree_ms"] > seuil_tps:
            rapport["anomalies"].append(f"{path} : lent ({res['duree_ms']} ms > {seuil_tps})")
        elif res["taille_ko"] > seuil_taille:
            rapport["anomalies"].append(f"{path} : HTML lourd ({res['taille_ko']} Ko > {seuil_taille})")

    rapport["nb_anomalies"] = len(rapport["anomalies"])
    rapport["sante"] = "ok" if not rapport["anomalies"] else "anomalies"

    # Écriture du rapport
    fichier = AUDIT_DIR / f"audit-{rapport['date']}.json"
    fichier.write_text(json.dumps(rapport, indent=2, ensure_ascii=False), encoding="utf-8")
    log.info("Rapport écrit : %s (%d anomalies)", fichier, rapport["nb_anomalies"])

    # Alerte Slack si anomalies
    if rapport["anomalies"]:
        notify = os.environ.get("HC_NOTIFY_SCRIPT", "")
        if notify and Path(notify).exists():
            import subprocess
            msg = "\n".join(f"• {a}" for a in rapport["anomalies"][:10])
            subprocess.run(
                [notify, "warn", f"Audit matin Help Confort : {rapport['nb_anomalies']} anomalies",
                 f"Base : {base}\n{msg}\nDétail : {fichier}"],
                check=False,
            )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
