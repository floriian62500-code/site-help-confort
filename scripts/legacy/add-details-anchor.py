#!/usr/bin/env python3
"""
Add #details anchor support across the site.

Pass 1: On every file in /prestations/*.html, add id="details" to the
        <section class="seo-section"><h2>En quoi consiste cette prestation ?</h2>
        section. Idempotent.

Pass 2: On the listed metier pages at root, append #details to all
        href="prestations/<slug>.html" links. Idempotent. Skip links
        that already have a query string or anchor.
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRESTATIONS_DIR = ROOT / "prestations"

METIER_FILES = [
    "plombier-saint-omer.html",
    "chauffagiste-saint-omer.html",
    "electricien-saint-omer.html",
    "serrurier-saint-omer.html",
    "vitrier-saint-omer.html",
    "menuisier-saint-omer.html",
    "volets-saint-omer.html",
    "pmr-saint-omer.html",
    "travaux-saint-omer.html",
    "nos-prestations.html",
]


def pass1_add_id_details():
    """Add id="details" to the seo-section on each prestation page."""
    modified = []
    skipped = []
    missing = []

    # Pattern: <section class="seo-section"><h2>En quoi consiste cette prestation ?</h2>
    # Replace by adding id="details" on the section tag, if not already present.
    pattern_target = re.compile(
        r'<section class="seo-section"><h2>En quoi consiste cette prestation \?</h2>'
    )
    pattern_already = re.compile(
        r'<section class="seo-section" id="details"><h2>En quoi consiste cette prestation \?</h2>'
    )

    files = sorted(PRESTATIONS_DIR.glob("*.html"))
    for f in files:
        content = f.read_text(encoding="utf-8")

        if pattern_already.search(content):
            skipped.append(f.name)
            continue

        if not pattern_target.search(content):
            missing.append(f.name)
            continue

        new_content = pattern_target.sub(
            '<section class="seo-section" id="details"><h2>En quoi consiste cette prestation ?</h2>',
            content,
            count=1,
        )
        f.write_text(new_content, encoding="utf-8")
        modified.append(f.name)

    return modified, skipped, missing


def pass2_append_details_anchor():
    """Append #details to href="prestations/<slug>.html" on metier pages."""
    modified = []
    skipped_no_match = []
    not_found = []

    # Match href="prestations/<slug>.html" with NO trailing chars before the
    # closing quote (so no ?query, no #anchor). Slug = anything not containing
    # / " ? or #.
    href_pattern = re.compile(r'href="prestations/([^"/?#]+)\.html"')

    for fname in METIER_FILES:
        fpath = ROOT / fname
        if not fpath.exists():
            not_found.append(fname)
            continue

        content = fpath.read_text(encoding="utf-8")
        new_content, n = href_pattern.subn(
            r'href="prestations/\1.html#details"', content
        )

        if n == 0:
            skipped_no_match.append(fname)
            continue

        fpath.write_text(new_content, encoding="utf-8")
        modified.append((fname, n))

    return modified, skipped_no_match, not_found


def main():
    print("=" * 60)
    print("PASS 1: Add id=\"details\" to prestation pages")
    print("=" * 60)
    p1_mod, p1_skip, p1_missing = pass1_add_id_details()
    print(f"Modified: {len(p1_mod)} files")
    for f in p1_mod:
        print(f"  + {f}")
    print(f"Already had id=\"details\" (skipped): {len(p1_skip)} files")
    for f in p1_skip:
        print(f"  = {f}")
    if p1_missing:
        print(f"WARNING - target section NOT found: {len(p1_missing)} files")
        for f in p1_missing:
            print(f"  ! {f}")

    print()
    print("=" * 60)
    print("PASS 2: Append #details to prestation links on metier pages")
    print("=" * 60)
    p2_mod, p2_nomatch, p2_notfound = pass2_append_details_anchor()
    total_links = sum(n for _, n in p2_mod)
    print(f"Modified: {len(p2_mod)} files ({total_links} links updated)")
    for f, n in p2_mod:
        print(f"  + {f} ({n} link(s))")
    if p2_nomatch:
        print(f"No bare links to update (skipped): {len(p2_nomatch)} files")
        for f in p2_nomatch:
            print(f"  = {f}")
    if p2_notfound:
        print(f"File not found: {len(p2_notfound)}")
        for f in p2_notfound:
            print(f"  ! {f}")

    print()
    print("Done.")


if __name__ == "__main__":
    main()
