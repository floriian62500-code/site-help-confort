#!/usr/bin/env python3
"""Replace cheap-looking emoji in .seo-hero-img with professional inline SVG illustrations.

For each /prestations/*.html:
  1. Locate <div class="seo-hero-img">EMOJI</div>
  2. Map the slug (filename without .html) to an SVG illustration
  3. Replace EMOJI with the matching SVG (or a generic placeholder if unmapped)
  4. Replace `font-size:6rem` in the .seo-hero-img CSS with `font-size:0`
  5. Idempotent: skip the SVG replacement if an SVG is already present in seo-hero-img
"""

import os
import re
import sys
from pathlib import Path

# ----------------------------------------------------------------------------
# SVG library
# ----------------------------------------------------------------------------

SVG_DOOR = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:60%;height:60%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="60" y="20" width="80" height="120" rx="2"/><line x1="75" y1="35" x2="75" y2="55"/><line x1="75" y1="65" x2="75" y2="85"/><line x1="75" y1="95" x2="75" y2="115"/><line x1="125" y1="35" x2="125" y2="55"/><line x1="125" y1="65" x2="125" y2="85"/><line x1="125" y1="95" x2="125" y2="115"/><circle cx="128" cy="80" r="3" fill="currentColor"/></g></svg>'

SVG_GARAGE = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:65%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M30 60 L100 25 L170 60"/><rect x="45" y="60" width="110" height="75" rx="2"/><line x1="45" y1="80" x2="155" y2="80"/><line x1="45" y1="95" x2="155" y2="95"/><line x1="45" y1="110" x2="155" y2="110"/><line x1="45" y1="125" x2="155" y2="125"/></g></svg>'

SVG_WINDOW = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:60%;height:60%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="40" y="20" width="120" height="110" rx="2"/><line x1="100" y1="20" x2="100" y2="130"/><line x1="40" y1="75" x2="160" y2="75"/></g></svg>'

SVG_SLIDING_BAY = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:65%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="25" width="160" height="100" rx="2"/><line x1="100" y1="25" x2="100" y2="125"/><path d="M88 75 L72 75 M112 75 L128 75" stroke-width="4"/></g></svg>'

SVG_BOILER = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:55%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="60" y="20" width="80" height="100" rx="6"/><rect x="75" y="35" width="50" height="25" rx="2"/><circle cx="85" cy="80" r="6"/><circle cx="115" cy="80" r="6"/><line x1="100" y1="100" x2="100" y2="110"/><path d="M70 130 L60 140 M130 130 L140 140 M100 130 L100 145"/></g></svg>'

SVG_RADIATOR = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:65%;height:60%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="30" y="30" width="140" height="90" rx="4"/><line x1="55" y1="35" x2="55" y2="115"/><line x1="80" y1="35" x2="80" y2="115"/><line x1="105" y1="35" x2="105" y2="115"/><line x1="130" y1="35" x2="130" y2="115"/><line x1="155" y1="35" x2="155" y2="115"/><line x1="40" y1="120" x2="40" y2="135"/><line x1="160" y1="120" x2="160" y2="135"/></g></svg>'

SVG_CHIMNEY = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:55%;height:70%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="70" y="50" width="60" height="80" rx="2"/><rect x="60" y="35" width="80" height="15" rx="2"/><path d="M85 100 Q95 90 90 80 Q85 70 95 60" stroke-width="2.5"/><path d="M105 100 Q115 90 110 80 Q105 70 115 60" stroke-width="2.5"/></g></svg>'

SVG_WATER_HEATER = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:55%;height:70%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="100" cy="35" rx="35" ry="10"/><path d="M65 35 L65 115 Q65 130 100 130 Q135 130 135 115 L135 35"/><line x1="100" y1="55" x2="100" y2="105" stroke-width="2"/><circle cx="100" cy="70" r="3" fill="currentColor"/></g></svg>'

SVG_SHOWER = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:65%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50 130 L50 80 Q50 70 60 70 L140 70 Q150 70 150 80 L150 130 Z"/><rect x="60" y="30" width="80" height="40" rx="2"/><line x1="95" y1="30" x2="95" y2="0"/><line x1="105" y1="30" x2="105" y2="0"/><path d="M75 95 L75 105 M100 95 L100 105 M125 95 L125 105" stroke-width="2.5"/></g></svg>'

SVG_WATER_DROP = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:50%;height:75%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M100 20 Q60 65 60 95 Q60 130 100 130 Q140 130 140 95 Q140 65 100 20 Z"/><path d="M85 80 Q80 95 85 105" stroke-width="2.5"/></g></svg>'

SVG_PANEL = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:55%;height:70%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="50" y="25" width="100" height="100" rx="4"/><line x1="50" y1="55" x2="150" y2="55"/><line x1="50" y1="80" x2="150" y2="80"/><line x1="50" y1="105" x2="150" y2="105"/><rect x="60" y="35" width="10" height="12" rx="1"/><rect x="80" y="35" width="10" height="12" rx="1"/><rect x="100" y="35" width="10" height="12" rx="1"/><rect x="120" y="35" width="10" height="12" rx="1"/><rect x="60" y="60" width="10" height="12" rx="1"/><rect x="80" y="60" width="10" height="12" rx="1"/><rect x="100" y="60" width="10" height="12" rx="1"/><rect x="120" y="60" width="10" height="12" rx="1"/></g></svg>'

SVG_LIGHTNING = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:45%;height:75%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M115 15 L70 80 L100 80 L85 135 L130 70 L100 70 Z" fill="currentColor"/></g></svg>'

SVG_BULB = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:50%;height:75%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M100 20 Q70 20 70 55 Q70 80 90 95 L90 110 L110 110 L110 95 Q130 80 130 55 Q130 20 100 20 Z"/><line x1="90" y1="120" x2="110" y2="120"/><line x1="92" y1="130" x2="108" y2="130"/></g></svg>'

SVG_VMC = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:55%;height:70%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="75" r="40"/><path d="M100 35 Q115 60 100 75 Q85 60 100 35 Z" fill="currentColor"/><path d="M140 75 Q115 90 100 75 Q115 60 140 75 Z" fill="currentColor"/><path d="M100 115 Q85 90 100 75 Q115 90 100 115 Z" fill="currentColor"/><path d="M60 75 Q85 60 100 75 Q85 90 60 75 Z" fill="currentColor"/><circle cx="100" cy="75" r="6" fill="white" stroke="none"/></g></svg>'

SVG_KEY = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:55%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="75" cy="75" r="25"/><circle cx="75" cy="75" r="6" fill="currentColor"/><line x1="100" y1="75" x2="160" y2="75"/><line x1="140" y1="75" x2="140" y2="90"/><line x1="150" y1="75" x2="150" y2="95"/></g></svg>'

SVG_GLASS = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:60%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="50" y="25" width="100" height="100" rx="2"/><path d="M50 25 L100 75 L150 25 M50 125 L100 75 L150 125 M50 75 L150 75"/></g></svg>'

SVG_SHUTTER = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:65%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="40" y="20" width="120" height="110" rx="2"/><line x1="40" y1="35" x2="160" y2="35"/><line x1="40" y1="50" x2="160" y2="50"/><line x1="40" y1="65" x2="160" y2="65"/><line x1="40" y1="80" x2="160" y2="80"/><line x1="40" y1="95" x2="160" y2="95"/><line x1="40" y1="110" x2="160" y2="110"/></g></svg>'

SVG_FLOOR = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:70%;height:55%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="40" width="50" height="20"/><rect x="75" y="40" width="50" height="20"/><rect x="130" y="40" width="50" height="20"/><rect x="20" y="65" width="35" height="20"/><rect x="60" y="65" width="50" height="20"/><rect x="115" y="65" width="35" height="20"/><rect x="155" y="65" width="25" height="20"/><rect x="20" y="90" width="50" height="20"/><rect x="75" y="90" width="35" height="20"/><rect x="115" y="90" width="50" height="20"/></g></svg>'

SVG_FENCE = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:70%;height:60%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="30" y1="40" x2="30" y2="130"/><line x1="50" y1="40" x2="50" y2="130"/><line x1="70" y1="40" x2="70" y2="130"/><line x1="90" y1="40" x2="90" y2="130"/><line x1="20" y1="60" x2="100" y2="60"/><line x1="20" y1="110" x2="100" y2="110"/><line x1="120" y1="40" x2="120" y2="130"/><line x1="140" y1="40" x2="140" y2="130"/><line x1="160" y1="40" x2="160" y2="130"/><line x1="180" y1="40" x2="180" y2="130"/><line x1="110" y1="60" x2="190" y2="60"/><line x1="110" y1="110" x2="190" y2="110"/></g></svg>'

SVG_RAILING = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:70%;height:60%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="20" y1="50" x2="180" y2="50"/><line x1="20" y1="110" x2="180" y2="110"/><line x1="20" y1="40" x2="20" y2="120"/><line x1="60" y1="50" x2="60" y2="110"/><line x1="100" y1="50" x2="100" y2="110"/><line x1="140" y1="50" x2="140" y2="110"/><line x1="180" y1="40" x2="180" y2="120"/></g></svg>'

# Generic placeholder for slugs that don't match.
SVG_GENERIC = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:55%;height:65%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="75" r="45"/><path d="M75 75 L92 92 L130 60"/></g></svg>'

# ----------------------------------------------------------------------------
# Slug -> SVG mapping
# ----------------------------------------------------------------------------

SLUG_MAP = {
    # Doors
    "porte-entree": SVG_DOOR,
    "remplacement-panneau-porte": SVG_DOOR,
    # Garage
    "porte-garage": SVG_GARAGE,
    # Windows
    "fenetres-bois-alu-pvc": SVG_WINDOW,
    "fenetres-completes": SVG_WINDOW,
    "vitrage-simple-double-triple": SVG_WINDOW,
    # Sliding bay
    "coulissant-baie-vitree": SVG_SLIDING_BAY,
    # Boiler
    "remplacement-chaudiere": SVG_BOILER,
    "depannage-chaudiere": SVG_BOILER,
    # Radiator
    "desembouage": SVG_RADIATOR,
    # Chimney
    "ramonage": SVG_CHIMNEY,
    # Water heater
    "chauffe-eau": SVG_WATER_HEATER,
    # Shower / bathroom
    "salle-de-bain": SVG_SHOWER,
    # Water drop
    "recherche-fuite": SVG_WATER_DROP,
    "debouchage": SVG_WATER_DROP,
    "sanitaire": SVG_WATER_DROP,
    "reseaux-plomberie": SVG_WATER_DROP,
    # Electrical panel
    "tableau-electrique": SVG_PANEL,
    # Lightning
    "depannage-electrique": SVG_LIGHTNING,
    "recherche-panne-elec": SVG_LIGHTNING,
    # Bulb
    "luminaire": SVG_BULB,
    # Ventilation
    "vmc": SVG_VMC,
    # Key / lock
    "ouverture-porte": SVG_KEY,
    "changement-cylindre": SVG_KEY,
    "porte-claquee": SVG_KEY,
    "porte-fermee-cle": SVG_KEY,
    # Glass shard
    "mise-securite-vitrerie": SVG_GLASS,
    "vitrage-insert-poele": SVG_GLASS,
    "vitrerie-panneau-porte": SVG_GLASS,
    # Rolling shutter
    "volet-roulant": SVG_SHUTTER,
    # Floor
    "parquet": SVG_FLOOR,
    # Fence
    "portail-cloture": SVG_FENCE,
    # Railing
    "garde-corps-rampes": SVG_RAILING,
}

# ----------------------------------------------------------------------------
# Regex patterns
# ----------------------------------------------------------------------------

# Match <div class="seo-hero-img">CONTENT</div> where CONTENT is anything that
# is not another tag opener (so we don't accidentally re-eat an existing SVG).
HERO_DIV_RE = re.compile(
    r'(<div class="seo-hero-img">)(.*?)(</div>)',
    re.DOTALL,
)

# Match the CSS rule's font-size:6rem; (or font-size: 6rem;) inside the
# .seo-hero-img CSS declaration.
FONT_SIZE_RE = re.compile(
    r'(\.seo-hero-img\s*\{[^}]*?)font-size\s*:\s*6rem',
)


def process_file(path: Path) -> str:
    """Return one of: 'modified', 'skipped-already-svg', 'no-match', 'unmapped'."""
    slug = path.stem
    text = path.read_text(encoding="utf-8")

    match = HERO_DIV_RE.search(text)
    if not match:
        return "no-match"

    inner = match.group(2)

    # Idempotency: SVG already present
    if 'viewBox="0 0 200 150"' in inner:
        return "skipped-already-svg"

    svg = SLUG_MAP.get(slug, SVG_GENERIC)
    used_generic = slug not in SLUG_MAP

    # Replace the inner content with SVG, leaving outer tags intact.
    new_div = f'{match.group(1)}{svg}{match.group(3)}'
    new_text = text[: match.start()] + new_div + text[match.end():]

    # CSS update: font-size:6rem -> font-size:0
    new_text = FONT_SIZE_RE.sub(r'\1font-size:0', new_text)

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        return "unmapped-generic" if used_generic else "modified"
    return "no-change"


def main() -> int:
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    prestations_dir = project_root / "prestations"

    if not prestations_dir.is_dir():
        print(f"ERROR: not a directory: {prestations_dir}", file=sys.stderr)
        return 1

    results: dict[str, list[str]] = {
        "modified": [],
        "unmapped-generic": [],
        "skipped-already-svg": [],
        "no-match": [],
        "no-change": [],
    }

    for html_path in sorted(prestations_dir.glob("*.html")):
        status = process_file(html_path)
        results.setdefault(status, []).append(html_path.stem)

    for status, slugs in results.items():
        if not slugs:
            continue
        print(f"[{status}] ({len(slugs)})")
        for s in slugs:
            print(f"  - {s}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
