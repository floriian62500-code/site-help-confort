#!/usr/bin/env python3
"""Diversify the SVG placeholder icons inside .m-services-grid on metier pages.

Each .m-svc card currently uses a generic SVG placeholder; this script
replaces the inner path/circle/line/rect elements of the
`<span class="m-svc-placeholder"><svg ...>...</svg></span>` with a
unique icon based on the card's <h3> text.

The opening <svg ...> tag (including its attributes such as viewBox, fill,
stroke, etc.) is kept intact — only the children are replaced.
"""

from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString


ROOT = Path(__file__).resolve().parent.parent

FILES = [
    ROOT / "plombier-saint-omer.html",
    ROOT / "pmr-saint-omer.html",
    ROOT / "volets-saint-omer.html",
]


# --- icon definitions (inner SVG contents only) ----------------------------

PLOMBIER_ICONS = {
    "fuite": '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6M8 11h6"/>',
    "debouchage": '<path d="M7 3v6a3 3 0 0 0 6 0V3"/><path d="M13 3v18"/><line x1="3" y1="21" x2="21" y2="21"/>',
    "chauffe-eau": '<rect x="7" y="3" width="10" height="18" rx="3"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="11" y1="13" x2="13" y2="13"/>',
    "sanitaire": '<path d="M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><path d="M9 11V5a3 3 0 0 1 6 0v6"/>',
    "salle de bain": '<path d="M5 12h14M7 12V8a5 5 0 0 1 10 0"/><path d="M3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/><line x1="7" y1="20" x2="7" y2="22"/><line x1="17" y1="20" x2="17" y2="22"/>',
    "reseaux": '<path d="M3 12h4M11 12h2M17 12h4"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><path d="M9 8v8M15 8v8"/>',
}

PMR_ICONS = {
    "douche italienne": '<rect x="6" y="3" width="3" height="6"/><path d="M7.5 9v6M5 21l2-6h13l-2 6"/><circle cx="10" cy="18" r=".5"/><circle cx="14" cy="18" r=".5"/>',
    "monte-escalier": '<path d="M3 21l4-4 4 4 4-4 4 4"/><path d="M3 21V10l4-3 4 3 4-3 4 3v11"/><circle cx="14" cy="11" r="1.5"/>',
    "barres d'appui": '<rect x="2" y="9" width="20" height="6" rx="3"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/>',
    "wc pmr": '<path d="M7 11h10v6a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><path d="M9 11V6a3 3 0 0 1 6 0v5"/><circle cx="6" cy="14" r="1.5"/><path d="M4 14h-1M18 14h2"/>',
    "elargissement portes": '<path d="M3 21V5l8-3v22"/><path d="M11 21V5l8-3v22"/><circle cx="13" cy="11" r="1"/>',
    "maprimeadapt": '<path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
}

VOLETS_ICONS = {
    "volet roulant bloque": '<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="11" x2="21" y2="11"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="3" y1="19" x2="21" y2="19"/><path d="M9 7l-2 2M9 11l-2 2"/>',
    "volet battant": '<rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/><path d="M5 7v10M7 7v10M9 7v10M15 7v10M17 7v10M19 7v10"/>',
    "motorisation": '<rect x="3" y="6" width="18" height="14" rx="1"/><line x1="3" y1="11" x2="21" y2="11"/><line x1="3" y1="15" x2="21" y2="15"/><path d="M16 2l2 4-2 0 2 4M8 2l-2 4 2 0-2 4"/>',
    "tablier": '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9l4 6M21 9l-4 6M3 15l4 6M21 15l-4 6"/><line x1="3" y1="3" x2="21" y2="21" stroke-dasharray="2 2"/>',
    "stores": '<path d="M3 5h18l-2 4H5z"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><circle cx="12" cy="14" r="2"/>',
    "pose neuve": '<rect x="5" y="3" width="14" height="18" rx="1"/><line x1="5" y1="7" x2="19" y2="7"/><line x1="5" y1="11" x2="19" y2="11"/><line x1="5" y1="15" x2="19" y2="15"/><path d="M9 19l3-2 3 2"/><circle cx="18" cy="5" r="1.5" fill="currentColor"/>',
}


def _strip_accents(s: str) -> str:
    return "".join(
        ch for ch in unicodedata.normalize("NFKD", s) if not unicodedata.combining(ch)
    )


def _norm(s: str) -> str:
    s = _strip_accents(s).lower()
    s = re.sub(r"[\s]+", " ", s).strip()
    return s


def pick_plombier(h3: str) -> tuple[str, str] | None:
    n = _norm(h3)
    if "fuite" in n:
        return ("fuite", PLOMBIER_ICONS["fuite"])
    if "debouchage" in n or "deboucher" in n:
        return ("debouchage", PLOMBIER_ICONS["debouchage"])
    if "chauffe-eau" in n or "chauffe eau" in n:
        return ("chauffe-eau", PLOMBIER_ICONS["chauffe-eau"])
    if "salle de bain" in n or "salle-de-bain" in n:
        return ("salle de bain", PLOMBIER_ICONS["salle de bain"])
    if "sanitaire" in n:
        return ("sanitaire", PLOMBIER_ICONS["sanitaire"])
    if "reseaux" in n or "reseau" in n:
        return ("reseaux", PLOMBIER_ICONS["reseaux"])
    return None


def pick_pmr(h3: str) -> tuple[str, str] | None:
    n = _norm(h3)
    if "douche" in n and ("italienne" in n or "italien" in n):
        return ("douche italienne", PMR_ICONS["douche italienne"])
    if "monte-escalier" in n or "monte escalier" in n or "monte-escaliers" in n:
        return ("monte-escalier", PMR_ICONS["monte-escalier"])
    if "barre" in n and "appui" in n:
        return ("barres d'appui", PMR_ICONS["barres d'appui"])
    if "wc" in n and ("pmr" in n or "rehauss" in n):
        return ("wc pmr", PMR_ICONS["wc pmr"])
    if "porte" in n and ("elargiss" in n or "pmr" in n):
        return ("elargissement portes", PMR_ICONS["elargissement portes"])
    if "maprimeadapt" in n or "ma prime adapt" in n:
        return ("maprimeadapt", PMR_ICONS["maprimeadapt"])
    return None


def pick_volets(h3: str) -> tuple[str, str] | None:
    n = _norm(h3)
    if "volet roulant" in n and "bloqu" in n:
        return ("volet roulant bloque", VOLETS_ICONS["volet roulant bloque"])
    if "volet battant" in n:
        return ("volet battant", VOLETS_ICONS["volet battant"])
    if "motorisation" in n or "moteur" in n:
        return ("motorisation", VOLETS_ICONS["motorisation"])
    if "tablier" in n:
        return ("tablier", VOLETS_ICONS["tablier"])
    if "store" in n:
        return ("stores", VOLETS_ICONS["stores"])
    if "pose neuve" in n or "sur-mesure" in n or "sur mesure" in n:
        return ("pose neuve", VOLETS_ICONS["pose neuve"])
    return None


PICKERS = {
    "plombier-saint-omer.html": pick_plombier,
    "pmr-saint-omer.html": pick_pmr,
    "volets-saint-omer.html": pick_volets,
}


# --- transformation -------------------------------------------------------

# We work on the raw HTML to keep the file untouched outside the targeted
# region. BeautifulSoup's pretty-printing would otherwise reflow the whole
# document.

SVG_OPEN_RE = re.compile(
    r'(<span\s+class="m-svc-placeholder"[^>]*>\s*<svg[^>]*>)(.*?)(</svg>\s*</span>)',
    flags=re.IGNORECASE | re.DOTALL,
)


def find_grid_block(html: str) -> tuple[int, int] | None:
    """Return (start, end) of the <div class="m-services-grid">…</div> block.

    We find the opening tag then walk the string counting nested <div>/</div>
    until balanced.
    """
    m = re.search(r'<div\s+class="m-services-grid"\s*>', html, flags=re.IGNORECASE)
    if not m:
        return None
    start = m.start()
    i = m.end()
    depth = 1
    tag_re = re.compile(r"<(/?)div\b[^>]*>", flags=re.IGNORECASE)
    while depth > 0:
        tm = tag_re.search(html, i)
        if not tm:
            return None
        if tm.group(1) == "/":
            depth -= 1
        else:
            depth += 1
        i = tm.end()
    return start, i


def process_file(path: Path) -> dict:
    """Replace SVG bodies inside m-services-grid for this file.

    Returns a report dict with changed card titles and any unmatched ones.
    """
    html = path.read_text(encoding="utf-8")
    block = find_grid_block(html)
    if block is None:
        return {"file": path.name, "error": "m-services-grid not found"}

    start, end = block
    grid_html = html[start:end]

    picker = PICKERS[path.name]

    # Parse just the grid block to walk cards in order. We then collect the
    # ordered list of (h3_text, icon_or_none) and apply the replacements to
    # the raw grid_html using SVG_OPEN_RE in order.

    soup = BeautifulSoup(grid_html, "html.parser")
    cards = soup.select("a.m-svc")
    plan = []
    for card in cards:
        h3 = card.find("h3")
        h3_text = h3.get_text(" ", strip=True) if h3 else ""
        match = picker(h3_text) if h3_text else None
        plan.append((h3_text, match))

    # Replace each <svg> body in document order. Each card has exactly one
    # m-svc-placeholder SVG.
    new_grid_parts = []
    last = 0
    idx = 0
    matched, unmatched = [], []
    for m in SVG_OPEN_RE.finditer(grid_html):
        new_grid_parts.append(grid_html[last:m.start()])
        if idx < len(plan):
            h3_text, match = plan[idx]
        else:
            h3_text, match = "", None
        if match is not None:
            key, inner = match
            new_grid_parts.append(m.group(1) + inner + m.group(3))
            matched.append((h3_text, key))
        else:
            # keep original
            new_grid_parts.append(m.group(0))
            if h3_text:
                unmatched.append(h3_text)
        last = m.end()
        idx += 1
    new_grid_parts.append(grid_html[last:])
    new_grid = "".join(new_grid_parts)

    new_html = html[:start] + new_grid + html[end:]
    if new_html != html:
        path.write_text(new_html, encoding="utf-8")

    return {
        "file": path.name,
        "cards_found": len(plan),
        "svgs_replaced": len(matched),
        "matched": matched,
        "unmatched": unmatched,
    }


def main() -> int:
    reports = []
    for f in FILES:
        if not f.exists():
            reports.append({"file": f.name, "error": "missing file"})
            continue
        reports.append(process_file(f))

    for r in reports:
        print("---", r.get("file"))
        if "error" in r:
            print("  ERROR:", r["error"])
            continue
        print(f"  cards_found: {r['cards_found']}")
        print(f"  svgs_replaced: {r['svgs_replaced']}")
        for h3, key in r["matched"]:
            print(f"    OK   {h3!r:50s} -> {key}")
        for h3 in r["unmatched"]:
            print(f"    MISS {h3!r}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
