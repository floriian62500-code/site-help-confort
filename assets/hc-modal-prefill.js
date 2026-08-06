/* HELP Confort — Préremplissage modaux lead/réservation
 * 2026-06-01 : conserve les coordonnées en localStorage pour pré-remplir tous les modaux
 *              (modal Réserver pages métier, modal leadgate prestations, etc.)
 * Auto-binding : tout formulaire avec [data-hc-lead] est préremplit à l'affichage.
 */
(function () {
  'use strict';
  var LS_KEY = 'hc_lead_v1';

  // Mapping tolérant : on lit/écrit avec plusieurs noms possibles pour chaque champ
  var FIELD_ALIASES = {
    prenom: ['prenom', 'firstname', 'first_name'],
    nom: ['nom', 'lastname', 'last_name', 'name'],
    telephone: ['telephone', 'tel', 'phone'],
    email: ['email'],
    adresse: ['adresse', 'address'],
    code_postal: ['code_postal', 'cp', 'postal_code', 'zip'],
    ville: ['ville', 'city']
  };

  // 2026-06-04 — Validation au read : si données stockées pourries, purger
  function isValidStore(d) {
    if (!d || typeof d !== 'object') return false;
    var tel = (d.telephone || '').replace(/[^0-9]/g, '');
    return (d.prenom || '').length >= 2 && !/^[0-9]+$/.test(d.prenom)
        && (d.nom || '').length >= 2 && !/^[0-9]+$/.test(d.nom)
        && tel.length >= 10 && tel.length <= 13
        && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(d.email || '');
  }
  function readStore() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      // HC 2026-08-06 : expiration courte des PII (24 h). On ne conserve pas durablement
      // nom/téléphone/email/adresse — au-delà, on purge et le visiteur re-saisit.
      var MAX_AGE = 24 * 3600 * 1000;
      if (d.saved_at && (Date.now() - new Date(d.saved_at).getTime()) > MAX_AGE) { localStorage.removeItem(LS_KEY); return {}; }
      if (!isValidStore(d)) { localStorage.removeItem(LS_KEY); return {}; }
      return d;
    } catch (_) { return {}; }
  }
  function writeStore(d) {
    try {
      d.saved_at = new Date().toISOString();
      localStorage.setItem(LS_KEY, JSON.stringify(d));
    } catch (_) {}
  }

  function prefillForm(form) {
    if (!form || form.dataset.hcPrefilled === '1') return;
    var d = readStore();
    if (!d || !Object.keys(d).length) return;
    Object.keys(FIELD_ALIASES).forEach(function (canonical) {
      var val = d[canonical];
      if (!val) return;
      FIELD_ALIASES[canonical].forEach(function (alias) {
        var input = form.querySelector('[name="' + alias + '"]');
        if (input && !input.value) input.value = val;
      });
    });
    form.dataset.hcPrefilled = '1';
  }

  function harvestForm(form) {
    var d = readStore();
    Object.keys(FIELD_ALIASES).forEach(function (canonical) {
      FIELD_ALIASES[canonical].forEach(function (alias) {
        var input = form.querySelector('[name="' + alias + '"]');
        if (input && input.value && !d[canonical]) d[canonical] = input.value;
      });
    });
    writeStore(d);
  }

  function bind() {
    document.querySelectorAll('form[data-hc-lead]').forEach(function (form) {
      prefillForm(form);
      // À la soumission, on garde les valeurs pour la prochaine fois
      form.addEventListener('submit', function () { harvestForm(form); }, { capture: true });
    });
  }

  // Watcher : les modaux peuvent apparaître après le load (innerHTML dynamique)
  var mo = new MutationObserver(function () { bind(); });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bind();
      mo.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    bind();
    mo.observe(document.body, { childList: true, subtree: true });
  }
})();
