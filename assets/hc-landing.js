/*! HELP Confort — mesure des pages d'atterrissage « entretien » (campagnes Google Ads / Meta).
 *  Page : <body data-hc-landing="chaudiere|ramonage|contrat|poele">. Événements (aucune donnée personnelle) :
 *  view_maintenance_landing · click_maintenance_cta · click_to_call · start_maintenance_funnel (souscription ouverte,
 *  événement « hc:funnel-start ») · maintenance_submit + generate_lead (envoi confirmé, événement « hc:lead-sent »).
 *  Toujours consignés dans window.__hcFunnel (contrôle recette). Envoyés à GA4 via window.hcGtag, qui n'existe
 *  qu'en production ET après consentement (assets/tracking.js) ; avant consentement, rien ne sort du navigateur. */
(function () {
  'use strict';
  var body = document.body; if (!body) return;
  var fam = String(body.getAttribute('data-hc-landing') || '');
  if (!/^(chaudiere|ramonage|contrat|poele)$/.test(fam)) return;
  if (window.__hcLandingInit) return; window.__hcLandingInit = true;
  var PROD = /^(www\.)?depan59-62\.fr$/.test(location.hostname);
  var queue = [];
  function clean(p) {
    var out = {}; Object.keys(p || {}).forEach(function (k) {
      var v = p[k]; if (v == null || v === '') return;
      if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; return; }
      v = String(v); if (/@/.test(v) || /\d{8,}/.test(v.replace(/[\s.\-()+]/g, ''))) return; // jamais d'email ni de numéro
      out[k] = v.slice(0, 80);
    });
    return out;
  }
  function flush() { if (typeof window.hcGtag !== 'function') return; while (queue.length) { var x = queue.shift(); try { window.hcGtag('event', x[0], x[1]); } catch (e) {} } }
  function send(ev, p) {
    var params = clean(Object.assign({ service_family: fam, page_type: 'maintenance_landing' }, p || {}));
    try { var log = (window.__hcFunnel = window.__hcFunnel || []); log.push({ ev: ev, p: params, t: Date.now() }); if (log.length > 200) log.shift(); } catch (e) {}
    if (!PROD) return;
    queue.push([ev, params]); flush();
  }
  window.addEventListener('load', flush);
  window.addEventListener('hc-consent-granted', function () { setTimeout(flush, 1500); });

  send('view_maintenance_landing');
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button') : null; if (!el) return;
    var href = el.getAttribute('href') || '';
    if (el.hasAttribute('data-hc-cta')) send('click_maintenance_cta', { cta: el.getAttribute('data-hc-cta') });
    else if (/^tel:/.test(href)) send('click_to_call', { position: el.closest('#hcHeader') ? 'entete' : 'page' });
  }, true);
  // Souscription ouverte (page contrats : fenêtre de souscription)
  document.addEventListener('hc:funnel-start', function (e) {
    var d = (e && e.detail) || {};
    send('start_maintenance_funnel', { entry: d.entry || fam, energie: d.energie || null, formule: d.formule || null });
  });
  // Envoi confirmé par le serveur : formulaire de rappel (assets/hc-leads-capture.js) ou souscription (page contrats)
  document.addEventListener('hc:lead-sent', function (e) {
    var d = (e && e.detail) || {}, p = { lead_type: d.type || fam, energie: d.energie || null, formule: d.formule || null };
    send('maintenance_submit', p);
    send('generate_lead', p);
  });
})();
