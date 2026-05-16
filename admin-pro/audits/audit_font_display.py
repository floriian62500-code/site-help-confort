#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit font-display:swap — sonde P14.

Détecte les déclarations de polices web qui peuvent provoquer un FOIT (Flash
Of Invisible Text) parce qu'elles n'utilisent pas `font-display: swap`.

3 vecteurs principaux scannés sur les pages publiques racine + actualites/ :

  A) `<link rel="stylesheet" href="https://fonts.googleapis.com/css...">` sans
     paramètre `&display=swap` (ou `&display=optional`/`fallback`) dans l'URL.
     → ALERTE *Google Fonts FOIT*.

  B) Blocs CSS inline (`<style>` ou attribut `style`) qui définissent un
     `@font-face` sans `font-display:` swap/fallback/optional.
     → ALERTE *@font-face FOIT*.

  C) Sur tous les fichiers `assets/**/*.css` : même règle qu'en B.
     (les fichiers CSS externes sont scannés une seule fois et leur résultat
      mutualisé pour les pages qui les chargent — mais ici on les liste à
      part dans le rapport pour ne pas dupliquer le bruit).

Tolère :
  - `display=swap` / `display=fallback` / `display=optional` (toutes valeurs
    qui évitent un blocage > 100 ms).
  - `font-display: block` est WARNING (FOIT court mais autorisé pour les
    polices d'icônes).

Sortie :
  - admin-pro/audits/audit_font_display_report.md
  - admin-pro/audits/audit_font_display_report.json

Sans dépendance externe — stdlib uniquement.
"""
from __future__ import annotations
import re
import json
import pathlib
from datetime import datetime
from urllib.parse import urlparse, parse_qs

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "admin-pro" / "audits" / "audit_font_display_report.md"
OUT_JSON = ROOT / "admin-pro" / "audits" / "audit_font_display_report.json"

EXCLUDE = {"404.html", "reset.html"}
EXCLUDE_PREFIX = ("test-", "_")

# Capture tous les <link rel="stylesheet">
LINK_RE = re.compile(r'<link\b([^>]*)>', re.I)
ATTR_RE = re.compile(r'(\w[\w:-]*)\s*=\s*"([^"]*)"', re.I)

# Capture les <style>...</style>
STYLE_RE = re.compile(r'<style\b[^>]*>(.*?)</style>', re.I | re.S)

# Capture les blocs @font-face { ... }
FONTFACE_RE = re.compile(r'@font-face\s*\{([^}]*)\}', re.I | re.S)

# Détecte une déclaration font-display:
FONTDISPLAY_RE = re.compile(r'font-display\s*:\s*([a-z]+)', re.I)

# Valeurs acceptables (évitent un blocage > 100 ms)
GOOD_VALUES = {"swap", "fallback", "optional"}
TOLERABLE_VALUES = {"block"}  # warning (FOIT court mais utilisé pour icônes)


def find_html_pages():
    pages = []
    for p in ROOT.glob("*.html"):
        if p.name in EXCLUDE:
            continue
        if any(p.name.startswith(pre) for pre in EXCLUDE_PREFIX):
            continue
        pages.append(p)
    for p in (ROOT / "actualites").glob("*.html"):
        pages.append(p)
    return sorted(pages)


def parse_attrs(attr_str: str) -> dict:
    out = {}
    for m in ATTR_RE.finditer(attr_str):
        out[m.group(1).lower()] = m.group(2)
    return out


def check_google_fonts_url(href: str) -> str | None:
    """Retourne un code d'erreur si l'URL Google Fonts n'utilise pas display=swap.
    Sinon None.
    """
    parsed = urlparse(href)
    if "fonts.googleapis.com" not in parsed.netloc:
        return None
    q = parse_qs(parsed.query)
    display = q.get("display", [None])[0]
    if display is None:
        return f"GOOGLE-FONTS-NO-DISPLAY : aucun paramètre `display=` (FOIT par défaut)"
    if display.lower() in GOOD_VALUES:
        return None
    if display.lower() in TOLERABLE_VALUES:
        return f"GOOGLE-FONTS-DISPLAY-BLOCK : display={display} (FOIT court)"
    return f"GOOGLE-FONTS-DISPLAY-BAD : display={display} (valeurs recommandées : swap/fallback/optional)"


def check_fontface_block(body: str) -> tuple[bool, str | None]:
    """Retourne (ok, raison) pour un bloc @font-face."""
    m = FONTDISPLAY_RE.search(body)
    if not m:
        return False, "FONTFACE-NO-DISPLAY : `font-display:` absent (FOIT par défaut)"
    val = m.group(1).lower().strip(" ;")
    if val in GOOD_VALUES:
        return True, None
    if val in TOLERABLE_VALUES:
        return True, f"FONTFACE-DISPLAY-BLOCK : font-display: {val} (FOIT court — toléré)"
    return False, f"FONTFACE-DISPLAY-BAD : font-display: {val}"


def scan_styles(raw: str) -> list[tuple[bool, str | None]]:
    """Scanne tous les <style> et retourne la liste des @font-face vérifiés."""
    out = []
    for m in STYLE_RE.finditer(raw):
        body = m.group(1)
        for ff in FONTFACE_RE.finditer(body):
            ok, reason = check_fontface_block(ff.group(1))
            out.append((ok, reason))
    return out


def audit_html(path: pathlib.Path) -> dict:
    res = {
        "file": str(path.relative_to(ROOT)),
        "status": "ok",
        "n_google_fonts_link": 0,
        "n_fontface_inline": 0,
        "errors": [],
        "warnings": [],
    }
    raw = path.read_text(encoding="utf-8", errors="replace")

    # A) <link> Google Fonts
    for m in LINK_RE.finditer(raw):
        attrs = parse_attrs(m.group(1))
        rel = (attrs.get("rel") or "").lower()
        href = attrs.get("href") or ""
        if "stylesheet" not in rel and rel != "preload":
            continue
        if not href:
            continue
        if "fonts.googleapis.com" not in href:
            continue
        res["n_google_fonts_link"] += 1
        msg = check_google_fonts_url(href)
        if msg:
            if "BAD" in msg or "NO-DISPLAY" in msg:
                res["errors"].append(msg)
                res["status"] = "error"
            else:
                res["warnings"].append(msg)
                if res["status"] == "ok":
                    res["status"] = "warning"

    # B) @font-face inline
    for ok, reason in scan_styles(raw):
        res["n_fontface_inline"] += 1
        if not reason:
            continue
        if "BAD" in reason or "NO-DISPLAY" in reason:
            res["errors"].append(reason)
            res["status"] = "error"
        else:
            res["warnings"].append(reason)
            if res["status"] == "ok":
                res["status"] = "warning"

    return res


def audit_external_css() -> list[dict]:
    """Scan les fichiers CSS externes pour les @font-face."""
    results = []
    css_dir = ROOT / "assets"
    if not css_dir.exists():
        return results
    for p in css_dir.rglob("*.css"):
        res = {
            "file": str(p.relative_to(ROOT)),
            "status": "ok",
            "n_fontface": 0,
            "errors": [],
            "warnings": [],
        }
        raw = p.read_text(encoding="utf-8", errors="replace")
        for ff in FONTFACE_RE.finditer(raw):
            res["n_fontface"] += 1
            ok, reason = check_fontface_block(ff.group(1))
            if not reason:
                continue
            if "BAD" in reason or "NO-DISPLAY" in reason:
                res["errors"].append(reason)
                res["status"] = "error"
            else:
                res["warnings"].append(reason)
                if res["status"] == "ok":
                    res["status"] = "warning"
        if res["n_fontface"]:
            results.append(res)
    return results


def main():
    html_pages = find_html_pages()
    html_results = [audit_html(p) for p in html_pages]
    css_results = audit_external_css()

    n_total = len(html_results)
    n_ok = sum(1 for r in html_results if r["status"] == "ok")
    n_err = sum(1 for r in html_results if r["status"] == "error")
    n_warn = sum(1 for r in html_results if r["status"] == "warning")
    total_errors = sum(len(r["errors"]) for r in html_results) + sum(
        len(r["errors"]) for r in css_results
    )
    total_warnings = sum(len(r["warnings"]) for r in html_results) + sum(
        len(r["warnings"]) for r in css_results
    )
    n_css_err = sum(1 for r in css_results if r["status"] == "error")
    n_css_warn = sum(1 for r in css_results if r["status"] == "warning")

    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    md = [
        "# Audit font-display: swap — Rapport",
        "",
        f"_Généré le {now}_",
        "",
        "## Synthèse",
        "",
        f"- Pages HTML scannées : **{n_total}**",
        f"  - ✅ OK : **{n_ok}**",
        f"  - ❌ Erreurs : **{n_err}**",
        f"  - ⚠️  Warnings : **{n_warn}**",
        f"- Fichiers CSS externes avec `@font-face` : **{len(css_results)}**",
        f"  - ❌ Erreurs : **{n_css_err}**",
        f"  - ⚠️  Warnings : **{n_css_warn}**",
        f"- Cumul findings : **{total_errors}** erreurs + **{total_warnings}** warnings",
        "",
        "## Findings — Pages HTML",
        "",
    ]

    has_html = False
    for r in html_results:
        if not r["errors"] and not r["warnings"]:
            continue
        has_html = True
        md.append(f"### `{r['file']}`")
        md.append(
            f"- Google Fonts links : `{r['n_google_fonts_link']}`, "
            f"@font-face inline : `{r['n_fontface_inline']}`"
        )
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")
    if not has_html:
        md.append("_Aucun finding HTML._")
        md.append("")

    md.append("## Findings — Fichiers CSS externes")
    md.append("")
    has_css = False
    for r in css_results:
        if not r["errors"] and not r["warnings"]:
            continue
        has_css = True
        md.append(f"### `{r['file']}`")
        md.append(f"- @font-face dans ce CSS : `{r['n_fontface']}`")
        for e in r["errors"]:
            md.append(f"- ❌ {e}")
        for w in r["warnings"]:
            md.append(f"- ⚠️ {w}")
        md.append("")
    if not has_css:
        md.append("_Aucun finding dans les CSS externes._")
        md.append("")

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    OUT_JSON.write_text(
        json.dumps(
            {
                "generated": now,
                "n_html": n_total,
                "n_html_ok": n_ok,
                "n_html_errors": n_err,
                "n_html_warnings": n_warn,
                "n_css": len(css_results),
                "n_css_errors": n_css_err,
                "n_css_warnings": n_css_warn,
                "html_results": html_results,
                "css_results": css_results,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(
        f"[audit_font_display] HTML {n_ok}/{n_total} OK, {n_err} erreurs ; "
        f"CSS {len(css_results)} fichiers, {n_css_err} erreurs → "
        f"{OUT_MD.relative_to(ROOT)}"
    )
    return 1 if (n_err or n_css_err) else 0


if __name__ == "__main__":
    raise SystemExit(main())
