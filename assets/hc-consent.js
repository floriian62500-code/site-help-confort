/*!
 * HELP Confort — Banner de consentement RGPD (HC-CONSENT-V1)
 * ───────────────────────────────────────────────────────────
 * Banner minimal CSS pur (zéro dépendance). Affiché tant que l'utilisateur
 * n'a pas choisi. 2 boutons : Accepter (analytics actives) / Refuser (rien
 * ne charge). Décision persistée dans localStorage.hc-consent.
 *
 * Conforme :
 *  - CNIL : choix explicite, refus aussi simple qu'accepter, info préalable.
 *  - RGPD art. 7 : consentement libre, spécifique, éclairé, univoque.
 *
 * Édition : Florian peut ouvrir /mentions-legales.html#cookies pour relire.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'hc-consent';
  // Sortie immédiate si le visiteur a déjà choisi (granted ou denied).
  try {
    var cur = localStorage.getItem(STORAGE_KEY);
    if (cur === 'granted' || cur === 'denied') return;
  } catch (e) { return; }

  function persist(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    var banner = document.getElementById('hc-consent-banner');
    if (banner) banner.parentNode.removeChild(banner);
    if (value === 'granted') {
      try { window.dispatchEvent(new Event('hc-consent-granted')); } catch (e) {}
    }
  }

  function build() {
    if (document.getElementById('hc-consent-banner')) return;

    var style = document.createElement('style');
    style.id = 'hc-consent-style';
    style.textContent = [
      '#hc-consent-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;',
      'background:#fff;border:1px solid rgba(13,160,207,.25);border-radius:14px;',
      'box-shadow:0 18px 40px rgba(2,30,60,.18);padding:16px 18px;',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0b1f33;',
      'display:flex;flex-wrap:wrap;align-items:center;gap:14px;max-width:880px;margin:0 auto;}',
      '#hc-consent-banner p{margin:0;flex:1 1 280px;font-size:14px;line-height:1.5;}',
      '#hc-consent-banner strong{color:#0DA0CF;}',
      '#hc-consent-banner a{color:#0DA0CF;text-decoration:underline;}',
      '#hc-consent-banner .hc-c-btns{display:flex;gap:8px;flex-wrap:wrap;}',
      '#hc-consent-banner button{cursor:pointer;border-radius:10px;padding:10px 16px;',
      'font-size:14px;font-weight:600;border:1px solid transparent;font-family:inherit;}',
      '#hc-consent-banner .hc-c-accept{background:#0DA0CF;color:#fff;}',
      '#hc-consent-banner .hc-c-accept:hover{background:#0a86ad;}',
      '#hc-consent-banner .hc-c-refuse{background:#fff;color:#0b1f33;border-color:#cfd8e3;}',
      '#hc-consent-banner .hc-c-refuse:hover{background:#f1f5f9;}',
      '@media(max-width:560px){#hc-consent-banner{flex-direction:column;align-items:stretch;}',
      '#hc-consent-banner .hc-c-btns{justify-content:stretch;}',
      '#hc-consent-banner button{flex:1;}}'
    ].join('');
    document.head.appendChild(style);

    var div = document.createElement('div');
    div.id = 'hc-consent-banner';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-live', 'polite');
    div.setAttribute('aria-label', 'Préférences de cookies');
    div.innerHTML =
      '<p><strong>Cookies de mesure d\'audience.</strong> ' +
      'Nous utilisons Google Analytics pour comprendre comment vous utilisez le site ' +
      '(pages vues, durée de visite). Aucun cookie publicitaire. ' +
      'Vous pouvez modifier ce choix à tout moment depuis les ' +
      '<a href="/mentions-legales.html#cookies">mentions légales</a>.</p>' +
      '<div class="hc-c-btns">' +
      '<button type="button" class="hc-c-refuse" aria-label="Refuser les cookies de mesure">Refuser</button>' +
      '<button type="button" class="hc-c-accept" aria-label="Accepter les cookies de mesure">Accepter</button>' +
      '</div>';
    document.body.appendChild(div);

    div.querySelector('.hc-c-accept').addEventListener('click', function () { persist('granted'); });
    div.querySelector('.hc-c-refuse').addEventListener('click', function () { persist('denied'); });
  }

  // Helper exposé pour rouvrir le choix depuis mentions-legales.
  window.hcConsentReset = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    build();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
