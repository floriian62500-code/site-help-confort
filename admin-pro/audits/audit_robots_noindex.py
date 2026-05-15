#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit robots noindex — sonde P14.

Vérifie qu'aucune page publique racine n'a accidentellement un
`<meta name="robots" content="noindex">` (ou `none`, ou `noindex,nofollow`).
Une page noindex = invisible Google → ALERTE CRITIQUE pour le SEO.

Détecte aussi :
  - `<meta http-equiv="x-robots-tag" content="noindex">`
  - directive `none` (équivaut à noindex+nofollow)

Tolère :
  - 404.html, reset.html, test-*.html, _*.html
  - Pages admin (/admin/, /admin-pro/)
  - Indexable explicite : `index, follow` etc. → OK

Sortie :
  - admin-pro/audits/audit_robots_noindex_report.md
  - admin-pro/audits/audit_robots_noindex_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_robots_noindex_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_robots_noindex_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

# Pages dynamiques où noindex est attendu (contenu injecté par JS via slug
# query-string ; Google ne peut pas crawler les vraies URLs uniques).
NOINDEX_ALLOWED = {
    "realisation.html",  # détail chantier, contenu via ?slug=
}

META_ROBOTS_RE = re.compile(
    r'<meta\s+[^>]*name\s*=\s*"robots"[^>]*>',
    re.I,
)
META_ROBOTS_HTTP_RE = re.compile(
    r'<meta\s+[^>]*http-equiv\s*=\s*"x-robots-tag"[^>]*>',
    re.I,
)
CONTENT_RE = re.compile(r'content\s*=\s*"([^"]+)"', re.I)

# Directives qui bloquent l'indexation Google
BLOCKING_TOKENS = {"noindex", "none"}


def find_html_pages():
    """Pages publiques racine + actualites/."""
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


def parse_directives(content: str) -> set[str]:
    return {t.strip().lower() for t in content.split(",") if t.strip()}


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "robots_meta": None,
        "errors": [],
    }
    raw = path.read_text(encoding="utf-8", errors="replace")

    for regex, label in (
        (META_ROBOTS_RE, "robots"),
        (META_ROBOTS_HTTP_RE, "x-robots-tag"),
    ):
        for m in regex.finditer(raw):
            tag = m.group(0)
            cm = CONTENT_RE.search(tag)
            if not cm:
                continue
            directives = parse_directives(cm.group(1))
            res["robots_meta"] = {
                "type": label,
                "content": cm.group(1),
                "directives": sorted(directives),
            }
            blocking = directives & BLOCKING_TOKENS
            if blocking:
                line_no = raw.count("\n", 0, m.start()) + 1
                if path.name in NOINDEX_ALLOWED:
                    # Page dynamique : noindex attendu, on log en info
                    res["status"] = "info"
                    res["errors"] = []  # vide pour ne pas alerter
                    res["robots_meta"]["allowed"] = True
                else:
                    res["status"] = "error"
                    res["errors"].append(
                        f"ROBOTS-NOINDEX (L.{line_no}) : "
                        f"directive(s) bloquante(s) « {', '.join(sorted(blocking))} » "
                        f"dans <meta {label}> → page invisible Google"
                    )
    return res


def main():
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_err = sum(1 for r in results if r["status"] == "error")
    n_info = sum(1 for r in results if r["status"] == "info")
    n_ok = n_total - n_err - n_info
    n_with_robots = sum(1 for r in results if r["robots_meta"])

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit robots noindex — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- Pages avec `<meta robots>` : **{n_with_robots}**",
        f"- ✅ OK (indexables) : **{n_ok}**",
        f"- ℹ️ noindex légitime (pages dynamiques) : **{n_info}**",
        f"- ❌ Erreurs (noindex/none non attendu) : **{n_err}**",
        "",
    ]

    if n_err:
        md += [
            "## ❌ Pages bloquées pour Google",
            "",
            "Ces pages ont une directive `noindex` ou `none` — elles ne "
            "remonteront PAS dans les résultats Google. Vérifier qu'il "
            "s'agit bien d'une intention.",
            "",
        ]
        for r in results:
            if r["status"] != "error":
                continue
            md.append(f"### `{r['file']}`")
            for e in r["errors"]:
                md.append(f"- ❌ {e}")
            md.append("")
    else:
        md.append("_✅ Aucune page publique n'est bloquée pour Google._")
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
                "n_with_robots": n_with_robots,
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_robots_noindex] {n_total} pages, "
        f"{n_with_robots} avec meta robots, {n_err} bloquantes "
        f"→ {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if n_err else 0


if __name__ == "__main__":
    raise SystemExit(main())
