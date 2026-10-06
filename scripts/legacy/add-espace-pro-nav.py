#!/usr/bin/env python3
"""Add 'Espace Pro' link to .hc-nav navigation on all pages."""
import glob
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXCLUDE = {
    "mentions-legales.html",
    "404.html",
    "reset.html",
    "espace-client.html",
    "pro.html",
    "index.html.bak.before-minify",
}

SUBS_ROOT = [
    (
        '<a href="a-propos.html" class="hc-nav-link">À propos</a>\n        <a href="contact.html" class="hc-nav-link">Contact</a>',
        '<a href="a-propos.html" class="hc-nav-link">À propos</a>\n        <a href="pro.html" class="hc-nav-link">Espace Pro</a>\n        <a href="contact.html" class="hc-nav-link">Contact</a>',
    ),
    (
        '<a href="a-propos.html">À propos</a>\n      <a href="contact.html">Contact</a>',
        '<a href="a-propos.html">À propos</a>\n      <a href="pro.html">Espace Pro</a>\n      <a href="contact.html">Contact</a>',
    ),
]

SUBS_PRESTATIONS = [
    (
        '<a href="../a-propos.html" class="hc-nav-link">À propos</a>\n        <a href="../contact.html" class="hc-nav-link">Contact</a>',
        '<a href="../a-propos.html" class="hc-nav-link">À propos</a>\n        <a href="../pro.html" class="hc-nav-link">Espace Pro</a>\n        <a href="../contact.html" class="hc-nav-link">Contact</a>',
    ),
    (
        '<a href="../a-propos.html">À propos</a>\n      <a href="../contact.html">Contact</a>',
        '<a href="../a-propos.html">À propos</a>\n      <a href="../pro.html">Espace Pro</a>\n      <a href="../contact.html">Contact</a>',
    ),
]

# Fallback: more flexible substitutions in case whitespace differs
import re

def flexible_apply(text, is_prestations):
    prefix = "../" if is_prestations else ""
    changed = False
    # Desktop nav
    pat_desktop = re.compile(
        r'(<a href="' + re.escape(prefix) + r'a-propos\.html" class="hc-nav-link">À propos</a>)(\s+)(<a href="' + re.escape(prefix) + r'contact\.html" class="hc-nav-link">Contact</a>)'
    )
    new_text, n = pat_desktop.subn(
        r'\1\2<a href="' + prefix + r'pro.html" class="hc-nav-link">Espace Pro</a>\2\3',
        text,
    )
    if n > 0:
        text = new_text
        changed = True
    # Mobile nav
    pat_mobile = re.compile(
        r'(<a href="' + re.escape(prefix) + r'a-propos\.html">À propos</a>)(\s+)(<a href="' + re.escape(prefix) + r'contact\.html">Contact</a>)'
    )
    new_text, n = pat_mobile.subn(
        r'\1\2<a href="' + prefix + r'pro.html">Espace Pro</a>\2\3',
        text,
    )
    if n > 0:
        text = new_text
        changed = True
    return text, changed


def process_file(path, is_prestations):
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return "error", str(e)

    if ">Espace Pro<" in content:
        return "skipped", None

    new_content, changed = flexible_apply(content, is_prestations)

    if not changed:
        return "skipped", "no pattern match"

    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
    except Exception as e:
        return "error", str(e)

    return "modified", None


def main():
    modified = 0
    skipped = 0
    errors = 0
    error_details = []
    skipped_no_match = []

    # Root .html files
    root_files = glob.glob(os.path.join(ROOT, "*.html"))
    for path in root_files:
        name = os.path.basename(path)
        if name in EXCLUDE:
            continue
        status, info = process_file(path, is_prestations=False)
        if status == "modified":
            modified += 1
        elif status == "skipped":
            skipped += 1
            if info == "no pattern match":
                skipped_no_match.append(name)
        else:
            errors += 1
            error_details.append(f"{name}: {info}")

    # Prestations .html files
    prest_files = glob.glob(os.path.join(ROOT, "prestations", "*.html"))
    for path in prest_files:
        name = os.path.basename(path)
        if name in EXCLUDE:
            continue
        status, info = process_file(path, is_prestations=True)
        if status == "modified":
            modified += 1
        elif status == "skipped":
            skipped += 1
            if info == "no pattern match":
                skipped_no_match.append("prestations/" + name)
        else:
            errors += 1
            error_details.append(f"prestations/{name}: {info}")

    print(f"Modified: {modified}")
    print(f"Skipped:  {skipped}")
    print(f"Errors:   {errors}")
    if skipped_no_match:
        print("\nSkipped (no pattern match):")
        for n in skipped_no_match:
            print(f"  - {n}")
    if error_details:
        print("\nErrors:")
        for e in error_details:
            print(f"  - {e}")


if __name__ == "__main__":
    main()
