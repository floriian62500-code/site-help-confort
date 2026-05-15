#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #42 — Audit Leaflet map init.

Détecte les pages publiques contenant une initialisation Leaflet
(`L.map(` ou `new L.Map(`) et vérifie qu'au moins UNE garde anti-tuiles-grises
est présente après l'init :

  - `setTimeout(() => map.invalidateSize(), ...)` (ou variante avec
    nom de variable arbitraire et délai arbitraire)
  - `window.addEventListener('load', ...)` qui appelle `invalidateSize()`
  - `requestAnimationFrame(...)` suivi d'un `invalidateSize()`
  - `new ResizeObserver(...)` qui appelle `invalidateSize()`

Sans aucune de ces gardes → ALERTE *carte vide possible* :
un conteneur avec `aspect-ratio`, `display:none` initial, onglet caché,
ou layout retardé rend des tuiles grises tant que `invalidateSize()`
n'est pas explicitement appelé.

Référence : https://leafletjs.com/reference.html#map-invalidatesize

Sortie :
  admin-pro/audits/audit_leaflet_init_report.md
  admin-pro/audits/audit_leaflet_init_report.json

Usage :
  python3 admin-pro/audits/audit_leaflet_init.py

Zéro dépendance externe.
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_leaflet_init_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_leaflet_init_report.json"

PAGES_GLOB = "*.html"

# Pages exclues (admin / reset / templates)
EXCLUDE = {"reset.html"}

# Patterns de détection d'init Leaflet
INIT_RE = re.compile(r"""(?:L\.map\s*\(|new\s+L\.Map\s*\()""")

# Patterns de garde anti-tuiles-grises
GUARD_PATTERNS = [
    # setTimeout(..., invalidateSize(), ...)
    re.compile(r"setTimeout\s*\([^)]*invalidateSize\s*\(", re.DOTALL),
    re.compile(r"setTimeout\s*\([^{]*\{[^}]*invalidateSize\s*\(", re.DOTALL),
    # window.addEventListener('load', ...) avec invalidateSize quelque part dans le handler
    re.compile(
        r"""window\.addEventListener\s*\(\s*['"]load['"][^)]*\)""",
        re.DOTALL,
    ),
    # ResizeObserver / IntersectionObserver
    re.compile(r"new\s+ResizeObserver\s*\(", re.DOTALL),
    re.compile(r"new\s+IntersectionObserver\s*\(", re.DOTALL),
    # requestAnimationFrame(... invalidateSize ...)
    re.compile(r"requestAnimationFrame\s*\([^)]*invalidateSize", re.DOTALL),
]

# Garde "complète" : invalidateSize doit aussi être présent quelque part
INVALIDATE_RE = re.compile(r"\.invalidateSize\s*\(")


def scan_page(path: pathlib.Path) -> dict | None:
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None

    # On limite la détection au contenu <script> + inline (la balise reste
    # dans le HTML, regex globale OK pour cette sonde simple).
    init_matches = list(INIT_RE.finditer(html))
    if not init_matches:
        return None

    has_invalidate = bool(INVALIDATE_RE.search(html))
    guard_hits = []
    for pat in GUARD_PATTERNS:
        if pat.search(html):
            guard_hits.append(pat.pattern[:60].replace("\n", " "))

    # Une page est "safe" si :
    #   - elle appelle .invalidateSize() au moins une fois
    #   - ET au moins une garde (setTimeout / addEventListener load / ResizeObserver…)
    #     est présente
    safe = has_invalidate and len(guard_hits) > 0

    # Numéro de ligne approximatif de la 1re init
    line_no = html[: init_matches[0].start()].count("\n") + 1

    return {
        "page": path.name,
        "init_count": len(init_matches),
        "first_init_line": line_no,
        "has_invalidate_size": has_invalidate,
        "guards_found": guard_hits,
        "status": "ok" if safe else "ALERT",
    }


def main() -> int:
    pages = sorted(p for p in ROOT.glob(PAGES_GLOB) if p.is_file() and p.name not in EXCLUDE)
    entries = []
    pages_with_leaflet = 0
    for p in pages:
        e = scan_page(p)
        if e is not None:
            entries.append(e)
            pages_with_leaflet += 1

    alerts = [e for e in entries if e["status"] == "ALERT"]

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = []
    lines.append(f"# Audit Leaflet map init — {now}")
    lines.append("")
    lines.append(f"- **Pages scannées** : {len(pages)}")
    lines.append(f"- **Pages avec init Leaflet (`L.map(` / `new L.Map(`)** : {pages_with_leaflet}")
    lines.append(f"- **Pages avec garde anti-tuiles-grises** : {pages_with_leaflet - len(alerts)}")
    lines.append(f"- **Alertes (init sans garde)** : {len(alerts)}")
    lines.append("")
    lines.append(
        "> Un conteneur Leaflet avec `aspect-ratio`, `display:none` initial, "
        "onglet caché ou layout retardé rend des tuiles grises tant que "
        "`map.invalidateSize()` n'est pas explicitement appelé après le calcul "
        "du layout. Gardes acceptées : `setTimeout`, `window.addEventListener('load')`, "
        "`ResizeObserver`, `IntersectionObserver`, `requestAnimationFrame`."
    )
    lines.append("")

    if alerts:
        lines.append("## 🚨 Pages avec init Leaflet sans garde")
        lines.append("")
        lines.append("| Page | Init L.map | Ligne | invalidateSize() | Gardes |")
        lines.append("|------|-----------|-------|------------------|--------|")
        for e in alerts:
            guards = ", ".join(e["guards_found"]) if e["guards_found"] else "—"
            inv = "✓" if e["has_invalidate_size"] else "✗"
            lines.append(
                f"| `{e['page']}` | {e['init_count']} | {e['first_init_line']} | {inv} | {guards} |"
            )
        lines.append("")
    else:
        lines.append("## ✅ Aucune alerte")
        lines.append("")

    if pages_with_leaflet > 0:
        lines.append("## Détail (toutes pages Leaflet)")
        lines.append("")
        for e in entries:
            icon = "✅" if e["status"] == "ok" else "🚨"
            lines.append(
                f"- {icon} `{e['page']}` — {e['init_count']} init, "
                f"invalidateSize={'oui' if e['has_invalidate_size'] else 'non'}, "
                f"gardes={len(e['guards_found'])}"
            )
        lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "audit": "leaflet_init",
        "generated_at": now,
        "pages_scanned": len(pages),
        "pages_with_leaflet": pages_with_leaflet,
        "alerts_count": len(alerts),
        "alerts": alerts,
        "all_entries": entries,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"[audit_leaflet_init] {len(pages)} pages, "
        f"{pages_with_leaflet} avec Leaflet, {len(alerts)} alertes"
    )
    return 0 if not alerts else 1


if __name__ == "__main__":
    sys.exit(main())
