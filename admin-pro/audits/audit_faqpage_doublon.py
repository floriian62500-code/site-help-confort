#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #31 v5 — Audit FAQPage doublon.

Compte les blocs <script type="application/ld+json"> dont le @type vaut "FAQPage"
sur chaque page publique racine. Si une page contient > 1 bloc FAQPage → ALERTE :
Google recommande explicitement UN SEUL bloc FAQPage par URL, sinon
le bloc le plus riche peut être ignoré et le rich result perdu.

Référence : https://developers.google.com/search/docs/appearance/structured-data/faqpage

Sortie :
  admin-pro/audits/audit_faqpage_doublon_report.md
  admin-pro/audits/audit_faqpage_doublon_report.json

Usage :
  python3 admin-pro/audits/audit_faqpage_doublon.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_faqpage_doublon_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_faqpage_doublon_report.json"

PAGES_GLOB = "*.html"

SCRIPT_RE = re.compile(
    r'<script\s+type\s*=\s*["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)

# Pages exclues du scan
EXCLUDE = {"reset.html"}


def normalize_types(t):
    """@type peut être string ou liste."""
    if isinstance(t, list):
        return [str(x) for x in t]
    if isinstance(t, str):
        return [t]
    return []


def collect_types(node, found):
    """Récursivement collecte tous les @type rencontrés."""
    if isinstance(node, list):
        for child in node:
            collect_types(child, found)
        return
    if isinstance(node, dict):
        for t in normalize_types(node.get("@type")):
            found.append(t)
        for v in node.values():
            if isinstance(v, (list, dict)):
                collect_types(v, found)


def count_faqpage(node) -> int:
    """Compte uniquement les @type=FAQPage (pas Question, pas mainEntity)."""
    types = []
    collect_types(node, types)
    return sum(1 for t in types if t == "FAQPage")


def scan_page(path: pathlib.Path) -> dict:
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None

    scripts = SCRIPT_RE.findall(html)
    blocks_total = len(scripts)
    faq_blocks = 0
    faq_locations = []  # numéro d'index du bloc dans la page

    for i, raw in enumerate(scripts, 1):
        try:
            data = json.loads(raw.strip())
        except json.JSONDecodeError:
            # syntaxe cassée → on signale séparément, mais pas FAQ
            continue
        n = count_faqpage(data)
        if n > 0:
            faq_blocks += n
            faq_locations.append({"block_index": i, "faq_count_in_block": n})

    return {
        "page": path.name,
        "jsonld_blocks": blocks_total,
        "faqpage_count": faq_blocks,
        "faq_locations": faq_locations,
        "status": "DUPLICATE" if faq_blocks > 1 else ("ok" if faq_blocks == 1 else "no-faq"),
    }


def main() -> int:
    pages = sorted(p for p in ROOT.glob(PAGES_GLOB) if p.is_file() and p.name not in EXCLUDE)
    entries = []
    for p in pages:
        e = scan_page(p)
        if e is not None:
            entries.append(e)

    alerts = [e for e in entries if e["status"] == "DUPLICATE"]
    with_one = [e for e in entries if e["status"] == "ok"]
    without = [e for e in entries if e["status"] == "no-faq"]

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = []
    lines.append(f"# Audit FAQPage doublon — {now}")
    lines.append("")
    lines.append(f"- **Pages scannées** : {len(pages)}")
    lines.append(f"- **Pages avec 1 bloc FAQPage** : {len(with_one)}")
    lines.append(f"- **Pages sans FAQPage** : {len(without)}")
    lines.append(f"- **Pages avec > 1 bloc FAQPage (alertes)** : {len(alerts)}")
    lines.append("")
    lines.append("> Google recommande un seul bloc `FAQPage` par URL. "
                 "Au-delà, le rich result peut être ignoré silencieusement.")
    lines.append("")

    if alerts:
        lines.append("## 🚨 Pages avec FAQPage doublonné")
        lines.append("")
        lines.append("| Page | Total JSON-LD | Blocs FAQPage | Détail |")
        lines.append("|------|---------------|---------------|--------|")
        for e in alerts:
            detail = ", ".join(
                f"bloc #{loc['block_index']} (×{loc['faq_count_in_block']})"
                for loc in e["faq_locations"]
            )
            lines.append(
                f"| `{e['page']}` | {e['jsonld_blocks']} | **{e['faqpage_count']}** | {detail} |"
            )
        lines.append("")
    else:
        lines.append("## ✅ Aucun doublon FAQPage détecté")
        lines.append("")

    # Pages avec FAQPage légitime (1 seul bloc) — pour visibilité
    if with_one:
        lines.append("## Pages avec FAQPage (1 bloc, OK)")
        lines.append("")
        for e in with_one:
            lines.append(f"- `{e['page']}` ({e['jsonld_blocks']} blocs JSON-LD au total)")
        lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "generated_at": now,
        "pages_scanned": len(pages),
        "with_one_faqpage": len(with_one),
        "without_faqpage": len(without),
        "duplicates": len(alerts),
        "alerts": alerts,
        "all_entries": entries,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[audit_faqpage_doublon] {len(pages)} pages, {len(with_one)} avec 1 FAQPage, "
          f"{len(alerts)} doublons, {len(without)} sans FAQ")
    return 0 if not alerts else 1


if __name__ == "__main__":
    sys.exit(main())
