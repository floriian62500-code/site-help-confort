#!/usr/bin/env python3
"""
HELP! Confort — Générateur d'images Open Graph 1200×630.

Lit chaque page HTML publique, extrait <title> et le métier (depuis le slug du fichier),
et génère une image OG brandée dans /og/{slug}.png.

Couleurs HC :
    - Cyan primaire : #0DA0CF / dégradé vers #1FC4F0
    - Orange accent : #FF6B1A
    - Indigo nuit  : #0A1428
    - Blanc       : #ffffff

Usage : python3 scripts/gen_og_images.py
"""
import re, os, glob
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OG_DIR = ROOT / 'og'
OG_DIR.mkdir(exist_ok=True)

# ─── Polices ──────────────────────────────────────────────────────
FONT_CANDIDATES = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/Library/Fonts/Arial.ttf',
]
def load_font(size, bold=False):
    for f in FONT_CANDIDATES:
        if os.path.exists(f):
            try: return ImageFont.truetype(f, size=size)
            except: pass
    return ImageFont.load_default()

# ─── Détection du métier depuis le slug ───────────────────────────
# Match EXACT du slug d'abord, puis fallback startswith. Ordre = priorité.
METIER_EXACT = {
    'index':           ('Accueil',        '#0DA0CF'),
    'a-propos':        ('À propos',       '#0A1428'),
    'contact':         ('Contact',        '#FF6B1A'),
    'faq':             ('FAQ',            '#0DA0CF'),
    'aides':           ('Aides & TVA',    '#22A06B'),
    'pro':             ('Pro & Bailleurs','#1E40AF'),
    'sinistres':       ('Sinistres',      '#DC2626'),
    'carrieres':       ('Carrières',      '#7C3AED'),
    'temoignages':     ('Témoignages',    '#FFB400'),
    'avant-apres':     ('Avant / Après',  '#FF6B1A'),
    'realisation':     ('Réalisations',   '#22A06B'),
    'realisations':    ('Réalisations',   '#22A06B'),
    'processus':       ('Notre méthode',  '#22A06B'),
    'actualites':      ('Actualités',     '#FFB400'),
    'mentions-legales':('Mentions',       '#475569'),
    'espace-client':   ('Espace client',  '#7C3AED'),
    'devis-express':   ('Devis express',  '#FF6B1A'),
    'nos-prestations': ('Prestations',    '#0DA0CF'),
    'zones-intervention':('Zones',        '#0DA0CF'),
    'guides':          ('Guides',         '#0DA0CF'),
    'blog':            ('Blog',           '#0DA0CF'),
    'contrats-entretien':('Contrats',     '#22A06B'),
}
METIER_PREFIX = [
    ('plombier-',     ('Plomberie',     '#0DA0CF')),
    ('chauffagiste-', ('Chauffage',     '#FF6B1A')),
    ('electricien-',  ('Électricité',   '#FFB400')),
    ('serrurier-',    ('Serrurerie',    '#EC4899')),
    ('travaux-',      ('Travaux',       '#22A06B')),
    ('vitrier-',      ('Vitrerie',      '#16A34A')),
    ('volets-',       ('Volets',        '#7C3AED')),
    ('pmr-',          ('Adaptation PMR','#0DA0CF')),
    ('depannage-',    ('Dépannage',     '#0DA0CF')),
    ('guide-',        ('Guide',         '#0DA0CF')),
]
def metier_for(slug):
    if slug in METIER_EXACT: return METIER_EXACT[slug]
    for prefix, val in METIER_PREFIX:
        if slug.startswith(prefix): return val
    return ('HELP Confort', '#0DA0CF')

# ─── Extraction title + description depuis le HTML ────────────────
def parse_html_meta(path):
    with open(path, 'r', encoding='utf-8') as f: html = f.read()
    title = ''
    m = re.search(r'<title>(.*?)</title>', html, re.S | re.I)
    if m:
        title = re.sub(r'\s*\|\s*HELP!?\s*Confort.*$', '', m.group(1).strip(), flags=re.I)
        title = re.sub(r'\s+', ' ', title).strip()
    h1 = ''
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S | re.I)
    if m:
        h1 = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        h1 = re.sub(r'\s+', ' ', h1)
    return title, h1

# ─── Génération d'une image OG ────────────────────────────────────
def make_og(path):
    slug = Path(path).stem
    title, h1 = parse_html_meta(path)
    metier_label, metier_color = metier_for(slug)

    # Texte principal : on préfère le H1 plus court, sinon le title
    display_title = h1 if h1 and len(h1) < 80 else title
    if not display_title:
        display_title = slug.replace('-', ' ').title()

    W, H = 1200, 630
    img = Image.new('RGB', (W, H), (10, 20, 40))
    draw = ImageDraw.Draw(img)

    # Dégradé de fond : indigo → cyan
    for y in range(H):
        t = y / H
        r = int(10  + (13 - 10)  * t)
        g = int(20  + (40 - 20)  * t)
        b = int(40  + (90 - 40)  * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Cercle "brand glow" en bas-droite
    glow_color = tuple(int(metier_color[i:i+2], 16) for i in (1, 3, 5))
    for r in range(380, 0, -8):
        alpha = max(0, int(80 * (1 - r/380)))
        c = (glow_color[0], glow_color[1], glow_color[2])
        layer = Image.new('RGBA', (W, H), (0,0,0,0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse([(W - 200 - r, H - 200 - r), (W - 200 + r, H - 200 + r)], fill=c + (alpha,))
        img.paste(Image.alpha_composite(img.convert('RGBA'), layer).convert('RGB'))

    # Badge métier en haut-gauche
    badge_h = 56
    badge_w = 0
    badge_font = load_font(24)
    bx0, by0 = 64, 64
    tw = draw.textlength(metier_label.upper(), font=badge_font)
    badge_w = int(tw + 56)
    # rounded rectangle simulé par 2 rectangles + 2 ellipses (PIL bourreaux d'arrondi natif depuis Pillow 8.2)
    try:
        draw.rounded_rectangle([(bx0, by0), (bx0 + badge_w, by0 + badge_h)], radius=28, fill=glow_color)
    except AttributeError:
        draw.rectangle([(bx0, by0), (bx0 + badge_w, by0 + badge_h)], fill=glow_color)
    draw.text((bx0 + 28, by0 + 14), metier_label.upper(), font=badge_font, fill=(255,255,255))

    # Logo HC en haut-droite (texte stylisé "HELP Confort")
    logo_font = load_font(34)
    logo_text = "HELP Confort"
    lw = draw.textlength(logo_text, font=logo_font)
    lx = W - 64 - int(lw)
    draw.text((lx, 80), logo_text, font=logo_font, fill=(255,255,255))
    # sous-ligne logo
    sub_font = load_font(16)
    sub = "Dépannage · Travaux · Saint-Omer & Dunkerque"
    sw = draw.textlength(sub, font=sub_font)
    draw.text((W - 64 - int(sw), 124), sub, font=sub_font, fill=(255,255,255, 200))

    # Titre principal centré-bas
    title_font = load_font(64)
    # Wrap manuel à ~22 chars par ligne
    words = display_title.split()
    lines = []
    line = ''
    max_w = W - 128
    for w in words:
        trial = (line + ' ' + w).strip()
        if draw.textlength(trial, font=title_font) <= max_w:
            line = trial
        else:
            if line: lines.append(line)
            line = w
    if line: lines.append(line)
    lines = lines[:3]  # max 3 lignes

    total_h = len(lines) * 78
    y = (H - total_h) // 2 + 30
    for ln in lines:
        tw = draw.textlength(ln, font=title_font)
        draw.text((64, y), ln, font=title_font, fill=(255,255,255))
        y += 78

    # Footer URL + tel
    foot_font = load_font(22)
    foot = "depan59-62.fr  ·  03 66 10 01 34"
    draw.text((64, H - 70), foot, font=foot_font, fill=(255,255,255, 200))

    # Save
    out = OG_DIR / f"{slug}.png"
    img.save(out, 'PNG', optimize=True)
    return out, display_title, metier_label

# ─── Main ─────────────────────────────────────────────────────────
if __name__ == '__main__':
    pages = sorted([
        p for p in ROOT.glob('*.html')
        if not p.name.startswith(('test-','tmp-')) and p.name != '404.html'
    ])
    print(f"[og] {len(pages)} pages à traiter")
    n_done = 0
    for p in pages:
        try:
            out, title, metier = make_og(p)
            print(f"  ✓ {p.name:50s} → {out.name} ({metier})")
            n_done += 1
        except Exception as e:
            print(f"  ✗ {p.name}: {e}")
    print(f"\n[og] {n_done}/{len(pages)} images OG générées dans /og/")
