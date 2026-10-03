# REQ-20260926-023 — quatre pôles d'intervention visibles

run : 2026-09-26 · branche `recette` · aucune mise en production · statut : **READY_FOR_CONTROL**
SHA : `4af89736` — **un seul commit, une seule REQ**

## BEFORE — mesuré sur la preview

| | |
|---|---|
| blocs affichés | **2** |
| titres | « Saint-Omer & Audomarois » (Dépan'Audo) · « Dunkerque & littoral » (Dunkerque) |
| pastilles de communes | 9 et 8 |
| titre de section | « Une agence, toute la Côte d'Opale » |
| Calais et Boulogne | **cités dans le texte et dans les pastilles seulement** |

## AFTER — mesuré sur la preview

| carte | statut affiché | pastilles |
|---|---|---|
| **Saint-Omer & Audomarois** | **Agence Dépan'Audo** | 8 |
| **Dunkerque & Littoral** | **Pôle d'intervention** | 8 |
| **Calais & Calaisis** | **Pôle d'intervention** | 7 |
| **Boulogne-sur-Mer & Boulonnais** | **Pôle d'intervention** | 7 |

Titre de section : **« Nos zones d'intervention, 4 pôles sur la Côte d'Opale »**.

| | **1440 × 900** | **390 × 844** |
|---|---|---|
| grille | `541px 541px` — **2 × 2** | `350px` — **une colonne, 4 cartes empilées** |
| position des cartes | (163, 1261) · (722, 1261) · (163, 1610) · (722, 1610) | x = 20 pour les quatre |
| hauteurs | 331 · 331 · 293 · 293 | — |
| débordement horizontal | **0** | **0** |

Aucune règle CSS nouvelle : la grille existante passe déjà en deux colonnes au-dessus de 800 px.

## Contraintes tenues

- **Calais et Boulogne ne sont pas présentées comme des agences.** Les trois cartes autres que
  Saint-Omer portent le libellé « Pôle d'intervention », et le chapô le dit en toutes lettres :
  « Dunkerque, Calais et Boulogne-sur-Mer sont des zones desservies, pas des agences : vous avez
  toujours le même interlocuteur, à Saint-Omer. »
- **Dunkerque n'est ni « agence » ni « antenne ».** Une seule agence est prouvée par ce dépôt —
  Saint-Omer (Dépan'Audo), adresse et horaires dans les mentions légales. Je n'écris pas ce que je
  ne peux pas prouver.
- **Formulation demandée** : « Nos zones d'intervention » **et** « 4 pôles », les deux dans le
  titre.
- **Chaque bloc est visible immédiatement** : quatre cartes de même largeur, même style, même poids
  visuel ; le statut est porté par le sous-titre, pas par la taille.

## Deux écarts de données que je signale au lieu de les masquer

Les communes des pastilles ne sont plus recopiées à la main : elles viennent de la **liste
canonique** servie par la fonction `communes-list` — audomarois 44, dunkerque 111, calaisis 61,
**boulonnais 6**.

1. **« Aire-sur-la-Lys »**, affichée jusqu'ici dans la carte Saint-Omer, **ne figure pas** dans
   cette liste. Elle disparaît donc des pastilles.
2. **« Boulogne-sur-Mer » non plus.** Le pôle Boulonnais de la liste ne contient que six villages
   (Boursin, Caffiers, Fiennes, Hardinghen, Hermelinghen, Hocquinghen). Je garde malgré tout
   Boulogne-sur-Mer en tête de la carte, parce que le site la revendique déjà — le hero l'annonce
   et une page `depannage-boulogne-sur-mer.html` lui est consacrée.

**Ce qu'il faut corriger, c'est la liste des communes, pas la page.** Si Boulogne-sur-Mer et
Aire-sur-la-Lys sont bien desservies, elles doivent entrer dans `communes-list` ; sinon, c'est la
promesse du hero qu'il faut revoir. **Décision Florian.**

## FILES_CHANGED

`zones-intervention.html` — un seul fichier.

## TESTS

Suite complète : **791 contrôles, 0 échec**. SEO `ERRORS=0`. En-tête unique vert.

## SCREENSHOTS_1440_390

- **1440** — les quatre cartes en 2 × 2, chacune avec sa pastille de couleur, son titre, son statut
  (« Agence Dépan'Audo » puis trois « Pôle d'intervention »), son texte et ses communes ;
- **390** — chapô puis les quatre cartes empilées, 350 px de large, 0 débordement.

Captures prises pendant la vérification, non versées au dépôt : il est public.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/zones-intervention

Forcer le rechargement (`Cmd+Shift+R`).

## ROLLBACK

```
git revert --no-commit 4af89736 && git commit
```

Aucun asset versionné touché : rien à rebumper.

## NO_PROD_MUTATION_PROOF

- un commit sur `recette` ; `origin/main` toujours sur `570225bf` (2026-09-25) ;
- **un seul fichier HTML** modifié. 0 fichier sous `supabase/`, `assets/`, `.github/`,
  `netlify.toml`, `_redirects` ;
- la liste des communes a été **lue** (fonction publique `communes-list`) : aucune écriture ;
- aucun formulaire soumis.

## NEXT_ACTION

Contrôle visuel de Florian. Puis REQ-020 (cartes à deux actions), dans un commit séparé.
Je ne marque pas CLOSED.
