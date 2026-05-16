#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit meta viewport — sonde P16.

Vérifie que toutes les pages publiques racine déclarent une balise
`<meta name="viewport" content="...">` valide. Sans viewport, mobile
Safari/Chrome rendent à 980 px logiques et zooment out → site illisible
sur smartphone.

Critères :
  - ERROR  : aucune balise `<meta name="viewport">` détectée
  - ERROR  : viewport présent mais `content` vide
  - ERROR  : `content` ne contient pas `width=device-width`
  - WARN   : `content` ne déclare pas `initial-scale=1` (mineur — mais
             recommandé pour éviter zoom inattendu sur iOS)
  - WARN   : `content` contient `user-scalable=no` ou `maximum-scale=1`
             (anti-accessibilité WCAG 1.4.4 — empêche le zoom utilisateur)
  - OK     : `width=device-width, initial-scale=1` présent et pas
             d'interdiction de zoom

Whitelist : pages 404/reset/test-*/_*.

Sortie :
  - admin-pro/audits/audit_meta_viewport_report.md
  - admin-pro/audits/audit_meta_viewport_report.json

Sans dépendance externe — stdlib uniquement.
Pourquoi : 65 %+ du trafic du dépannage en local est mobile (recherche
urgence depuis le smartphone). Une page sans viewport correct = taux de
rebond catastrophique + pénalité SEO mobile-first Google.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD   = ROOT / "admin-pro" / "audits" / "audit_meta_viewport_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_meta_viewport_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

# Capture toute balise <meta ...> contenant name="viewport"
META_VIEWPORT_RE = re.compile(
    r"""<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*>""",
    re.IGNORECASE | re.DOTALL,
)
# Extrait l'attribut content="..."
CONTENT_ATTR_RE = re.compile(
    r"""content\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""",
    re.IGNORECASE,
)


def find_html_pages() -> list[pathlib.Path]:
    pages: list[pathlib.Path] = []
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


def parse_viewport_content(content: str) -> dict[str, str]:
    """Parse la chaîne `width=device-width, initial-scale=1` en dict."""
    out: dict[str, str] = {}
    for chunk in content.split(","):
        if "=" in chunk:
            k, _, v = chunk.partition("=")
            out[k.strip().lower()] = v.strip().lower()
        else:
            k = chunk.strip().lower()
            if k:
                out[k] = ""
    return out


def classify(meta_tag: str | None, content: str | None) -> tuple[str, list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if meta_tag is None:
        errors.append("VIEWPORT-MISSING : aucune balise `<meta name=\"viewport\">` détectée")
        return "error", errors, warnings

    if not content:
        errors.append("VIEWPORT-EMPTY : `content` vide ou absent")
        return "error", errors, warnings

    parsed = parse_viewport_content(content)

    # Critère bloquant : width=device-width
    width = parsed.get("width", "")
    if width != "device-width":
        errors.append(
            f"VIEWPORT-NO-DEVICE-WIDTH : `width={width or '∅'}` (attendu `width=device-width`)"
        )

    # Recommandation : initial-scale=1
    initial = parsed.get("initial-scale", "")
    if initial != "1" and initial != "1.0":
        warnings.append(
            f"VIEWPORT-NO-INITIAL-SCALE : `initial-scale={initial or '∅'}` (recommandé `1`)"
        )

    # Accessibilité : pas d'interdiction de zoom
    if parsed.get("user-scalable", "") == "no":
        warnings.append("VIEWPORT-ZOOM-DISABLED : `user-scalable=no` empêche le zoom (WCAG 1.4.4)")
    max_scale = parsed.get("maximum-scale", "")
    if max_scale in ("1", "1.0"):
        warnings.append(
            f"VIEWPORT-MAX-SCALE-1 : `maximum-scale={max_scale}` limite le zoom (WCAG 1.4.4)"
        )

    if errors:
        return "error", errors, warnings
    if warnings:
        return "warn", errors, warnings
    return "ok", errors, warnings


def audit_file(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "viewport_tag_found": False,
        "content": None,
        "errors": [],
        "warnings": [],
    }
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        res["status"] = "error"
        res["errors"].append(f"READ-ERROR : {type(e).__name__}")
        return res

    m = META_VIEWPORT_RE.search(raw)
    tag = m.group(0) if m else None
    content_val: str | None = None
    if m:
        res["viewport_tag_found"] = True
        cm = CONTENT_ATTR_RE.search(tag)
        if cm:
            content_val = cm.group(1) or cm.group(2) or cm.group(3)
    res["content"] = content_val

    status, errors, warnings = classify(tag, content_val)
    res["status"] = status
    res["errors"] = errors
    res["warnings"] = warnings
    return res


def main() -> None:
    pages = find_html_pages()
    results = [audit_file(p) for p in pages]

    n_total = len(results)
    n_ok    = sum(1 for r in results if r["status"] == "ok")
    n_warn  = sum(1 for r in results if r["status"] == "warn")
    n_err   = sum(1 for r in results if r["status"] == "error")
    total_errors   = sum(len(r["errors"])   for r in results)
    total_warnings = sum(len(r["warnings"]) for r in results)

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit meta viewport — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages scannées : **{n_total}**",
        f"- ✅ OK (`width=device-width, initial-scale=1`) : **{n_ok}**",
        f"- ⚠️  Warnings (zoom bloqué ou initial-scale absent) : **{n_warn}**",
        f"- ❌ Erreurs (viewport absent ou cassé) : **{n_err}**",
        f"- Findings totaux : **{total_errors + total_warnings}**",
        f"  - Erreurs : {total_errors}",
        f"  - Avertissements : {total_warnings}",
        "",
        "## Règles",
        "",
        "- `width=device-width, initial-scale=1` → OK",
        "- viewport absent ou pas de `width=device-width` → ERREUR",
        "- `user-scalable=no` ou `maximum-scale=1` → WARN (anti-accessibilité)",
        "- `initial-scale` absent → WARN (recommandé)",
        "",
        "## Findings",
        "",
    ]

    has_finding = False
    order = {"error": 0, "warn": 1, "ok": 2}
    for r in sorted(results, key=lambda x: (order.get(x["status"], 9), x["file"])):
        if not r["errors"] and not r["warnings"]:
            continue
        has_finding = True
        md.append(f"### `{r['file']}`  (content={r['content']!r})")
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")

    if not has_finding:
        md.append("_Aucun finding — toutes les pages déclarent un viewport correct._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "n_total":   n_total,
                "n_ok":      n_ok,
                "n_warn":    n_warn,
                "n_errors":  n_err,
                "results":   results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_meta_viewport] {n_ok}/{n_total} OK, "
        f"{n_warn} warn, {n_err} err — "
        f"findings={total_errors + total_warnings}"
    )
    print(f"Report: {OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
