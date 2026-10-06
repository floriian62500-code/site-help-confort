#!/usr/bin/env node
/* P0 #8 — Générateur de LOT DE RELEASE (recette → prod).
 * Calcule base(main)/head(recette), liste les commits recette∉main et sépare :
 *  - PROMOTABLE : commits touchant au moins un fichier publiable (site),
 *  - EXCLU      : commits control-plane/runner/docs/auto-push — JAMAIS en prod.
 * NE POUSSE RIEN, NE DÉPLOIE RIEN. Sort un JSON de lot immuable.
 * Usage : node scripts/control/build-release-lot.mjs [--base <sha>] [--head <sha>]
 */
import { execSync } from 'node:child_process';

const REMOTE = 'https://github.com/floriian62500-code/site-help-confort.git';
const sh = (c) => execSync(c, { encoding: 'utf8' }).trim();
const shSafe = (c) => { try { return sh(c); } catch { return ''; } };

// Fichiers/chemins JAMAIS promus en prod (recette-only)
const EXCLUDE_PATHS = [/^docs\/control\//, /^scripts\/control\//, /^logs\//, /^docs\/audits\//];
// Sujets de commit non-fonctionnels (control-plane / bruit)
const EXCLUDE_SUBJECT = /^(control|control-plane|chore\(control|Auto-push|docs\(control)/i;

function argOr(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

// Récupère les tips distants (source de vérité)
shSafe(`git -c credential.helper='' -c credential.helper='!gh auth git-credential' fetch -q ${REMOTE} main recette`);
const base = argOr('--base', shSafe(`git ls-remote ${REMOTE} refs/heads/main`).split('\t')[0] || sh('git rev-parse origin/main'));
const head = argOr('--head', shSafe(`git ls-remote ${REMOTE} refs/heads/recette`).split('\t')[0] || sh('git rev-parse HEAD'));

const range = `${base}..${head}`;
const shas = shSafe(`git log --format=%H ${range}`).split('\n').filter(Boolean);

const promotable = [], excluded = [];
const filesPromoted = new Set();
for (const sha of shas) {
  const subject = shSafe(`git log -1 --format=%s ${sha}`);
  const files = shSafe(`git show --pretty=format: --name-only ${sha}`).split('\n').filter(Boolean);
  const publishable = files.filter((f) => !EXCLUDE_PATHS.some((re) => re.test(f)));
  const isControlSubject = EXCLUDE_SUBJECT.test(subject);
  if (publishable.length > 0 && !isControlSubject) {
    promotable.push({ sha: sha.slice(0, 8), subject, files: publishable });
    publishable.forEach((f) => filesPromoted.add(f));
  } else {
    excluded.push({ sha: sha.slice(0, 8), subject, reason: isControlSubject ? 'control-plane subject' : 'fichiers non publiables' });
  }
}

const lot = {
  release_id: `REL-${new Date().toISOString().slice(0, 10)}-DRAFT`,
  base_sha: base.slice(0, 8),
  head_sha: head.slice(0, 8),
  generated_note: 'DRAFT — inventaire, aucune promotion. Les items validés Florian doivent être rattachés avant PRET_PROD.',
  counts: { total: shas.length, promotable: promotable.length, excluded: excluded.length, files_touched: filesPromoted.size },
  promotable_commits: promotable,
  excluded_commits: excluded,
  files_promoted: [...filesPromoted].sort(),
};
console.log(JSON.stringify(lot, null, 2));
