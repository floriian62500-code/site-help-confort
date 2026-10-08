# PR #59 — audit des promesses : la FAQ recommandait SÉCURITÉ à ceux qui en sont exclus

Base `main` `fb26ecc1`. 4 fichiers. Chaque promesse comparée à `v_contract_offers`, lu en base.

## Le plus grave n'était pas dans votre liste

**La FAQ recommandait la formule SÉCURITÉ exactement aux clients qui ne peuvent pas y souscrire :**

| FAQ | catalogue |
|---|---|
| « la plus rentable pour les chaudières **> 5 ans** » | « Réservée aux chaudières **< 5 ans**, après contrôle technique » |
| « dépannages **illimités** » | rien de tel : `Intervention sous 24h max`, pièces avec exclusions |

La phrase vivait dans le **texte visible et dans les données structurées**. Les deux sont corrigées
— je prends les deux surfaces depuis votre remarque sur le JSON-LD de la FAQ fioul.

## Vos cinq points

| promesse | verdict | catalogue |
|---|---|---|
| « BASIC + dépannage prioritaire » | **faux** | `Dépannages facturés en sus`, `Pièces non incluses` |
| « petites pièces incluses » | **faux** | pièces incluses **seulement** en SÉCURITÉ, avec exclusions |
| « pas de majoration soir/week-end » | **sans source** | absent |
| « 78 % des contrats souscrits » | **sans source** | le catalogue porte `★ Le plus choisi` sur CONFORT — c'est ce que la page dit désormais |
| « sans engagement, résiliation libre » | **faux** | un an, reconduction tacite, résiliation à l'échéance |

Une sixième trouvée en chemin : « Confort = dépannage prioritaire **à tarif préférentiel** ».
CONFORT **inclut** 2 dépannages par an — la formulation sous-vendait l'offre.

## Ce qui n'est pas un défaut, vérifié avant de toucher

**34 pages disent « sans engagement »** : j'ai lu chaque occurrence, elles parlent toutes d'un
**devis** — un devis n'engage personne. Une seule parlait du contrat, c'est celle qui est corrigée.
Je ne touche pas aux 33 autres. De même, « dépannage prioritaire » sur `pro.html` concerne l'offre
professionnelle, pas les formules particuliers.

## La garde avait un angle mort

Elle comparait les noms de formules aux **identifiants** du catalogue (`securite`), pas à son
**libellé** (`SÉCURITÉ`) : une page écrivant le libellé exact passait pour une invention. La
comparaison ignore maintenant les accents. Vérifié qu'elle mord encore : une formule « Platine »
glissée dans une page est attrapée par son nom.

```
prix-contrats 41/0 · contrats 35/0 · intention-unique 25/0 · home-promo 21/0 · header 15/0
```

## Suite

Audit Stripe en lecture seule, puis Nos métiers (REQ-032).
