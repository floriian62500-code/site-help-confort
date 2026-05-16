#!/usr/bin/env python3
"""Unifie le header sur TOUTES les pages : remplace l'ancien <header class="header">
   par le nouveau <header class="hc-header"> identique à la homepage."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Le nouveau header (copié exactement de index.html lignes 185-280)
NEW_HEADER = '''<header class="hc-header" id="hcHeader">
  <div class="hc-header-row">
    <a href="index.html" class="hc-logo" aria-label="HELP Confort Saint-Omer · Accueil">
      <img loading="lazy" decoding="async" src="logo-officiel.jpg" alt="HELP Confort" width="200" height="60">
    </a>
    <nav class="hc-nav" aria-label="Navigation principale">
      <a href="index.html" class="hc-nav-link">Accueil</a>
      <a href="index.html#hc-metiers" class="hc-nav-link" data-has-menu="metiers">
        Métiers
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </a>
      <a href="depannage-saint-omer.html" class="hc-nav-link" data-has-menu="zones">
        Zones
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </a>
      <a href="realisations.html" class="hc-nav-link">Réalisations</a>
      <a href="actualites.html" class="hc-nav-link">Actualités</a>
      <a href="a-propos.html" class="hc-nav-link">À propos</a>
      <a href="contact.html" class="hc-nav-link">Contact</a>

      <div class="hc-megamenu" data-menu="metiers" role="menu">
        <a href="plombier-saint-omer.html"><img src="images/picto-plomberie.png" alt="" loading="lazy">Plomberie</a>
        <a href="chauffagiste-saint-omer.html"><span class="hc-mm-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#E76B2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 4-2 4 0 8 2 4 4 4 0 12-1-4 2-4 0-8-2-4-4-4 0-12z"/></svg></span>Chauffage</a>
        <a href="electricien-saint-omer.html"><img src="images/picto-electricite.png" alt="" loading="lazy">Électricité</a>
        <a href="serrurier-saint-omer.html"><img src="images/picto-serrurerie.png" alt="" loading="lazy">Serrurerie</a>
        <a href="serrurier-saint-omer.html"><img src="images/picto-vitrerie.png" alt="" loading="lazy">Vitrerie</a>
        <a href="travaux-saint-omer.html"><img src="images/picto-renovation.png" alt="" loading="lazy">Rénovation</a>
        <a href="travaux-saint-omer.html"><img src="images/picto-volets.png" alt="" loading="lazy">Volets</a>
        <a href="guide-adaptation-pmr.html"><img src="images/picto-pmr.png" alt="" loading="lazy">Adaptation PMR</a>
        <a href="contrats-entretien.html" class="hc-mm-foot">Contrats d&apos;entretien →</a>
      </div>

      <div class="hc-megamenu hc-megamenu-zones" data-menu="zones" role="menu">
        <a href="depannage-saint-omer.html">
          <span class="hc-mm-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#0DA0CF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
          <div><strong>Saint-Omer &amp; alentours</strong><span>Audomarois</span></div>
        </a>
        <a href="depannage-dunkerque.html">
          <span class="hc-mm-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#0DA0CF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
          <div><strong>Dunkerque &amp; littoral</strong><span>Bassin dunkerquois</span></div>
        </a>
      </div>
    </nav>

    <div class="hc-header-actions">
      <a href="tel:+33366100134" class="hc-btn-tel" aria-label="Appeler le 03 66 10 01 34">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span class="hc-btn-tel-num">03 66 10 01 34</span>
      </a>
      <button class="hc-burger" aria-label="Ouvrir le menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <nav class="hc-nav-mobile" aria-label="Menu mobile">
    <div class="hc-nav-mobile-inner">
      <a href="index.html">Accueil</a>
      <details class="hc-nav-m-section">
        <summary>Métiers</summary>
        <div class="hc-nav-m-sub">
          <a href="plombier-saint-omer.html">Plomberie</a>
          <a href="chauffagiste-saint-omer.html">Chauffage</a>
          <a href="electricien-saint-omer.html">Électricité</a>
          <a href="serrurier-saint-omer.html">Serrurerie</a>
          <a href="serrurier-saint-omer.html">Vitrerie</a>
          <a href="travaux-saint-omer.html">Rénovation</a>
          <a href="travaux-saint-omer.html">Volets &amp; Adaptation</a>
        </div>
      </details>
      <details class="hc-nav-m-section">
        <summary>Zones</summary>
        <div class="hc-nav-m-sub">
          <a href="depannage-saint-omer.html">Saint-Omer &amp; alentours</a>
          <a href="depannage-dunkerque.html">Dunkerque &amp; littoral</a>
        </div>
      </details>
      <a href="realisations.html">Réalisations</a>
      <a href="actualites.html">Actualités</a>
      <a href="a-propos.html">À propos</a>
      <a href="contact.html">Contact</a>
      <a href="tel:+33366100134" class="hc-nav-m-tel">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        03 66 10 01 34
      </a>
    </div>
  </nav>
</header>

<script>
(function() {
  var header = document.getElementById('hcHeader');
  if (header) {
    function onScroll() {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  var burger = document.querySelector('.hc-burger');
  var navMobile = document.querySelector('.hc-nav-mobile');
  if (burger && navMobile) {
    burger.addEventListener('click', function() {
      var open = burger.classList.toggle('is-open');
      navMobile.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navMobile.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        burger.classList.remove('is-open');
        navMobile.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();
</script>
'''

EXCLUDED_FILES = {'index.html'}  # déjà à jour

def list_html_files(root):
    files = []
    for entry in os.listdir(root):
        path = os.path.join(root, entry)
        if os.path.isfile(path) and entry.endswith('.html') and entry not in EXCLUDED_FILES:
            files.append(path)
    return files

def replace_header(content):
    # Cherche <header class="header"> ... </header>
    # Pattern : trouve l'ouverture, puis équilibre les balises pour trouver la fermeture
    open_pattern = re.compile(r'<header\s+class="header"[^>]*>', re.IGNORECASE)
    m = open_pattern.search(content)
    if not m:
        return content, False, 'pas d\'ancien header'

    start = m.start()
    # Équilibrage des <header>...</header>
    pos = m.end()
    depth = 1
    h_open = re.compile(r'<header\b', re.IGNORECASE)
    h_close = re.compile(r'</header>', re.IGNORECASE)
    while depth > 0 and pos < len(content):
        next_open = h_open.search(content, pos)
        next_close = h_close.search(content, pos)
        if not next_close:
            return content, False, 'header non fermé'
        if next_open and next_open.start() < next_close.start():
            depth += 1
            pos = next_open.end()
        else:
            depth -= 1
            pos = next_close.end()
    end = pos

    # Remplacement
    new_content = content[:start] + NEW_HEADER + content[end:]
    return new_content, True, 'header remplacé'

def main():
    files = sorted(list_html_files(ROOT))
    results = []
    for fp in files:
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content, changed, msg = replace_header(content)
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
