#!/usr/bin/env python3
"""
Download REAL photos for each prestation using Wikimedia Commons SEARCH API.

Strategy:
1. For each prestation, define search keywords
2. Use Wikimedia Commons search API to find real existing photos
3. Pick the first matching JPG/PNG photo (filter out logos, charts, etc.)
4. Download to /images/prestations/<slug>.jpg
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
DEST = os.path.join(BASE, "images", "prestations")
os.makedirs(DEST, exist_ok=True)

USER_AGENT = "Mozilla/5.0 HelpConfortPhotoFetch/1.0 (saint-omer@helpconfort.com)"

# prestation slug → Commons search queries (try in order)
QUERIES = {
    # MENUISERIE
    "porte-entree":              ["porte entrée maison", "front door house", "entrance door wood"],
    "porte-garage":              ["garage door sectional", "porte garage sectionnelle", "garage door"],
    "portail-cloture":           ["portail aluminium maison", "aluminium gate house", "gate fence"],
    "fenetres-bois-alu-pvc":     ["fenêtre PVC double vitrage", "PVC window double glazing", "casement window"],
    "fenetres-completes":        ["fenêtre PVC", "PVC window", "casement window"],
    "coulissant-baie-vitree":    ["baie vitrée coulissante", "sliding glass door", "patio sliding door"],
    "garde-corps-rampes":        ["garde-corps balcon inox", "stainless steel railing balcony"],
    "remplacement-panneau-porte":["porte bois remplacement", "wooden door replacement"],
    "parquet":                   ["parquet chêne", "oak parquet floor", "wood floor"],
    # CHAUFFAGE
    "remplacement-chaudiere":    ["chaudière gaz murale", "gas boiler wall", "wall hung boiler"],
    "depannage-chaudiere":       ["chaudière gaz", "gas boiler", "wall boiler"],
    "desembouage":               ["radiateur chauffage", "radiator heating central", "heating radiator"],
    "ramonage":                  ["ramoneur cheminée", "chimney sweep", "Schornsteinfeger"],
    # PLOMBERIE
    "chauffe-eau":               ["chauffe-eau électrique cumulus", "electric water heater", "water heater cylinder"],
    "salle-de-bain":             ["salle de bain moderne douche italienne", "modern bathroom walk-in shower"],
    "recherche-fuite":           ["fuite eau plomberie", "water leak pipe", "plumbing leak"],
    "debouchage":                ["déboucheur canalisation", "drain plumber pipe", "drain unclog"],
    "sanitaire":                 ["wc suspendu salle de bain", "toilet bathroom modern", "wall hung toilet"],
    "reseaux-plomberie":         ["tuyauterie PER cuivre", "pex copper plumbing pipes", "plumbing pipes"],
    # ÉLECTRICITÉ
    "tableau-electrique":        ["tableau électrique disjoncteur", "electrical panel breaker", "consumer unit"],
    "depannage-electrique":      ["électricien tableau", "electrician electrical panel", "electrical work"],
    "recherche-panne-elec":      ["électricien multimètre", "electrician multimeter", "electrical fault"],
    "vmc":                       ["VMC double flux", "MVHR ventilation system", "mechanical ventilation heat recovery"],
    "luminaire":                 ["luminaire LED plafonnier", "LED ceiling light", "modern ceiling lamp"],
    # SERRURERIE
    "ouverture-porte":           ["serrurier ouverture porte", "locksmith opening door", "locksmith work"],
    "changement-cylindre":       ["cylindre serrure porte", "door lock cylinder", "pin tumbler lock"],
    "porte-claquee":             ["serrurier porte claquée", "locksmith locked out", "locksmith door"],
    "porte-fermee-cle":          ["serrurier clé perdue", "locksmith key lost", "locksmith door lock"],
    # VITRERIE
    "mise-securite-vitrerie":    ["vitre cassée vandalisme", "broken window security", "broken glass"],
    "vitrage-simple-double-triple": ["double vitrage fenêtre", "double glazing window", "triple glazing"],
    "vitrage-insert-poele":      ["insert cheminée vitrage", "wood burning stove insert", "fireplace insert"],
    "vitrerie-panneau-porte":    ["vitre porte cassée", "broken door glass", "door window pane"],
    # VOLETS
    "volet-roulant":             ["volet roulant maison", "rolling shutter house", "PVC rolling shutter"],
}

def http_get(url, accept="*/*"):
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": accept,
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    })
    ctx = ssl.create_default_context()
    return urllib.request.urlopen(req, timeout=30, context=ctx)

def search_commons(query, limit=20):
    """Search Wikimedia Commons for files matching query. Returns list of file titles."""
    api = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": query,
        "srnamespace": "6",  # File namespace
        "srlimit": str(limit),
    }
    url = api + "?" + urllib.parse.urlencode(params)
    try:
        with http_get(url, accept="application/json") as resp:
            data = json.loads(resp.read().decode("utf-8"))
        results = data.get("query", {}).get("search", [])
        return [r["title"] for r in results]
    except Exception as e:
        print(f"      [search-err] {e}")
        return []

def get_file_url(file_title):
    """Get direct URL of a File:xxx on Commons."""
    api = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
        "titles": file_title,
    }
    url = api + "?" + urllib.parse.urlencode(params)
    try:
        with http_get(url, accept="application/json") as resp:
            data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for _, page in pages.items():
            if "imageinfo" in page and page["imageinfo"]:
                ii = page["imageinfo"][0]
                return ii.get("url"), ii.get("mime", ""), ii.get("size", 0)
        return None, None, 0
    except Exception:
        return None, None, 0

def is_acceptable(file_title, mime, size):
    """Filter: real photo (not logo, icon, chart, SVG, animated GIF)."""
    t = file_title.lower()
    # Reject non-photos
    bad = ["logo", "icon", "flag", "map", "chart", "diagram", "graph",
           "wikipedia", "wikimedia", ".svg", ".gif", ".pdf", ".ogg",
           "commons-logo", "disambig", "stub-icon"]
    if any(b in t for b in bad):
        return False
    # Reject unwanted mime types
    if mime and not mime.startswith("image/"):
        return False
    if mime in ("image/svg+xml", "image/gif"):
        return False
    # Size check: between 5KB and 5MB
    if size and (size < 5_000 or size > 5_000_000):
        return False
    return True

def download(url, slug, ext_hint=".jpg"):
    """Download URL to images/prestations/<slug>.<ext>."""
    dest = os.path.join(DEST, slug + ext_hint)
    if os.path.exists(dest) and os.path.getsize(dest) > 5000:
        return ("SKIP", dest, "already exists")
    try:
        with http_get(url) as resp:
            content = resp.read()
        if len(content) < 5000:
            return ("FAIL", dest, "too small")
        with open(dest, "wb") as f:
            f.write(content)
        return ("OK", dest, f"{len(content)//1024} KB")
    except urllib.error.HTTPError as e:
        return ("FAIL", dest, f"HTTP {e.code}")
    except Exception as e:
        return ("FAIL", dest, f"{e}")

def fetch_photo_for(slug, queries):
    """Try each query → search Commons → download first acceptable image."""
    for q in queries:
        results = search_commons(q, limit=20)
        for file_title in results:
            url, mime, size = get_file_url(file_title)
            if not url:
                continue
            if not is_acceptable(file_title, mime, size):
                continue
            # Determine extension
            ext = ".jpg"
            if mime == "image/png":
                ext = ".png"
            elif mime == "image/webp":
                ext = ".webp"
            status, dest, msg = download(url, slug, ext_hint=ext)
            if status == "OK":
                return ("OK", file_title, msg)
            if status == "SKIP":
                return ("SKIP", file_title, msg)
        time.sleep(0.3)
    return ("FAIL", None, "no acceptable photo in any search")

def main():
    print(f"Destination: {DEST}\n")
    ok, fail, skip = 0, 0, 0
    failed = []
    for slug, queries in QUERIES.items():
        status, file_title, msg = fetch_photo_for(slug, queries)
        if status == "OK":
            print(f"  [OK     ] {slug:32} {msg:10}  {file_title}")
            ok += 1
        elif status == "SKIP":
            print(f"  [SKIPPED] {slug:32} {msg}")
            skip += 1
        else:
            print(f"  [FAILED ] {slug:32} {msg}")
            fail += 1
            failed.append(slug)
        time.sleep(0.5)
    print()
    print(f"OK:      {ok}/{len(QUERIES)}")
    print(f"SKIPPED: {skip}")
    print(f"FAILED:  {fail}")
    if failed:
        print(f"\nFailed prestations:")
        for s in failed:
            print(f"  - {s}")

if __name__ == "__main__":
    main()
