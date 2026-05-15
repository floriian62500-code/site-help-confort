#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit hiérarchie des headings (h1..h6) — Sonde MEMOIRE_IA_MAINTENANCE.md #53.

Pour chaque page publique racine, extrait la séquence des balises `<h1>` à
`<h6>` *dans l'ordre d'apparition* (hors `<script>`, `<style>`, `<svg>`,
`<template>`, commentaires HTML) et vérifie :

  - NO_H1     : aucune balise <h1> sur la page.
  - MULTI_H1  : plusieurs <h1> sur la page (anti-pattern SEO sauf cas particulier).
  - SKIP_LEVEL: un saut de plus d'1 niveau (h1 → h3, h2 → h4, h3 → h5, etc.).
  - WRONG_START : la première heading n'est pas un <h1>.

Sortie :
  - admin-pro/audits/audit_heading_hierarchy_report.md
  - admin-pro/audits/audit_heading_hierarchy_report.json

Pas de dépendance externe (regex + parsing simple).
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from datetime import datetime
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_heading_hierarchy_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_heading_hierarchy_report.json"

# Pages à exclure de l'audit
EXCLUDED = {"404.html", "reset.html"}
EXCLUDED_PREFIXES = ("test-", "_")

# Regex pour extraire les balises <h1>..<h6> dans l'ordre, en gardant le texte
HEADING_RE = re.compile(
    r"<\s*h([1-6])(\s[^>]*)?>(.*?)<\s*/\s*h\1\s*>",
    re.S | re.I,
)


def strip_noise(html: str) -> str:
    """Retire commentaires, <script>, <style>, <svg>, <template> pour ne pas
    polluer l'audit (les <svg> peuvent contenir des h1 décoratifs Three.js…)."""
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    for tag in ("script", "style", "svg", "template"):
        html = re.sub(rf"<{tag}\b[^>]*>.*?</{tag}>", "", html, flags=re.S | re.I)
    return html


def extract_headings(html: str) -> list[tuple[int, str]]:
    """Retourne [(level, text), ...] dans l'ordre d'apparition."""
    cleaned = strip_noise(html)
    out = []
    for m in HEADING_RE.finditer(cleaned):
        level = int(m.group(1))
        # Nettoyer le texte intérieur
        inner = re.sub(r"<[^>]+>", " ", m.group(3))
        inner = re.sub(r"\s+", " ", inner).strip()
        out.append((level, inner))
    return out


def audit_file(path: pathlib.Path) -> dict:
    html = path.read_text(encoding="utf-8", errors="replace")
    headings = extract_headings(html)
    findings = []

    h1_count = sum(1 for lvl, _ in headings if lvl == 1)

    if not headings:
        findings.append({
            "code": "NO_HEADINGS",
            "severity": "warning",
            "detail": "Aucune balise <h1>..<h6> trouvée sur la page.",
        })
    else:
        # 1. NO_H1 / MULTI_H1
        if h1_count == 0:
            findings.append({
                "code": "NO_H1",
                "severity": "error",
                "detail": "La page ne contient pas de <h1>.",
            })
        elif h1_count > 1:
            findings.append({
                "code": "MULTI_H1",
                "severity": "warning",
                "detail": f"{h1_count} balises <h1> sur la page (1 recommandé).",
            })

        # 2. WRONG_START
        if headings[0][0] != 1:
            findings.append({
                "code": "WRONG_START",
                "severity": "warning",
                "detail": f"Première heading = h{headings[0][0]} (texte : "
                          f"{headings[0][1][:60]!r}). Attendu : h1.",
            })

        # 3. SKIP_LEVEL — descente de plus d'1 niveau d'un coup
        # On compare paire à paire (i, i+1). Saut autorisé en remontée
        # (ex: h3 → h2 → h2), pas en descente.
        for i in range(len(headings) - 1):
            cur = headings[i][0]
            nxt = headings[i + 1][0]
            if nxt > cur + 1:
                findings.append({
                    "code": "SKIP_LEVEL",
                    "severity": "warning",
                    "detail": f"Saut h{cur} → h{nxt} "
                              f"(de {headings[i][1][:40]!r} à {headings[i+1][1][:40]!r}).",
                })

    return {
        "file": path.name,
        "h1_count": h1_count,
        "total_headings": len(headings),
        "sequence": [lvl for lvl, _ in headings],
        "findings": findings,
    }


def list_pages() -> list[pathlib.Path]:
    out = []
    for p in sorted(ROOT.glob("*.html")):
        if p.name in EXCLUDED:
            continue
        if any(p.name.startswith(pref) for pref in EXCLUDED_PREFIXES):
            continue
        out.append(p)
    return out


def render_markdown(results: list[dict]) -> str:
    total = len(results)
    err_pages  = sum(1 for r in results if any(f["severity"] == "error"   for f in r["findings"]))
    warn_pages = sum(1 for r in results if any(f["severity"] == "warning" for f in r["findings"]))
    ok_pages   = sum(1 for r in results if not r["findings"])
    total_findings = sum(len(r["findings"]) for r in results)

    # Top codes
    code_counter = Counter()
    for r in results:
        for f in r["findings"]:
            code_counter[f["code"]] += 1

    lines = []
    lines.append("# Audit Heading hierarchy — Rapport")
    lines.append("")
    lines.append(f"Généré le : `{datetime.now().isoformat(timespec='seconds')}`")
    lines.append("")
    lines.append("Sonde MEMOIRE #53 — vérifie qu'il n'y a pas de saut de niveau "
                 "h1→h3, qu'il y a exactement un <h1>, et que la séquence "
                 "commence bien par un <h1>.")
    lines.append("")
    lines.append("## Synthèse")
    lines.append("")
    lines.append(f"- Pages auditées : **{total}**")
    lines.append(f"- Pages clean : **{ok_pages}**")
    lines.append(f"- Pages avec erreur(s) : **{err_pages}**")
    lines.append(f"- Pages avec warning(s) : **{warn_pages}**")
    lines.append(f"- Findings totaux : **{total_findings}**")
    lines.append("")

    if code_counter:
        lines.append("## Top codes")
        lines.append("")
        for code, n in code_counter.most_common():
            lines.append(f"- **{n}×** `{code}`")
        lines.append("")

    # Détail par page
    problematic = [r for r in results if r["findings"]]
    if problematic:
        lines.append("## Détail par page (pages avec findings)")
        lines.append("")
        sort_key = lambda r: (
            -sum(1 for f in r["findings"] if f["severity"] == "error"),
            -len(r["findings"]),
            r["file"],
        )
        for r in sorted(problematic, key=sort_key):
            seq = " → ".join(f"h{n}" for n in r["sequence"]) or "(aucune)"
            lines.append(f"### `{r['file']}`")
            lines.append("")
            lines.append(f"- h1 sur la page : **{r['h1_count']}**")
            lines.append(f"- Total headings : **{r['total_headings']}**")
            lines.append(f"- Séquence : `{seq[:200]}{'…' if len(seq) > 200 else ''}`")
            for f in r["findings"]:
                icon = "❌" if f["severity"] == "error" else "⚠️"
                lines.append(f"- {icon} **{f['code']}** — {f['detail']}")
            lines.append("")

    # Pages clean
    clean = [r["file"] for r in results if not r["findings"]]
    if clean:
        lines.append("## ✅ Pages sans finding")
        lines.append("")
        for f in sorted(clean):
            lines.append(f"- `{f}`")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    files = list_pages()
    results = [audit_file(p) for p in files]
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text(render_markdown(results), encoding="utf-8")

    report = {
        "audit": "heading_hierarchy",
        "date": datetime.now().isoformat(timespec="seconds"),
        "stats": {
            "pages_audited": len(results),
            "pages_clean": sum(1 for r in results if not r["findings"]),
            "pages_with_error":   sum(1 for r in results if any(f["severity"] == "error"   for f in r["findings"])),
            "pages_with_warning": sum(1 for r in results if any(f["severity"] == "warning" for f in r["findings"])),
            "total_findings": sum(len(r["findings"]) for r in results),
        },
        "results": results,
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    s = report["stats"]
    print(f"[audit_heading_hierarchy] {s['pages_audited']} pages, "
          f"{s['pages_clean']} clean, "
          f"{s['total_findings']} finding(s) "
          f"({s['pages_with_error']} avec erreur).")
    print(f"→ {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
