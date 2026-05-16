#!/usr/bin/env python3
"""
Triple fix:
  1. Mégamenu duplicate "Menuiserie" — replace SECOND occurrence with Vitrerie
     on ALL .html files at root + /prestations/
  2. Replace minimal <footer class="seo-footer">...</footer> with the full
     <footer class="footer footer-v3">...</footer> block on /prestations/*.html
     (paths rewritten to absolute /...)
  3. Same megamenu duplicate fix on root-level pages too.

Idempotent. Run from project root.
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_PAGE = ROOT / "menuisier-saint-omer.html"


# ---------------------------------------------------------------------------
# PASS 1: Mégamenu duplicate Menuiserie -> second becomes Vitrerie
# ---------------------------------------------------------------------------
def _build_megamenu_regex(prefix: str) -> re.Pattern:
    """Match two consecutive identical Menuiserie <a> lines in a megamenu."""
    a_line = (
        rf'(\s*<a href="{re.escape(prefix)}menuisier-saint-omer\.html">'
        rf'<img[^>]*src="{re.escape(prefix)}images/picto-menuiserie\.png"[^>]*>'
        rf'Menuiserie</a>)'
    )
    # Two such lines back-to-back (whitespace/newline allowed between)
    return re.compile(a_line + r"\s*\n" + a_line, re.MULTILINE)


RE_REL = _build_megamenu_regex("")
RE_ABS = _build_megamenu_regex("/")


def _vitrerie_replacement(menuiserie_line: str, prefix: str) -> str:
    """Build a Vitrerie <a> line that mirrors the indentation/attrs of Menuiserie."""
    indent_match = re.match(r"(\s*)", menuiserie_line)
    indent = indent_match.group(1) if indent_match else " "
    # Try to preserve <img> attributes like height/width/decoding for visual consistency
    img_attrs_match = re.search(
        r'<img([^>]*)src="' + re.escape(prefix) + r'images/picto-menuiserie\.png"([^>]*)>',
        menuiserie_line,
    )
    if img_attrs_match:
        before = img_attrs_match.group(1)
        after = img_attrs_match.group(2)
        return (
            f'{indent}<a href="{prefix}vitrier-saint-omer.html">'
            f'<img{before}src="{prefix}images/picto-vitrerie.png"{after}>'
            f'Vitrerie</a>'
        )
    # Fallback (shouldn't be hit because the regex requires src)
    return (
        f'{indent}<a href="{prefix}vitrier-saint-omer.html">'
        f'<img decoding="async" height="437" width="437" '
        f'src="{prefix}images/picto-vitrerie.png" alt="" loading="lazy">Vitrerie</a>'
    )


def _is_vitrerie_already_before_menuiserie(text: str, prefix: str) -> bool:
    """Check inside the metiers megamenu whether Vitrerie already appears before Menuiserie."""
    mm = re.search(
        r'<div class="hc-megamenu" data-menu="metiers"[^>]*>(.*?)</div>',
        text,
        re.DOTALL,
    )
    if not mm:
        return False
    block = mm.group(1)
    vit_idx = block.find(f'href="{prefix}vitrier-saint-omer.html"')
    men_idx = block.find(f'href="{prefix}menuisier-saint-omer.html"')
    if vit_idx == -1:
        return False
    if men_idx == -1:
        return True
    return vit_idx < men_idx


def fix_megamenu(html: str, use_abs: bool) -> tuple[str, bool]:
    prefix = "/" if use_abs else ""
    regex = RE_ABS if use_abs else RE_REL

    if _is_vitrerie_already_before_menuiserie(html, prefix):
        # idempotent: nothing to do
        if not regex.search(html):
            return html, False

    def repl(m: re.Match) -> str:
        first = m.group(1)
        second = m.group(2)
        return first + "\n" + _vitrerie_replacement(second, prefix)

    new_html, n = regex.subn(repl, html, count=1)
    return new_html, (n > 0)


# ---------------------------------------------------------------------------
# PASS 2: Replace seo-footer with full footer-v3 on /prestations/
# ---------------------------------------------------------------------------
def extract_full_footer(source_html: str) -> str:
    """Pull the entire <footer class="footer footer-v3">...</footer> block."""
    m = re.search(
        r'<footer class="footer footer-v3">.*?</footer>',
        source_html,
        re.DOTALL,
    )
    if not m:
        raise RuntimeError("Source footer-v3 not found in menuisier-saint-omer.html")
    return m.group(0)


def absolutize_footer_paths(footer_html: str) -> str:
    """Rewrite href="foo.html" to href="/foo.html" (skip http(s)/mailto/tel/anchors/already-abs)."""
    def repl(m: re.Match) -> str:
        url = m.group(1)
        if url.startswith(("http://", "https://", "mailto:", "tel:", "#", "/")):
            return m.group(0)
        return f'href="/{url}"'
    footer_html = re.sub(r'href="([^"]+)"', repl, footer_html)

    # Also fix logo <img src="logo-officiel.jpg"> and any relative src in footer
    def repl_src(m: re.Match) -> str:
        url = m.group(1)
        if url.startswith(("http://", "https://", "data:", "/", "#")):
            return m.group(0)
        return f'src="/{url}"'
    footer_html = re.sub(r'src="([^"]+)"', repl_src, footer_html)
    return footer_html


# Match the minimal seo-footer line (single line or multi-line tolerant)
RE_SEO_FOOTER = re.compile(
    r'<footer class="seo-footer">.*?</footer>',
    re.DOTALL,
)


def fix_prestation_footer(html: str, full_footer_abs: str) -> tuple[str, bool]:
    # Idempotent: skip if already migrated
    if 'class="footer footer-v3"' in html:
        return html, False
    if not RE_SEO_FOOTER.search(html):
        return html, False
    new_html, n = RE_SEO_FOOTER.subn(full_footer_abs, html, count=1)
    return new_html, (n > 0)


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------
def main() -> int:
    if not SOURCE_PAGE.is_file():
        print(f"ERROR: source page not found: {SOURCE_PAGE}", file=sys.stderr)
        return 1

    source_html = SOURCE_PAGE.read_text(encoding="utf-8")

    # Build the absolute-path version of the full footer once
    try:
        full_footer_rel = extract_full_footer(source_html)
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    # Important: the extracted footer ALSO contains the duplicate Menuiserie
    # (since the source itself is buggy). Apply pass-1 fix on the footer text
    # too — except this footer's <ul> doesn't carry a megamenu wrapper, so we
    # just dedupe the literal duplicate <a>...Menuiserie</a><a>...Menuiserie</a>
    full_footer_rel = re.sub(
        r'(<a href="menuisier-saint-omer\.html">Menuiserie</a>)'
        r'(<a href="menuisier-saint-omer\.html">Menuiserie</a>)',
        r'\1',
        full_footer_rel,
    )

    full_footer_abs = absolutize_footer_paths(full_footer_rel)

    # ---- Collect target files ----
    root_pages = sorted(p for p in ROOT.glob("*.html"))
    prestation_pages = sorted((ROOT / "prestations").glob("*.html"))

    pass1_modified: list[str] = []
    pass1_errors: list[tuple[str, str]] = []

    pass2_modified: list[str] = []
    pass2_errors: list[tuple[str, str]] = []

    # ---- PASS 1 — megamenu fix on ALL pages ----
    for p in [*root_pages, *prestation_pages]:
        try:
            html = p.read_text(encoding="utf-8")
            use_abs = p.parent.name == "prestations"
            new_html, changed = fix_megamenu(html, use_abs=use_abs)
            if changed and new_html != html:
                p.write_text(new_html, encoding="utf-8")
                pass1_modified.append(str(p.relative_to(ROOT)))
        except Exception as e:
            pass1_errors.append((str(p.relative_to(ROOT)), str(e)))

    # ---- PASS 2 — footer swap on /prestations/ ----
    for p in prestation_pages:
        try:
            html = p.read_text(encoding="utf-8")
            new_html, changed = fix_prestation_footer(html, full_footer_abs)
            if changed and new_html != html:
                p.write_text(new_html, encoding="utf-8")
                pass2_modified.append(str(p.relative_to(ROOT)))
        except Exception as e:
            pass2_errors.append((str(p.relative_to(ROOT)), str(e)))

    # ---- Report ----
    print("=" * 70)
    print(f"PASS 1 — Megamenu duplicate Menuiserie -> Vitrerie")
    print(f"  Files modified: {len(pass1_modified)}")
    for f in pass1_modified:
        print(f"    - {f}")
    if pass1_errors:
        print(f"  Errors: {len(pass1_errors)}")
        for f, e in pass1_errors:
            print(f"    ! {f}: {e}")

    print("=" * 70)
    print(f"PASS 2 — Replace seo-footer with footer-v3 (/prestations/)")
    print(f"  Files modified: {len(pass2_modified)}")
    for f in pass2_modified:
        print(f"    - {f}")
    if pass2_errors:
        print(f"  Errors: {len(pass2_errors)}")
        for f, e in pass2_errors:
            print(f"    ! {f}: {e}")

    print("=" * 70)
    print(f"TOTAL pass1: {len(pass1_modified)} | TOTAL pass2: {len(pass2_modified)}")
    return 0 if not (pass1_errors or pass2_errors) else 2


if __name__ == "__main__":
    sys.exit(main())
