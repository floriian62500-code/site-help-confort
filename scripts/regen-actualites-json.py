#!/usr/bin/env python3
"""
Régénère content/actualites/index.json depuis les fichiers HTML dans /actualites/.
Extrait : title, date, categorie, zone, resume, url depuis chaque page.
Conserve les stats existantes pour les articles déjà présents.
"""
import re
import json
import pathlib
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
ACTUS_DIR = ROOT / 'actualites'
JSON_PATH = ROOT / 'content' / 'actualites' / 'index.json'

# Charger l'existant pour conserver stats + source_facebook
existing = {}
if JSON_PATH.exists():
    try:
        for a in json.loads(JSON_PATH.read_text(encoding='utf-8')):
            existing[a.get('url', '')] = a
    except Exception:
        pass

articles = []
for html in sorted(ACTUS_DIR.glob('*.html'), reverse=True):
    text = html.read_text(encoding='utf-8')

    # Date depuis le nom de fichier YYYY-MM-DD-...
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})-', html.name)
    if m:
        date_iso = f'{m.group(1)}-{m.group(2)}-{m.group(3)}T11:00:00'
    else:
        date_iso = '2026-01-01T11:00:00'

    # Titre depuis <h1> ou <title>
    title_m = re.search(r'<h1[^>]*>(.*?)</h1>', text, re.S)
    if not title_m:
        title_m = re.search(r'<title[^>]*>(.*?)</title>', text, re.S)
    title = re.sub(r'<[^>]+>', '', title_m.group(1)).strip() if title_m else html.stem
    title = re.sub(r'\s*\|.*$', '', title).strip()  # remove " | HELP! Confort"

    # Categorie depuis tag/badge ou défaut
    cat_m = re.search(r'CONSEILS|S[ÉE]CURIT[ÉE]|AGENCE|R[ÉE]GLEMENTATION|ACTUALIT[ÉE]|SAISONNIER|[ÉE]CONOMIES', text)
    cat_map = {'CONSEILS': 'Conseils', 'SÉCURITÉ': 'Sécurité', 'SECURITE': 'Sécurité',
               'AGENCE': 'Agence', 'RÉGLEMENTATION': 'Réglementation',
               'REGLEMENTATION': 'Réglementation', 'SAISONNIER': 'Saisonnier',
               'ÉCONOMIES': 'Économies', 'ECONOMIES': 'Économies'}
    categorie = cat_map.get(cat_m.group(0).upper() if cat_m else '', 'Conseils')

    # Resume depuis meta description
    desc_m = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', text)
    resume = desc_m.group(1).strip() if desc_m else title

    # Image og:image
    og_m = re.search(r'<meta\s+property="og:image"\s+content="([^"]+)"', text)
    og_image = og_m.group(1).strip() if og_m else ''
    # Première image dans le contenu si pas d'og:image
    if not og_image:
        img_m = re.search(r'<img[^>]+src="([^"]+)"', text)
        if img_m:
            og_image = img_m.group(1).strip()

    # Source Facebook (cherche un lien vers facebook.com)
    fb_m = re.search(r'href="(https://(?:www\.)?facebook\.com/[^"]+)"', text)
    source_facebook = fb_m.group(1).strip() if fb_m else ''

    url = f'actualites/{html.name}'
    prev = existing.get(url, {})

    articles.append({
        'title': title,
        'date': date_iso,
        'categorie': categorie,
        'zone': prev.get('zone', 'Les deux'),
        'resume': resume,
        'image': prev.get('image') or og_image,
        'url': url,
        'published': True,
        'source_facebook': prev.get('source_facebook') or source_facebook,
        'stats': prev.get('stats', {'vues': 0, 'reactions': 0, 'partages': 0})
    })

# Trier par date desc
articles.sort(key=lambda a: a['date'], reverse=True)

# Backup avant écriture
backup = JSON_PATH.with_suffix('.json.bak')
if JSON_PATH.exists():
    backup.write_text(JSON_PATH.read_text(encoding='utf-8'), encoding='utf-8')

JSON_PATH.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'✔ {len(articles)} articles écrits dans {JSON_PATH.relative_to(ROOT)}')
print(f'  Plus récent : {articles[0]["date"][:10]} — {articles[0]["title"][:60]}')
print(f'  Plus ancien : {articles[-1]["date"][:10]} — {articles[-1]["title"][:60]}')
