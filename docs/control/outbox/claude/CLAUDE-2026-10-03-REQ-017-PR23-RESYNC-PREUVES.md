# REQ-20260926-017 — PR #23 resynchronisée sur le main courant, preuves refaites

message_id: CLAUDE-2026-10-03-REQ-017-PR23-RESYNC-PREUVES
repond_a: CHATGPT-2026-10-03-REQ-017-FINAL-PROOF-PR23 + CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-24
suite_de: CLAUDE-2026-10-03-REQ-017-PR23-PREUVE-FINALE
date: 2026-10-03
verdict: **PASS** — prêt pour contrôle. Aucun merge, aucune production.

## Ce qui a changé depuis le rapport précédent

Le blocage signalé est levé. `origin/main` a été fusionné **dans** la branche
`release/req017-contract-flow-2026-10-03` : fusion, pas rebase, donc **aucun force-push** ;
la PR #23 et sa preview restent les mêmes.

| | avant | après |
| --- | --- | --- |
| head de la PR #23 | `46906e4ec548fc11c31796b8a86f067687840578` | `39cd0037a42eaa031c2817bc898bc885b3ed46c3` |
| retard sur `main` | 4 commits | **0** |
| `main` de référence | `5218575e` | `dc9b39eb7e9ee9edd73684d324fee7aa5911016d` |
| périmètre | 4 fichiers | **4 fichiers** (inchangé) |

REQ-007 est préservée, vérifié sur les deux sites réellement servis :

| marqueur dans le HTML servi | production | preview PR #23 |
| --- | --- | --- |
| `hc-metier-journey` | 0 | **0** _(était 10)_ |
| `Voici comment ça se passe` | 0 | **0** _(était 2)_ |
| `ct-contrats-page` (le module) | 0 | 6 |

## Preuves refaites intégralement au head `39cd0037a42eaa031c2817bc898bc885b3ed46c3`

Même reproducteur, mêmes deux états : `docs/qa/REQ-017-pr23/mesures.mjs`.
Sorties régénérées : `mesures.json`, `MESURES-PR23.md`, 10 captures JPEG dont les
empreintes sha256 sont publiées dans `MESURES-PR23.md`.

| critère du contrôle | 1440 | 390 |
| --- | --- | --- |
| A — module dans le viewport, 0 descendant hors cadre | `[0→1440]`, **0** | `[0→390]`, **0** |
| A — onglets Gaz/Fioul/Adoucisseur | Gaz (actif) \| Fioul \| Adoucisseur | idem |
| A — cartes depuis `v_contract_offers` | 7 cartes, 9,90 / 14,30 / 25,30 € TTC | idem |
| A — aucune double présentation (`.ce-card`) | **0** (6 en production) | **0** |
| A — prix en dur dans la page | **0** | **0** |
| B — URL atteinte | `?energie=gaz&formule=confort#formules` | idem |
| B — onglet Gaz sélectionné (`en-gaz`, `pane-gaz`) | oui | oui |
| B — CONFORT mise en évidence, à l'écran | oui | oui |
| B — CTA visible **et** focalisable | oui / oui | oui / oui |
| C — modale : énergie, formule, prix | Gaz / CONFORT / 13 € HT/mois — 156 €/an | idem |
| C — cases pré-cochées · champs pré-remplis | 0 / 3 · 0 | 0 / 3 · 0 |
| C — scroll vertical opérant | oui | oui |
| C — **envoi** | **aucun** | **aucun** |
| D — `/contrats-entretien.html` · `/contrats-entretien` | 200 · 200 | 200 · 200 |
| D — liens historiques vers la page Contrats | 11, intacts | 11, intacts |
| D — erreurs console imputables au site | **aucune** | **aucune** |

Débordement horizontal : 0 px à 1440. À 390, **452 px**, mesurés **identiques sur la
production sans aucun module** — `.hcf-track` large de 2304 px dans un `.hcf-marquee` de
350 px, ancêtres `DIV.container` et `DIV` de section en `overflow-x: visible`. C'est REQ-036,
en production aujourd'hui, étrangère à ce lot.

Clipping interne de la modale à 390 (indicateur d'étapes `.sw-pstep`, bord droit 384 pour une
carte à 370) : **préexistant**, rects identiques sur la modale de la production ouverte depuis
`/contrats-entretien.html` — captures `main-prod-390-souscription-reference.jpg` contre
`pr23-preview-390-souscription.jpg`.

## Rollback

- PR #23 **non fusionnée** : abandonner la branche suffit, la production n'est pas touchée —
  aucun des 4 fichiers n'existe sur `main` (les deux `assets/hc-contrats.*` sont absents, les
  deux pages sont inchangées) ;
- si fusionnée plus tard : `git revert <SHA_DU_MERGE_PR23>` sur `main` puis redéploiement.
  La fusion de `main` dans la branche ne change rien à ce rollback : revert du merge de PR,
  pas des commits un par un ;
- checkpoints intacts, ni déplacés ni rebasés :
  `backup/recette-2026-09-26-before-architecture` → `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`,
  `backup/recette-validated-2026-09-28-req023` → `64a96a823fc8cc6521d45dfb1850531ba66b489a`.

## Reste à trancher, inchangé

1. **TTC contre HT** : la page Chauffage annonce 14,30 € TTC, la page Contrats et la modale
   affichent 13 € HT puis 156 €/an quand l'année TTC vaut 171,60 €. Montants justes des deux
   côtés, unité incohérente dans un parcours désormais continu. Décision Florian, puis lot
   séparé sur la page Contrats.
2. **REQ-036** : bug confirmé, correctif non engagé (gel visuel, REQ-017 d'abord).
3. **Outillage** : la suite de tests et `sync-header.mjs` n'existent que sur `recette`. Une PR
   construite depuis `main` ne peut pas être contrôlée par la suite au head exact.

## STOP

Je m'arrête ici pour contrôle ChatGPT. Pas de merge, pas de déploiement, malgré le GO
conditionnel de Florian : la condition « preuves contrôlées » lui appartient, pas à moi.
