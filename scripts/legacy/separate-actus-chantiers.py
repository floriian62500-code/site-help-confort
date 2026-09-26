#!/usr/bin/env python3
"""
Sépare proprement ACTUALITÉS (marketing/communication) vs CHANTIERS (vraies interventions).

Règle :
- TITLE commence par "Remplacement de" + détail technique → CHANTIER
- TITLE commence par "Votre X est abîmé/fissuré/...", "Envie de", "Pourquoi", "Vitre cassée?" → ACTUALITÉ
- TITLE contient "Vœux", "Toute l'équipe", "✨" → ACTUALITÉ (communication)
- TITLE "Cellier – Travaux de plafond" → CHANTIER (intervention réelle)
"""
import json
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

REAL_PATH = ROOT / 'content' / 'realisations' / 'index.json'
ACTU_PATH = ROOT / 'content' / 'actualites' / 'index.json'


def classify(title):
    """Renvoie 'chantier' ou 'actualite' selon les règles."""
    t = title.strip().lower()
    # Marqueurs marketing/communication
    marketing_prefixes = [
        'votre ', 'envie de', 'envie d\'', 'pourquoi',
        'en plein hiver', 'toute l\'équipe', 'toute l\\u2019équipe',
        '✨', '✓', 'vitre d\'insert', 'vitre d\\u2019insert',
        'help confort',
    ]
    if any(t.startswith(p) for p in marketing_prefixes):
        return 'actualite'
    # Mots-clés marketing dans le titre (call to action)
    if any(kw in t for kw in ['vœux', 'vœux', 'vous adresse', 'sinvite sur vos écrans', 's’invite sur vos écrans']):
        return 'actualite'
    # Marqueurs chantier (action concrète réalisée)
    chantier_prefixes = ['remplacement de', 'remplacement ', 'cellier', 'pose ', 'installation de', 'rénovation de', 'dépannage ', 'réparation de']
    if any(t.startswith(p) for p in chantier_prefixes):
        return 'chantier'
    # Par défaut : actualité (plus prudent — un vrai chantier sera explicitement préfixé)
    return 'actualite'


# Charger les 2 JSON existants
with open(REAL_PATH, 'r', encoding='utf-8') as f:
    reals = json.load(f)
with open(ACTU_PATH, 'r', encoding='utf-8') as f:
    actus = json.load(f)

# Backup
(REAL_PATH.with_suffix('.json.bak')).write_text(json.dumps(reals, ensure_ascii=False, indent=2), encoding='utf-8')

# Classifier toutes les entrées de realisations.json
print('=== CLASSIFICATION DES ENTRÉES "realisations.json" ===')
true_chantiers = []
moved_to_actus = []
for r in reals:
    title = r.get('title', '')
    cls = classify(title)
    if cls == 'chantier':
        # Ajouter type='chantier' et conserver
        r['type'] = 'chantier'
        true_chantiers.append(r)
        print(f'  ✅ CHANTIER  : {title[:65]}')
    else:
        # Déplacer vers actualités
        moved_to_actus.append({
            'title': r.get('title', ''),
            'date': r.get('date', ''),
            'categorie': r.get('metier', 'Conseils'),
            'zone': r.get('zone', 'Saint-Omer'),
            'resume': r.get('description', ''),
            'image': r.get('photo_apres', ''),
            'url': r.get('url', ''),
            'published': r.get('published', True),
            'source_facebook': r.get('source_facebook', ''),
            'stats': r.get('stats', {'vues': 0, 'reactions': 0, 'partages': 0}),
            'type': 'actualite'
        })
        print(f'  📰 ACTUALITÉ : {title[:65]}')

# Marquer les actualités existantes type='actualite' si absent
for a in actus:
    if 'type' not in a:
        a['type'] = 'actualite'

# Fusionner sans doublons (par URL)
urls_in_actus = {a.get('url') for a in actus}
for m in moved_to_actus:
    if m.get('url') and m['url'] not in urls_in_actus:
        actus.append(m)
        urls_in_actus.add(m['url'])

# Trier par date desc
actus.sort(key=lambda a: a.get('date', ''), reverse=True)
true_chantiers.sort(key=lambda r: r.get('date', ''), reverse=True)

# Écrire
REAL_PATH.write_text(json.dumps(true_chantiers, ensure_ascii=False, indent=2), encoding='utf-8')
ACTU_PATH.write_text(json.dumps(actus, ensure_ascii=False, indent=2), encoding='utf-8')

print(f'\n=== RÉSULTAT ===')
print(f'  ✅ Vrais chantiers conservés dans realisations.json : {len(true_chantiers)}')
print(f'  📰 Actualités totales dans actualites.json : {len(actus)}')
print(f'  🔄 Entrées déplacées realisations → actualites : {len(moved_to_actus)}')
