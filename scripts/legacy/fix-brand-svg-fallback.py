#!/usr/bin/env python3
"""
Convert prestation brand-card fallback from ugly orange-bordered text pill
to a clean SVG text logo using the brand's official color.

For each /prestations/*.html:
  - Find each <a class="seo-brand-card">…</a>
  - Extract <span class="seo-brand-name">NAME</span>
  - Remove the <img class="seo-brand-logo"> Clearbit element
  - Insert a <span class="seo-brand-logo-svg"> wrapping an <svg> text logo
    using the brand's official color (fallback #1A1A1A for unknown brands)
  - Inject CSS for .seo-brand-logo-svg once
  - Remove the old .seo-brand-logo-text CSS rule

Idempotent: skips files already containing "seo-brand-logo-svg".
"""

import os
import re
import sys
from pathlib import Path

BRAND_COLORS = {
    "Groupe Millet": "#000000",
    "Brémaud": "#005CA9",
    "Bremaud": "#005CA9",
    "Kostum": "#000000",
    "Jeld-Wen": "#00426C",
    "Rozière": "#003E81",
    "Roziere": "#003E81",
    "Velux": "#D71920",
    "Parador": "#000000",
    "COREtec": "#0C7A48",
    "Coretec": "#0C7A48",
    "Meister": "#F38900",
    "Soprofen": "#002E5F",
    "SPPF": "#003E81",
    "Somfy": "#003D7E",
    "Hörmann": "#E2001A",
    "Hormann": "#E2001A",
    "Novoferm": "#003E81",
    "Atlantic": "#E2001A",
    "Hansgrohe": "#00A0B0",
    "Geberit": "#00A0B0",
    "Grohe": "#0094D8",
    "Jacob Delafon": "#00467F",
    "Roca": "#1A1A1A",
    "Villeroy & Boch": "#C8102E",
    "Villeroy &amp; Boch": "#C8102E",
    "Wavin": "#003F87",
    "Comap": "#0066B3",
    "Watts": "#003F87",
    "Quare Design": "#1A1A1A",
    "Viessmann": "#FF3300",
    "De Dietrich": "#C8102E",
    "Frisquet": "#003F87",
    "Saunier Duval": "#003F87",
    "Vaillant": "#035642",
    "Chaffoteaux": "#003F87",
    "Ariston": "#E2001A",
    "Chappée": "#C8102E",
    "Chappee": "#C8102E",
    "Finimétal": "#003F87",
    "Finimetal": "#003F87",
    "Sentinel": "#003F87",
    "Fernox": "#009FE3",
    "Cillit": "#003F87",
    "Legrand": "#003F87",
    "Schneider Electric": "#3DCD58",
    "Hager": "#E60000",
    "Philips": "#1434CB",
    "Osram": "#FF6600",
    "Aldes": "#00A0B0",
    "Unelvent": "#003F87",
    "Chauvin Arnoux": "#003F87",
    "Vachette": "#003F87",
    "Mottura": "#C8102E",
    "Bricard": "#003F87",
    "Pollux": "#1A1A1A",
    "Heracles": "#1A1A1A",
    "Saint-Gobain": "#0079C1",
    "AGC": "#003F87",
    "Pilkington": "#003F87",
    "Robax": "#003F87",
    "Bubendorff": "#FF6B00",
    "Profalux": "#003F87",
    "Schüco": "#003F69",
    "Schuco": "#003F69",
}

DEFAULT_COLOR = "#1A1A1A"

NEW_CSS = (
    ".seo-brand-logo-svg{display:flex;align-items:center;justify-content:center;"
    "height:40px;width:100%}"
    ".seo-brand-logo-svg svg{max-height:40px;width:auto;max-width:140px}"
)

# Pattern matches each seo-brand-card <a>…</a> block.
CARD_RE = re.compile(
    r'(<a\s+href="[^"]*"\s+class="seo-brand-card"[^>]*>)\s*'
    r'(<img\s+class="seo-brand-logo"[^>]*>)\s*'
    r'(<span\s+class="seo-brand-name">([^<]+)</span>)\s*'
    r'(<span\s+class="seo-brand-cat">[^<]*</span>)\s*'
    r'(</a>)',
    re.IGNORECASE | re.DOTALL,
)

# Old .seo-brand-logo-text rule (often inline in <style> at top of file).
OLD_RULE_RE = re.compile(
    r'\.seo-brand-logo-text\s*\{[^}]*\}',
    re.IGNORECASE,
)


def lookup_color(name: str) -> tuple[str, bool]:
    """Return (color, found_in_map) for a brand name."""
    # Try exact, then trimmed.
    if name in BRAND_COLORS:
        return BRAND_COLORS[name], True
    stripped = name.strip()
    if stripped in BRAND_COLORS:
        return BRAND_COLORS[stripped], True
    # Case-insensitive lookup as a last resort.
    lower_map = {k.lower(): (k, v) for k, v in BRAND_COLORS.items()}
    if stripped.lower() in lower_map:
        return lower_map[stripped.lower()][1], True
    return DEFAULT_COLOR, False


def build_svg_block(brand_name: str, color: str) -> str:
    """Build the new <span class='seo-brand-logo-svg'><svg>…</svg></span>."""
    return (
        '<span class="seo-brand-logo-svg">'
        '<svg viewBox="0 0 160 36" width="160" height="36" aria-hidden="true">'
        f'<text x="80" y="26" text-anchor="middle" '
        f'font-family="\'Helvetica Neue\',Arial,sans-serif" '
        f'font-size="22" font-weight="800" fill="{color}" '
        f'letter-spacing="0.5">{brand_name}</text>'
        '</svg>'
        '</span>'
    )


def process_file(path: Path, unknown_brands: set[str]) -> tuple[bool, int]:
    """Returns (modified, n_cards_converted)."""
    text = path.read_text(encoding="utf-8")

    if "seo-brand-logo-svg" in text:
        return False, 0

    cards_converted = 0

    def repl(m: re.Match) -> str:
        nonlocal cards_converted
        open_a, _img, name_span, brand_name, cat_span, close_a = m.groups()
        color, found = lookup_color(brand_name)
        if not found:
            unknown_brands.add(brand_name)
        svg_block = build_svg_block(brand_name, color)
        cards_converted += 1
        return f"{open_a}\n{svg_block}\n{name_span}\n{cat_span}\n{close_a}"

    new_text, n = CARD_RE.subn(repl, text)

    if n == 0:
        return False, 0

    # Remove old .seo-brand-logo-text CSS rule(s).
    new_text = OLD_RULE_RE.sub("", new_text)

    # Inject new CSS once. Prefer placing it just inside the first <style> tag.
    if ".seo-brand-logo-svg{" not in new_text:
        style_open = re.search(r"<style[^>]*>", new_text)
        if style_open:
            idx = style_open.end()
            new_text = new_text[:idx] + NEW_CSS + new_text[idx:]
        else:
            # No <style> tag: add one in <head>.
            new_text = new_text.replace(
                "</head>", f"<style>{NEW_CSS}</style></head>", 1
            )

    path.write_text(new_text, encoding="utf-8")
    return True, cards_converted


def main() -> int:
    base = Path("prestations")
    if not base.is_dir():
        print(f"Directory not found: {base.resolve()}", file=sys.stderr)
        return 1

    files = sorted(base.glob("*.html"))
    modified_files = 0
    total_cards = 0
    unknown_brands: set[str] = set()
    per_file: list[tuple[str, int]] = []

    for f in files:
        modified, n = process_file(f, unknown_brands)
        if modified:
            modified_files += 1
            total_cards += n
            per_file.append((f.name, n))

    print("=" * 60)
    print("Brand SVG fallback conversion — report")
    print("=" * 60)
    print(f"HTML files scanned   : {len(files)}")
    print(f"Files modified       : {modified_files}")
    print(f"Brand cards converted: {total_cards}")
    print()
    if per_file:
        print("Per-file breakdown:")
        for name, n in per_file:
            print(f"  - {name}: {n} cards")
        print()
    if unknown_brands:
        print("Brands NOT in color mapping (defaulted to #1A1A1A):")
        for b in sorted(unknown_brands):
            print(f"  - {b}")
    else:
        print("All converted brands had an explicit color mapping.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
