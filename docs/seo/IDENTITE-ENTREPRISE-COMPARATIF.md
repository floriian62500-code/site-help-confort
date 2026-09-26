# Identité de l'entreprise dans les données structurées — deux conventions, un choix

> Demandé par 5808233570 §5. **Aucune modification n'est faite.** Ce document compare, il ne tranche
> pas. `GLOBAL_BUSINESS_ID_ARCHITECTURE = WAITING_FLORIAN_DECISION`.

## L'état d'aujourd'hui

Chaque page déclare son établissement avec un identifiant **propre à la page** :
`https://depan59-62.fr/plombier-calais.html#business`. Depuis le 23/09, les nœuds d'une même page
partagent cet identifiant **et** les mêmes valeurs : plus de contradiction interne. Le débat porte
donc uniquement sur ce qui se passe **entre** les pages.

## Les deux conventions

### A — Une identité unique pour toute l'agence

`https://depan59-62.fr/#agence`, partout, sur les 208 pages.

**Ce qu'on y gagne.** Un seul établissement déclaré, donc un signal concentré : les avis, l'adresse,
le téléphone et les zones desservies se rapportent tous à la même entité. C'est ce que décrit la
réalité : HELP Confort Saint-Omer n'a **qu'une adresse physique**, 242 route de Boulogne. C'est aussi
ce que recommandent les guides de données structurées pour un établissement unique.

**Ce qu'on y perd.** Rien de fonctionnel. Mais chaque page cesse de pouvoir décrire « sa » variante
locale : les `areaServed` propres à Calais ou Dunkerque deviennent des attributs de l'entité unique,
donc leur union.

**Ce que ça coûte.** Un préalable, et il est réel : **les pages ne s'accordent pas encore.** Relevé
du 24/09 sur les nœuds établissement :

| Champ | Valeurs distinctes | Exemple d'écart |
|---|---|---|
| `name` | **6** | « HELP Confort Saint-Omer » (180 nœuds) · « HELP Confort » (6) · « … — SARL Dépan'Audo » (1) |
| `url` | **20** | l'URL de chaque page, au lieu de celle de l'entreprise |
| `email` | 2 | `saint-omer@` (37) · `dunkerque@` (1) |
| `logo` | 2 | `logo.svg` (28) · `logo-officiel.jpg` (7) |
| `aggregateRating` | 2 | deux écritures de la même note |

Donner le même identifiant à des nœuds qui affirment six noms différents, c'est recréer la
contradiction qu'on vient d'effacer — en pire, puisqu'elle serait à l'échelle du site.
**Il faut donc normaliser ces cinq champs d'abord**, et c'est une décision de contenu : quel nom
officiel, quelle adresse email, quel logo.

**Risque** : moyen, entièrement porté par le préalable. Une fois les champs normalisés, le passage
lui-même est mécanique et réversible (le script existe déjà).

### B — Garder une identité par page

`…/plombier-calais.html#business`, comme aujourd'hui.

**Ce qu'on y gagne.** Rien à décider, rien à normaliser, aucun risque. Chaque page reste autonome,
et une page qui se trompe n'entraîne pas les autres.

**Ce qu'on y perd.** Le site déclare, pour un établissement réel, **autant d'établissements que de
pages**. Les signaux (avis, notoriété, zones) se répartissent entre des entités qu'un moteur n'a
aucune raison de rapprocher, puisqu'elles portent des identifiants différents.

**Ce que ça coûte.** Rien à court terme. À long terme, un plafond : on ne consolide jamais.

**Risque** : nul techniquement. C'est l'inaction.

## Comparatif

| | A — identité unique | B — identité par page |
|---|---|---|
| Fidélité au réel (une seule adresse) | **oui** | non |
| Consolidation des signaux | **oui** | non |
| Préalable | normaliser 5 champs (décision de contenu) | aucun |
| Effort technique | faible : le script existe, il est idempotent | nul |
| Risque si mal fait | contradiction à l'échelle du site | — |
| Réversible | oui, en une exécution | — |
| Maintenance | une seule description à tenir | une par page, qui dérive (6 noms aujourd'hui) |

## Ma recommandation, si elle t'est utile

**A, mais pas tout de suite** : d'abord trancher les cinq champs (nom officiel, URL de l'entreprise,
email, logo, note), puis appliquer — l'outil est déjà écrit et testé. Tant que ces cinq choix ne sont
pas faits, **B est le bon état**, et c'est celui dans lequel le site se trouve.

Ce qu'il ne faut pas faire, c'est passer à A en laissant les six noms : ce serait la même erreur que
celle du 23/09, à plus grande échelle.
