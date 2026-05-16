#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
recap-business.py
-----------------
Récap business du jour à 18h (lundi à samedi) :
  - Nb de leads créés aujourd'hui
  - Nb de contrats signés
  - Nb d'interventions réalisées
  - Nouveaux avis reçus

Lit Supabase si configuré (SUPABASE_URL + SUPABASE_KEY dans phase2.env).
Sinon, log un message clair et n'envoie rien.

Le récap est posté sur Slack en plus d'être logué localement.
"""

import os
import sys
import json
import logging
import datetime as dt
from pathlib import Path
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

HOME = Path.home()
LOG_DIR = Path(os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort"))
RECAP_DIR = LOG_DIR / "recaps-business"
CONFIG_FILE = Path(os.environ.get("HC_CONFIG_PHASE2", HOME / ".helpconfort/phase2.env"))


def charger_config(path: Path) -> dict:
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
            v = re.split(r"\s+#", v, maxsplit=1)[0].strip()
            if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                v = v[1:-1]
            conf[k.strip()] = v
    return conf


def query_supabase(base_url: str, key: str, table: str, params: str = "") -> list:
    """Requête simple via API REST Supabase (PostgREST)."""
    url = f"{base_url}/rest/v1/{table}?{params}"
    req = urlrequest.Request(url, headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    })
    try:
        with urlrequest.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (HTTPError, URLError) as e:
        raise RuntimeError(f"Erreur Supabase sur {table} : {e}")


def main() -> int:
    RECAP_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    log = logging.getLogger("recap-business")

    conf = charger_config(CONFIG_FILE)
    supabase_url = conf.get("SUPABASE_URL", "").strip()
    supabase_key = conf.get("SUPABASE_KEY", "").strip()

    if not supabase_url or not supabase_key:
        msg = ("Supabase non configuré dans ~/.helpconfort/phase2.env. "
               "Le récap business est en pause. "
               "Renseigne SUPABASE_URL et SUPABASE_KEY pour activer.")
        log.warning(msg)
        return 0  # pas une erreur : config volontairement vide

    aujourdhui = dt.date.today().isoformat()
    filtre_jour = f"created_at=gte.{aujourdhui}T00:00:00&created_at=lte.{aujourdhui}T23:59:59"

    table_leads = conf.get("HC_TABLE_LEADS", "leads")
    table_contrats = conf.get("HC_TABLE_CONTRATS", "contracts")
    table_avis = conf.get("HC_TABLE_AVIS", "reviews")
    table_interv = conf.get("HC_TABLE_INTERVENTIONS", "service_orders")

    rapport = {"date": aujourdhui, "execute_le": dt.datetime.now().astimezone().isoformat()}

    try:
        leads = query_supabase(supabase_url, supabase_key, table_leads, f"select=id&{filtre_jour}")
        contrats = query_supabase(supabase_url, supabase_key, table_contrats, f"select=id&{filtre_jour}")
        interv = query_supabase(supabase_url, supabase_key, table_interv, f"select=id&{filtre_jour}")
        avis = query_supabase(supabase_url, supabase_key, table_avis, f"select=id,rating&{filtre_jour}")
    except RuntimeError as e:
        log.error(str(e))
        return 2

    rapport["leads"] = len(leads)
    rapport["contrats"] = len(contrats)
    rapport["interventions"] = len(interv)
    rapport["avis"] = len(avis)

    notes = [a.get("rating", 0) for a in avis if isinstance(a, dict)]
    rapport["note_moyenne_jour"] = round(sum(notes) / len(notes), 2) if notes else None

    fichier = RECAP_DIR / f"recap-{aujourdhui}.json"
    fichier.write_text(json.dumps(rapport, indent=2, ensure_ascii=False), encoding="utf-8")
    log.info("Récap écrit : %s", fichier)

    # Post Slack
    notify = os.environ.get("HC_NOTIFY_SCRIPT", "")
    if notify and Path(notify).exists():
        import subprocess
        moy = f" — note moyenne {rapport['note_moyenne_jour']}/5" if rapport["note_moyenne_jour"] else ""
        msg = (
            f"• {rapport['leads']} leads\n"
            f"• {rapport['contrats']} contrats signés\n"
            f"• {rapport['interventions']} interventions réalisées\n"
            f"• {rapport['avis']} nouveaux avis{moy}"
        )
        subprocess.run(
            [notify, "ok", f"Récap business {aujourdhui}", msg],
            check=False,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
