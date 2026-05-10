#!/usr/bin/env python3
"""Met à jour le megamenu Zones DANS zones-intervention.html elle-même."""
import re

NEW_MEGAMENU_ZONES = '''<div class="hc-megamenu hc-megamenu-zones" data-menu="zones" role="menu">
        <a href="zones-intervention.html">
          <span class="hc-mm-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#0DA0CF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
          <div><strong>Zones d&apos;intervention</strong><span>Saint-Omer · Dunkerque · Région</span></div>
        </a>
      </div>'''

OLD_RE = re.compile(
    r'<div class="hc-megamenu hc-megamenu-zones"[^>]*>\s*'
    r'<a href="depannage-saint-omer\.html">.*?</a>\s*'
    r'<a href="depannage-dunkerque\.html">.*?</a>\s*'
    r'</div>',
    re.DOTALL
)

with open('zones-intervention.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1) Nav link Zones href
new_content = re.sub(
    r'<a href="depannage-saint-omer\.html" class="hc-nav-link" data-has-menu="zones">',
    '<a href="zones-intervention.html" class="hc-nav-link" data-has-menu="zones">',
    content
)
# 2) Megamenu Zones
new_content = OLD_RE.sub(NEW_MEGAMENU_ZONES, new_content)

# 3) Mobile nav Zones
mobile_re = re.compile(
    r'<details class="hc-nav-m-section">\s*<summary>Zones</summary>\s*'
    r'<div class="hc-nav-m-sub">\s*'
    r'<a href="depannage-saint-omer\.html">Saint-Omer[^<]*</a>\s*'
    r'<a href="depannage-dunkerque\.html">Dunkerque[^<]*</a>\s*'
    r'</div>\s*</details>',
    re.DOTALL
)
new_content = mobile_re.sub("<a href=\"zones-intervention.html\">Zones d'intervention</a>", new_content)

with open('zones-intervention.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Diff: {len(new_content) - len(content):+d} octets")
