#!/usr/bin/env python3
"""
Simplifie le menu "Zones" en transformant le dropdown 1-entrée en lien direct.

AVANT:
  <a href="zones-intervention.html" class="hc-nav-link" data-has-menu="zones">
    Zones
    <svg> chevron </svg>
  </a>
  ...
  <div class="hc-megamenu hc-megamenu-zones" data-menu="zones">...</div>

APRÈS:
  <a href="zones-intervention.html" class="hc-nav-link">Zones d'intervention</a>
  (megamenu-zones supprimé)
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Pattern 1 : Remplacer le lien "Zones" avec chevron
LINK_PATTERN = re.compile(
    r'<a\s+href="zones-intervention\.html"\s+class="hc-nav-link"\s+data-has-menu="zones"\s*>\s*'
    r'Zones\s*'
    r'<svg[^>]*>(?:[^<]|<(?!/svg>))*</svg>\s*'
    r'</a>',
    re.DOTALL
)
LINK_REPLACE = '<a href="zones-intervention.html" class="hc-nav-link">Zones d\'intervention</a>'

# Pattern 2 : Supprimer le bloc megamenu-zones
MEGAMENU_PATTERN = re.compile(
    r'\s*<!--\s*[^-]*-->\s*'
    r'<div class="hc-megamenu hc-megamenu-zones" data-menu="zones"[^>]*>'
    r'(?:.|\n)*?</div>\s*',
    re.MULTILINE
)
# Simpler version
MEGAMENU_SIMPLE = re.compile(
    r'<div class="hc-megamenu hc-megamenu-zones"[^>]*>(?:.|\n)*?</div>',
    re.MULTILINE
)

updated = 0
no_match = []

for html in ROOT.glob('*.html'):
    if html.name.endswith('.bak.before-minify'):
        continue
    text = html.read_text(encoding='utf-8')
    original = text

    # Replace the link
    text, n_link = LINK_PATTERN.subn(LINK_REPLACE, text, count=1)

    # Replace the megamenu block
    text, n_menu = MEGAMENU_SIMPLE.subn('', text)

    if text != original:
        html.write_text(text, encoding='utf-8')
        updated += 1
        print(f'  ✔ {html.name} (link={n_link}, menu_removed={n_menu})')
    else:
        no_match.append(html.name)

print(f'\nUpdated: {updated} files')
print(f'No change: {len(no_match)}')
