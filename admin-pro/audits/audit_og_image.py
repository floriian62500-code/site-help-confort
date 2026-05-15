#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #45 — Audit Open Graph image disk-check.

Pour chaque page publique racine, on vérifie :
  (a) présence d'un <meta property="og:image" content="...">
  (b) le fichier référencé existe sur disque (URL relative)
  (c) dimensions PIL = 1200×630 ±5% (recommandation Facebook / LinkedIn / Twitter)
  (d) cohérence avec <meta property="og:image:width"> / "og:image:height" si présents
  (e) bonus : présence de <meta name="twitter:image">

Sortie :
  admin-pro/audits/audit_og_image_report.md
  admin-pro/audits/audit_og_image_report.json

Pré-requis : Pillow (sinon les checks (c)+(d) sont skip avec mention dans le rapport).
URL externes (http(s)://) → status="external-skipped".

Usage :
  python3 admin-pro/audits/audit_og_image.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

try:
    from PIL import Image
    PIL_OK = True
except ImportError:
    PIL_OK = False

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_og_image_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_og_image_report.json"

PAGES_GLOB = "*.html"

# Cibles attendues
TARGET_W = 1200
TARGET_H = 630
TOLERANCE = 0.05   # ±5%

# Pages exclues du scan (admin, reset, 404…)
EXCLUDE = {"reset.html", "404.html"}

# Extraction OG / Twitter image
RE_OG_IMG    = re.compile(r'<meta[^>]+property\s*=\s*["\']og:image["\'][^>]*?\bcontent\s*=\s*["\']([^"\']+)["\']', re.I)
RE_OG_W      = re.compile(r'<meta[^>]+property\s*=\s*["\']og:image:width["\'][^>]*?\bcontent\s*=\s*["\']([^"\']+)["\']', re.I)
RE_OG_H      = re.compile(r'<meta[^>]+property\s*=\s*["\']og:image:height["\'][^>]*?\bcontent\s*=\s*["\']([^"\']+)["\']', re.I)
RE_TW_IMG    = re.compile(r'<meta[^>]+name\s*=\s*["\']twitter:image["\'][^>]*?\bcontent\s*=\s*["\']([^"\']+)["\']', re.I)


def is_external(url: str) -> bool:
    u = url.strip().lower()
    return u.startswith("http://") or u.startswith("https://") or u.startswith("//") or u.startswith("data:")


def resolve(url: str) -> pathlib.Path:
    u = url.strip().split("?", 1)[0].split("#", 1)[0]
    if u.startswith("/"):
        u = u.lstrip("/")
    return ROOT / u


def parse_int(s: str | None) -> int | None:
    if s is None:
        return None
    try:
        return int(str(s).strip())
    except (TypeError, ValueError):
        return None


def scan_page(path: pathlib.Path) -> dict:
    """Retourne un dict {page, og_url, twitter_url, og_w_declared, og_h_declared,
       resolved, image_w, image_h, status, alerts}."""
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None

    og_match = RE_OG_IMG.search(html)
    tw_match = RE_TW_IMG.search(html)
    og_w     = parse_int(RE_OG_W.search(html).group(1)) if RE_OG_W.search(html) else None
    og_h     = parse_int(RE_OG_H.search(html).group(1)) if RE_OG_H.search(html) else None

    entry = {
        "page": path.name,
        "og_url": og_match.group(1).strip() if og_match else None,
        "twitter_url": tw_match.group(1).strip() if tw_match else None,
        "og_w_declared": og_w,
        "og_h_declared": og_h,
        "external": False,
        "resolved": None,
        "image_w": None,
        "image_h": None,
        "status": "ok",
        "alerts": [],
    }

    if not og_match:
        entry["status"] = "MISSING-OG-IMAGE"
        entry["alerts"].append("Pas de <meta property=\"og:image\"> sur la page")
        return entry

    url = entry["og_url"]
    if is_external(url):
        entry["external"] = True
        entry["status"] = "external-skipped"
        return entry

    rp = resolve(url)
    entry["resolved"] = str(rp.relative_to(ROOT)) if rp.is_relative_to(ROOT) else str(rp)

    if not rp.exists():
        entry["status"] = "MISSING-FILE"
        entry["alerts"].append(f"Fichier référencé absent sur disque : {entry['resolved']}")
        return entry
    if rp.is_dir():
        entry["status"] = "MISSING-FILE (is-dir)"
        entry["alerts"].append(f"URL pointe vers un dossier : {entry['resolved']}")
        return entry

    # Dimensions PIL
    if PIL_OK:
        try:
            with Image.open(rp) as img:
                entry["image_w"], entry["image_h"] = img.size
        except Exception as e:
            entry["status"] = "PIL-ERROR"
            entry["alerts"].append(f"Impossible de lire l'image avec PIL : {e}")
            return entry

        w, h = entry["image_w"], entry["image_h"]
        # tolérance ±5%
        w_ok = abs(w - TARGET_W) / TARGET_W <= TOLERANCE
        h_ok = abs(h - TARGET_H) / TARGET_H <= TOLERANCE
        if not (w_ok and h_ok):
            entry["status"] = "WRONG-SIZE"
            entry["alerts"].append(
                f"Dimensions {w}×{h} hors tolérance ±5% (attendu {TARGET_W}×{TARGET_H})"
            )

        # Cohérence avec og:image:width / og:image:height déclarés
        if og_w is not None and og_w != w:
            entry["alerts"].append(
                f"og:image:width déclaré ({og_w}) ≠ dimensions réelles ({w})"
            )
            if entry["status"] == "ok":
                entry["status"] = "META-MISMATCH"
        if og_h is not None and og_h != h:
            entry["alerts"].append(
                f"og:image:height déclaré ({og_h}) ≠ dimensions réelles ({h})"
            )
            if entry["status"] == "ok":
                entry["status"] = "META-MISMATCH"
    else:
        entry["status"] = "PIL-MISSING"
        entry["alerts"].append("Pillow non installé — dimensions non vérifiées")

    # Bonus : twitter:image absent ?
    if not tw_match:
        entry["alerts"].append("Bonus : <meta name=\"twitter:image\"> absent (recommandé)")

    return entry


def main() -> int:
    pages = sorted(p for p in ROOT.glob(PAGES_GLOB) if p.is_file() and p.name not in EXCLUDE)
    all_entries = []
    for p in pages:
        e = scan_page(p)
        if e is not None:
            all_entries.append(e)

    bad_status = {"MISSING-OG-IMAGE", "MISSING-FILE", "MISSING-FILE (is-dir)",
                  "WRONG-SIZE", "META-MISMATCH", "PIL-ERROR"}
    alerts = [e for e in all_entries if e["status"] in bad_status]
    ok     = [e for e in all_entries if e["status"] == "ok"]
    external = [e for e in all_entries if e["status"] == "external-skipped"]

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = []
    lines.append(f"# Audit Open Graph images — {now}")
    lines.append("")
    lines.append(f"- **Pages scannées** : {len(pages)}")
    lines.append(f"- **Pages avec og:image OK** : {len(ok)}")
    lines.append(f"- **Pages alertées** : {len(alerts)}")
    lines.append(f"- **OG image externe (non testée)** : {len(external)}")
    lines.append(f"- **Pillow disponible** : {'oui' if PIL_OK else 'NON — checks dimensions désactivés'}")
    lines.append(f"- **Cible** : {TARGET_W}×{TARGET_H} px ±{int(TOLERANCE*100)}%")
    lines.append("")

    if alerts:
        lines.append("## 🚨 Alertes")
        lines.append("")
        lines.append("| Page | Statut | URL | Dimensions | Détail |")
        lines.append("|------|--------|-----|------------|--------|")
        for e in alerts:
            dims = f"{e['image_w']}×{e['image_h']}" if e["image_w"] else "—"
            detail = "<br>".join(e["alerts"]) if e["alerts"] else ""
            url = e["og_url"] or "(absent)"
            lines.append(f"| `{e['page']}` | **{e['status']}** | `{url}` | {dims} | {detail} |")
        lines.append("")
    else:
        lines.append("## ✅ Aucune alerte OG image")
        lines.append("")

    # Récap statuts
    counter = Counter(e["status"] for e in all_entries)
    lines.append("## Récap par statut")
    lines.append("")
    for st, n in sorted(counter.items(), key=lambda kv: (-kv[1], kv[0])):
        lines.append(f"- **{st}** : {n}")
    lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "generated_at": now,
        "pages_scanned": len(pages),
        "ok": len(ok),
        "alerts": len(alerts),
        "external_skipped": len(external),
        "pil_available": PIL_OK,
        "target_width": TARGET_W,
        "target_height": TARGET_H,
        "tolerance_pct": int(TOLERANCE * 100),
        "by_status": dict(counter),
        "entries": all_entries,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[audit_og_image] {len(pages)} pages, {len(ok)} OK, {len(alerts)} alertes, {len(external)} externes")
    return 0 if not alerts else 1


if __name__ == "__main__":
    sys.exit(main())
