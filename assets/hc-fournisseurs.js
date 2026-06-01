/* HELP Confort — Bandeau fournisseurs défilant (2026-06-01 V2)
 * Marquee horizontal infinite-scroll avec logos cliquables → website.
 * Usage : <div data-hc-fournisseurs="plomberie"></div>
 */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

  function esc(s) { return (s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]); }); }

  // Palette de couleurs pour fallback initiale
  var PALETTES = [
    ['#0DA0CF','#0A4F6E'],['#FF6B1A','#7A1F0A'],['#FFB400','#5A4500'],
    ['#7C3AED','#3A1A6E'],['#22C55E','#0A4F38'],['#E11D48','#7F1D1D'],
    ['#0EA5E9','#075985'],['#F97316','#7C2D12'],['#10B981','#064E3B']
  ];
  function paletteFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return PALETTES[h % PALETTES.length];
  }

  function injectStyle() {
    if (document.getElementById('hcfStyle')) return;
    var st = document.createElement('style');
    st.id = 'hcfStyle';
    st.textContent =
      '.hc-fournisseurs-section{padding:48px 0;background:linear-gradient(180deg,#FAFCFD,#fff);border-top:1px solid #E5EDF3;border-bottom:1px solid #E5EDF3;overflow:hidden}' +
      '.hc-fournisseurs-section .container{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}' +
      '.hcf-head{text-align:center;margin-bottom:28px}' +
      '.hcf-eyebrow{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0DA0CF;margin-bottom:8px}' +
      '.hcf-title{font-family:\'Inter\',sans-serif;font-size:clamp(1.4rem,2.4vw,1.9rem);font-weight:800;color:#0A1428;margin:0 0 8px;letter-spacing:-.02em}' +
      '.hcf-title em{font-family:\'Playfair Display\',Georgia,serif;font-style:italic;color:#0DA0CF;font-weight:600}' +
      '.hcf-sub{font-size:.94rem;color:#64748b;margin:0 0 18px}' +
      // ── Marquee défilant ──
      '.hcf-marquee{position:relative;width:100%;overflow:hidden;mask-image:linear-gradient(90deg,transparent 0,#000 80px,#000 calc(100% - 80px),transparent 100%);-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 80px,#000 calc(100% - 80px),transparent 100%)}' +
      '.hcf-track{display:flex;gap:24px;animation:hcfScroll 36s linear infinite;width:max-content;padding:8px 0}' +
      '.hcf-marquee:hover .hcf-track{animation-play-state:paused}' +
      '@keyframes hcfScroll{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 12px))}}' +
      '.hcf-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:18px 16px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;text-decoration:none;transition:all .25s ease;color:#0A1428;min-width:170px;width:170px;height:130px;flex-shrink:0}' +
      '.hcf-card:hover{transform:translateY(-4px);box-shadow:0 14px 28px -8px rgba(13,160,207,.25);border-color:rgba(13,160,207,.40)}' +
      '.hcf-badge{position:absolute;top:6px;right:6px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FFB400,#FF6B1A);color:#fff;font-size:.7rem;border-radius:50%;box-shadow:0 3px 8px rgba(255,107,26,.30)}' +
      '.hcf-logo{display:flex;align-items:center;justify-content:center;width:72px;height:48px;flex-shrink:0}' +
      '.hcf-logo img{max-width:100%;max-height:100%;object-fit:contain}' +
      '.hcf-logo-fallback{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;color:#fff;font-family:\'Playfair Display\',serif;font-size:1.6rem;font-weight:700;box-shadow:0 4px 10px rgba(10,20,40,.18)}' +
      '.hcf-name{font-size:.86rem;font-weight:700;text-align:center;line-height:1.15}' +
      '.hcf-foot{text-align:center;font-size:.84rem;color:#64748b;margin-top:18px}' +
      '.hcf-foot a{color:#0DA0CF;font-weight:600;text-decoration:none}';
    document.head.appendChild(st);
  }

  function labelMetier(m) {
    return ({ plomberie: 'plomberie', chauffage: 'chauffage', electricite: 'électricité', serrurerie: 'serrurerie', vitrerie: 'vitrerie', renovation: 'rénovation', menuiserie: 'menuiserie', volets: 'volets' })[m] || m;
  }

  async function fetchSuppliers(metier) {
    try {
      var resp = await fetch(SUPABASE_URL + '/rest/v1/suppliers?select=*&active=eq.true&order=is_preferred.desc,name.asc&_ts=' + Date.now(), {
        headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + SUPABASE_ANON, 'Cache-Control': 'no-store' },
        cache: 'no-store'
      });
      if (!resp.ok) return [];
      var data = await resp.json();
      return data.filter(function (s) { return Array.isArray(s.metiers) && s.metiers.indexOf(metier) !== -1; });
    } catch (e) { console.error('[hc-fournisseurs]', e); return []; }
  }

  function renderCard(s) {
    var pal = paletteFor(s.name);
    var initial = (s.name || '?').trim().charAt(0).toUpperCase();
    var logo = s.logo_url
      ? '<img src="' + esc(s.logo_url) + '" alt="' + esc(s.name) + '" loading="lazy">'
      : '<span class="hcf-logo-fallback" style="background:linear-gradient(135deg,' + pal[0] + ' 0%,' + pal[1] + ' 100%)">' + esc(initial) + '</span>';
    var websiteAttr = s.website
      ? ' href="' + esc(s.website) + '" target="_blank" rel="noopener noreferrer"'
      : ' href="contact.html?objet=' + encodeURIComponent('Question fournisseur ' + s.name) + '"';
    return '<a class="hcf-card"' + websiteAttr + ' aria-label="' + esc(s.name) + (s.website ? ' — ouvrir le site officiel' : '') + '">' +
      (s.is_preferred ? '<span class="hcf-badge" title="Marque préférée HC">★</span>' : '') +
      '<span class="hcf-logo">' + logo + '</span>' +
      '<span class="hcf-name">' + esc(s.name) + '</span>' +
      '</a>';
  }

  async function render(root) {
    var metier = root.getAttribute('data-hc-fournisseurs');
    if (!metier) return;
    injectStyle();
    var suppliers = await fetchSuppliers(metier);
    if (!suppliers.length) { root.innerHTML = ''; return; }
    // Duplique 2× pour marquee infini
    var trackCards = suppliers.concat(suppliers).map(renderCard).join('');
    root.innerHTML =
      '<section id="fournisseurs" class="hc-fournisseurs-section">' +
        '<div class="container">' +
          '<div class="hcf-head">' +
            '<span class="hcf-eyebrow">Nos partenaires</span>' +
            '<h2 class="hcf-title">Marques <em>' + labelMetier(metier) + '</em> que nous installons</h2>' +
            '<p class="hcf-sub">' + suppliers.length + ' fabricant' + (suppliers.length > 1 ? 's' : '') + ' référencé' + (suppliers.length > 1 ? 's' : '') + ' — pièces d\'origine, garanties constructeur honorées</p>' +
          '</div>' +
          '<div class="hcf-marquee"><div class="hcf-track">' + trackCards + '</div></div>' +
          '<p class="hcf-foot">Vous souhaitez une marque particulière non listée ? <a href="contact.html?objet=Demande%20marque%20sp%C3%A9cifique">Faites-nous votre demande →</a></p>' +
        '</div>' +
      '</section>';
  }

  function init() {
    document.querySelectorAll('[data-hc-fournisseurs]').forEach(render);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
