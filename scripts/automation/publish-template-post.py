#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations
"""
publish-template-post.py
------------------------
Publie le post Facebook du jour à partir du catalogue de templates
(catalog-posts.json), via l'Edge Function Supabase `publish-meta`
(mode `textPost`).

Architecture
~~~~~~~~~~~~
Aucun token Meta n'est stocké en local. Le Page Access Token est détenu
côté Supabase (table `app_settings`, clé `meta`) et rafraîchi
quotidiennement par `refresh-fb-token.sh` (qui appelle l'Edge Function
`refresh-meta-token`).

Ce script se contente de :
  1. Lire le catalogue local (catalog-posts.json)
  2. Sélectionner le template du jour selon (jour_semaine, semaine ISO % 8)
  3. POSTer le message à l'Edge Function `publish-meta` en mode texte
  4. Logger le résultat

Logique de sélection :
    rotation_index = numero_semaine_iso % 8
    cle = (jour_semaine, rotation_index)

Jours couverts par les templates : lundi, mardi, jeudi, vendredi, samedi.
Les mercredis et dimanches sont gérés par l'agent 7 (IA Cowork).

Variables d'environnement (recherchées dans cet ordre dans
~/.helpconfort/phase2.env puis $PROJECT_DIR/.autopush/.env) :
    SUPABASE_URL                 (requis)
    SUPABASE_SERVICE_ROLE_KEY    (requis — authentification cron de l'Edge Function)

Variables optionnelles :
    HC_CATALOG_PATH      chemin alternatif vers catalog-posts.json
    HC_LOG_DIR           dossier de logs (défaut : ~/Library/Logs/helpconfort)

Codes de sortie :
    0  succès (ou jour sans template)
    1  aucun template trouvé pour la combinaison jour/rotation
    2  catalogue introuvable
    3  configuration manquante (SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY)
    5  erreur HTTP de l'Edge Function (4xx/5xx)
    6  erreur réseau
    7  l'Edge Function a répondu mais Facebook a rejeté le post

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
from urllib.error import HTTPError, URLError

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------
HOME = Path.home()
PROJECT_DIR = Path(
    os.environ.get(
        "HC_PROJECT_DIR",
        HOME / "Documents/Claude/Projects/SITE INTERNET",
    )
)

CATALOG_PATH = Path(
    os.environ.get(
        "HC_CATALOG_PATH",
        PROJECT_DIR / "scripts/automation/catalog-posts.json",
    )
)

LOG_DIR = Path(os.environ.get("HC_LOG_DIR", HOME / "Library/Logs/helpconfort"))
LOG_FILE = LOG_DIR / "template-posts.log"

# Dossier des marqueurs anti-doublon (un fichier par jour de publication)
FLAG_DIR = LOG_DIR

# Fichiers .env recherchés (priorité décroissante)
ENV_FILES = [
    HOME / ".helpconfort/phase2.env",            # convention Florian (runtime)
    PROJECT_DIR / ".autopush/.env",              # fallback (autopush)
]

JOURS_TEMPLATES = {"lundi", "mardi", "jeudi", "vendredi", "samedi"}
JOURS_FR = {
    0: "lundi", 1: "mardi", 2: "mercredi", 3: "jeudi",
    4: "vendredi", 5: "samedi", 6: "dimanche",
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
# CHARGEMENT .env
# -----------------------------------------------------------------------------
def charger_env() -> dict[str, str]:
    """Charge les variables des fichiers .env puis applique l'environnement.

    Ordre de priorité (du moins prioritaire au plus prioritaire) :
      1. .autopush/.env       (fallback historique)
      2. ~/.helpconfort/phase2.env  (convention runtime)
      3. variables d'environnement réelles (launchd, shell, surcharges)
    """
    valeurs: dict[str, str] = {}
    # On parcourt les fichiers du moins prioritaire au plus prioritaire
    for env_file in reversed(ENV_FILES):
        if not env_file.exists():
            continue
        log.info("Chargement .env : %s", env_file)
        for ligne in env_file.read_text(encoding="utf-8").splitlines():
            ligne = ligne.strip()
            if not ligne or ligne.startswith("#") or "=" not in ligne:
                continue
            cle, _, val = ligne.partition("=")
            cle = cle.strip()
            val = val.strip().strip('"').strip("'")
            valeurs[cle] = val   # écrase si déjà présent
    # Surcharge finale par l'environnement réel
    for cle, val in os.environ.items():
        if val:
            valeurs[cle] = val
    return valeurs


# -----------------------------------------------------------------------------
# CATALOGUE & SÉLECTION
# -----------------------------------------------------------------------------
def charger_catalogue() -> list[dict]:
    if not CATALOG_PATH.exists():
        log.error("Catalogue introuvable : %s", CATALOG_PATH)
        sys.exit(2)
    with CATALOG_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    return data.get("templates", [])


def selectionner_template(templates: list[dict], aujourdhui: dt.date) -> dict | None:
    jour = JOURS_FR[aujourdhui.weekday()]
    rotation = aujourdhui.isocalendar().week % 8
    log.info("Recherche template : jour=%s, rotation=%d", jour, rotation)
    for t in templates:
        if t.get("jour") == jour and t.get("rotation") == rotation:
            return t
    return None


def construire_message(template: dict) -> str:
    texte = template.get("texte", "").strip()
    hashtags = " ".join(template.get("hashtags", []))
    if hashtags:
        return f"{texte}\n\n{hashtags}".strip()
    return texte


# -----------------------------------------------------------------------------
# APPEL EDGE FUNCTION
# -----------------------------------------------------------------------------
def publier_via_edge(
    message: str,
    supabase_url: str,
    service_key: str,
    log_key: str,
    photo_url: str | None = None,
) -> dict:
    """Appelle l'Edge Function publish-meta en mode textPost."""
    endpoint = supabase_url.rstrip("/") + "/functions/v1/publish-meta"
    payload: dict = {
        "textPost": {
            "message": message,
            "logKey": log_key,
        },
        "targets": {"facebook": True, "instagram": False},
    }
    if photo_url:
        payload["textPost"]["photoUrl"] = photo_url

    body = json.dumps(payload).encode("utf-8")
    req = urlrequest.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urlrequest.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            log.info("Réponse Edge Function (HTTP %d) : %s", resp.status, raw)
            return json.loads(raw)
    except HTTPError as e:
        contenu = e.read().decode("utf-8", "ignore")
        log.error("Erreur HTTP %d de l'Edge Function : %s", e.code, contenu)
        sys.exit(5)
    except URLError as e:
        log.error("Erreur réseau vers l'Edge Function : %s", e.reason)
        sys.exit(6)


# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------
def main() -> None:
    aujourdhui = dt.date.today()
    jour = JOURS_FR[aujourdhui.weekday()]
    log.info("=== Lancement publish-template-post.py — %s (%s) ===", aujourdhui, jour)

    # Garde anti-doublon : si un post a déjà été publié aujourd'hui avec succès,
    # on sort immédiatement (sauf en --dry-run).
    flag_file = FLAG_DIR / f"published-{aujourdhui.isoformat()}.flag"
    if flag_file.exists() and "--dry-run" not in sys.argv and "--force" not in sys.argv:
        log.info(
            "Publication déjà effectuée aujourd'hui (%s existe). Skip pour éviter doublon. "
            "Utiliser --force pour bypasser.",
            flag_file,
        )
        return

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

    # Identifiant de traçabilité côté Supabase
    rotation = aujourdhui.isocalendar().week % 8
    log_key = f"template-{jour}-r{rotation}-{aujourdhui.isoformat()}"

    # Mode dry-run : pas de publication
    if "--dry-run" in sys.argv:
        print("--- DRY RUN ---")
        print(f"logKey : {log_key}")
        print(f"thème  : {template.get('theme')}")
        print("--- Message Facebook ---")
        print(message)
        print("--- /DRY RUN ---")
        log.info("Dry-run : pas de publication.")
        return

    # Chargement de la configuration .env
    env = charger_env()
    supabase_url = env.get("SUPABASE_URL", "").strip()
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not supabase_url or not service_key:
        log.error(
            "Configuration manquante. Requis : SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY "
            "dans %s (ou %s).",
            ENV_FILES[0],
            ENV_FILES[1],
        )
        sys.exit(3)

    # Appel de l'Edge Function
    resultat = publier_via_edge(
        message=message,
        supabase_url=supabase_url,
        service_key=service_key,
        log_key=log_key,
    )

    # Analyse de la réponse
    if not resultat.get("success"):
        log.error("Edge Function a répondu sans success=true : %s", resultat)
        sys.exit(7)

    fb = (resultat.get("results") or {}).get("facebook") or {}
    if fb.get("error"):
        log.error("Facebook a rejeté le post : %s", fb["error"])
        sys.exit(7)

    log.info(
        "Post publié — postId=%s url=%s",
        fb.get("postId", "?"),
        fb.get("url", "?"),
    )

    # Crée le marqueur anti-doublon pour la journée
    flag_file.parent.mkdir(parents=True, exist_ok=True)
    flag_file.write_text(
        json.dumps({
            "date": aujourdhui.isoformat(),
            "jour": jour,
            "theme": template.get("theme"),
            "logKey": log_key,
            "postId": fb.get("postId"),
            "url": fb.get("url"),
            "published_at": dt.datetime.now().isoformat(timespec="seconds"),
        }, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    log.info("Marqueur anti-doublon créé : %s", flag_file)


if __name__ == "__main__":
    main()
