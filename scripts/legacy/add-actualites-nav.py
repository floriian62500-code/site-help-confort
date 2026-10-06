#!/usr/bin/env python3
"""Ajoute le lien 'Actualités' dans les navs (desktop + mobile) sur toutes les pages
qui ne l'ont pas — point d'insertion : juste avant le lien 'À propos'."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Patterns d'insertion
# 1. Pour la nav desktop des pages avec class="header" (ancien style)
#    on cherche : <a href="a-propos.html">À propos</a>
# 2. Pour la nav mobile : meme chose
DESKTOP_LINK = '<a href="actualites.html">Actualités</a>'

def list_html_files(root):
    files = []
    for entry in os.listdir(root):
        path = os.path.join(root, entry)
        if os.path.isfile(path) and entry.endswith('.html'):
            files.append(path)
    return files

def add_actualites(content):
    # Si déjà présent, on saute
    if '>Actualités<' in content or '>Actualités&' in content:
        return content, False, 'déjà présent'

    # Pattern : trouver le lien <a href="a-propos.html">À propos</a>
    # On insère le lien Actualités JUSTE AVANT
    pattern = re.compile(r'(<a\s+href="a-propos\.html"[^>]*>\s*À propos\s*</a>)', re.IGNORECASE)
    matches = list(pattern.finditer(content))
    if not matches:
        return content, False, 'pas de lien "À propos" trouvé'

    # Insérer le lien avant chaque occurrence (desktop + mobile)
    new_content = pattern.sub(r'<a href="actualites.html">Actualités</a>\n      \1', content)
    return new_content, True, f'inséré {len(matches)}× (avant À propos)'

def main():
    files = sorted(list_html_files(ROOT))
    results = []
    for fp in files:
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content, changed, msg = add_actualites(content)
        if changed:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(new_content)
            results.append((os.path.basename(fp), 'ok', msg))
        else:
            results.append((os.path.basename(fp), 'skip', msg))
    for name, status, msg in results:
        if status == 'ok':
            print(f"  [{status}] {name} — {msg}")
    print(f"\nTotal: {len(results)} fichiers")
    print(f"  ✓ ajoutés: {sum(1 for _,s,_ in results if s=='ok')}")
    print(f"  ⊘ skip:    {sum(1 for _,s,_ in results if s=='skip')}")

if __name__ == '__main__':
    main()
