#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit local HTML5 + a11y de base — sans dépendre du validateur W3C en ligne.
Vérifie :
  - DOCTYPE html présent
  - <html lang=...> présent
  - <meta charset=...> présent
  - <title> non vide
  - <meta name="description"> non vide
  - <meta name="viewport"> présent
  - <link rel="canonical"> présent
  - h1 unique par page
  - <img> sans alt
  - <button> sans label texte ni aria-label
  - id dupliqués
  - balises non fermées élémentaires (compteur ouvert/fermé pour div/section/article/main/aside/nav)

Sortie : admin-pro/audits/audit_html5_report.md
"""
from __future__ import annotations
import re
import sys
import pathlib
from datetime import datetime
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT  = ROOT / "admin-pro" / "audits" / "audit_html5_report.md"

VOID_TAGS = {"area","base","br","col","embed","hr","img","input","link","meta",
             "param","source","track","wbr"}

TAG_RE   = re.compile(r"<\s*(/?)\s*([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*?)(/?)>", re.S)
ATTR_RE  = re.compile(r'([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"|([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*\'([^\']*)\'|([a-zA-Z_:][-a-zA-Z0-9_:.]*)')

# Tags qu'on suit pour le balisage
TRACKED = {"div","section","article","main","aside","nav","header","footer",
           "form","ul","ol","li","table","tr","td","th","thead","tbody","tfoot",
           "h1","h2","h3","h4","h5","h6","p","a","span","button","label"}


def parse_attrs(s: str) -> dict:
    out = {}
    for m in ATTR_RE.finditer(s):
        if m.group(1):
            out[m.group(1).lower()] = m.group(2)
        elif m.group(3):
            out[m.group(3).lower()] = m.group(4)
        elif m.group(5):
            out[m.group(5).lower()] = ""
    return out


def strip_comments_and_scripts(html: str) -> str:
    """Retire commentaires, <script>, <style>, <template> du HTML pour ne pas
    polluer l'audit de balisage."""
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    html = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S|re.I)
    html = re.sub(r"<style\b[^>]*>.*?</style>",  "", html, flags=re.S|re.I)
    html = re.sub(r"<template\b[^>]*>.*?</template>", "", html, flags=re.S|re.I)
    return html


def audit_file(path: pathlib.Path) -> dict:
    raw = path.read_text(encoding="utf-8", errors="replace")
    res = {"file": path.name, "errors": [], "warnings": [], "info": []}

    # ─── 1. DOCTYPE
    if not re.match(r"\s*<!DOCTYPE\s+html\s*>", raw, re.I):
        res["errors"].append("DOCTYPE html manquant ou incorrect")

    # ─── 2. <html lang=...>
    m = re.search(r"<html\b[^>]*>", raw, re.I)
    if not m:
        res["errors"].append("balise <html> manquante")
    elif "lang=" not in m.group(0).lower():
        res["errors"].append("<html> sans attribut lang")

    # ─── 3. <meta charset>
    if not re.search(r'<meta\s+charset=', raw, re.I):
        res["errors"].append("<meta charset> manquant")

    # ─── 4. <title>
    tm = re.search(r"<title[^>]*>(.*?)</title>", raw, re.I|re.S)
    if not tm or not tm.group(1).strip():
        res["errors"].append("<title> manquant ou vide")
    elif len(tm.group(1).strip()) > 80:
        res["warnings"].append(f"<title> long ({len(tm.group(1).strip())} chars, >70 recommandé)")

    # ─── 5. meta description (parsing attributs order-agnostic)
    desc_val = None
    for mm in re.finditer(r'<meta\b([^>]*)>', raw, re.I):
        attrs = parse_attrs(mm.group(1))
        if attrs.get("name", "").lower() == "description":
            desc_val = attrs.get("content", "")
            break
    if desc_val is None or not desc_val.strip():
        res["errors"].append('<meta name="description"> manquant ou vide')
    elif len(desc_val) > 170:
        res["warnings"].append(f'meta description longue ({len(desc_val)} chars, >170 → tronquée)')
    elif len(desc_val) < 60:
        res["warnings"].append(f'meta description courte ({len(desc_val)} chars, <60)')

    # ─── 6. viewport
    if not re.search(r'<meta\s+name="viewport"', raw, re.I):
        res["errors"].append('<meta name="viewport"> manquant')

    # ─── 7. canonical (sauf si noindex — auquel cas c'est intentionnel)
    is_noindex = bool(re.search(r'<meta\s+name="robots"\s+content="[^"]*noindex', raw, re.I))
    if not re.search(r'<link\s+rel="canonical"', raw, re.I) and not is_noindex:
        res["warnings"].append('<link rel="canonical"> manquant')

    # Nettoyer pour audit balisage
    html = strip_comments_and_scripts(raw)

    # ─── 8. h1 — on accepte aussi un h1 injecté par JS (template string)
    h1s = re.findall(r"<h1\b[^>]*>(.*?)</h1>", html, re.I|re.S)
    has_h1_in_js = bool(re.search(r"<h1\b", raw))  # cherche aussi dans scripts
    if len(h1s) == 0 and not has_h1_in_js:
        res["errors"].append("aucun <h1>")
    elif len(h1s) == 0 and has_h1_in_js:
        res["info"].append("aucun <h1> statique — injecté par JS (page dynamique)")
    elif len(h1s) > 1:
        res["warnings"].append(f"{len(h1s)} <h1> trouvés (1 seul recommandé)")

    # ─── 9. <img> sans alt
    imgs = re.findall(r"<img\b[^>]*?>", html, re.I)
    imgs_no_alt = 0
    imgs_empty_alt = 0
    for img in imgs:
        attrs = parse_attrs(img[4:-1])
        if "alt" not in attrs:
            imgs_no_alt += 1
        elif attrs["alt"].strip() == "":
            imgs_empty_alt += 1
    if imgs_no_alt:
        res["errors"].append(f"{imgs_no_alt}/{len(imgs)} <img> sans attribut alt")
    if imgs_empty_alt:
        res["info"].append(f"{imgs_empty_alt} <img> avec alt vide (OK si décoratif)")

    # ─── 10. <button> sans label
    btns = re.findall(r"<button\b([^>]*)>(.*?)</button>", html, re.I|re.S)
    buttons_no_label = 0
    for attrs_s, inner in btns:
        attrs = parse_attrs(attrs_s)
        if "aria-label" in attrs and attrs["aria-label"].strip():
            continue
        text = re.sub(r"<[^>]+>", "", inner).strip()
        if not text:
            buttons_no_label += 1
    if buttons_no_label:
        res["warnings"].append(f"{buttons_no_label} <button> sans texte ni aria-label")

    # ─── 11. id dupliqués
    ids = re.findall(r'\bid="([^"]+)"', html)
    id_counts = Counter(ids)
    dups = {i: n for i, n in id_counts.items() if n > 1}
    if dups:
        sample = ", ".join(f"#{k}×{v}" for k, v in list(dups.items())[:5])
        res["errors"].append(f"{len(dups)} id(s) dupliqué(s) : {sample}")

    # ─── 12. Compteur balises (élémentaire)
    tag_counts = {t: {"open": 0, "close": 0} for t in TRACKED}
    for m in TAG_RE.finditer(html):
        is_close = m.group(1) == "/"
        tag = m.group(2).lower()
        self_close = m.group(4) == "/"
        if tag in VOID_TAGS or self_close:
            continue
        if tag in TRACKED:
            tag_counts[tag]["close" if is_close else "open"] += 1
    mismatches = []
    for t, c in tag_counts.items():
        if c["open"] != c["close"]:
            mismatches.append(f"<{t}> {c['open']}↗ / {c['close']}↘")
    if mismatches:
        # Note : nesting peut faire un faux positif si tags imbriqués mal détectés
        # → on reporte mais en warning
        res["warnings"].append("balisage déséquilibré (indicatif) : " + ", ".join(mismatches[:6]))

    return res


def render_report(results: list[dict]) -> str:
    lines = [
        f"# Audit HTML5 — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "> Audit local rapide HTML5 + a11y de base. Lancement : `python3 admin-pro/audits/audit_html5.py`",
        "> ⚠️ Ce n'est pas un substitut au validateur W3C officiel, mais il pré-filtre les erreurs évidentes.",
        "",
    ]

    total = len(results)
    pages_with_err  = sum(1 for r in results if r["errors"])
    pages_with_warn = sum(1 for r in results if r["warnings"])
    total_errors    = sum(len(r["errors"]) for r in results)
    total_warnings  = sum(len(r["warnings"]) for r in results)

    lines += [
        "## Synthèse",
        "",
        f"- Pages auditées : **{total}**",
        f"- Pages avec erreurs : **{pages_with_err}**",
        f"- Pages avec warnings : **{pages_with_warn}**",
        f"- Total erreurs : **{total_errors}**",
        f"- Total warnings : **{total_warnings}**",
        "",
    ]

    # Top erreurs
    err_counter = Counter()
    for r in results:
        for e in r["errors"]:
            # normaliser : couper après le 1er chiffre/2-points
            key = re.sub(r"\d+", "N", e)
            err_counter[key] += 1
    if err_counter:
        lines += ["## Top patterns d'erreurs", ""]
        for k, n in err_counter.most_common(10):
            lines.append(f"- **{n}×** {k}")
        lines.append("")

    # Détail par page (seules celles avec erreurs/warnings)
    lines += ["## Détail par page (pages problématiques uniquement)", ""]
    for r in sorted(results, key=lambda x: (-len(x["errors"]), -len(x["warnings"]), x["file"])):
        if not r["errors"] and not r["warnings"] and not r["info"]:
            continue
        lines.append(f"### `{r['file']}`")
        lines.append("")
        for e in r["errors"]:
            lines.append(f"- ❌ {e}")
        for w in r["warnings"]:
            lines.append(f"- ⚠️ {w}")
        for i in r["info"]:
            lines.append(f"- ℹ️ {i}")
        lines.append("")

    # Pages 100% OK
    ok = [r["file"] for r in results if not r["errors"] and not r["warnings"]]
    if ok:
        lines += ["## ✅ Pages sans erreur ni warning", "", *(f"- `{f}`" for f in sorted(ok)), ""]

    return "\n".join(lines)


def main():
    files = sorted(p for p in ROOT.glob("*.html"))
    results = [audit_file(p) for p in files]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(render_report(results), encoding="utf-8")
    print(f"✓ Rapport : {OUT}")
    errs = sum(len(r["errors"]) for r in results)
    warns = sum(len(r["warnings"]) for r in results)
    pages_with_err = sum(1 for r in results if r["errors"])
    print(f"  {pages_with_err}/{len(results)} pages avec erreurs, {errs} erreurs / {warns} warnings au total")


if __name__ == "__main__":
    sys.exit(main())
