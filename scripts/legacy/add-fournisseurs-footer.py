#!/usr/bin/env python3
"""Add 'Nos fournisseurs' link in footer Entreprise column, right after 'Nos partenaires'."""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXCLUDED = {
    "mentions-legales.html",
    "404.html",
    "reset.html",
    "espace-client.html",
    "index.html.bak.before-minify",
}

# Regex patterns tolerate leading whitespace on the second line so that
# the inserted "Nos fournisseurs" line keeps the same indentation as the
# surrounding <li> entries (some files use a leading space, others don't).
REL_RE = re.compile(
    r'(<li><a href="partenaires\.html">Nos partenaires</a></li>\n)'
    r'([ \t]*)(<li><a href="realisations\.html">Actu &amp; réalisations</a></li>)'
)
REL_SUB = (
    r'\1\2<li><a href="partenaires.html#fournisseurs">Nos fournisseurs</a></li>\n'
    r'\2\3'
)

ABS_RE = re.compile(
    r'(<li><a href="/partenaires\.html">Nos partenaires</a></li>\n)'
    r'([ \t]*)(<li><a href="/realisations\.html">Actu &amp; réalisations</a></li>)'
)
ABS_SUB = (
    r'\1\2<li><a href="/partenaires.html#fournisseurs">Nos fournisseurs</a></li>\n'
    r'\2\3'
)


def collect_files():
    files = []
    for pattern in (
        os.path.join(ROOT, "*.html"),
        os.path.join(ROOT, "prestations", "*.html"),
    ):
        files.extend(glob.glob(pattern))
    return [f for f in files if os.path.basename(f) not in EXCLUDED]


def process(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            content = fh.read()
    except Exception as exc:
        return "error", str(exc)

    if ">Nos fournisseurs<" in content:
        return "skipped", None

    new_content, rel_n = REL_RE.subn(REL_SUB, content)
    new_content, abs_n = ABS_RE.subn(ABS_SUB, new_content)
    if rel_n == 0 and abs_n == 0:
        return "skipped", None

    try:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(new_content)
    except Exception as exc:
        return "error", str(exc)
    return "modified", None


def main():
    modified = skipped = errors = 0
    error_details = []
    for path in collect_files():
        status, detail = process(path)
        rel = os.path.relpath(path, ROOT)
        if status == "modified":
            modified += 1
            print(f"  modified: {rel}")
        elif status == "skipped":
            skipped += 1
        else:
            errors += 1
            error_details.append((rel, detail))
            print(f"  ERROR {rel}: {detail}")

    print(f"\nTotal modified: {modified}")
    print(f"Total skipped:  {skipped}")
    print(f"Total errors:   {errors}")
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
