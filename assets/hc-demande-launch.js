/*! HELP Confort — lanceur du module « Ma demande ».
 *  À inclure sur toute page qui renvoie vers le tunnel : les liens /catalogue… ouvrent alors la
 *  fenêtre premium (modale desktop, feuille plein écran mobile) au lieu de quitter la page.
 *  Chargement à la demande (survol, toucher, ou inactivité) ; si un fichier ne charge pas,
 *  le lien reste une navigation normale vers /catalogue.html. */
(function () {
  'use strict';
  var V = document.currentScript && (document.currentScript.src.split('v=')[1] || '').split('&')[0] || '';
  var q = V ? '?v=' + V : '';
  var loading = null;
  function load() {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      if (!document.querySelector('link[href*="hc-demande.css"]')) {
        var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/assets/hc-demande.css' + q; document.head.appendChild(css);
      }
      var srcs = ['/assets/hc-cart.js', '/assets/hc-demande-core.js', '/assets/hc-demande.js'];
      (function next(i) {
        if (i >= srcs.length) return resolve();
        if (document.querySelector('script[src^="' + srcs[i] + '"]')) return next(i + 1);
        var sc = document.createElement('script'); sc.src = srcs[i] + q; sc.async = false;
        sc.onload = function () { next(i + 1); }; sc.onerror = reject;
        document.head.appendChild(sc);
      })(0);
    });
    return loading;
  }
  function cta(el) { return el && el.closest ? el.closest('a[href*="/catalogue"]') : null; }
  function hashOf(a) { var h = (a.getAttribute('href') || '').split('#')[1] || ''; return h ? '#' + h : '#intervention'; }
  ['pointerover', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (cta(e.target)) load(); }, { passive: true });
  });
  document.addEventListener('click', function (e) {
    var a = cta(e.target);
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button && e.button > 0)) return;
    e.preventDefault();
    var hash = hashOf(a);
    load().then(function () { window.HcDemande.open(hash, a); }, function () { location.href = a.getAttribute('href'); });
  });
  if (/^#(step=|cat=|intervention$|devis$|entretien$)/.test(location.hash)) load().then(function () { window.HcDemande.open(location.hash); });
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 6000); };
  idle(function () { load(); }, { timeout: 8000 });
})();
