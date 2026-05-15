#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit Sitemap completeness — Sonde MEMOIRE_IA_MAINTENANCE.md #48.

Croise toutes les `*.html` publiques racine (hors `404.html`, `test-*`,
`reset.html` admin) avec les `<loc>` du `sitemap.xml`.

Findings :
  - MISSING_IN_SITEMAP : page HTML existe sur disque mais absente du sitemap.
  - ORPHAN_IN_SITEMAP  : URL sitemap pointant vers un fichier .html
                        inexistant sur le disque.
  - LASTMOD_FUTURE     : info — `<lastmod>` dans le futur (souvent une faute de
                        frappe ou un push anticipé).

Sortie :
  - admin-pro/audits/audit_sitemap_completeness_report.md
  - admin-pro/audits/audit_sitemap_completeness_report.json

Zéro dépendance externe (urllib XML parser uniquement).
Lance-le depuis la racine ou depuis `admin-pro/audits/`.
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from datetime import date, datetime
from xml.etree import ElementTree as ET

ROOT       = pathlib.Path(__file__).resolve().parents[2]
SITEMAP    = ROOT / "sitemap.xml"
OUT_MD     = ROOT / "admin-pro" / "audits" / "audit_sitemap_completeness_report.md"
OUT_JSON   = ROOT / "admin-pro" / "audits" / "audit_sitemap_completeness_report.json"

# Pages exclues de l'audit (légitimement absentes du sitemap)
EXCLUDED = {
    "404.html",
    "reset.html",       # admin
    "test.html",        # éventuelles pages de test
}
EXCLUDED_PREFIXES = ("test-", "_")
SITE_ORIGIN = "https://www.depan59-62.fr"


def list_local_html_pages() -> list[str]:
    """Liste les *.html à la racine, hors exclus."""
    out = []
    for p in sorted(ROOT.glob("*.html")):
        name = p.name
        if name in EXCLUDED:
            continue
        if any(name.startswith(pref) for pref in EXCLUDED_PREFIXES):
            continue
        out.append(name)
    return out


def parse_sitemap() -> list[dict]:
    """Retourne [{loc, lastmod, slug, file_path}, ...]."""
    if not SITEMAP.is_file():
        return []
    try:
        tree = ET.parse(SITEMAP)
    except ET.ParseError as e:
        sys.stderr.write(f"[ERR] sitemap.xml mal formé : {e}\n")
        return []
    root = tree.getroot()
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for url in root.findall("sm:url", ns):
        loc_el = url.find("sm:loc", ns)
        if loc_el is None or not loc_el.text:
            continue
        loc = loc_el.text.strip()
        lastmod_el = url.find("sm:lastmod", ns)
        lastmod = (lastmod_el.text.strip() if lastmod_el is not None and lastmod_el.text else "")
        # Reconstituer le slug = nom de fichier .html attendu en local.
        # Cas 1 : "https://www.depan59-62.fr/" → home  → "index.html"
        # Cas 2 : "https://www.depan59-62.fr/page.html" → "page.html"
        # Cas 3 : "https://www.depan59-62.fr/articles/slug" → article (hors scope racine)
        path = loc.replace(SITE_ORIGIN, "").lstrip("/")
        slug, file_path = "", ""
        if path == "" or path == "/":
            slug = "index.html"
        elif path.endswith(".html"):
            slug = path
        # On ne traite ici que les pages racine (sans dossier)
        is_root_page = slug and "/" not in slug
        urls.append({
            "loc": loc,
            "lastmod": lastmod,
            "slug": slug,
            "is_root_page": is_root_page,
        })
    return urls


def audit() -> dict:
    local_pages = set(list_local_html_pages())
    sitemap_entries = parse_sitemap()

    # URLs sitemap correspondant à des pages racines
    sitemap_root_slugs = {e["slug"] for e in sitemap_entries if e["is_root_page"]}

    # MISSING_IN_SITEMAP
    missing = sorted(local_pages - sitemap_root_slugs)

    # ORPHAN_IN_SITEMAP : sitemap référence X.html, X.html absent du disque
    # On ne flag que les pages racine (chemin sans `/`).
    orphans = sorted(
        slug for slug in sitemap_root_slugs
        if slug and not (ROOT / slug).is_file()
    )

    # LASTMOD_FUTURE
    today = date.today()
    future = []
    for e in sitemap_entries:
        if not e["lastmod"]:
            continue
        try:
            d = datetime.strptime(e["lastmod"][:10], "%Y-%m-%d").date()
        except ValueError:
            continue
        if d > today:
            future.append({"loc": e["loc"], "lastmod": e["lastmod"]})

    return {
        "audit": "sitemap_completeness",
        "date": datetime.now().isoformat(timespec="seconds"),
        "stats": {
            "local_root_html_pages": len(local_pages),
            "sitemap_total_urls": len(sitemap_entries),
            "sitemap_root_pages": len(sitemap_root_slugs),
            "missing_in_sitemap": len(missing),
            "orphan_in_sitemap": len(orphans),
            "lastmod_future": len(future),
        },
        "findings": {
            "MISSING_IN_SITEMAP": missing,
            "ORPHAN_IN_SITEMAP": orphans,
            "LASTMOD_FUTURE": future,
        },
        "excluded_pages": sorted(EXCLUDED),
    }


def render_markdown(report: dict) -> str:
    s = report["stats"]
    f = report["findings"]
    lines = []
    lines.append("# Audit Sitemap completeness — Rapport")
    lines.append("")
    lines.append(f"Généré le : `{report['date']}`")
    lines.append("")
    lines.append("Source de vérité : `sitemap.xml` (`<urlset>`) + `*.html` à la racine du repo.")
    lines.append("")

    lines.append("## Synthèse")
    lines.append("")
    lines.append(f"- Pages HTML racine sur disque : **{s['local_root_html_pages']}**")
    lines.append(f"- URLs dans sitemap.xml : **{s['sitemap_total_urls']}**")
    lines.append(f"- Dont pages racine (`/X.html` ou `/`) : **{s['sitemap_root_pages']}**")
    lines.append(f"- ⚠️ Pages absentes du sitemap : **{s['missing_in_sitemap']}**")
    lines.append(f"- ❌ URLs sitemap orphelines (fichier introuvable) : **{s['orphan_in_sitemap']}**")
    lines.append(f"- ℹ️ `<lastmod>` dans le futur : **{s['lastmod_future']}**")
    lines.append("")

    if f["MISSING_IN_SITEMAP"]:
        lines.append("## ⚠️ MISSING_IN_SITEMAP")
        lines.append("")
        lines.append("Ces pages HTML existent sur disque mais sont absentes du sitemap.")
        lines.append("Correction : ajouter une `<url>` dans `sitemap.xml`.")
        lines.append("")
        for page in f["MISSING_IN_SITEMAP"]:
            lines.append(f"- `{page}`")
        lines.append("")

    if f["ORPHAN_IN_SITEMAP"]:
        lines.append("## ❌ ORPHAN_IN_SITEMAP")
        lines.append("")
        lines.append("Le sitemap pointe vers ces URLs mais le fichier .html n'existe pas.")
        lines.append("Correction : retirer la `<url>` du sitemap OU créer la page.")
        lines.append("")
        for page in f["ORPHAN_IN_SITEMAP"]:
            lines.append(f"- `{page}` → `{SITE_ORIGIN}/{page}`")
        lines.append("")

    if f["LASTMOD_FUTURE"]:
        lines.append("## ℹ️ LASTMOD_FUTURE")
        lines.append("")
        lines.append("Ces `<lastmod>` sont dans le futur (faute de frappe ou push anticipé).")
        lines.append("")
        for item in f["LASTMOD_FUTURE"]:
            lines.append(f"- `{item['loc']}` → `{item['lastmod']}`")
        lines.append("")

    if not any(f.values()):
        lines.append("## ✅ Aucun écart")
        lines.append("")
        lines.append("Toutes les pages racine sont référencées dans le sitemap et chaque URL pointe vers un fichier existant.")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("Pages exclues de l'audit (légitimement absentes du sitemap) : "
                 + ", ".join(f"`{p}`" for p in report["excluded_pages"]) + ".")
    return "\n".join(lines)


def main() -> int:
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    report = audit()
    OUT_MD.write_text(render_markdown(report), encoding="utf-8")
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    s = report["stats"]
    alerts = s["missing_in_sitemap"] + s["orphan_in_sitemap"]
    print(f"[audit_sitemap_completeness] {s['local_root_html_pages']} pages locales, "
          f"{s['sitemap_root_pages']} pages dans sitemap, "
          f"{alerts} alerte(s).")
    print(f"→ {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
