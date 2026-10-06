# REQ-039 — relevé du débordement à 390 px, état avant correctif

`scan-390-complet.mjs` parcourt **les 117 pages publiques** servies par `depan59-62.fr` à
390 px réels, avec attente réseau complète, et isole la cause de chaque débordement par
bissection du DOM (on masque un nœud, on remesure `scrollWidth`).

`scan-390.mjs` est la version rapide : elle sous-compte, elle n'est gardée que pour mémoire.

Relevé du 2026-10-04, après la mise en production de REQ-036 : `releve-390-avant.json`.

| cause | pages | débordement |
| --- | --- | --- |
| `.hcal-wrap` dans `.m-proof-col` (bloc avis Google) | **25** | 452 px |
| `.hc-labels-grid` | **12** (`depannage-*`) | 90 px |
| `.hc-labels-grid` | **1** (`a-propos.html`) | **213 px** |
| `TABLE.rh-table` | **1** (`remplacement-chauffe-eau.html`) | 112 px |
| **total** | **39 sur 117** | |

Aucune erreur de chargement sur les 117 pages. `chauffagiste-saint-omer.html` et
`contrats-entretien.html` **ne figurent plus** dans la liste : c'est la confirmation, par la
même mesure, que le correctif REQ-036 est effectif en production.

Rejouer :

```bash
node docs/qa/REQ-039/scan-390-complet.mjs   # écrit /tmp/scan390-complet.json
```
