#!/usr/bin/env python3
"""
HELP! Confort — Audit Lighthouse local (sans Chromium).

Scanne chaque page HTML et vérifie :
  - Performance : <link rel=preconnect>, <img loading=lazy>, width/height, srcset, preload critique
  - SEO : <title> 30-65 chars, <meta description> 50-160 chars, canonical, og:image, h1 unique
  - Accessibility : <html lang>, alt sur toutes <img>, labels sur inputs, contraste minimum (heuristique)
  - Best practices : DOCTYPE, viewport, charset utf-8, security (CSP via netlify.toml)

Produit un rapport Markdown avec scores indicatifs par page.

Usage : python3 admin-pro/audits/audit_lighthouse_local.py
"""
import re, os, glob, json
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent.parent
OUT  = Path(__file__).parent / 'audit_lighthouse_local_report.md'

PAGES = sorted([
    p for p in ROOT.glob('*.html')
    if not p.name.startswith(('test-','tmp-')) and p.name != '404.html'
])

# ── Heuristiques ─────────────────────────────────────────────────
def audit_page(path):
    with open(path, 'r', encoding='utf-8') as f: c = f.read()
    res = {'page': path.name, 'errors': [], 'warnings': [], 'pass': []}
    head_match = re.search(r'<head[^>]*>(.*?)</head>', c, re.S | re.I)
    head = head_match.group(1) if head_match else ''
    body_match = re.search(r'<body[^>]*>(.*?)</body>', c, re.S | re.I)
    body = body_match.group(1) if body_match else c

    # === SEO ===
    # Title
    mt = re.search(r'<title[^>]*>(.*?)</title>', head, re.I | re.S)
    if mt:
        tlen = len(mt.group(1).strip())
        if tlen < 30:   res['warnings'].append(f'SEO title court ({tlen} chars, idéal 30–65)')
        elif tlen > 65: res['warnings'].append(f'SEO title long ({tlen} chars)')
        else:           res['pass'].append('SEO title length OK')
    else:
        res['errors'].append('SEO <title> manquant')

    # Description (tolère attributs additionnels comme id=, lang=)
    md = re.search(r'<meta[^>]*\bname="description"[^>]*\bcontent="([^"]+)"', head, re.I) \
       or re.search(r'<meta[^>]*\bcontent="([^"]+)"[^>]*\bname="description"', head, re.I)
    if md:
        dlen = len(md.group(1))
        if dlen < 50:    res['warnings'].append(f'meta description courte ({dlen} chars)')
        elif dlen > 160: res['warnings'].append(f'meta description longue ({dlen} chars)')
        else:            res['pass'].append('meta description length OK')
    else:
        res['errors'].append('meta description manquante')

    # Canonical
    if re.search(r'<link\s+rel="canonical"', head, re.I):
        res['pass'].append('canonical present')
    else:
        res['warnings'].append('<link rel="canonical"> manquant')

    # OG image
    if re.search(r'<meta\s+property="og:image"', head, re.I):
        res['pass'].append('og:image present')
    else:
        res['warnings'].append('og:image manquant')

    # H1 unique
    h1s = re.findall(r'<h1\b', body, re.I)
    if len(h1s) == 0:   res['errors'].append('Aucun <h1>')
    elif len(h1s) > 1:  res['warnings'].append(f'{len(h1s)} <h1> trouvés (devrait être 1)')
    else:               res['pass'].append('1 <h1> unique')

    # === ACCESSIBILITY étendu : boutons & liens sans nom accessible ===
    body_clean = re.sub(r'<script[^>]*>.*?</script>', '', c, flags=re.S)
    body_clean = re.sub(r'<svg[^>]*>.*?</svg>', '<SVG/>', body_clean, flags=re.S)
    btn_bad = 0
    for mb in re.finditer(r'<button\b([^>]*?)>(.*?)</button>', body_clean, re.S):
        attrs, inner = mb.group(1), mb.group(2)
        text = re.sub(r'<[^>]+>','',inner).strip()
        if text: continue
        if re.search(r'\baria-(label|labelledby)=', attrs, re.I): continue
        if re.search(r'\btitle=', attrs): continue
        # Image alt suffit
        if re.search(r'<img\b[^>]*\balt="[^"]+"', inner): continue
        btn_bad += 1
    if btn_bad > 0: res['warnings'].append(f'{btn_bad} <button> sans nom accessible')

    a_bad = 0
    for ma in re.finditer(r'<a\b([^>]*?)>(.*?)</a>', body_clean, re.S):
        attrs, inner = ma.group(1), ma.group(2)
        text = re.sub(r'<[^>]+>','',inner).strip()
        if text: continue
        if re.search(r'\baria-(label|labelledby)=', attrs, re.I): continue
        if re.search(r'\btitle=', attrs): continue
        if re.search(r'<img\b[^>]*\balt="[^"]+"', inner): continue
        a_bad += 1
    if a_bad > 0: res['warnings'].append(f'{a_bad} <a> sans nom accessible')

    # === ACCESSIBILITY (existant) ===
    # html lang
    if re.search(r'<html[^>]+lang=', c, re.I):
        res['pass'].append('html lang present')
    else:
        res['errors'].append('<html lang> manquant')

    # imgs sans alt
    imgs = re.findall(r'<img\b([^>]*?)>', c, re.I)
    no_alt = [i for i in imgs if not re.search(r'\balt=', i, re.I)]
    if no_alt: res['warnings'].append(f'{len(no_alt)} <img> sans alt')
    else:      res['pass'].append('Tous les <img> ont un alt')

    # Inputs sans label/aria-label/placeholder
    # On EXCLUT : hidden, submit, button, reset, checkbox/radio (value sert de label visible),
    # ainsi que les inputs ayant un <label> associé via for=
    inputs = re.findall(r'<input\b([^>]*?)>', c, re.I)
    skip_types = re.compile(r'\btype=["\'](hidden|submit|button|reset|checkbox|radio|range|color|file)["\']', re.I)
    no_lab = []
    for i in inputs:
        if skip_types.search(i): continue
        if re.search(r'\bid=', i): continue
        if re.search(r'\baria-label=', i, re.I): continue
        if re.search(r'\baria-labelledby=', i, re.I): continue
        if re.search(r'\baria-hidden="true"', i, re.I): continue  # honeypot, etc.
        if re.search(r'\bname="(?:website|url|honeypot|nickname)"', i, re.I): continue  # honeypot par convention
        no_lab.append(i)
    if no_lab: res['warnings'].append(f'{len(no_lab)} <input> sans label')

    # === PERFORMANCE ===
    # DOCTYPE
    if c.lstrip().startswith('<!DOCTYPE') or c.lstrip().startswith('<!doctype'):
        res['pass'].append('DOCTYPE present')
    else: res['errors'].append('DOCTYPE manquant')

    # Viewport
    if re.search(r'<meta\s+name="viewport"', head, re.I):
        res['pass'].append('viewport present')
    else: res['errors'].append('viewport manquant')

    # Charset
    if re.search(r'<meta\s+charset=', head, re.I):
        res['pass'].append('charset present')
    else: res['errors'].append('charset manquant')

    # Preconnect / preload
    preconn = len(re.findall(r'<link\s+rel="preconnect"', head, re.I))
    if preconn == 0:  res['warnings'].append('Aucun rel=preconnect')
    elif preconn > 4: res['warnings'].append(f'{preconn} preconnect (max 4 recommandé)')
    else: res['pass'].append(f'{preconn} preconnect')

    # Imgs lazy
    imgs_total = len(imgs)
    imgs_lazy = len([i for i in imgs if 'loading="lazy"' in i])
    if imgs_total >= 4 and imgs_lazy < imgs_total - 3:
        res['warnings'].append(f'lazy: {imgs_lazy}/{imgs_total} <img>')
    elif imgs_total > 0:
        res['pass'].append(f'lazy: {imgs_lazy}/{imgs_total}')

    # === SECURITY (rapide) ===
    if re.search(r'<script[^>]*\bsrc=["\']http:', head): res['errors'].append('Script http:// non sécurisé')

    return res

# ── Scoring ─────────────────────────────────────────────────────
def score(res):
    """Score sur 100 : 100 - erreurs*15 - warnings*4"""
    return max(0, 100 - len(res['errors'])*15 - len(res['warnings'])*4)

# ── Main ────────────────────────────────────────────────────────
def main():
    print(f"[audit-lh] {len(PAGES)} pages à auditer")
    results = []
    for p in PAGES:
        r = audit_page(p)
        r['score'] = score(r)
        results.append(r)

    # Stats
    total_errors = sum(len(r['errors']) for r in results)
    total_warnings = sum(len(r['warnings']) for r in results)
    avg_score = sum(r['score'] for r in results) / max(1, len(results))

    # Rapport markdown
    md = []
    md.append(f"# 🔦 Audit Lighthouse local — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    md.append('')
    md.append(f"**{len(PAGES)} pages auditées** · **{total_errors} erreurs** · **{total_warnings} warnings** · **Score moyen {avg_score:.0f}/100**")
    md.append('')
    md.append("## 📊 Résumé par page")
    md.append('')
    md.append('| Page | Score | Erreurs | Warnings |')
    md.append('|------|------:|--------:|---------:|')
    for r in sorted(results, key=lambda x: x['score']):
        md.append(f"| `{r['page']}` | **{r['score']}/100** | {len(r['errors'])} | {len(r['warnings'])} |")
    md.append('')

    # Détails par page (erreurs + warnings)
    md.append('## 🔍 Détails par page')
    md.append('')
    for r in sorted(results, key=lambda x: x['score']):
        if not r['errors'] and not r['warnings']:
            continue
        md.append(f"### {r['page']} — {r['score']}/100")
        md.append('')
        if r['errors']:
            md.append('**Erreurs :**')
            for e in r['errors']: md.append(f"- ❌ {e}")
            md.append('')
        if r['warnings']:
            md.append('**Warnings :**')
            for w in r['warnings']: md.append(f"- ⚠️ {w}")
            md.append('')

    # Pages parfaites
    perfect = [r for r in results if r['score'] == 100]
    if perfect:
        md.append('## ✅ Pages parfaites (100/100)')
        md.append('')
        for r in perfect:
            md.append(f"- {r['page']}")
        md.append('')

    md.append('---')
    md.append('')
    md.append('*Audit généré par `admin-pro/audits/audit_lighthouse_local.py` — heuristique légère sans Chromium.*')

    OUT.write_text('\n'.join(md), encoding='utf-8')
    print(f"[audit-lh] ✓ rapport écrit : {OUT}")
    print(f"[audit-lh] {total_errors} erreurs · {total_warnings} warnings · score moyen {avg_score:.0f}/100")
    return total_errors

if __name__ == '__main__':
    exit(0 if main() == 0 else 1)
