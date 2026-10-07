# REQ-042 — PROD_VERIFY après la fusion de la PR #40

**Commit prod** `b29bd574599638c27f422dde92f720816b6b88b3` — vérifié sur `depan59-62.fr`.

## Relevé

| contrôle | avant (main 55d372f5) | après (prod b29bd574) |
|---|---|---|
| liens des cartes de `/realisations.html` | 34 × **404** | **34 × 200** |
| chemins au singulier `realisation/<slug>` | 34 | **0** |
| fiches référençant `assets/hc-header.*` (404) | 5 | **0** |
| chantiers publiés sans fiche | 4 | **0** |
| en-tête d'une fiche PR #39 à 390 px | **2889 px**, débordement | **69 px**, pas de débordement |
| hauteur de cette page à 390 px | 5223 px | 2233 px |
| encart saisonnier sur les fiches | absent du gabarit | présent (`?v=1c234e7b33` / `?v=b54f8db069`) |
| métier : serrurerie / parquet / entretien chauffage | — | Serrurerie / Rénovation / Chauffage |

Les 4 fiches qui n'existaient pas répondent 200 : `avant-lhiver-pensez-a-lentretien-de-votre-chauffage`,
`remplacement-dun-chauffe-eau-200l`, `remplacement-dune-menuiserie-bois`,
`reparation-remise-en-etat-dune-porte`.

Pas de débordement horizontal à 1440 ni à 390 (`scrollWidth 390` = `clientWidth 390`,
aucun élément débordant).

Note de méthode : une première mesure à 390 a annoncé un débordement. C'était un artefact —
le cadre n'était pas encore à 390 après un redimensionnement suivi d'une navigation dans le
même lot. Mesure refaite sur un cadre stabilisé : pas de débordement.

## Suite immédiate — PR #42

La cause qui a laissé passer l'en-tête cassé est toujours là : le générateur salit le dépôt
à chaque passage, donc un diff de régénération ne veut rien dire.

- `_redirects` gagnait une ligne vide par exécution — mesuré sur `main` : 5499, 5500, 5501 octets.
- `realisations/index.json` portait un horodatage que personne ne lit.

PR #42 ouverte depuis `b29bd574` : trois exécutions successives laissent désormais l'arbre
**propre**, et `node scripts/tests/realisations.test.mjs` reste à 14 PASS / 9 FAIL — identique
à la référence, c'est un correctif d'outillage.

## Reste ouvert, côté donnée (pas de mon ressort)

1. Le métier est faux **en base** : les cartes lisent la base et affichent encore l'erreur,
   alors que la fiche affiche le bon. Le générateur porte la correction, la base non.
2. « Avant l'hiver, pensez à l'entretien de votre chauffage » est un conseil, pas un chantier :
   à marquer actualité en base, ou à laisser en chantier.
