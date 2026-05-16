#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit admin-pro isolation — sonde P15.

Vérifie qu'aucune page publique racine ne référence (via <a href>, <link href>,
<script src>, <img src>, ou en clair dans un attribut data-*) une page
`admin-pro/*.html`. L'admin doit rester accessible uniquement via login direct
(URL connue de Florian) — toute fuite en clair dans le HTML public expose
inutilement la surface d'attaque.

Tolérances :
  - les pages du dossier `admin-pro/` peuvent se référencer entre elles
  - les ancres internes (#fragment seul) sont ignorées
  - les références dans des `<script>` (chaînes JS) sont volontairement
    *aussi* scannées : un robot SEO ou un dump curl les lirait

Sortie :
  - admin-pro/audits/audit_admin_pro_isolation_report.md
  - admin-pro/audits/audit_admin_pro_isolation_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_admin_pro_isolation_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_admin_pro_isolation_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

# Patterns détectant une référence vers admin-pro/*.html ou /admin/...
# On capte tout ce qui ressemble à un chemin admin (admin/, admin-pro/) pour être large.
PATTERNS = [
    re.compile(r"""(?ix)
        (?:href|src|action|data-[a-z\-]+)\s*=\s*
        ["']
        (?P<url>[^"']*?\b(?:admin-pro|admin)/[^"'#?]+\.html[^"']*)
        ["']
    """),
    # Fallback : chaîne nue dans du JS / texte
    re.compile(r"""(?ix)
        (?P<url>(?<![\w/])(?:admin-pro|admin)/[A-Za-z0-9_\-/]+\.html\b)
    """),
]

# Pages admin (cibles) — on whitelist /admin/index.html comme point d'entrée
# public connu mais aucune page admin-pro/*.html ne devrait fuiter.
WHITELIST_TARGETS = {
    "admin/index.html",        # page de login publique
    "admin-pro/index.html",    # tolérée si présente derrière login modal
}


def find_public_pages():
    """Pages publiques racine + actualites/, hors admin-pro/."""
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


def normalize_target(url: str) -> str:
    """Normalise une URL admin-pro/* vers son chemin clean (sans query/fragment)."""
    url = url.strip()
    # strip protocole+host éventuel
    url = re.sub(r"^https?://[^/]+/", "/", url)
    url = url.split("#", 1)[0].split("?", 1)[0]
    url = url.lstrip("./").lstrip("/")
    return url


def scan_page(path: pathlib.Path) -> list[dict]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    findings = []
    seen = set()
    for pattern in PATTERNS:
        for m in pattern.finditer(raw):
            url = m.group("url")
            target = normalize_target(url)
            if target in WHITELIST_TARGETS:
                continue
            # cherche la ligne
            pos = m.start()
            line_no = raw.count("\n", 0, pos) + 1
            key = (line_no, target)
            if key in seen:
                continue
            seen.add(key)
            # extrait un snippet
            snippet_start = max(0, pos - 30)
            snippet_end = min(len(raw), m.end() + 30)
            snippet = raw[snippet_start:snippet_end].replace("\n", " ").strip()
            findings.append({
                "line": line_no,
                "target": target,
                "raw_match": m.group(0),
                "snippet": snippet,
            })
    return findings


def main():
    pages = find_public_pages()
    results = []
    n_leaks = 0
    for p in pages:
        leaks = scan_page(p)
        results.append({
            "file": str(p.relative_to(ROOT)),
            "n_leaks": len(leaks),
            "leaks": leaks,
        })
        n_leaks += len(leaks)

    n_total = len(results)
    leaked_pages = [r for r in results if r["n_leaks"] > 0]

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit admin-pro isolation — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages publiques scannées : **{n_total}**",
        f"- Pages avec fuite admin-pro : **{len(leaked_pages)}**",
        f"- Total fuites détectées : **{n_leaks}**",
        f"- Whitelist : `{', '.join(sorted(WHITELIST_TARGETS))}`",
        "",
    ]

    if leaked_pages:
        md += [
            "## ❌ Fuites détectées",
            "",
            "Ces pages publiques référencent en clair une URL `admin-pro/...html` "
            "(ou `admin/...html` hors whitelist). Recommandation : retirer le "
            "lien — l'admin doit rester accessible uniquement via URL connue "
            "+ login.",
            "",
        ]
        for r in leaked_pages:
            md.append(f"### `{r['file']}` — {r['n_leaks']} fuite(s)")
            md.append("")
            for leak in r["leaks"]:
                md.append(
                    f"- Ligne {leak['line']} → `{leak['target']}`  \n"
                    f"  `{leak['raw_match'][:120]}`"
                )
            md.append("")
    else:
        md.append("_✅ Aucune fuite admin-pro depuis les pages publiques._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "n_total": n_total,
                "n_leaked_pages": len(leaked_pages),
                "n_leaks": n_leaks,
                "whitelist_targets": sorted(WHITELIST_TARGETS),
                "results": results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_admin_pro_isolation] {n_total} pages, "
        f"{len(leaked_pages)} avec fuite, {n_leaks} fuites total "
        f"→ {OUT_MD.relative_to(ROOT)}"
    )
    return 1 if leaked_pages else 0


if __name__ == "__main__":
    raise SystemExit(main())
