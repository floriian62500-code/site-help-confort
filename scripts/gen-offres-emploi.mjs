#!/usr/bin/env node
/**
 * Génère une page par offre d'emploi à partir de data/offres-emploi.json,
 * sur le gabarit premium du site (celui des pages prestations/).
 *
 *   node scripts/gen-offres-emploi.mjs            # écrit emploi/<slug>.html
 *   node scripts/gen-offres-emploi.mjs --check    # échoue si les pages ne sont plus à jour
 *
 * Règle : rien n'est affiché qui ne soit confirmé (cf. « a_confirmer » dans le JSON).
 * Le JSON-LD JobPosting reprend exactement le contenu visible, sans salaire inventé.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const D = JSON.parse(rd('data/offres-emploi.json'));
const CHECK = process.argv.includes('--check');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── Gabarit : on réutilise une page prestations (styles seo-*, en-tête, pied de page, scripts)
const MODELE = rd('prestations/ramonage.html');
const css = MODELE.slice(MODELE.indexOf('<style>.seo-brand-logo-text'), MODELE.indexOf('</style>', MODELE.indexOf('<style>.seo-brand-logo-text')) + 8);
const header = MODELE.slice(MODELE.indexOf('<a href="#main-content"'), MODELE.indexOf('</header>') + 9);
const footer = MODELE.slice(MODELE.indexOf('<footer class="footer footer-v3">'), MODELE.indexOf('</html>') + 7);

const SVG = `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:52%;height:66%;color:rgba(255,255,255,.95)"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M60 62h80v58H60z"/><path d="M82 62V48a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v14"/><path d="M60 86h80"/><path d="M92 86v10h16V86"/></g></svg>`;

function page(o) {
  const url = 'https://depan59-62.fr/emploi/' + o.slug + '.html';
  const titre = o.titre + ' — ' + o.contrat + ' à Saint-Omer';
  const title = (o.titre_court + ' ' + o.contrat.replace(' à temps plein', '') + ' à Saint-Omer | HELP Confort').slice(0, 70);
  const desc = o.resume + ' ' + o.contrat + ', ' + D.remuneration.affichee.toLowerCase() + '.';
  const descriptionLd =
    '<p>' + esc(o.resume) + '</p>' +
    '<p><strong>Vos missions</strong></p><ul>' + o.missions.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul>' +
    '<p><strong>Votre profil</strong></p><ul>' + o.profil.map(m => '<li>' + esc(m) + '</li>').join('') + '</ul>' +
    '<p><strong>Ce que propose l’agence</strong></p><ul>' + D.conditions_confirmees.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>';

  // JobPosting : strictement le contenu visible. Pas de salaire (la borne haute de l'annonce
  // comporte une coquille et « net » n'est pas exprimable sans ambiguïté) → champ omis.
  const jobPosting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: o.titre,
    description: descriptionLd,
    datePosted: o.date_publication,
    employmentType: o.employment_type,
    hiringOrganization: {
      '@type': 'Organization', name: D.employeur.nom, legalName: D.employeur.raison_sociale,
      sameAs: D.employeur.site, logo: D.employeur.logo, telephone: D.employeur.telephone, email: D.employeur.email
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress', streetAddress: D.employeur.adresse, postalCode: D.employeur.code_postal,
        addressLocality: D.employeur.ville, addressRegion: 'Hauts-de-France', addressCountry: D.employeur.pays
      }
    },
    jobLocationType: undefined,
    industry: 'Plomberie, chauffage, dépannage multi-services',
    url,
    identifier: { '@type': 'PropertyValue', name: D.employeur.nom, value: o.slug }
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://depan59-62.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Recrutement', item: 'https://depan59-62.fr/carrieres.html' },
      { '@type': 'ListItem', position: 3, name: o.titre, item: url }
    ]
  };

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc.slice(0, 158))}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(titre)}"><meta property="og:description" content="${esc(desc.slice(0, 158))}"><meta property="og:url" content="${url}"><meta property="og:locale" content="fr_FR">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css?v=1778685798"><link rel="icon" type="image/svg+xml" href="../logo.svg">
<script type="application/ld+json">${JSON.stringify(jobPosting)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
${css}
<script src="/assets/hc-header.js?v=718ed22c6e" defer></script>
</head><body data-hc-recrutement="offre" data-hc-offre="${esc(o.slug)}">
${header}
<main id="main-content">
<section class="seo-hero"><div class="container"><div class="seo-hero-text"><nav class="bc"><a href="../index.html">Accueil</a> · <a href="../carrieres.html">Recrutement</a> · ${esc(o.titre_court)}</nav><span class="eyebrow">Recrutement · ${esc(o.contrat)}</span><h1>${esc(o.titre_court)}<br>à Saint-Omer<br><em>HELP Confort</em></h1><p class="promesse">${esc(o.resume)}</p><div class="seo-hero-ctas"><a href="../carrieres.html?poste=${esc(o.slug)}#candidature" class="seo-hero-cta seo-cta-primary" data-hc-cta="offre_${esc(o.slug)}_hero">Postuler en 2 minutes →</a><a href="tel:${D.employeur.telephone}" class="seo-hero-cta seo-cta-secondary">☎ 03 66 10 01 34</a></div></div><div class="seo-hero-img" style="position:relative;overflow:hidden">${SVG}</div></div></section>
<section class="seo-stats"><div class="container"><div class="seo-stat"><div class="seo-stat-ico">📄</div><div class="seo-stat-text"><strong>${esc(o.contrat)}</strong><span>Annonce de l’agence du ${new Date(o.date_publication).toLocaleDateString('fr-FR')}</span></div></div><div class="seo-stat"><div class="seo-stat-ico">📍</div><div class="seo-stat-text"><strong>Saint-Omer et alentours</strong><span>Rayon d’intervention d’environ 55 km</span></div></div><div class="seo-stat"><div class="seo-stat-ico">🚐</div><div class="seo-stat-text"><strong>Camion individuel fourni</strong><span>Matériel et outillage professionnels</span></div></div></div></section>
<div class="seo-body"><div class="seo-grid"><div class="seo-content">
<section class="seo-section" id="missions"><h2>Vos missions</h2><ul>${o.missions.map(m => '<li>' + esc(m) + '</li>').join('')}</ul></section>
<section class="seo-section" id="profil"><h2>Votre profil</h2><ul>${o.profil.map(m => '<li>' + esc(m) + '</li>').join('')}</ul></section>
<section class="seo-section" id="conditions"><h2>Ce que propose l’agence</h2><ul>${D.conditions_confirmees.map(c => '<li>' + esc(c) + '</li>').join('')}</ul>
<p class="seo-section-lead"><strong>Rémunération :</strong> ${esc(D.remuneration.affichee)}.</p>
<p style="font-size:.86rem;color:#6b7384">Ces éléments reprennent l’annonce publiée par l’agence le ${new Date(o.date_publication).toLocaleDateString('fr-FR')}. Tout le reste (prime, horaires, formations) est précisé lors de l’entretien.</p></section>
<section class="seo-section" id="entreprise"><h2>L’entreprise</h2><p class="seo-section-lead">${esc(D.employeur.nom)} (${esc(D.employeur.raison_sociale)}) est l’agence locale du réseau HELP Confort à Saint-Omer : plomberie, chauffage, électricité, serrurerie, vitrerie, menuiserie et travaux, chez des particuliers et des professionnels. L’agence est installée ${esc(D.employeur.adresse)}, ${esc(D.employeur.code_postal)} ${esc(D.employeur.ville)}.</p><p><a href="../a-propos.html">En savoir plus sur l’entreprise →</a> · <a href="../realisations.html">Voir nos chantiers →</a></p></section>
<section class="seo-section" id="postuler"><h2>Comment postuler</h2><p class="seo-section-lead">Le plus simple : le formulaire du site, en deux minutes, depuis votre téléphone. Vous pouvez aussi envoyer votre CV par email ou appeler l’agence.</p><p><a href="../carrieres.html?poste=${esc(o.slug)}#candidature" class="pi-cta" data-hc-cta="offre_${esc(o.slug)}_bas">Postuler pour ce poste →</a></p><p style="margin-top:14px">ou <a href="mailto:${D.employeur.email}?subject=Candidature%20${encodeURIComponent(o.titre)}">${D.employeur.email}</a> · <a href="tel:${D.employeur.telephone}">03 66 10 01 34</a> (lun–ven 9h–17h, sam 9h–16h)</p></section>
</div>
<aside class="seo-form-side" id="postuler-encart"><div class="seo-form-box"><h3>Postuler pour ce poste</h3><p class="sub">${esc(o.contrat)} · Saint-Omer et alentours. Deux minutes, sans CV obligatoire au premier contact.</p><a href="../carrieres.html?poste=${esc(o.slug)}#candidature" class="seo-form-submit ec-side-cta" data-hc-cta="offre_${esc(o.slug)}_encart">Postuler en 2 minutes →</a><p class="ec-side-tel">ou envoyez votre CV à<br><a href="mailto:${D.employeur.email}?subject=Candidature%20${encodeURIComponent(o.titre)}">${D.employeur.email}</a><br><a href="tel:${D.employeur.telephone}">03 66 10 01 34</a></p></div></aside></div></div>
</main>
${footer.replace('</body></html', '<script src="/assets/hc-consent.js?v=20260919a" defer></script>\n<script src="/assets/tracking.js?v=20260917b" defer></script>\n<script src="/assets/hc-recrutement.js?v=20260920a" defer></script>\n</body></html')}`;
}

// L'en-tête appartient à scripts/header/sync-header.mjs : on le laisse tel quel sur une page
// existante, et on ne le compare pas (sinon les deux outils se réécriraient l'un l'autre).
const bornes = h => [h.indexOf('<header'), h.indexOf('</header>') + 9];
const sansEntete = h => {
  const [a, b] = bornes(h);
  const sans = a < 0 || b < 9 ? h : h.slice(0, a) + '@ENTETE@' + h.slice(b);
  return sans.replace(/<link rel="stylesheet" href="\/assets\/hc-header\.css\?v=[0-9a-z]+">\n?/g, '');
};
const avecEntete = (neuf, ancien) => {
  if (!ancien) return neuf;
  const [a1, b1] = bornes(ancien), [a2, b2] = bornes(neuf);
  if (a1 < 0 || a2 < 0) return neuf;
  return neuf.slice(0, a2) + ancien.slice(a1, b1) + neuf.slice(b2);
};

fs.mkdirSync(path.join(ROOT, 'emploi'), { recursive: true });
let modifiees = 0;
for (const o of D.offres) {
  const p = path.join(ROOT, 'emploi', o.slug + '.html');
  const ancien = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  const html = avecEntete(page(o), ancien);
  if (ancien !== null && sansEntete(ancien) === sansEntete(html)) continue;
  modifiees++;
  if (CHECK) { console.log('  ⚠ à régénérer : emploi/' + o.slug + '.html'); continue; }
  fs.writeFileSync(p, html);
  console.log('  ✍ emploi/' + o.slug + '.html');
}
// Pages d'offres retirées du JSON : on ne laisse pas de page orpheline indexable
const slugs = new Set(D.offres.map(o => o.slug));
for (const f of fs.readdirSync(path.join(ROOT, 'emploi')).filter(f => f.endsWith('.html'))) {
  if (!slugs.has(f.replace(/\.html$/, ''))) console.log('  ⚠ page sans offre correspondante : emploi/' + f + ' (à retirer ou rediriger)');
}
if (modifiees && !CHECK) {
  // L'en-tête unique (scripts/header/sync-header.mjs) est réappliqué : lui seul le maintient.
  const { execFileSync } = await import('node:child_process');
  execFileSync('node', [path.join(ROOT, 'scripts/header/sync-header.mjs')], { stdio: 'inherit' });
}
console.log(modifiees ? (CHECK ? '❌ ' + modifiees + ' page(s) à régénérer' : '✅ ' + modifiees + ' page(s) écrite(s)') : '✅ offres à jour (' + D.offres.length + ')');
process.exit(CHECK && modifiees ? 1 : 0);
