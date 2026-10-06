#!/usr/bin/env python3
"""
After dl-prestation-photos.py downloads photos to /images/prestations/<slug>.jpg,
this script injects them into the hero of each prestation page.

The hero currently shows an SVG illustration. We wrap it so the photo (if present)
shows on top, and the SVG remains as fallback if the photo fails to load.
"""
import os
import re
import glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS_DIR = os.path.join(BASE, "images", "prestations")
PRESTATIONS_DIR = os.path.join(BASE, "prestations")

def get_photo_path(slug):
    """Return /images/prestations/<slug>.<ext> if a photo exists, else None."""
    for ext in ("jpg", "png", "jpeg", "webp", "svg"):
        path = os.path.join(PHOTOS_DIR, slug + "." + ext)
        if os.path.exists(path) and os.path.getsize(path) > 1000:
            return f"/images/prestations/{slug}.{ext}"
    return None

def process_file(filepath):
    slug = os.path.basename(filepath).replace(".html", "")
    photo = get_photo_path(slug)
    if not photo:
        return ("SKIP", slug, "no photo file")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Already injected?
    if f'src="{photo}"' in content:
        return ("SKIP-already", slug, "already injected")

    # Find the <div class="seo-hero-img">...</div> block (single line, contains SVG)
    pattern = r'(<div class="seo-hero-img">)(<svg viewBox="0 0 200 150"[^>]*>.*?</svg>)(</div>)'
    m = re.search(pattern, content, re.DOTALL)
    if not m:
        return ("FAIL", slug, "no seo-hero-img with SVG found")

    # Build new hero block: photo on top, SVG fallback hidden behind
    new_block = (
        f'<div class="seo-hero-img" style="position:relative;overflow:hidden">'
        f'<img src="{photo}" alt="{slug.replace("-", " ")}" loading="eager" '
        f'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" '
        f'onerror="this.style.display=\'none\'">'
        f'{m.group(2)}'  # Keep the SVG as fallback (behind the img)
        f'</div>'
    )

    new_content = content.replace(m.group(0), new_block)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    return ("OK", slug, photo)

def main():
    files = sorted(glob.glob(os.path.join(PRESTATIONS_DIR, "*.html")))
    print(f"Processing {len(files)} prestation files\n")
    ok, skip, skip_already, fail = 0, 0, 0, 0
    for filepath in files:
        status, slug, msg = process_file(filepath)
        marker = {
            "OK": "INJECTED",
            "SKIP": "SKIPPED ",
            "SKIP-already": "ALREADY ",
            "FAIL": "FAILED  ",
        }[status]
        print(f"  [{marker}] {slug:32} {msg}")
        if status == "OK":
            ok += 1
        elif status == "SKIP":
            skip += 1
        elif status == "SKIP-already":
            skip_already += 1
        else:
            fail += 1
    print()
    print(f"INJECTED:       {ok}")
    print(f"SKIPPED-nophoto: {skip}")
    print(f"ALREADY:        {skip_already}")
    print(f"FAILED:         {fail}")

if __name__ == "__main__":
    main()
