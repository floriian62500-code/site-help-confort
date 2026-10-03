#!/usr/bin/env python3
"""
Download official brand logos from Wikipedia using a smarter strategy:

1. Query Wikipedia API for ALL images on a brand's article
2. Filter for files that:
   - Have "logo" in filename, OR are SVG (likely a logo)
   - Are NOT building/factory/people photos (.jpg/.jpeg usually = bad)
3. Download the first matching file with proper User-Agent

This is much more reliable than `pageimages` which returns the first image
(often a building photo, not the logo).
"""
import os
import sys
import time
import json
import re
import urllib.request
import urllib.parse
import urllib.error
import ssl

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(BASE, "images", "marques")
os.makedirs(DEST, exist_ok=True)

BRANDS = [
    ("hormann",          "Hörmann",                   "en"),
    ("novoferm",         "Novoferm",                  "en"),
    ("velux",            "Velux",                     "en"),
    ("grohe",            "Grohe",                     "en"),
    ("roca",             "Roca Sanitario",            "en"),
    ("villeroy-boch",    "Villeroy & Boch",           "en"),
    ("wavin",            "Wavin",                     "en"),
    ("viessmann",        "Viessmann",                 "en"),
    ("de-dietrich",      "De Dietrich (company)",     "en"),
    ("saunier-duval",    "Saunier Duval",             "en"),
    ("vaillant",         "Vaillant Group",            "en"),
    ("ariston",          "Ariston Thermo",            "en"),
    ("legrand",          "Legrand",                   "en"),
    ("schneider-electric", "Schneider Electric",      "en"),
    ("hager",            "Hager Group",               "en"),
    ("philips",          "Philips",                   "en"),
    ("osram",            "Osram",                     "en"),
    ("saint-gobain",     "Saint-Gobain",              "en"),
    ("geberit",          "Geberit",                   "en"),
    ("somfy",            "Somfy",                     "en"),
    ("schueco",          "Schüco",                    "en"),
    ("hansgrohe",        "Hansgrohe",                 "en"),
    ("frisquet",         "Frisquet",                  "fr"),
    ("atlantic",         "Groupe Atlantic",           "fr"),
    ("groupe-millet",    "Millet (entreprise)",       "fr"),
    ("soprofen",         "Soprofen",                  "fr"),
]

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 HelpConfortBrandFetch/1.0 (saint-omer@helpconfort.com)"

def http_get(url, accept="*/*"):
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": accept,
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    })
    ctx = ssl.create_default_context()
    return urllib.request.urlopen(req, timeout=30, context=ctx)

def list_images(brand_title, lang="en"):
    """Use Wikipedia API to list ALL image files on a page."""
    api_url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "prop": "images",
        "imlimit": "50",
        "titles": brand_title,
        "redirects": "1",
    }
    url = api_url + "?" + urllib.parse.urlencode(params)
    try:
        with http_get(url, accept="application/json") as resp:
            data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for _, page in pages.items():
            if "images" in page:
                return [img["title"] for img in page["images"]]
        return []
    except Exception as e:
        print(f"      [ERR list_images] {e}")
        return []

def get_image_url(file_title, lang="en"):
    """Convert 'File:Velux.svg' → direct upload URL via imageinfo API."""
    api_url = f"https://{lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "prop": "imageinfo",
        "iiprop": "url",
        "titles": file_title,
    }
    url = api_url + "?" + urllib.parse.urlencode(params)
    try:
        with http_get(url, accept="application/json") as resp:
            data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for _, page in pages.items():
            if "imageinfo" in page and page["imageinfo"]:
                return page["imageinfo"][0]["url"]
        return None
    except Exception:
        return None

def is_likely_logo(file_title, brand_name=""):
    """Heuristic: is this file likely THIS brand's logo (not a generic Wikipedia icon)?"""
    t = file_title.lower()
    has_logo_kw = "logo" in t
    is_svg = t.endswith(".svg")
    # REJECT generic Wikipedia/Commons icons (these appear on many articles as decoration)
    wiki_generic = [
        "commons-logo", "commons logo", "disambig", "wikidata",
        "wikipedia-logo", "wiki-logo", "edit-icon", "padlock",
        "mfgco", "stub-icon", "question_book", "ambox",
        "office-logo", "padlock-silver", "yes_check", "redirect",
        "logo disambig", "logo_disambig", "p_industry", "p industry",
        "merge-arrow", "split-arrow", "wikiquote-logo",
    ]
    if any(g in t for g in wiki_generic):
        return False
    # Reject building/people/event/blason photos
    bad_kw = ["campus", "siege", "siège", "hq_", "headquarters", "building",
              "factory", "usine", "blason", "coat_of_arms", "armoiries",
              "img_", "img-", "_img", ".jpg", ".jpeg", "photo_de_",
              "freiburg", "hochdorf", "amsterdam", "schiltigheim"]
    if any(bad in t for bad in bad_kw) and not is_svg:
        return False
    # Must contain the brand name OR have "logo" keyword
    # Normalize brand name for comparison (remove special chars, lowercase)
    if brand_name:
        normalized_brand = re.sub(r"[^a-z0-9]+", "", brand_name.lower())
        normalized_title = re.sub(r"[^a-z0-9]+", "", t)
        if normalized_brand and len(normalized_brand) >= 4:
            # The filename must contain at least the first 4 chars of the brand
            brand_prefix = normalized_brand[:4]
            if brand_prefix not in normalized_title:
                return False
    return is_svg or has_logo_kw

def download(url, slug, ext_hint=None):
    """Download URL to images/marques/<slug>.<ext>."""
    if ext_hint:
        ext = ext_hint
    elif ".svg" in url.lower():
        ext = ".svg"
    elif ".png" in url.lower():
        ext = ".png"
    else:
        ext = ".png"
    dest = os.path.join(DEST, slug + ext)
    if os.path.exists(dest) and os.path.getsize(dest) > 500:
        return ("SKIP", dest, "already exists")
    try:
        with http_get(url) as resp:
            content = resp.read()
        if len(content) < 200:
            return ("FAIL", dest, "too small")
        # Reject huge files (>2MB = likely a building photo, not a logo)
        if len(content) > 2_000_000:
            return ("FAIL", dest, f"too big ({len(content)/1e6:.1f}MB) — likely a photo not a logo")
        with open(dest, "wb") as f:
            f.write(content)
        return ("OK", dest, f"{len(content)} bytes")
    except urllib.error.HTTPError as e:
        return ("FAIL", dest, f"HTTP {e.code}")
    except Exception as e:
        return ("FAIL", dest, f"{e}")

def main():
    print(f"Destination: {DEST}\n")
    print(f"Strategy: list all images on Wikipedia article, filter for 'logo' or SVG, skip JPG buildings\n")
    ok, fail, skip = 0, 0, 0
    failed_list = []
    for slug, wiki_title, lang in BRANDS:
        print(f"  [SEARCH ] {slug:22} → '{wiki_title}' ({lang})")
        # Step 1 — list all images on the article
        images = list_images(wiki_title, lang)
        if not images:
            # Try alternate (often without lang suffix or with different name)
            print(f"      no article found")
            fail += 1
            failed_list.append((slug, wiki_title, "no article"))
            time.sleep(0.8)
            continue
        # Step 2 — filter for likely logos (must reference this brand)
        logo_candidates = [img for img in images if is_likely_logo(img, wiki_title)]
        if not logo_candidates:
            print(f"      no logo-like file found in {len(images)} images")
            fail += 1
            failed_list.append((slug, wiki_title, f"no logo in {len(images)} files"))
            time.sleep(0.8)
            continue
        # Sort: SVG first, then names with "logo" in them, then by length (shorter = simpler)
        logo_candidates.sort(key=lambda t: (
            0 if t.lower().endswith(".svg") else 1,
            0 if "logo" in t.lower() else 1,
            len(t)
        ))
        # Step 3 — try each candidate until one works
        for candidate in logo_candidates[:5]:
            url = get_image_url(candidate, lang)
            if not url:
                continue
            ext_hint = ".svg" if candidate.lower().endswith(".svg") else ".png" if candidate.lower().endswith(".png") else None
            status, dest, msg = download(url, slug, ext_hint=ext_hint)
            if status == "OK":
                print(f"      [OK    ] {msg:30}  {candidate}")
                ok += 1
                break
            elif status == "SKIP":
                print(f"      [SKIP  ] {msg}")
                skip += 1
                break
            else:
                print(f"      [{status}] {candidate}: {msg}")
        else:
            print(f"      no candidate downloaded successfully")
            fail += 1
            failed_list.append((slug, wiki_title, "all candidates failed"))
        time.sleep(1.0)
    print()
    print(f"OK:      {ok:3d}")
    print(f"SKIPPED: {skip:3d}")
    print(f"FAILED:  {fail:3d}")
    if failed_list:
        print("\nFailed (no logo found on Wikipedia — these brands may not have an article or logo there):")
        for slug, title, msg in failed_list:
            print(f"  - {slug:22} ({title}): {msg}")
        print("\nFor failed brands, find the logo manually:")
        print("  1. Visit the brand's website")
        print("  2. Right-click their logo → 'Save image as...'")
        print(f"  3. Save to: {DEST}/<slug>.svg or .png")

if __name__ == "__main__":
    main()
