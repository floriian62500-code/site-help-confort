#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #63 — Duplicate IDs.

Deux alertes :

1. **DUPLICATE-IN-PAGE** : le même ``id="X"`` apparaît plusieurs fois dans la
   même page HTML. C'est invalide (spec HTML5) et casse les ancres / les
   ``label[for]`` / les sélecteurs ``getElementById``.
2. **CROSS-PAGE-SHARED** : le même ``id="X"`` est utilisé dans > ``THRESHOLD``
   pages — ça suggère un copy-paste de template à factoriser. Surtout utile
   pour repérer les blocs « header/footer/cookie-banner » qui devraient passer
   par un partial / un include.

Les ``<script>``, ``<style>`` et commentaires HTML sont retirés avant le scan
pour éviter les faux positifs (template strings JS, CSS qui définit un id…).

Sortie :
  admin-pro/audits/audit_duplicate_ids_report.md
  admin-pro/audits/audit_duplicate_ids_report.json

Usage :
  python3 admin-pro/audits/audit_duplicate_ids.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_duplicate_ids_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_duplicate_ids_report.json"

PAGES_GLOB = "*.html"
EXCLUDE = {"reset.html"}

# Seuil au-delà duquel un id partagé entre pages est signalé comme template
# « à factoriser ». 10 ≈ environ 25 % des 39 pages publiques.
THRESHOLD = 10

# IDs ultra-génériques attendus dans le header/footer/PWA — on les ignore du
# rapport cross-page pour ne pas noyer le signal (ils SONT attendus partout).
EXPECTED_GLOBAL_IDS = {
    # Header / nav
    "site-header", "main-nav", "menu-toggle", "mobile-menu",
    # Footer
    "site-footer", "footer-nav",
    # PWA / consent banner
    "hc-consent-banner", "hc-consent-accept", "hc-consent-refuse",
    # Chatbot
    "hc-chatbot", "hc-chat-toggle", "hc-chat-window",
    # SEO / techniques
    "skip-link", "main-content",
}

ID_RE = re.compile(r'\bid\s*=\s*["\']([^"\']+)["\']', re.I)
SCRIPT_RE = re.compile(r"<script\b[^>]*>.*?</script>", re.I | re.S)
STYLE_RE = re.compile(r"<style\b[^>]*>.*?</style>", re.I | re.S)
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
# attribute name we want to match strictly: id (not data-id, aria-labelledby etc.)
# the \b\s*= matcher above handles this naturally because the regex anchors on \bid


def strip_noise(html: str) -> str:
    html = SCRIPT_RE.sub("", html)
    html = STYLE_RE.sub("", html)
    html = COMMENT_RE.sub("", html)
    return html


def extract_ids(html: str) -> list[str]:
    """Renvoie la liste des ids dans l'ordre du document (avec doublons)."""
    cleaned = strip_noise(html)
    out: list[str] = []
    for m in ID_RE.finditer(cleaned):
        raw = m.group(1).strip()
        if not raw:
            continue
        # Plusieurs valeurs séparées par espace ne sont pas autorisées sur id=,
        # mais on tolère et on ne garde que le premier token.
        token = raw.split()[0]
        out.append(token)
    return out


def main() -> int:
    pages = sorted(
        p for p in ROOT.glob(PAGES_GLOB)
        if p.is_file() and p.name not in EXCLUDE
    )

    # in_page_dups[page] = [(id, count), ...]
    in_page_dups: dict[str, list[tuple[str, int]]] = {}
    # id_to_pages[id] = set(pages)
    id_to_pages: dict[str, set[str]] = defaultdict(set)
    # id_to_total_uses[id] = total occurrences across all pages
    id_to_total_uses: Counter[str] = Counter()
    page_id_counts: dict[str, int] = {}

    for p in pages:
        try:
            html = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        ids = extract_ids(html)
        page_id_counts[p.name] = len(ids)
        counter = Counter(ids)
        dups = sorted(
            [(i, c) for i, c in counter.items() if c > 1],
            key=lambda x: (-x[1], x[0]),
        )
        if dups:
            in_page_dups[p.name] = dups
        for i, c in counter.items():
            id_to_pages[i].add(p.name)
            id_to_total_uses[i] += c

    # Cross-page shared : id présent dans >= THRESHOLD pages, hors whitelist
    cross_page: list[dict] = []
    for ident, pset in id_to_pages.items():
        if len(pset) < THRESHOLD:
            continue
        if ident in EXPECTED_GLOBAL_IDS:
            continue
        cross_page.append({
            "id": ident,
            "page_count": len(pset),
            "total_uses": id_to_total_uses[ident],
            "pages": sorted(pset),
        })
    cross_page.sort(key=lambda x: (-x["page_count"], x["id"]))

    total_ids = sum(page_id_counts.values())
    pages_with_dup = sorted(in_page_dups.keys())

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines: list[str] = []
    lines.append(f"# Audit duplicate IDs — {now}")
    lines.append("")
    lines.append(
        "Sonde #63 : détecte les `id=\"X\"` répétés dans une page (HTML invalide) "
        "et les ids partagés par > "
        f"{THRESHOLD} pages (potentielle factorisation)."
    )
    lines.append("")
    lines.append(f"- **Pages scannées** : {len(pages)}")
    lines.append(f"- **IDs totaux (toutes pages)** : {total_ids}")
    lines.append(f"- **IDs uniques (clés)** : {len(id_to_pages)}")
    lines.append(f"- **🚨 Pages avec ids dupliqués** : {len(pages_with_dup)}")
    lines.append(f"- **🟠 IDs partagés par ≥ {THRESHOLD} pages** : {len(cross_page)}")
    lines.append("")

    # 1) Duplicate IN-PAGE (toujours bug HTML)
    if in_page_dups:
        lines.append("## 🚨 IDs dupliqués dans la même page (HTML invalide)")
        lines.append("")
        lines.append("| Page | ID | Occurrences |")
        lines.append("|------|----|-------------|")
        for page, dups in sorted(in_page_dups.items()):
            for ident, count in dups:
                lines.append(f"| `{page}` | `{ident}` | **{count}** |")
        lines.append("")
    else:
        lines.append("## ✅ Aucun id dupliqué dans une même page")
        lines.append("")

    # 2) Cross-page shared (factorisation possible)
    if cross_page:
        lines.append(f"## 🟠 IDs partagés par ≥ {THRESHOLD} pages")
        lines.append("")
        lines.append("Ces ids dupliqués entre pages suggèrent un bloc HTML copié à la main.")
        lines.append("Si c'est un header/footer/banner attendu, ajouter l'id à")
        lines.append("`EXPECTED_GLOBAL_IDS` dans le script.")
        lines.append("")
        lines.append("| ID | Nb pages | Usages totaux |")
        lines.append("|----|----------|---------------|")
        for entry in cross_page:
            lines.append(
                f"| `{entry['id']}` | {entry['page_count']} | {entry['total_uses']} |"
            )
        lines.append("")
    else:
        lines.append(f"## ✅ Aucun id partagé par ≥ {THRESHOLD} pages (hors whitelist)")
        lines.append("")

    lines.append("## Notes")
    lines.append("")
    lines.append("- Les blocs `<script>`, `<style>` et commentaires HTML sont retirés avant scan.")
    lines.append(
        "- Whitelist (ids attendus partout) : "
        + ", ".join(f"`{i}`" for i in sorted(EXPECTED_GLOBAL_IDS))
        + "."
    )
    lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "generated_at": now,
        "pages_scanned": len(pages),
        "total_ids": total_ids,
        "unique_ids": len(id_to_pages),
        "in_page_duplicates": {
            page: [{"id": i, "count": c} for i, c in dups]
            for page, dups in in_page_dups.items()
        },
        "cross_page_shared": cross_page,
        "threshold": THRESHOLD,
        "whitelist_global_ids": sorted(EXPECTED_GLOBAL_IDS),
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"[audit_duplicate_ids] {len(pages)} pages, {total_ids} ids, "
        f"{len(pages_with_dup)} pages avec dup, {len(cross_page)} cross-page > seuil"
    )
    return 0 if not in_page_dups else 1


if __name__ == "__main__":
    sys.exit(main())
