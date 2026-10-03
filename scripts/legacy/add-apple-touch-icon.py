#!/usr/bin/env python3
"""
Ajoute <link rel="apple-touch-icon"> dans toutes les pages HTML qui ne l'ont pas.
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

NEW_TAG = '\n<link rel="apple-touch-icon" sizes="180x180" href="/logo-officiel.jpg">'

# On insère après la balise <link rel="icon">
PATTERN = re.compile(r'(<link\s+rel="icon"[^>]*>)', re.I)

updated = 0
no_match = []
already = []

for html in ROOT.glob('*.html'):
    if html.name.endswith('.bak.before-minify'):
        continue
    text = html.read_text(encoding='utf-8')
    if 'apple-touch-icon' in text:
        already.append(html.name)
        continue
    m = PATTERN.search(text)
    if not m:
        no_match.append(html.name)
        continue
    new_text = text[:m.end()] + NEW_TAG + text[m.end():]
    html.write_text(new_text, encoding='utf-8')
    updated += 1
    print(f'  ✔ {html.name}')

print(f'\nUpdated: {updated}')
print(f'Already have apple-touch-icon: {len(already)}')
print(f'No <link rel="icon"> found: {len(no_match)}')
for n in no_match[:5]: print(f'  - {n}')
