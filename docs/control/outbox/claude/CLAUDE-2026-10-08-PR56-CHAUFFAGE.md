# Chantier Chauffage — PR #56

Base `main` `fd47aca3`. Quatre commits, 7 fichiers.

D'abord : merci pour l'amende de 450 €. Je corrigeais les tarifs de cette page en suivant une garde
qui ne parle que de prix, et je n'ai pas lu ce qu'elle affirmait par ailleurs. **Une suite de tests
cadre ce qu'elle sait vérifier, pas ce que la page affirme** — je le note pour les pages suivantes.

## Le teaser contrats manquait sur les quatre pages chauffagiste

Aucune ne l'avait. **Trois d'entre elles recopiaient le comparatif détaillé de la page contrats** —
six cartes et leurs garanties, entretenues à deux endroits, donc divergentes à la première
modification. Les cartes sont retirées (7 087 caractères par page) et remplacées par le teaser :
trois formules nommées, un seul chiffre (le prix d'entrée du catalogue), un lien vers la page qui
détaille.

Le bouton « Voir nos prestations chauffage avec prix » visait un chemin **relatif** : il est
désormais absolu.

## Deux pages affichaient encore les contrats en HT

`faq.html` et `guide-entretien-chaudiere.html`, à un particulier :

| | BASIC | CONFORT | SÉCURITÉ |
|---|---|---|---|
| gaz, avant | 9 € HT | 13 € HT | 23 € HT |
| gaz, après | **9,90 € TTC** | **14,30 € TTC** | **25,30 € TTC** |
| fioul, avant | 12 € | 16 € | 27 € HT |
| fioul, après | **13,20 € TTC** | **17,60 € TTC** | **29,70 € TTC** |

Mêmes montants que le catalogue, exprimés autrement.

## Preuves

```
prix-contrats      13 PASS / 28 FAIL  ->  41 PASS / 0 FAIL
intention-unique   14 PASS / 11 FAIL  ->  24 PASS / 1 FAIL
28 autres suites   inchangées
```

Trois assertions d'`intention-unique` suivaient encore l'encart d'avant la PR #48. Elles vérifient
maintenant que **chaque destination existe vraiment** : la page, et l'ancre quand il y en a une.

Au passage, le bloc de styles du teaser cassait l'idempotence du synchroniseur d'en-tête :
resynchronisé, `header` repasse de 14/1 à 15/0.

## Un point bloqué

`intention-unique` garde un échec : il demande que `entretien-chaudiere.html` **n'existe pas**.
La page est dans le dépôt. **Supprimer une page sort de mon périmètre** — c'est une décision, et
elle a des effets SEO (liens entrants, position acquise). Signalée, pas touchée.

## Suite

`contrats` est à 8/27 : l'expérience de **la page contrats elle-même** — Gaz / Fioul / Adoucisseur,
BASIC / CONFORT / SÉCURITÉ, chauffe-eau séparé. J'enchaîne.
