/* HELP Confort — Bandeau fournisseurs défilant (2026-06-01 V3 — fix render)
 * Marquee horizontal infinite-scroll avec logos cliquables → website.
 * Usage : <div data-hc-fournisseurs="plomberie"></div>
 */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';
  var LOG_PREFIX = '[hc-fournisseurs]';

  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]); }); }

  // Palette de couleurs pour fallback initiale
  var PALETTES = [
    ['#0DA0CF','#0A4F6E'],['#FF6B1A','#7A1F0A'],['#FFB400','#5A4500'],
    ['#7C3AED','#3A1A6E'],['#22C55E','#0A4F38'],['#E11D48','#7F1D1D'],
    ['#0EA5E9','#075985'],['#F97316','#7C2D12'],['#10B981','#064E3B']
  ];
  function paletteFor(name) {
    var h = 0;
    var n = name || '';
    for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return PALETTES[h % PALETTES.length];
  }

  function injectStyle() {
    if (document.getElementById('hcfStyle')) return;
    var st = document.createElement('style');
    st.id = 'hcfStyle';
    st.textContent =
      '.hc-fournisseurs-section{padding:48px 0;background:linear-gradient(180deg,#FAFCFD,#fff);border-top:1px solid #E5EDF3;border-bottom:1px solid #E5EDF3;overflow:hidden;display:block}' +
      '.hc-fournisseurs-section .container{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}' +
      '.hcf-head{text-align:center;margin-bottom:28px}' +
      '.hcf-eyebrow{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0DA0CF;margin-bottom:8px}' +
      '.hcf-title{font-family:\'Inter\',sans-serif;font-size:clamp(1.4rem,2.4vw,1.9rem);font-weight:800;color:#0A1428;margin:0 0 8px;letter-spacing:-.02em}' +
      '.hcf-title em{font-family:\'Playfair Display\',Georgia,serif;font-style:italic;color:#0DA0CF;font-weight:600;font-size:1.05em}' +
      '.hcf-sub{font-size:.94rem;color:#64748b;margin:0 0 18px}' +
      // Marquee
      '.hcf-marquee{position:relative;width:100%;overflow:hidden}' +
      '@supports (mask-image: linear-gradient(90deg,transparent,#000)){.hcf-marquee{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 80px,#000 calc(100% - 80px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 80px,#000 calc(100% - 80px),transparent 100%)}}' +
      '.hcf-track{display:flex;gap:24px;animation:hcfScroll 40s linear infinite;width:max-content;padding:8px 0;align-items:stretch}' +
      '.hcf-marquee:hover .hcf-track{animation-play-state:paused}' +
      '@keyframes hcfScroll{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 12px))}}' +
      '.hcf-card-wrap{display:flex;flex-direction:column;gap:6px;width:170px;flex:0 0 170px}' +
      '.hcf-catalogue{display:flex;align-items:center;justify-content:center;gap:4px;padding:6px 8px;background:#fff;border:1px solid rgba(13,160,207,.25);border-radius:8px;font-size:.74rem;font-weight:700;color:#0DA0CF;text-decoration:none;text-align:center;transition:.15s}' +
      '.hcf-catalogue:hover{background:#0DA0CF;color:#fff;border-color:#0DA0CF}' +
      '.hcf-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:18px 16px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;text-decoration:none;transition:all .25s ease;color:#0A1428;width:170px;height:130px;box-sizing:border-box}' +
      '.hcf-card:hover{transform:translateY(-4px);box-shadow:0 14px 28px -8px rgba(13,160,207,.25);border-color:rgba(13,160,207,.40)}' +
      '.hcf-badge{position:absolute;top:6px;right:6px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FFB400,#FF6B1A);color:#fff;font-size:.7rem;border-radius:50%;box-shadow:0 3px 8px rgba(255,107,26,.30)}' +
      '.hcf-logo{display:flex;align-items:center;justify-content:center;width:72px;height:48px;flex-shrink:0;position:relative}' +
      '.hcf-logo img{max-width:100%;max-height:100%;object-fit:contain}' +
      '.hcf-logo-fallback{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;color:#fff;font-family:\'Playfair Display\',serif;font-size:1.6rem;font-weight:700;box-shadow:0 4px 10px rgba(10,20,40,.18)}' +
      '.hcf-name{font-size:.86rem;font-weight:700;text-align:center;line-height:1.15}' +
      '.hcf-foot{text-align:center;font-size:.84rem;color:#64748b;margin-top:18px}' +
      '.hcf-foot a{color:#0DA0CF;font-weight:600;text-decoration:none}' +
      // Empty state
      '.hcf-empty{text-align:center;padding:24px;color:#94a3b8;font-size:.9rem}';
    document.head.appendChild(st);
  }

  function labelMetier(m) {
    return ({ plomberie: 'plomberie', chauffage: 'chauffage', electricite: 'électricité', vitrerie: 'vitrerie', serrurerie: 'serrurerie', renovation: 'rénovation', menuiserie: 'menuiserie', volets: 'volets' })[m] || m;
  }

  async function fetchSuppliers(metier) {
    try {
      var url = SUPABASE_URL + '/rest/v1/suppliers?select=*&active=eq.true&order=is_preferred.desc,name.asc';
      var resp = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: 'Bearer ' + SUPABASE_ANON
        }
      });
      if (!resp.ok) {
        console.warn(LOG_PREFIX, 'fetch !ok', resp.status, await resp.text());
        return [];
      }
      var data = await resp.json();
      if (!Array.isArray(data)) {
        console.warn(LOG_PREFIX, 'data not array', data);
        return [];
      }
      var filtered = data.filter(function (s) {
        return s && Array.isArray(s.metiers) && s.metiers.indexOf(metier) !== -1;
      });
      console.log(LOG_PREFIX, 'metier=' + metier, 'total=' + data.length, 'match=' + filtered.length);
      return filtered;
    } catch (e) {
      console.error(LOG_PREFIX, 'fetch error', e);
      return [];
    }
  }

  function renderCard(s) {
    var pal = paletteFor(s.name);
    var initial = (s.name || '?').trim().charAt(0).toUpperCase();
    var logoHtml = s.logo_url
      ? '<img src="' + esc(s.logo_url) + '" alt="' + esc(s.name) + '" loading="lazy" onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'flex\'">' +
        '<span class="hcf-logo-fallback" style="display:none;background:linear-gradient(135deg,' + pal[0] + ' 0%,' + pal[1] + ' 100%)">' + esc(initial) + '</span>'
      : '<span class="hcf-logo-fallback" style="background:linear-gradient(135deg,' + pal[0] + ' 0%,' + pal[1] + ' 100%)">' + esc(initial) + '</span>';
    // 2026-06-01 — pointe vers fiche fournisseur HC interne (descriptif + catalogue + lien officiel)
    var hrefMain = 'fournisseur.html?slug=' + encodeURIComponent(s.slug || (s.name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-'));
    var targetAttr = ''; // navigation interne, même onglet
    var catalogueHtml = s.catalogue_url
      ? '<a class="hcf-catalogue" href="' + esc(s.catalogue_url) + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="Voir le catalogue ' + esc(s.name) + '">Catalogue ' + (s.catalogue_type === 'pdf' ? 'PDF' : '') + '</a>'
      : '';
    return '<div class="hcf-card-wrap">' +
      '<a class="hcf-card" href="' + hrefMain + '"' + targetAttr + ' aria-label="' + esc(s.name) + (s.website ? ' — site officiel' : '') + '">' +
        (s.is_preferred ? '<span class="hcf-badge" title="Marque préférée HC">★</span>' : '') +
        '<span class="hcf-logo">' + logoHtml + '</span>' +
        '<span class="hcf-name">' + esc(s.name) + '</span>' +
      '</a>' +
      catalogueHtml +
      '</div>';
  }

  async function render(root) {
    try {
      var metier = root.getAttribute('data-hc-fournisseurs');
      if (!metier) { console.warn(LOG_PREFIX, 'no metier attr', root); return; }
      injectStyle();
      // Skeleton de chargement pour éviter "vide"
      root.innerHTML = '<section class="hc-fournisseurs-section"><div class="container"><p class="hcf-empty">Chargement des partenaires…</p></div></section>';
      var suppliers = await fetchSuppliers(metier);
      if (!suppliers.length) {
        root.innerHTML = '';
        console.warn(LOG_PREFIX, 'aucun fournisseur pour metier=' + metier);
        return;
      }
      // Duplique 2× pour marquee infini
      var trackCards = suppliers.concat(suppliers).map(renderCard).join('');
      var n = suppliers.length;
      root.innerHTML =
        '<section id="fournisseurs" class="hc-fournisseurs-section">' +
          '<div class="container">' +
            '<div class="hcf-head">' +
              '<span class="hcf-eyebrow">Nos partenaires</span>' +
              '<h2 class="hcf-title">Marques <em>' + esc(labelMetier(metier)) + '</em> que nous installons</h2>' +
              '<p class="hcf-sub">' + n + ' fabricant' + (n > 1 ? 's' : '') + ' référencé' + (n > 1 ? 's' : '') + ' — pièces d\'origine, garanties constructeur honorées</p>' +
            '</div>' +
            '<div class="hcf-marquee"><div class="hcf-track">' + trackCards + '</div></div>' +
            '<p class="hcf-foot">Vous souhaitez une marque particulière non listée ? <a href="contact.html?objet=Demande%20marque%20sp%C3%A9cifique">Faites-nous votre demande →</a></p>' +
          '</div>' +
        '</section>';
      console.log(LOG_PREFIX, 'rendered ' + n + ' cards for metier=' + metier);
    } catch (e) {
      console.error(LOG_PREFIX, 'render error', e);
    }
  }

  function init() {
    var roots = document.querySelectorAll('[data-hc-fournisseurs]');
    console.log(LOG_PREFIX, 'init — found ' + roots.length + ' container(s)');
    roots.forEach(function (r) { render(r); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
