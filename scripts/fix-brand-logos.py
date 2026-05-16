#!/usr/bin/env python3
"""
fix-brand-logos.py

Updates every <img class="seo-brand-logo"> tag inside /prestations/*.html so
that broken Clearbit logos fall back to a local SVG (when available) and then
to a styled text logo. Also injects the required CSS rule for the text
fallback once per file.

Run from the project root:
    python3 scripts/fix-brand-logos.py
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

# Brand display name -> local SVG slug (file at /images/marques/<slug>.svg)
LOCAL_SVG_MAP = {
    "Atlantic": "atlantic",
    "Hansgrohe": "Hansgrohe-Logo-2",
    "Geberit": "geberit",
    "Frisquet": "frisquet",
    "Chappee": "chappee",          # accent-less variant
    "Chappée": "chappee",
    "Finimetal": "finimetal",
    "Finimétal": "finimetal",
    "Jeld-Wen": "jeldwen",
    "JeldWen": "jeldwen",
    "Jeld Wen": "jeldwen",
    "Kostum": "kostum",
    "Meister": "meister",
    "Parador": "parador",
    "Quare Design": "quare-design",
    "Quare": "quare-design",
    "Roziere": "roziere",
    "Rozière": "roziere",
    "Schueco": "schueco",
    "Schüco": "schueco",
    "Siegenia": "siegenia",
    "Somfy": "somfy",
    "Bubendorff": "bubendorff",
}


# CSS rule (single line, no leading/trailing whitespace beyond what we want
# to inject).
CSS_RULE = (
    ".seo-brand-logo-text{font-size:1.3rem !important;font-weight:900 !important;"
    "letter-spacing:-.02em !important;color:var(--c) !important;line-height:1 !important;"
    "padding:6px 12px !important;border:2px solid var(--c) !important;"
    "border-radius:8px !important;text-transform:uppercase !important;"
    "font-family:'Inter',sans-serif}"
)


def find_project_root() -> Path:
    """Return the project root (parent of /prestations/)."""
    # Script lives at <root>/scripts/fix-brand-logos.py
    here = Path(__file__).resolve().parent
    root = here.parent
    if not (root / "prestations").is_dir():
        # Fall back to CWD
        cwd = Path.cwd()
        if (cwd / "prestations").is_dir():
            return cwd
        sys.exit(f"Cannot locate /prestations/ from {root} or {cwd}")
    return root


# Match the full <img class="seo-brand-logo" ...> tag (self-closing or not).
IMG_RE = re.compile(
    r'<img\s+class="seo-brand-logo"\s+[^>]*?>',
    re.IGNORECASE | re.DOTALL,
)

ALT_RE = re.compile(r'\balt="([^"]*)"', re.IGNORECASE)
ONERROR_RE = re.compile(r'\sonerror="[^"]*"', re.IGNORECASE)


def build_onerror(brand: str) -> str:
    """Return the onerror attribute value for the given brand."""
    # Normalise lookup: strip surrounding whitespace.
    key = brand.strip()
    local_slug = LOCAL_SVG_MAP.get(key)
    if not local_slug:
        # Try a case-insensitive lookup as a safety net.
        lowered = {k.lower(): v for k, v in LOCAL_SVG_MAP.items()}
        local_slug = lowered.get(key.lower())

    if local_slug:
        return (
            "if(this.dataset.fb!=='1'){this.dataset.fb='1';"
            f"this.src='/images/marques/{local_slug}.svg';"
            "}else{this.style.display='none';"
            "this.nextElementSibling.classList.add('seo-brand-logo-text');}"
        )
    # 2-tier fallback: Clearbit -> styled text
    return (
        "this.style.display='none';"
        "this.nextElementSibling.classList.add('seo-brand-logo-text');"
    )


def replace_img_tag(match: re.Match) -> str:
    tag = match.group(0)
    alt_match = ALT_RE.search(tag)
    if not alt_match:
        return tag  # nothing we can do without a brand name
    brand = alt_match.group(1)
    new_onerror = build_onerror(brand)
    new_attr = f' onerror="{new_onerror}"'

    if ONERROR_RE.search(tag):
        new_tag = ONERROR_RE.sub(new_attr, tag, count=1)
    else:
        # Insert before the closing '>'
        new_tag = tag[:-1].rstrip() + new_attr + ">"
    return new_tag


def inject_css(html: str) -> tuple[str, bool]:
    """Ensure the CSS rule appears once inside the first inline <style>...</style>.

    Returns (new_html, injected_flag).
    """
    if ".seo-brand-logo-text" in html:
        return html, False

    style_match = re.search(r"<style\b[^>]*>", html, re.IGNORECASE)
    if not style_match:
        return html, False

    insert_pos = style_match.end()
    new_html = html[:insert_pos] + CSS_RULE + html[insert_pos:]
    return new_html, True


def process_file(path: Path) -> tuple[int, bool]:
    """Return (number_of_img_tags_updated, css_injected)."""
    original = path.read_text(encoding="utf-8")
    updated_count = 0

    def _replace(m: re.Match) -> str:
        nonlocal updated_count
        new = replace_img_tag(m)
        if new != m.group(0):
            updated_count += 1
        return new

    new_html = IMG_RE.sub(_replace, original)
    new_html, css_injected = inject_css(new_html)

    if new_html != original:
        path.write_text(new_html, encoding="utf-8")
    return updated_count, css_injected


def main() -> int:
    root = find_project_root()
    prestations_dir = root / "prestations"
    html_files = sorted(prestations_dir.glob("*.html"))
    if not html_files:
        sys.exit(f"No HTML files found in {prestations_dir}")

    files_modified = 0
    total_imgs = 0
    files_with_css = 0
    sample_card = None

    for file_path in html_files:
        imgs_updated, css_injected = process_file(file_path)
        if imgs_updated or css_injected:
            files_modified += 1
        total_imgs += imgs_updated
        if css_injected:
            files_with_css += 1
        if sample_card is None and imgs_updated:
            # Grab the first brand card from this file for the report.
            text = file_path.read_text(encoding="utf-8")
            m = re.search(
                r'<a[^>]*class="seo-brand-card"[^>]*>.*?</a>',
                text,
                re.DOTALL,
            )
            if m:
                sample_card = (file_path.name, m.group(0))

    print(f"Files scanned:   {len(html_files)}")
    print(f"Files modified:  {files_modified}")
    print(f"Imgs updated:    {total_imgs}")
    print(f"CSS injected in: {files_with_css} files")
    if sample_card:
        name, snippet = sample_card
        print(f"\nSample updated card from {name}:")
        print(snippet)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
