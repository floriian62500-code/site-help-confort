#!/usr/bin/env python3
"""Inline le CSS critique du header/megamenu dans chaque page pour bypasser tout problème de cache."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CRITICAL_CSS = '''
<style id="hc-critical-header">
/* CSS critique — header + megamenu (inline pour garantir le rendu même si cache foireux) */
.hc-header { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,.92); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); border-bottom: 1px solid rgba(229,237,243,.5); }
.hc-header-row { display: flex; align-items: center; justify-content: space-between; padding: 12px clamp(20px, 4vw, 64px); max-width: 1480px; margin: 0 auto; gap: 24px; }
.hc-logo { display: flex; align-items: center; flex-shrink: 0; }
.hc-logo img { height: 56px; width: auto; max-width: none; display: block; }
.hc-nav { display: none; }
@media (min-width: 980px) { .hc-nav { display: flex; align-items: center; gap: 4px; flex: 1; justify-content: center; position: relative; } }
.hc-nav-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; color: #0A1428; text-decoration: none; font-size: .92rem; font-weight: 500; border-radius: 8px; transition: all .15s ease; cursor: pointer; }
.hc-nav-link:hover { color: #0DA0CF; background: rgba(13,160,207,.06); }
.hc-megamenu { position: absolute !important; top: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(-6px); background: #fff; border: 1px solid #E5EDF3; border-radius: 18px; padding: 14px; min-width: 380px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; box-shadow: 0 24px 48px rgba(10,20,40,.10); opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; transition: opacity .2s ease, visibility .2s ease, transform .2s ease; z-index: 50; }
.hc-megamenu::before { content: ''; position: absolute; top: -14px; left: 0; right: 0; height: 14px; }
.hc-nav-link[data-has-menu="metiers"]:hover ~ .hc-megamenu[data-menu="metiers"],
.hc-nav-link[data-has-menu="zones"]:hover ~ .hc-megamenu[data-menu="zones"],
.hc-megamenu:hover { opacity: 1 !important; visibility: visible !important; pointer-events: auto !important; transform: translateX(-50%) translateY(0); }
.hc-megamenu a { display: inline-flex !important; align-items: center; gap: 12px; padding: 12px 14px; color: #0A1428; text-decoration: none; font-size: .94rem; font-weight: 500; border-radius: 10px; line-height: 1.2; transition: background .15s ease; }
.hc-megamenu a:hover { background: rgba(13,160,207,.08); color: #0DA0CF; }
.hc-megamenu a img, .hc-megamenu a .hc-mm-svg { width: 24px !important; height: 24px !important; object-fit: contain; flex-shrink: 0; }
.hc-megamenu .hc-mm-svg svg { width: 22px !important; height: 22px !important; }
.hc-megamenu .hc-mm-foot { grid-column: 1 / -1; margin-top: 8px; padding: 12px 14px 4px; border-top: 1px solid #E5EDF3; color: #0DA0CF; font-weight: 600; }
.hc-megamenu-zones { grid-template-columns: 1fr; min-width: 320px; }
.hc-megamenu-zones a { padding: 14px 16px; }
.hc-megamenu-zones a strong { display: block; color: #0A1428; font-weight: 700; font-size: .98rem; }
.hc-megamenu-zones a span { display: block; font-size: .82rem; color: #64748b; }
.hc-header-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.hc-btn-tel { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: #0A1428; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: .9rem; transition: background .2s ease; }
.hc-btn-tel:hover { background: #0DA0CF; }
.hc-btn-tel-num { letter-spacing: .02em; }
.hc-burger { display: none; background: transparent; border: 0; padding: 8px; cursor: pointer; }
@media (max-width: 979px) { .hc-burger { display: flex; flex-direction: column; gap: 4px; } .hc-btn-tel-num { display: none; } }
.hc-burger span { display: block; width: 22px; height: 2px; background: #0A1428; border-radius: 2px; transition: all .25s ease; }
.hc-nav-mobile { display: none; }
.hc-nav-mobile.is-open { display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #fff; z-index: 999; padding: 80px 24px 32px; overflow-y: auto; }
.hc-nav-mobile-inner > a, .hc-nav-mobile-inner > details { display: block; padding: 14px 0; border-bottom: 1px solid #E5EDF3; color: #0A1428; text-decoration: none; font-weight: 600; font-size: 1.05rem; }
.hc-nav-mobile-inner details summary { cursor: pointer; padding: 14px 0; }
.hc-nav-mobile-inner .hc-nav-m-sub a { display: block; padding: 10px 16px; color: #475569; text-decoration: none; font-size: .92rem; }
.hc-nav-mobile-inner .hc-nav-m-tel { margin-top: 24px; display: inline-flex; padding: 14px 22px; background: #0A1428; color: #fff; border-radius: 10px; gap: 10px; align-items: center; border-bottom: 0; }
</style>
'''

MARKER = 'id="hc-critical-header"'

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
    # Inject juste après <link rel="stylesheet" href="styles.css...">
    pattern = re.compile(r'(<link\s+rel="stylesheet"\s+href="styles\.css[^"]*"\s*/?>)', re.IGNORECASE)
    m = pattern.search(content)
    if not m:
        return ('skip', 'pas de link styles.css trouvé')
    insert_pos = m.end()
    new_content = content[:insert_pos] + CRITICAL_CSS + content[insert_pos:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return ('ok', 'critical CSS injecté')

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
