#!/usr/bin/env python3
"""
Add BreadcrumbList Schema.org JSON-LD to all prestation pages.
Parses existing <nav class="bc"> to extract metier name + URL + prestation name.
Idempotent: skips files that already contain a BreadcrumbList.
"""
import json
import os
import re
import sys
from pathlib import Path

PRESTATIONS_DIR = Path(__file__).resolve().parent.parent / "prestations"
BASE_URL = "https://www.depan59-62.fr"

# Regex to find <nav class="bc">...</nav>
BC_RE = re.compile(r'<nav class="bc">(.*?)</nav>', re.DOTALL)
# Regex to find anchor inside breadcrumb (capture href and inner text)
A_RE = re.compile(r'<a\s+href="([^"]+)"[^>]*>([^<]+)</a>')

def extract_breadcrumb(html: str):
    """Return (metier_name, metier_url, prestation_name) or None."""
    m = BC_RE.search(html)
    if not m:
        return None
    bc_inner = m.group(1)
    anchors = A_RE.findall(bc_inner)
    if len(anchors) < 2:
        return None
    # First anchor = Accueil, second anchor = Metier
    metier_url, metier_name = anchors[1]
    # Prestation name is the trailing text after the last <a>...</a>
    # Find last </a> and capture the trailing text after the separator
    last_a_end = bc_inner.rfind("</a>")
    tail = bc_inner[last_a_end + 4:]
    # Strip separators / dots / whitespace / &middot; / ·
    tail = tail.replace("&middot;", "").replace("·", "").strip()
    # Remove HTML entities in tail
    tail = re.sub(r"\s+", " ", tail).strip()
    if not tail:
        return None
    return metier_name.strip(), metier_url.strip(), tail

def build_jsonld(metier_name, metier_url, prestation_name, slug):
    data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil",
             "item": f"{BASE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": metier_name,
             "item": f"{BASE_URL}{metier_url}"},
            {"@type": "ListItem", "position": 3, "name": prestation_name,
             "item": f"{BASE_URL}/prestations/{slug}.html"},
        ],
    }
    # Compact JSON like the example
    return ('<script type="application/ld+json">'
            + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
            + '</script>')

def inject(html: str, jsonld_tag: str) -> str:
    """Inject jsonld_tag immediately before </head>."""
    if "</head>" not in html:
        return html
    # Inject right before </head> (no extra newline to keep format consistent)
    return html.replace("</head>", jsonld_tag + "</head>", 1)

def process(path: Path):
    html = path.read_text(encoding="utf-8")
    if "BreadcrumbList" in html:
        return ("skip", "already has BreadcrumbList")
    info = extract_breadcrumb(html)
    if not info:
        return ("error", "could not parse <nav class=\"bc\">")
    metier_name, metier_url, prestation_name = info
    slug = path.stem
    tag = build_jsonld(metier_name, metier_url, prestation_name, slug)
    # Validate JSON syntax
    try:
        inner = tag[len('<script type="application/ld+json">'):-len('</script>')]
        json.loads(inner)
    except json.JSONDecodeError as e:
        return ("error", f"invalid JSON generated: {e}")
    new_html = inject(html, tag)
    if new_html == html:
        return ("error", "no </head> found")
    path.write_text(new_html, encoding="utf-8")
    return ("ok", f"{metier_name} > {prestation_name}")

def main():
    files = sorted(PRESTATIONS_DIR.glob("*.html"))
    print(f"Found {len(files)} prestation pages in {PRESTATIONS_DIR}")
    counts = {"ok": 0, "skip": 0, "error": 0}
    for p in files:
        status, msg = process(p)
        counts[status] += 1
        marker = {"ok": "[OK]   ", "skip": "[SKIP] ", "error": "[ERR]  "}[status]
        print(f"{marker}{p.name}: {msg}")
    print(f"\nResult: ok={counts['ok']}  skip={counts['skip']}  error={counts['error']}")
    return 0 if counts["error"] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
