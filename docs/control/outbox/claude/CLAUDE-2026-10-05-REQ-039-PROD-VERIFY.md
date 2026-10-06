# REQ-20260926-039 — vérifiée sur le domaine public : plus aucune page ne déborde

message_id: CLAUDE-2026-10-05-REQ-039-PROD-VERIFY
repond_a: ordre Florian du 2026-10-05
date: 2026-10-05
verdict: **conforme en production**. Pas de `PROD_VERIFIED` déclaré de ma part.

## Fusion

| | valeur |
| --- | --- |
| commit de fusion | `0f59c7550b45ef69ec804c50a20f130bd1f52144` |
| parents | `3b480fec` (main) + `030b8fb1` (le head exact contrôlé) |
| horodatage | 2026-10-05 13:05:43 +0200 |
| message | « PROD REQ-039 — supprimer les débordements mobiles restants » |

## Le relevé des 117 pages, sur `depan59-62.fr`

Même reproducteur, même méthode qu'avant correctif, attente réseau complète.

| | avant | **en production** |
| --- | --- | --- |
| pages qui débordent à 390 px | **39 sur 117** | **0 sur 117** ✅ |
| erreurs de chargement | 0 | **0** |

Relevé versionné : `docs/qa/REQ-039-prod/releve-390-production.json`.

## Échantillon, une page par cause, sur la production

| page | cause | avant le lot | en production |
| --- | --- | --- | --- |
| `electricien-saint-omer.html` | `.m-proof-col` | 452 px | **0 px** · avis `[44→346]` **défilable**, 3 cartes |
| `depannage-arques.html` | `.hc-labels-grid` | 90 px | **0 px** · 4 cartes labels |
| `a-propos.html` | `.hc-labels-grid` | 213 px | **0 px** · avis `[44→346]` **défilable**, 5 cartes |
| `remplacement-chauffe-eau.html` | `TABLE.rh-table` | 112 px | **0 px** · tableau **défilable**, 5 lignes × 8 colonnes |

## Desktop 1440 : intact en production

| page | hauteur du document avant le lot | en production |
| --- | --- | --- |
| `electricien-saint-omer.html` | 6908 px | **6908 px** |
| `depannage-arques.html` | 5947 px | **5947 px** |
| `a-propos.html` | 9661 px | **9661 px** |
| `remplacement-chauffe-eau.html` | 3615 px | **3615 px** |

Débordement 1440 : 0 px sur les quatre. Les hauteurs de document sont identiques au pixel à ce
qu'elles étaient **avant** le lot : le bornage sous 700 px a bien tenu sa promesse.

## Console

Une seule erreur relevée, **identique avant et après**, sur `a-propos.html` :
`401 GET /rest/v1/stats_publiques`. C'est **REQ-20260926-040**, déjà ouverte, gate Supabase.
Aucune erreur introduite par ce lot.

## Verdict

Plus une seule page publique ne déborde horizontalement à 390 px. `PROD_VERIFIED` à poser par
ChatGPT.

## Suite

J'enchaîne sur le backlog dans l'ordre imposé : 003 → 004 → 006 → 014 → 015 → 018 → 020 → 022 →
027 → 029 → 030 → 032 → 033 → 035 → 040 → 001/013.
