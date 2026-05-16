#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit inline style size — sonde P15.

Détecte les pages publiques avec plus de 50 KB de CSS inline cumulé
(`<style>…</style>` dans le HTML). Au-delà de ce seuil, le CSS gagne
à être extrait dans `assets/styles.css` :
  - cache navigateur partagé entre pages
  - parsing HTML plus rapide (moins de bytes à parser au render)
  - meilleure note Lighthouse "Avoid an excessive DOM size" /
    "Eliminate render-blocking resources"

Sortie :
  - admin-pro/audits/audit_inline_style_size_report.md
  - admin-pro/audits/audit_inline_style_size_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_inline_style_size_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_inline_style_size_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

THRESHOLD_KB = 50          # seuil ALERTE (extraction recommandée)
WARN_KB = 25               # seuil WARNING
TOP_N = 10                 # nb pages à lister dans le top

STYLE_BLOCK_RE = re.compile(r"<style\b[^>]*>.*?</style>", re.I | re.S)


def find_html_pages():
    pages = []
    for p in ROOT.glob("*.html"):
        if p.name in EXCLUDE:
            continue
        if any(p.name.startswith(pre) for pre in EXCLUDE_PREFIX):
            continue
        pages.append(p)
    actu = ROOT / "actualites"
    if actu.exists():
        for p in actu.glob("*.html"):
            pages.append(p)
    return sorted(pages)


def measure(path: pathlib.Path) -> dict:
    raw = path.read_text(encoding="utf-8", errors="replace")
    blocks = STYLE_BLOCK_RE.findall(raw)
    style_bytes = sum(len(b.encode("utf-8")) for b in blocks)
    return {
        "file": str(path.relative_to(ROOT)),
        "n_style_blocks": len(blocks),
        "style_bytes": style_bytes,
        "style_kb": round(style_bytes / 1024, 1),
    }


def main():
    pages = find_html_pages()
    results = [measure(p) for p in pages]
    results.sort(key=lambda r: -r["style_bytes"])

    n_total = len(results)
    heavy = [r for r in results if r["style_kb"] > THRESHOLD_KB]
    warn = [r for r in results if WARN_KB < r["style_kb"] <= THRESHOLD_KB]
    total_kb = round(sum(r["style_bytes"] for r in results) / 1024, 1)
    avg_kb = round(total_kb / n_total, 1) if n_total else 0

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit inline `<style>` size — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- CSS inline cumulé : **{total_kb} KB**",
        f"- CSS inline moyen : **{avg_kb} KB / page**",
        f"- ❌ Pages > {THRESHOLD_KB} KB : **{len(heavy)}**",
        f"- ⚠️ Pages {WARN_KB}–{THRESHOLD_KB} KB : **{len(warn)}**",
        "",
        f"## Top {TOP_N} pages — CSS inline le plus volumineux",
        "",
        "| # | Fichier | Poids `<style>` | Nb blocs |",
        "|---|---------|-----------------|----------|",
    ]
    for i, r in enumerate(results[:TOP_N], 1):
        icon = (
            "❌" if r["style_kb"] > THRESHOLD_KB
            else ("⚠️" if r["style_kb"] > WARN_KB else "✅")
        )
        md.append(
            f"| {i} | {icon} `{r['file']}` | "
            f"**{r['style_kb']} KB** | "
            f"{r['n_style_blocks']} |"
        )
    md.append("")

    if heavy:
        md += [
            f"## ❌ Pages > {THRESHOLD_KB} KB",
            "",
            "Ces pages gagneraient à voir leur CSS inline extrait vers un "
            "fichier `.css` externe (cache partagé inter-pages, render-blocking "
            "réduit, taille HTML diminuée).",
            "",
        ]
        for r in heavy:
            md.append(
                f"- `{r['file']}` — **{r['style_kb']} KB** "
                f"({r['n_style_blocks']} bloc(s) `<style>`)"
            )
        md.append("")
    else:
        md.append(f"_✅ Aucune page ne dépasse {THRESHOLD_KB} KB de CSS inline._")
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
        f"[audit_inline_style_size] {n_total} pages, "
        f"{len(heavy)} > {THRESHOLD_KB} KB, {len(warn)} > {WARN_KB} KB, "
        f"cumul {total_kb} KB → {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if heavy else 0


if __name__ == "__main__":
    raise SystemExit(main())
