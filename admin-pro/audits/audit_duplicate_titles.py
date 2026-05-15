#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit duplicate titles & meta descriptions — sonde P14.

Détecte cross-page :
  - `<title>` strictement identiques (mauvais SEO, duplicate content soft)
  - `<meta name="description">` strictement identiques

Whitelist : pages 404/reset/test, articles dynamiques (realisation.html — détail).

Seuil : > 1 occurrence d'un titre/description partagé → ALERTE.

Sortie :
  - admin-pro/audits/audit_duplicate_titles_report.md
  - admin-pro/audits/audit_duplicate_titles_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_duplicate_titles_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_duplicate_titles_report.json"

EXCLUDE = {
    "404.html",
    "reset.html",
    "realisation.html",  # détail dynamique : title injecté par JS
}
EXCLUDE_PREFIX = ("test-", "_")

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
META_DESC_RE = re.compile(
    r'<meta\s+[^>]*name\s*=\s*"description"[^>]*content\s*=\s*"([^"]+)"',
    re.I,
)
META_DESC_ALT_RE = re.compile(
    r'<meta\s+[^>]*content\s*=\s*"([^"]+)"[^>]*name\s*=\s*"description"',
    re.I,
)


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


def extract(path: pathlib.Path) -> tuple[str | None, str | None]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    title = None
    desc = None
    tm = TITLE_RE.search(raw)
    if tm:
        title = re.sub(r"\s+", " ", tm.group(1)).strip()
    dm = META_DESC_RE.search(raw)
    if dm:
        desc = dm.group(1).strip()
    else:
        dm = META_DESC_ALT_RE.search(raw)
        if dm:
            desc = dm.group(1).strip()
    return title, desc


def main():
    pages = find_html_pages()
    title_map = defaultdict(list)
    desc_map = defaultdict(list)
    pages_seen = []

    for p in pages:
        rel = str(p.relative_to(ROOT))
        title, desc = extract(p)
        pages_seen.append({"file": rel, "title": title, "description": desc})
        if title:
            title_map[title].append(rel)
        if desc:
            desc_map[desc].append(rel)

    duplicate_titles = {
        t: files for t, files in title_map.items() if len(files) > 1
    }
    duplicate_descs = {
        d: files for d, files in desc_map.items() if len(files) > 1
    }

    n_total = len(pages_seen)
    n_dup_titles = len(duplicate_titles)
    n_dup_descs = len(duplicate_descs)
    n_pages_with_dup_title = sum(len(v) for v in duplicate_titles.values())
    n_pages_with_dup_desc = sum(len(v) for v in duplicate_descs.values())

    # ─── Rapport Markdown
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit duplicate titles & descriptions — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- Titres dupliqués (cross-page) : **{n_dup_titles}** "
        f"({n_pages_with_dup_title} pages concernées)",
        f"- Descriptions dupliquées : **{n_dup_descs}** "
        f"({n_pages_with_dup_desc} pages concernées)",
        "",
    ]

    if duplicate_titles:
        md += ["## ❌ Titres en doublon", ""]
        for title, files in sorted(
            duplicate_titles.items(), key=lambda x: -len(x[1])
        ):
            md.append(f"### « {title} »")
            md.append(f"_{len(files)} pages_")
            for f in sorted(files):
                md.append(f"- `{f}`")
            md.append("")
    else:
        md += ["## ✅ Aucun titre dupliqué", ""]

    if duplicate_descs:
        md += ["## ❌ Descriptions en doublon", ""]
        for desc, files in sorted(
            duplicate_descs.items(), key=lambda x: -len(x[1])
        ):
            md.append(f"### « {desc[:140]}{'…' if len(desc) > 140 else ''} »")
            md.append(f"_{len(files)} pages_")
            for f in sorted(files):
                md.append(f"- `{f}`")
            md.append("")
    else:
        md += ["## ✅ Aucune description dupliquée", ""]

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "n_total": n_total,
                "n_duplicate_titles": n_dup_titles,
                "n_duplicate_descs": n_dup_descs,
                "duplicate_titles": duplicate_titles,
                "duplicate_descs": duplicate_descs,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_duplicate_titles] {n_total} pages, "
        f"{n_dup_titles} titres dup, {n_dup_descs} descs dup "
        f"→ {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if (n_dup_titles or n_dup_descs) else 0


if __name__ == "__main__":
    raise SystemExit(main())
