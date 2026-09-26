#!/usr/bin/env node
/**
 * T14/T15 — données structurées et sitemap (GO-LIVE-CHECKLIST, « PENDING » depuis le 07/09).
 *
 * Ce test ne juge pas la richesse du balisage : il empêche les régressions qui coûtent cher.
 *   · un bloc JSON-LD invalide passe inaperçu à l'œil nu et casse les résultats enrichis ;
 *   · un sitemap qui désigne un hôte redirigé contredit les canonicals de tout le site.
 *
 *   node scripts/tests/seo-structure.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const HOTE = 'https://depan59-62.fr';
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };
const lire = (p) => readFileSync(join(ROOT, p), 'utf8');

const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...['prestations', 'actualites', 'realisations', 'emploi'].filter((d) => existsSync(join(ROOT, d)))
     .flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.html')).map((f) => d + '/' + f)),
];

console.log('\nDONNÉES STRUCTURÉES ET SITEMAP\n');

// ── 1. Aucun JSON-LD invalide
let blocs = 0; const invalides = [];
for (const p of pages) {
  for (const m of lire(p).matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
    blocs++;
    try { JSON.parse(m[1]); } catch (e) { invalides.push(p + ' — ' + String(e.message).slice(0, 60)); }
  }
}
ok(`${blocs} blocs JSON-LD sur ${pages.length} pages, aucun invalide`, invalides.length === 0, invalides.slice(0, 5).join('\n     '));
ok('le corpus reste couvert (plus de 400 blocs)', blocs > 400);

// ── 1bis. Entité « établissement » : un identifiant par page, et des valeurs qui s'accordent
const ETABL = new Set(['LocalBusiness','HomeAndConstructionBusiness','Plumber','HVACBusiness','Electrician','Locksmith','GeneralContractor','RoofingContractor']);
const parcourir = (o, fn) => { if (Array.isArray(o)) o.forEach((x) => parcourir(x, fn)); else if (o && typeof o === 'object') { fn(o); Object.values(o).forEach((v) => parcourir(v, fn)); } };
const eclatees = [], contradictoires = [];
for (const p of pages) {
  const parId = new Map(); let anonymes = 0;
  for (const m of lire(p).matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
    let d; try { d = JSON.parse(m[1]); } catch { continue; }
    parcourir(d, (o) => {
      if (!ETABL.has(String(o['@type']))) return;
      if (!o['@id']) { anonymes++; return; }
      if (!parId.has(o['@id'])) parId.set(o['@id'], []);
      parId.get(o['@id']).push(o);
    });
  }
  if (anonymes && parId.size) eclatees.push(p);                 // un nœud hors de l'identité de la page
  for (const noeuds of parId.values()) {
    if (noeuds.length < 2) continue;
    const champs = new Map();
    for (const n of noeuds) for (const [k, v] of Object.entries(n)) {
      if (k.startsWith('@')) continue;
      const j = JSON.stringify(v);
      if (!champs.has(k)) champs.set(k, new Set());
      champs.get(k).add(j);
    }
    if ([...champs.values()].some((v) => v.size > 1)) { contradictoires.push(p); break; }
  }
}
ok('aucune page ne laisse un nœud « établissement » hors de l’identité de la page', eclatees.length === 0, eclatees.slice(0, 5).join(', '));
ok('aucun nœud ne partage un identifiant en affirmant des valeurs différentes', contradictoires.length === 0, contradictoires.slice(0, 5).join(', '));
ok('la règle a une source unique et rejouable (scripts/seo/entite-jsonld.mjs)', existsSync(join(ROOT, 'scripts/seo/entite-jsonld.mjs')));

// ── 2. Hôte canonique : une seule vérité
const canoniques = pages.map((p) => (lire(p).match(/<link rel="canonical" href="(https?:\/\/[^/"]+)/) || [])[1]).filter(Boolean);
const hotes = [...new Set(canoniques)];
ok(`toutes les pages déclarent le même hôte canonique (${hotes.join(', ') || '—'})`, hotes.length === 1 && hotes[0] === HOTE, hotes.join(', '));

// ── 3. Le générateur de sitemap doit viser CET hôte, pas celui qui redirige
const gen = lire('scripts/gen-sitemap-fn.mjs');
const fn = lire('supabase/functions/sitemap/index.ts');
ok('le générateur de sitemap vise l’hôte canonique', new RegExp('SITE_URL = "' + HOTE + '"').test(gen) || new RegExp("SITE_URL = '" + HOTE + "'").test(gen));
ok('la source de la fonction sitemap vise l’hôte canonique', new RegExp("SITE_URL = '" + HOTE + "'").test(fn));
ok('aucune source de sitemap ne contient l’hôte qui redirige (www)', !/www\.depan59-62\.fr/.test(gen.replace(/^\/\/.*$/gm, '')) && !/www\.depan59-62\.fr/.test(fn.replace(/^\/\/.*$/gm, '')));

// ── 4. L'écart connu avec la production est écrit, pas oublié
ok('l’écart entre la source et la version déployée est signalé dans le fichier lui-même',
  /N'EST PAS IDENTIQUE À LA VERSION EN PRODUCTION/.test(fn));
ok('l’audit T14/T15 existe et porte le constat', existsSync(join(ROOT, 'docs/audit/SEO-T14-T15-2026-09-23.md')) &&
  /SITEMAP_HOST_MISMATCH/.test(lire('docs/audit/SEO-T14-T15-2026-09-23.md')));

// ── 5. Les destinations de la campagne doivent être déclarées quelque part
const packed = (fn.match(/const PACKED = '([^']*)'/) || [])[1] || '';
const campagne = ['/chauffagiste-saint-omer.html', '/contrats-entretien.html', '/prestations/ramonage.html'];
const absentes = campagne.filter((u) => !packed.includes(u + ' '));
ok('les pages de la campagne entretien figurent dans la liste du sitemap', absentes.length === 0, absentes.join(', '));

// ── 6. La description de l'entité décrit LA page, pas une autre (trouvé le 2026-09-25)
// Douze pages annonçaient dans leurs données structurées « Plombier à Saint-Omer : recherche de
// fuite, dégorgement… » — dont les pages volets, vitrerie, menuiserie et PMR. Le défaut vient du
// gabarit d'origine (il est aussi sur main), l'alignement d'entité le répandait aux autres nœuds de
// la page. Un moteur lisait donc « plomberie » sur une page de volets roulants.
// Portée : les pages que la source partagée gouverne réellement, c'est-à-dire celles dont une
// entité porte déjà un `@id`. Le script refuse d'inventer une identité là où il n'y en a pas, et un
// test ne doit pas exiger plus que ce que la règle promet.
const htmls = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const desaccord = [];
let gouvernees = 0;
for (const f of htmls) {
  const h = lire(f);
  const meta = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!meta) continue;
  if (!/"@id"\s*:\s*"[^"]*#business"/.test(h)) continue;
  gouvernees++;
  const attendu = meta.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
  for (const m of h.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    let doc; try { doc = JSON.parse(m[1]); } catch { continue; }
    const pile = [doc];
    while (pile.length) {
      const o = pile.pop();
      if (Array.isArray(o)) { pile.push(...o); continue; }
      if (!o || typeof o !== 'object') continue;
      pile.push(...Object.values(o));
      if (!/Business|Organization|LocalBusiness|HVACBusiness|Plumber|Electrician|HomeAndConstructionBusiness/.test(String(o['@type'] || ''))) continue;
      if (typeof o.description === 'string' && o.description !== attendu) desaccord.push(f);
    }
  }
}
ok(`la description d'entité suit la page, jamais celle d'un autre métier (${gouvernees} pages gouvernées)`,
  desaccord.length === 0, [...new Set(desaccord)].slice(0, 6).join(', '));
ok('la règle est portée par la source partagée, pas appliquée à la main',
  /HORS_IDENTITE/.test(lire('scripts/seo/entite-jsonld.mjs')) && /meta name="description"/.test(lire('scripts/seo/entite-jsonld.mjs')));

console.log(`\nRÉSULTAT SEO STRUCTURE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
