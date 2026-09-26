/*! HELP Confort — disponibilité d'une fonction serveur, pour les écrans d'administration.
 *  Directive 5796732231 §4 : « pas de bouton qui semble fonctionner puis finit en 404 ».
 *
 *  Certaines fonctions existent dans le dépôt mais ne sont pas déployées (état « pending » dans
 *  supabase/functions/DEPLOIEMENT.json). L'écran qui les appelle doit le dire AVANT le clic, pas
 *  après l'échec.
 *
 *  Le contrôle est une vraie sonde, pas une liste en dur : le jour où la fonction est déployée,
 *  le bouton se réactive tout seul, sans modifier cette page.
 *
 *  Usage :
 *    HcFn.garder('actu-generator', {
 *      boutons: [document.getElementById('btnGen')],
 *      zone:    document.getElementById('results'),
 *      quoi:    'La génération d’actualités'
 *    });
 */
(function (global) {
  'use strict';
  var URL_BASE = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var CLE = 'hc-fn-dispo:';
  var enCours = {};

  // Sonde : HEAD, sans en-tête ajouté. C'est une requête « simple » au sens CORS, donc sans
  // pré-vérification — et la passerelle Supabase répond avec « Access-Control-Allow-Origin: * »
  // dans les deux cas, ce qui rend le code lisible depuis le navigateur.
  //   404 = la fonction n'est pas déployée · tout autre code (405 typiquement) = elle existe.
  // ⚠️ Une première version sondait en OPTIONS : le navigateur déclenchait une pré-vérification
  // que le 404 ne satisfaisait pas, la requête échouait, et le repli concluait « disponible ».
  // La garde ne gardait donc rien. HEAD corrige cela.
  //
  // En cas de doute (réseau coupé, réponse inattendue), on répond « disponible » : mieux vaut
  // laisser l'utilisateur essayer que de désactiver un bouton qui marche.
  function sonder(nom) {
    if (enCours[nom]) return enCours[nom];
    var memo = null;
    try { memo = sessionStorage.getItem(CLE + nom); } catch (e) {}
    if (memo === 'oui' || memo === 'non') {
      enCours[nom] = Promise.resolve(memo === 'oui');
      return enCours[nom];
    }
    enCours[nom] = fetch(URL_BASE + '/functions/v1/' + nom, { method: 'HEAD' })
      .then(function (r) { return r.status !== 404; })
      .catch(function () { return true; })
      .then(function (dispo) {
        try { sessionStorage.setItem(CLE + nom, dispo ? 'oui' : 'non'); } catch (e) {}
        return dispo;
      });
    return enCours[nom];
  }

  function message(quoi) {
    var d = document.createElement('div');
    d.className = 'hc-fn-absente';
    d.setAttribute('role', 'status');
    d.style.cssText = 'margin:12px 0;padding:12px 14px;border-radius:10px;border:1px solid #F0C36D;'
      + 'background:#FFF8E6;color:#6B4E00;font-size:.9rem;line-height:1.5';
    d.innerHTML = '<strong>' + (quoi || 'Cette action') + ' n’est pas disponible.</strong><br>'
      + 'La fonction serveur correspondante n’est pas déployée en production. '
      + 'Le bouton est volontairement désactivé : il échouerait. '
      + 'Rien n’est perdu, rien n’a été envoyé.';
    return d;
  }

  function garder(nom, opts) {
    opts = opts || {};
    return sonder(nom).then(function (dispo) {
      if (dispo) return true;
      (opts.boutons || []).forEach(function (b) {
        if (!b) return;
        b.disabled = true;
        b.setAttribute('aria-disabled', 'true');
        b.title = 'Indisponible : fonction serveur non déployée';
        b.style.opacity = '.5';
        b.style.cursor = 'not-allowed';
      });
      var zone = opts.zone || document.body;
      if (zone && !zone.querySelector('.hc-fn-absente')) zone.insertBefore(message(opts.quoi), zone.firstChild);
      return false;
    });
  }

  global.HcFn = { sonder: sonder, garder: garder };
})(window);
