#!/usr/bin/env node
// Chantier RECRUTEMENT (5732826379) : offres réelles seulement, candidature qui aboutit côté serveur,
// mesure sans donnée personnelle, données structurées fidèles au visible. Hors ligne.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };
const visible = h => h.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

const D = JSON.parse(rd('data/offres-emploi.json'));
const hub = rd('carrieres.html'), hubTxt = visible(hub);
const offres = D.offres.map(o => ({ o, html: rd('emploi/' + o.slug + '.html') }));

// ---- Source unique et honnêteté du contenu
ok('offres décrites dans un seul fichier de données, avec leur source', D.offres.length >= 1 && /Facebook HELP Confort Saint-Omer/.test(D._source) && D._regle.includes('Ne jamais inventer'));
ok('page pivot : plus aucune promesse non confirmée (RTT, intéressement, budget formation, évolution interne)',
  !/RTT|intéressement|Budget formation|chef d'équipe, responsable agence|Grille de salaire/i.test(hubTxt));
ok('mutuelle : le taux affiché est celui de l’annonce de l’agence (80 %), plus l’ancien 60 %',
  /80\s?%/.test(hubTxt) && !/prise en charge à 60\s?%/i.test(hubTxt));
ok('rémunération : borne basse confirmée uniquement, la coquille de l’annonce n’est pas publiée',
  /1\s?700\s?€ net/.test(hubTxt) && !/2\s?2200|2200\s?€/.test(hubTxt) && D.remuneration.a_confirmer.includes('coquille'));
ok('postes affichés = postes réellement ouverts (plus d’électricien Dunkerque ni d’assistant·e administratif·ve)',
  !/Électricien H\/F|Assistant·e administratif·ve/.test(hubTxt));
ok('points à confirmer par Florian listés, pas inventés ni supprimés', (D.a_confirmer_global || []).length >= 5);

// ---- Parcours de candidature réellement accepté par le serveur
// Contrat « demande_metier » (supabase/functions/submit-lead-v6) : nom + contact + code postal + ville + message.
const form = hub.slice(hub.indexOf('<form class="form-app"'), hub.indexOf('</form>', hub.indexOf('<form class="form-app"')));
for (const champ of ['prenom', 'nom', 'tel', 'email', 'cp', 'ville', 'message']) {
  ok('candidature : champ « ' + champ + ' » présent et obligatoire (sinon le serveur refuse la candidature)',
    new RegExp('name="' + champ + '"[^>]*required|required[^>]*name="' + champ + '"').test(form));
}
ok('candidature : prénom et nom séparés', /name="prenom"/.test(form) && /name="nom"/.test(form) && !/Nom &amp; prénom/.test(form));
ok('candidature : CV facultatif au premier contact, envoi par email possible', /name="cv"/.test(form) && !/name="cv"[^>]*required/.test(form) && /saint-omer@helpconfort\.com/.test(hub));
ok('candidature : postes proposés = offres du fichier de données + spontanée', D.offres.every(o => form.includes('>' + o.metier_formulaire + '<')) && /Candidature spontanée/.test(form));
ok('candidature : type de lead « candidature » déclaré (traçable côté agence)', /data-hc-lead="candidature"/.test(form) && /name="form_type" value="demande_metier"/.test(form) && /name="metier"/.test(form));

// ---- Mesure : événements attendus, aucune donnée personnelle, rien hors production
const js = rd('assets/hc-recrutement.js');
for (const ev of ['view_recruitment', 'view_job_offer', 'click_apply', 'start_application', 'submit_application', 'generate_recruitment_lead']) {
  ok('mesure : événement ' + ev, js.includes("'" + ev + "'"));
}
ok('mesure : envoi à GA4 seulement en production et après consentement', /var PROD = \/\^\(www\\\.\)\?depan59-62\\\.fr\$\/\.test\(location\.hostname\)/.test(js) && /if \(!PROD\) return;/.test(js) && /typeof window\.hcGtag !== 'function'/.test(js));
ok('mesure : email et téléphone écartés des paramètres', /if \(\/@\/\.test\(v\) \|\| \/\\d\{8,\}\/\.test/.test(js));
ok('mesure : le poste visé passe par l’URL, jamais une donnée candidat, et l’URL est nettoyée', /\[\?&\]poste=\(\[a-z0-9-\]\{1,60\}\)/.test(js) && /history\.replaceState\(history\.state, '', location\.pathname \+ location\.hash\)/.test(js));
// Exécution réelle : la page pivot consigne une vue, rien n'est envoyé hors production
const box = { window: {}, document: { body: { getAttribute: k => (k === 'data-hc-recrutement' ? 'hub' : '') }, addEventListener: () => {}, readyState: 'complete', querySelector: () => null }, location: { hostname: 'deploy-preview-2--remarkable-dragon-364e2b.netlify.app', search: '' }, history: {}, setTimeout };
box.window.addEventListener = () => {}; box.addEventListener = () => {};
vm.runInNewContext(js.replace('(function () {', '(function () { var window = this.window; ').replace(/window\.addEventListener/g, 'this.window.addEventListener'), box);
const log = box.window.__hcFunnel || [];
ok('mesure (exécution) : vue consignée en recette, rien envoyé hors production', log.length === 1 && log[0].ev === 'view_recruitment' && log[0].p.page_type === 'recruitment');

// ---- Pages d'offres : gabarit premium, JobPosting fidèle, aucun salaire inventé
ok('offres : une page par offre, gabarit premium du site', offres.every(({ html }) => /<section class="seo-hero">/.test(html) && /<section class="seo-stats">/.test(html) && /seo-form-side/.test(html)));
for (const { o, html } of offres) {
  const t = visible(html);
  let ld = null;
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { const j = JSON.parse(m[1]); if (j['@type'] === 'JobPosting') ld = j; }
  ok(o.slug + ' : JobPosting présent, employeur, lieu et date exacts', !!ld && ld.title === o.titre && ld.datePosted === o.date_publication && ld.employmentType === o.employment_type && ld.hiringOrganization.legalName === D.employeur.raison_sociale && ld.jobLocation.address.postalCode === D.employeur.code_postal);
  ok(o.slug + ' : aucun salaire dans les données structurées (borne haute non confirmée)', !!ld && !('baseSalary' in ld));
  ok(o.slug + ' : missions et profil du JobPosting = contenu affiché', !!ld && o.missions.every(m => t.includes(m)) && o.profil.every(p => t.includes(p)) && o.missions.every(m => ld.description.includes(m)));
  ok(o.slug + ' : mesure et candidature branchées', /data-hc-recrutement="offre"/.test(html) && html.includes('data-hc-offre="' + o.slug + '"') && html.includes('../carrieres.html?poste=' + o.slug + '#candidature') && /hc-recrutement\.js\?v=/.test(html));
}

// ---- Générateur et référencement
ok('générateur : les pages d’offres sont à jour par rapport au fichier de données', (() => {
  try { return execFileSync('node', [path.join(ROOT, 'scripts/gen-offres-emploi.mjs'), '--check'], { encoding: 'utf8' }).includes('à jour'); } catch (e) { return false; }
})());
const sitemap = rd('supabase/functions/sitemap/index.ts');
ok('sitemap : page pivot relevée (0.7 mensuel) et offres listées', /\/carrieres\.html 0\.7 monthly/.test(sitemap) && D.offres.every(o => sitemap.includes('/emploi/' + o.slug + '.html ')));
ok('page pivot : titre et description orientés intention candidat', /<title>Recrutement plombier &amp; chauffagiste à Saint-Omer \| HELP Confort<\/title>/.test(hub) && /CDI/.test(hub.match(/<meta name="description" content="([^"]*)"/)[1]));
ok('page pivot : liens vers les offres et mesure chargée', D.offres.every(o => hub.includes('href="emploi/' + o.slug + '.html"')) && /data-hc-recrutement="hub"/.test(hub) && /hc-recrutement\.js\?v=/.test(hub) && /hc-leads-capture\.js\?v=20260918a/.test(hub));
ok('page pivot : styles rétablis (sélecteurs descendants cassés par l’ancienne minification)', !/\.car-hero\.(pill|lead|ctas|btn-prim|btn-sec)|\.post-c\.(badge|meta|skills|apply)|\.form-app\.(row|submit-btn)|\.stat\.(num|lab)/.test(hub));

console.log(`\nRÉSULTAT RECRUTEMENT : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
