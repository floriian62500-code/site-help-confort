#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit meta description length — sonde P15.

Détecte les `<meta name="description">` :
  - absentes (info — couvert aussi par audit_html5)
  - trop courtes : < 70 caractères (Google tronque, signal SEO faible)
  - trop longues : > 160 caractères (Google tronque dans les SERP)
  - hors cible idéale : 120-158 caractères (warning informatif uniquement)

Seuils retenus :
  - ERROR  : len < 70 ou len > 160
  - WARN   : len < 120 ou len > 158 (zone "acceptable mais non idéale")
  - OK     : 120 ≤ len ≤ 158

Whitelist : pages 404/reset, articles dynamiques (realisation.html
détail injecté par JS), pages test-* ou _*.

Sortie :
  - admin-pro/audits/audit_meta_description_length_report.md
  - admin-pro/audits/audit_meta_description_length_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_meta_description_length_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_meta_description_length_report.json"

# Pages à exclure
EXCLUDE = {
    "404.html",
    "reset.html",
    "realisation.html",  # détail dynamique : description injectée par JS
}
EXCLUDE_PREFIX = ("test-", "_")

# Bornes (caractères)
MIN_ERROR = 70
MAX_ERROR = 160
MIN_WARN  = 120
MAX_WARN  = 158

META_DESC_RE = re.compile(
    r'<meta\s+[^>]*name\s*=\s*"description"[^>]*content\s*=\s*"([^"]*)"',
    re.I,
)
META_DESC_ALT_RE = re.compile(
    r'<meta\s+[^>]*content\s*=\s*"([^"]*)"[^>]*name\s*=\s*"description"',
    re.I,
)


def find_html_pages():
    """Pages HTML racine + actualites/."""
    pages = []
    for p in ROOT.glob("*.html"):
        if p.name in EXCLUDE:
            continue
        if any(p.name.startswith(pre) for pre in EXCLUDE_PREFIX):
            continue
        pages.append(p)
    if (ROOT / "actualites").exists():
        for p in (ROOT / "actualites").glob("*.html"):
            pages.append(p)
    return sorted(pages)


def extract_desc(path: pathlib.Path) -> str | None:
    raw = path.read_text(encoding="utf-8", errors="replace")
    m = META_DESC_RE.search(raw)
    if not m:
        m = META_DESC_ALT_RE.search(raw)
    return m.group(1).strip() if m else None


def classify(length: int) -> tuple[str, str]:
    """Retourne (status, label) selon la longueur."""
    if length < MIN_ERROR:
        return "error", f"DESC-TOO-SHORT : {length} chars < {MIN_ERROR}"
    if length > MAX_ERROR:
        return "error", f"DESC-TOO-LONG : {length} chars > {MAX_ERROR}"
    if length < MIN_WARN:
        return "warn", f"DESC-SHORT : {length} chars < {MIN_WARN} (idéal 120-158)"
    if length > MAX_WARN:
        return "warn", f"DESC-LONG : {length} chars > {MAX_WARN} (idéal 120-158)"
    return "ok", f"OK : {length} chars"


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "length": 0,
        "description": None,
        "errors": [],
        "warnings": [],
    }
    desc = extract_desc(path)
    if desc is None:
        res["status"] = "info"
        res["warnings"].append("DESC-MISSING : pas de meta description")
        return res
    res["description"] = desc[:200] + ("…" if len(desc) > 200 else "")
    res["length"] = len(desc)
    status, label = classify(len(desc))
    res["status"] = status
    if status == "error":
        res["errors"].append(label)
    elif status == "warn":
        res["warnings"].append(label)
    return res


def main():
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok    = sum(1 for r in results if r["status"] == "ok")
    n_warn  = sum(1 for r in results if r["status"] == "warn")
    n_err   = sum(1 for r in results if r["status"] == "error")
    n_info  = sum(1 for r in results if r["status"] == "info")
    total_errors   = sum(len(r["errors"]) for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    # ─── Rapport Markdown
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit meta description length — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- ✅ OK (120-158 chars) : **{n_ok}**",
        f"- ⚠️  Warnings (acceptable mais hors cible) : **{n_warn}**",
        f"- ❌ Erreurs (< 70 ou > 160) : **{n_err}**",
        f"- ℹ️  Sans description : **{n_info}**",
        f"- Findings totaux : **{total_errors + total_warnings}**",
        f"  - Erreurs : {total_errors}",
        f"  - Avertissements : {total_warnings}",
        "",
        "## Bornes appliquées",
        "",
        f"- ERROR : len < {MIN_ERROR} ou len > {MAX_ERROR}",
        f"- WARN  : len < {MIN_WARN} ou len > {MAX_WARN}",
        f"- OK    : {MIN_WARN} ≤ len ≤ {MAX_WARN}",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    for r in sorted(results, key=lambda x: (x["status"] != "error", x["status"] != "warn", x["file"])):
        if not r["errors"] and not r["warnings"]:
            continue
        has_finding = True
        md.append(f"### `{r['file']}`  ({r['length']} chars)")
        if r["description"]:
            md.append(f"> {r['description']}")
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — toutes les meta descriptions sont calibrées._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "thresholds": {
                    "min_error": MIN_ERROR,
                    "max_error": MAX_ERROR,
                    "min_warn":  MIN_WARN,
                    "max_warn":  MAX_WARN,
                },
                "n_total":    n_total,
                "n_ok":       n_ok,
                "n_warn":     n_warn,
                "n_errors":   n_err,
                "n_info":     n_info,
                "results":    results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_meta_description_length] {n_ok}/{n_total} OK, "
        f"{n_warn} warn, {n_err} error, {n_info} sans desc "
        f"→ {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if n_err else 0


if __name__ == "__main__":
    raise SystemExit(main())
