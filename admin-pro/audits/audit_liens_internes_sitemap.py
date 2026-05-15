#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #61 — Liens internes vs sitemap.xml.

Pour chaque page publique racine, on extrait tous les ``href="..."`` qui
pointent vers un ``.html`` local (variante du broken-links interne, mais en
croisant avec ``sitemap.xml`` comme source de vérité).

On lève deux types d'alertes :

- **BROKEN** : le ``.html`` cible n'existe pas sur le disque.
- **ORPHAN** : le ``.html`` cible existe, mais il n'est pas listé dans
  ``sitemap.xml`` (Google ne le découvrira pas).

Pages techniques exclues du contrôle ORPHAN (whitelist) :

- ``404.html``       — page d'erreur Netlify (jamais indexée)
- ``reset.html``     — admin / réinitialisation mot de passe (noindex)
- ``realisation.html`` — détail dynamique (les URLs canoniques sont les
  sous-pages ``actualites/YYYY-MM-DD-*.html`` listées par le sitemap)

Sortie :
  admin-pro/audits/audit_liens_internes_sitemap_report.md
  admin-pro/audits/audit_liens_internes_sitemap_report.json

Usage :
  python3 admin-pro/audits/audit_liens_internes_sitemap.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITEMAP = ROOT / "sitemap.xml"
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_liens_internes_sitemap_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_liens_internes_sitemap_report.json"

PAGES_GLOB = "*.html"

# Pages techniques exclues du contrôle ORPHAN (et du scan source)
EXCLUDE_FROM_SCAN = {"reset.html"}  # ne sert pas comme source non plus
ORPHAN_WHITELIST = {"404.html", "reset.html", "realisation.html"}
# Préfixes (sous-dossiers) techniques jamais indexés
ORPHAN_WHITELIST_PREFIXES = ("admin/", "admin-pro/")

HREF_RE = re.compile(r'\bhref\s*=\s*["\']([^"\']+)["\']', re.I)
LOC_RE = re.compile(r"<loc>\s*([^<\s]+)\s*</loc>", re.I)


def is_external(url: str) -> bool:
    u = url.strip().lower()
    return (
        u.startswith("http://")
        or u.startswith("https://")
        or u.startswith("//")
        or u.startswith("mailto:")
        or u.startswith("tel:")
        or u.startswith("javascript:")
        or u.startswith("data:")
    )


def normalise_local(url: str) -> str | None:
    """Garde uniquement les URLs qui pointent vers un .html local.

    Renvoie le slug normalisé (ex: ``faq.html``, ``actualites/xxx.html``) ou
    ``None`` si l'URL n'est pas une page locale .html.
    """
    if not url:
        return None
    if is_external(url):
        return None
    u = url.strip()
    # query / fragment
    u = u.split("?", 1)[0].split("#", 1)[0]
    if not u or u in {"/", "./"}:
        return "index.html"
    u = u.lstrip("/").removeprefix("./")
    # On ne garde que les .html
    if not u.lower().endswith(".html"):
        return None
    return u


def load_sitemap_slugs() -> set[str]:
    """Parse sitemap.xml et renvoie l'ensemble des slugs locaux."""
    if not SITEMAP.exists():
        return set()
    raw = SITEMAP.read_text(encoding="utf-8", errors="ignore")
    slugs: set[str] = set()
    for m in LOC_RE.finditer(raw):
        loc = m.group(1).strip()
        # https://www.depan59-62.fr/xxx.html → xxx.html
        slug = re.sub(r"^https?://[^/]+/?", "", loc)
        slug = slug.lstrip("/")
        if not slug:
            slug = "index.html"
        slugs.add(slug)
    return slugs


def scan_page(path: pathlib.Path) -> list[str]:
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return []
    out: list[str] = []
    seen: set[str] = set()
    for m in HREF_RE.finditer(html):
        slug = normalise_local(m.group(1))
        if not slug:
            continue
        if slug in seen:
            continue
        seen.add(slug)
        out.append(slug)
    return out


def main() -> int:
    sitemap_slugs = load_sitemap_slugs()
    # Toutes les pages HTML du repo (racine + actualites/)
    all_html = {p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*.html") if p.is_file()}

    pages = sorted(
        p for p in ROOT.glob(PAGES_GLOB)
        if p.is_file() and p.name not in EXCLUDE_FROM_SCAN
    )

    broken: list[dict] = []
    orphans: list[dict] = []
    by_page: dict[str, list[str]] = {}
    total_links = 0

    for p in pages:
        slugs = scan_page(p)
        by_page[p.name] = slugs
        total_links += len(slugs)
        for slug in slugs:
            on_disk = (slug in all_html) or (ROOT / slug).is_file()
            if not on_disk:
                broken.append({"source": p.name, "href": slug})
                continue
            # ORPHAN : existe mais pas dans sitemap → uniquement pour les
            # cibles à la racine (les actualites/xxx.html SONT listées
            # individuellement, on n'a donc rien à filtrer ici).
            if slug in ORPHAN_WHITELIST:
                continue
            if any(slug.startswith(pref) for pref in ORPHAN_WHITELIST_PREFIXES):
                continue
            if slug not in sitemap_slugs:
                orphans.append({"source": p.name, "href": slug})

    # Agrégation orphans : par slug cible (combien de pages le pointent)
    orphan_targets = Counter(o["href"] for o in orphans)
    broken_targets = Counter(b["href"] for b in broken)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines: list[str] = []
    lines.append(f"# Audit liens internes vs sitemap.xml — {now}")
    lines.append("")
    lines.append("Sonde #61 : croise les `href` locaux `.html` avec `sitemap.xml` et le disque.")
    lines.append("")
    lines.append(f"- **Pages scannées** : {len(pages)}")
    lines.append(f"- **Liens internes uniques (par page)** : {total_links}")
    lines.append(f"- **URLs dans sitemap.xml** : {len(sitemap_slugs)}")
    lines.append(f"- **🚨 Liens cassés (BROKEN)** : {len(broken)} ({len(broken_targets)} cibles uniques)")
    lines.append(f"- **🟠 Liens orphelins (ORPHAN — absents du sitemap)** : {len(orphans)} ({len(orphan_targets)} cibles uniques)")
    lines.append("")
    if broken:
        lines.append("## 🚨 Cibles introuvables sur le disque")
        lines.append("")
        lines.append("| Cible | Pointée par |")
        lines.append("|-------|-------------|")
        for slug, count in broken_targets.most_common():
            sources = sorted({b["source"] for b in broken if b["href"] == slug})
            preview = ", ".join(f"`{s}`" for s in sources[:5])
            if len(sources) > 5:
                preview += f" … (+{len(sources)-5})"
            lines.append(f"| `{slug}` | {count}× — {preview} |")
        lines.append("")
    else:
        lines.append("## ✅ Aucun lien interne cassé")
        lines.append("")

    if orphans:
        lines.append("## 🟠 Pages existantes mais absentes du sitemap.xml")
        lines.append("")
        lines.append("Ces fichiers existent et sont liés depuis le site, mais Google ne les")
        lines.append("découvrira pas via le sitemap. À ajouter à `sitemap.xml` ou à exclure")
        lines.append("explicitement (whitelist du script si page technique/noindex).")
        lines.append("")
        lines.append("| Cible | Pointée par |")
        lines.append("|-------|-------------|")
        for slug, count in orphan_targets.most_common():
            sources = sorted({o["source"] for o in orphans if o["href"] == slug})
            preview = ", ".join(f"`{s}`" for s in sources[:5])
            if len(sources) > 5:
                preview += f" … (+{len(sources)-5})"
            lines.append(f"| `{slug}` | {count}× — {preview} |")
        lines.append("")
    else:
        lines.append("## ✅ Aucun lien orphelin (toutes les pages liées sont dans le sitemap)")
        lines.append("")

    lines.append("## Notes")
    lines.append("")
    lines.append("- URLs externes (http/https/mailto/tel/javascript/data) ignorées.")
    lines.append("- Whitelist ORPHAN (jamais indexées) : `" + "`, `".join(sorted(ORPHAN_WHITELIST)) + "`.")
    lines.append("- Whitelist préfixes ORPHAN : `" + "`, `".join(ORPHAN_WHITELIST_PREFIXES) + "`.")
    lines.append("- Page `realisation.html` est une page de détail dynamique — les URLs")
    lines.append("  canoniques sont les sous-pages `actualites/YYYY-MM-DD-*.html`.")
    lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "generated_at": now,
        "pages_scanned": len(pages),
        "sitemap_urls": len(sitemap_slugs),
        "total_internal_links": total_links,
        "broken_count": len(broken),
        "broken_unique_targets": len(broken_targets),
        "orphan_count": len(orphans),
        "orphan_unique_targets": len(orphan_targets),
        "broken": broken,
        "orphans": orphans,
        "whitelist": sorted(ORPHAN_WHITELIST),
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"[audit_liens_internes_sitemap] {len(pages)} pages, "
        f"{total_links} liens, {len(broken)} BROKEN, {len(orphans)} ORPHAN"
    )
    return 0 if (not broken and not orphans) else 1


if __name__ == "__main__":
    sys.exit(main())
