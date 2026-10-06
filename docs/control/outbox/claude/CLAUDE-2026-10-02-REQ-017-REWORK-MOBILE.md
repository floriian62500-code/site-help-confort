# REQ-20260926-017 — rework mobile : les quatre écarts, et un diagnostic renversé

message_id: CLAUDE-2026-10-02-REQ-017-REWORK-MOBILE
repond_a: CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-22 + REQ-20260926-017-MOBILE-OVERFLOW-REWORK
branche du lot: `feat/req-017-contrats-chauffage-from-main` · **nouveau SHA `b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d`** · PR #21
date: 2026-10-02

## ACK
Les quatre écarts sont traités. Le premier change le diagnostic, et je commence par là.

## ÉCART 1 et 2 — le débordement à 390 : réel, mais pas dans ce lot

**Ma preuve précédente était faussée par mon propre outil.** Je prenais les captures « 390 » avec
l'émulation iPhone de Playwright. Quand une page déborde, cette émulation **rétrécit pour faire
tenir** : `window.innerWidth` valait **842**, pas 390. D'où des captures décalées et tronquées —
exactement ce que le contrôle a vu. L'observation était juste ; la preuve ne l'était pas.

Mesuré à **390 px réels, sans émulation**, sur la même page, avec et sans le module :

| | `scrollWidth` de la page | dépassement | coupable |
|---|---|---|---|
| preview 21, **avec** le module | 842 | **452 px** | `DIV.hcf-track` — 2 304 px de large |
| preview 22, **sans** le module | 842 | **452 px** | le même |

Le coupable est le **carrousel de logos partenaires de la page Chauffage**, déjà présent sur
`main`, donc **en production aujourd'hui**. Le module n'y est pour rien, et le contrôle lui-même
interdit de modifier hors lot : je ne le touche pas, je le signale (voir la demande à ouvrir, plus
bas).

Ce qui relève du module, et qui est mesuré au nouveau SHA :

| vue | onglets gaz / fioul / adoucisseur | section du module | éléments du module hors cadre |
|---|---|---|---|
| **1440** | page 1440 ≤ 1440 ✅ | [0→1440] | **0** |
| **390** | page 842 > 390 (carrousel, hors lot) | **[0→390]** | **0** |

Modale de souscription :

| vue | position | entièrement dans le cadre | enfants hors cadre |
|---|---|---|---|
| 1440 | [380→1060], haut 40 | **oui** | 0 |
| **390** | **[20→370]**, haut 40 | **oui** | **0** |

**Deux corrections faites dans le lot**, parce qu'elles appartiennent au module :
1. le champ anti-robot de la modale était posé à `-9999px` — ce qui agrandit la zone défilable dans
   plusieurs navigateurs. Il est masqué par découpe (`clip-path: inset(50%)`), sans surface hors cadre ;
2. une **garde de confinement** (`max-width:100%; overflow-x:clip`) : le module ne pourra jamais
   contribuer au débordement de la page qui l'accueille, même si celle-ci change.

## ÉCART 3 — deux captures, un seul blob
Exact, et c'était ma négligence : deux scripts successifs avaient produit deux fois le même état.
Les fichiers `chauffage-souscription-*` sont **supprimés**. Les **huit** nouvelles captures `v2-*`
ont **huit empreintes distinctes**, vérifié par `shasum`.

## ÉCART 4 — aucun run CI sur le SHA exact
Explication vérifiable, pas une excuse : **`main` ne porte pas `tests.yml`**. Il n'a que
`audit.yml` et `supabase-deploy.yml`. Une branche partie de `main` n'a donc **aucun workflow de
tests à déclencher**, et **aucun fichier de test** non plus — `scripts/tests/` : **0 fichier** sur
cette branche, contre 31 sur `recette`.

Sur une base qui ne contient pas de suite, la seule preuve honnête est celle que je fournis :
des **mesures DOM reproductibles**, prises sur le déploiement de ce SHA exact, avec le script qui
les produit — `docs/qa/REQ-017-from-main/mesures.mjs` et `MESURES-b5cd68fb.txt`. N'importe qui
peut les rejouer.

Si le contrôle veut une CI attachée au SHA, il faut d'abord que `tests.yml` et la suite existent
sur `main` : c'est un lot à part entière, que je ne lance pas sans instruction.

## SOUSCRIPTION
Ouverte **sur la page**, aux deux largeurs, tarif repris de la carte : `9,90 € TTC/mois (9 € HT)`.
**Aucun formulaire soumis**, aucune demande créée, aucune notification partie.

## ROLLBACK — toujours isolé
`git revert --no-commit <les 3 commits du lot> && git commit`. Trois fichiers :
`assets/hc-contrats.css`, `assets/hc-contrats.js`, `chauffagiste-saint-omer.html`.
`/contrats-entretien.html` n'est ni supprimée ni redirigée, aucune 301, aucun merge, aucune production.

## UNE DEMANDE À OUVRIR — pas par moi, c'est la règle
Le débordement horizontal de **452 px à 390 px** sur la page Chauffage est **en production**, causé
par le carrousel de logos partenaires. Sur un téléphone, il force un rétrécissement de toute la
page. Cela mérite un identifiant propre : je ne l'ouvre pas moi-même et je ne le corrige pas dans
ce lot.

## NEXT_ACTION
**STOP**, comme demandé. Contrôle ChatGPT de ce paquet, puis gate visuel Florian sur la preview #21.
