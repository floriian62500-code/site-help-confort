#!/usr/bin/env python3
"""
Compresse les photos /images/prestations/ à <300KB chacune.

- Resize à 1200px de largeur max
- JPG qualité 80 (descend à 60 si trop gros)
- Convertit PNG/WebP en JPG progressif
- Supprime les originaux PNG après conversion

À lancer sur le Mac (où on a les droits d'écriture sur les fichiers).
"""
import os, glob
from PIL import Image

DEST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images", "prestations")
MAX_WIDTH = 1200
QUALITY_HIGH = 80
QUALITY_MED = 70
QUALITY_LOW = 60
TARGET_SIZE_KB = 300

before_total = 0
after_total = 0
processed = 0
errors = []

for fp in sorted(glob.glob(f"{DEST}/*")):
    if fp.endswith(".svg") or os.path.isdir(fp):
        continue
    size_before = os.path.getsize(fp)
    before_total += size_before
    try:
        img = Image.open(fp)
        if img.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            new_height = int(img.height * ratio)
            img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)

        out_path = fp.rsplit(".", 1)[0] + ".jpg"

        for q in (QUALITY_HIGH, QUALITY_MED, QUALITY_LOW):
            img.save(out_path, "JPEG", quality=q, optimize=True, progressive=True)
            if os.path.getsize(out_path) <= TARGET_SIZE_KB * 1024:
                break

        size_after = os.path.getsize(out_path)
        after_total += size_after

        if fp.endswith(".png") and out_path != fp:
            os.remove(fp)
            print(f"  [OK] {os.path.basename(fp):40} {size_before//1024:>5}KB → {size_after//1024:>4}KB (PNG→JPG)")
        else:
            print(f"  [OK] {os.path.basename(fp):40} {size_before//1024:>5}KB → {size_after//1024:>4}KB")
        processed += 1
    except Exception as e:
        errors.append((fp, str(e)))
        print(f"  [ERR] {fp}: {e}")

print()
print(f"Processed: {processed} images")
print(f"Total before: {before_total/1024/1024:.1f} MB")
print(f"Total after:  {after_total/1024/1024:.1f} MB")
if before_total > 0:
    print(f"Saved:        {(before_total - after_total)/1024/1024:.1f} MB ({(1 - after_total/before_total)*100:.0f}%)")

if errors:
    print(f"\n{len(errors)} errors:")
    for fp, e in errors:
        print(f"  - {fp}: {e}")
    print("\nPour les fichiers corrompus, supprime-les et relance dl-prestation-photos.py")
