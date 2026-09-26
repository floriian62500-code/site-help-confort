#!/usr/bin/env node
// Retour arrière du tunnel « Ma demande » (P1 5732805778). Hors ligne : forme du code ; parcours réels vérifiés sur la
// Deploy Preview (accueil intervention / devis, entrée générique, rafraîchissement, précédent / suivant, 1440 et 390).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const js = fs.readFileSync(path.join(ROOT, 'assets/hc-demande.js'), 'utf8'), css = fs.readFileSync(path.join(ROOT, 'assets/hc-demande.css'), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };
try { new Function(js); ok('hc-demande.js syntaxiquement valide', true); } catch (e) { ok('hc-demande.js syntaxiquement valide', false, e.message); }

ok('lien explicite (accueil, page d’atterrissage) : son étape d’arrivée est mémorisée comme étape d’entrée', /if \(h\.entry && !pendingEntry\) state\._entryStep = start;/.test(js));
ok('entrée générique volontaire (sans lien) ou choix dans l’écran générique : pas d’étape d’entrée', /else if \(!location\.hash\) state\._entryStep = null;/.test(js) && /getAttribute\('data-choose'\); pendingEntry = null; state\._entryStep = null;/.test(js));
ok('« Nouvelle demande » / « Reprendre » depuis un lien : l’étape d’entrée suit la demande', /state\._entryStep = entry \? to : null;/.test(js) && /if \(viaEntry\) state\._entryStep = \(C\.FLOWS\[state\.mode\] \|\| \[\]\)\[0\] \|\| r;/.test(js));
const iBack = js.indexOf("$('#topBack').addEventListener('click'"), back = js.slice(iBack, js.indexOf("$('#sendIntervention')", iBack));
ok('flèche interne à l’étape d’entrée : sortie du tunnel (jamais l’écran « Comment pouvons-nous vous aider ? »)', /if \(atEntryStep\(state\.step\)\) return exitTunnel\(\);\n    var p = C\.prevStep/.test(back));
ok('sortie : fenêtre fermée (accueil), ou page précédente du site, sinon accueil', /if \(OVERLAY\) \{ if \(root\.HcDemande\) root\.HcDemande\.close\(\); return; \}/.test(js) && /if \(fromSite && typeof st\.idx === 'number'\) \{ try \{ history\.go\(-\(st\.idx \+ 1\)\); return; \}/.test(js) && /location\.assign\('\/'\);/.test(js));
ok('historique : chaque étape porte sa position (idx) et l’ouverture par-dessus une page (base)', /history\[o\.replace \? 'replaceState' : 'pushState'\]\(\{ step: target, from: o\.replace \? cs\.from : prevShown, idx: o\.replace \? ix : ix \+ 1, base: !!cs\.base \}/.test(js) && /history\.pushState\(\{ hcd: 1, idx: 0, base: true \}, '', hash\)/.test(js));
const close = js.slice(js.indexOf('function close(fromHistory)'), js.indexOf('function isOpen()'));
ok('fermeture : on dépile les étapes (aucune entrée ajoutée), URL nettoyée sur place pour une entrée directe', /history\.go\(-\(st\.idx \+ 1\)\)/.test(close) && /history\.replaceState\(null, '', location\.pathname \+ location\.search\)/.test(close) && !/pushState/.test(close));
ok('« suivant » du navigateur après fermeture : la demande rouvre à l’étape quittée', /if \(overlay\.hidden && ENTRY_HASH\.test\(location\.hash\) && history\.state && history\.state\.base\) open\(location\.hash\);/.test(js));
ok('fenêtre en cours de fermeture = fermée (pas de flash de l’écran générique pendant l’animation)', /function isOpen\(\) \{ return !!overlay && !overlay\.hidden && overlay\.classList\.contains\('is-open'\); \}/.test(js) && /if \(!overlay \|\| overlay\.hidden \|\| !overlay\.classList\.contains\('is-open'\)\) return;/.test(close));
ok('reprise sur lien explicite : « Reprendre / Nouvelle demande » seuls, sans la grille générique', /sc\.classList\.toggle\('is-resume', resumeOnly\)/.test(js) && /\.is-resume \.choix-grid,\.hcd \.step\[data-step="choix"\]\.is-resume \.lede\{display:none\}/.test(css));
ok('libellé accessible de la flèche selon le contexte', /atEntryStep\(target\) \? 'Quitter et revenir à la page précédente' : 'Revenir à l’étape précédente'/.test(js));

console.log(`\nRÉSULTAT RETOUR ARRIÈRE TUNNEL : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
