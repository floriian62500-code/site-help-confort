# REQ-20260926-025 — cohérence `communes-list` vs zones réellement desservies

run : 2026-09-26 · branche `recette` · **audit en lecture seule, aucune mutation** · statut : **READY_FOR_CONTROL**
parent : `CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-3`

## SOURCE_OF_TRUTH

La fonction edge **`communes-list`** du projet `btcbjwqiivhpwoszomhg`, appelée en clair par le site
(`verify_jwt = false`). Elle renvoie **221 communes** réparties en quatre zones :

| zone | communes |
|---|---|
| `dunkerque` | 111 |
| `calaisis` | 61 |
| `audomarois` | 44 |
| **`boulonnais`** | **6** |

Le déséquilibre saute aux yeux : le Boulonnais ne contient que six villages
(Boursin, Caffiers, Fiennes, Hardinghen, Hermelinghen, Hocquinghen), tous situés autour de
Marquise — **pas Boulogne-sur-Mer**.

## CONSUMERS

`communes-list` est consommée par **huit pages, et uniquement pour l'affichage** :

| consommateur | usage |
|---|---|
| `zones-intervention.html` | liste des communes par pôle |
| les 7 pages métier de Saint-Omer (plombier, chauffagiste, électricien, serrurier, vitrier, menuisier, travaux) | bloc « zones d'intervention » |

**Le tunnel ne l'appelle pas.** Vérifié : aucune occurrence de `communes-list` dans
`assets/hc-demande.js` ni dans `assets/hc-demande-core.js`.

## ELIGIBILITY_IMPACT — **aucun aujourd'hui**, et voici pourquoi

L'éligibilité de zone du tunnel ne repose pas sur une liste de communes mais sur une **distance** :

```js
var AGENCE = { lat: 50.7508, lon: 2.2522 };
var ZONE_IN_KM = 50, ZONE_EDGE_KM = 70;   // à vol d'oiseau depuis l'agence
zoneFor(lat, lon, cp) → 'in' | 'edge' | 'out'
```

Distances calculées depuis l'agence pour les villes revendiquées :

| ville | distance | verdict du tunnel |
|---|---|---|
| Saint-Omer | 0 km | **in** |
| Aire-sur-la-Lys | 16 km | **in** |
| Hazebrouck | 20 km | **in** |
| Gravelines | 28 km | **in** |
| Dunkerque | 33 km | **in** |
| Calais | 35 km | **in** |
| Bray-Dunes | 41 km | **in** |
| **Boulogne-sur-Mer** | **45 km** | **in** |

**Toutes les villes revendiquées sont dans la zone** selon la règle du tunnel — Boulogne comprise,
à 45 km pour un seuil de 50. Un client de Boulogne qui remplit une demande n'est donc **pas**
refusé aujourd'hui. Le code le savait déjà : le commentaire de la ligne dit *« Boulogne ≈ 45 km »*.

**Le risque est futur, et il est réel.** Le jour où l'achat en ligne vérifiera l'éligibilité — ce
que prévoit la proposition cible — si cette vérification s'appuie sur `communes-list` plutôt que
sur la distance, **un client de Boulogne-sur-Mer serait refusé alors que le site lui promet le
service**. C'est exactement le scénario que redoutait le contrôle.

## MISSING_PUBLICLY_CLAIMED_CITIES

Revendiquées publiquement mais **absentes** de la liste canonique :

| ville | comment elle est revendiquée |
|---|---|
| **Boulogne-sur-Mer** | page dédiée `depannage-boulogne-sur-mer.html` · citée dans le hero de `zones-intervention` · pastille du pôle Boulonnais · citée sur les pages métier |
| **Saint-Pol-sur-Mer** | page dédiée `depannage-saint-pol-sur-mer.html` |
| **Aire-sur-la-Lys** | était affichée en pastille jusqu'au 2026-09-26 (retirée par REQ-023, faute de figurer dans la liste) |

Sur les 12 villes ayant une page dédiée, **2 sont absentes** du canonique. Sur les 30 pastilles de
la page zones, **1 est absente** (Boulogne-sur-Mer, que j'ai gardée volontairement, en le signalant).

## EXTRA_CANONICAL_CITIES

**169 communes sur 221 ne sont citées nulle part sur le site** — ni page, ni pastille, ni texte.
Exemples : Acquin-Westbécourt, Affringues, Bayenghem-lès-Éperlecques, Bléquin, Boisdinghem,
Bouvelinghem, Campagne-lès-Wardrecques, Cléty, Coulomby…

Ce n'est pas un défaut en soi : une liste de couverture peut être plus large que les villes mises
en avant. Mais cela montre que **les deux ensembles ne sont pas tenus par la même main** : le site
met en avant des villes que la liste ignore, et la liste couvre des communes que le site ne
mentionne jamais.

## RECOMMENDED_DATA_FIX

Trois corrections possibles, par ordre de préférence. **Aucune n'est appliquée.**

1. **Compléter la liste** — ajouter Boulogne-sur-Mer, Saint-Pol-sur-Mer, Aire-sur-la-Lys et les
   communes du Boulonnais réellement desservies. Le Boulonnais à six villages sans sa
   sous-préfecture est très probablement une saisie inachevée, pas une décision commerciale.
   *Mutation de données : GO requis.*
2. **Faire dériver l'affichage de la même règle que le tunnel** — une commune est affichée si elle
   est à moins de 50 km de l'agence. Une seule source de vérité, plus de divergence possible.
   *Chantier plus lourd : il faut les coordonnées de chaque commune.*
3. **A minima, une garde** — un contrôle automatique qui échoue si une ville ayant une page dédiée
   ou une pastille n'est pas dans `communes-list`. Ça n'empêche pas l'écart, ça l'empêche de passer
   inaperçu. *Aucune mutation, faisable tout de suite.*

**Ma recommandation : 3 maintenant** (la garde, sans risque), **puis 1 sur ton GO** (compléter la
liste), et garder 2 comme cible si l'achat en ligne se fait.

## NO_MUTATION_PROOF

- **aucune écriture** : la liste a été **lue** par un appel GET à la fonction publique, les
  fichiers du site ont été lus, rien n'a été modifié ;
- aucune migration, aucun déploiement, aucune table touchée ;
- `communes-list`, Supabase et les tables restent inchangées — conformément à la consigne ;
- aucun commit hors `docs/control/` pour ce lot.

## NEXT_ACTION

Décision sur le correctif de données (1, 2 ou 3). Tant que REQ-023 n'est pas validée visuellement
par Florian, rien d'autre n'avance : c'est la règle du contrôle, et REQ-025 était la seule demande
autorisée à progresser puisqu'elle est en lecture seule.
