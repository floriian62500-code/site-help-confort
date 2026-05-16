#!/usr/bin/env python3
"""Download official brand SVG logos from Wikipedia Commons / brand websites."""
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
import ssl

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "images", "marques")
os.makedirs(OUT, exist_ok=True)

LOGOS = [
    # Menuiserie
    ("groupe-millet",     "https://en.wikipedia.org/wiki/Special:FilePath/Groupe_Millet_logo.svg"),
    ("soprofen",          "https://www.soprofen.fr/themes/custom/soprofen/logo.svg"),
    ("hormann",           "https://en.wikipedia.org/wiki/Special:FilePath/Hörmann_KG_logo.svg"),
    ("novoferm",          "https://en.wikipedia.org/wiki/Special:FilePath/Novoferm_logo.svg"),
    ("velux",             "https://en.wikipedia.org/wiki/Special:FilePath/Velux-logo.svg"),
    # Plomberie
    ("grohe",             "https://en.wikipedia.org/wiki/Special:FilePath/Grohe-logo.svg"),
    ("roca",              "https://en.wikipedia.org/wiki/Special:FilePath/Roca_logo.svg"),
    ("villeroy-boch",     "https://en.wikipedia.org/wiki/Special:FilePath/Villeroy_&_Boch_logo.svg"),
    ("wavin",             "https://en.wikipedia.org/wiki/Special:FilePath/Wavin_logo.svg"),
    # Chauffage
    ("viessmann",         "https://en.wikipedia.org/wiki/Special:FilePath/Viessmann_logo.svg"),
    ("de-dietrich",       "https://en.wikipedia.org/wiki/Special:FilePath/De_Dietrich_logo.svg"),
    ("saunier-duval",     "https://en.wikipedia.org/wiki/Special:FilePath/Saunier_Duval_logo.svg"),
    ("vaillant",          "https://en.wikipedia.org/wiki/Special:FilePath/Vaillant_logo.svg"),
    ("ariston",           "https://en.wikipedia.org/wiki/Special:FilePath/Ariston_Thermo_Group_logo.svg"),
    # Electricite
    ("legrand",           "https://en.wikipedia.org/wiki/Special:FilePath/Legrand_logo.svg"),
    ("schneider-electric","https://en.wikipedia.org/wiki/Special:FilePath/Schneider_Electric_logo.svg"),
    ("hager",             "https://en.wikipedia.org/wiki/Special:FilePath/Hager_Group_logo.svg"),
    ("philips",           "https://en.wikipedia.org/wiki/Special:FilePath/Philips_logo.svg"),
    ("osram",             "https://en.wikipedia.org/wiki/Special:FilePath/Osram_logo.svg"),
    # Vitrerie
    ("saint-gobain",      "https://en.wikipedia.org/wiki/Special:FilePath/Saint_Gobain_logo.svg"),
]

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
ctx = ssl.create_default_context()

ok = []
failed = []

def encode_url(url):
    """Percent-encode the path so non-ASCII chars (e.g. ö in Hörmann) work in HTTP requests."""
    parts = urllib.parse.urlsplit(url)
    path = urllib.parse.quote(parts.path, safe="/:%")
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, path, parts.query, parts.fragment))


for slug, raw_url in LOGOS:
    url = encode_url(raw_url)
    out_path = os.path.join(OUT, f"{slug}.svg")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/svg+xml,image/*,*/*"})
        with urllib.request.urlopen(req, timeout=20, context=ctx) as resp:
            data = resp.read()
            ctype = resp.headers.get("Content-Type", "")
            final_url = resp.geturl()
        # Check it's actually an SVG (Wikipedia returns HTML 404 page for missing files)
        head = data[:500].lstrip().lower()
        if not (head.startswith(b"<?xml") or head.startswith(b"<svg") or b"<svg" in data[:1000].lower()):
            failed.append((slug, url, f"not SVG (got {ctype}, {len(data)} bytes)"))
            continue
        with open(out_path, "wb") as f:
            f.write(data)
        ok.append((slug, len(data), final_url))
        print(f"OK    {slug:<22}  {len(data):>8} bytes  <- {final_url}")
    except urllib.error.HTTPError as e:
        failed.append((slug, url, f"HTTP {e.code}"))
        print(f"FAIL  {slug:<22}  HTTP {e.code}")
    except Exception as e:
        failed.append((slug, url, str(e)))
        print(f"FAIL  {slug:<22}  {e}")

print()
print(f"Downloaded: {len(ok)}/{len(LOGOS)}")
if failed:
    print("Failed:")
    for slug, url, why in failed:
        print(f"  - {slug}: {why}")
