#!/usr/bin/env python3
"""1) Crée zones-intervention.html à partir du template plombier
   2) Unifie le megamenu Zones sur les 31 pages : 1 seul lien."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ═══ PARTIE 1 : Créer zones-intervention.html ═══
TEMPLATE_FILE = os.path.join(ROOT, 'plombier-saint-omer.html')
TARGET_FILE = os.path.join(ROOT, 'zones-intervention.html')

with open(os.path.join(ROOT, 'scripts/tmp/zones-body.html'), 'r') as f:
    NEW_BODY = f.read()

with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
    template = f.read()

# Remplacer le titre, description, canonical
template = re.sub(
    r'<title>[^<]*</title>',
    '<title>Zones d\'intervention HELP Confort — Saint-Omer · Dunkerque · Calais · Boulogne | Plomberie, Chauffage, Électricité</title>',
    template, count=1
)
template = re.sub(
    r'<meta\s+name="description"\s+content="[^"]*">',
    '<meta name="description" content="HELP Confort intervient sur tout le Pas-de-Calais et le Nord : Saint-Omer, Dunkerque, Calais, Boulogne-sur-Mer, Audomarois, littoral. 2 agences locales (Dépan\'Audo · Dépan\'DK) — plomberie, chauffage, électricité, serrurerie, vitrerie, rénovation. ☎ 03 66 10 01 34">',
    template, count=1
)
template = re.sub(
    r'<link\s+rel="canonical"\s+href="[^"]*">',
    '<link rel="canonical" href="https://www.helpconfort-saintomer.fr/zones-intervention.html">',
    template, count=1
)
# OG tags
template = re.sub(r'<meta\s+property="og:title"\s+content="[^"]*">', '<meta property="og:title" content="Zones d\'intervention HELP Confort">', template, count=1)
template = re.sub(r'<meta\s+property="og:description"\s+content="[^"]*">', '<meta property="og:description" content="Saint-Omer & Dunkerque — Plomberie, chauffage, électricité, serrurerie, vitrerie, rénovation.">', template, count=1)

# Trouver header end + script
header_end = template.find('</header>')
script_start = template.find('<script>', header_end)
script_end = template.find('</script>', script_start) + len('</script>')

# Footer start
footer_start = template.find('<footer class="footer footer-v3">')

# Assembler
new_content = (
    template[:script_end]
    + '\n\n'
    + NEW_BODY
    + '\n\n'
    + template[footer_start:]
)

with open(TARGET_FILE, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✓ Créé zones-intervention.html ({len(new_content):,} octets)")


# ═══ PARTIE 2 : Unifier le megamenu Zones sur toutes les pages ═══
# Le pattern actuel dans les 31 pages :
#   <a href="depannage-saint-omer.html">...Saint-Omer & alentours...</a>
#   <a href="depannage-dunkerque.html">...Dunkerque & littoral...</a>
# devient :
#   <a href="zones-intervention.html">...Toutes nos zones...</a>

OLD_MEGAMENU_ZONES_RE = re.compile(
    r'<div class="hc-megamenu hc-megamenu-zones"[^>]*>\s*'
    r'<a href="depannage-saint-omer\.html">.*?</a>\s*'
    r'<a href="depannage-dunkerque\.html">.*?</a>\s*'
    r'</div>',
    re.DOTALL
)

NEW_MEGAMENU_ZONES = '''<div class="hc-megamenu hc-megamenu-zones" data-menu="zones" role="menu">
        <a href="zones-intervention.html">
          <span class="hc-mm-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#0DA0CF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
          <div><strong>Zones d&apos;intervention</strong><span>Saint-Omer · Dunkerque · Région</span></div>
        </a>
      </div>'''

# Aussi changer le href de la nav Zones (qui pointait vers depannage-saint-omer.html)
def update_zones(content):
    changed = False
    # 1) Nav link : Zones → href="zones-intervention.html"
    new = re.sub(
        r'<a href="depannage-saint-omer\.html" class="hc-nav-link" data-has-menu="zones">',
        '<a href="zones-intervention.html" class="hc-nav-link" data-has-menu="zones">',
        content
    )
    if new != content:
        content = new
        changed = True

    # 2) Megamenu Zones : 2 entries → 1 entry
    new = OLD_MEGAMENU_ZONES_RE.sub(NEW_MEGAMENU_ZONES, content)
    if new != content:
        content = new
        changed = True

    # 3) Mobile nav : Saint-Omer + Dunkerque → Zones d'intervention (1 entry)
    mobile_old_re = re.compile(
        r'<details class="hc-nav-m-section">\s*<summary>Zones</summary>\s*'
        r'<div class="hc-nav-m-sub">\s*'
        r'<a href="depannage-saint-omer\.html">Saint-Omer[^<]*</a>\s*'
        r'<a href="depannage-dunkerque\.html">Dunkerque[^<]*</a>\s*'
        r'</div>\s*</details>',
        re.DOTALL
    )
    mobile_new = '<a href="zones-intervention.html">Zones d\'intervention</a>'
    new = mobile_old_re.sub(mobile_new, content)
    if new != content:
        content = new
        changed = True

    return content, changed

EXCLUDED = {'zones-intervention.html'}  # ne pas se modifier soi-même
def list_html(root):
    return [os.path.join(root, e) for e in os.listdir(root)
            if os.path.isfile(os.path.join(root, e)) and e.endswith('.html')
            and e not in EXCLUDED]

results = []
for fp in sorted(list_html(ROOT)):
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    nc, ch = update_zones(c)
    if ch:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(nc)
        results.append((os.path.basename(fp), 'ok'))
    else:
        results.append((os.path.basename(fp), 'skip'))

print(f"\nMegamenu Zones unifié sur {sum(1 for _,s in results if s=='ok')}/{len(results)} pages")
print(f"  ⊘ skip : {sum(1 for _,s in results if s=='skip')}")
