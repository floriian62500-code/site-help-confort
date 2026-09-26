/*! HELP Confort — mesure du parcours recrutement (chantier RECRUTEMENT, directive 5732826379).
 *  Pages : <body data-hc-recrutement="hub|offre"> (+ data-hc-offre="<slug>" sur une page d'offre).
 *  Événements, sans AUCUNE donnée personnelle : view_recruitment · view_job_offer · click_apply ·
 *  start_application (première saisie du formulaire) · submit_application (envoi tenté) ·
 *  generate_recruitment_lead (envoi confirmé par le serveur, événement « hc:lead-sent »).
 *  Toujours consignés dans window.__hcFunnel (contrôle recette). Envoyés à GA4 via window.hcGtag,
 *  qui n'existe qu'en production ET après consentement (assets/tracking.js) : avant consentement,
 *  rien ne sort du navigateur. Le poste visé est un libellé d'offre, jamais une donnée candidat. */
(function () {
  'use strict';
  var body = document.body; if (!body) return;
  var type = String(body.getAttribute('data-hc-recrutement') || '');
  if (!/^(hub|offre)$/.test(type)) return;
  if (window.__hcRecrutInit) return; window.__hcRecrutInit = true;

  var offre = String(body.getAttribute('data-hc-offre') || '').slice(0, 60);
  var PROD = /^(www\.)?depan59-62\.fr$/.test(location.hostname);
  var queue = [];

  function clean(p) {
    var out = {};
    Object.keys(p || {}).forEach(function (k) {
      var v = p[k]; if (v == null || v === '') return;
      if (typeof v === 'number' || typeof v === 'boolean') { out[k] = v; return; }
      v = String(v);
      // garde-fou : jamais d'email ni de numéro de téléphone dans la mesure
      if (/@/.test(v) || /\d{8,}/.test(v.replace(/[\s.\-()+]/g, ''))) return;
      out[k] = v.slice(0, 80);
    });
    return out;
  }
  function flush() {
    if (typeof window.hcGtag !== 'function') return;
    while (queue.length) { var x = queue.shift(); try { window.hcGtag('event', x[0], x[1]); } catch (e) {} }
  }
  function send(ev, p) {
    var params = clean(Object.assign({ page_type: 'recruitment', job_slug: offre || null }, p || {}));
    try { var log = (window.__hcFunnel = window.__hcFunnel || []); log.push({ ev: ev, p: params, t: Date.now() }); if (log.length > 200) log.shift(); } catch (e) {}
    if (!PROD) return;
    queue.push([ev, params]); flush();
  }
  window.addEventListener('load', flush);
  window.addEventListener('hc-consent-granted', function () { setTimeout(flush, 1500); });

  send(type === 'offre' ? 'view_job_offer' : 'view_recruitment');

  // Clic sur une candidature (bouton marqué data-hc-cta) ou appel direct
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button') : null; if (!el) return;
    var href = el.getAttribute('href') || '';
    if (el.hasAttribute('data-hc-cta')) send('click_apply', { cta: el.getAttribute('data-hc-cta') });
    else if (/^tel:/.test(href)) send('click_to_call', { position: el.closest('#hcHeader') ? 'entete' : 'page' });
    else if (/^mailto:/.test(href)) send('click_apply', { cta: 'email_cv' });
  }, true);

  // Première saisie réelle dans le formulaire de candidature (une seule fois, sans contenu saisi)
  var demarre = false;
  document.addEventListener('input', function (e) {
    if (demarre) return;
    var f = e.target && e.target.closest ? e.target.closest('form[data-hc-lead="candidature"]') : null;
    if (!f) return;
    demarre = true;
    send('start_application', { poste: (f.querySelector('[name="poste"]') || {}).value || null });
  }, true);

  // Pré-sélection du poste depuis une page d'offre (?poste=<slug>) : un libellé d'offre, jamais une donnée candidat
  function prefill() {
    var slug = (location.search.match(/[?&]poste=([a-z0-9-]{1,60})/) || [])[1];
    if (!slug) return;
    var sel = document.querySelector('form[data-hc-lead="candidature"] [name="poste"]');
    if (!sel) return;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].getAttribute('data-slug') === slug) { sel.selectedIndex = i; break; }
    }
    // l'URL ne doit pas rester paramétrée dans l'historique et les partages
    try { history.replaceState(history.state, '', location.pathname + location.hash); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prefill); else prefill();

  // Envoi tenté (le serveur peut encore refuser) puis envoi confirmé.
  // Au passage, on porte le poste visé dans « metier » et on joint expérience + CV au message :
  // le serveur ne transmet que les champs de son contrat, sinon ces informations seraient perdues.
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.matches || !f.matches('form[data-hc-lead="candidature"]')) return;
    var poste = f.querySelector('[name="poste"]'), exp = f.querySelector('[name="exp"]'),
        cv = f.querySelector('[name="cv"]'), msg = f.querySelector('[name="message"]'),
        metier = f.querySelector('[name="metier"]');
    if (metier && poste) metier.value = 'Candidature — ' + (poste.value || 'poste non précisé');
    if (msg) {
      var bouts = [];
      if (exp && exp.value) bouts.push('Expérience : ' + exp.value);
      if (cv && cv.value) bouts.push('CV : ' + cv.value);
      if (bouts.length) {
        var ajout = bouts.join('\n');
        if (msg.value.indexOf(bouts[0]) < 0) msg.value = (msg.value ? msg.value.trim() + '\n\n' : '') + ajout;
      }
    }
    send('submit_application', { poste: poste ? poste.value : null });
  }, true);
  document.addEventListener('hc:lead-sent', function (e) {
    var d = (e && e.detail) || {};
    if (String(d.type || '') !== 'candidature') return;
    send('generate_recruitment_lead', { lead_type: 'candidature' });
  });
})();
