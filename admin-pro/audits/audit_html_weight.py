#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit HTML weight — sonde P14.

Calcule le poids du `.html` (sans assets externes) de chaque page publique.
Une page > 250 KB est suspecte :
  - pollution `<style>` inline (CSS qui devrait être externalisé)
  - template gonflé / duplication massive
  - JS inline trop volumineux (devrait être dans `assets/`)

Sortie :
  - admin-pro/audits/audit_html_weight_report.md
  - admin-pro/audits/audit_html_weight_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_html_weight_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_html_weight_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

THRESHOLD_KB = 250            # seuil ALERTE
WARN_KB = 150                 # seuil WARNING
TOP_N = 10                    # nb pages à lister dans le top

STYLE_BLOCK_RE = re.compile(r"<style\b[^>]*>.*?</style>", re.I | re.S)
SCRIPT_INLINE_RE = re.compile(
    r"<script\b(?![^>]*\bsrc\s*=)[^>]*>.*?</script>", re.I | re.S
)
SVG_INLINE_RE = re.compile(r"<svg\b[^>]*>.*?</svg>", re.I | re.S)


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


def measure(path: pathlib.Path) -> dict:
    raw_bytes = path.read_bytes()
    raw = raw_bytes.decode("utf-8", errors="replace")
    size = len(raw_bytes)

    # Mesure poids des blocs inline (pour aider à comprendre l'origine du poids)
    style_bytes = sum(len(m.group(0).encode("utf-8")) for m in STYLE_BLOCK_RE.finditer(raw))
    script_bytes = sum(len(m.group(0).encode("utf-8")) for m in SCRIPT_INLINE_RE.finditer(raw))
    svg_bytes = sum(len(m.group(0).encode("utf-8")) for m in SVG_INLINE_RE.finditer(raw))

    return {
        "file": str(path.relative_to(ROOT)),
        "size_bytes": size,
        "size_kb": round(size / 1024, 1),
        "style_bytes": style_bytes,
        "style_kb": round(style_bytes / 1024, 1),
        "script_inline_bytes": script_bytes,
        "script_inline_kb": round(script_bytes / 1024, 1),
        "svg_inline_bytes": svg_bytes,
        "svg_inline_kb": round(svg_bytes / 1024, 1),
    }


def main():
    pages = find_html_pages()
    results = [measure(p) for p in pages]
    results.sort(key=lambda r: -r["size_bytes"])

    n_total = len(results)
    heavy = [r for r in results if r["size_kb"] > THRESHOLD_KB]
    warn = [r for r in results if WARN_KB < r["size_kb"] <= THRESHOLD_KB]
    total_kb = round(sum(r["size_bytes"] for r in results) / 1024, 1)
    avg_kb = round(total_kb / n_total, 1) if n_total else 0

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit HTML weight — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- Poids cumulé : **{total_kb} KB**",
        f"- Poids moyen : **{avg_kb} KB**",
        f"- ❌ Pages > {THRESHOLD_KB} KB : **{len(heavy)}**",
        f"- ⚠️ Pages {WARN_KB}–{THRESHOLD_KB} KB : **{len(warn)}**",
        "",
        f"## Top {TOP_N} pages les plus lourdes",
        "",
        "| # | Fichier | Total | `<style>` | `<script>` inline | `<svg>` inline |",
        "|---|---------|-------|-----------|-------------------|----------------|",
    ]
    for i, r in enumerate(results[:TOP_N], 1):
        icon = "❌" if r["size_kb"] > THRESHOLD_KB else ("⚠️" if r["size_kb"] > WARN_KB else "✅")
        md.append(
            f"| {i} | {icon} `{r['file']}` | "
            f"**{r['size_kb']} KB** | "
            f"{r['style_kb']} KB | "
            f"{r['script_inline_kb']} KB | "
            f"{r['svg_inline_kb']} KB |"
        )
    md.append("")

    if heavy:
        md += [
            f"## ❌ Pages > {THRESHOLD_KB} KB",
            "",
            "Ces pages sont suspectes — vérifier la présence de CSS/JS inline "
            "qui pourrait être externalisé.",
            "",
        ]
        for r in heavy:
            md.append(
                f"- `{r['file']}` — **{r['size_kb']} KB** "
                f"(`<style>` : {r['style_kb']} KB, inline-js : {r['script_inline_kb']} KB)"
            )
        md.append("")
    else:
        md.append(f"_✅ Aucune page ne dépasse {THRESHOLD_KB} KB._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "threshold_kb": THRESHOLD_KB,
                "warn_kb": WARN_KB,
                "n_total": n_total,
                "n_heavy": len(heavy),
                "n_warn": len(warn),
                "total_kb": total_kb,
                "avg_kb": avg_kb,
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_html_weight] {n_total} pages, "
        f"{len(heavy)} > {THRESHOLD_KB} KB, {len(warn)} > {WARN_KB} KB, "
        f"moy {avg_kb} KB → {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if heavy else 0


if __name__ == "__main__":
    raise SystemExit(main())
