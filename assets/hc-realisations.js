/*! HELP Confort — classement des publications « réalisations » (pages du site + générateur scripts/gen-realisations.mjs).
 *  Une annonce de recrutement n'est jamais un chantier : elle sort des vitrines (« Nos derniers chantiers », page
 *  Réalisations) et n'a pas de fiche chantier. Tag manuel du back-office (ai_generated.post_type) prioritaire.
 *  Liens de carte : uniquement vers une fiche réellement générée (manifeste realisations/index.json). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HcRealisations = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // Signaux d'offre d'emploi (« rejoignez-nous » seul ne suffit pas : il apparaît aussi dans des posts de chantier)
  var RECRUIT = /\brecrut|\bpostul|\bcandidat|offres? d.emploi|\bcdi\b|\bcdd\b|\bembauch|postes? à pourvoir/i;
  function text(r) { return [r && r.title, r && r.description, r && r.description_long, r && r.resume].filter(Boolean).join(' '); }
  function postType(r) { return (r && r.ai_generated && r.ai_generated.post_type) || (r && r.post_type) || null; }
  function isRecruitment(r) {
    if (!r) return false;
    var pt = postType(r);
    if (pt === 'recrutement') return true;
    if (pt === 'realisation' || pt === 'actualite') return false;
    return RECRUIT.test(text(r));
  }
  // Fiche chantier réellement disponible ? pages = objet { slug: true } issu de realisations/index.json
  function detailUrl(slug, pages) { return slug && pages && pages[slug] === true ? 'realisations/' + slug + '.html' : null; }
  function pagesFrom(manifest) {
    var o = {}; ((manifest && manifest.slugs) || []).forEach(function (s) { if (typeof s === 'string' && /^[a-z0-9-]+$/.test(s)) o[s] = true; });
    return o;
  }
  return { RECRUIT: RECRUIT, isRecruitment: isRecruitment, detailUrl: detailUrl, pagesFrom: pagesFrom };
});
