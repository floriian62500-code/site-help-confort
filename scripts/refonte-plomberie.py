#!/usr/bin/env python3
"""Refonte complète plombier-saint-omer.html : remplace tout le body métier
   (entre </header><script>...</script> et <footer>) par la nouvelle version premium."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, 'plombier-saint-omer.html')

# Charge le nouveau body
with open(os.path.join(ROOT, 'scripts/tmp/plomberie-body.html'), 'r') as f:
    NEW_BODY = f.read()

with open(TARGET, 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver la fin du <script> qui suit </header> (le burger handler)
header_end = content.find('</header>')
if header_end == -1:
    raise SystemExit("</header> not found")
script_start = content.find('<script>', header_end)
script_end = content.find('</script>', script_start) + len('</script>')

# Trouver le début du footer
footer_start = content.find('<footer class="footer footer-v3">')
if footer_start == -1:
    raise SystemExit("footer footer-v3 not found")

# Nouvelle structure
new_content = (
    content[:script_end]
    + '\n\n'
    + NEW_BODY
    + '\n\n'
    + content[footer_start:]
)

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(new_content)

old_size = len(content)
new_size = len(new_content)
print(f"✓ Refonte plombier-saint-omer.html")
print(f"  Avant : {old_size:,} octets")
print(f"  Après : {new_size:,} octets")
print(f"  Diff  : {new_size - old_size:+,} octets")
