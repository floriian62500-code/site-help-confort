#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit CLS prevention — Sonde #56 (MEMOIRE_IA_MAINTENANCE.md).

Chaque `<img>` doit avoir `width` ET `height` attributs explicites pour éviter
les CLS (Cumulative Layout Shift) au chargement. Sans dimensions, le
navigateur reflows le layout pendant le téléchargement de l'image → mauvais
score Lighthouse + UX dégradée.

Tolérances :
  - `<img>` dans une balise `<picture>` qui contient `<source>` (responsive)
    avec attributs `width`/`height` → toléré.
  - `<img>` SVG inline (`<svg>` direct) → hors périmètre.
  - `<img src="data:...">` (base64) → considéré comme décoratif/petit, hors
    périmètre.

Périmètre : `*.html` racine, hors `404.html`, `reset.html`, `test-*`.

Sorties :
  - admin-pro/audits/audit_cls_prevention_report.md
  - admin-pro/audits/audit_cls_prevention_report.json
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_cls_prevention_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_cls_prevention_report.json"

EXCLUDED = {"404.html", "reset.html"}

# Match toute balise <img ...> y compris multi-ligne
IMG_RE = re.compile(r"<img\b([^>]*?)/?>", re.I | re.S)
ATTR_RE = re.compile(r"""([a-zA-Z][-a-zA-Z0-9_:]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))""")


def parse_attrs(raw: str) -> dict:
    """Parse les attributs d'une balise HTML en dict."""
    out = {}
    for m in ATTR_RE.finditer(raw):
        k = m.group(1).lower()
        v = m.group(2) if m.group(2) is not None else (m.group(3) if m.group(3) is not None else (m.group(4) or ""))
        out[k] = v
    return out


def line_of(html: str, start: int) -> int:
    return html.count("\n", 0, start) + 1


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
    findings = []
    ok_count = 0
    for m in IMG_RE.finditer(html):
        attrs = parse_attrs(m.group(1))
        src = attrs.get("src", "").strip()
        # Skip data: URIs (décoratif)
        if src.startswith("data:"):
            continue
        # Skip aria-hidden (décoratif)
        if attrs.get("aria-hidden", "").lower() == "true":
            continue
        has_w = "width" in attrs and attrs["width"].strip() != ""
        has_h = "height" in attrs and attrs["height"].strip() != ""
        if has_w and has_h:
            ok_count += 1
            continue
        # Manque au moins une dimension
        findings.append({
            "line": line_of(html, m.start()),
            "src": src[:80] if src else "(no src)",
            "missing": [d for d, present in (("width", has_w), ("height", has_h)) if not present],
            "snippet": m.group(0)[:160],
        })
    return {
        "file": p.name,
        "imgs_total": ok_count + len(findings),
        "imgs_ok": ok_count,
        "findings": findings,
    }


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if is_target(p))

    results = [scan_page(p) for p in pages]
    total_imgs = sum(r["imgs_total"] for r in results)
    total_ok = sum(r["imgs_ok"] for r in results)
    total_alerts = sum(len(r["findings"]) for r in results)
    pages_with_findings = [r for r in results if r["findings"]]

    # Rapport markdown
    lines = []
    lines.append("# 📐 Audit CLS prevention (img width/height) — sonde #56")
    lines.append("")
    lines.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    lines.append("")
    lines.append(f"- Pages scannées : **{len(pages)}**")
    lines.append(f"- `<img>` total : **{total_imgs}**")
    lines.append(f"- `<img>` avec width+height : **{total_ok}**")
    lines.append(f"- `<img>` **sans dimensions** (alertes CLS) : **{total_alerts}**")
    lines.append(f"- Pages avec au moins 1 alerte : **{len(pages_with_findings)}**")
    lines.append("")
    if total_imgs > 0:
        pct = 100.0 * total_ok / total_imgs
        lines.append(f"Taux de couverture dimensions : **{pct:.1f}%**")
        lines.append("")

    if pages_with_findings:
        lines.append("## ⚠️ Pages avec `<img>` sans width/height")
        lines.append("")
        for r in pages_with_findings:
            lines.append(f"### `{r['file']}` — {len(r['findings'])} `<img>` à corriger")
            lines.append("")
            for f in r["findings"][:25]:  # cap à 25 par page pour lisibilité
                miss = "+".join(f["missing"])
                lines.append(f"- L{f['line']} ({miss} manquant) — `{f['src']}`")
            if len(r["findings"]) > 25:
                lines.append(f"- … et {len(r['findings']) - 25} autres")
            lines.append("")
    else:
        lines.append("## ✅ Aucune `<img>` sans width/height détectée")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("Recommandation : pour chaque `<img>` flaggué, lire les vraies dimensions du fichier (PIL) et ajouter `width=\"X\" height=\"Y\"`.")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    # Rapport JSON
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scanned": len(pages),
        "imgs_total": total_imgs,
        "imgs_ok": total_ok,
        "alerts": total_alerts,
        "pages_with_findings": len(pages_with_findings),
        "by_page": [
            {"file": r["file"], "alerts": len(r["findings"]), "imgs_total": r["imgs_total"]}
            for r in results if r["findings"]
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Pages={len(pages)} imgs={total_imgs} ok={total_ok} alerts={total_alerts}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    return 0 if total_alerts == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
