#!/usr/bin/env python3
"""Remplace l'ancien <footer class="footer">...</footer> + footer-social par le footer-v3 unifié."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Charge le nouveau footer
with open('/tmp/footer-v3.html', 'r') as f:
    NEW_FOOTER = f.read()

EXCLUDED_FILES = {'index.html', '404.html'}  # index a déjà le footer-v3

def list_html_files(root):
    files = []
    for entry in os.listdir(root):
        path = os.path.join(root, entry)
        if os.path.isfile(path) and entry.endswith('.html') and entry not in EXCLUDED_FILES:
            files.append(path)
    return files

def replace_footer(content):
    # Si le footer-v3 est déjà présent, on saute
    if 'footer-v3' in content:
        return content, False, 'footer-v3 déjà présent'

    # Cherche <footer class="footer">...</footer>
    open_pattern = re.compile(r'<footer\s+class="footer"[^>]*>', re.IGNORECASE)
    m = open_pattern.search(content)
    if not m:
        return content, False, 'pas d\'ancien footer trouvé'

    start = m.start()
    # Équilibrer les <footer>...</footer>
    pos = m.end()
    depth = 1
    f_open = re.compile(r'<footer\b', re.IGNORECASE)
    f_close = re.compile(r'</footer>', re.IGNORECASE)
    while depth > 0 and pos < len(content):
        next_open = f_open.search(content, pos)
        next_close = f_close.search(content, pos)
        if not next_close:
            return content, False, 'footer non fermé'
        if next_open and next_open.start() < next_close.start():
            depth += 1
            pos = next_open.end()
        else:
            depth -= 1
            pos = next_close.end()
    end = pos

    new_content = content[:start] + NEW_FOOTER + content[end:]
    return new_content, True, 'footer remplacé'

def main():
    files = sorted(list_html_files(ROOT))
    results = []
    for fp in files:
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content, changed, msg = replace_footer(content)
        if changed:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(new_content)
            results.append((os.path.basename(fp), 'ok', msg))
        else:
            results.append((os.path.basename(fp), 'skip', msg))
    for name, status, msg in results:
        print(f"  [{status}] {name} — {msg}")
    print(f"\nTotal: {len(results)} fichiers")
    print(f"  ✓ remplacés: {sum(1 for _,s,_ in results if s=='ok')}")
    print(f"  ⊘ skip:      {sum(1 for _,s,_ in results if s=='skip')}")

if __name__ == '__main__':
    main()
