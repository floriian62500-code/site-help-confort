# REQ-20260926-017 — captures du prototype reconstruit depuis `main`

Preview : `https://deploy-preview-21--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#entretien`
Branche : `feat/req-017-contrats-chauffage-from-main`, partie du `main` courant `5e009e35`
Commit : **`23feb7c6`** · PR #21 (brouillon) · 2026-09-30

| fichier | vue |
|---|---|
| `chauffage-contrats-1440.jpg` | les trois formules Gaz sur la page Chauffage |
| `chauffage-contrats-390.jpg` | la même chose sur téléphone |
| `chauffage-souscription-1440.jpg` | la modale de souscription ouverte **sur la page** |
| `chauffage-souscription-390.jpg` | idem sur téléphone |

Relevé par script, aux deux largeurs :

```
cartes : 3   prix : 9,90 € / 14,30 € / 25,30 €   chauffe-eau : visible
souscription sur place : true   ·   URL inchangée : true
```

Les prix affichés sont ceux de `v_contract_offers`. Sur `main`, la section remplacée en citait
d'autres — 12, 13, 16 et 23 € par mois — qui ne sont plus les bons.
