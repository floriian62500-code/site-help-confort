#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit canonical URL match — sonde P14.

Vérifie que `<link rel="canonical" href="...">` pointe vers une URL dont le
chemin correspond bien au nom du fichier HTML local. Détecte :
  - canonical absent (info, déjà couvert par audit_html5)
  - canonical pointe sur un slug différent (ALERTE — cause classique de
    duplicate content + dilution SEO)
  - canonical pointe sur un host autre que depan59-62.fr (ALERTE)
  - canonical avec query string ou fragment (warning — pollue index)

Tolère :
  - homepage (index.html → /, /index.html, /index)
  - chemins avec ou sans .html (matching strip extension)
  - sous-chemin /actualites/<slug>.html

Sortie :
  - admin-pro/audits/audit_canonical_url_match_report.md
  - admin-pro/audits/audit_canonical_url_match_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_canonical_url_match_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_canonical_url_match_report.json"

EXPECTED_HOSTS = {"depan59-62.fr", "www.depan59-62.fr"}

# Pages à exclure (test, reset, admin, 404)
EXCLUDE = {
    "404.html", "reset.html",
}
EXCLUDE_PREFIX = ("test-", "_")

CANONICAL_RE = re.compile(
    r'<link\s+[^>]*rel\s*=\s*"canonical"[^>]*>',
    re.I
)
HREF_RE = re.compile(r'href\s*=\s*"([^"]+)"', re.I)


def find_html_pages():
    """Toutes les pages HTML racine + actualites/."""
    pages = []
    for p in ROOT.glob("*.html"):
        if p.name in EXCLUDE:
            continue
        if any(p.name.startswith(pre) for pre in EXCLUDE_PREFIX):
            continue
        pages.append(p)
    # Articles (sous-dossier)
    for p in (ROOT / "actualites").glob("*.html"):
        pages.append(p)
    return sorted(pages)


def expected_paths(file_path: pathlib.Path) -> list[str]:
    """Liste des chemins URL acceptés pour cette page."""
    rel = file_path.relative_to(ROOT)
    name = rel.name
    parent = "/" if rel.parent == pathlib.Path(".") else f"/{rel.parent.as_posix()}/"

    # Cas spécial : index.html → /
    if name == "index.html" and parent == "/":
        return ["/", "/index", "/index.html"]

    # Cas standard : /<chemin>/foo.html → accepte aussi /<chemin>/foo et trailing slash
    base = name[:-5] if name.endswith(".html") else name
    return [
        f"{parent}{name}",          # /foo.html
        f"{parent}{base}",          # /foo
        f"{parent}{base}/",         # /foo/
    ]


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "canonical_href": None,
        "errors": [],
        "warnings": [],
    }
    raw = path.read_text(encoding="utf-8", errors="replace")
    m = CANONICAL_RE.search(raw)
    if not m:
        res["status"] = "info"
        res["warnings"].append("Pas de canonical (vérifier audit_html5)")
        return res

    href_m = HREF_RE.search(m.group(0))
    if not href_m:
        res["status"] = "error"
        res["errors"].append("CANONICAL-NO-HREF : balise canonical sans href")
        return res

    href = href_m.group(1).strip()
    res["canonical_href"] = href
    parsed = urlparse(href)

    # 1. Host attendu
    if parsed.netloc and parsed.netloc not in EXPECTED_HOSTS:
        res["status"] = "error"
        res["errors"].append(
            f"CANONICAL-WRONG-HOST : host '{parsed.netloc}' ≠ depan59-62.fr"
        )

    # 2. Query/fragment
    if parsed.query:
        res["warnings"].append(f"CANONICAL-HAS-QUERY : ?{parsed.query}")
    if parsed.fragment:
        res["warnings"].append(f"CANONICAL-HAS-FRAGMENT : #{parsed.fragment}")

    # 3. Path match
    expected = expected_paths(path)
    actual_path = parsed.path or "/"
    if actual_path not in expected:
        res["status"] = "error"
        res["errors"].append(
            f"CANONICAL-PATH-MISMATCH : '{actual_path}' "
            f"≠ attendu {expected}"
        )

    return res


def main():
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok = sum(1 for r in results if r["status"] == "ok")
    n_err = sum(1 for r in results if r["status"] == "error")
    n_info = sum(1 for r in results if r["status"] == "info")
    total_errors = sum(len(r["errors"]) for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    # ─── Rapport Markdown
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit canonical URL match — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- ✅ OK : **{n_ok}**",
        f"- ❌ Erreurs : **{n_err}** (cumul {total_errors} findings)",
        f"- ℹ️  Sans canonical : **{n_info}**",
        f"- ⚠️  Avertissements : **{total_warnings}**",
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
        if r["canonical_href"]:
            md.append(f"- canonical = `{r['canonical_href']}`")
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — toutes les canonicals sont cohérentes._")
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
                "n_info": n_info,
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(f"[audit_canonical_url_match] {n_ok}/{n_total} OK, {n_err} erreurs, {n_info} sans canonical → {OUT_MD.relative_to(ROOT)}")
    return 1 if n_err else 0


if __name__ == "__main__":
    raise SystemExit(main())
