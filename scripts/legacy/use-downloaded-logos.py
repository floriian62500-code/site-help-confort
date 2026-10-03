#!/usr/bin/env python3
"""Swap inline SVG-text brand logos for real downloaded SVG files (when present in /images/marques/).

For each brand card on /prestations/*.html, if a real logo SVG exists at
/images/marques/<slug>.svg, replace the <span class="seo-brand-logo-svg">...</span>
block with an <img class="seo-brand-logo" src="..."> tag. Brands without a local
file are left untouched (fallback to the existing SVG text logo).
"""
import os
import re
import glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRESTA = os.path.join(BASE, "prestations")
LOGO_DIR = os.path.join(BASE, "images", "marques")

# Map brand display name (as it appears inside <span class="seo-brand-name">NAME</span>)
# to the slug used in /images/marques/<slug>.svg. Names use HTML-unescaped form.
BRAND_SLUGS = {
    # Menuiserie
    "Groupe Millet": "groupe-millet",
    "Soprofen": "soprofen",
    "Hörmann": "hormann",
    "Hormann": "hormann",
    "Novoferm": "novoferm",
    "Velux": "velux",
    "VELUX": "velux",
    # Plomberie
    "Grohe": "grohe",
    "GROHE": "grohe",
    "Roca": "roca",
    "Villeroy & Boch": "villeroy-boch",
    "Wavin": "wavin",
    # Chauffage
    "Viessmann": "viessmann",
    "De Dietrich": "de-dietrich",
    "Saunier Duval": "saunier-duval",
    "Vaillant": "vaillant",
    "Ariston": "ariston",
    # Electricite
    "Legrand": "legrand",
    "Schneider Electric": "schneider-electric",
    "Schneider": "schneider-electric",
    "Hager": "hager",
    "Philips": "philips",
    "Osram": "osram",
    # Vitrerie
    "Saint-Gobain": "saint-gobain",
    "Saint Gobain": "saint-gobain",
}

# CSS to add (once per file) for the new <img class="seo-brand-logo">
NEW_CSS = ".seo-brand-logo{height:38px;width:auto;max-width:100%;object-fit:contain;display:block;margin:0 auto}"

# Match a complete brand card. Capture group 1 = inner content. We rebuild on a hit.
# A card looks like:
# <a href="..." class="seo-brand-card" ...>
#   <span class="seo-brand-logo-svg"><svg ...>...</svg></span>
#   <span class="seo-brand-name">NAME</span>
#   <span class="seo-brand-cat">...</span>
# </a>
CARD_RE = re.compile(
    r'(<a\b[^>]*class="seo-brand-card"[^>]*>\s*)'           # 1: opening <a>
    r'<span class="seo-brand-logo-svg">.*?</span>\s*'        # logo-svg span (dropped)
    r'(<span class="seo-brand-name">([^<]+)</span>)',        # 2: name span, 3: name text
    re.DOTALL,
)

# Unescape minimal HTML entities the brand name might contain
def html_unescape(s):
    return (s.replace("&amp;", "&")
             .replace("&quot;", '"')
             .replace("&apos;", "'")
             .replace("&lt;", "<")
             .replace("&gt;", ">")
             .replace("&#39;", "'"))


def available_logos():
    if not os.path.isdir(LOGO_DIR):
        return set()
    return {
        os.path.splitext(f)[0]
        for f in os.listdir(LOGO_DIR)
        if f.lower().endswith(".svg")
    }


def slug_for_name(name):
    """Return slug if we know this brand AND its file exists locally."""
    name_clean = html_unescape(name).strip()
    slug = BRAND_SLUGS.get(name_clean)
    if not slug:
        # Try case-insensitive lookup
        for k, v in BRAND_SLUGS.items():
            if k.lower() == name_clean.lower():
                slug = v
                break
    return slug


def inject_css(src):
    """Add NEW_CSS into the first <style> block (idempotent)."""
    if "seo-brand-logo{" in src or ".seo-brand-logo{" in src:
        return src, False
    # Insert right after the existing .seo-brand-logo-svg rule if present, else at
    # the start of the first <style> tag.
    anchor = ".seo-brand-logo-svg{"
    idx = src.find(anchor)
    if idx != -1:
        # Find the closing `}` of this rule
        end = src.find("}", idx)
        if end != -1:
            insertion = src[: end + 1] + NEW_CSS + src[end + 1 :]
            return insertion, True
    # Fallback: insert after first <style>
    m = re.search(r"<style[^>]*>", src)
    if m:
        i = m.end()
        return src[:i] + NEW_CSS + src[i:], True
    return src, False


def process_file(path, available):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    replacements = []

    def repl(m):
        open_a = m.group(1)
        name_span = m.group(2)
        name_text = m.group(3)
        slug = slug_for_name(name_text)
        if not slug or slug not in available:
            return m.group(0)  # no change
        clean_name = html_unescape(name_text)
        # Build new fragment: keep the <a>, replace the logo span with <img>
        img = (
            f'<img class="seo-brand-logo" src="/images/marques/{slug}.svg" '
            f'alt="{clean_name}" loading="lazy">'
        )
        replacements.append((name_text, slug))
        return f"{open_a}{img}\n{name_span}"

    new = CARD_RE.sub(repl, src)
    if replacements:
        new, _ = inject_css(new)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new)
    return replacements


def main():
    available = available_logos()
    # Filter to only slugs in our managed set
    managed_slugs = set(BRAND_SLUGS.values())
    available_managed = available & managed_slugs
    print(f"Local logos found ({len(available_managed)}): {sorted(available_managed)}")
    if not available_managed:
        print("No local logos to swap in. Falling back to existing inline SVGs.")
        return

    total_swaps = 0
    files_touched = 0
    per_brand = {}
    for path in sorted(glob.glob(os.path.join(PRESTA, "*.html"))):
        reps = process_file(path, available_managed)
        if reps:
            files_touched += 1
            total_swaps += len(reps)
            for name, slug in reps:
                per_brand[slug] = per_brand.get(slug, 0) + 1
            print(f"  {os.path.basename(path)}: swapped {len(reps)}")

    print()
    print(f"Files touched: {files_touched}")
    print(f"Total brand cards swapped to real logo: {total_swaps}")
    if per_brand:
        print("Swaps per brand slug:")
        for slug, n in sorted(per_brand.items()):
            print(f"  {slug}: {n}")


if __name__ == "__main__":
    main()
