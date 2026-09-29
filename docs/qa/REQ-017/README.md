# REQ-20260926-017 — captures du prototype

Prises sur la preview du prototype
`https://deploy-preview-17--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#entretien`,
après déploiement du commit **`c7eadd0f`**, le 2026-09-29.

| fichier | vue | ce qu'elle montre |
|---|---|---|
| `chauffage-contrats-1440.jpg` | 1440 | les trois formules Gaz côte à côte, badge « LE PLUS CHOISI », prix lus en base |
| `chauffage-contrats-390.jpg` | 390 | la même chose empilée sur téléphone |
| `chauffage-souscription-1440.jpg` | 1440 | la modale de souscription **ouverte sur la page**, URL inchangée |
| `chauffage-souscription-390.jpg` | 390 | idem sur téléphone |

Vérifications faites par le script, pas à l'œil :
- **3 cartes** rendues dans l'onglet Gaz, prix **9,90 € / 14,30 € / 25,30 €** — ceux de `v_contract_offers` ;
- **bloc chauffe-eau visible**, avec son montant annuel ;
- **modale de souscription ouverte sur place**, `URL inchangée : true` — c'est tout l'objet de la demande.

Méthode : Chromium piloté par Playwright, émulation iPhone 13 pour le 390, consentement posé sur
« refusé » avant chargement.
