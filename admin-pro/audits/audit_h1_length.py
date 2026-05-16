#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit H1 length — sonde P15.

Détecte les `<h1>` :
  - absents (info — couvert aussi par audit_html5 / audit_heading_hierarchy)
  - multiples (warning — couvert aussi par audit_heading_hierarchy)
  - trop courts : < 20 caractères (signal SEO faible, mots-clés peu denses)
  - trop longs  : > 70 caractères (UX dégradée, mauvaise scannabilité)

Seuils retenus :
  - ERROR : len < 20 ou len > 70
  - OK    : 20 ≤ len ≤ 70

Whitelist : pages 404/reset, articles dynamiques (realisation.html),
pages test-* ou _*.

Extraction :
  - on récupère le PREMIER `<h1>` rencontré (assume bonne pratique 1 par page)
  - on strip les balises HTML imbriquées (span, br, etc.)
  - on collapse les espaces successifs
  - on ignore les `<h1>` à l'intérieur de `<script>`, `<style>`, `<template>`,
    `<noscript>` ou `<svg>`.

Sortie :
  - admin-pro/audits/audit_h1_length_report.md
  - admin-pro/audits/audit_h1_length_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_h1_length_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_h1_length_report.json"

# Pages à exclure
EXCLUDE = {
    "404.html",
    "reset.html",
    "realisation.html",  # H1 injecté par JS depuis Supabase
}
EXCLUDE_PREFIX = ("test-", "_")

# Bornes (caractères)
MIN_LEN = 20
MAX_LEN = 70

# Sections "transparentes" — h1 dedans est ignoré (template ou contenu non rendu)
IGNORE_INSIDE = {"script", "style", "template", "noscript", "svg"}


class H1Extractor(HTMLParser):
    """Récupère tous les <h1>...</h1> du DOM, hors sections IGNORE_INSIDE."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._stack: list[str] = []
        self._buf: list[str] = []
        self._capture: int = 0  # profondeur de h1 imbriqué (toujours 0 ou 1)
        self.h1s: list[str] = []

    def _in_ignored(self) -> bool:
        return any(t in IGNORE_INSIDE for t in self._stack)

    def handle_starttag(self, tag: str, attrs):
        tag = tag.lower()
        self._stack.append(tag)
        if tag == "h1" and not self._in_ignored():
            self._capture += 1
            self._buf = []

    def handle_endtag(self, tag: str):
        tag = tag.lower()
        # Pop stack jusqu'au tag (tolère mauvaise imbrication)
        if tag in self._stack:
            while self._stack and self._stack[-1] != tag:
                self._stack.pop()
            if self._stack:
                self._stack.pop()
        if tag == "h1" and self._capture > 0:
            self._capture -= 1
            text = " ".join(self._buf).strip()
            text = re.sub(r"\s+", " ", text)
            if text:
                self.h1s.append(text)
            self._buf = []

    def handle_startendtag(self, tag, attrs):
        # Balises auto-fermantes : on n'empile pas
        # (br, img, hr… apparaissent souvent dans <h1>)
        pass

    def handle_data(self, data: str):
        if self._capture > 0:
            self._buf.append(data)


def find_html_pages():
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


def classify(length: int) -> tuple[str, str]:
    if length < MIN_LEN:
        return "error", f"H1-TOO-SHORT : {length} chars < {MIN_LEN}"
    if length > MAX_LEN:
        return "error", f"H1-TOO-LONG : {length} chars > {MAX_LEN}"
    return "ok", f"OK : {length} chars"


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "n_h1": 0,
        "h1_text": None,
        "length": 0,
        "errors": [],
        "warnings": [],
    }
    raw = path.read_text(encoding="utf-8", errors="replace")
    p = H1Extractor()
    try:
        p.feed(raw)
    except Exception as e:
        res["status"] = "info"
        res["warnings"].append(f"PARSE-ERROR : {type(e).__name__}")
        return res

    res["n_h1"] = len(p.h1s)

    if not p.h1s:
        res["status"] = "info"
        res["warnings"].append("H1-MISSING : aucun <h1> trouvé")
        return res

    if len(p.h1s) > 1:
        res["warnings"].append(
            f"H1-MULTIPLE : {len(p.h1s)} <h1> sur la page (audit_heading_hierarchy couvre)"
        )

    first = p.h1s[0]
    res["h1_text"] = first
    res["length"] = len(first)
    status, label = classify(len(first))
    # On garde "warn" si seul le doublon est en cause
    if status == "error":
        res["status"] = "error"
        res["errors"].append(label)
    else:
        res["status"] = "warn" if res["warnings"] else "ok"
    return res


def main():
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok    = sum(1 for r in results if r["status"] == "ok")
    n_warn  = sum(1 for r in results if r["status"] == "warn")
    n_err   = sum(1 for r in results if r["status"] == "error")
    n_info  = sum(1 for r in results if r["status"] == "info")
    total_errors   = sum(len(r["errors"])   for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit H1 length — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- ✅ OK ({MIN_LEN}-{MAX_LEN} chars) : **{n_ok}**",
        f"- ⚠️  Warnings (h1 multiples, hors longueur) : **{n_warn}**",
        f"- ❌ Erreurs (< {MIN_LEN} ou > {MAX_LEN}) : **{n_err}**",
        f"- ℹ️  Sans h1 ou parse error : **{n_info}**",
        f"- Findings totaux : **{total_errors + total_warnings}**",
        f"  - Erreurs : {total_errors}",
        f"  - Avertissements : {total_warnings}",
        "",
        "## Bornes appliquées",
        "",
        f"- ERROR : len < {MIN_LEN} ou len > {MAX_LEN}",
        f"- OK    : {MIN_LEN} ≤ len ≤ {MAX_LEN}",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    order = {"error": 0, "warn": 1, "info": 2, "ok": 3}
    for r in sorted(results, key=lambda x: (order.get(x["status"], 9), x["file"])):
        if not r["errors"] and not r["warnings"]:
            continue
        has_finding = True
        md.append(f"### `{r['file']}`  ({r['length']} chars, n_h1={r['n_h1']})")
        if r["h1_text"]:
            md.append(f"> {r['h1_text']}")
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — tous les `<h1>` sont calibrés._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "thresholds": {"min_len": MIN_LEN, "max_len": MAX_LEN},
                "n_total":   n_total,
                "n_ok":      n_ok,
                "n_warn":    n_warn,
                "n_errors":  n_err,
                "n_info":    n_info,
                "results":   results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_h1_length] {n_ok}/{n_total} OK, "
        f"{n_warn} warn, {n_err} error, {n_info} sans h1 "
        f"→ {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if n_err else 0


if __name__ == "__main__":
    raise SystemExit(main())
