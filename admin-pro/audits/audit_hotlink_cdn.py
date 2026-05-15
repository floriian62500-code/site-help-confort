#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit images hot-linkées CDN tiers — Sonde #13 (MEMOIRE_IA_MAINTENANCE.md).

Liste tous les `<img src="https://..." />` (et `<source>`, `<link
rel="preload" as="image">`) non-same-origin et non-`data:`.

Pourquoi :
  - Risque de cassure si le tiers retire l'asset (logo marque, photo
    fournisseur, etc.).
  - CSP `img-src` doit déclarer chaque host externe — sinon image bloquée.
  - SEO / perf : pas de contrôle sur le `Cache-Control` du tiers.
  - Tracking : appel HTTP → fuite de Referer.

Détection :
  - Crawl HTML root + `assets/**/*.js` (pour détecter les `src` dynamiques
    construits côté front).
  - Pour chaque URL absolue extraite : extraire le host.
  - Whitelist explicite : `depan59-62.fr`, `help-confort.com`, Supabase
    storage du projet, `data:` (skip).
  - Tout host hors whitelist → ALERTE *HOTLINK-CDN*, avec recommandation
    de téléchargement local des assets critiques.

Sorties :
  - admin-pro/audits/audit_hotlink_cdn_report.md
  - admin-pro/audits/audit_hotlink_cdn_report.json
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
from collections import defaultdict
from datetime import datetime
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = pathlib.Path(__file__).with_name("audit_hotlink_cdn_report.md")
OUT_JSON = pathlib.Path(__file__).with_name("audit_hotlink_cdn_report.json")

# Hosts considérés comme same-origin (HC owned)
SELF_HOSTS = {
    "depan59-62.fr", "www.depan59-62.fr",
    "help-confort.com", "www.help-confort.com",
    "remarkable-dragon-364e2b.netlify.app",
}

# Supabase storage du projet (assets stockés en self-hosted-equivalent)
SUPABASE_PROJECT_PREFIX = "btcbjwqiivhpwoszomhg.supabase.co"

# CDN "officiels" — pas same-origin mais tolérés (déjà whitelistés CSP)
# On les liste séparément pour reporter en INFO plutôt qu'en ALERT.
TRUSTED_CDNS = {
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "cdn.jsdelivr.net",
    "unpkg.com",
    # Tracking légitime (gated par consent banner)
    "www.googletagmanager.com",
    "www.google-analytics.com",
    "connect.facebook.net",
    # Cartographie
    "tile.openstreetmap.org",
    "a.tile.openstreetmap.org",
    "b.tile.openstreetmap.org",
    "c.tile.openstreetmap.org",
    "unpkg.com",
    # API publique
    "api-adresse.data.gouv.fr",
}

# Pages exclues
EXCLUDED = {"404.html", "reset.html"}

# Regex pour extraire les URLs absolues dans HTML/JS
URL_RE = re.compile(r'''(?:src|href|content|url\()\s*=?\s*["']?(https?://[^\s"'<>)]+)''', re.I)
# Plus permissif pour JS : chaine littérale https://...
URL_RE_GENERIC = re.compile(r'''["'](https?://[^\s"'<>]+)["']''')


def is_html_target(p: pathlib.Path) -> bool:
    if p.suffix.lower() != ".html":
        return False
    if p.name in EXCLUDED:
        return False
    if p.name.startswith("test-"):
        return False
    return True


def classify_host(host: str) -> str:
    """Retourne 'self', 'supabase', 'trusted', ou 'external'."""
    h = host.lower()
    if h in SELF_HOSTS:
        return "self"
    if SUPABASE_PROJECT_PREFIX in h:
        return "supabase"
    if h in TRUSTED_CDNS:
        return "trusted"
    return "external"


def scan_file(p: pathlib.Path, generic: bool = False) -> list[dict]:
    """Retourne la liste des URLs absolues trouvées dans le fichier."""
    try:
        text = p.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return []
    out = []
    seen = set()
    # Pass 1 : src/href/url(...) — contexte clair
    for m in URL_RE.finditer(text):
        url = m.group(1).rstrip(",;)\"'")
        if url in seen:
            continue
        seen.add(url)
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            continue
        out.append({
            "url": url,
            "host": parsed.netloc.lower(),
            "context": "attr",
        })
    if generic:
        for m in URL_RE_GENERIC.finditer(text):
            url = m.group(1).rstrip(",;)\"'")
            if url in seen:
                continue
            seen.add(url)
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https"):
                continue
            out.append({
                "url": url,
                "host": parsed.netloc.lower(),
                "context": "string",
            })
    return out


def is_image_url(url: str) -> bool:
    u = url.lower()
    # 1) Extension explicite
    path = u.split("?")[0].split("#")[0]
    if path.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif", ".ico")):
        return True
    # 2) Patterns CDN image (Unsplash, Cloudinary, Imgix)
    host = urlparse(u).netloc
    if host.endswith("unsplash.com") or host.endswith("cloudinary.com") or "imgix.net" in host:
        return True
    # 3) Hint par query param (fm=jpg/png/webp)
    if re.search(r"[?&]fm=(jpg|png|webp|avif)\b", u):
        return True
    return False


def main() -> int:
    html_pages = sorted(p for p in ROOT.glob("*.html") if is_html_target(p))
    js_files = sorted((ROOT / "assets").rglob("*.js")) if (ROOT / "assets").exists() else []

    # host → list of occurrences {file, url, context, is_image}
    by_host: dict[str, list[dict]] = defaultdict(list)
    by_class: dict[str, set[str]] = {"self": set(), "supabase": set(), "trusted": set(), "external": set()}

    for p in html_pages:
        for item in scan_file(p):
            host = item["host"]
            cls = classify_host(host)
            by_host[host].append({
                "file": p.name,
                "url": item["url"],
                "context": item["context"],
                "is_image": is_image_url(item["url"]),
                "class": cls,
            })
            by_class[cls].add(host)
    for p in js_files:
        for item in scan_file(p, generic=True):
            host = item["host"]
            cls = classify_host(host)
            by_host[host].append({
                "file": f"assets/{p.name}",
                "url": item["url"],
                "context": item["context"],
                "is_image": is_image_url(item["url"]),
                "class": cls,
            })
            by_class[cls].add(host)

    # Hosts externes (= ni self, ni trusted, ni supabase)
    external_hosts = sorted(by_class["external"])
    findings = []
    for h in external_hosts:
        occs = by_host[h]
        img_count = sum(1 for o in occs if o["is_image"])
        findings.append({
            "host": h,
            "occurrences": len(occs),
            "image_occurrences": img_count,
            "files": sorted({o["file"] for o in occs}),
            "examples": [
                {"file": o["file"], "url": o["url"][:120]}
                for o in occs[:5]
            ],
        })

    # Rapport markdown
    lines = []
    lines.append("# 🖼️ Audit images hot-linkées CDN tiers — sonde #13")
    lines.append("")
    lines.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    lines.append("")
    lines.append(f"- Pages HTML scannées : **{len(html_pages)}**")
    lines.append(f"- Fichiers JS scannés : **{len(js_files)}**")
    lines.append(f"- Hosts uniques détectés : **{len(by_host)}**")
    lines.append(f"  - Self (HC) : {len(by_class['self'])}")
    lines.append(f"  - Supabase projet : {len(by_class['supabase'])}")
    lines.append(f"  - CDN tolérés (CSP-whitelistés) : {len(by_class['trusted'])}")
    lines.append(f"  - **Externes non whitelistés** : **{len(by_class['external'])}**")
    lines.append("")

    if findings:
        lines.append("## ⚠️ Hosts externes non whitelistés")
        lines.append("")
        for f in findings:
            marker = "🖼️" if f["image_occurrences"] else "📄"
            lines.append(
                f"### {marker} `{f['host']}` — {f['occurrences']} occurrence(s) "
                f"({f['image_occurrences']} image(s))"
            )
            lines.append("")
            lines.append(f"Fichiers concernés : {', '.join(f'`{x}`' for x in f['files'][:10])}")
            lines.append("")
            for ex in f["examples"]:
                lines.append(f"- `{ex['file']}` → `{ex['url']}`")
            lines.append("")
            if f["image_occurrences"]:
                lines.append(
                    "→ **Recommandation** : télécharger les assets critiques dans "
                    "`/images/` pour garantir le contrôle, le cache et la conformité CSP."
                )
            else:
                lines.append(
                    "→ Vérifier si le host est légitimement whitelisté côté CSP "
                    "(`netlify.toml` → `connect-src` / `script-src`)."
                )
            lines.append("")
    else:
        lines.append("## ✅ Aucun host externe non whitelisté détecté")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 📋 Détail tous hosts")
    lines.append("")
    lines.append("| Host | Classification | Occurrences | Images |")
    lines.append("|------|----------------|-------------|--------|")
    for host in sorted(by_host.keys()):
        occs = by_host[host]
        cls = occs[0]["class"]
        img_count = sum(1 for o in occs if o["is_image"])
        marker = {
            "self": "🟢 self",
            "supabase": "🔵 supabase",
            "trusted": "⚪ trusted",
            "external": "🔴 external",
        }[cls]
        lines.append(f"| `{host}` | {marker} | {len(occs)} | {img_count} |")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scanned_html": len(html_pages),
        "scanned_js": len(js_files),
        "total_hosts": len(by_host),
        "by_class": {k: sorted(v) for k, v in by_class.items()},
        "external_findings": findings,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(
        f"HTML={len(html_pages)} JS={len(js_files)} Hosts={len(by_host)} "
        f"External={len(by_class['external'])}"
    )
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
