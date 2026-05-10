#!/usr/bin/env python3
"""Ajoute les meta cache-control à TOUTES les pages HTML pour forcer le navigateur
à toujours recharger la dernière version (résout le bandeau qui ne se met pas à jour)."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NO_CACHE_TAGS = '''<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
'''

# Marqueur pour éviter doublon
MARKER = 'http-equiv="Cache-Control"'

def list_html_files(root):
    files = []
    for entry in os.listdir(root):
        path = os.path.join(root, entry)
        if os.path.isfile(path) and entry.endswith('.html'):
            files.append(path)
    return files

def inject(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if MARKER in content:
        return ('skip', 'déjà présent')
    # Inject après <meta charset="UTF-8">
    pattern = re.compile(r'(<meta\s+charset="?[^">]*"?\s*/?>)\s*\n?', re.IGNORECASE)
    m = pattern.search(content)
    if not m:
        return ('skip', 'pas de meta charset trouvé')
    insert_pos = m.end()
    new_content = content[:insert_pos] + NO_CACHE_TAGS + content[insert_pos:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return ('ok', 'meta cache-control injectées')

def main():
    files = sorted(list_html_files(ROOT))
    results = []
    for fp in files:
        status, msg = inject(fp)
        results.append((os.path.basename(fp), status, msg))
    for name, status, msg in results:
        print(f"  [{status}] {name} — {msg}")
    print(f"\nTotal: {len(results)} fichiers")
    print(f"  ✓ injectés: {sum(1 for _,s,_ in results if s=='ok')}")
    print(f"  ⊘ skip:     {sum(1 for _,s,_ in results if s=='skip')}")

if __name__ == '__main__':
    main()
