# Scripts « one-shot » archivés

Ces 54 scripts ont servi **une fois** à transformer le site en masse (ajout d'un bloc sur toutes les
pages, refonte d'un gabarit, import d'images, minification…). Ils sont conservés pour comprendre
l'histoire du dépôt, **pas pour être relancés**.

## Avant d'en exécuter un

1. Lire le script en entier : la plupart **réécrivent des dizaines de pages** sans confirmation.
2. Vérifier qu'il correspond encore à la structure actuelle des pages (elle a changé).
3. Travailler sur une copie, ou committer avant, pour pouvoir revenir en arrière.

## Cas connu : la minification des styles

Le 2026-05-15, le commit `3e50ad42` (auto-push, sans message) a minifié les styles inline de plus de
40 pages et **perdu les espaces des sélecteurs descendants** : `.a .b` est devenu `.a.b`, donc plus
aucune de ces règles ne s'appliquait (boutons en texte brut, cartes sans style). 1 901 sélecteurs ont
été rétablis le 2026-09-20.

`minify-inline-styles.py`, dans sa version actuelle, **ne reproduit pas** ce défaut (vérifié) : l'outil
exact reste inconnu. Le garde-fou est désormais dans la QA :

```bash
node scripts/seo/fix-compound-selectors.mjs --check   # doit sortir 0
```

À lancer **après toute minification** ou transformation de masse des styles.
