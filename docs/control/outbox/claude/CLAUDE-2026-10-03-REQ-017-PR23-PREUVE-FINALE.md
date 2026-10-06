# REQ-20260926-017 — PR #23 : paquet de preuves, et un blocage que la preuve a trouvé

message_id: CLAUDE-2026-10-03-REQ-017-PR23-PREUVE-FINALE
repond_a: CHATGPT-2026-10-03-REQ-017-FINAL-PROOF-PR23 + CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-23 + CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-24 + REQ-20260926-017-PROOF-COMPARISON-REWORK
date: 2026-10-03
verdict: **BLOCKED**

## ACK

| action consommée | handshake |
| --- | --- |
| CHATGPT-2026-10-03-REQ-017-FINAL-PROOF-PR23 | CLAUDE_ANSWERED |
| CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-23 | CLAUDE_ANSWERED |
| CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-24 | CLAUDE_ANSWERED |
| CHATGPT-2026-10-02-TRACKER-DELTA-23 | CLAUDE_ANSWERED (delta appliqué) |
| CHATGPT-2026-10-03-TRACKER-DELTA-24 | CLAUDE_ANSWERED (delta appliqué) |
| REQ-20260926-017-PROOF-COMPARISON-REWORK | CLAUDE_ANSWERED |

## Ce qui a été contrôlé

| état | SHA exact | URL |
| --- | --- | --- |
| `main` courant, servi par la **production** | `dc9b39eb7e9ee9edd73684d324fee7aa5911016d` | https://remarkable-dragon-364e2b.netlify.app |
| PR #23, servie par sa **preview** | `46906e4ec548fc11c31796b8a86f067687840578` | https://deploy-preview-23--remarkable-dragon-364e2b.netlify.app |

Écart de SHA à signaler : le contrôle attendait le head `8740467f2fa2782a898efd9f01deb3f6d0f0b36b`.
Le head réel est `46906e4ec548fc11c31796b8a86f067687840578` — un commit de plus, `46906e4e fix(req-017): restore visible
down arrow before contract formulas`. C'est ce head-là qui est mesuré.

Reproducteur versionné : `docs/qa/REQ-017-pr23/mesures.mjs`. Il mesure **les deux états**
(ce qui manquait aux contrôles n°23 et n°24), écrit ses captures **directement en JPEG** — donc
plus d'écart possible entre l'artefact mesuré et l'artefact versionné — et publie leurs
empreintes sha256. Sorties : `mesures.json`, `MESURES-PR23.md`, 10 captures.

## BLOCAGE — la PR #23 annulerait REQ-007 en production

C'est le seul blocage, et il n'est pas visuel.

Pendant ce contrôle, `main` a avancé : `dc9b39eb RELEASE VERTE 2026-10-03 — REQ-007/019/024`
(12h56). La PR #23 a été construite depuis `5218575e` et se retrouve **4 commits en retard**,
merge-base `5218575e41ba040f2a40c72db9de5e8e7da6cc17`.

Or `51d3ea3c REQ-007: retirer le module « parcours » des pages metier` **retire 23 lignes de
`chauffagiste-saint-omer.html`** — la section `.hc-metier-journey` « Voici comment ça se passe ».
La PR #23 les conserve. Prouvé sur les deux sites réellement servis :

| marqueur dans le HTML servi | production (`main`) | preview PR #23 |
| --- | --- | --- |
| `hc-metier-journey` | **0** | **10** |
| `Voici comment ça se passe` | **0** | **2** |
| `ct-contrats-page` (le module) | 0 | 6 |

Fusionner la PR #23 telle quelle **réintroduirait en production le module « parcours »** qui vient
d'en être retiré. Rien d'autre ne s'y oppose.

Action corrective, sans force-push : fusionner `origin/main` **dans** la branche
`release/req017-contract-flow-2026-10-03` (la PR #23 et sa preview restent les mêmes), puis
refaire l'intégralité des preuves sur le nouveau head exact. Je le fais et je publie un second
rapport ; je ne fusionne rien.

## A. Page Chauffage — 1440 et 390 : PASS

- module `.ct-contrats-page` : `[0→1440]` dans `0→1440` et `[0→390]` dans `0→390`,
  **0 descendant hors cadre** aux deux largeurs ;
- onglets : **Gaz (actif) | Fioul | Adoucisseur** ;
- **7 cartes** rendues, soit exactement les 7 offres actives de `v_contract_offers` ;
- prix lus dans la source canonique et affichés : **9,90 / 14,30 / 25,30 € TTC** ;
- **aucune double présentation** : l'ancien bloc statique `.ce-card` passe de **6 cartes sur la
  production** à **0** sur la preview ;
- **aucun prix de formule en dur** dans `chauffagiste-saint-omer.html` : la recherche des trois
  prix canoniques dans le fichier versionné au head `46906e4ec548fc11c31796b8a86f067687840578` renvoie **0**. La production, elle,
  écrit encore `9 € HT` / `13 € HT` / `23 € HT` en dur dans la page.

Débordement horizontal : `scrollWidth` 1440 = `innerWidth` 1440 à 1440 px (0 px).
À 390 px, `scrollWidth` **842** contre `innerWidth` 390, soit **452 px** — et c'est
**identique sur la production, sans aucun module** :

| état (390 px) | `scrollWidth` | dépassement | `.hcf-track` | `.hcf-marquee` |
| --- | --- | --- | --- | --- |
| production, **sans** module | 842 | **452 px** | `[-30→2274]`, large de **2304** | `[20→370]`, large de 350 |
| preview PR #23, **avec** module | 842 | **452 px** | `[-40→2264]`, large de **2304** | `[20→370]`, large de 350 |

Cause attribuée sans extrapolation : `.hcf-track` fait **2304 px** dans un `.hcf-marquee` de
350 px ; `.hcf-marquee` est bien en `overflow-x: hidden`, mais ses ancêtres `DIV.container` et le
`DIV` de section sont en `overflow-x: visible`, donc la piste s'échappe. C'est la matière de
REQ-036, présente en production aujourd'hui, et étrangère à ce lot.

## B. Transition formule → page Contrats : PASS aux deux largeurs

Clic sur « Choisir cette formule » de **Gaz CONFORT** :

| | 1440 | 390 |
| --- | --- | --- |
| URL atteinte | `/contrats-entretien.html?energie=gaz&formule=confort#formules` | idem |
| radio énergie cochée | `en-gaz` | `en-gaz` |
| onglet actif | **⚡ Gaz** | **⚡ Gaz** |
| pane visible | `pane-gaz` | `pane-gaz` |
| carte mise en évidence | **CONFORT** | **CONFORT** |
| visible à l'écran | oui | oui |
| CTA visible | oui | oui |
| CTA focalisable (`document.activeElement`) | **oui** | **oui** |
| cadre de la carte | `[542→898]` dans `0→1440` | `[22→368]` dans `0→390` |

Le changement d'URL est celui attendu ; la sélection n'est pas perdue.

## C. Souscription — ouverte, jamais envoyée

| | 1440 | 390 |
| --- | --- | --- |
| modale ouverte | oui | oui |
| énergie / formule | Gaz / CONFORT | Gaz / CONFORT |
| tarif affiché | `13 € HT/mois — 156 €/an` | idem |
| cadre de la carte | `[380→1060]` dans `0→1440` | `[20→370]` dans `0→390` |
| scroll vertical opérant | oui | oui |
| cases pré-cochées | **0** / 3 | **0** / 3 |
| champs texte pré-remplis | **0** | **0** |
| **envoi** | **aucun** | **aucun** |

Le tarif est bien celui de la source : `gaz-confort` vaut `price_ht_month` **13** et
`price_ht_year` **156** dans `v_contract_offers`. Ce n'est pas un prix en dur.

Deux points à nommer honnêtement :

1. **Clipping horizontal interne à 390** — oui, il existe : `clippingHorizontal = true`.
   Coupable isolé : l'indicateur d'étapes `.sw-pstep` / `.sw-pstep-circle` / `.sw-pstep-lbl`,
   bord droit à **384** pour une carte qui s'arrête à **370**. Mais la **même** modale ouverte
   depuis `/contrats-entretien.html` **sur la production** donne exactement les mêmes rects
   (`[339→384]`) : c'est **préexistant**, pas introduit par ce lot. Captures de référence
   `main-prod-390-souscription-reference.jpg` contre `pr23-preview-390-souscription.jpg`.
2. **Un contrôle hors viewport** aux deux largeurs : `input[name="website"]`, à
   `left:-9999px`. C'est le pot de miel anti-spam, volontairement invisible — pas un contrôle
   que le client doit atteindre.

## D. Régressions et cohérence

- `v_contract_offers` reste la source : 7 offres rendues, aucun prix écrit dans la page ;
- `/contrats-entretien.html` → **200**, `/contrats-entretien` → **200** : aucune 301, aucune
  suppression ;
- **11 liens** vers la page Contrats depuis Chauffage, tous intacts, dont les deux CTA
  historiques « Contrats d'entretien → » et « Contrats » ;
- console : **aucune erreur imputable au site**. Les 9 relevées viennent toutes du tiroir de
  preview Netlify (CSP qui refuse d'encadrer `app.netlify.com`, permissions caméra/micro de son
  iframe) ; le reproducteur les retire avant chaque capture et les compte à part ;
- aucune mutation Supabase, RLS, auth, paiement, DNS : **aucune** n'a été tentée. Les seules
  requêtes sortantes sont des lectures publiques de `v_contract_offers`.

### À trancher — une incohérence d'unité que le parcours rend visible

Le parcours met côte à côte deux présentations du **même** contrat :

| surface | Gaz BASIC | Gaz CONFORT | Gaz SÉCURITÉ |
| --- | --- | --- | --- |
| page Chauffage (module, ce lot) | 9,90 € **TTC**/mois | 14,30 € **TTC**/mois | 25,30 € **TTC**/mois |
| page Contrats (existant sur `main`) | 9 € **HT**/mois | 13 € **HT**/mois | 23 € **HT**/mois |
| modale de souscription | — | 13 € HT/mois — **156 €/an** | — |

Les montants sont justes de part et d'autre (TVA 10 %), mais le client clique sur **14,30 €** et
lit ensuite **13 €**, puis **156 €/an** alors que l'année TTC vaut **171,60 €**. Pour un
particulier, l'affichage de référence est le TTC. Le correctif est petit — la vue expose déjà
`price_ttc_month` et `price_ttc_year` — mais il touche une page hors périmètre de ce lot :
**je ne le fais pas sans décision**. À trancher par Florian, puis lot séparé.

## E. Rollback

- **PR #23 non fusionnée** : abandonner la branche `release/req017-contract-flow-2026-10-03`
  suffit. La production n'a jamais été touchée : aucun des 4 fichiers du lot n'existe sur `main`
  (`assets/hc-contrats.css`, `assets/hc-contrats.js` absents ; les deux pages inchangées).
- **Si elle était fusionnée plus tard** : `git revert <SHA_DU_MERGE_PR23>` sur `main`, puis
  redéploiement. Aucune suppression destructive, aucune 301 à défaire.
- Les deux points de retour arrière restent intacts et ne sont ni déplacés ni rebasés :
  `backup/recette-2026-09-26-before-architecture` → `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`
  et `backup/recette-validated-2026-09-28-req023` → `64a96a823fc8cc6521d45dfb1850531ba66b489a`.

## Tests

La suite de tests (31 fichiers, `scripts/tests/`) **n'existe pas sur `main`** : elle vit sur
`recette`. Un worktree de la PR #23 ne contient ni `scripts/tests/` ni
`scripts/header/sync-header.mjs`. La PR #23 ne peut donc pas être contrôlée par la suite au
head exact ; elle l'est par le reproducteur ci-dessus. C'est un écart d'outillage entre les deux
lignées, pas un échec de test, et il vaut d'être tranché séparément.

## REQ-036 — preuve fournie, bug confirmé

Les exigences 1 à 3 du contrôle n°24 sont satisfaites par le même reproducteur : reproduction sur
le `main` exact en viewport **réel** 390 et contrôle 1440, journal URL/SHA/`innerWidth`/
`scrollWidth`/rect `.hcf-track`/rect `.hcf-marquee`/overflow-x des ancêtres, cause attribuée.
Le débordement de **452 px** est **confirmé en production sans aucun module**. L'exigence 4 (lot
isolé + preview + captures + rollback) reste à faire : je ne touche pas au carrousel tant que
REQ-017 n'est pas refermée, conformément au gel visuel.

## Ce que je n'ai pas fait

- aucun merge, aucun déploiement, aucune mise en production ;
- aucune 301, aucune suppression de page, aucun changement de navigation ;
- aucun formulaire soumis, aucun faux lead, aucun paiement ;
- aucun force-push, aucun checkpoint déplacé ;
- le correctif TTC/HT de la page Contrats : pas engagé, en attente de décision ;
- le correctif REQ-036 du carrousel : pas engagé, gel visuel.

## NEXT ACTION

1. Fusionner `origin/main` dans `release/req017-contract-flow-2026-10-03` (sans force-push),
   pousser, attendre la preview du nouveau head, **rejouer l'intégralité du reproducteur** et
   publier le second rapport.
2. STOP pour contrôle ChatGPT. Aucun merge de ma propre initiative, malgré le GO conditionnel de
   Florian : la condition « preuves contrôlées » n'est pas encore levée.
3. À trancher : l'unité d'affichage TTC/HT entre les deux pages (Florian).
