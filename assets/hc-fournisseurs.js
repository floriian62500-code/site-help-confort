/* HELP Confort — Composant Fournisseurs par métier (2026-05-30)
 * Affiche les marques partenaires (table suppliers Supabase) sur les pages métier.
 * Usage : <div data-hc-fournisseurs="plomberie"></div>
 * Filtre auto par tableau metiers[]. Préférés affichés en premier avec badge ★.
 */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

  // Couleurs déterministes par initiale (fallback logo)
  var PALETTES = [
    ['#0DA0CF', '#0A4F6E'], ['#FF6B1A', '#7A1F0A'], ['#FFB400', '#5A4500'],
    ['#7C3AED', '#3A1A6E'], ['#22C55E', '#0A4F38'], ['#E11D48', '#7F1D1D'],
    ['#0EA5E9', '#075985'], ['#F97316', '#7C2D12'], ['#10B981', '#064E3B']
  ];
  function paletteFor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return PALETTES[h % PALETTES.length];
  }

  function esc(s) { return (s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]); }); }

  function renderCard(s) {
    var pal = paletteFor(s.name);
    var initial = (s.name || '?').trim().charAt(0).toUpperCase();
    var logo = s.logo_url
      ? '<img src="' + esc(s.logo_url) + '" alt="' + esc(s.name) + '" loading="lazy" style="max-width:100%;max-height:100%;object-fit:contain">'
      : '<span style="font-family:\'Playfair Display\',serif;font-size:2rem;font-weight:700;color:#fff;line-height:1">' + esc(initial) + '</span>';
    var websiteAttr = s.website ? ' href="' + esc(s.website) + '" target="_blank" rel="noopener"' : ' href="contact.html?objet=' + encodeURIComponent('Question fournisseur ' + s.name) + '"';
    return '<a class="hcf-card"' + websiteAttr + ' aria-label="' + esc(s.name) + '">' +
      (s.is_preferred ? '<span class="hcf-badge" title="Marque préférée HC">★</span>' : '') +
      '<span class="hcf-logo" style="background:linear-gradient(135deg,' + pal[0] + ' 0%,' + pal[1] + ' 100%)">' + logo + '</span>' +
      '<span class="hcf-name">' + esc(s.name) + '</span>' +
      '</a>';
  }

  function injectStyle() {
    if (document.getElementById('hcfStyle')) return;
    var st = document.createElement('style');
    st.id = 'hcfStyle';
    st.textContent =
      '.hc-fournisseurs-section{padding:48px 0;background:linear-gradient(180deg,#FAFCFD,#fff);border-top:1px solid #E5EDF3;border-bottom:1px solid #E5EDF3}' +
      '.hc-fournisseurs-section .container{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}' +
      '.hcf-head{text-align:center;margin-bottom:28px}' +
      '.hcf-eyebrow{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0DA0CF;margin-bottom:8px}' +
      '.hcf-title{font-family:\'Inter\',sans-serif;font-size:clamp(1.5rem,2.6vw,2rem);font-weight:800;color:#0A1428;margin:0 0 8px;letter-spacing:-.02em}' +
      '.hcf-title em{font-family:\'Playfair Display\',Georgia,serif;font-style:italic;color:#0DA0CF;font-weight:600}' +
      '.hcf-sub{font-size:.95rem;color:#64748b;margin:0}' +
      '.hcf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px;margin:0 0 18px}' +
      '.hcf-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 12px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;text-decoration:none;transition:all .2s ease;color:#0A1428}' +
      '.hcf-card:hover{transform:translateY(-3px);box-shadow:0 18px 36px -16px rgba(13,160,207,.18);border-color:rgba(13,160,207,.30)}' +
      '.hcf-badge{position:absolute;top:8px;right:8px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FFB400,#FF6B1A);color:#fff;font-size:.7rem;border-radius:50%;box-shadow:0 3px 8px rgba(255,107,26,.30)}' +
      '.hcf-logo{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:14px;overflow:hidden;flex-shrink:0;box-shadow:0 6px 16px rgba(10,20,40,.10)}' +
      '.hcf-name{font-size:.86rem;font-weight:700;text-align:center;line-height:1.2}' +
      '.hcf-foot{text-align:center;font-size:.84rem;color:#64748b}' +
      '.hcf-foot a{color:#0DA0CF;font-weight:600;text-decoration:none}';
    document.head.appendChild(st);
  }

  function labelMetier(m) {
    return ({ plomberie: 'plomberie', chauffage: 'chauffage', electricite: 'électricité', serrurerie: 'serrurerie', vitrerie: 'vitrerie', renovation: 'rénovation', menuiserie: 'menuiserie', volets: 'volets' })[m] || m;
  }

  // Fallback statique si fetch Supabase échoue (cache navigateur, RLS, réseau…)
  // — assure que le bandeau s'affiche TOUJOURS avec au moins quelques marques connues
  var FALLBACK_BY_METIER = {
    plomberie:   [['Atlantic',true],['Geberit',true],['Nicoll',true],['Grohe',false],['Jacob Delafon',false],['Carlo Frattini',false],['Hansgrohe',false],['Ramon Soler',false],['Roca',false]],
    chauffage:   [['Atlantic',true],['Saunier Duval',true],['De Dietrich',false],['ELM Leblanc',false],['Frisquet',false],['Viessmann',false]],
    electricite: [['Legrand',true],['Schneider Electric',true],['Hager',false],['Niko',false],['Somfy',true]],
    serrurerie:  [['Bricard',true],['Vachette',true],['Fichet',false],['Heracles',false],['Picard',false]],
    vitrerie:    [['Saint-Gobain',true],['Lapeyre',false],['Verissimo',false]],
    menuiserie:  [['K-Line',false],['Lapeyre',false],['Tryba',false]],
    volets:      [['Bubendorff',true],['Somfy',true],['Soprofen',true],['Profalux',false]],
    renovation:  [['Knauf',false],['Placo',false],['Tollens',false],['Nuances Unikalo',true]]
  };
  function fallbackFor(metier) {
    return (FALLBACK_BY_METIER[metier] || []).map(function(pair){ return { name: pair[0], slug: pair[0].toLowerCase().replace(/[^a-z0-9]+/g,'-'), is_preferred: pair[1], metiers:[metier], website: null, logo_url: null }; });
  }

  async function fetchSuppliers(metier) {
    try {
      var resp = await fetch(SUPABASE_URL + '/rest/v1/suppliers?select=*&active=eq.true&order=is_preferred.desc,name.asc&_ts=' + Date.now(), {
        headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + SUPABASE_ANON, 'Cache-Control': 'no-store' },
        cache: 'no-store'
      });
      if (!resp.ok) { console.warn('[hc-fournisseurs] fetch HTTP', resp.status, '— fallback statique'); return fallbackFor(metier); }
      var data = await resp.json();
      var filtered = data.filter(function (s) { return Array.isArray(s.metiers) && s.metiers.indexOf(metier) !== -1; });
      if (filtered.length === 0) { console.warn('[hc-fournisseurs] 0 résultat pour', metier, '— fallback statique'); return fallbackFor(metier); }
      return filtered;
    } catch (e) { console.error('[hc-fournisseurs]', e, '— fallback statique'); return fallbackFor(metier); }
  }

  async function render(root) {
    var metier = root.getAttribute('data-hc-fournisseurs');
    if (!metier) return;
    injectStyle();
    root.innerHTML = '<section class="hc-fournisseurs-section"><div class="container"><div class="hcf-head"><span class="hcf-eyebrow">Nos partenaires</span><h2 class="hcf-title">Marques <em>' + labelMetier(metier) + '</em> que nous installons</h2><p class="hcf-sub">Chargement…</p></div></div></section>';
    var suppliers = await fetchSuppliers(metier);
    var html = '<section id="fournisseurs" class="hc-fournisseurs-section"><div class="container">';
    html += '<div class="hcf-head"><span class="hcf-eyebrow">Nos partenaires</span><h2 class="hcf-title">Marques <em>' + labelMetier(metier) + '</em> que nous installons</h2>';
    if (suppliers.length) {
      html += '<p class="hcf-sub">' + suppliers.length + ' fabricant' + (suppliers.length > 1 ? 's' : '') + ' référencé' + (suppliers.length > 1 ? 's' : '') + ' — pièces d\'origine, garanties constructeur honorées</p>';
    } else {
      html += '<p class="hcf-sub">Notre catalogue partenaires est en cours de mise à jour.</p>';
    }
    html += '</div>';
    if (suppliers.length) {
      html += '<div class="hcf-grid">' + suppliers.map(renderCard).join('') + '</div>';
    }
    html += '<p class="hcf-foot">Vous souhaitez une marque particulière non listée ? <a href="contact.html?objet=Demande%20marque%20sp%C3%A9cifique">Faites-nous votre demande →</a></p>';
    html += '</div></section>';
    root.innerHTML = html;
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
