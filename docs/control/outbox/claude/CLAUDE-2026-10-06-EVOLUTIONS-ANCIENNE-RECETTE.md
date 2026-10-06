# L'ancienne recette, par évolution fonctionnelle — pas par fichiers

message_id: CLAUDE-2026-10-06-EVOLUTIONS-ANCIENNE-RECETTE
repond_a: ordre Florian du 2026-10-06 (3 étapes)
date: 2026-10-06
verdict: **14 évolutions classées** · **2 prêtes** · **5 à vous présenter** · le reste tranché

## Étape 1 — REQ-041 finie

Les six formulations de texte courant d'`a-propos.html` sont corrigées : **PR #33**, 1 fichier.
La citation entre guillemets reste intacte — on ne réécrit pas un propos rapporté.

Après ce lot, la production ne portera plus qu'**une occurrence sur 117 pages** : cette citation,
plus l'exception du réseau national « 100+ agences locales en France ».

## Étape 2 — les évolutions, une par une

### Prêtes à mettre en prod — déjà justifiées, rien à valider

| # | évolution | pourquoi c'est prêt |
| --- | --- | --- |
| **1** | **Canonique `www.` → domaine nu**, 194 pages | La prod déclare un canonique qui répond **301**. Chaque page dit à Google que son URL canonique redirige. `recette` l'a corrigé partout. Lot mécanique, vérifiable page par page. |
| **2** | **Garde de build Netlify** | `main` compare `HEAD^..HEAD` : un commit de tête en `.md` annule le build et le HTML poussé juste avant n'est jamais déployé. **Déjà dans la PR #34.** |

### À vous présenter — jamais validées, et encore pertinentes

| # | évolution | ampleur | ce qu'il faut de vous |
| --- | --- | --- | --- |
| **3** | **En-tête unifié** — `assets/hc-header.{js,css}` + `partials/hc-header.html` | **201 pages** sur recette ; `main` n'a **aucun** de ces fichiers et garde un en-tête recopié dans chaque page | un verdict visuel : c'est l'en-tête de tout le site |
| **4** | **Tunnel de demande** — `catalogue.html`, `hc-demande*.{js,css}`, `hc-cart.js` | `/catalogue.html` répond **404** en prod : jamais déployé | le plus gros morceau ; à voir avant toute décision |
| **5** | **Encart saisonnier** — `hc-promo-saison.{js,css}`, 202 pages | REQ-035, preuves refaites et conformes | votre verdict visuel, déjà demandé |
| **6** | **Widgets de contenu** — `hc-realisations.js` (30 pages), `hc-review.js` (15), `hc-recrutement.js` (3), `hc-landing.js` (4) | absents de prod | un coup d'œil, ils sont indépendants les uns des autres |
| **7** | **Pages éditoriales** — 2 pages `emploi/`, 5 pages `realisations/` | contenu jamais publié | à lire avant publication |

### Obsolètes

| # | évolution | pourquoi |
| --- | --- | --- |
| **8** | `recette.html` et `recette-versions.json` | pages de l'instance de recette ; elles n'ont rien à faire en production |
| **9** | Tunnel « demande v1 », écran de reprise générique, routage des boutons vers le tunnel | ce sont REQ-009 et REQ-011, que vous avez déjà clôturées sans objet : elles visent un tunnel absent de la prod |

### Contrôle seulement — ne vont jamais en production

| # | évolution | ampleur |
| --- | --- | --- |
| **10** | Plan de contrôle ChatGPT / Claude (`docs/control/`) | 340 fichiers |
| **11** | Preuves QA de toutes les demandes closes (`docs/qa/`) | 254 fichiers |
| **12** | Suite de tests et outillage (`scripts/tests/`, `scripts/control/`, `scripts/header/`) | 41 + outillage |

Ils sont l'objet de la **PR #34** : portés sur `main` pour qu'aligner `recette` ne les efface pas.

### Sensible — rien sans GO nommément dédié

| # | évolution | ampleur |
| --- | --- | --- |
| **13** | `supabase/` : migrations en attente, fonctions edge de production et de staging, **versions durcies** de `stripe-create-payment-link` et des fonctions d'écriture GitHub | ~90 fichiers |
| **14** | Back-office inédit (`admin-pro/`) | 25 fichiers |

Le point 13 recoupe REQ-001 et REQ-033. Il ne bouge pas.

### Déjà en prod, ou la prod fait foi

- **102 fichiers** de back-office : modifiés seulement sur `main`, `recette` est en retard. Rien à porter.
- **69 fichiers visibles** modifiés des deux côtés — `a-propos`, `contact`, les pages `chauffagiste-*`,
  `hc-map-zones.js`, `hc-live-stats.js`. Ce sont exactement les pages que les lots récents ont
  corrigées en production. **Rien à reprendre.**

## Étape 3 — l'alignement, prêt

La remise à zéro forcée est bloquée par la protection de branche, et je ne la contourne pas. La
voie autorisée, **testée à blanc** : l'arbre de `recette` devient identique bit à bit à celui de
`main`, par un commit ordinaire.

```bash
git checkout recette
git read-tree -m -u origin/main
git commit -m "sync(recette): redevient le miroir de la production"
git push origin recette
```

**Un seul préalable : la PR #34.** Sans elle, cette commande supprime 880 fichiers, dont les 340
du plan de contrôle et les 254 preuves. Avec elle, elle ne supprime plus rien d'utile.

## Ce que j'attends de vous, en trois mots

1. **Fusionner la PR #34** (portage + garde de build) → j'aligne `recette` dans la foulée.
2. **Fusionner la PR #33** (a-propos) → REQ-041 est close.
3. **Dire oui ou non** à l'évolution **1** (canonique) : je la monte depuis le `main` courant.

Les évolutions **3 à 7** attendent une présentation visuelle ; dites-moi par laquelle commencer.
