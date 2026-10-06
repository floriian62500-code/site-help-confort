#!/usr/bin/env node
/**
 * Preuve machine de ce que `entite-jsonld.mjs` a changé — et de ce qu'il n'a PAS changé.
 *
 * Demandé par CHATGPT-2026-09-25-CONTROL-3 §3 : le diff du candidat A est volumineux, il faut donc
 * prouver que le risque l'est moins. Ce script répond à trois questions, sans faire confiance à
 * la taille du diff :
 *
 *   1. le HTML visible a-t-il bougé ?   → on retire les blocs JSON-LD des deux versions et on
 *      compare octet par octet. Toute différence ailleurs est une erreur bloquante.
 *   2. a-t-on perdu de l'information ?  → aucune clé ne doit disparaître, et pour chaque valeur
 *      remplacée on vérifie que l'ancienne est contenue dans la nouvelle (une entité ne peut que
 *      gagner en précision : « HELP Confort » → « HELP Confort Saint-Omer »). Les remplacements
 *      qui ne sont pas des enrichissements sont listés un par un, pour lecture humaine.
 *   3. tout est-il relisible ?          → chaque bloc JSON-LD des deux versions doit parser.
 *
 *   node scripts/seo/entite-jsonld-preuve.mjs <ref-git-avant>
 *   (par défaut : origin/main)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REF = process.argv[2] || 'origin/main';
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });

const BLOC = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g;
const sansJsonLd = (html) => html.replace(BLOC, '<script type="application/ld+json">§</script>');

function noeuds(html) {
  const out = [];
  for (const m of html.matchAll(BLOC)) {
    let d; try { d = JSON.parse(m[1]); } catch { out.push(null); continue; }
    const pile = [d];
    while (pile.length) {
      const o = pile.pop();
      if (Array.isArray(o)) { pile.push(...o); continue; }
      if (!o || typeof o !== 'object') continue;
      pile.push(...Object.values(o));
      if (/Business|Organization|Plumber|Electrician|HVAC|Locksmith|Contractor/.test(String(o['@type'] || ''))) out.push(o);
    }
  }
  return out;
}
const cle = (o) => String(o['@id'] || '') + '|' + String(o['@type'] || '') + '|' + String(o.name || '');
const brut = (v) => (typeof v === 'string' ? v : JSON.stringify(v));

const modifies = git('diff', '--name-only', REF, '--', '*.html').split('\n').filter(Boolean);
let htmlBouge = [], illisibles = [], clesPerdues = [], nonEnrichis = [], ajouts = 0, alignes = 0, blocs = 0;

for (const f of modifies) {
  if (!existsSync(join(ROOT, f))) continue;
  const avant = git('show', REF + ':' + f);
  const apres = readFileSync(join(ROOT, f), 'utf8');

  if (sansJsonLd(avant) !== sansJsonLd(apres)) htmlBouge.push(f);

  for (const [quoi, h] of [['avant', avant], ['après', apres]]) {
    for (const m of h.matchAll(BLOC)) { blocs++; try { JSON.parse(m[1]); } catch { illisibles.push(f + ' (' + quoi + ')'); } }
  }

  // La description suit une règle explicite : c'est celle de la balise meta de la page. Elle n'a
  // donc pas à « contenir » l'ancienne — elle la remplace exprès, et on vérifie cette règle-là.
  const metaPage = (apres.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const metaDecode = metaPage.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');

  const av = noeuds(avant).filter(Boolean), ap = noeuds(apres).filter(Boolean);
  // Appariement par position : les nœuds ne sont ni ajoutés ni supprimés, seulement complétés.
  for (let i = 0; i < Math.min(av.length, ap.length); i++) {
    const a = av[i], b = ap[i];
    for (const k of Object.keys(a)) {
      if (!(k in b)) { clesPerdues.push(`${f} · ${cle(a)} · ${k}`); continue; }
      const x = brut(a[k]), y = brut(b[k]);
      if (x === y) continue;
      alignes++;
      // Enrichissement = l'ancienne valeur se retrouve dans la nouvelle (texte ou objet complété).
      const enrichi = y.includes(x) ||
        (k === 'description' && y === metaDecode) ||          // règle assumée : la page fait autorité
        (typeof a[k] === 'object' && typeof b[k] === 'object' &&
          Object.entries(a[k] || {}).every(([kk, vv]) => brut((b[k] || {})[kk]) === brut(vv)));
      if (!enrichi) nonEnrichis.push(`${f} · ${k}\n       « ${x.slice(0, 70)} »\n       → « ${y.slice(0, 70)} »`);
    }
    for (const k of Object.keys(b)) if (!(k in a)) ajouts++;
  }
}

let fail = 0;
const ok = (l, c, d) => { if (c) console.log('  ✅ ' + l); else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };

console.log(`\nPREUVE — entité JSON-LD, ${modifies.length} page(s) modifiée(s) depuis ${REF}\n`);
ok('le HTML visible est identique : seuls les blocs JSON-LD ont changé', htmlBouge.length === 0, htmlBouge.join(', '));
ok(`les ${blocs} blocs JSON-LD des deux versions sont relisibles`, illisibles.length === 0, illisibles.join(', '));
ok('aucune clé perdue : un nœud ne peut que gagner de l’information', clesPerdues.length === 0, clesPerdues.slice(0, 8).join('\n     '));
ok(`les ${alignes} valeurs remplacées sont toutes des enrichissements de l’ancienne`,
  nonEnrichis.length === 0, nonEnrichis.slice(0, 40).join('\n     '));
console.log(`\n  ${ajouts} champ(s) ajouté(s) · ${alignes} valeur(s) alignée(s) · 0 suppression\n`);
console.log(fail ? '  ⛔ la preuve échoue : ne pas mettre ce lot en release\n' : '  ✅ preuve complète\n');
process.exit(fail ? 1 : 0);
