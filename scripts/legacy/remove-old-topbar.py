#!/usr/bin/env python3
"""Supprime l'ancienne topbar navy (avis 4,7/5 + Saint-Omer · Dunkerque + sociaux + Nous contacter) sur toutes les pages."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# L'ancienne topbar commence par le commentaire ou directement par <div class="topbar"
# et finit par sa balise </div> de fermeture (4 niveaux d'imbrication).
# Pattern : on trouve l'ouverture <div class="topbar" ... > puis on cherche la fermeture
# de bloc en équilibrant les <div>.

def remove_old_topbar(content):
    # Trouver le début (avec ou sans commentaire avant)
    pattern = re.compile(
        r'(<!--[^\n]*TOP BAR[^\n]*-->\s*)?<div\s+class="topbar"',
        re.IGNORECASE
    )
    m = pattern.search(content)
    if not m:
        return content, False
    start = m.start()
    # À partir de m.end(), parcourir le HTML pour équilibrer les <div>
    pos = m.end()
    depth = 1  # on est dans la div ouvrante
    div_open = re.compile(r'<div\b', re.IGNORECASE)
    div_close = re.compile(r'</div>', re.IGNORECASE)
    while depth > 0 and pos < len(content):
        next_open = div_open.search(content, pos)
        next_close = div_close.search(content, pos)
        if not next_close:
            return content, False  # malformé
        if next_open and next_open.start() < next_close.start():
            depth += 1
            pos = next_open.end()
        else:
            depth -= 1
            pos = next_close.end()
    end = pos
    # Supprimer aussi un éventuel saut de ligne après
    while end < len(content) and content[end] in ' \t\n\r':
        end += 1
    new_content = content[:start] + content[end:]
    return new_content, True

def list_html_files(root):
    files = []
    for entry in os.listdir(root):
        path = os.path.join(root, entry)
        if os.path.isfile(path) and entry.endswith('.html'):
            files.append(path)
    return files

def main():
    files = sorted(list_html_files(ROOT))
    results = []
    for fp in files:
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content, changed = remove_old_topbar(content)
        if changed:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(new_content)
            results.append((os.path.basename(fp), 'ok', 'ancienne topbar retirée'))
        else:
            results.append((os.path.basename(fp), 'skip', 'aucune ancienne topbar'))
    for name, status, msg in results:
        print(f"  [{status}] {name} — {msg}")
    print(f"\nTotal: {len(results)} fichiers traités")
    print(f"  ✓ nettoyés: {sum(1 for _,s,_ in results if s=='ok')}")
    print(f"  ⊘ skip:     {sum(1 for _,s,_ in results if s=='skip')}")

if __name__ == '__main__':
    main()
