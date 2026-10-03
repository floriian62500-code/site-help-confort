#!/usr/bin/env python3
"""Remove the redundant final CTA bandeau + sticky-mobile link from all /prestations/*.html files."""
import os
import re
import glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRESTA = os.path.join(BASE, "prestations")

# We match the entire <section class="seo-cta-final">...</section> + the following sticky-mobile <a>
# Pattern: single line section + single line sticky link
PAT = re.compile(
    r'<section class="seo-cta-final">.*?</section>\s*\n'
    r'<a href="#devis" class="seo-sticky-mobile">[^<]*</a>\s*\n',
    re.DOTALL
)

cleaned = 0
skipped = []
for path in sorted(glob.glob(os.path.join(PRESTA, "*.html"))):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    new, n = PAT.subn("", src)
    if n == 0:
        skipped.append(os.path.basename(path))
        continue
    with open(path, "w", encoding="utf-8") as f:
        f.write(new)
    cleaned += 1

print(f"Cleaned: {cleaned}")
if skipped:
    print(f"Skipped (no match): {skipped}")
