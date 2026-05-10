#!/usr/bin/env python3
"""Injecte la topbar globale (agence + zones + horaires) au-dessus du <header> sur toutes les pages."""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TOPBAR_HTML = '''<!-- TOPBAR globale : badge réseau + zones + horaires (visible toutes pages) -->
<div class="hc-topbar" role="complementary" aria-label="Agence et zones d'intervention">
  <div class="hc-topbar-inner">
    <span class="hctb-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      Agence officielle Réseau HELP! Confort
    </span>
    <span class="hctb-divider" aria-hidden="true"></span>
    <span class="hctb-zones">
      <a href="depannage-saint-omer.html" class="hctb-zone">
        <span class="hctb-pulse" aria-hidden="true"></span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <strong>Saint-Omer</strong>
      </a>
      <span class="hctb-plus" aria-hidden="true">+</span>
      <a href="depannage-dunkerque.html" class="hctb-zone">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <strong>Dunkerque</strong>
      </a>
      <span class="hctb-bullet" aria-hidden="true">·</span>
      <span class="hctb-hours">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <strong>Lun-Sam · 8h-18h</strong>
      </span>
    </span>
  </div>
</div>

'''

# Marqueur pour éviter double injection
MARKER = 'class="hc-topbar"'

# Pattern qui matche <header class="header" ou <header class="hc-header"
HEADER_PATTERN = re.compile(r'(<!--\s*=+\s*HEADER\s*=+\s*-->\s*)?<header\b[^>]*>', re.IGNORECASE)

EXCLUDED_DIRS = {'admin', 'actualites', 'node_modules', '.git', 'scripts', 'content', 'images', 'videos'}
EXCLUDED_FILES = set()  # on inclut maintenant 404 aussi

def list_html_files(root):
    files = []
    for entry in os.listdir(root):
        path = os.path.join(root, entry)
        if os.path.isfile(path) and entry.endswith('.html') and entry not in EXCLUDED_FILES:
            files.append(path)
    return files

def inject(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if MARKER in content:
        return ('skip', 'déjà présent')
    match = HEADER_PATTERN.search(content)
    if not match:
        return ('skip', 'pas de <header> détecté')
    insert_pos = match.start()
    new_content = content[:insert_pos] + TOPBAR_HTML + content[insert_pos:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return ('ok', 'injecté')

def main():
    files = list_html_files(ROOT)
    results = []
    for fp in sorted(files):
        status, msg = inject(fp)
        results.append((os.path.basename(fp), status, msg))
    for name, status, msg in results:
        print(f"  [{status}] {name} — {msg}")
    print(f"\nTotal: {len(results)} fichiers traités")
    print(f"  ✓ injecté: {sum(1 for _,s,_ in results if s=='ok')}")
    print(f"  ⊘ skip:    {sum(1 for _,s,_ in results if s=='skip')}")

if __name__ == '__main__':
    main()
