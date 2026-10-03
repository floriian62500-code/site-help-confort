#!/usr/bin/env python3
"""
Patch tous les fichiers HTML pour insérer le fix de positionnement du megamenu.
On insère le bloc 'positionMegamenus()' juste après la déclaration de closeTimer.
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

PATTERN = re.compile(r'(\bvar closeTimer = null;\n)')

INSERT_AFTER = """
// ═══════════════════════════════════════════════════════════════
// FIX POSITION : aligner chaque megamenu sous SON trigger link
// (le CSS left:50% centrait sur la nav entière au lieu du lien)
// ═══════════════════════════════════════════════════════════════
function positionMegamenus() {
  navLinks.forEach(function(link) {
    var menuId = link.getAttribute('data-has-menu');
    var menu = document.querySelector('.hc-megamenu[data-menu="' + menuId + '"]');
    if (!menu) return;
    var nav = link.closest('.hc-nav');
    if (!nav) return;
    var linkRect = link.getBoundingClientRect();
    var navRect = nav.getBoundingClientRect();
    var linkCenterRelToNav = (linkRect.left + linkRect.width / 2) - navRect.left;
    menu.style.left = linkCenterRelToNav + 'px';
  });
}
positionMegamenus();
window.addEventListener('resize', positionMegamenus);
window.addEventListener('load', positionMegamenus);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(positionMegamenus);
}
"""

# Ne pas re-patcher les fichiers déjà patchés
ALREADY_PATCHED_MARKER = 'function positionMegamenus()'

updated = 0
skipped = 0
unmatched = []

for html in ROOT.glob('*.html'):
    if html.name.endswith('.bak.before-minify'):
        continue
    text = html.read_text(encoding='utf-8')
    if ALREADY_PATCHED_MARKER in text:
        skipped += 1
        continue
    m = PATTERN.search(text)
    if not m:
        unmatched.append(html.name)
        continue
    new_text = text[:m.end()] + INSERT_AFTER + text[m.end():]
    html.write_text(new_text, encoding='utf-8')
    updated += 1
    print(f'  ✔ {html.name}')

print(f'\nUpdated: {updated} files')
print(f'Skipped (déjà patché): {skipped}')
if unmatched:
    print(f'No match for OLD pattern: {len(unmatched)} files')
    for n in unmatched[:10]:
        print(f'  - {n}')
