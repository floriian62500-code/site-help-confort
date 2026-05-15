#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #49 — Fallback Supabase obligatoire.

Toute page publique qui charge son contenu depuis Supabase
(`supabase.from('...')` ou `fetch('.../rest/v1/...')`) DOIT déclarer
un fallback local (`LOCAL_CATALOG`, `FALLBACK_DATA`, `FALLBACK_`, …) dans
son `<script>` JS. Sans ce filet de sécurité, une coupure réseau Supabase
ou une RLS bloquée affiche une page vide et fait perdre 100 % des leads.

Critères de détection :
  - Présence d'au moins un appel Supabase (regex `supabase.from(` /
    `/rest/v1/` / `createClient(`).
  - Présence d'au moins un identifiant de fallback dans le script
    (regex `LOCAL_CATALOG|FALLBACK_DATA|FALLBACK_|FALLBACK\\s*=`).

Si Supabase utilisé MAIS aucun fallback détecté → ALERTE
*NO-FALLBACK*. Si fallback présent → OK.

Sortie :
  admin-pro/audits/audit_fallback_supabase_report.md
  admin-pro/audits/audit_fallback_supabase_report.json

Zéro dépendance externe.
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_fallback_supabase_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_fallback_supabase_report.json"

EXCLUDED = {"404.html", "reset.html"}
EXCLUDED_PREFIXES = ("test-", "_")

# Pages dont on attend explicitement un fallback statique (déjà documentées)
EXPECTED_PAGES = {
    "nos-prestations.html",
    "temoignages.html",
    "avant-apres.html",
    "actualites.html",
    "realisation.html",
    "devis-express.html",
    "blog.html",
    "index.html",
}

SUPABASE_PATTERNS = [
    re.compile(r"supabase\s*\.\s*from\s*\(", re.I),
    re.compile(r"/rest/v1/[a-z_]+", re.I),
    re.compile(r"createClient\s*\(", re.I),
]

FALLBACK_PATTERNS = [
    re.compile(r"\bLOCAL_CATALOG\b"),
    re.compile(r"\bLOCAL_DATA\b"),
    re.compile(r"\bFALLBACK_DATA\b"),
    re.compile(r"\bFALLBACK_[A-Z_]+\b"),
    re.compile(r"\bFALLBACK\s*=\s*[\[{]"),
    re.compile(r"\bDEFAULT_DATA\b"),
    re.compile(r"\bLOCAL_FALLBACK\b"),
    # Fallback de type "fetch vers un JSON statique local" (chemin relatif)
    re.compile(r"""fetch\s*\(\s*['"](?!https?:)[^'"]*\.json[^'"]*['"]""", re.I),
    # Fallback de type "tableau d'exemples hardcodés" (≥ 3 objets littéraux)
    re.compile(r"""(?:const|let|var)\s+\w+\s*=\s*\[\s*\{[^}]*['"]title['"]""", re.I),
    # Ré-affectation d'un tableau d'exemples (var declaré + initialisé plus loin)
    re.compile(r"""\w+\s*=\s*\[\s*\{[^}]*['"](?:author_name|title|nom|categorie|rating|text|metier|name|prestation)['"]""", re.I),
]

# On regarde aussi un fallback minimal côté UX : un catch() qui affiche
# explicitement un message dégradé. C'est insuffisant à lui seul, mais on
# le notifie en "soft-ok".
SOFT_FALLBACK_PATTERN = re.compile(
    r"\.catch\s*\(\s*[^)]*\)\s*\{[^}]*(innerHTML|textContent|hidden\s*=|display\s*=)",
    re.S,
)


def list_pages() -> list[pathlib.Path]:
    out = []
    for p in sorted(ROOT.glob("*.html")):
        if p.name in EXCLUDED:
            continue
        if any(p.name.startswith(pref) for pref in EXCLUDED_PREFIXES):
            continue
        out.append(p)
    return out


def strip_comments(html: str) -> str:
    """Retire commentaires HTML pour éviter de matcher du code commenté."""
    return re.sub(r"<!--.*?-->", "", html, flags=re.S)


def extract_scripts(html: str) -> str:
    """Concatène le contenu de tous les `<script>` inline (hors src=)."""
    parts = []
    for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html, flags=re.S | re.I):
        parts.append(m.group(1))
    return "\n".join(parts)


def audit_page(path: pathlib.Path) -> dict:
    raw = path.read_text(encoding="utf-8", errors="replace")
    html = strip_comments(raw)
    scripts = extract_scripts(html)

    # On cherche Supabase dans TOUT le HTML (inclut src + inline + attributes)
    sb_hits = []
    for p in SUPABASE_PATTERNS:
        for m in p.finditer(html):
            sb_hits.append(m.group(0))
    # On cherche fallback dans le contenu des <script> uniquement (plus précis)
    fb_hits = []
    for p in FALLBACK_PATTERNS:
        for m in p.finditer(scripts):
            fb_hits.append(m.group(0))

    soft_fb = bool(SOFT_FALLBACK_PATTERN.search(scripts))

    uses_supabase = bool(sb_hits)
    has_fallback = bool(fb_hits)

    findings = []
    if uses_supabase and not has_fallback:
        sev = "warning"
        if path.name in EXPECTED_PAGES:
            sev = "error"
        findings.append({
            "code": "NO-FALLBACK",
            "severity": sev,
            "detail": (
                f"Page utilise Supabase ({len(sb_hits)} appel(s) détecté(s)) "
                f"mais aucun fallback local (`LOCAL_CATALOG`, `FALLBACK_DATA`, …) "
                f"n'est déclaré dans les <script>. "
                + ("Catch() de récupération douce détecté." if soft_fb else "Aucun catch() de secours visible.")
            ),
        })
    return {
        "file": path.name,
        "uses_supabase": uses_supabase,
        "supabase_signatures": sorted(set(sb_hits))[:6],
        "has_fallback": has_fallback,
        "fallback_signatures": sorted(set(fb_hits))[:6],
        "soft_fallback_catch": soft_fb,
        "findings": findings,
    }


def render_markdown(results: list[dict]) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    pages = len(results)
    sb_pages = [r for r in results if r["uses_supabase"]]
    fb_pages = [r for r in results if r["has_fallback"]]
    alerts = [r for r in results if r["findings"]]
    errors = sum(1 for r in alerts if any(f["severity"] == "error" for f in r["findings"]))
    warns  = sum(1 for r in alerts if any(f["severity"] == "warning" for f in r["findings"]))

    lines = []
    lines.append(f"# Audit fallback Supabase — {now}")
    lines.append("")
    lines.append("Sonde MEMOIRE #49 — toute page qui consomme Supabase doit déclarer "
                 "un `LOCAL_CATALOG` / `FALLBACK_DATA` pour éviter une page vide en "
                 "cas de coupure ou de RLS bloquée.")
    lines.append("")
    lines.append("## Synthèse")
    lines.append("")
    lines.append(f"- Pages auditées : **{pages}**")
    lines.append(f"- Pages qui consomment Supabase : **{len(sb_pages)}**")
    lines.append(f"- Pages avec fallback explicite : **{len(fb_pages)}**")
    lines.append(f"- **Alertes** : **{len(alerts)}** "
                 f"({errors} erreur(s), {warns} warning(s))")
    lines.append("")

    if alerts:
        lines.append("## 🚨 Pages sans fallback")
        lines.append("")
        lines.append("| Page | Sévérité | Signatures Supabase | Catch de secours ? |")
        lines.append("|------|----------|---------------------|--------------------|")
        for r in sorted(alerts, key=lambda x: x["file"]):
            sev = "❌ erreur" if any(f["severity"] == "error" for f in r["findings"]) else "⚠️ warning"
            sigs = ", ".join(f"`{s}`" for s in r["supabase_signatures"]) or "—"
            soft = "oui" if r["soft_fallback_catch"] else "non"
            lines.append(f"| `{r['file']}` | {sev} | {sigs} | {soft} |")
        lines.append("")

    # Pages OK (Supabase + fallback)
    ok_pages = [r for r in results if r["uses_supabase"] and r["has_fallback"]]
    if ok_pages:
        lines.append("## ✅ Pages avec fallback (Supabase + LOCAL_CATALOG/FALLBACK)")
        lines.append("")
        for r in sorted(ok_pages, key=lambda x: x["file"]):
            sigs = ", ".join(f"`{s}`" for s in r["fallback_signatures"]) or ""
            lines.append(f"- `{r['file']}` — {sigs}")
        lines.append("")

    # Pages sans Supabase
    no_sb = [r for r in results if not r["uses_supabase"]]
    if no_sb:
        lines.append(f"## ℹ️ Pages sans consommation Supabase ({len(no_sb)})")
        lines.append("")
        lines.append("> Non concernées par la sonde — pas d'attente de fallback.")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    pages = list_pages()
    results = [audit_page(p) for p in pages]
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text(render_markdown(results), encoding="utf-8")

    alerts = [r for r in results if r["findings"]]
    report = {
        "audit": "fallback_supabase",
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "stats": {
            "pages_audited": len(results),
            "pages_using_supabase": sum(1 for r in results if r["uses_supabase"]),
            "pages_with_fallback": sum(1 for r in results if r["has_fallback"]),
            "pages_alerted": len(alerts),
            "total_findings": sum(len(r["findings"]) for r in results),
            "code_distribution": dict(Counter(f["code"] for r in results for f in r["findings"])),
        },
        "results": results,
    }
    OUT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    s = report["stats"]
    print(f"[audit_fallback_supabase] {s['pages_audited']} pages, "
          f"{s['pages_using_supabase']} avec Supabase, "
          f"{s['pages_with_fallback']} avec fallback, "
          f"{s['pages_alerted']} alertes")
    return 0 if not alerts else 1


if __name__ == "__main__":
    sys.exit(main())
