#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit og:url vs canonical — sonde P14.

Vérifie que `<meta property="og:url" content="...">` est cohérent avec
`<link rel="canonical" href="...">` sur chaque page publique.

Mismatch → confusion partage social, dilution SEO et risque d'erreur Open
Graph crawler (Facebook, LinkedIn, X) qui se sert de og:url comme URL
canonique pour les previews.

Règles :
  - Si og:url ET canonical présents → comparer (normalisation : strip trailing
    slash, lowercase host, ignorer ?query+#fragment)
  - Si og:url manquant alors que canonical présent → warning
  - Si canonical manquant → info (déjà couvert par audit_html5/audit_canonical_url_match)
  - Si og:url pointe vers un autre host que depan59-62.fr → erreur
  - Si og:url contient un fragment ou une query → warning (pollue le partage)

Sortie :
  - admin-pro/audits/audit_og_url_consistency_report.md
  - admin-pro/audits/audit_og_url_consistency_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_og_url_consistency_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_og_url_consistency_report.json"

EXPECTED_HOSTS = {"depan59-62.fr", "www.depan59-62.fr"}

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

OG_URL_RE = re.compile(
    r'<meta\s+[^>]*property\s*=\s*"og:url"[^>]*>',
    re.I,
)
CANONICAL_RE = re.compile(
    r'<link\s+[^>]*rel\s*=\s*"canonical"[^>]*>',
    re.I,
)
CONTENT_RE = re.compile(r'content\s*=\s*"([^"]+)"', re.I)
HREF_RE = re.compile(r'href\s*=\s*"([^"]+)"', re.I)


def find_html_pages():
    pages = []
    for p in ROOT.glob("*.html"):
        if p.name in EXCLUDE:
            continue
        if any(p.name.startswith(pre) for pre in EXCLUDE_PREFIX):
            continue
        pages.append(p)
    for p in (ROOT / "actualites").glob("*.html"):
        pages.append(p)
    return sorted(pages)


def normalize(url: str) -> str:
    """Strip trailing slash + lowercase host + drop query/fragment for compare."""
    if not url:
        return ""
    parsed = urlparse(url.strip())
    host = (parsed.netloc or "").lower()
    path = parsed.path or "/"
    # Strip trailing slash sauf si root
    if path != "/" and path.endswith("/"):
        path = path[:-1]
    # Strip .html pour comparer (cohérence avec audit_canonical_url_match)
    path_no_ext = path[:-5] if path.endswith(".html") else path
    return f"{host}{path_no_ext}"


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "og_url": None,
        "canonical": None,
        "errors": [],
        "warnings": [],
    }
    raw = path.read_text(encoding="utf-8", errors="replace")

    # Extraire og:url
    og_url = None
    og_m = OG_URL_RE.search(raw)
    if og_m:
        c = CONTENT_RE.search(og_m.group(0))
        if c:
            og_url = c.group(1).strip()
            res["og_url"] = og_url

    # Extraire canonical
    canonical = None
    can_m = CANONICAL_RE.search(raw)
    if can_m:
        h = HREF_RE.search(can_m.group(0))
        if h:
            canonical = h.group(1).strip()
            res["canonical"] = canonical

    # Cas : og:url absent
    if not og_url:
        if canonical:
            res["status"] = "warning"
            res["warnings"].append("OG-URL-MISSING : `og:url` absent alors que canonical défini")
        else:
            res["status"] = "info"
            res["warnings"].append("OG-URL-MISSING : `og:url` et canonical absents")
        return res

    # Validation host og:url
    og_parsed = urlparse(og_url)
    if og_parsed.netloc and og_parsed.netloc not in EXPECTED_HOSTS:
        res["status"] = "error"
        res["errors"].append(
            f"OG-URL-WRONG-HOST : host '{og_parsed.netloc}' ≠ depan59-62.fr"
        )

    # Avertissements query/fragment
    if og_parsed.query:
        res["warnings"].append(f"OG-URL-HAS-QUERY : ?{og_parsed.query}")
        if res["status"] == "ok":
            res["status"] = "warning"
    if og_parsed.fragment:
        res["warnings"].append(f"OG-URL-HAS-FRAGMENT : #{og_parsed.fragment}")
        if res["status"] == "ok":
            res["status"] = "warning"

    # Si canonical absent on s'arrête là
    if not canonical:
        res["warnings"].append("CANONICAL-MISSING : pas de canonical pour comparer (cf. audit_html5)")
        if res["status"] == "ok":
            res["status"] = "info"
        return res

    # Comparaison og:url vs canonical
    n_og = normalize(og_url)
    n_can = normalize(canonical)
    if n_og != n_can:
        res["status"] = "error"
        res["errors"].append(
            f"OG-CANONICAL-MISMATCH : og:url='{og_url}' ≠ canonical='{canonical}'"
        )

    return res


def main():
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok = sum(1 for r in results if r["status"] == "ok")
    n_err = sum(1 for r in results if r["status"] == "error")
    n_warn = sum(1 for r in results if r["status"] == "warning")
    n_info = sum(1 for r in results if r["status"] == "info")
    total_errors = sum(len(r["errors"]) for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit og:url vs canonical — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- ✅ OK : **{n_ok}**",
        f"- ❌ Erreurs : **{n_err}** (cumul {total_errors} findings)",
        f"- ⚠️  Avertissements (pages) : **{n_warn}**",
        f"- ℹ️  Info : **{n_info}**",
        f"- ⚠️  Total warnings : **{total_warnings}**",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    for r in results:
        if not r["errors"] and not r["warnings"]:
            continue
        has_finding = True
        md.append(f"### `{r['file']}`")
        if r["og_url"]:
            md.append(f"- og:url    = `{r['og_url']}`")
        if r["canonical"]:
            md.append(f"- canonical = `{r['canonical']}`")
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — toutes les og:url sont cohérentes avec leur canonical._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "n_total": n_total,
                "n_ok": n_ok,
                "n_errors": n_err,
                "n_warnings": n_warn,
                "n_info": n_info,
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_og_url_consistency] {n_ok}/{n_total} OK, {n_err} erreurs, "
        f"{n_warn} warnings → {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if n_err else 0


if __name__ == "__main__":
    raise SystemExit(main())
