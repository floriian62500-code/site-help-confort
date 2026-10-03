// Garde de cohérence des zones — REQ-20260926-026.
//
// Pourquoi ce fichier existe : le site consacre une page à des villes (une URL par ville et par
// métier). La liste canonique des communes desservies, elle, vit dans la table `communes` et sort
// par la fonction `communes-list`. Rien ne garantissait que les deux racontent la même histoire —
// et elles ne la racontent pas : le Boulonnais canonique compte six villages, alors que le site a
// des pages pour Boulogne-sur-Mer, Le Portel, Outreau, Saint-Martin-Boulogne et Wimereux.
//
// Ce que la garde vérifie : aucune ville n'est revendiquée publiquement sans être, soit dans la
// liste canonique, soit déclarée ici en écart connu avec sa raison. Une nouvelle page de ville
// sans commune canonique fait échouer la suite — c'est tout l'objet.
//
// Elle ne mute rien, n'appelle pas le réseau et ne touche à aucune page. La liste canonique est
// lue dans un instantané versionné ; pour le rafraîchir :
//     node scripts/tests/zones-coherence.test.mjs --refresh
//
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..', '..');
const INSTANTANE = join(ICI, 'fixtures', 'communes-canoniques.json');
const ENDPOINT = 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/communes-list';

/** Familles de pages locales : un préfixe = une page de ville (cf. docs/seo/pages-canoniques.json). */
const FAMILLES = ['depannage', 'chauffagiste', 'plombier', 'electricien', 'serrurier',
                  'vitrier', 'menuisier', 'travaux', 'volets', 'pmr', 'agence'];

/**
 * Écarts connus, assumés, datés. Chaque entrée DOIT porter une raison : sans raison, la garde
 * refuse l'exception. Retirer une ligne d'ici dès que la commune entre dans le canonique.
 */
const ECARTS_ASSUMES = {
  'boulogne-sur-mer':      'REQ-027 : le Boulonnais canonique ne contient que 6 communes rurales ; décision métier en attente.',
  'le-portel':             'REQ-027 : agglomération boulonnaise absente du canonique.',
  'outreau':               'REQ-027 : agglomération boulonnaise absente du canonique.',
  'saint-martin-boulogne': 'REQ-027 : agglomération boulonnaise absente du canonique.',
  'wimereux':              'REQ-027 : agglomération boulonnaise absente du canonique.',
  'saint-pol-sur-mer':     'REQ-027 : commune de Dunkerque absente du canonique alors qu’une page lui est consacrée.',
};

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Villes revendiquées : déduites du nom des pages, jamais réécrites à la main. */
function villesRevendiquees() {
  const motif = new RegExp('^(' + FAMILLES.join('|') + ')-(.+)\\.html$');
  const trouvees = new Map();
  for (const f of readdirSync(RACINE)) {
    const m = f.match(motif);
    if (m) {
      const v = m[2];
      if (!trouvees.has(v)) trouvees.set(v, []);
      trouvees.get(v).push(f);
    }
  }
  return trouvees;
}

async function rafraichir() {
  const cle = readFileSync(join(RACINE, 'nos-prestations.html'), 'utf8')
    .match(/sb_publishable_[A-Za-z0-9_]+/)?.[0];
  if (!cle) throw new Error('clé publiable introuvable dans nos-prestations.html');
  const r = await fetch(ENDPOINT, { headers: { apikey: cle } });
  if (!r.ok) throw new Error('communes-list a répondu ' + r.status);
  const d = await r.json();
  const communes = Object.entries(d.zones).flatMap(([zone, l]) => l.map((c) => ({ nom: c.nom, zone })));
  const snap = {
    source: ENDPOINT,
    releve_le: new Date().toISOString().slice(0, 10),
    total: communes.length,
    par_zone: Object.fromEntries(Object.entries(d.zones).map(([z, l]) => [z, l.length])),
    communes: communes.sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
  };
  writeFileSync(INSTANTANE, JSON.stringify(snap, null, 1) + '\n');
  console.log(`instantané écrit : ${snap.total} communes, relevé le ${snap.releve_le}`);
}

if (process.argv.includes('--refresh')) {
  await rafraichir();
  process.exit(0);
}

let pass = 0, fail = 0;
const ok = (titre, condition, detail = '') => {
  if (condition) { pass++; console.log(`  ✅ ${titre}`); }
  else { fail++; console.log(`  ❌ ${titre}${detail ? '\n     ' + detail : ''}`); }
};

console.log('\nCOHÉRENCE DES ZONES — villes revendiquées vs communes canoniques\n');

const snap = JSON.parse(readFileSync(INSTANTANE, 'utf8'));
const canoniques = new Set(snap.communes.map((c) => slug(c.nom)));
const revendiquees = villesRevendiquees();

ok(`l’instantané canonique est lisible et non vide (${snap.total} communes, relevé le ${snap.releve_le})`,
   snap.total > 0 && canoniques.size > 0);

// Doublons dans le canonique : défaut de donnée, pas de cohérence de pages. On le signale sans
// bloquer la suite — la correction relève de REQ-027, qui décide du contenu de la liste.
const vus = new Map();
for (const c of snap.communes) vus.set(slug(c.nom), (vus.get(slug(c.nom)) || 0) + 1);
const doublons = [...vus.entries()].filter(([, n]) => n > 1).map(([v]) => v);
if (doublons.length) {
  console.log(`  ⚠️  ${doublons.length} commune(s) en double dans la liste canonique : ${doublons.join(', ')}`);
  console.log('      (défaut de donnée — rattaché à REQ-20260926-027, non bloquant ici)');
}

ok(`des pages de ville existent et sont détectées (${revendiquees.size} villes)`, revendiquees.size > 0);

// Une ville revendiquée est couverte si son slug est canonique, ou préfixe d'un slug canonique
// (les communes fusionnées : « teteghem » → « teteghem-coudekerque-village »).
const couverte = (v) => canoniques.has(v) || [...canoniques].some((c) => c.startsWith(v + '-'));

const nonCouvertes = [...revendiquees.keys()].filter((v) => !couverte(v));
const nonDeclarees = nonCouvertes.filter((v) => !(v in ECARTS_ASSUMES));
ok('aucune ville revendiquée publiquement n’échappe au canonique sans écart déclaré',
   nonDeclarees.length === 0,
   nonDeclarees.map((v) => `${v} → ${revendiquees.get(v).join(', ')}`).join('\n     '));

const sansRaison = Object.entries(ECARTS_ASSUMES).filter(([, r]) => !r || r.trim().length < 20);
ok('chaque écart assumé porte une raison explicite', sansRaison.length === 0,
   sansRaison.map(([v]) => v).join(', '));

const perimes = Object.keys(ECARTS_ASSUMES).filter((v) => couverte(v));
ok('aucun écart assumé n’est devenu inutile (commune entrée au canonique)', perimes.length === 0,
   perimes.length ? `à retirer de ECARTS_ASSUMES : ${perimes.join(', ')}` : '');

const fantomes = Object.keys(ECARTS_ASSUMES).filter((v) => !revendiquees.has(v));
ok('aucun écart assumé ne vise une ville qui n’a plus de page', fantomes.length === 0,
   fantomes.join(', '));

const age = Math.round((Date.now() - Date.parse(snap.releve_le)) / 86400000);
if (age > 90) console.log(`  ⚠️  instantané vieux de ${age} jours — pensez à « --refresh » (non bloquant)`);

console.log(`\n  écarts connus et assumés : ${Object.keys(ECARTS_ASSUMES).length} (${Object.keys(ECARTS_ASSUMES).join(', ')})`);
console.log(`\nRÉSULTAT COHÉRENCE DES ZONES : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
