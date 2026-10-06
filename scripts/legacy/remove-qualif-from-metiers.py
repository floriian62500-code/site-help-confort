#!/usr/bin/env python3
"""
Retire les blocs <section class="m-qualif">...</section> des 5 pages métier.
Garde le CSS mq- (utile si on réutilise plus tard, par ex sur home).
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Pattern : section qualification 3 voies (depuis le commentaire bouton de section jusqu'à </section>)
# On vise tous les commentaires de bloc qualif + section
PATTERNS = [
    re.compile(r'<!--\s*═+\s*\n\s*(?:QUALIFICATION 3 BLOCS|2\. QUALIFICATION).*?</section>\s*', re.DOTALL),
    re.compile(r'<section class="m-qualif"[^>]*>.*?</section>\s*', re.DOTALL),
]

updated = 0
for html in ROOT.glob('*.html'):
    if html.name.endswith('.bak.before-minify'):
        continue
    text = html.read_text(encoding='utf-8')
    if 'm-qualif' not in text:
        continue
    original = text
    for p in PATTERNS:
        text = p.sub('', text)
    if text != original:
        html.write_text(text, encoding='utf-8')
        updated += 1
        print(f'  ✔ {html.name}')

print(f'\nUpdated: {updated} fichiers')
