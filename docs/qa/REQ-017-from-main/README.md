# REQ-20260926-017 — preuves au SHA `b5cd68fb`

Branche `feat/req-017-contrats-chauffage-from-main` (partie du `main` courant), PR #21.
SHA exact : **`b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d`** · preview
`https://deploy-preview-21--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#entretien`

Les mesures brutes sont dans `MESURES-b5cd68fb.txt`, et le script qui les produit dans
`mesures.mjs` : n'importe qui peut les rejouer.

## Ce que le contrôle n°22 reprochait, point par point

### 1 et 2 — débordement et modale hors cadre à 390
**La cause est réelle, mais elle n'est pas dans ce lot.** Mesuré à 390 px, sur la même page, avec et
sans le module :

| | page `scrollWidth` | dépassement | coupable |
|---|---|---|---|
| preview 21 (**avec** le module) | 842 | 452 px | `DIV.hcf-track`, largeur 2 304 px |
| preview 22 (**sans** le module) | 842 | 452 px | le même |

C'est le **carrousel de logos partenaires de la page Chauffage**, déjà présent sur `main`. Le module
n'y change rien : il est strictement contenu.

Pourquoi mes captures précédentes semblaient décalées : je les prenais avec l'**émulation iPhone**,
qui « rétrécit pour faire tenir » une page qui déborde — `innerWidth` valait alors 842 au lieu de
390. L'observation du contrôle était donc juste, et ma preuve était faussée par mon propre outil.
Les nouvelles captures sont prises à **390 px réels, sans émulation**.

Mesures au SHA `b5cd68fb` :

| vue | onglet | page | section du module | éléments hors cadre |
|---|---|---|---|---|
| 1440 | gaz / fioul / adoucisseur | 1440 ≤ 1440 ✅ | [0→1440] | **0** |
| 390 | gaz / fioul / adoucisseur | 842 > 390 ⚠️ (carrousel, hors lot) | **[0→390]** | **0** |

Modale de souscription :

| vue | position | entièrement dans le cadre | enfants hors cadre |
|---|---|---|---|
| 1440 | [380→1060], haut 40 | **oui** | 0 |
| 390 | **[20→370]**, haut 40 | **oui** | 0 |

Deux corrections ont quand même été faites **dans le lot**, parce qu'elles relevaient du module :
- le champ anti-robot de la modale était posé à `-9999px`, ce qui agrandit la zone défilable dans
  plusieurs navigateurs : il est masqué par découpe (`clip-path`), sans surface hors cadre ;
- une garde de confinement (`max-width:100%; overflow-x:clip`) garantit que le module ne
  contribuera jamais au débordement de la page qui l'accueille, même si celle-ci change.

### 3 — deux captures partageaient le même blob
Exact. Les deux fichiers `chauffage-souscription-*` ont été **supprimés** ; les huit nouvelles
captures `v2-*` ont **huit empreintes distinctes** (vérifié).

### 4 — aucun run GitHub Actions sur le SHA exact
Explication vérifiable : le workflow `tests.yml` **n'existe pas sur `main`** — `main` ne porte que
`audit.yml` et `supabase-deploy.yml`. Une branche partie de `main` n'a donc aucun workflow de tests
à déclencher, et **aucun fichier de test** non plus (`scripts/tests/` : 0 fichier sur cette branche).
Le contrôle demande des tests sur le head exact ; sur une base qui n'en contient aucun, la seule
preuve honnête est celle qui est ici : des **mesures DOM reproductibles**, prises sur le déploiement
de ce SHA, avec le script qui les produit.

## Souscription
Ouverte **sur la page**, aux deux largeurs, tarif repris de la carte : `9,90 € TTC/mois (9 € HT)`.
**Aucun formulaire soumis**, aucune demande créée.

## Rollback — toujours isolé
`git revert --no-commit <les 3 commits du lot> && git commit`. Le lot ne touche que trois fichiers :
`assets/hc-contrats.css`, `assets/hc-contrats.js`, `chauffagiste-saint-omer.html`.
