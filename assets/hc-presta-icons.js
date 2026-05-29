/* ============================================================
   HC-PRESTA-ICONS — Photos catalogue (uploaded depuis BO admin)
   Bucket Supabase 'prestations' : {slug}.jpg ou {slug}.png
   Fallback : emoji existant (pas de SVG dessiné moche)
   ============================================================ */
(function () {
  'use strict';

  var SUPA_BASE = 'https://btcbjwqiivhpwoszomhg.supabase.co/storage/v1/object/public/prestations/';
  var imgCache = {};  // slug → 'ok' | 'no' | url

  function getSlug(card) {
    var pid = card.dataset.prestaId || '';
    // nettoyer suffixes ('-2', '-3' utilisé dans la modal)
    pid = pid.replace(/-\d+$/, '');
    return pid.toLowerCase();
  }

  function tryLoadImage(url, cb) {
    var img = new Image();
    img.onload = function () { cb(true); };
    img.onerror = function () { cb(false); };
    img.src = url;
  }

  function setCardImage(card, url) {
    var iconEl = card.querySelector('.pp-icon, .apm-item-icon');
    if (!iconEl) return;
    iconEl.classList.add('hc-img-cover');
    iconEl.innerHTML = '<img src="' + url + '" alt="" loading="lazy" decoding="async">';
  }

  function decorate(card) {
    if (card.dataset.hcPhotoDone) return;
    card.dataset.hcPhotoDone = '1';
    var slug = getSlug(card);
    if (!slug) return;
    if (imgCache[slug] === 'no') return; // fallback emoji

    if (imgCache[slug] && imgCache[slug] !== 'no') {
      setCardImage(card, imgCache[slug]);
      return;
    }

    // Essayer .jpg puis .png
    var jpgUrl = SUPA_BASE + slug + '.jpg';
    tryLoadImage(jpgUrl, function (ok) {
      if (ok) {
        imgCache[slug] = jpgUrl;
        setCardImage(card, jpgUrl);
        return;
      }
      var pngUrl = SUPA_BASE + slug + '.png';
      tryLoadImage(pngUrl, function (ok2) {
        if (ok2) {
          imgCache[slug] = pngUrl;
          setCardImage(card, pngUrl);
        } else {
          imgCache[slug] = 'no';
          // Reset le flag pour rebrancher si re-décoration
          delete card.dataset.hcPhotoDone;
        }
      });
    });
  }

  var CSS = '\
.hc-img-cover{padding:0 !important;overflow:hidden;border-radius:12px;background:#fff !important;width:64px !important;height:64px !important;display:flex !important;align-items:center;justify-content:center}\
.hc-img-cover img{width:100% !important;height:100% !important;object-fit:contain !important;display:block}\
.apm-item .hc-img-cover{width:48px !important;height:48px !important}\
.pp-card.pp-selected .hc-img-cover{background:#fff !important}\
';

  function decorateAll() {
    document.querySelectorAll('.pp-card, .apm-item').forEach(decorate);
  }

  function init() {
    if (!document.getElementById('hc-presta-photos-style')) {
      var st = document.createElement('style');
      st.id = 'hc-presta-photos-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    decorateAll();
    // Observer pour MAJ continue (wizard remplace cartes au filtre)
    var mo = new MutationObserver(function () { setTimeout(decorateAll, 30); });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
