#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
publish-template-post.py
------------------------
Publie le post Facebook (et Google Business Profile) du jour à partir du
catalogue de templates (catalog-posts.json).

Logique de sélection :
    rotation_index = numero_semaine_iso % 8
    cle = (jour_semaine, rotation_index)

Jours couverts par les templates : lundi, mardi, jeudi, vendredi, samedi.
Les mercredis et dimanches sont gérés par l'agent 7 (IA Cowork).

Si le script est appelé un mercredi ou dimanche, il ne fait rien et logge.

Auteur : Help Confort — Phase 3 automatisation
Date   : 2026-05-16
"""

import json
import os
import sys
import logging
import datetime as dt
from pathlib import Path
from urllib import request as urlrequest
from urllib import parse as urlparse
from urllib.error import HTTPError, URLError

# -----------------------------------------------------------------------------
# CONFIGURATION — à ajuster si besoin selon l'environnement
# -----------------------------------------------------------------------------
HOME = Path.home()

CATALOG_PATH = Path(
    os.environ.get(
        "HC_CATALOG_PATH",
        HOME / "Documents/Claude/Projects/SITE INTERNET/scripts/automation/catalog-posts.json",
    )
)

FB_TOKEN_PATH = Path(
    os.environ.get("HC_FB_TOKEN_PATH", HOME / ".helpconfort/fb_token.txt")
)

FB_PAGE_ID = os.environ.get("HC_FB_PAGE_ID", "")  # à renseigner via env ou launchd

LOG_DIR = Path(
    os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort")
)
LOG_FILE = LOG_DIR / "template-posts.log"

# Jours qui utilisent ce script (les autres sont gérés par l'IA)
JOURS_TEMPLATES = {"lundi", "mardi", "jeudi", "vendredi", "samedi"}

# Mapping Python (0=Mon) -> français
JOURS_FR = {
    0: "lundi",
    1: "mardi",
    2: "mercredi",
    3: "jeudi",
    4: "vendredi",
    5: "samedi",
    6: "dimanche",
}


# -----------------------------------------------------------------------------
# LOGGING
# -----------------------------------------------------------------------------
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("publish-template-post")


# -----------------------------------------------------------------------------
# FONCTIONS
# -----------------------------------------------------------------------------
def charger_catalogue() -> list[dict]:
    """Charge la liste des templates depuis le fichier JSON."""
    if not CATALOG_PATH.exists():
        log.error("Catalogue introuvable : %s", CATALOG_PATH)
        sys.exit(2)
    with CATALOG_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    return data.get("templates", [])


def selectionner_template(templates: list[dict], aujourdhui: dt.date) -> dict | None:
    """Retourne le template correspondant au jour et à la semaine."""
    jour = JOURS_FR[aujourdhui.weekday()]
    rotation = aujourdhui.isocalendar().week % 8
    log.info("Recherche template : jour=%s, rotation=%d", jour, rotation)

    for t in templates:
        if t["jour"] == jour and t["rotation"] == rotation:
            return t
    return None


def construire_message(template: dict) -> str:
    """Concatène le texte du template avec les hashtags."""
    texte = template["texte"].strip()
    hashtags = " ".join(template.get("hashtags", []))
    return f"{texte}\n\n{hashtags}".strip()


def charger_token_fb() -> str:
    """Lit le Page Access Token Facebook."""
    if not FB_TOKEN_PATH.exists():
        log.error("Token Facebook introuvable : %s", FB_TOKEN_PATH)
        sys.exit(3)
    return FB_TOKEN_PATH.read_text(encoding="utf-8").strip()


def publier_facebook(message: str, page_id: str, token: str) -> dict:
    """Poste le message sur la page Facebook via l'API Graph."""
    if not page_id:
        log.error("HC_FB_PAGE_ID non défini.")
        sys.exit(4)

    url = f"https://graph.facebook.com/v20.0/{page_id}/feed"
    data = urlparse.urlencode({"message": message, "access_token": token}).encode()

    req = urlrequest.Request(url, data=data, method="POST")
    try:
        with urlrequest.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            log.info("Réponse Facebook : %s", body)
            return json.loads(body)
    except HTTPError as e:
        log.error("Erreur HTTP Facebook %s : %s", e.code, e.read().decode("utf-8", "ignore"))
        sys.exit(5)
    except URLError as e:
        log.error("Erreur réseau Facebook : %s", e.reason)
        sys.exit(6)


# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------
def main() -> None:
    aujourdhui = dt.date.today()
    jour = JOURS_FR[aujourdhui.weekday()]
    log.info("=== Lancement publish-template-post.py — %s (%s) ===", aujourdhui, jour)

    if jour not in JOURS_TEMPLATES:
        log.info("Jour %s non couvert par les templates (géré par l'agent IA). Arrêt.", jour)
        return

    templates = charger_catalogue()
    log.info("%d templates chargés.", len(templates))

    template = selectionner_template(templates, aujourdhui)
    if template is None:
        log.error("Aucun template trouvé pour ce jour et cette rotation.")
        sys.exit(1)

    log.info("Template sélectionné : thème=%s", template.get("theme"))
    message = construire_message(template)
    log.info("Message construit (%d caractères).", len(message))

    # Mode dry-run pour test sans publication
    if "--dry-run" in sys.argv:
        print("--- DRY RUN ---")
        print(message)
        print("--- /DRY RUN ---")
        log.info("Dry-run : pas de publication.")
        return

    token = charger_token_fb()
    resultat = publier_facebook(message, FB_PAGE_ID, token)
    log.info("Post publié avec id=%s", resultat.get("id", "?"))


if __name__ == "__main__":
    main()
