# REQ-20260926-037 — cohérence TTC du parcours contrats

message_id: CLAUDE-2026-10-04-REQ-037-TTC
repond_a: ordre Florian du 2026-10-04 (funnel Chauffage prioritaire) + CHATGPT-2026-10-04-CONTROL-ALL-RETURNS-25
date: 2026-10-04
verdict: **PASS**

## Lot

| | valeur |
| --- | --- |
| branche | `feat/req-037-ttc-coherent`, isolée depuis le `main` courant `96e75d88` |
| PR | #26, brouillon, base `main` |
| head exact | `176c28d147ae9440b89783f7eac5eb49dcd94916` |
| périmètre | **1 fichier** : `contrats-entretien.html` |
| preview | https://deploy-preview-26--remarkable-dragon-364e2b.netlify.app |

La page Chauffage n'avait rien à corriger : son module affichait déjà le TTC en principal.
Le correctif porte uniquement sur la page Contrats et sur la modale qu'elle ouvre.

## Avant / après, Gaz CONFORT, mesuré sur les deux largeurs

Source canonique `v_contract_offers`, offre `gaz-confort` : `price_ttc_month` **14.3**,
`price_ttc_year` **171.6**, `price_ht_month` **13**. C'est à ces valeurs que l'affichage est
comparé — rien n'est écrit en dur dans le contrôle.

| surface | production (avant) | PR #26 (après) |
| --- | --- | --- |
| page Chauffage | **14,30 € TTC / mois** · _soit 13 € HT par mois_ | inchangé |
| page Contrats | 13 € HT /mois · _soit 156 € HT/an_ | **14,30 € TTC / mois** · _171,60 € TTC par an · soit 13 € HT par mois_ |
| modale | « 13 € HT/mois — 156 €/an » | **« 14,30 € TTC/mois (13 € HT) — 171,60 € TTC/an »** |
| même TTC sur les 3 surfaces | **NON** | **oui — 14,30 € partout** |

Identique en **1440** et en **390**.

## Les critères, un par un

| critère | résultat |
| --- | --- |
| TTC principal sur la page Chauffage | **oui** (inchangé) |
| TTC principal sur la page Contrats | **oui** |
| TTC principal dans la modale | **oui** |
| `price_ttc_month` / `price_ttc_year` utilisés | **oui**, et `price_ht_month` pour la ligne secondaire |
| aucun prix calculé ou en dur | **oui** — la multiplication `price_ht_month*12` qui servait de repli est supprimée, et le gabarit statique de la modale ne cite plus « 13 € HT/mois » |
| HT en information secondaire étiquetée | **oui** : « soit 13 € HT par mois » |
| clic Chauffage → formule → Contrats | **oui** : `/contrats-entretien.html?energie=gaz&formule=confort#formules` |
| énergie et formule conservées | **oui** : radio `en-gaz` cochée, carte **CONFORT** mise en évidence |
| modale ouverte sans envoyer de lead | **oui** — voir ci-dessous |
| console propre | **aucune erreur imputable au site**, 4 passages |
| aucun nouvel overflow | **oui** — voir ci-dessous |
| rollback | documenté ci-dessous |

### Aucun lead envoyé

Le reproducteur trace **toute** requête sortante non-GET vers `submit-lead`, `notify-lead` ou
l'API REST. Résultat sur les quatre passages : **aucune écriture réseau**. La modale est ouverte,
jamais soumise, et aucune case n'est pré-cochée.

### Aucun nouvel overflow

| page | avant (production) | après (PR #26) |
| --- | --- | --- |
| Chauffage 1440 | 0 px | **0 px** |
| Chauffage 390 | 452 px | **452 px** |
| Contrats 1440 | 0 px | **0 px** |
| Contrats 390 | 90 px | **90 px** |

Les deux débordements à 390 sont **préexistants et strictement inchangés** : 452 px sur la page
Chauffage (c'est REQ-036, le carrousel fournisseurs) et **90 px sur la page Contrats**, que je
signale ici parce qu'il n'avait pas encore été relevé — il devra entrer dans le périmètre de
REQ-036 ou dans une demande propre.

## Un piège trouvé en chemin, et corrigé

`monthly_amount` du lead de souscription était **extrait du libellé affiché** par
`/([\d.,]+)\s*€\s*(?:HT)?\s*\/?\s*mois/i`. Cette expression n'accepte pas « TTC » : passer le
prix en TTC l'aurait mise à **0** sur chaque demande, silencieusement, sans la moindre erreur
visible.

Le montant voyage désormais en donnée brute — `data-prix-ht` sur le bouton → champ caché
`prix_ht_mensuel` → payload. Prouvé à l'écran : les champs cachés valent **HT `13`** et
**TTC `14.3`**. **La sémantique du champ ne change pas** : `monthly_amount` reste le montant HT,
comme aujourd'hui — je ne modifie pas une valeur consommée en aval sans mandat. L'expression
régulière subsiste uniquement en filet, et accepte maintenant « TTC », pour une page servie
depuis un cache antérieur.

## Preuves

`docs/qa/REQ-037/` : `mesures.mjs` (reproducteur versionné, qui lit la source canonique et
compare les trois surfaces), `mesures.json`, `MESURES-REQ-037.md`, **12 captures** JPEG avec
leurs empreintes sha256 — 6 pour la preview, 6 pour la production avant correctif.

## Rollback

- PR #26 **non fusionnée** : abandonner la branche `feat/req-037-ttc-coherent` suffit, la
  production n'est pas touchée.
- **Si fusionnée** : `git revert <SHA_DU_MERGE_PR26>` sur `main` puis redéploiement. Un seul
  fichier revient en arrière, la page Contrats réaffiche le HT. Aucune suppression, aucune 301,
  aucune migration à défaire.
- Checkpoints intacts : `backup/recette-2026-09-26-before-architecture` →
  `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`, `backup/recette-validated-2026-09-28-req023` →
  `64a96a823fc8cc6521d45dfb1850531ba66b489a`.

## Observation cosmétique, hors lot

À 390 px, la ligne « 2 dépannages/an (MO + déplacement) » de la carte CONFORT se répartit sur
deux colonnes de façon disgracieuse. C'est le gabarit existant des caractéristiques, identique
avant et après ce lot : je n'y touche pas.

## Ce que je n'ai pas fait

- aucune fusion, aucun déploiement ;
- aucun formulaire soumis, aucun lead créé ;
- aucune mutation Supabase, RLS, auth, paiement, DNS ;
- aucune modification de `monthly_amount` en valeur, seulement en provenance ;
- REQ-036 non engagée : elle vient après, comme ordonné.

## STOP

Je m'arrête pour contrôle. Je ne fusionne pas.
Après validation et fusion de REQ-037, j'enchaîne sur REQ-036 depuis le nouveau `main`, avec
l'objectif `scrollWidth = innerWidth` à 1 px près à 390 — en y incluant les **90 px** de la page
Contrats relevés ci-dessus si vous le souhaitez.
