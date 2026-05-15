#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit couverture chatbot widget — Sonde #24 (MEMOIRE_IA_MAINTENANCE.md).

Vérifie que `assets/hc-widgets.js` (ou équivalent chatbot d'urgence) est bien
chargé sur chaque page publique racine. Bug historique : à la création de
nouvelles pages, le `<script src="assets/hc-widgets.js"></script>` est oublié
→ pas de chatbot, pas de bouton appel d'urgence.

Périmètre :
  - Pages publiques racine (`*.html` à la racine).
  - Exclus : `404.html`, `reset.html`, `test-*.html`, et tout sous-dossier admin.

Détection :
  - Présence d'un `<script>` qui charge `assets/hc-widgets.js` (ou
    `hc-widgets-loader.js` historique).
  - Sinon → ALERTE *WIDGET-MISSING*.

Sorties :
  - admin-pro/audits/audit_chatbot_widget_report.md
  - admin-pro/audits/audit_chatbot_widget_report.json
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_chatbot_widget_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_chatbot_widget_report.json"

# Pages exclues du périmètre (page d'erreur, page admin de reset, etc.)
EXCLUDED = {"404.html", "reset.html"}

# Patterns reconnus comme "le widget chatbot est chargé"
WIDGET_PATTERNS = [
    re.compile(r"""<script[^>]*\bsrc\s*=\s*["']?[^"'>]*?hc-widgets\.js""", re.I),
    re.compile(r"""<script[^>]*\bsrc\s*=\s*["']?[^"'>]*?hc-widgets-loader\.js""", re.I),
    re.compile(r"""<script[^>]*\bsrc\s*=\s*["']?[^"'>]*?hc-chat\b""", re.I),
]


def is_target(p: pathlib.Path) -> bool:
    if p.suffix.lower() != ".html":
        return False
    if p.name in EXCLUDED:
        return False
    if p.name.startswith("test-"):
        return False
    return True


def scan_page(p: pathlib.Path) -> dict:
    html = p.read_text(encoding="utf-8", errors="replace")
    found = None
    for pat in WIDGET_PATTERNS:
        m = pat.search(html)
        if m:
            found = m.group(0)[:120]
            break
    return {
        "file": p.name,
        "has_widget": bool(found),
        "match": found,
    }


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if is_target(p))

    findings = []
    ok_pages = []
    for p in pages:
        res = scan_page(p)
        if res["has_widget"]:
            ok_pages.append(res)
        else:
            findings.append(res)

    # Rapport markdown
    lines = []
    lines.append("# 🤖 Audit couverture chatbot widget — sonde #24")
    lines.append("")
    lines.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    lines.append("")
    lines.append(f"- Pages publiques scannées : **{len(pages)}**")
    lines.append(f"- Pages avec widget chargé : **{len(ok_pages)}**")
    lines.append(f"- Pages **sans widget** (alertes) : **{len(findings)}**")
    lines.append("")

    if findings:
        lines.append("## ❌ Pages sans `hc-widgets.js`")
        lines.append("")
        for r in findings:
            lines.append(f"- `{r['file']}` — aucun `<script src=...hc-widgets.js>` détecté")
        lines.append("")
        lines.append("→ Ajouter `<script src=\"assets/hc-widgets.js\" defer></script>` avant `</body>`.")
    else:
        lines.append("## ✅ Toutes les pages chargent le chatbot widget")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## ℹ️ Détail (pages OK)")
    lines.append("")
    for r in ok_pages:
        lines.append(f"- `{r['file']}` — `{r['match']}`")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    # Rapport JSON
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scanned": len(pages),
        "ok": len(ok_pages),
        "alerts": len(findings),
        "missing_files": [f["file"] for f in findings],
        "details": ok_pages + findings,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Scanned={len(pages)} OK={len(ok_pages)} ALERT={len(findings)}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
