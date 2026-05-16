#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit dimensions images — sonde P15 (extension d'`audit_cls_prevention.py`).

Pour chaque `<img>` sans `width` ET/OU `height`, on essaie de résoudre le
fichier source sur disque (chemin relatif `images/...` ou absolu `/images/...`)
et on lit les vraies dimensions avec PIL (Pillow). Le rapport propose alors
le patch HTML correct à coller dans le code source.

Décision Florian sur application masse (le script ne modifie rien).

Tolérances (alignées sur `audit_cls_prevention.py`) :
  - `<img src="data:...">` → skip (décoratif/petit)
  - `<img aria-hidden="true">` → skip (décoratif)
  - `<img>` avec src externe (http://, https://) → noté mais pas patché
  - `<img>` dynamique (src=${...} ou src="${...}") → skip (template)

Sorties :
  - admin-pro/audits/audit_image_dimensions_report.md
  - admin-pro/audits/audit_image_dimensions_report.json
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_image_dimensions_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_image_dimensions_report.json"

EXCLUDED = {"404.html", "reset.html"}

try:
    from PIL import Image  # type: ignore
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

# Reprend les patterns de audit_cls_prevention.py
IMG_RE = re.compile(r"<img\b([^>]*?)/?>", re.I | re.S)
ATTR_RE = re.compile(
    r"""([a-zA-Z][-a-zA-Z0-9_:]*)\s*=\s*"""
    r"""(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))"""
)


def parse_attrs(raw: str) -> dict:
    out = {}
    for m in ATTR_RE.finditer(raw):
        k = m.group(1).lower()
        v = (
            m.group(2)
            if m.group(2) is not None
            else (m.group(3) if m.group(3) is not None else (m.group(4) or ""))
        )
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


def resolve_local_path(src: str) -> pathlib.Path | None:
    """Tente de résoudre `src` vers un fichier local du projet.
    Retourne None si externe, data: URI, ou template dynamique."""
    if not src:
        return None
    s = src.strip()
    if s.startswith("data:"):
        return None
    if s.startswith("http://") or s.startswith("https://"):
        return None
    # Templates JS : src="${url}" ou src="`${...}`"
    if "${" in s or "{{" in s:
        return None
    # Strip query/fragment
    s = s.split("?", 1)[0].split("#", 1)[0]
    # Strip leading slash → racine projet
    if s.startswith("/"):
        s = s[1:]
    # Strip leading ./ ou ../
    while s.startswith("./"):
        s = s[2:]
    candidate = (ROOT / s).resolve()
    try:
        # Sécurité : doit rester sous ROOT
        candidate.relative_to(ROOT)
    except ValueError:
        return None
    if not candidate.exists() or not candidate.is_file():
        return None
    return candidate


def read_dimensions(p: pathlib.Path):
    """Retourne (width, height) du fichier image, ou (None, None) si echec."""
    if not HAS_PIL:
        return None, None
    try:
        with Image.open(p) as img:
            return img.width, img.height
    except Exception:
        return None, None


def build_patch(snippet: str, w: int, h: int) -> str:
    """Construit la version patchée du snippet <img ...> avec width+height
    ajoutés au bon endroit (après src=)."""
    # Si déjà width/height (partiel), on remplace
    out = snippet
    if re.search(r'\bwidth\s*=', out, re.I):
        out = re.sub(r'\bwidth\s*=\s*"[^"]*"', f'width="{w}"', out, count=1, flags=re.I)
        out = re.sub(r"\bwidth\s*=\s*'[^']*'", f'width="{w}"', out, count=1, flags=re.I)
    else:
        out = re.sub(
            r'(<img\b)',
            f'\\1 width="{w}"',
            out,
            count=1,
            flags=re.I,
        )
    if re.search(r'\bheight\s*=', out, re.I):
        out = re.sub(r'\bheight\s*=\s*"[^"]*"', f'height="{h}"', out, count=1, flags=re.I)
        out = re.sub(r"\bheight\s*=\s*'[^']*'", f'height="{h}"', out, count=1, flags=re.I)
    else:
        # Ajoute height après width
        out = re.sub(
            r'(\bwidth="[^"]*")',
            f'\\1 height="{h}"',
            out,
            count=1,
        )
    return out


def scan_page(p: pathlib.Path) -> dict:
    html = p.read_text(encoding="utf-8", errors="replace")
    findings_patchable = []  # avec dimensions lues
    findings_external = []   # src externe → impossible à patcher
    findings_unresolved = [] # src local mais fichier introuvable
    findings_dynamic = []    # src template
    ok_count = 0
    skipped = 0

    for m in IMG_RE.finditer(html):
        attrs = parse_attrs(m.group(1))
        src = attrs.get("src", "").strip()
        if src.startswith("data:"):
            skipped += 1
            continue
        if attrs.get("aria-hidden", "").lower() == "true":
            skipped += 1
            continue
        has_w = "width" in attrs and attrs["width"].strip() != ""
        has_h = "height" in attrs and attrs["height"].strip() != ""
        if has_w and has_h:
            ok_count += 1
            continue

        missing = [d for d, present in (("width", has_w), ("height", has_h)) if not present]
        line = line_of(html, m.start())
        snippet = m.group(0)[:200]

        # Catégoriser le src
        if not src:
            findings_unresolved.append({
                "line": line, "src": "(empty)", "missing": missing,
                "snippet": snippet, "reason": "src vide",
            })
            continue
        if "${" in src or "{{" in src:
            findings_dynamic.append({
                "line": line, "src": src[:120], "missing": missing,
                "snippet": snippet,
            })
            continue
        if src.startswith("http://") or src.startswith("https://"):
            findings_external.append({
                "line": line, "src": src[:120], "missing": missing,
                "snippet": snippet,
            })
            continue

        local = resolve_local_path(src)
        if local is None:
            findings_unresolved.append({
                "line": line, "src": src[:120], "missing": missing,
                "snippet": snippet, "reason": "fichier introuvable sur disque",
            })
            continue

        w, h = read_dimensions(local)
        if w is None:
            findings_unresolved.append({
                "line": line, "src": src[:120], "missing": missing,
                "snippet": snippet,
                "reason": "PIL n'a pas pu lire les dimensions" if HAS_PIL else "PIL non installé",
            })
            continue

        findings_patchable.append({
            "line": line,
            "src": src[:120],
            "missing": missing,
            "real_width": w,
            "real_height": h,
            "snippet": snippet,
            "patch": build_patch(snippet, w, h),
        })

    return {
        "file": p.name,
        "imgs_ok": ok_count,
        "imgs_skipped": skipped,
        "patchable": findings_patchable,
        "external": findings_external,
        "unresolved": findings_unresolved,
        "dynamic": findings_dynamic,
    }


def main() -> int:
    pages = sorted(p for p in ROOT.glob("*.html") if is_target(p))
    results = [scan_page(p) for p in pages]

    total_patchable = sum(len(r["patchable"]) for r in results)
    total_external = sum(len(r["external"]) for r in results)
    total_unresolved = sum(len(r["unresolved"]) for r in results)
    total_dynamic = sum(len(r["dynamic"]) for r in results)
    total_ok = sum(r["imgs_ok"] for r in results)
    pages_with_findings = [
        r for r in results
        if r["patchable"] or r["external"] or r["unresolved"] or r["dynamic"]
    ]

    lines = []
    lines.append("# 📐 Audit dimensions images (PIL) — extension CLS prevention")
    lines.append("")
    lines.append(f"_Généré le {datetime.now().strftime('%Y-%m-%d %H:%M')}_")
    lines.append("")
    if not HAS_PIL:
        lines.append("⚠️ **PIL/Pillow non installé** — `pip install Pillow` pour activer la lecture des dimensions.")
        lines.append("")
    lines.append(f"- Pages scannées : **{len(pages)}**")
    lines.append(f"- `<img>` avec width+height : **{total_ok}**")
    lines.append(f"- Patchables (dimensions lues PIL) : **{total_patchable}**")
    lines.append(f"- Externes (CDN/hot-link) : **{total_external}**")
    lines.append(f"- Non-résolues (fichier absent) : **{total_unresolved}**")
    lines.append(f"- Dynamiques (template `${{...}}`) : **{total_dynamic}**")
    lines.append("")

    if total_patchable == 0 and total_external == 0 and total_unresolved == 0 and total_dynamic == 0:
        lines.append("## ✅ Aucune `<img>` sans dimensions détectée")
        lines.append("")
    else:
        # Section patchables (intéressantes pour Florian)
        if total_patchable > 0:
            lines.append("## 🛠️ Patches proposés (dimensions lues PIL)")
            lines.append("")
            lines.append("Pour chaque `<img>` ci-dessous, le patch est prêt à être appliqué")
            lines.append("(décision masse → Florian).")
            lines.append("")
            for r in results:
                if not r["patchable"]:
                    continue
                lines.append(f"### `{r['file']}` — {len(r['patchable'])} patch(es)")
                lines.append("")
                for f in r["patchable"][:30]:
                    lines.append(f"**L{f['line']}** ({f['real_width']}×{f['real_height']}px) — `{f['src']}`")
                    lines.append("")
                    lines.append("```html")
                    lines.append(f"AVANT : {f['snippet']}")
                    lines.append(f"APRÈS : {f['patch']}")
                    lines.append("```")
                    lines.append("")
                if len(r["patchable"]) > 30:
                    lines.append(f"_… et {len(r['patchable']) - 30} autres dans le JSON_")
                    lines.append("")

        # Section externes (besoin manuel)
        if total_external > 0:
            lines.append("## 🌐 Images externes (à patcher manuellement)")
            lines.append("")
            lines.append("Source externe (CDN, hot-link) — PIL ne peut pas les lire sans accès réseau.")
            lines.append("Recommandation : rapatrier en local (cf. `audit_hotlink_cdn.py`) puis re-runner.")
            lines.append("")
            for r in results:
                if not r["external"]:
                    continue
                lines.append(f"- `{r['file']}` ({len(r['external'])}) : "
                             + ", ".join(f"L{f['line']}" for f in r["external"][:10]))
            lines.append("")

        # Section unresolved
        if total_unresolved > 0:
            lines.append("## ❓ Sources non résolues")
            lines.append("")
            for r in results:
                if not r["unresolved"]:
                    continue
                lines.append(f"### `{r['file']}` — {len(r['unresolved'])}")
                for f in r["unresolved"][:10]:
                    lines.append(f"- L{f['line']} — `{f['src']}` ({f['reason']})")
                lines.append("")

        # Section dynamic
        if total_dynamic > 0:
            lines.append("## 🔁 Sources dynamiques (template JS)")
            lines.append("")
            lines.append("Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent")
            lines.append("être ajoutées soit en dur dans le template, soit calculées via `onload`.")
            lines.append("")
            for r in results:
                if not r["dynamic"]:
                    continue
                lines.append(f"- `{r['file']}` ({len(r['dynamic'])}) : "
                             + ", ".join(f"L{f['line']}" for f in r["dynamic"][:10]))
            lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).")
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")

    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "pil_available": HAS_PIL,
        "scanned": len(pages),
        "imgs_ok": total_ok,
        "patchable": total_patchable,
        "external": total_external,
        "unresolved": total_unresolved,
        "dynamic": total_dynamic,
        "by_page": [
            {
                "file": r["file"],
                "patchable": len(r["patchable"]),
                "external": len(r["external"]),
                "unresolved": len(r["unresolved"]),
                "dynamic": len(r["dynamic"]),
                "patches": r["patchable"][:50],
            }
            for r in results
            if r["patchable"] or r["external"] or r["unresolved"] or r["dynamic"]
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Pages={len(pages)} ok={total_ok} patchable={total_patchable} external={total_external} unresolved={total_unresolved} dynamic={total_dynamic}")
    print(f"Report: {OUT_MD.relative_to(ROOT)}")
    # Exit 0 si rien à patcher, 1 sinon (signal au workflow)
    return 0 if (total_patchable + total_external + total_unresolved + total_dynamic) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
