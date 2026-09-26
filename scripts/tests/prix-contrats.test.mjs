#!/usr/bin/env node
/**
 * Prix publics : ce que le site affiche doit exister au catalogue.
 *
 * Trouvé le 2026-09-23 en auditant la campagne entretien : l'article de blog annonçait
 * « 3 formules de 12,90 €/mois à 29,90 €/mois », une formule « Essentiel HC » et des fourchettes
 * (« 120 € à 180 € ») qui n'existent nulle part au catalogue. Le prix d'entrée réel est 9,90 €,
 * c'est-à-dire que la page décourageait le client avec un tarif plus cher que la réalité.
 *
 * Ce test compare tout montant mensuel écrit en dur dans une page au relevé du catalogue
 * (data/contrats-tarifs.json). Il ne juge pas les prix : il vérifie qu'aucune page n'en invente.
 *
 *   node scripts/tests/prix-contrats.test.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { pass++; console.log('  ✅ ' + label); }
  else { fail++; console.log('  ❌ ' + label); if (detail) console.log('     ' + detail); }
};

const ref = JSON.parse(readFileSync(join(ROOT, 'data/contrats-tarifs.json'), 'utf8'));
const mensuels = new Set(Object.values(ref.contrats_ttc_mois).map((n) => n.toFixed(2).replace('.', ',')));
const ponctuels = new Set(Object.values(ref.prestations_ponctuelles_ttc).map((n) => n.toFixed(2).replace('.', ',')));
const entiers = new Set([...ponctuels].map((v) => v.split(',')[0]));   // « 121 € » est aussi correct

const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...readdirSync(join(ROOT, 'prestations')).filter((f) => f.endsWith('.html')).map((f) => 'prestations/' + f),
];
// Le JS lit le catalogue à l'exécution : seuls les montants écrits en dur dans le texte comptent.
const lire = (p) => readFileSync(join(ROOT, p), 'utf8');
const texte = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');

console.log('\nPRIX PUBLICS — aucune page n’invente un tarif\n');

ok(`relevé du catalogue daté (${ref._releve_le}) et non vide`,
  /^\d{4}-\d{2}-\d{2}$/.test(ref._releve_le) && mensuels.size > 0 && ponctuels.size > 0);

// ── 1. Montants mensuels : chacun doit exister au catalogue
const fautifs = [];
for (const p of pages) {
  const s = texte(p);
  for (const m of s.matchAll(/(\d{1,3},\d{2})\s*€(?:\s*TTC)?\s*\/?\s*mois/g)) {
    if (!mensuels.has(m[1])) {
      const ctx = s.slice(Math.max(0, m.index - 70), m.index + 30).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      fautifs.push(`${p} : ${m[1]} € — ${ctx.slice(-80)}`);
    }
  }
}
ok('aucun prix mensuel absent du catalogue', fautifs.length === 0, fautifs.slice(0, 6).join('\n     '));

// ── 2. L'amplitude annoncée doit être celle du catalogue
const amp = ref.amplitude_affichable;
const bornes = [];
for (const p of pages) {
  for (const m of texte(p).matchAll(/(?:de|entre)\s*(\d{1,3},\d{2})\s*€[^.]{0,40}?(?:à|et)\s*(\d{1,3},\d{2})\s*€[^.]{0,20}mois/g)) {
    const min = parseFloat(m[1].replace(',', '.')), max = parseFloat(m[2].replace(',', '.'));
    if (min !== amp.min || max !== amp.max) bornes.push(`${p} : ${m[1]} → ${m[2]} (catalogue : ${amp.min} → ${amp.max})`);
  }
}
ok(`toute amplitude annoncée correspond au catalogue (${amp.min} → ${amp.max} €)`, bornes.length === 0, bornes.join('\n     '));

// ── 3. Prestations ponctuelles : les montants présentés comme LES NÔTRES doivent exister au catalogue.
//     Un prix de marché cité comme tel (« le prix moyen en France se situe entre 100 et 180 € ») est
//     une information éditoriale légitime, pas un tarif HELP Confort : il ne doit pas être signalé.
//     C'est le guide qui me l'a appris — il distingue déjà proprement les deux.
const MARCHE = /en France|prix moyen|en moyenne|selon la région|selon les régions|sur le marché|comptez entre/i;
const ponctuelsFautifs = [];
for (const p of ['chauffagiste-saint-omer.html', 'blog-entretien-chaudiere-annuel-obligatoire.html', 'guide-entretien-chaudiere.html']) {
  const s = texte(p);
  for (const m of s.matchAll(/(\d{2,3}(?:,\d{2})?)\s*€\s*TTC(?!\s*\/?\s*mois)/g)) {
    const v = m[1];
    if (ponctuels.has(v) || entiers.has(v) || mensuels.has(v)) continue;
    const phrase = s.slice(Math.max(0, m.index - 220), m.index + 40).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (MARCHE.test(phrase.split(/[.!?]\s/).pop() || phrase)) continue;   // prix de marché assumé
    ponctuelsFautifs.push(`${p} : ${v} € — ${phrase.trim().slice(-80)}`);
  }
}
ok('aucun prix « à l’intervention » présenté comme le nôtre sans exister au catalogue', ponctuelsFautifs.length === 0,
  ponctuelsFautifs.slice(0, 5).join('\n     '));

// ── 4. Ce qui n'est pas au catalogue ne doit pas avoir de prix
const condensation = pages.filter((p) => /chaudière à condensation\s*:\s*\d+\s*€|condensation[^.]{0,30}\d{2,3}\s*€\s*(?:à|TTC)/i.test(texte(p)));
ok('aucun prix affiché pour une prestation absente du catalogue (ex. « chaudière à condensation »)',
  condensation.length === 0, condensation.join(', '));

// ── 5. Le nom des formules doit être celui du catalogue
const formules = new Set(Object.keys(ref.contrats_ttc_mois).map((s) => s.split('-')[1]?.toUpperCase()).filter(Boolean));
const inventees = [];
for (const p of pages) {
  for (const m of texte(p).matchAll(/formule\s+(?:«\s*)?([A-ZÉÈ][A-Za-zÉÈéèêî]{3,12})/g)) {
    const nom = m[1].toUpperCase();
    if (!formules.has(nom) && !['CHOISIR', 'ADAPTÉE', 'CONTRAT', 'ANNUELLE', 'IDÉALE'].includes(nom)) inventees.push(`${p} : « ${m[1]} »`);
  }
}
ok(`aucune formule de contrat inventée (catalogue : ${[...formules].join(', ')})`, inventees.length === 0,
  inventees.slice(0, 5).join('\n     '));

// ── 6. Cohérence du délai annoncé pour la formule CONFORT (deux pages le citaient différemment)
const delais = new Set();
for (const p of pages) {
  for (const m of texte(p).matchAll(/CONFORT[^.]{0,80}?sous\s*(\d+)\s*h|sous\s*(\d+)\s*h[^.]{0,60}?CONFORT/gi)) {
    delais.add(m[1] || m[2]);
  }
}
ok('le délai annoncé pour la formule CONFORT est le même partout', delais.size <= 1,
  delais.size > 1 ? 'valeurs trouvées : ' + [...delais].join(' h, ') + ' h' : '');

// ── 8. Le teaser contrats annonce, la page contrats détaille (décision Florian du 2026-09-26)
// Histoire de ce contrôle, parce qu'elle explique sa forme : le 23/09 j'avais retiré les cartes des
// pages chauffagiste en laissant le conteneur, donc un titre promettant trois formules au-dessus de
// rien. Le 24/09 je les ai rétablies. Le 26/09 Florian tranche autrement : les cartes détaillées
// font doublon avec la page contrats, elles n'ont rien à faire ici. Ce qui doit rester vrai dans
// les trois cas, c'est qu'une page ne promet jamais ce qu'elle ne montre pas — et qu'un seul
// endroit décrit les formules.
const CHAUFFAGISTES = ['chauffagiste-saint-omer.html', 'chauffagiste-dunkerque.html',
                       'chauffagiste-calais.html', 'chauffagiste-boulogne-sur-mer.html'];
// 2026-09-26, deuxième passe : Florian trouve le teaser trop discret. Il devient une section
// premium — fond sombre, prix d'appel en grand, badges des trois formules, action principale
// dominante. Ce que le contrôle vérifie n'est pas l'esthétique, c'est ce qui doit rester vrai :
// la section existe, elle NOMME sans décrire, elle mène à la page qui décrit, elle n'écrit qu'un
// repère de prix, et son action principale est visuellement dominante.
const teaserDe = (f) => (texte(f).match(/<section[^>]*m-contrats-premium[\s\S]*?<\/section>/) || [''])[0];

ok(`les pages chauffagiste portent toutes la section contrats (${CHAUFFAGISTES.length})`,
  CHAUFFAGISTES.every((f) => !!teaserDe(f)), CHAUFFAGISTES.filter((f) => !teaserDe(f)).join(', '));

for (const f of CHAUFFAGISTES) {
  const t = teaserDe(f), page = texte(f);
  ok(`${f.replace('.html', '')} : le teaser nomme les trois formules, sans les détailler`,
    ['BASIC', 'CONFORT', 'SÉCURITÉ'].every((n) => t.includes(n)));
  ok(`${f.replace('.html', '')} : il mène à la page qui, elle, détaille`,
    /href="contrats-entretien\.html"/.test(t));
  // « Le CTA principal doit être dominant » : il l'est par sa surface (hauteur minimale et
  // remplissage), par sa couleur pleine, et parce que la sortie secondaire n'est qu'un contour.
  const src = texte(f);
  ok(`${f.replace('.html', '')} : l’action principale domine visuellement la sortie secondaire`,
    /\.ctp-cta\{[^}]*min-height:58px/.test(src) && /\.ctp-cta\{[^}]*background:linear-gradient\(135deg,#E55A0C/.test(src) &&
    /\.ctp-lien\{[^}]*min-height:44px/.test(src) && /\.ctp-lien\{[^}]*border:1\.5px solid/.test(page));
  ok(`${f.replace('.html', '')} : la section tranche sur la page (fond sombre, seul bloc de ce contraste en haut)`,
    /\.ctp\{[^}]*background:linear-gradient\(135deg,#0A1428/.test(src));
  ok(`${f.replace('.html', '')} : les trois formules sont montrées comme des repères, pas comme des cartes`,
    (teaserDe(f).match(/class="ctp-badge/g) || []).length === 3);
  // Le point de la décision du 26/09 : plus aucune reprise des cartes et de leurs garanties.
  ok(`${f.replace('.html', '')} : aucune carte détaillée recopiée depuis la page contrats`,
    !/class="ce-card|class="formula-card/.test(page) && !/Tout BASIC inclus|Tout CONFORT inclus/.test(page));
  // Un seul chiffre toléré : le prix d'entrée du catalogue, déjà vérifié plus haut.
  const montants = [...t.matchAll(/(\d+[.,]\d{2})\s*€/g)].map((m) => m[1]);
  ok(`${f.replace('.html', '')} : le teaser n'écrit qu'un repère de prix, celui du catalogue`,
    montants.length <= 1 && montants.every((v) => mensuels.has(v)), montants.join(', '));
}

// Le bouton « Voir nos prestations chauffage avec prix » doit montrer des PRIX, pas ouvrir une
// demande : il visait /catalogue, qui est le tunnel. Constat Florian du 2026-09-26.
for (const f of CHAUFFAGISTES) {
  const page = texte(f);
  const m = page.match(/<a href="([^"]+)"[^>]*>Voir nos prestations chauffage avec prix/);
  ok(`${f.replace('.html', '')} : « voir les prestations avec prix » mène au catalogue public, pas au tunnel`,
    !!m && m[1] === '/nos-prestations.html#sec-chauffage', m ? m[1] : 'bouton introuvable');
}

// Et la page qui détaille doit continuer de le faire : sinon on aurait tout déplacé vers rien.
const pageContrats = lire('contrats-entretien.html');
ok('la page contrats reste la seule à porter le comparatif complet',
  /v_contract_offers|formula-card|formula-grid/.test(pageContrats));


console.log(`\nRÉSULTAT PRIX PUBLICS : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
