#!/usr/bin/env python3
"""
Revert unauthorized brand cards added without user validation.

Removes:
- ABB, Eaton, Siemens from 3 electricity prestation pages
- Bel'M, Tryba, K-LINE, Zilten from porte-entree.html
"""

import os
import re
from pathlib import Path

# Resolve project root: prefer the script's parent's parent (works from any mount).
_SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_CANDIDATES = [
    _SCRIPT_DIR.parent,
    Path("/Users/HP/Documents/Claude/Projects/SITE INTERNET"),
    Path("/sessions/youthful-charming-goldberg/mnt/SITE INTERNET"),
]
ROOT = next((p for p in ROOT_CANDIDATES if (p / "prestations").is_dir()), ROOT_CANDIDATES[0])

# Map: file -> list of href substrings of unauthorized brand cards to remove
TARGETS = {
    "prestations/tableau-electrique.html": [
        "new.abb.com",
        "eaton.com",
        "new.siemens.com",
    ],
    "prestations/depannage-electrique.html": [
        "new.abb.com",
        "eaton.com",
        "new.siemens.com",
    ],
    "prestations/recherche-panne-elec.html": [
        "new.abb.com",
        "eaton.com",
        "new.siemens.com",
    ],
    "prestations/porte-entree.html": [
        "bel-m.fr",
        "tryba.com",
        "k-line.fr",
        "zilten.com",
    ],
}


def remove_brand_card(content: str, href_fragment: str) -> tuple[str, int]:
    """
    Remove a full <a class="seo-brand-card" ...>...</a> block whose href
    contains href_fragment. Also strips trailing whitespace/newline so we
    don't leave blank lines behind.
    """
    # Pattern: an <a ... href="...href_fragment..." ... class="seo-brand-card"...>...</a>
    # The class may appear before or after href; handle both by anchoring on
    # both 'seo-brand-card' and the href fragment within the same opening tag.
    pattern = re.compile(
        r'[ \t]*<a\b[^>]*\bhref="[^"]*'
        + re.escape(href_fragment)
        + r'[^"]*"[^>]*\bclass="seo-brand-card"[^>]*>.*?</a>\s*\n?',
        re.DOTALL,
    )
    new_content, n = pattern.subn("", content)
    if n == 0:
        # Try the reverse order: class first, then href
        pattern2 = re.compile(
            r'[ \t]*<a\b[^>]*\bclass="seo-brand-card"[^>]*\bhref="[^"]*'
            + re.escape(href_fragment)
            + r'[^"]*"[^>]*>.*?</a>\s*\n?',
            re.DOTALL,
        )
        new_content, n = pattern2.subn("", content)
    return new_content, n


def main():
    total_removed = 0
    modified_files = []
    for rel_path, fragments in TARGETS.items():
        file_path = ROOT / rel_path
        if not file_path.exists():
            print(f"SKIP (missing): {file_path}")
            continue
        content = file_path.read_text(encoding="utf-8")
        original = content
        removed_here = 0
        for frag in fragments:
            content, n = remove_brand_card(content, frag)
            removed_here += n
        if content != original:
            file_path.write_text(content, encoding="utf-8")
            modified_files.append(rel_path)
            total_removed += removed_here
            print(f"MODIFIED: {rel_path} ({removed_here} card(s) removed)")
        else:
            print(f"UNCHANGED: {rel_path}")
    print(f"\nTotal cards removed: {total_removed}")
    print(f"Files modified: {len(modified_files)}")


if __name__ == "__main__":
    main()
