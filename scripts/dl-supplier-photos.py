#!/usr/bin/env python3
"""
dl-supplier-photos.py
=====================

Downloads real product photos from supplier websites for use on the
HELP Confort prestation pages.

Why this script exists
----------------------
The Cowork sandbox proxy blocks outbound HTTPS requests to most external
domains, so the photos must be downloaded from the user's own Mac (or
another machine with internet access) directly.

Usage
-----
    cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
    python3 scripts/dl-supplier-photos.py

The script:
- Saves each image to /images/fournisseurs/<slug>-photo.jpg
- Creates the destination directory if missing
- Skips brands whose image already exists locally
- Reports a summary at the end (OK / SKIPPED / FAILED)

If a URL fails (404, timeout, redirect to login), edit the BRAND_URLS dict
below and rerun the script.

Brand cards HTML snippet (to add manually in a prestation page once the
images are downloaded)
----------------------------------------------------------------------
    <article class="brand-card">
      <img src="/images/fournisseurs/<slug>-photo.jpg"
           alt="<Nom Marque>"
           loading="lazy" width="320" height="200">
      <h3><Nom Marque></h3>
      <p>Notre fournisseur partenaire pour <produit>.</p>
    </article>
"""

import os
import sys
import socket
import urllib.request
import urllib.error

# Project root = parent of this script's directory.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
DEST_DIR = os.path.join(PROJECT_ROOT, "images", "fournisseurs")
TIMEOUT = 20  # seconds
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
)

# ─────────────────────────────────────────────────────────────────────────────
# Brand → best-effort product photo URL.
# These URLs are reasonable starting points based on each supplier's media
# kits / product pages. If one returns 404 or redirect-to-login, replace the
# URL with one copied from the supplier's actual product page and re-run.
# ─────────────────────────────────────────────────────────────────────────────
BRAND_URLS = {
    # MENUISERIE — fenêtres, portes
    "groupe-millet":  "https://www.groupe-millet.com/wp-content/uploads/2021/01/fenetre-bois-millet.jpg",
    "bremaud":        "https://www.bremaud.fr/wp-content/uploads/2020/05/porte-entree-bremaud.jpg",
    "kostum":         "https://www.kostum.fr/wp-content/uploads/porte-entree-aluminium-kostum.jpg",
    "jeld-wen":       "https://www.jeld-wen.fr/-/media/jeldwen-fr/products/porte-bois-jeld-wen.jpg",
    "roziere":        "https://www.menuiseries-roziere.fr/wp-content/uploads/porte-entree-roziere.jpg",
    "velux":          "https://www.velux.fr/-/media/marketing/fr/images/products/fenetre-de-toit-velux.jpg",

    # VOLETS / FERMETURES
    "soprofen":       "https://www.soprofen.fr/wp-content/uploads/volet-roulant-soprofen.jpg",

    # PORTES DE GARAGE
    "hormann":        "https://www.hormann.fr/fileadmin/_processed_/porte-garage-sectionnelle-hormann.jpg",
    "novoferm":       "https://www.novoferm.fr/wp-content/uploads/porte-garage-novoferm.jpg",

    # CHAUFFE-EAU / ECS
    "atlantic":       "https://www.atlantic.fr/var/atlantic/storage/images/chauffe-eau-atlantic.jpg",

    # SANITAIRE
    "geberit":        "https://www.geberit.fr/dam/images/products/wc-suspendu-geberit.jpg",

    # ÉLECTRICITÉ — tableaux, appareillage
    "schneider":      "https://www.se.com/fr/fr/assets/v2/products/tableau-electrique-schneider.jpg",
    "legrand":        "https://www.legrand.fr/sites/default/files/styles/product/tableau-legrand.jpg",
}


def url_to_dest(slug: str) -> str:
    return os.path.join(DEST_DIR, f"{slug}-photo.jpg")


def download_one(slug: str, url: str) -> tuple[str, str]:
    """Returns (status, detail). status in {OK, SKIPPED, FAILED}."""
    dest = url_to_dest(slug)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return ("SKIPPED", f"already exists: {os.path.relpath(dest, PROJECT_ROOT)}")

    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            ctype = resp.headers.get("Content-Type", "").lower()
            if "image" not in ctype:
                return ("FAILED", f"not an image (Content-Type: {ctype})")
            data = resp.read()
            if len(data) < 1024:
                return ("FAILED", f"image too small ({len(data)} bytes) — likely placeholder/error")
            with open(dest, "wb") as f:
                f.write(data)
            return ("OK", f"{len(data)//1024} KB → {os.path.relpath(dest, PROJECT_ROOT)}")
    except urllib.error.HTTPError as e:
        return ("FAILED", f"HTTP {e.code} — {url}")
    except urllib.error.URLError as e:
        return ("FAILED", f"URL error: {e.reason} — {url}")
    except socket.timeout:
        return ("FAILED", f"timeout after {TIMEOUT}s — {url}")
    except Exception as e:
        return ("FAILED", f"{type(e).__name__}: {e} — {url}")


def main() -> int:
    os.makedirs(DEST_DIR, exist_ok=True)
    print(f"Destination: {DEST_DIR}\n")

    ok, skipped, failed = [], [], []
    for slug, url in BRAND_URLS.items():
        status, detail = download_one(slug, url)
        print(f"  [{status:^7}] {slug:20s}  {detail}")
        {"OK": ok, "SKIPPED": skipped, "FAILED": failed}[status].append(slug)

    print()
    print(f"OK:      {len(ok):3d}  {ok}")
    print(f"SKIPPED: {len(skipped):3d}  {skipped}")
    print(f"FAILED:  {len(failed):3d}  {failed}")
    if failed:
        print("\nTo fix failed URLs:")
        print("  1. Visit the supplier website manually")
        print("  2. Right-click the product photo → 'Copy image address'")
        print("  3. Replace the URL in BRAND_URLS in this script")
        print("  4. Rerun the script (already-downloaded brands are skipped)")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
