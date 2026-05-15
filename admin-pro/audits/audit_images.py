#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HELP! Confort — Audit performance images
=========================================
Crawl `images/` + `og/` et liste tous les fichiers raster (PNG/JPG/JPEG/WEBP)
dont le poids dépasse 200 KB. Pour chaque image lourde, croise avec son usage
réel dans les pages HTML racine (grep `<img src="...">` + `background-image:`).

Règle (Sonde performance) :
  - WARN  : > 200 KB
  - ERROR : > 500 KB ET utilisée au-dessus du fold (hero / preload / og:image)
            ou utilisée sur ≥ 5 pages.

Sortie :
  - admin-pro/audits/audit_images_report.md
  - admin-pro/audits/audit_images_report.json

Usage :
  python3 admin-pro/audits/audit_images.py
"""
from __future__ import annotations
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_MD = Path(__file__).with_name("audit_images_report.md")
OUT_JSON = Path(__file__).with_name("audit_images_report.json")

# Seuils (en octets)
WARN_THRESHOLD = 200 * 1024   # 200 KB
ERROR_THRESHOLD = 500 * 1024  # 500 KB

# Dossiers d'images crawlés
IMG_DIRS = ["images", "og"]
# Extensions raster suivies
EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
# On exclut les backups
EXCLUDE_DIR_PARTS = {"_backup_png", "_backup", "node_modules", ".git"}

# Hints "above the fold"
ATF_HINTS = re.compile(
    r'<link[^>]+rel="preload"[^>]+as="image"|<link[^>]+rel="preload"[^>]+as=\'image\''
    r'|og:image|twitter:image|class="hero|loading="eager"',
    re.I,
)


def discover_images() -> list[Path]:
    found: list[Path] = []
    for d in IMG_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() not in EXTS:
                continue
            parts = set(p.parts)
            if parts & EXCLUDE_DIR_PARTS:
                continue
            found.append(p)
    return sorted(found)


def fmt_kb(n: int) -> str:
    return f"{n / 1024:.1f} KB"


def find_usage(rel_paths: list[str]) -> dict[str, list[str]]:
    """Pour chaque chemin relatif (depuis racine site, ex `images/foo.png`),
    cherche les fichiers HTML racine qui le référencent. Retourne dict
    {rel_path: [fichier1.html, fichier2.html, ...]}."""
    usage: dict[str, list[str]] = defaultdict(list)
    html_files = sorted(p for p in ROOT.glob("*.html"))

    # On compile un dict basename → list[rel_paths] pour matcher rapidement
    by_name: dict[str, list[str]] = defaultdict(list)
    for rp in rel_paths:
        by_name[Path(rp).name].append(rp)

    for html_file in html_files:
        try:
            content = html_file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for name, paths in by_name.items():
            if name in content:
                # Vérifier que c'est bien dans une URL d'image
                # (filtre rudimentaire pour éviter les faux positifs)
                for rp in paths:
                    if rp in content or name in content:
                        usage[rp].append(html_file.name)
                        break
    return usage


def is_above_fold(rel_path: str, usage: list[str]) -> bool:
    """Heuristique : image au-dessus du fold si présente dans <link rel=preload>,
    og:image, twitter:image, ou class="hero..." sur ≥ 1 page utilisatrice."""
    name = Path(rel_path).name
    for page in usage:
        try:
            content = (ROOT / page).read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        # Cherche bloc à 200 chars autour du nom
        for m in re.finditer(re.escape(name), content):
            start = max(0, m.start() - 200)
            end = min(len(content), m.end() + 100)
            snippet = content[start:end]
            if ATF_HINTS.search(snippet):
                return True
    return False


def main() -> int:
    images = discover_images()
    if not images:
        print("Aucune image trouvée dans images/ ou og/.")
        return 1

    # Calculer poids
    weighted: list[tuple[Path, int]] = []
    for p in images:
        try:
            sz = p.stat().st_size
        except Exception:
            continue
        weighted.append((p, sz))

    # Ne garder que les images > seuil WARN
    heavy = [(p, sz) for p, sz in weighted if sz > WARN_THRESHOLD]
    heavy.sort(key=lambda x: -x[1])

    rel_paths = [str(p.relative_to(ROOT)).replace("\\", "/") for p, _ in heavy]
    usage = find_usage(rel_paths)

    findings = []
    for p, sz in heavy:
        rp = str(p.relative_to(ROOT)).replace("\\", "/")
        usage_list = usage.get(rp, [])
        atf = is_above_fold(rp, usage_list) if usage_list else False
        n_pages = len(usage_list)

        severity = "warn"
        reasons: list[str] = []
        if sz > ERROR_THRESHOLD and (atf or n_pages >= 5):
            severity = "error"
            if atf:
                reasons.append("above-the-fold")
            if n_pages >= 5:
                reasons.append(f"utilisée sur {n_pages} pages")
        elif sz > ERROR_THRESHOLD:
            severity = "warn"
            reasons.append(f"poids élevé ({fmt_kb(sz)})")
        if not usage_list:
            reasons.append("non référencée (mort ?)")

        findings.append({
            "path": rp,
            "size_bytes": sz,
            "size_kb": round(sz / 1024, 1),
            "n_pages": n_pages,
            "pages": usage_list[:8],
            "atf": atf,
            "severity": severity,
            "reasons": reasons,
        })

    total_images = len(images)
    total_bytes = sum(sz for _, sz in weighted)
    n_warn = sum(1 for f in findings if f["severity"] == "warn")
    n_err  = sum(1 for f in findings if f["severity"] == "error")

    OUT_JSON.write_text(json.dumps({
        "version": 1,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "thresholds": {"warn_kb": 200, "error_kb": 500},
        "scanned_images": total_images,
        "total_size_bytes": total_bytes,
        "heavy_count": len(findings),
        "warnings": n_warn,
        "errors": n_err,
        "findings": findings,
    }, indent=2, ensure_ascii=False), encoding="utf-8")

    # Markdown
    lines = []
    lines.append(f"# Audit images perf — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append("> Sonde performance HELP! Confort — détecte les images > 200 KB et")
    lines.append("> alerte si elles sont au-dessus du fold ou utilisées sur ≥ 5 pages.")
    lines.append("> Lancement : `python3 admin-pro/audits/audit_images.py`")
    lines.append("")
    lines.append("## Synthèse")
    lines.append("")
    lines.append(f"- Images scannées : **{total_images}** ({fmt_kb(total_bytes)} total)")
    lines.append(f"- Images > 200 KB : **{len(findings)}**")
    lines.append(f"- Erreurs (>500 KB + ATF/5+ pages) : **{n_err}**")
    lines.append(f"- Warnings : **{n_warn}**")
    lines.append("")

    if not findings:
        lines.append("✅ Aucune image au-dessus du seuil. RAS.")
        OUT_MD.write_text("\n".join(lines), encoding="utf-8")
        print(f"OK · {total_images} images · 0 alerte")
        print(f"Rapport : {OUT_MD.relative_to(ROOT)}")
        return 0

    lines.append("## Détail (par poids décroissant)")
    lines.append("")
    lines.append("| Sévérité | Fichier | Poids | Pages | ATF | Raisons |")
    lines.append("|----------|---------|-------|-------|-----|---------|")
    for f in findings:
        sev_icon = "❌" if f["severity"] == "error" else "⚠️"
        atf_icon = "✅" if f["atf"] else "—"
        reasons = ", ".join(f["reasons"]) or "—"
        pages_str = (
            f"{f['n_pages']} (`{'`, `'.join(f['pages'][:3])}`{'…' if f['n_pages']>3 else ''})"
            if f["n_pages"] else "0"
        )
        lines.append(f"| {sev_icon} | `{f['path']}` | {f['size_kb']} KB | {pages_str} | {atf_icon} | {reasons} |")
    lines.append("")

    # Recommandations
    lines.append("## Recommandations")
    lines.append("")
    lines.append("- Convertir les PNG > 200 KB en WebP via `cwebp` (gain 60-80%).")
    lines.append("- Pour les hero ATF, viser < 150 KB (WebP qualité 75).")
    lines.append("- Images non référencées : à supprimer si vraiment inutilisées.")
    lines.append("")
    lines.append("_Sonde IMG-PERF-V1 — à intégrer au scan quotidien._")

    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"OK · {total_images} images · {len(findings)} > 200 KB · err={n_err}/warn={n_warn}")
    print(f"Rapport : {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
