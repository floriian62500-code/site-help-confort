/*! HELP Confort — classement des publications « réalisations » : UNE seule règle pour tout le site
 *  (accueil, page Réalisations, avant/après, blocs « Nos chantiers » des 26 pages métier et locales,
 *  générateur scripts/gen-realisations.mjs).
 *  - Une annonce de recrutement n'est jamais un chantier : elle sort de tous les flux et n'a pas de fiche.
 *  - Une actualité (vœux, fêtes, spot TV) n'est pas un chantier non plus.
 *  - Tag manuel du back-office (ai_generated.post_type) prioritaire.
 *  - Liens de carte : uniquement vers une fiche réellement générée (manifeste realisations/index.json). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HcRealisations = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // Signaux d'offre d'emploi (« rejoignez-nous » seul ne suffit pas : il apparaît aussi dans des posts de chantier)
  var RECRUIT = /\brecrut|\bpostul|\bcandidat|offres? d.emploi|\bcdi\b|\bcdd\b|\bembauch|postes? à pourvoir/i;
  // Publications qui ne montrent pas un chantier (déjà exclues par la fonction edge, redit ici par sécurité)
  var ACTU = /v[oeœ]ux|meilleurs.*v[oeœ]?ux|belles f[êe]tes|fin d.ann[ée]e|spot tv|sur vos écrans/i;

  function text(r) { return [r && r.title, r && r.description, r && r.description_long, r && r.resume].filter(Boolean).join(' '); }
  function postType(r) { return (r && r.ai_generated && r.ai_generated.post_type) || (r && r.post_type) || null; }
  function isRecruitment(r) {
    if (!r) return false;
    var pt = postType(r);
    if (pt === 'recrutement') return true;
    if (pt === 'realisation' || pt === 'actualite') return false;
    return RECRUIT.test(text(r));
  }
  function estActualite(r) {
    if (!r) return false;
    var pt = postType(r);
    if (pt === 'actualite') return true;
    if (pt === 'realisation') return false;
    return ACTU.test((r.title || '') + ' ' + (r.description || ''));
  }
  // Un chantier montrable : publié, non marqué « pas un chantier », ni recrutement, ni actualité
  function estChantier(r) {
    return !!r && r.published !== false && r.est_chantier !== false && !isRecruitment(r) && !estActualite(r);
  }

  // Métier canonique : « Adaptation PMR » → pmr, « Rénovation » → travaux, « Électricité » → electricite…
  var ALIAS = { 'adaptation pmr': 'pmr', 'renovation': 'travaux', 'volet': 'volets', 'electricien': 'electricite', 'plombier': 'plomberie', 'chauffagiste': 'chauffage', 'serrurier': 'serrurerie', 'vitrier': 'vitrerie', 'menuisier': 'menuiserie' };
  function metierCanon(v) {
    var s = String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    return ALIAS[s] || s;
  }

  // Fiche chantier réellement disponible ? pages = objet { slug: true } issu de realisations/index.json
  function detailUrl(slug, pages) { return slug && pages && pages[slug] === true ? 'realisations/' + slug + '.html' : null; }
  function pagesFrom(manifest) {
    var o = {}; ((manifest && manifest.slugs) || []).forEach(function (s) { if (typeof s === 'string' && /^[a-z0-9-]+$/.test(s)) o[s] = true; });
    return o;
  }

  // Sélection d'un flux « chantiers » : la seule implémentation du site.
  //   opts.metiers : métiers canoniques acceptés (absent = tous) ; opts.max : nombre de cartes ;
  //   opts.pages : manifeste des fiches (si fourni, seules les publications avec fiche sont retenues).
  function chantiersPour(list, opts) {
    opts = opts || {};
    var accept = (opts.metiers || []).map(metierCanon);
    var out = (list || []).filter(function (r) {
      if (!estChantier(r)) return false;
      if (accept.length && accept.indexOf(metierCanon(r.metier)) < 0) return false;
      if (opts.pages && !detailUrl(r.slug, opts.pages)) return false;
      return true;
    });
    return typeof opts.max === 'number' ? out.slice(0, opts.max) : out;
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // Bloc « Nos chantiers » des pages métier et locales (même gabarit m-proof-card partout).
  // En cas d'échec réseau ou de liste vide, le contenu statique du bloc reste affiché.
  var SUPA = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var PLACEHOLDER = '<div class="placeholder"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
  function carteMetier(r, tag, pages) {
    var img = r.image ? '<img decoding="async" src="' + esc(r.image) + '" alt="' + esc(r.title) + '" loading="lazy">' : PLACEHOLDER;
    return '<a href="/' + detailUrl(r.slug, pages) + '" class="m-proof-card m-proof-real"><div class="m-proof-thumb">' + img + '</div>' +
      '<div class="m-proof-card-body"><span class="m-proof-tag">' + esc(r.metier || tag) + '</span><h3>' + esc(r.title || 'Chantier') + '</h3>' +
      '<p>' + esc(String(r.description || '').slice(0, 120)) + '</p></div></a>';
  }
  function monterFluxMetier(trackId, opts) {
    if (typeof document === 'undefined') return null;
    var track = document.getElementById(trackId);
    if (!track || typeof fetch !== 'function') return null;
    opts = opts || {};
    var t = Date.now();
    return Promise.all([
      fetch(SUPA + '/functions/v1/realisations-json?t=' + t).then(function (r) { return r.ok ? r.json() : Promise.reject(); }),
      fetch('/realisations/index.json?v=' + t).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (res) {
      var pages = pagesFrom(res[1]);
      var items = chantiersPour(res[0], { metiers: opts.metiers, max: opts.max || 4, pages: pages });
      if (!items.length) return 0;   // aucun chantier montrable : le contenu statique reste
      track.innerHTML = items.map(function (r) { return carteMetier(r, opts.tag || 'Chantier', pages); }).join('');
      return items.length;
    }).catch(function () { return null; /* contenu statique conservé */ });
  }

  return {
    RECRUIT: RECRUIT, ACTU: ACTU, isRecruitment: isRecruitment, estActualite: estActualite, estChantier: estChantier,
    metierCanon: metierCanon, detailUrl: detailUrl, pagesFrom: pagesFrom, chantiersPour: chantiersPour,
    esc: esc, carteMetier: carteMetier, monterFluxMetier: monterFluxMetier
  };
});
