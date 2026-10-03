#!/usr/bin/env python3
"""Fix empty white pill bug on prestation pages.

The global `.bc` rule in styles.css adds a white background pill. On prestation
pages, `<nav class="bc">` inside `.seo-hero` uses white text, producing an
invisible-text white pill. We override `.seo-hero-text .bc` in each page's
inline <style> block to reset the inherited background/padding/border.
"""

import os
import sys

PRESTATIONS_DIR = "/sessions/youthful-charming-goldberg/mnt/SITE INTERNET/prestations"

OLD_RULE = ".seo-hero-text .bc{font-size:.85rem;color:rgba(255,255,255,.75);margin-bottom:14px}"
NEW_RULE = ".seo-hero-text .bc{font-size:.85rem;color:rgba(255,255,255,.75);margin-bottom:14px;background:transparent;padding:0;border:0;border-radius:0;display:block}"

# Idempotency marker: any prior fix that already includes background:transparent
# directly after the .seo-hero-text .bc rule's standard prefix.
ALREADY_FIXED_MARKER = "margin-bottom:14px;background:transparent;padding:0"


def main() -> int:
    if not os.path.isdir(PRESTATIONS_DIR):
        print(f"ERROR: directory not found: {PRESTATIONS_DIR}", file=sys.stderr)
        return 1

    modified = []
    skipped_already_fixed = []
    unmatched = []

    for name in sorted(os.listdir(PRESTATIONS_DIR)):
        if not name.endswith(".html"):
            continue
        path = os.path.join(PRESTATIONS_DIR, name)
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"ERROR reading {name}: {e}", file=sys.stderr)
            unmatched.append(name)
            continue

        if ALREADY_FIXED_MARKER in content:
            skipped_already_fixed.append(name)
            continue

        if OLD_RULE not in content:
            unmatched.append(name)
            continue

        new_content = content.replace(OLD_RULE, NEW_RULE, 1)
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)
        except Exception as e:
            print(f"ERROR writing {name}: {e}", file=sys.stderr)
            unmatched.append(name)
            continue
        modified.append(name)

    print(f"Modified: {len(modified)}")
    print(f"Skipped (already fixed): {len(skipped_already_fixed)}")
    print(f"Unmatched: {len(unmatched)}")
    if unmatched:
        print("Unmatched files:")
        for n in unmatched:
            print(f"  - {n}")
    if skipped_already_fixed:
        print("Already-fixed files:")
        for n in skipped_already_fixed:
            print(f"  - {n}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
