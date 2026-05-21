/* ═══════════════════════════════════════════════════════════════
   HC-PHOTOS-OVERRIDE — Substitue les photos locales par celles du
   bucket Supabase Storage "prestations" quand elles existent.
   ═══════════════════════════════════════════════════════════════

   Mécanique :
   1. Charge un manifest depuis https://...supabase.co/storage/v1/object/public/prestations/_manifest.json
      Le manifest a la forme : { "salle-de-bain.jpg": 1700000000, "chauffe-eau.jpg": 1700000123, ... }
      (la valeur est un timestamp utilisé pour cache-busting)
   2. Mémorise le manifest en sessionStorage (1 fois par session)
   3. Au chargement de la page, parcourt toutes les <img> qui pointent vers
      images/prestations/X.jpg et substitue le src par
      https://...supabase.co/storage/v1/object/public/prestations/X.jpg?v=TS
      si X.jpg est listé dans le manifest.
   4. Si le manifest n'existe pas ou n'est pas accessible, le site reste
      sur les images locales (fallback total).

   Inclure sur toutes les pages qui ont des <img src="images/prestations/...">.
   ─────────────────────────────────────────────────────────────── */
(function() {
  'use strict';

  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var BUCKET = 'prestations';
  var BASE_URL = SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/';
  var MANIFEST_PATH = '_manifest.json';
  var CACHE_KEY = 'hc_photos_manifest_v1';
  var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function getCachedManifest() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - (obj.t || 0) > CACHE_TTL) return null;
      return obj.m;
    } catch (e) { return null; }
  }

  function setCachedManifest(m) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), m: m }));
    } catch (e) { /* quota plein, peu importe */ }
  }

  function applyOverride(manifest) {
    if (!manifest || typeof manifest !== 'object') return;
    var imgs = document.querySelectorAll('img[src*="images/prestations/"]');
    imgs.forEach(function(img) {
      var src = img.getAttribute('src') || '';
      // Extraire le filename (dernière partie après /)
      var m = src.match(/images\/prestations\/([^?#]+)/);
      if (!m) return;
      var filename = m[1];
      if (!manifest[filename]) return;
      var newUrl = BASE_URL + filename + '?v=' + manifest[filename];
      // Ne pas écraser si déjà fait
      if (img.dataset.hcPhotoOverride === '1') return;
      img.dataset.hcPhotoOverride = '1';
      img.dataset.hcPhotoOriginal = src;
      img.src = newUrl;
    });
  }

  function fetchManifest() {
    return fetch(BASE_URL + MANIFEST_PATH, { cache: 'no-cache' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .catch(function() { return null; });
  }

  function init() {
    var cached = getCachedManifest();
    if (cached) {
      applyOverride(cached);
      return;
    }
    fetchManifest().then(function(m) {
      if (!m) return;
      setCachedManifest(m);
      applyOverride(m);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Réappliquer si nouvelles images injectées (carousel, lazy load…)
  var mo = new MutationObserver(function(muts) {
    var cached = getCachedManifest();
    if (!cached) return;
    muts.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (n.nodeType === 1) applyOverride(cached);
      });
    });
  });
  try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) {}

  // Exposer pour debug
  window.hcPhotosOverride = {
    refresh: function() {
      sessionStorage.removeItem(CACHE_KEY);
      init();
    },
    BASE_URL: BASE_URL
  };
})();
