# REQ-20260926-019 — preuve : aucun slug technique visible sur le catalogue public

run : 2026-09-26 · branche `recette` · aucune mise en production · statut : **READY_FOR_CONTROL**
correctif : `15c46539` · rapport de preuve demandé par `CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-1` §REQ-019

## ROOT_CAUSE (rappel)

`_default` n'est pas une catégorie : c'est le slug de repli du code pour une prestation sans
sous-catégorie métier. Ce groupe n'a pas de nom, donc aucun en-tête n'est rendu, et la
construction des pastilles se terminait par « à défaut d'en-tête, affiche le slug ». Le client
lisait le nom d'une variable interne.

## Correctif

Le libellé vient de l'en-tête ; à défaut, c'est **« Autres prestations »** ; **jamais** le slug.
Les quatre formes techniques sont couvertes — `_default`, `default`, `null`, `undefined` — et pas
seulement celle qui avait été vue.

## PREUVE — audit des 7 familles, sur la preview déployée

Chaque famille a été ouverte et ses pastilles de sous-filtre relevées.

| famille | sous-filtres affichés | slug technique |
|---|---|---|
| Toutes les prestations (34) | *(pas de sous-filtre)* | — |
| **Plomberie & Sanitaires (15)** | Tous 15 · ♨️ Chauffe-eau & ECS 7 · **Autres prestations 1** · 🚽 Sanitaire & WC 5 · 🔍 Diagnostic & recherche 1 · 🚿 Débouchage canalisations 1 | **aucun** |
| Chauffage (6) | Tous 6 · 🔧 Entretien & dépannage 5 · 🚽 Sanitaire & WC 1 | aucun |
| Électricité (2) | *(pas de sous-filtre)* | — |
| **Serrurerie (5)** | Tous 5 · **Autres prestations 1** · 🔓 Ouverture de porte 4 | **aucun** |
| Vitrerie (2) | *(pas de sous-filtre)* | — |
| Rénovation (4) | *(pas de sous-filtre)* | — |

**Le défaut touchait deux familles, pas une.** Plomberie était celle de la capture ; **Serrurerie**
avait le même groupe sans nom. Les deux affichent maintenant « Autres prestations ».

## PREUVE — texte de la page

Balayage du texte visible de la page (`innerText`, 7 600 caractères), recherche des motifs
`_default`, `undefined`, `null`, `NaN` comme mots isolés : **0 occurrence**.

Contrôle automatique permanent (`scripts/tests/catalogue-public.test.mjs`, **6 contrôles**) :

1. le libellé d'un sous-filtre vient de l'en-tête, jamais du slug ;
2. une prestation sans sous-catégorie métier s'affiche « Autres prestations » ;
3. les quatre slugs techniques sont couverts ;
4. au niveau des familles aussi, `_default` s'affiche « Autres prestations » ;
5. aucun slug technique dans le texte statique de la page ;
6. les familles sont lues dans la base, pas codées en dur.

Rejoué contre la version d'avant le correctif : les contrôles 1 et 2 échouent.

## SCREENSHOTS_1440_390

- **1440** — barre de familles puis barre de sous-filtres de Plomberie : « Tous 15 · ♨️ Chauffe-eau
  & ECS 7 · Autres prestations 1 · 🚽 Sanitaire & WC 5 · 🔍 Diagnostic & recherche 1 · 🚿 Débouchage
  canalisations 1 ». Aucun `_default` ;
- **390** — mêmes pastilles réparties sur quatre lignes, lisibles, **0 débordement horizontal** ;
  la première carte affichée est « Contrat entretien chauffe-eau annuel ».

Captures prises pendant la vérification, non versées au dépôt : il est public.

## TESTS

Suite complète au moment du correctif : **791 contrôles, 0 échec**, SEO `ERRORS=0`.

## SHA · PREVIEW · ROLLBACK

- **SHA** : `15c46539` (un seul commit, isolé).
- **PREVIEW** : https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/nos-prestations —
  cliquer « Plomberie & Sanitaires », puis « Serrurerie ». Forcer le rechargement.
- **ROLLBACK** : `git revert --no-commit 15c46539 && git commit`. Le contrôle permanent échouerait
  alors, ce qui est le but.

## NO_PROD_MUTATION_PROOF

- un seul fichier de page modifié (`nos-prestations.html`) et un fichier de test ajouté ;
- **0** fichier sous `supabase/`, `assets/`, `.github/`, `netlify.toml`, `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify ; seul déploiement : la deploy preview de `recette` ;
- `origin/main` toujours sur `570225bf` (2026-09-25).

## NEXT_ACTION

Contrôle ChatGPT. Je ne marque pas CLOSED.
