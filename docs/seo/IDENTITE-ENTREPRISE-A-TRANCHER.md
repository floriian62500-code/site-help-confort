# Identité de l'entreprise — sept champs à trancher une fois

> Demandé par 5812637851 §1. **Aucune modification n'est faite** et aucune ne le sera avant ta
> réponse. Ce document ne sert qu'à décider ; le comparatif des deux conventions est à côté
> (`IDENTITE-ENTREPRISE-COMPARATIF.md`).
>
> Une fois ces sept lignes remplies, l'application est mécanique : l'outil existe, il est idempotent,
> et il est déjà contrôlé en CI.

Pour chaque champ : ce que le site dit **aujourd'hui**, et la case à remplir.

| # | Champ | Ce qui est déclaré aujourd'hui | À trancher |
|---|---|---|---|
| 1 | **Nom commercial exact** | **6 valeurs** : « HELP Confort Saint-Omer » (180 nœuds) · « HELP Confort » (6) · « HELP Confort Saint-Omer — SARL Dépan'Audo » (1) · 3 autres | |
| 2 | **Raison sociale** | apparaît une seule fois, accolée au nom commercial (« — SARL Dépan'Audo ») | |
| 3 | **URL publique canonique** | **20 valeurs** : celle de chaque page, au lieu de celle de l'entreprise | |
| 4 | **Email** | 2 : `saint-omer@helpconfort.com` (37) · `dunkerque@helpconfort.com` (1) | |
| 5 | **Téléphone** | 1 seule valeur, `+33366100134` — **déjà cohérent** | rien à trancher |
| 6 | **Logo canonique** | 2 : `logo.svg` (28) · `logo-officiel.jpg` (7) | |
| 7 | **Note et avis** | 2 écritures de la même note ; source affichée : 4,7/5 sur 343 avis Google | source à citer et règle de mise à jour |

## Les questions, en clair

1. **Quel nom** doit apparaître partout : « HELP Confort Saint-Omer » ? Avec ou sans la mention
   « Dépan'Audo » ? C'est ce nom qui s'affichera dans les résultats de recherche.
2. **La raison sociale** doit-elle figurer dans les données structurées, ou rester réservée aux
   mentions légales ?
3. **Quelle URL** représente l'entreprise : `https://depan59-62.fr/` (l'accueil), ou une page
   « agence » ?
4. **Quelle adresse email** est l'adresse de contact publique de l'entreprise ? (Dunkerque est-elle
   un second point de contact, ou une erreur ?)
5. Téléphone : rien à faire.
6. **Quel logo** : le SVG ou le JPEG ? Un seul doit être déclaré.
7. **La note** : on continue d'afficher la note Google, et **qui la met à jour, à quelle fréquence** ?
   Une note figée dans le code vieillit ; c'est la seule des sept lignes qui demande une règle, pas
   seulement une valeur.

## Ce qui se passe après

Une fois les sept lignes arrêtées, je normalise ces champs sur l'ensemble des pages, **puis** — et
seulement alors — l'identité unique (`@id` global) devient applicable sans contradiction. Les deux
étapes sont réversibles et couvertes par la CI.

`GLOBAL_BUSINESS_ID = BLOCKED_HUMAN_DECISION`
