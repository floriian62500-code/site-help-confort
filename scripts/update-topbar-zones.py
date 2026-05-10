#!/usr/bin/env python3
"""Ajoute 'Dépan'Audo' derrière Saint-Omer et 'Dépan'DK' derrière Dunkerque dans la topbar."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OLD_SAINT_OMER = '<strong>Saint-Omer</strong>\n      </a>'
NEW_SAINT_OMER = '<strong>Saint-Omer</strong>\n        <em class="hctb-agence">Dépan\'Audo</em>\n      </a>'

OLD_DUNKERQUE = '<strong>Dunkerque</strong>\n      </a>'
NEW_DUNKERQUE = '<strong>Dunkerque</strong>\n        <em class="hctb-agence">Dépan\'DK</em>\n      </a>'

def list_html_files(root):
    return [os.path.join(root, e) for e in os.listdir(root)
            if os.path.isfile(os.path.join(root, e)) and e.endswith('.html')]

def update(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'hctb-agence' in content:
        return ('skip', 'déjà mis à jour')

    # Vérifier que la topbar est présente
    if 'class="hctb-zone"' not in content:
        return ('skip', 'pas de topbar zone')

    new_content = content.replace(OLD_SAINT_OMER, NEW_SAINT_OMER)
    new_content = new_content.replace(OLD_DUNKERQUE, NEW_DUNKERQUE)

    if new_content == content:
        return ('skip', 'rien à remplacer')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return ('ok', 'topbar mise à jour')

def main():
    files = sorted(list_html_files(ROOT))
    results = []
    for fp in files:
        status, msg = update(fp)
        results.append((os.path.basename(fp), status, msg))
    for name, status, msg in results:
        print(f"  [{status}] {name} — {msg}")
    print(f"\nTotal: {len(results)} fichiers")
    print(f"  ✓ mis à jour: {sum(1 for _,s,_ in results if s=='ok')}")
    print(f"  ⊘ skip:       {sum(1 for _,s,_ in results if s=='skip')}")

if __name__ == '__main__':
    main()
