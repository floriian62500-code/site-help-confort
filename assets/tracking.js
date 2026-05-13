/*!
 * HELP! Confort — Tracking centralisé (GA4 + GTM + Clarity)
 * ─────────────────────────────────────────────────────────
 * Tant que les ID sont les placeholders ci-dessous, chaque snippet
 * détecte l'auto-référence et fait `return` immédiatement : aucune
 * requête réseau, aucun cookie, aucune analytics.
 *
 * Pour activer le tracking, remplacer dans CE SEUL fichier :
 *   - GTM-XXXXXXX        → ton ID GTM réel (ex: GTM-ABCDEF1)
 *   - G-XXXXXXXXXX       → ton ID GA4 réel (ex: G-ABC1234XYZ)
 *   - CLARITY_ID         → ton ID Microsoft Clarity réel
 * Puis vider les caches CDN (`assets/tracking.js?v=YYYYMMDD`).
 *
 * Doc : docs/ACTIVER-TRACKING.md
 */
(function () {
  'use strict';

  // ─── Google Tag Manager ────────────────────────────────────────────
  (function (w, d, s, l, i) {
    if (i === 'GTM-XXXXXXX') return; // placeholder → tracking inerte
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX');

  // ─── Google Analytics 4 ────────────────────────────────────────────
  (function () {
    var id = 'G-XXXXXXXXXX';
    if (id === 'G-XXXXXXXXXX') return; // placeholder → tracking inerte
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', id);
  })();

  // ─── Microsoft Clarity ─────────────────────────────────────────────
  (function (c, l, a, r, i, t, y) {
    if (i === 'CLARITY_ID') return; // placeholder → tracking inerte
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'CLARITY_ID');
})();
