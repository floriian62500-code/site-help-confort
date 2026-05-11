/* ═══════════════════════════════════════════════════════════════
   HELP! Confort — Module "Site Content"
   Lit le contenu éditable depuis Supabase et l'injecte dans les pages.
   Cherche les éléments avec data-content="path.to.key" et y remplace
   leur contenu textuel.

   Usage dans une page :
     <h1 data-content="hero.title">Titre par défaut</h1>
     <p data-content="texts.about">Texte par défaut</p>
     <a data-content="footer.fb_url" data-content-attr="href">Facebook</a>

   Si data-content-attr est défini, c'est cet attribut qui est modifié
   au lieu du texte de l'élément.
═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

  // Cache court côté navigateur (5 min) pour éviter les requêtes répétées
  var CACHE_KEY = 'hc-site-content-cache';
  var CACHE_TTL = 5 * 60 * 1000;

  function getDeep(obj, path) {
    return path.split('.').reduce(function(o, k) { return o && o[k]; }, obj);
  }

  function applyContent(content) {
    if (!content) return;
    var elements = document.querySelectorAll('[data-content]');
    elements.forEach(function(el) {
      var path = el.getAttribute('data-content');
      var val = getDeep(content, path);
      if (val === undefined || val === null || val === '') return;

      var attr = el.getAttribute('data-content-attr');
      if (attr) {
        el.setAttribute(attr, val);
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = val;
      } else {
        // Préserver les retours à la ligne dans les textareas-like et paragraphes
        if (typeof val === 'string' && val.indexOf('\n') !== -1) {
          el.innerHTML = val.split('\n').map(function(line) {
            return line.replace(/[&<>"']/g, function(c) {
              return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
            });
          }).join('<br>');
        } else {
          el.textContent = val;
        }
      }
    });

    // Métiers : si une liste avec data-content-metiers est présente, on la régénère
    var metiersHost = document.querySelector('[data-content-metiers]');
    if (metiersHost && content.metiers && content.metiers.length) {
      var template = metiersHost.getAttribute('data-content-metiers-template') || 'default';
      if (template === 'default') {
        metiersHost.innerHTML = content.metiers.map(function(m) {
          var html = '<a href="' + (m.url || '#') + '" class="metier-card">';
          html += '<div class="metier-icon">' + (m.icon || '🔧') + '</div>';
          html += '<h3>' + (m.name || '') + '</h3>';
          if (m.desc) html += '<p>' + m.desc + '</p>';
          html += '</a>';
          return html;
        }).join('');
      }
    }
  }

  function loadFromCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_TTL) return null;
      return parsed.data;
    } catch (e) { return null; }
  }

  function saveToCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) {}
  }

  function load() {
    // 1. Appliquer immédiatement depuis le cache (rendu instantané)
    var cached = loadFromCache();
    if (cached) applyContent(cached);

    // 2. Fetch depuis Supabase pour rafraîchir
    fetch(SUPABASE_URL + '/rest/v1/app_settings?key=eq.site_content&select=value', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(rows) {
      if (rows && rows[0] && rows[0].value) {
        applyContent(rows[0].value);
        saveToCache(rows[0].value);
      }
    })
    .catch(function(e) {
      console.warn('[hc-content] Fetch failed, using defaults', e.message);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }

  // Exposer pour rechargement manuel
  window.HCContent = { load: load, applyContent: applyContent };
})();
