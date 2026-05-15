#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sonde #62 — Vérification que les icônes déclarées existent sur le disque.

Pour chaque page publique racine, on extrait :
  - <link rel="icon" href="...">
  - <link rel="shortcut icon" href="...">
  - <link rel="apple-touch-icon" href="...">
  - <link rel="manifest" href="...">       (bonus : pointe vers manifest.json)
  - <meta name="msapplication-TileImage" content="...">

Chaque href / content est résolu en chemin sur disque (relatif racine repo).
Si le fichier n'existe pas → ALERTE *icon-404*.
Les URL externes (http(s)://) sont ignorées (ne peut pas tester sans réseau ;
elles sont normalement déjà couvertes par audit_liens_externes).

Sortie :
  admin-pro/audits/audit_favicons_report.md
  admin-pro/audits/audit_favicons_report.json

Usage :
  python3 admin-pro/audits/audit_favicons.py
"""
from __future__ import annotations
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_favicons_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_favicons_report.json"

PAGES_GLOB = "*.html"

# (label, regex extracting the URL/path)
TARGETS = [
    ("icon",            re.compile(r'<link[^>]+rel\s*=\s*["\']icon["\'][^>]*?\bhref\s*=\s*["\']([^"\']+)["\']', re.I)),
    ("shortcut-icon",   re.compile(r'<link[^>]+rel\s*=\s*["\']shortcut\s+icon["\'][^>]*?\bhref\s*=\s*["\']([^"\']+)["\']', re.I)),
    ("apple-touch-icon",re.compile(r'<link[^>]+rel\s*=\s*["\']apple-touch-icon["\'][^>]*?\bhref\s*=\s*["\']([^"\']+)["\']', re.I)),
    ("manifest",        re.compile(r'<link[^>]+rel\s*=\s*["\']manifest["\'][^>]*?\bhref\s*=\s*["\']([^"\']+)["\']', re.I)),
    ("ms-tile",         re.compile(r'<meta[^>]+name\s*=\s*["\']msapplication-TileImage["\'][^>]*?\bcontent\s*=\s*["\']([^"\']+)["\']', re.I)),
]

# Pages à exclure du scan (admin, tests…)
EXCLUDE = {"reset.html"}


def is_external(url: str) -> bool:
    u = url.strip().lower()
    return u.startswith("http://") or u.startswith("https://") or u.startswith("//") or u.startswith("data:")


def resolve(url: str) -> pathlib.Path:
    """Résout une URL relative en chemin sur disque (sous ROOT)."""
    u = url.strip()
    # query / fragment
    u = u.split("?", 1)[0].split("#", 1)[0]
    if u.startswith("/"):
        u = u.lstrip("/")
    return ROOT / u


def scan_page(path: pathlib.Path) -> list[dict]:
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return []
    findings = []
    seen = set()
    for label, pat in TARGETS:
        for m in pat.finditer(html):
            url = m.group(1).strip()
            key = (label, url)
            if key in seen:
                continue
            seen.add(key)
            entry = {
                "page": path.name,
                "kind": label,
                "url": url,
                "external": is_external(url),
                "status": "ok",
                "resolved": None,
            }
            if entry["external"]:
                entry["status"] = "external-skipped"
            else:
                rp = resolve(url)
                entry["resolved"] = str(rp.relative_to(ROOT)) if rp.is_relative_to(ROOT) else str(rp)
                if not rp.exists():
                    entry["status"] = "MISSING"
                elif rp.is_dir():
                    entry["status"] = "MISSING (is-dir)"
            findings.append(entry)
    return findings


def main() -> int:
    pages = sorted(p for p in ROOT.glob(PAGES_GLOB) if p.is_file() and p.name not in EXCLUDE)
    all_findings = []
    by_page = defaultdict(list)
    counter = Counter()
    for p in pages:
        items = scan_page(p)
        all_findings.extend(items)
        by_page[p.name] = items
        for it in items:
            counter[it["status"]] += 1

    missing = [f for f in all_findings if f["status"].startswith("MISSING")]
    pages_with_alert = sorted({f["page"] for f in missing})

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = []
    lines.append(f"# Audit favicons / apple-touch-icon / manifest — {now}")
    lines.append("")
    lines.append(f"- **Pages scannées** : {len(pages)}")
    lines.append(f"- **Références d'icônes trouvées** : {len(all_findings)}")
    lines.append(f"- **Manquantes sur disque** : {len(missing)}")
    lines.append(f"- **Externes (non testées)** : {counter.get('external-skipped', 0)}")
    lines.append(f"- **OK** : {counter.get('ok', 0)}")
    lines.append("")
    if missing:
        lines.append("## 🚨 Icônes manquantes")
        lines.append("")
        lines.append("| Page | Type | URL déclarée | Résolu | Statut |")
        lines.append("|------|------|--------------|--------|--------|")
        for f in missing:
            lines.append(f"| `{f['page']}` | {f['kind']} | `{f['url']}` | `{f.get('resolved','')}` | **{f['status']}** |")
        lines.append("")
    else:
        lines.append("## ✅ Aucune icône orpheline détectée")
        lines.append("")

    # Récap par type
    by_kind = Counter(f["kind"] for f in all_findings)
    lines.append("## Récap par type")
    lines.append("")
    for k, v in sorted(by_kind.items()):
        miss = sum(1 for f in all_findings if f["kind"] == k and f["status"].startswith("MISSING"))
        lines.append(f"- **{k}** : {v} déclarations ({miss} manquantes)")
    lines.append("")

    # Liste des pages alertées
    if pages_with_alert:
        lines.append("## Pages concernées")
        lines.append("")
        for p in pages_with_alert:
            lines.append(f"- `{p}`")
        lines.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "generated_at": now,
        "pages_scanned": len(pages),
        "total_references": len(all_findings),
        "missing": len(missing),
        "external_skipped": counter.get("external-skipped", 0),
        "ok": counter.get("ok", 0),
        "alerts": missing,
        "by_kind": dict(by_kind),
        "pages_with_alert": pages_with_alert,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[audit_favicons] {len(pages)} pages, {len(all_findings)} refs, {len(missing)} manquantes")
    return 0 if not missing else 1


if __name__ == "__main__":
    sys.exit(main())
