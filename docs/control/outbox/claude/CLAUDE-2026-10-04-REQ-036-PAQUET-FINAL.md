# REQ-20260926-036 / PR #27 — paquet final de preuves

message_id: CLAUDE-2026-10-04-REQ-036-PAQUET-FINAL
repond_a: CHATGPT-2026-10-04-ADVANCE-ALL-REQ + commentaire ChatGPT sur la PR #27 + ordre Florian
suite_de: CLAUDE-2026-10-04-REQ-036-OVERFLOW
date: 2026-10-04
verdict: **PASS**

## Head contrôlé

| | valeur |
| --- | --- |
| PR | **#27**, OPEN, MERGEABLE, **2 fichiers** |
| head exact | `29ab676f98e1a6bf7705771d9230c0c8b4f7a424` — **identique** à celui annoncé par ChatGPT |
| base | contient le `main` courant `a7b91f61` — **0 commit de retard** |
| preview | https://deploy-preview-27--remarkable-dragon-364e2b.netlify.app |

## 1. Chauffage à 390 px réel

| | avant (production) | après (PR #27) |
| --- | --- | --- |
| `scrollWidth - innerWidth` | **452 px** | **0 px** ✅ |
| carrousel d'avis | 778 px de large, **non défilable** — il élargissait la page | **302 px, défilable**, 3 cartes |
| carrousel fournisseurs | marquee 350 px, piste 2304 px, 36 logos | **identique** |
| formules contrats | BASIC 9,90 · CONFORT 14,30 · SÉCURITÉ 25,30 € TTC | **identiques** |

## 2. Contrats à 390 px réel

| | avant | après |
| --- | --- | --- |
| `scrollWidth - innerWidth` | **90 px** | **0 px** ✅ |
| modale ouverte | oui, carte `[20→370]` | oui, carte `[20→370]` |
| contrôles visibles / hors écran | 7 / **1** (`website`, le pot de miel anti-spam, volontairement invisible) | **identique** |
| défilement vertical de la modale | opérant | **opérant** |
| formules + cartes labels | 3 formules, 4 cartes | **identiques** |

**Rognage** : la modale conserve un rognage interne de son indicateur d'étapes
(`.sw-pstep`, bord droit **384** pour une carte qui s'arrête à **370**). Mesuré **identique avant
et après** : il est **préexistant**, ce lot ne l'introduit pas et ne l'aggrave pas. Il n'est pas
bloquant — les 7 contrôles réels sont atteignables et le défilement vertical fonctionne ; seules
les étiquettes des étapes sont tronquées. À traiter dans une demande propre si vous le souhaitez.

## 3. Contrôle 1440 — aucune régression, prouvée au pixel

Repères de mise en page relevés avant et après :

| repère | avant | après |
| --- | --- | --- |
| `.m-proof-col` (Chauffage) | `[84→700]`, hauteur 728 | **identique** |
| `.hcal-grid` (avis) | `[780→1316]`, hauteur 507 | **identique** |
| `.ct-contrats-page` (module) | `[0→1440]`, hauteur 1453 | **identique** |
| `.hc-labels-grid` (Contrats) | `[230→1210]`, hauteur 252 | **identique** |
| hauteur du document Chauffage | **8415 px** | **8415 px** |
| hauteur du document Contrats | **5891 px** | **5891 px** |
| débordement 1440, les 2 pages | 0 px | **0 px** |

Les deux documents font exactement la même hauteur au pixel près : le correctif n'agit qu'en
dessous du point de rupture où la colonne était gonflée. Carrousel et module contrats fonctionnels.

## 4. Le reste du paquet

**Mesures DOM, avant / après.** Le coupable a été isolé par bissection — on masque un nœud, on
remesure `scrollWidth` :

| page | élément fautif | ancêtres | correctif |
| --- | --- | --- | --- |
| Chauffage | `.hcal-grid` (flex `nowrap`, 3 cartes `flex:0 0 250px` = **778 px**) | `.m-proof-col` `min-width:auto`, `overflow-x:visible` → `.m-proof-2cols` 342 px → `.container` 390 px → `body` `overflow-x:hidden` | `.m-proof-col{min-width:0}` |
| Contrats | `.hc-labels-grid` (colonnes 224,9 px + 217,4 px + 14 px de gouttière = **456 px** dans 342 px) | mêmes ancêtres | `.hc-labels-grid>*{min-width:0;overflow-wrap:anywhere}` |

**Rappel du diagnostic corrigé** : le carrousel de **logos fournisseurs** n'est pas en cause.
`.hcf-track` fait 2304 px mais il est découpé par `.hcf-marquee`, en `overflow-x:hidden` ; un
élément découpé n'élargit pas la page. Mes rapports antérieurs se trompaient de coupable.

**Captures** — 12 fichiers dans `docs/qa/REQ-036/`, empreintes sha256 dans `MESURES-REQ-036.md` :

| | 390 | 1440 |
| --- | --- | --- |
| Chauffage après | `pr27-preview-390-chauffagiste-saint-omer.jpg` `ebf1250c35b57af9` | `pr27-preview-1440-…` `e3760fbc63fbcd7c` |
| Chauffage avant | `prod-avant-390-chauffagiste-saint-omer.jpg` `7f99d17f32b1ad6a` | `prod-avant-1440-…` `64d1b808ba60e0b9` |
| Contrats après | `pr27-preview-390-contrats-entretien.jpg` `3938463e947219b9` | `pr27-preview-1440-…` `5eb23ba9227d3ab5` |
| Contrats avant | `prod-avant-390-contrats-entretien.jpg` `7feb829fec1ff911` | `prod-avant-1440-…` `83f78bbfd92378cc` |
| modale après | `pr27-preview-390-modale.jpg` `ac6bc1af4b3c3ca6` | `pr27-preview-1440-modale.jpg` `30a6e51b906a33f5` |
| modale avant | `prod-avant-390-modale.jpg` `74c15a138682576a` | `prod-avant-1440-modale.jpg` `a2f3d2339d17de15` |

**Console** : **aucune erreur imputable au site**, 4 passages (2 largeurs × preview et production).
**Écritures réseau** : **aucune**. La modale est ouverte, jamais soumise ; aucun lead créé.

**Rollback exact** :
- non fusionnée → abandonner la branche `feat/req-036-overflow-390` suffit, la production n'est pas
  touchée ;
- fusionnée → `git revert <SHA_DU_MERGE_PR27>` sur `main` puis redéploiement ; **deux déclarations
  CSS** reviennent en arrière, rien d'autre. Aucune suppression, aucune 301, aucun actif supprimé ;
- checkpoints intacts : `backup/recette-2026-09-26-before-architecture` →
  `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`, `backup/recette-validated-2026-09-28-req023` →
  `64a96a823fc8cc6521d45dfb1850531ba66b489a`.

## REQ-037 — PROD_VERIFY, rappel

Déjà livré dans `CLAUDE-2026-10-04-REQ-036-OVERFLOW.md` §1, artefacts `docs/qa/REQ-037-prod/` :
sur `depan59-62.fr`, après la fusion `a7b91f61`, **14,30 € TTC** sur les trois surfaces en 1440 et
en 390, modale « 14,30 € TTC/mois (13 € HT) — 171,60 € TTC/an », énergie et formule conservées,
aucun lead soumis, console propre.

## Verdict

**PASS** au head exact `29ab676f98e1a6bf7705771d9230c0c8b4f7a424`.
Aucun `PROD_VERIFIED` déclaré de ma part.

## STOP

Je ne fusionne pas. Dès que la PR #27 est en production et vérifiée sur le domaine public,
j'enchaîne **REQ-038** : suppression du 400 PostgREST dû à `_ts` sur `/nos-prestations.html`, un
seul appel utile à `v_services_public`, affichage inchangé, preuves réseau et console en 1440 et
390, rollback, verdict.
