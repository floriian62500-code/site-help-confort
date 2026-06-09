/* hc-partners-loader — hydrate <div class="hc-partners-pmr"> avec les partenaires actifs filtrés par tag
 * Usage : <div class="hc-partners-pmr" data-partner-tag="pmr"></div>
 * Le contenu HTML pré-rendu reste comme fallback SEO et est remplacé seulement si la requête réussit.
 * 2026-06-09 — étape 4/4 du CRUD partenaires
 */
(function () {
  'use strict';
  var ENDPOINT = 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/partners-json';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fallbackInitials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  function renderCard(p) {
    var hasLogo = !!p.logo_url;
    var logoStyle = p.badge_color
      ? 'background:' + p.badge_color
      : 'background:#F7FBFD';
    var highlightClass = p.highlight ? ' hc-partner-card-poste' : '';

    var inner = hasLogo
      ? '<img src="' + esc(p.logo_url) + '" alt="Logo ' + esc(p.name) + '" loading="lazy" onerror="this.style.display=\'none\';this.parentElement.classList.add(\'hc-partner-logo-fallback\')">'
        + '<span class="hc-partner-fallback-text">' + esc(p.name) + '</span>'
      : '<span class="hc-partner-fallback-text" style="display:block;color:#fff;font-weight:800;font-size:1.1rem;letter-spacing:-.02em">' + esc(fallbackInitials(p.name)) + '</span>';

    return ''
      + '<a href="' + esc(p.website || '#') + '" target="_blank" rel="noopener noreferrer" class="hc-partner-card' + highlightClass + '">'
      +   '<div class="hc-partner-logo" style="' + esc(logoStyle) + '">' + inner + '</div>'
      +   '<h3>' + esc(p.name) + '</h3>'
      +   (p.type ? '<p class="hc-partner-role">' + esc(p.type) + '</p>' : '')
      +   (p.description ? '<p class="hc-partner-desc">' + esc(p.description) + '</p>' : '')
      +   '<span class="hc-partner-cta">' + (p.highlight ? 'Voir son site →' : 'Voir son site →') + '</span>'
      + '</a>';
  }

  function hydrate(container) {
    var tag = container.getAttribute('data-partner-tag') || 'pmr';
    var url = ENDPOINT + '?tag=' + encodeURIComponent(tag);
    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        if (!json || !json.success || !Array.isArray(json.partners) || !json.partners.length) {
          // Ne pas vider le HTML statique → fallback SEO conservé
          return;
        }
        container.innerHTML = json.partners.map(renderCard).join('');
      })
      .catch(function () { /* silencieux : on garde le HTML statique en fallback */ });
  }

  function init() {
    document.querySelectorAll('.hc-partners-pmr[data-partner-tag]').forEach(hydrate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
