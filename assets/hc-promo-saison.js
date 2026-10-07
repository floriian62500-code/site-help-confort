/* Encart saisonnier — présent sur toutes les pages, en permanence.
   ------------------------------------------------------------------
   Décision de Florian du 2026-09-28 : l'encart ne doit plus pouvoir être fermé, et il doit
   apparaître sur tout le site, pas seulement sur l'accueil. Ce fichier remplace donc le bloc
   qui vivait dans index.html : plus de bouton de fermeture, plus de mémoire locale qui le
   masquait sept jours, plus de condition de défilement.

   Ce qu'il fait quand même, et pourquoi :
   · il s'injecte après le chargement de la page, pour ne pas peser sur l'affichage initial ;
   · il se pose au-dessus de la barre d'action collante du mobile — un encart qui recouvre le
     bouton d'appel coûterait des appels au lieu d'en apporter ;
   · il ne s'injecte pas deux fois si la page porte déjà l'encart en dur. */
(function () {
  'use strict';
  if (window.__hcPromoSaison) return;
  window.__hcPromoSaison = true;

  function poser() {
    if (document.getElementById('entretien-saison')) return; // déjà présent en dur
    var el = document.createElement('aside');
    el.className = 'hcs-flot';
    el.id = 'entretien-saison';
    el.setAttribute('role', 'complementary');
    el.setAttribute('aria-labelledby', 'hcSeasonTitle');
    el.innerHTML =
      '<p class="hcs-kicker"><i aria-hidden="true"></i>Avant l’hiver</p>' +
      '<h2 id="hcSeasonTitle"><span class="hcs-long">Entretien et ramonage : préparez votre chauffage</span>' +
      '<span class="hcs-court">Entretien &amp; ramonage</span></h2>' +
      '<p class="hcs-sub">Chaudière, poêle ou insert : l’entretien annuel par nos techniciens, ' +
      'attestation ou certificat de ramonage remis.</p>' +
      '<div class="hcs-actions">' +
        '<a class="hcs-cta" href="/chauffagiste-saint-omer.html#entretien" data-hc-promo-fam="chaudiere">' +
          'Entretien chaudière <span aria-hidden="true">→</span></a>' +
        '<div class="hcs-links">' +
          '<a class="hcs-link" href="/chauffagiste-saint-omer.html#poele-insert" data-hc-promo-fam="poele">Poêle ou insert</a>' +
          '<a class="hcs-link" href="/chauffagiste-saint-omer.html#ramonage" data-hc-promo-fam="ramonage">Ramonage</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    // Un souffle avant de l'afficher : la transition doit partir d'un état déjà peint.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('est-visible'); });
    });
    mesurer(el);
  }

  /* Mesure d'audience — reprise telle quelle de l'accueil (5733153347), pour ne pas rompre
     l'historique GA4 : mêmes noms d'événements. On ajoute seulement la page où l'encart a été
     vu, puisqu'il ne vit plus seulement sur l'accueil. Aucune donnée personnelle, et l'envoi
     n'a lieu qu'en production, via hcGtag, qui n'existe qu'après consentement. */
  function mesurer(box) {
    var PROD = /^(www\.)?depan59-62\.fr$/.test(location.hostname);
    var page = String(location.pathname || '/').slice(0, 60);
    function send(ev, p) {
      try {
        var log = (window.__hcFunnel = window.__hcFunnel || []);
        log.push({ ev: ev, p: p, t: Date.now() });
        if (log.length > 200) log.shift();
      } catch (e) {}
      if (PROD && typeof window.hcGtag === 'function') { try { window.hcGtag('event', ev, p); } catch (e) {} }
    }
    var vu = false;
    function view() { if (vu) return; vu = true; send('view_home_maintenance_promo', { module: 'entretien_saison', page: page }); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting && en.intersectionRatio >= 0.5) { view(); io.disconnect(); } });
      }, { threshold: [0.5] });
      io.observe(box);
    } else view();
    box.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[data-hc-promo-fam]') : null;
      if (!a) return;
      send('click_home_maintenance_promo', {
        module: 'entretien_saison', page: page,
        service_family: a.getAttribute('data-hc-promo-fam'),
        target: String(a.getAttribute('href') || '').replace(/[^a-z-]/g, '').slice(0, 40)
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poser);
  else poser();
})();
