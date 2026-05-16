#!/usr/bin/env python3
"""
Download official brand logos using Wikipedia API.

Strategy:
1. Query Wikipedia API for the official "pageimages" of each brand article
2. The API returns the URL of the brand's logo (usually SVG/PNG) used on the article
3. Download with User-Agent + delays to avoid 429 rate limit

This works much better than guessing FilePath URLs because the API tells
us the actual filename used on Wikipedia.
"""
import os
import sys
import time
import json
import urllib.request
import urllib.parse
import urllib.error
import ssl

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(BASE, "images", "marques")
os.makedirs(DEST, exist_ok=True)

# Brand → Wikipedia article title + slug for local file
# Use the English Wikipedia article title (more reliable, larger coverage)
BRANDS = [
    ("groupe-millet",    "Groupe Millet",     "fr"),  # French wiki only
    ("hormann",          "Hörmann",           "en"),
    ("novoferm",         "Novoferm",          "en"),
    ("velux",            "Velux",             "en"),
    ("grohe",            "Grohe",             "en"),
    ("roca",             "Roca Sanitario",    "en"),
    ("villeroy-boch",    "Villeroy & Boch",   "en"),
    ("wavin",            "Wavin",             "en"),
    ("viessmann",        "Viessmann",         "en"),
    ("de-dietrich",      "De Dietrich",       "en"),
    ("saunier-duval",    "Saunier Duval",     "fr"),
    ("vaillant",         "Vaillant Group",    "en"),
    ("ariston",          "Ariston Thermo",    "en"),
    ("legrand",          "Legrand",           "en"),
    ("schneider-electric", "Schneider Electric", "en"),
    ("hager",            "Hager Group",       "en"),
    ("philips",          "Philips",           "en"),
    ("osram",            "Osram",             "en"),
    ("saint-gobain",     "Saint-Gobain",      "en"),
    ("soprofen",         "Soprofen",          "fr"),
    ("brico-depot",      "Brico Dépôt",       "fr"),
    ("frisquet",         "Frisquet",          "fr"),
    ("atlantic-pro",     "Atlantic (chauffage)", "fr"),
    ("geberit",          "Geberit",           "en"),
    ("somfy",            "Somfy",             "en"),
    ("schueco",          "Schüco",            "en"),
    ("parador",          "Parador (company)", "en"),
    ("hansgrohe",        "Hansgrohe",         "en"),
]

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 HelpConfortBrandFetch/1.0 (saint-omer@helpconfort.com)"

def http_get(url, accept="*/*"):
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": accept,
    })
    ctx = ssl.create_default_context()
    return urllib.request.urlopen(req, timeout=30, context=ctx)

def get_logo_url(brand_title, lang="en"):
    """Query Wikipedia API to get the pageimage URL for a brand article."""
    api_url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "prop": "pageimages",
        "piprop": "original",
        "titles": brand_title,
        "redirects": "1",
    }
    url = api_url + "?" + urllib.parse.urlencode(params)
    try:
        with http_get(url, accept="application/json") as resp:
            data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for _, page in pages.items():
            if "original" in page:
                return page["original"]["source"]
        return None
    except Exception as e:
        return f"ERR:{e}"

def download(url, slug):
    """Download URL to images/marques/<slug>.<ext>."""
    ext = ".svg" if ".svg" in url.lower() else ".png" if ".png" in url.lower() else ".jpg"
    dest = os.path.join(DEST, slug + ext)
    if os.path.exists(dest) and os.path.getsize(dest) > 500:
        return ("SKIP", dest, "already exists")
    try:
        with http_get(url) as resp:
            content = resp.read()
        if len(content) < 200:
            return ("FAIL", dest, "too small")
        with open(dest, "wb") as f:
            f.write(content)
        return ("OK", dest, f"{len(content)} bytes")
    except urllib.error.HTTPError as e:
        return ("FAIL", dest, f"HTTP {e.code}")
    except Exception as e:
        return ("FAIL", dest, f"{e}")

def main():
    print(f"Destination: {DEST}\n")
    ok, fail, skip = 0, 0, 0
    failed_list = []
    for slug, wiki_title, lang in BRANDS:
        # Step 1 — find URL via API
        url = get_logo_url(wiki_title, lang)
        if not url or (isinstance(url, str) and url.startswith("ERR:")):
            print(f"  [SEARCH-FAIL] {slug:22} no wiki page for '{wiki_title}' ({lang})")
            fail += 1
            failed_list.append((slug, wiki_title, str(url)))
            time.sleep(1.0)
            continue
        # Step 2 — download
        status, dest, msg = download(url, slug)
        marker = "OK     " if status == "OK" else "SKIPPED" if status == "SKIP" else "FAILED "
        print(f"  [{marker}] {slug:22} {msg:30}  {url}")
        if status == "OK":
            ok += 1
        elif status == "SKIP":
            skip += 1
        else:
            fail += 1
            failed_list.append((slug, wiki_title, msg))
        time.sleep(1.2)  # polite rate-limit
    print()
    print(f"OK:      {ok:3d}")
    print(f"SKIPPED: {skip:3d}")
    print(f"FAILED:  {fail:3d}")
    if failed_list:
        print("\nFailed:")
        for slug, title, msg in failed_list:
            print(f"  - {slug} ({title}): {msg}")

if __name__ == "__main__":
    main()
