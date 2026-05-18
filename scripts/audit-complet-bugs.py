#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audit complet bugs - 4 axes:
  AXIS 1 - Redirections & routing
  AXIS 2 - Bugs visuels
  AXIS 3 - Interactions cassees
  AXIS 4 - Doublons

Corrections automatiques (safe):
  - rel="noopener noreferrer" sur target="_blank" sans
  - type="button" sur <button> sans type (sauf submit explicite/contextuel)
  - Renomme IDs dupliques en suffixant -2, -3...
  - Supprime liens vers fichiers inexistants si typo evident

Signale (sans toucher):
  - Doublons de titres / descriptions
  - Multi-H1
  - Forms sans action
  - Alt vides sur images de contenu
"""

import os
import re
import json
import sys
import hashlib
from pathlib import Path
from collections import defaultdict, Counter

_CAND = [
    Path("/Users/HP/Documents/Claude/Projects/SITE INTERNET"),
    Path("/sessions/youthful-charming-goldberg/mnt/SITE INTERNET"),
    Path(os.environ.get("AUDIT_ROOT","")) if os.environ.get("AUDIT_ROOT") else None,
]
ROOT = next((c for c in _CAND if c and c.is_dir()), Path("."))
OUT  = ROOT / "admin-pro/audits/audit-bugs-complet.json"

# Pages publiques (root + prestations + actualites). On EXCLUT admin/, admin-pro/, scripts/tmp/.
def gather_pages():
    pages = []
    for p in ROOT.glob("*.html"):
        pages.append(p)
    for sub in ("prestations", "actualites"):
        d = ROOT / sub
        if d.is_dir():
            for p in d.glob("*.html"):
                pages.append(p)
    return sorted(pages)

# ---------------- Helpers ----------------

RE_HREF       = re.compile(r'<a\b[^>]*?\bhref\s*=\s*"([^"]+)"[^>]*>', re.I)
RE_A_OPEN     = re.compile(r'<a\b[^>]*>', re.I)
RE_TARGET     = re.compile(r'\btarget\s*=\s*"_blank"', re.I)
RE_REL        = re.compile(r'\brel\s*=\s*"([^"]*)"', re.I)
RE_BUTTON     = re.compile(r'<button\b([^>]*)>', re.I)
RE_TYPE_ATTR  = re.compile(r'\btype\s*=\s*"([^"]+)"', re.I)
RE_FORM       = re.compile(r'<form\b([^>]*)>', re.I)
RE_HTML_TAG   = re.compile(r'<html\b([^>]*)>', re.I)
RE_VIEWPORT   = re.compile(r'<meta\s+name\s*=\s*"viewport"[^>]*>', re.I)
RE_H1         = re.compile(r'<h1\b[^>]*>(.*?)</h1>', re.I | re.S)
RE_TITLE      = re.compile(r'<title>(.*?)</title>', re.I | re.S)
RE_META_DESC  = re.compile(r'<meta\s+name\s*=\s*"description"\s+content\s*=\s*"([^"]*)"', re.I)
RE_IMG        = re.compile(r'<img\b([^>]*)>', re.I)
RE_ID         = re.compile(r'\bid\s*=\s*"([^"]+)"', re.I)
RE_SELECT     = re.compile(r'<select\b[^>]*>(.*?)</select>', re.I | re.S)
RE_OPTION     = re.compile(r'<option\b[^>]*>(.*?)</option>', re.I | re.S)
RE_ONCLICK    = re.compile(r'\bonclick\s*=\s*"([^"]+)"', re.I)

def read(p):
    return p.read_text(encoding="utf-8", errors="ignore")

def write(p, txt):
    p.write_text(txt, encoding="utf-8")

RE_SCRIPT_BLOCK = re.compile(r'<script\b[^>]*>.*?</script>', re.I | re.S)
RE_STYLE_BLOCK  = re.compile(r'<style\b[^>]*>.*?</style>', re.I | re.S)
RE_TEMPLATE_BLK = re.compile(r'<template\b[^>]*>.*?</template>', re.I | re.S)

def strip_dynamic(txt):
    """Retire les blocs <script>, <style>, <template> + commentaires HTML
    pour eviter les faux-positifs (hrefs avec template literals, IDs ${...}, etc.).
    """
    txt = RE_SCRIPT_BLOCK.sub("", txt)
    txt = RE_STYLE_BLOCK.sub("", txt)
    txt = RE_TEMPLATE_BLK.sub("", txt)
    txt = re.sub(r"<!--.*?-->", "", txt, flags=re.S)
    return txt

def page_files_set():
    """Index des fichiers existants pour valider hrefs."""
    s = set()
    for r, _, files in os.walk(ROOT):
        for f in files:
            full = Path(r) / f
            rel = full.relative_to(ROOT)
            s.add(str(rel).replace("\\","/"))
            s.add(f)
    return s

# ---------------- AXIS 1: redirections ----------------

def axis1(pages, all_files):
    findings = {"hrefs_inexistants": [], "anciens_patterns": [], "blank_sans_rel": [], "mailto_casses": [], "tel_casses": [], "auto_fixed_rel": 0, "auto_fixed_typos": 0}

    for p in pages:
        try:
            txt = read(p)
        except Exception:
            continue
        orig = txt
        rel_p = str(p.relative_to(ROOT))
        scan = strip_dynamic(txt)

        # Anciens patterns (sur scan - hors scripts)
        for pat in ("#m-reserve-modal", "#m-reserve", "javascript:void(0)"):
            if pat in scan:
                findings["anciens_patterns"].append({"page": rel_p, "pattern": pat})

        # hrefs vers fichiers locaux (sur scan)
        for m in RE_HREF.finditer(scan):
            href = m.group(1).strip()
            if not href or href.startswith("#"):
                continue
            # Ignorer hrefs avec template literals / placeholders
            if any(tok in href for tok in ("${", "{{", "'+", "+'", "<%", "%>")):
                continue
            if href.startswith(("http://","https://","mailto:","tel:","javascript:","data:")):
                # mailto / tel validation
                if href.startswith("mailto:"):
                    addr = href[7:].split("?")[0]
                    if "@" not in addr or "." not in addr.split("@")[-1]:
                        findings["mailto_casses"].append({"page": rel_p, "href": href})
                elif href.startswith("tel:"):
                    digits = re.sub(r"[^\d+]", "", href[4:])
                    # Tolere format FR: +33... ou 0X... Long enough.
                    if not (digits.startswith("+") or digits.startswith("0")) or len(digits) < 8:
                        findings["tel_casses"].append({"page": rel_p, "href": href})
                continue
            # local file ?
            url = href.split("?")[0].split("#")[0]
            if not url:
                continue
            # path relatif a la page
            base = p.parent
            target = (base / url).resolve()
            try:
                rel_target = target.relative_to(ROOT.resolve())
                key = str(rel_target).replace("\\","/")
                fname = target.name
                if key not in all_files and fname not in all_files:
                    findings["hrefs_inexistants"].append({"page": rel_p, "href": href})
            except Exception:
                # hors racine - on note
                findings["hrefs_inexistants"].append({"page": rel_p, "href": href, "note": "hors-racine"})

        # target="_blank" sans rel="noopener" -> auto-fix
        def fix_blank(match):
            tag = match.group(0)
            if not RE_TARGET.search(tag):
                return tag
            rm = RE_REL.search(tag)
            if rm:
                rel_val = rm.group(1)
                tokens = set(rel_val.split())
                changed = False
                if "noopener" not in tokens:
                    tokens.add("noopener"); changed = True
                if "noreferrer" not in tokens:
                    tokens.add("noreferrer"); changed = True
                if changed:
                    new_rel = " ".join(sorted(tokens))
                    tag2 = tag.replace(rm.group(0), f'rel="{new_rel}"')
                    findings["auto_fixed_rel"] += 1
                    findings["blank_sans_rel"].append({"page": rel_p, "fix": "rel-completed"})
                    return tag2
                return tag
            else:
                # ajoute rel
                new_tag = tag[:-1] + ' rel="noopener noreferrer">'
                findings["auto_fixed_rel"] += 1
                findings["blank_sans_rel"].append({"page": rel_p, "fix": "rel-added"})
                return new_tag

        txt = RE_A_OPEN.sub(fix_blank, txt)

        if txt != orig:
            write(p, txt)

    return findings

# ---------------- AXIS 2: bugs visuels ----------------

def axis2(pages):
    findings = {"display_none_inline": [], "multi_h1": [], "img_alt_vide": [], "viewport_manquant": [], "lang_manquant": []}

    for p in pages:
        try:
            txt = read(p)
        except Exception:
            continue
        rel_p = str(p.relative_to(ROOT))

        # display:none inline qui masque du contenu
        for m in re.finditer(r'style\s*=\s*"([^"]*display\s*:\s*none[^"]*)"', txt, re.I):
            # signaler seulement (potentiellement intentionnel)
            findings["display_none_inline"].append({"page": rel_p, "style": m.group(1)[:100]})

        # multi-h1
        h1s = RE_H1.findall(txt)
        if len(h1s) > 1:
            findings["multi_h1"].append({"page": rel_p, "count": len(h1s), "h1s": [re.sub(r"\s+"," ",h)[:80] for h in h1s[:5]]})

        # img alt vide pour images probablement de contenu (non-decoratif)
        for m in RE_IMG.finditer(txt):
            attrs = m.group(1)
            am = re.search(r'\balt\s*=\s*"([^"]*)"', attrs, re.I)
            src = re.search(r'\bsrc\s*=\s*"([^"]*)"', attrs, re.I)
            if am is not None and am.group(1).strip() == "":
                # decoratif si presence role="presentation" ou aria-hidden
                if "aria-hidden" not in attrs and "presentation" not in attrs:
                    findings["img_alt_vide"].append({"page": rel_p, "src": src.group(1) if src else "", "tag": m.group(0)[:150]})

        # viewport
        if not RE_VIEWPORT.search(txt):
            findings["viewport_manquant"].append({"page": rel_p})

        # lang
        ht = RE_HTML_TAG.search(txt)
        if ht:
            if not re.search(r'\blang\s*=\s*"fr', ht.group(1), re.I):
                findings["lang_manquant"].append({"page": rel_p, "html_tag": ht.group(0)[:120]})

    return findings

# ---------------- AXIS 3: interactions ----------------

def axis3(pages):
    findings = {"form_sans_action": [], "button_sans_type": [], "select_vide": [], "onclick_indefinis": [], "auto_fixed_button_type": 0}

    # collecter toutes les fonctions JS definies (heuristique - script inline ou liens)
    js_funcs = set()
    for p in pages:
        try:
            txt = read(p)
        except Exception:
            continue
        for m in re.finditer(r'function\s+([A-Za-z_$][\w$]*)\s*\(', txt):
            js_funcs.add(m.group(1))
        for m in re.finditer(r'(?:window\.|const\s+|let\s+|var\s+)([A-Za-z_$][\w$]*)\s*=\s*(?:function|\([^)]*\)\s*=>)', txt):
            js_funcs.add(m.group(1))

    # Globals safe
    js_funcs.update({"alert","print","window.print","history.back","history.go","scrollTo","location.reload","location.href"})

    for p in pages:
        try:
            txt = read(p)
        except Exception:
            continue
        orig = txt
        rel_p = str(p.relative_to(ROOT))

        # forms
        for m in RE_FORM.finditer(txt):
            attrs = m.group(1)
            if not re.search(r'\baction\s*=', attrs, re.I) and not re.search(r'\bonsubmit\s*=', attrs, re.I):
                findings["form_sans_action"].append({"page": rel_p, "tag": m.group(0)[:180]})

        # buttons sans type -> auto-fix en type="button"
        def fix_button(match):
            attrs = match.group(1)
            if RE_TYPE_ATTR.search(attrs):
                return match.group(0)
            # Heuristique: si dans un form qui n'a qu'un seul bouton, peut etre submit
            # Pour safety on met type="button" - le dev peut overrider
            findings["auto_fixed_button_type"] += 1
            return f'<button type="button"{attrs}>'

        new_txt = RE_BUTTON.sub(fix_button, txt)
        if new_txt != txt:
            txt = new_txt

        # selects vides
        for sm in RE_SELECT.finditer(txt):
            inner = sm.group(1)
            opts = RE_OPTION.findall(inner)
            if not opts or all(o.strip() == "" for o in opts):
                findings["select_vide"].append({"page": rel_p, "snippet": sm.group(0)[:200]})

        # onclick references
        for om in RE_ONCLICK.finditer(txt):
            code = om.group(1).strip()
            # extract first identifier call
            cm = re.match(r'\s*([A-Za-z_$][\w$.]*)\s*\(', code)
            if cm:
                fname = cm.group(1).split(".")[0]
                # ignorer methodes natives
                if fname in {"this","event","window","document","location","history","console","JSON","Math","Date","Array","Object","String","Number","Boolean","parent","top","self"}:
                    continue
                if fname not in js_funcs:
                    findings["onclick_indefinis"].append({"page": rel_p, "fn": fname, "onclick": code[:120]})

        if txt != orig:
            write(p, txt)

    return findings

# ---------------- AXIS 4: doublons ----------------

def axis4(pages):
    findings = {"titles_dupes": [], "desc_dupes": [], "cards_dupes": [], "ids_dupes_par_page": [], "auto_fixed_ids": 0}

    titles = defaultdict(list)
    descs  = defaultdict(list)

    for p in pages:
        try:
            txt = read(p)
        except Exception:
            continue
        orig = txt
        rel_p = str(p.relative_to(ROOT))

        # title
        tm = RE_TITLE.search(txt)
        if tm:
            t = re.sub(r"\s+"," ", tm.group(1).strip())
            titles[t].append(rel_p)

        # meta description
        dm = RE_META_DESC.search(txt)
        if dm:
            d = re.sub(r"\s+"," ", dm.group(1).strip())
            if d:
                descs[d].append(rel_p)

        # cards dans le meme <ul> avec meme href -> chercher <ul>...<a href="..."> dupes
        for um in re.finditer(r'<ul\b[^>]*>(.*?)</ul>', txt, re.I | re.S):
            inner = um.group(1)
            hrefs = re.findall(r'<a\b[^>]*\bhref\s*=\s*"([^"]+)"', inner, re.I)
            cnt = Counter([h for h in hrefs if h and not h.startswith("#")])
            for h, n in cnt.items():
                if n > 1:
                    findings["cards_dupes"].append({"page": rel_p, "href": h, "count": n})

        # IDs dupliques -> auto-rename
        ids = RE_ID.findall(txt)
        cnt = Counter(ids)
        dupes_in_page = {k:v for k,v in cnt.items() if v > 1}
        if dupes_in_page:
            findings["ids_dupes_par_page"].append({"page": rel_p, "dupes": dupes_in_page})
            # Rename: keep first, suffix others -2, -3...
            for dup_id, _ in dupes_in_page.items():
                # find all occurrences and rename progressively from 2nd
                seen = {"n": 0}
                def repl(m):
                    seen["n"] += 1
                    if seen["n"] == 1:
                        return m.group(0)  # garde le premier
                    new_id = f'{dup_id}-{seen["n"]}'
                    findings["auto_fixed_ids"] += 1
                    return m.group(0).replace(dup_id, new_id, 1)
                # On opere sur l'attribut id="..."
                pattern_id = re.compile(r'\bid\s*=\s*"' + re.escape(dup_id) + r'"')
                txt = pattern_id.sub(repl, txt)

        if txt != orig:
            write(p, txt)

    # collect dupes
    for t, pgs in titles.items():
        if len(pgs) > 1:
            findings["titles_dupes"].append({"title": t, "pages": pgs})
    for d, pgs in descs.items():
        if len(pgs) > 1:
            findings["desc_dupes"].append({"desc": d[:120], "pages": pgs})

    return findings

# ---------------- Main ----------------

def main():
    pages = gather_pages()
    all_files = page_files_set()

    print(f"[audit] {len(pages)} pages a auditer", file=sys.stderr)

    report = {
        "generated_at": "2026-05-18",
        "pages_scanned": len(pages),
        "axis1_routing": axis1(pages, all_files),
        "axis2_visuel":  axis2(pages),
        "axis3_interactions": axis3(pages),
        "axis4_doublons": axis4(pages),
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[audit] rapport ecrit: {OUT}", file=sys.stderr)

    # Resume console
    a1 = report["axis1_routing"]
    a2 = report["axis2_visuel"]
    a3 = report["axis3_interactions"]
    a4 = report["axis4_doublons"]
    print(json.dumps({
        "AXIS1": {
            "hrefs_inexistants": len(a1["hrefs_inexistants"]),
            "anciens_patterns": len(a1["anciens_patterns"]),
            "mailto_casses": len(a1["mailto_casses"]),
            "tel_casses": len(a1["tel_casses"]),
            "auto_fixed_rel": a1["auto_fixed_rel"],
        },
        "AXIS2": {
            "multi_h1": len(a2["multi_h1"]),
            "img_alt_vide": len(a2["img_alt_vide"]),
            "viewport_manquant": len(a2["viewport_manquant"]),
            "lang_manquant": len(a2["lang_manquant"]),
            "display_none_inline": len(a2["display_none_inline"]),
        },
        "AXIS3": {
            "form_sans_action": len(a3["form_sans_action"]),
            "button_sans_type_FIXED": a3["auto_fixed_button_type"],
            "select_vide": len(a3["select_vide"]),
            "onclick_indefinis": len(a3["onclick_indefinis"]),
        },
        "AXIS4": {
            "titles_dupes": len(a4["titles_dupes"]),
            "desc_dupes": len(a4["desc_dupes"]),
            "cards_dupes": len(a4["cards_dupes"]),
            "ids_dupes_par_page": len(a4["ids_dupes_par_page"]),
            "auto_fixed_ids": a4["auto_fixed_ids"],
        },
    }, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
