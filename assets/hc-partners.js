/* HELP Confort — Bandeau partenaires "Réseau de confiance"
 * Usage : <div data-hc-partners></div>
 * Affiche : assurances, syndics, urgentistes, plateformes nationales depuis BDD Supabase.
 */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPABASE_ANON = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

  function esc(s) { return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]); }); }

  function paletteFor(name) {
    var pal = [['#0DA0CF','#0A4F6E'],['#FF6B1A','#7A1F0A'],['#FFB400','#5A4500'],['#7C3AED','#3A1A6E'],['#22C55E','#0A4F38'],['#E11D48','#7F1D1D']];
    var h = 0, n = name || '';
    for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return pal[h % pal.length];
  }

  function injectStyle() {
    if (document.getElementById('hcpStyle')) return;
    var st = document.createElement('style');
    st.id = 'hcpStyle';
    st.textContent =
      '.hc-partners-section{padding:48px 0;background:linear-gradient(180deg,#fff,#FAFCFD);border-top:1px solid #E5EDF3;border-bottom:1px solid #E5EDF3}' +
      '.hc-partners-section .container{max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}' +
      '.hcp-head{text-align:center;margin-bottom:28px}' +
      '.hcp-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:.74rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0DA0CF;margin-bottom:10px;padding:6px 14px;border:1px solid rgba(13,160,207,.30);border-radius:999px}' +
      '.hcp-title{font-family:\'Inter\',sans-serif;font-size:clamp(1.4rem,2.4vw,1.9rem);font-weight:800;color:#0A1428;margin:0 0 10px;letter-spacing:-.02em}' +
      '.hcp-title em{font-family:\'Playfair Display\',Georgia,serif;font-style:italic;color:#0DA0CF;font-weight:600}' +
      '.hcp-sub{font-size:.94rem;color:#64748b;margin:0;max-width:700px;margin-left:auto;margin-right:auto;line-height:1.55}' +
      '.hcp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;margin-top:24px}' +
      '.hcp-card{position:relative;background:#fff;border:1px solid #E5EDF3;border-radius:14px;padding:18px 16px 16px;text-decoration:none;color:inherit;transition:all .25s ease;display:flex;flex-direction:column;gap:8px;overflow:hidden}' +
      '.hcp-card:hover{transform:translateY(-3px);box-shadow:0 14px 28px -8px rgba(13,160,207,.20);border-color:rgba(13,160,207,.40)}' +
      '.hcp-card::before{content:"";position:absolute;left:0;top:0;width:4px;height:100%;background:linear-gradient(180deg,#0DA0CF,#0A4F6E)}' +
      '.hcp-card.local::before{background:linear-gradient(180deg,#FF6B1A,#7A1F0A)}' +
      '.hcp-type{font-size:.72rem;color:#64748b;font-weight:600;letter-spacing:.02em}' +
      '.hcp-logo{height:48px;display:flex;align-items:center;justify-content:center;margin-top:4px}' +
      '.hcp-logo img{max-width:100%;max-height:100%;object-fit:contain}' +
      '.hcp-logo-fallback{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:10px;color:#fff;font-family:\'Playfair Display\',serif;font-size:1.4rem;font-weight:700;box-shadow:0 3px 8px rgba(10,20,40,.15)}' +
      '.hcp-name{font-weight:800;color:#0A1428;font-size:.94rem;line-height:1.2}' +
      '.hcp-scope{font-size:.7rem;font-weight:700;color:#0DA0CF;text-transform:uppercase;letter-spacing:.06em;margin-top:auto}' +
      '.hcp-card.local .hcp-scope{color:#FF6B1A}';
    document.head.appendChild(st);
  }

  async function fetchPartners() {
    try {
      var resp = await fetch(SUPABASE_URL + '/rest/v1/partners?select=*&active=eq.true&order=position.asc,name.asc', {
        headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + SUPABASE_ANON }
      });
      if (!resp.ok) return [];
      return await resp.json();
    } catch (e) { console.error('[hc-partners]', e); return []; }
  }

  function renderCard(p) {
    var pal = paletteFor(p.name);
    var initial = (p.name || '?').trim().charAt(0).toUpperCase();
    var logoHtml = p.logo_url
      ? '<img src="' + esc(p.logo_url) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'flex\'"><span class="hcp-logo-fallback" style="display:none;background:linear-gradient(135deg,' + pal[0] + ' 0%,' + pal[1] + ' 100%)">' + esc(initial) + '</span>'
      : '<span class="hcp-logo-fallback" style="background:linear-gradient(135deg,' + pal[0] + ' 0%,' + pal[1] + ' 100%)">' + esc(initial) + '</span>';
    // 2026-06-01 — pointe vers fiche partenaire HC interne au lieu du site externe
    var href = 'partenaire.html?slug=' + encodeURIComponent(p.slug || (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-'));
    var targetAttr = '';
    return '<a class="hcp-card ' + (p.scope === 'local' ? 'local' : '') + '" href="' + esc(href) + '"' + targetAttr + '>' +
      '<span class="hcp-type">' + esc(p.type || '') + '</span>' +
      '<div class="hcp-logo">' + logoHtml + '</div>' +
      '<span class="hcp-name">' + esc(p.name) + '</span>' +
      '<span class="hcp-scope">' + (p.scope === 'local' ? 'Local' : 'National') + '</span>' +
      '</a>';
  }

  async function render(root) {
    try {
      injectStyle();
      var partners = await fetchPartners();
      if (!partners.length) { root.innerHTML = ''; return; }
      root.innerHTML =
        '<section class="hc-partners-section" id="partners">' +
          '<div class="container">' +
            '<div class="hcp-head">' +
              '<span class="hcp-eyebrow">✓ Réseau de confiance</span>' +
              '<h2 class="hcp-title">Ils nous confient leurs <em>interventions habitat</em></h2>' +
              '<p class="hcp-sub">Compagnies d\'assurance, syndics, bailleurs, plateformes nationales — un réseau structuré qui nous mandate au quotidien sur le bassin Saint-Omer / Dunkerque.</p>' +
            '</div>' +
            '<div class="hcp-grid">' + partners.map(renderCard).join('') + '</div>' +
          '</div>' +
        '</section>';
    } catch (e) { console.error('[hc-partners]', e); root.innerHTML = ''; }
  }

  function init() {
    document.querySelectorAll('[data-hc-partners]').forEach(render);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
