#!/usr/bin/env node
// Paiement : rien de ce qui est public ne doit porter un montant jusqu'au serveur.
//
// Constat du 2026-10-08 : `stripe-create-payment-link` est déployée sans authentification, avec un
// CORS ouvert, et prend son montant dans le corps de la requête — sur une clé Stripe réelle.
// Le front appelait cette fonction depuis 26 pages métier, avec un prix lu dans la page.
// Tant que la partie serveur n'est pas reprise (gate), la règle tient côté front : aucune page
// publique n'envoie de montant, et le tunnel garde son verrou.
//
//   node scripts/tests/paiement-front.test.mjs — sortie 1 au moindre écart.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

// Le back-office est hors périmètre : il est derrière une authentification, et son usage est
// manuel et tracé. Ce qui est en cause ici, c'est ce qu'un visiteur peut déclencher.
const PUBLIC = [];
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!/^(admin|admin-pro|docs|node_modules|\.git|supabase|scripts)$/.test(e.name)) walk(rel); }
    else if (/\.(html|js)$/.test(e.name)) PUBLIC.push(rel);
  }
})('');

const FONCTIONS_PAIEMENT = ['stripe-create-payment-link', 'create-payment-session', 'stripe-webhook'];
const appels = PUBLIC.filter((f) => FONCTIONS_PAIEMENT.some((fn) => rd(f).includes('functions/v1/' + fn)));
// Le tunnel appelle create-payment-session, mais derrière un verrou explicite : c'est l'exception,
// et elle est vérifiée plus bas.
const horsTunnel = appels.filter((f) => f !== 'assets/hc-demande.js');
ok(`aucune page publique n’appelle une fonction de paiement (${PUBLIC.length} fichiers)`,
  horsTunnel.length === 0, horsTunnel.join(', '));

const montants = PUBLIC.filter((f) => /amount_eur\s*[:=]/.test(rd(f)));
ok('aucun montant n’est préparé pour le serveur depuis le navigateur', montants.length === 0, montants.join(', '));

const tunnel = rd('assets/hc-demande.js');
ok('le tunnel garde son verrou de paiement',
  /var PAIEMENT_ACTIF = false;/.test(tunnel) && /if \(!PAIEMENT_ACTIF\)/.test(tunnel));

// Les cartes tarif des pages métier mènent au tunnel, pas à un paiement direct.
const modal = rd('assets/hc-reserve-modal.js');
ok('les cartes tarif renvoient au tunnel canonique',
  // On cherche un APPEL, pas le nom : le fichier explique en commentaire ce qu'il ne fait plus.
  /\/catalogue\.html#intervention/.test(modal) && !/functions\/v1\/stripe-create-payment-link/.test(modal));

// La clé anon révoquée ne protège rien, mais la laisser entretient l'illusion du contraire.
const avecCle = PUBLIC.filter((f) => /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/.test(rd(f)));
ok('plus de clé anon révoquée dans les fichiers de paiement', !avecCle.includes('assets/hc-reserve-modal.js'),
  avecCle.join(', '));

console.log(`\nRÉSULTAT PAIEMENT (FRONT) : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
