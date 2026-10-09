// hc-reserve-modal.js
// Les boutons « Réserver » des cartes tarif des pages métier mènent au tunnel « Ma demande ».
//
// Avant le 2026-10-08, ce fichier lisait le prix affiché dans la carte et appelait
// `stripe-create-payment-link` avec ce montant. La fonction est publique, sans authentification,
// branchée sur une clé Stripe réelle : n'importe qui pouvait donc obtenir un lien de paiement au
// nom de l'entreprise, pour le montant de son choix. Le montant ne doit pas venir du navigateur —
// il est tenu par le serveur, dans le tunnel.
//
// Le fichier portait aussi une modale (« Demander un devis » / « Réserver & payer en ligne ») qui
// n'était jamais ouverte : la classe `is-open` n'était qu'enlevée, jamais posée. Elle est retirée
// avec le reste.
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    // Les cartes « complex » demandent un devis : on les laisse suivre leur propre lien.
    var boutons = document.querySelectorAll('.m-tarif-card:not(.complex) .m-tarif-action');
    if (!boutons.length) return;

    boutons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var href = btn.getAttribute('href') || '';
        if (!href.startsWith('contact.html')) return;   // lien tel:, mailto:… : laisser passer
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        window.location.href = '/catalogue.html#intervention';
      });
    });
  });
})();
