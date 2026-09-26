#!/usr/bin/env python3
"""Fix hero pill routing on metier pages.

Replaces `contact.html?presta=X#form` hrefs INSIDE `<a class="m-hero-service ...">`
elements with the proper destination URL based on the mapping below.

For each metier page in FILES, we:
  - locate every `<a ... class="m-hero-service ..." ...>` opening tag
  - if its href matches `contact.html?presta=X#form`, look up X in MAPPING
  - replace the href with the mapped target (or leave unchanged if not mapped)
  - report each replacement and every unmapped value
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

FILES = [
    "chauffagiste-saint-omer.html",
    "chauffagiste-dunkerque.html",
    "electricien-saint-omer.html",
    "electricien-dunkerque.html",
    "plombier-saint-omer.html",
    "plombier-dunkerque.html",
    "serrurier-saint-omer.html",
    "serrurier-dunkerque.html",
    "travaux-saint-omer.html",
]

MAPPING = {
    # Plomberie
    "debouchage": "prestations/debouchage.html#details",
    "chauffe-eau": "prestations/chauffe-eau.html#details",
    "sanitaire": "prestations/sanitaire.html#details",
    "renovation-sdb": "prestations/salle-de-bain.html#details",
    "reseaux-plomberie": "prestations/reseaux-plomberie.html#details",
    "fuite": "prestations/recherche-fuite.html#details",
    # Chauffage
    "chaudiere": "prestations/depannage-chaudiere.html#details",
    "desembouage": "prestations/desembouage.html#details",
    "radiateur": "prestations/desembouage.html#details",
    "eau-chaude": "prestations/chauffe-eau.html#details",
    "remplacement-chaudiere": "prestations/remplacement-chaudiere.html#details",
    "ramonage": "prestations/ramonage.html#details",
    # Electricite
    "tableau": "prestations/tableau-electrique.html#details",
    "panne": "prestations/recherche-panne-elec.html#details",
    "vmc": "prestations/vmc.html#details",
    "luminaire": "prestations/luminaire.html#details",
    "depannage-elec": "prestations/depannage-electrique.html#details",
    "consuel": "contact.html?metier=Électricité&objet=Consuel#form",
    # Serrurerie
    "ouverture": "prestations/ouverture-porte.html#details",
    "cylindre": "prestations/changement-cylindre.html#details",
    "porte-claquee": "prestations/porte-claquee.html#details",
    "clef": "prestations/porte-fermee-cle.html#details",
    "blindage": "contact.html?metier=Serrurerie&objet=Blindage#form",
    # Travaux
    "cuisine": "contact.html?metier=Rénovation&objet=Cuisine#form",
    "carrelage": "contact.html?metier=Rénovation&objet=Carrelage#form",
    "peinture": "contact.html?metier=Rénovation&objet=Peinture#form",
    "pmr": "pmr-saint-omer.html",
    "sdb": "prestations/salle-de-bain.html#details",
}

# Match any <a ...> opening tag that contains class="m-hero-service ..." (possibly
# with extra classes). We capture the whole tag, then act on the href= attribute.
ATAG_RE = re.compile(
    r"<a\b[^>]*\bclass=\"[^\"]*\bm-hero-service\b[^\"]*\"[^>]*>",
    re.IGNORECASE,
)

# Inside such a tag, find href="contact.html?presta=VALUE#form"
HREF_RE = re.compile(
    r"href=\"contact\.html\?presta=([^\"#&]+)#form\"",
    re.IGNORECASE,
)


def process_file(path: Path) -> tuple[list[tuple[str, str]], list[str]]:
    """Process one file in place. Returns (replacements, unmapped) lists."""
    text = path.read_text(encoding="utf-8")
    replacements: list[tuple[str, str]] = []
    unmapped: list[str] = []

    def fix_tag(match: re.Match[str]) -> str:
        tag = match.group(0)
        href_m = HREF_RE.search(tag)
        if not href_m:
            return tag
        value = href_m.group(1)
        old_href = f"contact.html?presta={value}#form"
        if value in MAPPING:
            new_href = MAPPING[value]
            new_tag = tag.replace(f'href="{old_href}"', f'href="{new_href}"')
            replacements.append((old_href, new_href))
            return new_tag
        unmapped.append(value)
        return tag

    new_text = ATAG_RE.sub(fix_tag, text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
    return replacements, unmapped


def main() -> int:
    total_replacements = 0
    files_modified = 0
    all_unmapped: dict[str, list[str]] = {}

    for fname in FILES:
        p = BASE / fname
        if not p.exists():
            print(f"[MISS] {fname}: file not found", file=sys.stderr)
            continue
        replacements, unmapped = process_file(p)
        if replacements:
            files_modified += 1
            total_replacements += len(replacements)
            print(f"\n== {fname}: {len(replacements)} replacement(s) ==")
            for old, new in replacements:
                print(f"  {old}  ->  {new}")
        else:
            print(f"\n== {fname}: no replacement ==")
        if unmapped:
            all_unmapped[fname] = unmapped
            for v in unmapped:
                print(f"  [UNMAPPED] presta={v}")

    print("\n--- SUMMARY ---")
    print(f"Files modified: {files_modified}")
    print(f"Total replacements: {total_replacements}")
    if all_unmapped:
        print("Unmapped ?presta= values still present:")
        for f, vals in all_unmapped.items():
            print(f"  {f}: {sorted(set(vals))}")
    else:
        print("No unmapped ?presta= values.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
