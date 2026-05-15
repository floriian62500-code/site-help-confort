#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit local des blocs JSON-LD <script type="application/ld+json"> de chaque page HTML.

Vérifications :
  - syntaxe JSON valide
  - présence @context (schema.org)
  - présence @type
  - cohérence si @type=FAQPage (mainEntity présent, chaque Question a acceptedAnswer)
  - cohérence si @type=Service (provider présent, areaServed présent recommandé)
  - cohérence si @type=LocalBusiness/Plumber/... (name, telephone, address présents recommandés)
  - cohérence si @type=BreadcrumbList (itemListElement avec position)
  - cohérence si @type=Article (headline, datePublished, author présents)

Sortie : admin-pro/audits/audit_jsonld_report.md
"""
from __future__ import annotations
import json
import re
import sys
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT  = ROOT / "admin-pro" / "audits" / "audit_jsonld_report.md"

SCRIPT_RE = re.compile(
    r'<script\s+type="application/ld\+json"[^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)

REQUIRED_BY_TYPE = {
    "FAQPage":        ["mainEntity"],
    "Question":       ["name", "acceptedAnswer"],
    "Service":        ["name"],
    "LocalBusiness":  ["name"],
    "Plumber":        ["name"],
    "Electrician":    ["name"],
    "Locksmith":      ["name"],
    "HVACBusiness":   ["name"],
    "GeneralContractor": ["name"],
    "BreadcrumbList": ["itemListElement"],
    "Article":        ["headline"],
    "TechArticle":    ["headline"],
    "WebPage":        [],
    "Organization":   ["name"],
}

RECOMMENDED_BY_TYPE = {
    "LocalBusiness":     ["telephone", "address", "url"],
    "Plumber":           ["telephone", "address", "url", "areaServed"],
    "Electrician":       ["telephone", "address", "url", "areaServed"],
    "Locksmith":         ["telephone", "address", "url", "areaServed"],
    "HVACBusiness":      ["telephone", "address", "url", "areaServed"],
    "GeneralContractor": ["telephone", "address", "url", "areaServed"],
    "Service":           ["provider", "areaServed", "offers"],
    "Article":           ["datePublished", "author", "image"],
    "TechArticle":       ["datePublished", "author"],
}


def find_html_files() -> list[pathlib.Path]:
    files = sorted(p for p in ROOT.glob("*.html"))
    return files


def normalize_types(t):
    if isinstance(t, list):
        return [str(x) for x in t]
    if isinstance(t, str):
        return [t]
    return []


def audit_node(node, path_prefix=""):
    """Récursivement : retourne (warnings, types_seen)."""
    warnings = []
    types_seen = []

    if isinstance(node, list):
        for i, child in enumerate(node):
            sub_w, sub_t = audit_node(child, f"{path_prefix}[{i}]")
            warnings += sub_w
            types_seen += sub_t
        return warnings, types_seen

    if not isinstance(node, dict):
        return warnings, types_seen

    ctx = node.get("@context")
    if path_prefix == "" and ctx is None:
        warnings.append("@context manquant à la racine")
    if ctx and isinstance(ctx, str) and "schema.org" not in ctx:
        warnings.append(f"@context inattendu ({ctx!r}) — attendu schema.org")

    types = normalize_types(node.get("@type"))
    if path_prefix == "" and not types:
        warnings.append("@type manquant à la racine")
    types_seen += types

    for t in types:
        for req in REQUIRED_BY_TYPE.get(t, []):
            if req not in node:
                warnings.append(f"{t} sans {req} (requis) @ {path_prefix or 'racine'}")
        for rec in RECOMMENDED_BY_TYPE.get(t, []):
            if rec not in node:
                warnings.append(f"{t} sans {rec} (recommandé) @ {path_prefix or 'racine'}")

    # Audit imbriqué : on descend dans tous les sous-noeuds (dict/list)
    for k, v in node.items():
        if isinstance(v, (dict, list)):
            sub_w, sub_t = audit_node(v, f"{path_prefix}.{k}" if path_prefix else k)
            warnings += sub_w
            types_seen += sub_t

    return warnings, types_seen


def audit_file(path: pathlib.Path) -> dict:
    try:
        html = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return {"file": path.name, "error": f"read failure: {e}", "blocks": []}

    blocks = SCRIPT_RE.findall(html)
    result = {"file": path.name, "blocks": [], "errors": [], "types": [],
              "n_blocks": len(blocks)}

    if not blocks:
        result["errors"].append("aucun JSON-LD")
        return result

    seen_types = set()
    for i, raw in enumerate(blocks):
        b = {"index": i, "syntax_ok": False, "warnings": [], "types": []}
        try:
            data = json.loads(raw.strip())
            b["syntax_ok"] = True
        except json.JSONDecodeError as e:
            b["error"] = f"JSON invalide ligne {e.lineno} col {e.colno}: {e.msg}"
            result["blocks"].append(b)
            continue

        warns, types = audit_node(data)
        b["warnings"] = warns
        b["types"] = list(dict.fromkeys(types))
        result["blocks"].append(b)

        for t in types:
            # FAQPage dupliquée (bugs #35-36 mémoire IA)
            if t in seen_types and t in ("FAQPage",):
                b["warnings"].append(f"⚠️ TYPE {t} DUPLIQUÉ sur la même page (Google ignorera le 2ᵉ — voir bug #35 MEMOIRE)")
            seen_types.add(t)

        result["types"] += b["types"]

    result["types"] = list(dict.fromkeys(result["types"]))
    return result


def render_report(results: list[dict]) -> str:
    lines = [
        f"# Audit JSON-LD — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "> Audit local des blocs `<script type=\"application/ld+json\">` de chaque page HTML.",
        "> Lancement : `python3 admin-pro/audits/audit_jsonld.py`",
        "",
    ]

    total = len(results)
    pages_with_jsonld = sum(1 for r in results if r["n_blocks"] > 0)
    syntax_errors = sum(
        1 for r in results for b in r["blocks"] if "error" in b
    )
    total_warnings = sum(
        len(b.get("warnings", [])) for r in results for b in r["blocks"]
    )

    lines += [
        "## Synthèse",
        "",
        f"- Pages auditées : **{total}**",
        f"- Pages avec JSON-LD : **{pages_with_jsonld}**",
        f"- Pages sans JSON-LD : **{total - pages_with_jsonld}**",
        f"- Erreurs de syntaxe JSON : **{syntax_errors}**",
        f"- Avertissements (champs manquants/dupliqués) : **{total_warnings}**",
        "",
    ]

    # Pages sans JSON-LD
    missing = [r for r in results if r["n_blocks"] == 0]
    if missing:
        lines += ["## ⚠️ Pages sans aucun JSON-LD", ""]
        for r in missing:
            lines.append(f"- `{r['file']}`")
        lines.append("")

    # Erreurs critiques
    lines += ["## Détail par page", ""]
    for r in sorted(results, key=lambda x: x["file"]):
        if r["n_blocks"] == 0:
            continue
        types_str = ", ".join(r["types"]) if r["types"] else "—"
        lines.append(f"### `{r['file']}` — {r['n_blocks']} bloc(s) — types : {types_str}")
        lines.append("")
        for b in r["blocks"]:
            if "error" in b:
                lines.append(f"- ❌ Bloc #{b['index']} : {b['error']}")
            elif b["warnings"]:
                lines.append(f"- ⚠️ Bloc #{b['index']} (`{', '.join(b['types']) or '?'}`) :")
                for w in b["warnings"]:
                    lines.append(f"    - {w}")
            else:
                lines.append(f"- ✅ Bloc #{b['index']} (`{', '.join(b['types']) or '?'}`) — OK")
        lines.append("")

    return "\n".join(lines)


def main():
    files = find_html_files()
    results = [audit_file(p) for p in files]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(render_report(results), encoding="utf-8")
    print(f"✓ Rapport : {OUT}")
    # Stats stdout
    total = len(results)
    pages_with = sum(1 for r in results if r["n_blocks"] > 0)
    warns = sum(len(b.get("warnings", [])) for r in results for b in r["blocks"])
    errs  = sum(1 for r in results for b in r["blocks"] if "error" in b)
    print(f"  {pages_with}/{total} pages avec JSON-LD, {errs} erreurs syntaxe, {warns} warnings")


if __name__ == "__main__":
    sys.exit(main())
