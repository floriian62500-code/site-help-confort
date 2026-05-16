#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit BreadcrumbList JSON-LD — sonde P14.

Vérifie que les pages de navigation profonde (métier, locales, guides, faq,
blog) déclarent un JSON-LD `BreadcrumbList` Schema.org pour aider Google à
afficher un fil d'Ariane riche dans les SERP.

Pages contrôlées :
  - 5 pages métier      : plombier/electricien/serrurier/chauffagiste/travaux-saint-omer.html
  - 7 pages locales     : depannage-*.html
  - 4 guides            : guide-*.html
  - 2 hubs              : guides.html, blog.html, faq.html
  - Articles            : actualites/*.html

Sur chaque page éligible :
  - ABSENT  → ALERTE
  - PRÉSENT mais 0 `itemListElement` ou < 2 niveaux  → WARNING (Breadcrumb trop court)
  - PRÉSENT et > 1 `BreadcrumbList` distinct        → WARNING (doublon)
  - PRÉSENT et JSON invalide                         → ERREUR

Sortie :
  - admin-pro/audits/audit_breadcrumb_schema_report.md
  - admin-pro/audits/audit_breadcrumb_schema_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_breadcrumb_schema_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_breadcrumb_schema_report.json"

# Patterns de pages éligibles (require breadcrumb)
ELIGIBLE_PATTERNS = [
    re.compile(r"^(plombier|electricien|serrurier|chauffagiste|travaux)-saint-omer\.html$"),
    re.compile(r"^depannage-[a-z-]+\.html$"),
    re.compile(r"^guide-[a-z-]+\.html$"),
]
ELIGIBLE_EXACT = {
    "guides.html",
    "blog.html",
    "faq.html",
}

# Capture les blocs <script type="application/ld+json">…</script>
LDJSON_RE = re.compile(
    r'<script\s+[^>]*type\s*=\s*"application/ld\+json"[^>]*>(.*?)</script>',
    re.I | re.S,
)


def find_eligible_pages():
    pages = []
    for p in ROOT.glob("*.html"):
        name = p.name
        if name in ELIGIBLE_EXACT:
            pages.append(p)
            continue
        if any(rgx.match(name) for rgx in ELIGIBLE_PATTERNS):
            pages.append(p)
    # Articles : tous éligibles
    for p in (ROOT / "actualites").glob("*.html"):
        pages.append(p)
    return sorted(pages)


def find_breadcrumbs_in_jsonld(raw: str) -> tuple[list[dict], list[str]]:
    """Retourne (liste de BreadcrumbList trouvés, liste d'erreurs parsing)."""
    found = []
    errors = []
    for m in LDJSON_RE.finditer(raw):
        body = m.group(1).strip()
        if not body:
            continue
        try:
            data = json.loads(body)
        except json.JSONDecodeError as e:
            errors.append(f"JSON-LD parse error : {e}")
            continue
        # Peut être un objet ou un tableau, ou un @graph
        candidates = []
        if isinstance(data, dict):
            if "@graph" in data and isinstance(data["@graph"], list):
                candidates.extend(data["@graph"])
            else:
                candidates.append(data)
        elif isinstance(data, list):
            candidates.extend(data)
        for c in candidates:
            if not isinstance(c, dict):
                continue
            t = c.get("@type")
            types = t if isinstance(t, list) else [t]
            if any(str(x).lower() == "breadcrumblist" for x in types if x):
                found.append(c)
    return found, errors


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "n_breadcrumb": 0,
        "n_levels": 0,
        "errors": [],
        "warnings": [],
    }
    raw = path.read_text(encoding="utf-8", errors="replace")
    bc, parse_errors = find_breadcrumbs_in_jsonld(raw)

    for e in parse_errors:
        res["errors"].append(f"JSONLD-PARSE : {e}")
        res["status"] = "error"

    res["n_breadcrumb"] = len(bc)

    if not bc:
        res["status"] = "error"
        res["errors"].append("BREADCRUMB-MISSING : pas de JSON-LD BreadcrumbList")
        return res

    if len(bc) > 1:
        res["warnings"].append(
            f"BREADCRUMB-DUPLICATE : {len(bc)} BreadcrumbList trouvés (Google n'en lit qu'1)"
        )
        if res["status"] == "ok":
            res["status"] = "warning"

    # Compter les niveaux max parmi les BreadcrumbList trouvés
    max_levels = 0
    for b in bc:
        items = b.get("itemListElement") or []
        if isinstance(items, list):
            max_levels = max(max_levels, len(items))
    res["n_levels"] = max_levels

    if max_levels < 2:
        res["warnings"].append(
            f"BREADCRUMB-SHORT : {max_levels} item(s) (Schema.org recommande ≥ 2 niveaux)"
        )
        if res["status"] == "ok":
            res["status"] = "warning"

    return res


def main():
    pages = find_eligible_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok = sum(1 for r in results if r["status"] == "ok")
    n_err = sum(1 for r in results if r["status"] == "error")
    n_warn = sum(1 for r in results if r["status"] == "warning")
    total_errors = sum(len(r["errors"]) for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit BreadcrumbList JSON-LD — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages éligibles scannées : **{n_total}**",
        f"- ✅ OK : **{n_ok}**",
        f"- ❌ Erreurs : **{n_err}** (cumul {total_errors} findings)",
        f"- ⚠️  Avertissements (pages) : **{n_warn}**",
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
        md.append(
            f"- BreadcrumbList(s) trouvé(s) : `{r['n_breadcrumb']}`, "
            f"niveaux max : `{r['n_levels']}`"
        )
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — toutes les pages éligibles ont un BreadcrumbList valide._")
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
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_breadcrumb_schema] {n_ok}/{n_total} OK, {n_err} erreurs, "
        f"{n_warn} warnings → {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if n_err else 0


if __name__ == "__main__":
    raise SystemExit(main())
