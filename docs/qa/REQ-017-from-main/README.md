# REQ-20260926-017 — preuve tarifaire complète (contrôle n°18)

Branche `feat/req-017-contrats-chauffage-from-main`, partie du `main` courant `5e009e35`.
Head : **`2bc22e92`** · PR #21 (brouillon) · preview
`https://deploy-preview-21--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#entretien`

## Les 8 tarifs canoniques, lus dans le DOM rendu

| onglet | formule | 1440 | 390 |
|---|---|---|---|
| Gaz | BASIC | 9,90 € TTC / mois | 9,90 € TTC / mois |
| Gaz | CONFORT | 14,30 € TTC / mois | 14,30 € TTC / mois |
| Gaz | SÉCURITÉ | 25,30 € TTC / mois | 25,30 € TTC / mois |
| Fioul | BASIC | 13,20 € TTC / mois | 13,20 € TTC / mois |
| Fioul | CONFORT | 17,60 € TTC / mois | 17,60 € TTC / mois |
| Fioul | SÉCURITÉ | 29,70 € TTC / mois | 29,70 € TTC / mois |
| Adoucisseur | Contrat Adoucisseur | à partir de 8,80 € TTC / mois | idem |
| Chauffe-eau | Contrat entretien annuel | **220 € TTC** — « par an, et non par mois » | idem |

## Absence de recouvrement — mesurée bouton par bouton
Chaque bouton « Souscrire » a été amené à l'écran puis interrogé : **qui est au-dessus de son
centre ?** Réponse, pour les 7 boutons et aux deux largeurs : **« le bouton lui-même »**, et
chacun est entièrement dans l'écran.

## Souscription
Ouverte **sur la page**, URL inchangée, tarif repris de la carte : .
**Aucun envoi** : le formulaire n'a pas été soumis.

## Aucun tarif codé en dur
Le placeholder « 13 € HT/mois » de la modale est supprimé (état neutre). Recherche sur le module
entier (JS + CSS), en virgule et en point : **aucun** des huit tarifs n'y figure.

## Fichiers
`tarifs-gaz-*.jpg`, `tarifs-fioul-*.jpg`, `tarifs-adoucisseur-*.jpg`,
`chauffage-contrats-*.jpg`, `souscription-*.jpg` — en 1440 et 390.
