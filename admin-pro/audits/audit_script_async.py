#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit script async/defer — sonde P14.

Détecte les `<script src="...">` externes (avec attribut `src`) sans `defer`
ni `async`. Ces scripts sont *render-blocking* : le navigateur stoppe le parse
HTML jusqu'à téléchargement + exécution → impact perf direct sur LCP/FCP.

Tolère :
  - scripts inline (pas de `src`)
  - scripts `type="application/ld+json"` ou `type="module"` (déjà async par
    spec)
  - scripts dont la position est en bas de `<body>` (juste avant `</body>`) :
    moins critique mais on les liste quand même en warning

Sortie :
  - admin-pro/audits/audit_script_async_report.md
  - admin-pro/audits/audit_script_async_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_script_async_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_script_async_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

# Capture <script ...> (tag d'ouverture seulement)
SCRIPT_OPEN_RE = re.compile(r"<script\b([^>]*)>", re.I)
ATTR_RE = re.compile(r'(\w[\w:-]*)\s*=\s*"([^"]*)"', re.I)
BARE_ATTR_RE = re.compile(r'(?<![\w-])(async|defer)(?![\w-])', re.I)


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


def parse_attrs(attr_str: str) -> dict:
    attrs = {}
    for m in ATTR_RE.finditer(attr_str):
        attrs[m.group(1).lower()] = m.group(2)
    # async/defer peuvent apparaître sans valeur (forme HTML5)
    for m in BARE_ATTR_RE.finditer(attr_str):
        attrs.setdefault(m.group(1).lower(), "")
    return attrs


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "scripts_total": 0,
        "scripts_blocking": 0,
        "blocking": [],     # liste des scripts bloquants (src + ligne)
    }
    raw = path.read_text(encoding="utf-8", errors="replace")
    # Position du </body> pour distinguer head vs fin-de-body
    body_end_pos = raw.lower().rfind("</body>")
    if body_end_pos < 0:
        body_end_pos = len(raw)

    for m in SCRIPT_OPEN_RE.finditer(raw):
        attr_str = m.group(1)
        attrs = parse_attrs(attr_str)
        src = attrs.get("src", "").strip()
        if not src:
            continue  # inline → on ignore
        res["scripts_total"] += 1

        stype = attrs.get("type", "").lower()
        if stype in ("application/ld+json", "module"):
            continue  # déjà async par spec ou data

        if "async" in attrs or "defer" in attrs:
            continue

        # Position : avant ou après </body> ?
        line_no = raw.count("\n", 0, m.start()) + 1
        position = "head" if m.start() < body_end_pos else "body-end"
        # Si fin de body : critique faible (le HTML est déjà parsé), warning
        # sinon : erreur (render-blocking dans le <head>)
        # Détection plus fine : si avant </head> → erreur, sinon warning
        head_end_pos = raw.lower().find("</head>")
        if head_end_pos > 0 and m.start() < head_end_pos:
            severity = "error"
        else:
            severity = "warning"

        res["scripts_blocking"] += 1
        res["blocking"].append({
            "src": src,
            "line": line_no,
            "position": position,
            "severity": severity,
        })

    if any(s["severity"] == "error" for s in res["blocking"]):
        res["status"] = "error"
    elif res["blocking"]:
        res["status"] = "warning"
    return res


def main():
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok = sum(1 for r in results if r["status"] == "ok")
    n_err = sum(1 for r in results if r["status"] == "error")
    n_warn = sum(1 for r in results if r["status"] == "warning")
    total_blocking = sum(r["scripts_blocking"] for r in results)
    total_scripts = sum(r["scripts_total"] for r in results)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit script async/defer — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- Scripts externes total : **{total_scripts}**",
        f"- Scripts render-blocking : **{total_blocking}**",
        f"- ✅ OK : **{n_ok}**",
        f"- ❌ Erreurs (script bloquant dans `<head>`) : **{n_err}**",
        f"- ⚠️ Avertissements (script bloquant en fin de `<body>`) : **{n_warn}**",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    for r in results:
        if r["status"] == "ok":
            continue
        has_finding = True
        md.append(f"### `{r['file']}`")
        for s in r["blocking"]:
            icon = "❌" if s["severity"] == "error" else "⚠️"
            md.append(
                f"- {icon} L.{s['line']} ({s['position']}) "
                f"`{s['src']}` — ajouter `defer` ou `async`"
            )
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — tous les `<script src>` sont async/defer._")
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
                "scripts_total": total_scripts,
                "scripts_blocking": total_blocking,
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_script_async] {n_total} pages, "
        f"{total_blocking}/{total_scripts} scripts bloquants "
        f"({n_err} erreurs, {n_warn} warnings) → {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if n_err else 0


if __name__ == "__main__":
    raise SystemExit(main())
