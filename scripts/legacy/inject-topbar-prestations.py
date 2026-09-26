#!/usr/bin/env python3
"""
Inject global topbar + full hc-header (with megamenu + mobile nav) into all
prestation pages, replacing the existing minimal <header class="seo-header">.

Source of truth: ../menuisier-saint-omer.html lines 280-373 (topbar + header)
                                          lines 375-464 (JS scripts)

All internal relative URLs are prefixed with `../` since prestation pages
live in /prestations/ subfolder.

The topbar CSS already exists in styles.css and is loaded via
`../styles.css?v=...` so no CSS duplication needed.
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "menuisier-saint-omer.html"
PRESTATIONS_DIR = ROOT / "prestations"

# -----------------------------------------------------------------------------
# 1) Extract the topbar + header block (line 280..373 in the source)
#    and the two <script> blocks (line 375..464).
# -----------------------------------------------------------------------------
src_text = SRC.read_text(encoding="utf-8")
src_lines = src_text.splitlines()

# 1-indexed line numbers => 0-indexed slice
topbar_header_block = "\n".join(src_lines[279:373])   # lines 280..373
scripts_block       = "\n".join(src_lines[374:464])   # lines 375..464

# -----------------------------------------------------------------------------
# 2) Rewrite href / src attributes that point to root-relative resources to be
#    prefixed with `../`. We only touch values that:
#       - don't start with http(s)://, //, mailto:, tel:, #, /, or `../`
#       - end with .html, or are an image/logo, etc.
#    Strategy: regex over href="..." and src="..." and rewrite when needed.
# -----------------------------------------------------------------------------
ATTR_RE = re.compile(r'(\b(?:href|src)\s*=\s*")([^"]+)(")', re.IGNORECASE)

def needs_prefix(value: str) -> bool:
    v = value.strip()
    if not v:
        return False
    lower = v.lower()
    if lower.startswith(("http://", "https://", "//", "mailto:", "tel:", "javascript:",
                         "#", "data:", "../", "./")):
        return False
    if v.startswith("/"):
        return False
    return True

def rewrite_paths(block: str) -> str:
    def _sub(m):
        prefix, value, suffix = m.group(1), m.group(2), m.group(3)
        if needs_prefix(value):
            return f'{prefix}../{value}{suffix}'
        return m.group(0)
    return ATTR_RE.sub(_sub, block)

topbar_header_block = rewrite_paths(topbar_header_block)
scripts_block       = rewrite_paths(scripts_block)

SKIP_LINK = '<a href="#main-content" class="hc-skip-link">Aller au contenu principal</a>'

INJECTION = (
    SKIP_LINK + "\n" +
    topbar_header_block + "\n" +
    scripts_block
)

# -----------------------------------------------------------------------------
# 3) For every prestation file, find the single-line `<header class="seo-header">...</header>`
#    and replace it with INJECTION. Preserve everything else verbatim.
# -----------------------------------------------------------------------------
SEO_HEADER_RE = re.compile(
    r'<header\s+class="seo-header".*?</header>',
    re.IGNORECASE | re.DOTALL,
)

modified = []
unmodified = []

for html_file in sorted(PRESTATIONS_DIR.glob("*.html")):
    text = html_file.read_text(encoding="utf-8")
    if not SEO_HEADER_RE.search(text):
        unmodified.append((html_file.name, "no <header class=\"seo-header\"> found"))
        continue
    new_text, n = SEO_HEADER_RE.subn(INJECTION, text, count=1)
    if n == 0:
        unmodified.append((html_file.name, "regex matched but subn=0"))
        continue
    html_file.write_text(new_text, encoding="utf-8")
    modified.append(html_file.name)

print(f"Modified: {len(modified)} files")
for n in modified:
    print(f"  - {n}")
if unmodified:
    print(f"\nUnmodified: {len(unmodified)} files")
    for name, reason in unmodified:
        print(f"  - {name}: {reason}")
else:
    print("\nUnmodified: 0 files")
