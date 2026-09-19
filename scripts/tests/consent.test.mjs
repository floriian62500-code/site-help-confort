#!/usr/bin/env node
// Bandeau cookies (assets/hc-consent.js) : compact sur mobile, ne recouvre plus les actions (bouton principal, barre du
// tunnel « Ma demande »), refus aussi simple qu'accepter, versionné (cache immuable sur /assets/*). Hors ligne.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };
const htmlFiles = (dir = ROOT, out = []) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (/^(node_modules|\.git|docs|supabase|scripts)$/.test(e.name)) continue; const p = path.join(dir, e.name); if (e.isDirectory()) htmlFiles(p, out); else if (e.name.endsWith('.html')) out.push(p); } return out; };

const js = rd('assets/hc-consent.js');
ok('mobile : le paragraphe ne prend plus 280 px de HAUTEUR en colonne (bandeau de 372 px en 390, bouton principal masqué)', /@media\(max-width:560px\)\{#hc-consent-banner\{flex-direction:column;align-items:stretch;left:10px;right:10px;bottom:10px;padding:12px 14px;gap:10px;\}/.test(js) && /#hc-consent-banner p\{flex:none;font-size:13px;line-height:1\.45;\}/.test(js));
ok('refuser aussi simple qu’accepter (2 boutons de même largeur)', /class="hc-c-refuse"[^>]*>Refuser</.test(js) && /class="hc-c-accept"[^>]*>Accepter</.test(js) && /#hc-consent-banner button\{flex:1;/.test(js));
ok('hauteur publiée (--hc-consent-h) tant que le bandeau est affiché, remise à zéro après le choix', /setProperty\('--hc-consent-h', h \+ 'px'\)/.test(js) && /removeProperty\('--hc-consent-h'\)/.test(js) && /ResizeObserver\(publish\)/.test(js));
ok('pendant le bandeau : pas de seconde barre en bas (appel/devis) ni pastille de recette sur « Refuser »', /body:has\(#hc-consent-banner\) #hcStickyCta,body:has\(#hc-consent-banner\) #hc-sv-cta\{display:none !important;\}/.test(js));
ok('tunnel « Ma demande » : barre d’action décalée au-dessus du bandeau', /\.hcd \.q-actions\{bottom:var\(--hc-consent-h,0px\)\}/.test(rd('assets/hc-demande.css')));
const pages = htmlFiles().filter(f => /hc-consent\.js/.test(fs.readFileSync(f, 'utf8')));
const unversioned = pages.filter(f => /assets\/hc-consent\.js["']/.test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(ROOT, f));
ok('les ' + pages.length + ' pages chargent une version datée (sinon le cache immuable d’un an garde l’ancien bandeau)', pages.length > 0 && !unversioned.length, unversioned.slice(0, 5).join(', '));

// catalogue.html (tunnel) : pas de bandeau, décision documentée le 17/09 (docs/release/TRACKING-FUNNEL-2026-09-17.md § 4) —
// les campagnes atterrissent sur les pages ci-dessous, qui recueillent le consentement avant le tunnel.
const parcours = ['index.html', 'entretien-chaudiere.html', 'prestations/ramonage.html', 'entretien-poele-insert.html', 'contrats-entretien.html'];
const sansBandeau = parcours.filter(f => !/hc-consent\.js\?v=/.test(rd(f)));
ok('pages d’arrivée des campagnes (accueil, 3 pages d’atterrissage, contrats) : bandeau chargé, sinon aucune mesure possible (tracking.js attend le consentement)', !sansBandeau.length, sansBandeau.join(', '));
const trackSansBandeau = htmlFiles().filter(f => { const s = fs.readFileSync(f, 'utf8'); return /assets\/tracking\.js/.test(s) && !/hc-consent\.js/.test(s); }).map(f => path.relative(ROOT, f)).filter(f => f !== 'catalogue.html');
ok('aucune page (hors tunnel, par décision) ne charge tracking.js sans le bandeau', !trackSansBandeau.length, trackSansBandeau.join(', '));

console.log(`\nRÉSULTAT BANDEAU COOKIES : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
