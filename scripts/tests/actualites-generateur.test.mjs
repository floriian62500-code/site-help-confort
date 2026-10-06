#!/usr/bin/env node
/**
 * Le générateur ne peut pas recréer une URL qu'on vient de rediriger.
 *
 * Exigé par `CHATGPT-2026-09-25-CONTROL-4` §3, et la remarque était juste : canonicaliser dix
 * actualités ne sert à rien si la prochaine synchronisation Facebook les réécrit. Une correction
 * qu'une opération normale du site peut annuler n'est pas une correction.
 *
 * Ce contrôle n'inspecte pas le code source à coups d'expressions régulières : il **exécute** la
 * fonction du générateur (`fiche_chantier`) sur les slugs réellement redirigés dans `_redirects`,
 * et vérifie qu'elle renvoie bien la fiche — c'est-à-dire qu'aucune page actualité ne serait créée.
 *
 *   node scripts/tests/actualites-generateur.test.mjs
 *
 * Aucune écriture : le générateur n'est pas lancé, seule sa fonction de décision est appelée.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };

const GEN = 'scripts/sync-facebook-posts.py';
const redirects = readFileSync(join(ROOT, '_redirects'), 'utf8');
const couples = [...redirects.matchAll(/^\/actualites\/(\S+)\.html \/realisations\/(\S+) 301!$/gm)]
  .map((m) => ({ actu: m[1], fiche: m[2] }));

console.log('\nGÉNÉRATEUR — aucune recréation d’une URL redirigée\n');
ok(`le générateur est présent (${GEN})`, existsSync(join(ROOT, GEN)));
ok(`des couples redirigés existent (${couples.length})`, couples.length > 0);

// On importe le module et on appelle la fonction de décision. `main()` est protégé par
// __main__ : rien ne s'exécute, rien n'est écrit.
// Les slugs passent par l'environnement : le générateur lit lui-même argv à l'import (argparse),
// lui en ajouter le ferait échouer.
const py = `
import importlib.util, json, os, sys
sys.argv = [sys.argv[0]]
spec = importlib.util.spec_from_file_location("gen", ${JSON.stringify(join(ROOT, GEN))})
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
slugs = json.loads(os.environ["HC_SLUGS"])
print(json.dumps({s: m.fiche_chantier(s) for s in slugs}))
`;
let decision = null, erreur = null;
try {
  decision = JSON.parse(execFileSync('python3', ['-c', py],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, HC_SLUGS: JSON.stringify(couples.map((c) => c.actu)) } }).trim());
} catch (e) { erreur = String(e.stderr || e.message).slice(0, 200); }

ok('la fonction de décision du générateur est appelable sans rien exécuter d’autre', !!decision, erreur);

if (decision) {
  const recrees = couples.filter((c) => !decision[c.actu]);
  ok(`aucune des ${couples.length} publications redirigées ne donnerait une page actualité`,
    recrees.length === 0, recrees.map((c) => c.actu.slice(0, 44)).join(', '));

  const mauvaiseCible = couples.filter((c) => decision[c.actu] && decision[c.actu] !== c.fiche);
  ok('la fiche retenue par le générateur est celle vers laquelle on redirige', mauvaiseCible.length === 0,
    mauvaiseCible.map((c) => `${c.actu.slice(0, 36)} → ${decision[c.actu]} (attendu ${c.fiche})`).join(', '));
}

// Et une publication SANS fiche doit toujours donner une page : la garde ne doit pas tout bloquer.
try {
  const sansFiche = execFileSync('python3', ['-c', py],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, HC_SLUGS: JSON.stringify(['2026-12-31-publication-qui-n-existe-pas-du-tout']) } }).trim();
  ok('une publication sans fiche existante donne toujours une page actualité (la garde ne bloque pas tout)',
    JSON.parse(sansFiche)['2026-12-31-publication-qui-n-existe-pas-du-tout'] === null);
} catch (e) { ok('une publication sans fiche existante donne toujours une page actualité', false, String(e.message).slice(0, 120)); }

console.log(`\nRÉSULTAT GÉNÉRATEUR ACTUALITÉS : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
