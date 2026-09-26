#!/usr/bin/env python3
"""
add-partenaires-footer.py

Injects a "Nos partenaires" link into the footer "Entreprise" column on all
HTML pages at the root of the site and inside the /prestations/ subfolder.

Pattern (before):
    <li><a href="aides.html">Aides &amp; financements</a></li>
    <li><a href="realisations.html">Actu &amp; réalisations</a></li>

Pattern (after):
    <li><a href="aides.html">Aides &amp; financements</a></li>
    <li><a href="partenaires.html">Nos partenaires</a></li>
    <li><a href="realisations.html">Actu &amp; réalisations</a></li>

Behavior:
- Iterates *.html at the root of SITE INTERNET and in /prestations/.
- For /prestations/ pages, uses `../partenaires.html`.
- Handles both relative (`partenaires.html`) and absolute (`/partenaires.html`)
  variants when checking presence and matching the surrounding pattern.
- Idempotent: if `partenaires.html">Nos partenaires` is already present in the
  footer block (between the two anchor links), the file is skipped.
- Skips: mentions-legales.html, 404.html, reset.html, espace-client.html,
  index.html.bak.before-minify.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

# Resolve project root relative to this script: /scripts/.. == project root.
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

# Files to skip (basename match, case-insensitive).
SKIP_FILES = {
    "mentions-legales.html",
    "404.html",
    "reset.html",
    "espace-client.html",
    "index.html.bak.before-minify",
}


def collect_html_files() -> list[Path]:
    """Collect *.html files at the project root and in /prestations/."""
    files: list[Path] = []

    # Root-level *.html (non-recursive).
    for entry in sorted(PROJECT_ROOT.iterdir()):
        if entry.is_file() and entry.name.lower().endswith(".html"):
            files.append(entry)

    # /prestations/ *.html (non-recursive).
    prestations_dir = PROJECT_ROOT / "prestations"
    if prestations_dir.is_dir():
        for entry in sorted(prestations_dir.iterdir()):
            if entry.is_file() and entry.name.lower().endswith(".html"):
                files.append(entry)

    return files


def build_patterns(in_prestations: bool) -> list[tuple[re.Pattern[str], str, str]]:
    """
    Return a list of (regex, replacement, href_value) tuples to try in order.

    Each regex captures the inter-line whitespace between the "aides" <li>
    and the "realisations" <li>. The replacement preserves that whitespace
    before inserting the new <li> on its own line, then preserves it again
    before the original "realisations" <li>.
    """
    href = "../partenaires.html" if in_prestations else "partenaires.html"
    abs_href = "/partenaires.html"

    new_li_rel = f'<li><a href="{href}">Nos partenaires</a></li>'
    new_li_abs = f'<li><a href="{abs_href}">Nos partenaires</a></li>'

    # Relative aides.html -> realisations.html (most common at root and likely
    # to appear inside /prestations/ if the standard footer is present).
    rel_aides = re.escape('<li><a href="aides.html">Aides &amp; financements</a></li>')
    rel_real = re.escape('<li><a href="realisations.html">Actu &amp; réalisations</a></li>')

    # Absolute /aides.html -> /realisations.html (if used anywhere).
    abs_aides = re.escape('<li><a href="/aides.html">Aides &amp; financements</a></li>')
    abs_real = re.escape('<li><a href="/realisations.html">Actu &amp; réalisations</a></li>')

    patterns: list[tuple[re.Pattern[str], str, str]] = [
        (
            re.compile(rel_aides + r"(\s+)" + rel_real),
            rf'<li><a href="aides.html">Aides &amp; financements</a></li>\1{new_li_rel}\1<li><a href="realisations.html">Actu &amp; réalisations</a></li>',
            href,
        ),
        (
            re.compile(abs_aides + r"(\s+)" + abs_real),
            rf'<li><a href="/aides.html">Aides &amp; financements</a></li>\1{new_li_abs}\1<li><a href="/realisations.html">Actu &amp; réalisations</a></li>',
            abs_href,
        ),
    ]
    return patterns


def already_present(content: str) -> bool:
    """Return True if a "Nos partenaires" link is already in any footer-like spot."""
    # Be liberal: match any "partenaires.html\">Nos partenaires" anchor variant.
    return bool(
        re.search(
            r'href="(?:\.\./|/)?partenaires\.html"\s*>\s*Nos partenaires',
            content,
        )
    )


def process_file(path: Path) -> tuple[str, str]:
    """
    Process a single file. Returns (status, detail) where status is one of:
    "modified", "skipped-already", "skipped-no-pattern", "skipped-listed",
    "error".
    """
    name = path.name
    if name in SKIP_FILES:
        return ("skipped-listed", "explicitly excluded")

    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
        except Exception as exc:  # pragma: no cover
            return ("error", f"read failed: {exc}")
    except Exception as exc:  # pragma: no cover
        return ("error", f"read failed: {exc}")

    if already_present(content):
        return ("skipped-already", "Nos partenaires link already present")

    in_prestations = path.parent.name == "prestations"
    patterns = build_patterns(in_prestations)

    new_content = content
    matched_href = None
    for regex, replacement, href in patterns:
        replaced, n = regex.subn(replacement, new_content, count=1)
        if n > 0:
            new_content = replaced
            matched_href = href
            break

    if matched_href is None:
        return ("skipped-no-pattern", "aides/realisations pattern not found")

    try:
        path.write_text(new_content, encoding="utf-8")
    except Exception as exc:  # pragma: no cover
        return ("error", f"write failed: {exc}")

    return ("modified", f"inserted href={matched_href}")


def main() -> int:
    files = collect_html_files()

    counters = {
        "modified": 0,
        "skipped-already": 0,
        "skipped-no-pattern": 0,
        "skipped-listed": 0,
        "error": 0,
    }
    modified_files: list[str] = []
    skipped_already: list[str] = []
    skipped_no_pattern: list[str] = []
    skipped_listed: list[str] = []
    errors: list[str] = []

    for path in files:
        status, detail = process_file(path)
        counters[status] = counters.get(status, 0) + 1
        rel = path.relative_to(PROJECT_ROOT).as_posix()
        if status == "modified":
            modified_files.append(rel)
        elif status == "skipped-already":
            skipped_already.append(rel)
        elif status == "skipped-no-pattern":
            skipped_no_pattern.append(rel)
        elif status == "skipped-listed":
            skipped_listed.append(rel)
        elif status == "error":
            errors.append(f"{rel}: {detail}")

    total = len(files)

    print("=" * 60)
    print("add-partenaires-footer.py — report")
    print("=" * 60)
    print(f"Project root           : {PROJECT_ROOT}")
    print(f"Total files scanned    : {total}")
    print(f"Modified               : {counters['modified']}")
    print(f"Skipped (already done) : {counters['skipped-already']}")
    print(f"Skipped (no pattern)   : {counters['skipped-no-pattern']}")
    print(f"Skipped (excluded)     : {counters['skipped-listed']}")
    print(f"Errors                 : {counters['error']}")
    print()

    if modified_files:
        print(f"-- Modified ({len(modified_files)}) --")
        for f in modified_files:
            print(f"  + {f}")
        print()

    if skipped_already:
        print(f"-- Skipped: already had link ({len(skipped_already)}) --")
        for f in skipped_already:
            print(f"  = {f}")
        print()

    if skipped_no_pattern:
        print(f"-- Skipped: pattern not found ({len(skipped_no_pattern)}) --")
        for f in skipped_no_pattern:
            print(f"  ~ {f}")
        print()

    if skipped_listed:
        print(f"-- Skipped: explicitly excluded ({len(skipped_listed)}) --")
        for f in skipped_listed:
            print(f"  - {f}")
        print()

    if errors:
        print(f"-- Errors ({len(errors)}) --")
        for line in errors:
            print(f"  ! {line}")
        print()

    return 0 if counters["error"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
