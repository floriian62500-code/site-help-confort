#!/usr/bin/env python3
"""Inject the inline critical header CSS block into every prestation page.

Reads the `<style id="hc-critical-header">...</style>` block verbatim from
menuisier-saint-omer.html and injects it right before `</head>` on every
.html file under prestations/. Idempotent.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "menuisier-saint-omer.html"
PRESTATIONS_DIR = ROOT / "prestations"

BLOCK_RE = re.compile(
    r'<style id="hc-critical-header">.*?</style>',
    re.DOTALL,
)


def extract_block(source_path: Path) -> str:
    text = source_path.read_text(encoding="utf-8")
    m = BLOCK_RE.search(text)
    if not m:
        raise SystemExit(f"Could not find <style id=\"hc-critical-header\"> block in {source_path}")
    return m.group(0)


def inject_into_file(path: Path, block: str) -> str:
    """Returns 'modified', 'skipped', or raises."""
    content = path.read_text(encoding="utf-8")
    if 'id="hc-critical-header"' in content:
        return "skipped"
    if "</head>" not in content:
        raise RuntimeError(f"No </head> tag found in {path}")
    # Inject right before the first </head>
    new_content = content.replace("</head>", block + "\n</head>", 1)
    path.write_text(new_content, encoding="utf-8")
    return "modified"


def main() -> int:
    block = extract_block(SOURCE)

    modified = 0
    skipped = 0
    errors: list[tuple[str, str]] = []

    html_files = sorted(PRESTATIONS_DIR.glob("*.html"))
    for path in html_files:
        try:
            result = inject_into_file(path, block)
            if result == "modified":
                modified += 1
            elif result == "skipped":
                skipped += 1
        except Exception as exc:  # noqa: BLE001
            errors.append((str(path), str(exc)))

    print(f"Total HTML files scanned: {len(html_files)}")
    print(f"Modified: {modified}")
    print(f"Skipped (already had block): {skipped}")
    print(f"Errors: {len(errors)}")
    for p, msg in errors:
        print(f"  ERROR {p}: {msg}")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
