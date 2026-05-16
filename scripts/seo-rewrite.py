#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
seo-rewrite.py — Réécriture SEO automatique des <title> et meta descriptions
trop longs détectés par maintenance-scan.py.

Pages principales : mapping manuel pour préserver l'intent SEO.
Pages actualités  : troncature intelligente (préserve mots entiers, suffixe marque).

Usage :
    python3 scripts/seo-rewrite.py [--dry-run]
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ─────────────────────────────────────────────────────────────────────
# MAPPING MANUEL — Pages principales
# Cible : title 55-65c, description 140-155c
# ─────────────────────────────────────────────────────────────────────

OVERRIDES = {
    # Index racine
    "index.html": {
        "title": "Plombier, Chauffagiste, Électricien Saint-Omer | HELP Confort",
        # 65c, garde mots-clés + marque
        "desc": "Dépannage 7j/7 plomberie, chauffage, électricité, serrurerie à Saint-Omer & Dunkerque. 4,7/5 sur 343 avis. Devis gratuit au 03 66 10 01 34.",
        # 152c
    },

    # Pages métiers
    "chauffagiste-saint-omer.html": {
        "title": "Chauffagiste Saint-Omer — Dépannage Chaudière | HELP Confort",
        # 64c
        "desc": "Chauffagiste à Saint-Omer : dépannage chaudière, entretien gaz/fioul, désembouage. Intervention 7j/7. Devis gratuit au 03 66 10 01 34.",
        # 138c
    },
    "travaux-saint-omer.html": {
        "title": "Travaux Saint-Omer — Rénovation, Menuiserie, Volets | HELP Confort",
        # 67c
        "desc": "Rénovation, menuiserie, volets, adaptation PMR à Saint-Omer & Dunkerque. Un seul interlocuteur pour tous vos travaux. Devis gratuit.",
        # 134c
    },
    "contrats-entretien.html": {
        "title": "Contrats d'entretien chaudière Saint-Omer | HELP Confort",
        # 58c
        "desc": "Contrats d'entretien chaudière gaz, fioul et adoucisseur dès 9 €/mois. Visite annuelle, dépannage prioritaire. Saint-Omer & Dunkerque.",
        # 137c
    },

    # Pages dépannage par ville
    "depannage-saint-omer.html": {
        "title": "Dépannage Saint-Omer 7j/7 — Plombier, Chauffage | HELP Confort",
        # 65c
        "desc": "Dépannage urgent à Saint-Omer : plomberie, chauffage, électricité, serrurerie. Intervention rapide 7j/7. 4,7/5 sur 343 avis. 03 66 10 01 34.",
        # 145c
    },
    "depannage-dunkerque.html": {
        "title": "Dépannage Dunkerque 7j/7 — Plomberie, Chauffage | HELP Confort",
        # 65c
        "desc": "Dépannage à Dunkerque : plombier, chauffagiste, électricien, serrurier. Intervention rapide 7j/7. 4,7/5 sur 343 avis. 03 66 10 01 34.",
        # 139c
    },
    "depannage-arques.html": {
        "title": "Dépannage Arques (62510) — Plomberie, Chauffage | HELP Confort",
        # 65c
        "desc": "Dépannage à Arques (62510) : plomberie, chauffage, électricité, serrurerie. À 5 km de Saint-Omer. Devis gratuit au 03 66 10 01 34.",
        # 135c
    },
    "depannage-bergues.html": {
        "title": "Dépannage Bergues (59380) — Plomberie, Chauffage | HELP Confort",
        # 65c
        "desc": "Dépannage à Bergues (59380) : plomberie, chauffage, électricité, serrurerie. À 15 km de Dunkerque. Devis gratuit au 03 66 10 01 34.",
        # 135c
    },
    "depannage-gravelines.html": {
        "title": "Dépannage Gravelines (59820) — Plomberie, Chauffage | HELP Confort",
        # 68c
        "desc": "Dépannage à Gravelines (59820) : plomberie, chauffage, électricité. À 25 km de Dunkerque. 4,7/5 sur 343 avis. 03 66 10 01 34.",
        # 132c
    },
    "depannage-longuenesse.html": {
        "title": "Dépannage Longuenesse (62219) — Plombier, Chauffage | HELP Confort",
        # 69c (limite)
        "desc": "Dépannage à Longuenesse (62219) : plomberie, chauffage, électricité, serrurerie. À 3 km de Saint-Omer. Devis gratuit au 03 66 10 01 34.",
        # 141c
    },
    "depannage-saint-martin-lez-tatinghem.html": {
        "title": "Dépannage Saint-Martin-lez-Tatinghem (62500) | HELP Confort",
        # 60c
        "desc": "Dépannage Saint-Martin-lez-Tatinghem : plombier, chauffagiste, électricien. À 2 km de Saint-Omer. Intervention rapide 7j/7. 03 66 10 01 34.",
        # 142c
    },

    # Pages publiques
    "actualites.html": {
        "title": "Actualités HELP Confort Saint-Omer — Conseils & Infos",
        # 56c
        "desc": "Toutes les actualités de HELP Confort : nos conseils saisonniers, interventions récentes et nouveautés sur Saint-Omer & Dunkerque.",
        # 135c
    },
    "realisations.html": {
        "title": "Nos réalisations — Chantiers Plomberie, Chauffage | HELP Confort",
        # 67c
        "desc": "Découvrez nos chantiers récents à Saint-Omer & Dunkerque : plomberie, chauffage, vitrerie, rénovation. Photos avant/après et témoignages.",
        # 142c
    },
    "carrieres.html": {
        "title": "Recrutement — Rejoignez HELP Confort Saint-Omer",
        # 49c
        "desc": "HELP Confort recrute plombiers, chauffagistes, électriciens à Saint-Omer & Dunkerque. CDI, équipe locale, formation continue. Rejoignez-nous.",
        # 145c
    },
    "pro.html": {
        "title": "Espace Pro — Assurances, Syndics, Bailleurs | HELP Confort",
        # 60c
        "desc": "Solutions pro pour assurances, syndics, bailleurs et collectivités : interventions multi-sites, reporting, conventions. 4,7/5 sur 343 avis.",
        # 145c
    },
    "sinistres.html": {
        "title": "Gestion sinistres — Interventions assurance | HELP Confort",
        # 60c
        "desc": "Intervention rapide après sinistre (dégât des eaux, vol, incendie) : devis, photos, rapport pour votre assurance. Saint-Omer & Dunkerque.",
        # 140c
    },
    "a-propos.html": {
        "title": "À propos — HELP Confort Saint-Omer & Dunkerque",
        "desc": "HELP Confort, SARL Dépan'Audo : un réseau local de plombiers, chauffagistes, électriciens à Saint-Omer & Dunkerque. 343 avis 4,7/5.",
        # 132c
    },
    "guides.html": {
        "title": "Guides pratiques — Plomberie, Chauffage, Électricité",
        "desc": "Guides HELP Confort : entretien chaudière, fuite d'eau, mise aux normes électriques, adaptation PMR. Conseils d'experts à Saint-Omer.",
        # 137c
    },
    "processus.html": {
        "title": "Notre processus en 7 étapes — De l'appel à la facture",
        # 55c
        "desc": None,  # déjà OK
    },
    "guide-mise-aux-normes-electriques.html": {
        "title": "Mise aux normes électriques NF C 15-100 — Guide complet",
        # 56c
        "desc": None,  # déjà OK
    },
}

# Suffixe marque pour actualités
ACTU_SUFFIX = " — HELP Confort"
ACTU_TITLE_MAX = 65   # max final (incluant suffix)
ACTU_DESC_MAX = 155


TITLE_RX = re.compile(r"(<title[^>]*>)([^<]+)(</title>)", re.IGNORECASE)
META_DESC_RX = re.compile(
    r'(<meta\s+name="description"\s+content=")([^"]+)(")', re.IGNORECASE
)
OG_TITLE_RX = re.compile(
    r'(<meta\s+property="og:title"\s+content=")([^"]+)(")', re.IGNORECASE
)
OG_DESC_RX = re.compile(
    r'(<meta\s+property="og:description"\s+content=")([^"]+)(")', re.IGNORECASE
)


def smart_truncate(text: str, max_chars: int, suffix: str = "") -> str:
    """Tronque au mot près en gardant un suffixe optionnel."""
    text = text.strip()
    budget = max_chars - len(suffix)
    if len(text) <= budget:
        return text + suffix
    cut = text[:budget].rsplit(" ", 1)[0].rstrip(",;.:—–-")
    return cut + suffix


def rewrite_actu(rel: str, file_path: Path) -> tuple[bool, str]:
    """Réécrit title + meta desc d'une actualité. Retourne (modifié, message)."""
    txt = file_path.read_text(encoding="utf-8")
    changes = []

    # Title
    m = TITLE_RX.search(txt)
    if m:
        current = html.unescape(m.group(2)).strip()
        # Supprimer les suffixes existants de marque
        stripped = re.sub(r"\s*[—–-]\s*HELP!\s*Confort.*$", "", current).strip()
        if len(current) > 70:
            new = smart_truncate(stripped, ACTU_TITLE_MAX, ACTU_SUFFIX)
            if new != current:
                txt = txt.replace(m.group(0), m.group(1) + html.escape(new, quote=False) + m.group(3), 1)
                changes.append(f"title {len(current)}→{len(new)}c")

    # Meta description
    m = META_DESC_RX.search(txt)
    if m:
        current = html.unescape(m.group(2)).strip()
        if len(current) > 160:
            new = smart_truncate(current, ACTU_DESC_MAX)
            if new != current:
                txt = txt.replace(m.group(0), m.group(1) + html.escape(new, quote=True) + m.group(3), 1)
                changes.append(f"desc {len(current)}→{len(new)}c")

    if changes:
        file_path.write_text(txt, encoding="utf-8")
        return True, ", ".join(changes)
    return False, "rien à faire"


def rewrite_override(rel: str, file_path: Path, override: dict) -> tuple[bool, str]:
    """Applique un override manuel."""
    txt = file_path.read_text(encoding="utf-8")
    changes = []

    new_title = override.get("title")
    if new_title:
        m = TITLE_RX.search(txt)
        if m:
            current = html.unescape(m.group(2)).strip()
            if current != new_title:
                txt = txt.replace(m.group(0), m.group(1) + html.escape(new_title, quote=False) + m.group(3), 1)
                changes.append(f"title {len(current)}→{len(new_title)}c")
            # og:title alignée si présente
            mog = OG_TITLE_RX.search(txt)
            if mog:
                txt = txt.replace(mog.group(0), mog.group(1) + html.escape(new_title, quote=True) + mog.group(3), 1)

    new_desc = override.get("desc")
    if new_desc:
        m = META_DESC_RX.search(txt)
        if m:
            current = html.unescape(m.group(2)).strip()
            if current != new_desc:
                txt = txt.replace(m.group(0), m.group(1) + html.escape(new_desc, quote=True) + m.group(3), 1)
                changes.append(f"desc {len(current)}→{len(new_desc)}c")
            mog = OG_DESC_RX.search(txt)
            if mog:
                txt = txt.replace(mog.group(0), mog.group(1) + html.escape(new_desc, quote=True) + mog.group(3), 1)

    if changes:
        file_path.write_text(txt, encoding="utf-8")
        return True, ", ".join(changes)
    return False, "rien à changer"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    fixed = 0
    skipped = 0

    # 1. Pages principales (overrides)
    for rel, ov in OVERRIDES.items():
        p = ROOT / rel
        if not p.exists():
            print(f"  [skip] {rel} (introuvable)")
            continue
        if args.dry_run:
            print(f"  [dry] {rel}")
            continue
        changed, msg = rewrite_override(rel, p, ov)
        if changed:
            fixed += 1
            print(f"  ✓ {rel}  {msg}")
        else:
            skipped += 1

    # 2. Actualités (troncature intelligente)
    actu_dir = ROOT / "actualites"
    if actu_dir.is_dir():
        for p in actu_dir.glob("*.html"):
            if args.dry_run:
                print(f"  [dry] actualites/{p.name}")
                continue
            changed, msg = rewrite_actu(f"actualites/{p.name}", p)
            if changed:
                fixed += 1
                print(f"  ✓ actualites/{p.name}  {msg}")
            else:
                skipped += 1

    print(f"\nFini : {fixed} fichiers modifiés, {skipped} inchangés.")


if __name__ == "__main__":
    sys.exit(main())
