#!/usr/bin/env python3
"""
Injecte <script src="assets/hc-address-autocomplete.js"></script>
juste avant </body> dans tous les fichiers HTML qui ont un champ adresse,
sauf ceux déjà patchés.
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

SCRIPT_TAG = '<script src="assets/hc-address-autocomplete.js" defer></script>'
MARKER = 'hc-address-autocomplete.js'

# Pattern : on insère juste avant </body>
PATTERN = re.compile(r'(\n?</body>)', re.IGNORECASE)

updated = 0
skipped = 0
no_body = []
no_addr = []

for html in ROOT.glob('*.html'):
    if html.name.endswith('.bak.before-minify'):
        continue
    text = html.read_text(encoding='utf-8')

    # Skip si pas de champ adresse dans le fichier
    if 'name="adresse"' not in text and 'name="address"' not in text and 'data-hc-address' not in text:
        no_addr.append(html.name)
        continue

    if MARKER in text:
        skipped += 1
        continue

    if not PATTERN.search(text):
        no_body.append(html.name)
        continue

    new_text = PATTERN.sub('\n' + SCRIPT_TAG + r'\1', text, count=1)
    html.write_text(new_text, encoding='utf-8')
    updated += 1
    print(f'  ✔ {html.name}')

# Aussi pour les sous-dossiers admin-pro (utile si lead capture)
# (skip car formulaire admin, pas public)

print(f'\nUpdated: {updated}')
print(f'Skipped (déjà patchés): {skipped}')
print(f'Sans champ adresse: {len(no_addr)}')
if no_body:
    print(f'Pas de </body>: {no_body}')
