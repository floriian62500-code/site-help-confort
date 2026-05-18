#!/usr/bin/env python3
"""
Standardize footer-v3 across all HTML pages.

Task A: Replace 'Zones d'intervention' <ul> with full 12 cities + 'Voir toutes nos villes' link
Task B: Standardize 'Entreprise' column (remove duplicates: 'Tous nos métiers', 'Toutes nos villes')
Task C: For files under /prestations/, prefix all hrefs with '/'

Idempotent: skips files where the Zones list already includes 'Saint-Pol-sur-Mer'.

Usage:
    python3 standardize-footer.py
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Tuple

# Site root = parent of this scripts/ folder
ROOT = Path(__file__).resolve().parent.parent


# ─── 12 cities (file basenames) ──────────────────────────────────────────────
CITIES = [
    ("depannage-saint-omer.html", "Saint-Omer"),
    ("depannage-longuenesse.html", "Longuenesse"),
    ("depannage-arques.html", "Arques"),
    ("depannage-saint-martin-lez-tatinghem.html", "Saint-Martin-lez-Tatinghem"),
    ("depannage-dunkerque.html", "Dunkerque"),
    ("depannage-saint-pol-sur-mer.html", "Saint-Pol-sur-Mer"),
    ("depannage-bergues.html", "Bergues"),
    ("depannage-gravelines.html", "Gravelines"),
    ("depannage-calais.html", "Calais"),
    ("depannage-coquelles.html", "Coquelles"),
    ("depannage-sangatte.html", "Sangatte"),
    ("depannage-boulogne-sur-mer.html", "Boulogne-sur-Mer"),
]

# Entreprise canonical list (basename, label)
ENTREPRISE = [
    ("a-propos.html", "À propos"),
    ("contact.html", "Contact &amp; devis"),
    ("contrats-entretien.html", "Contrats d'entretien"),
    ("aides.html", "Aides &amp; financements"),
    ("partenaires.html", "Nos partenaires"),
    ("partenaires.html#fournisseurs", "Nos fournisseurs"),
    ("reseau-help-confort.html", "Le réseau HELP Confort"),
    ("realisations.html", "Actu &amp; réalisations"),
    ("carrieres.html", "Carrières"),
]


def build_zones_ul(prefix: str, indent: str) -> str:
    """Build the <ul>…</ul> for Zones with the given href prefix and base indent."""
    lines = [f"{indent}<ul>"]
    li_indent = indent + " "
    for href, label in CITIES:
        lines.append(f'{li_indent}<li><a href="{prefix}{href}">{label}</a></li>')
    lines.append(
        f'{li_indent}<li class="fv3-more"><a href="{prefix}nos-villes.html"'
        ' style="color:#1FC4F0;font-weight:600">→ Voir toutes nos villes</a></li>'
    )
    lines.append(f"{indent}</ul>")
    return "\n".join(lines)


def build_entreprise_ul(prefix: str, indent: str) -> str:
    """Build the canonical <ul>…</ul> for Entreprise with the given href prefix."""
    lines = [f"{indent}<ul>"]
    li_indent = indent + " "
    for href, label in ENTREPRISE:
        lines.append(f'{li_indent}<li><a href="{prefix}{href}">{label}</a></li>')
    lines.append(f"{indent}</ul>")
    return "\n".join(lines)


# Regex to find a column: <h3>TITLE</h3> followed by a <ul>...</ul>
def make_col_pattern(title: str) -> re.Pattern:
    # Capture indentation of <ul>, then the entire <ul>…</ul>
    return re.compile(
        r"(<h3>" + re.escape(title) + r"</h3>\s*\n)([ \t]*)<ul>.*?</ul>",
        re.DOTALL,
    )


ZONES_RE = make_col_pattern("Zones d'intervention")
ENTREPRISE_RE = make_col_pattern("Entreprise")


def standardize_file(path: Path) -> Tuple[bool, str]:
    """Return (changed, reason_or_status)."""
    try:
        content = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError) as e:
        return (False, f"read-error: {e}")

    if "footer-v3" not in content:
        return (False, "no-footer-v3")

    # Determine prefix: prestations/ pages use "/" absolute paths
    try:
        rel = path.relative_to(ROOT)
    except ValueError:
        rel = path
    rel_parts = rel.parts
    in_prestations = len(rel_parts) >= 2 and rel_parts[0] == "prestations"
    prefix = "/" if in_prestations else ""

    new_content = content

    # ── Task A: replace Zones <ul> ───────────────────────────────────────────
    zones_match = ZONES_RE.search(new_content)
    if not zones_match:
        return (False, "no-zones-block")

    # Idempotence check (scoped to the matched footer Zones <ul>):
    # consider it already standardized when both 'Saint-Pol-sur-Mer' AND the
    # new "Voir toutes nos villes" link are present in the Zones block.
    zones_block_text = zones_match.group(0)
    if (
        "Saint-Pol-sur-Mer" in zones_block_text
        and "Voir toutes nos villes" in zones_block_text
    ):
        return (False, "already-standardized")
    indent = zones_match.group(2)
    new_zones_ul = build_zones_ul(prefix, indent)
    new_content = ZONES_RE.sub(
        lambda m: m.group(1) + new_zones_ul,
        new_content,
        count=1,
    )

    # ── Task B: replace Entreprise <ul> ──────────────────────────────────────
    ent_match = ENTREPRISE_RE.search(new_content)
    if ent_match:
        ent_indent = ent_match.group(2)
        new_ent_ul = build_entreprise_ul(prefix, ent_indent)
        new_content = ENTREPRISE_RE.sub(
            lambda m: m.group(1) + new_ent_ul,
            new_content,
            count=1,
        )

    if new_content == content:
        return (False, "no-change")

    path.write_text(new_content, encoding="utf-8")
    return (True, "updated")


def iter_targets():
    # Root-level .html (skip admin*, scripts/tmp, actualites)
    for p in sorted(ROOT.glob("*.html")):
        yield p
    # Prestations
    prest = ROOT / "prestations"
    if prest.is_dir():
        for p in sorted(prest.glob("*.html")):
            yield p


def main() -> int:
    updated = []
    skipped_already = []
    skipped_no_footer = []
    skipped_no_zones = []
    other = []

    for path in iter_targets():
        changed, status = standardize_file(path)
        rel = path.relative_to(ROOT)
        if changed:
            updated.append(str(rel))
        elif status == "already-standardized":
            skipped_already.append(str(rel))
        elif status == "no-footer-v3":
            skipped_no_footer.append(str(rel))
        elif status == "no-zones-block":
            skipped_no_zones.append(str(rel))
        else:
            other.append((str(rel), status))

    print(f"Updated: {len(updated)} files")
    for f in updated:
        print(f"  ✓ {f}")
    if skipped_already:
        print(f"\nSkipped (already standardized): {len(skipped_already)}")
        for f in skipped_already:
            print(f"  · {f}")
    if skipped_no_zones:
        print(f"\nSkipped (no Zones block found): {len(skipped_no_zones)}")
        for f in skipped_no_zones:
            print(f"  ! {f}")
    if other:
        print(f"\nOther: {len(other)}")
        for f, s in other:
            print(f"  ? {f}: {s}")
    print(f"\nSkipped (no footer-v3): {len(skipped_no_footer)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
