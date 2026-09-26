# Boutons « prestations avec prix » — réponse à CHATGPT-2026-09-26-P0-CTA-PRESTATIONS-ROUTING

run : 2026-09-26 · branche `recette` · aucune mise en production · statut : **READY_FOR_CONTROL**

## ROOT_CAUSE

Deux mots désignaient la même chose sans être la même chose : **catalogue**.

`/catalogue` est le **tunnel de demande** — le module « Votre demande », six étapes, qui s'ouvre
sur « Où devons-nous intervenir ? ». Le **catalogue public**, celui qui affiche les prestations et
leurs prix, est `/nos-prestations.html`. Les deux se ressemblent dans le langage courant, pas dans
l'usage.

Le bouton de bas de section des pages métier, lui, a toujours dit « Voir nos prestations … **avec
prix** » et pointé vers `/catalogue#cat=<métier>`. Le résultat est celui de la capture : le tunnel
s'ouvre à l'étape Lieu (`#step=lieu&cat=chauffage` — le module réécrit l'URL en arrivant), et le
visiteur qui voulait consulter des tarifs se retrouve devant un formulaire d'adresse.

Ce n'est pas un accident isolé : le bouton a été décliné sur chaque métier, donc le défaut aussi.

## CTA_AUDIT_TABLE

Audit de **tous** les liens vers le tunnel sur les **44 pages métier** (les neuf familles
demandées : plomberie, chauffage, électricité, serrurerie, vitrerie, menuiserie, travaux, volets,
PMR). Règle appliquée : un libellé de **consultation** (voir, consulter, découvrir, nos
prestations, avec prix, tarifs) sans verbe de **demande** (demander, devis, intervention,
dépannage, être rappelé, urgence) doit mener à une vue de consultation.

| famille | bouton | ancienne cible | verdict | nouvelle cible |
|---|---|---|---|---|
| Chauffage (4 pages) | Voir nos prestations chauffage avec prix | `/catalogue#cat=chauffage` | **tunnel** ✗ | `/nos-prestations.html#sec-chauffage` |
| Plomberie (4) | … plomberie avec prix | `/catalogue#cat=plomberie` | **tunnel** ✗ | `#sec-plomberie` |
| Électricité (4) | … électricité avec prix | `/catalogue#cat=electricite` | **tunnel** ✗ | `#sec-electricite` |
| Serrurerie (4) | … serrurerie avec prix | `/catalogue#cat=serrurerie` | **tunnel** ✗ | `#sec-serrurerie` |
| Vitrerie (2) | … vitrerie avec prix | `/catalogue#cat=vitrerie` | **tunnel** ✗ | `#sec-vitrerie` |
| Menuiserie (2) | … menuiserie avec prix | `/catalogue#cat=renovation` | **tunnel** ✗ | `#sec-renovation` |
| Travaux (2) | … travaux & rénovation avec prix | `/catalogue#cat=renovation` | **tunnel** ✗ | `#sec-renovation` |
| Volets (2) | … volets & stores avec prix | `/catalogue#cat=renovation` | **tunnel** ✗ | `#sec-renovation` |
| PMR (2) | … adaptation PMR avec prix | `/catalogue#cat=renovation` | **tunnel** ✗ | `#sec-renovation` |
| toutes | Demander une intervention · Être rappelé · Devis express | `/catalogue…` | **tunnel assumé** ✓ | inchangé |
| toutes | cartes savoir-faire (Chaudière, Dépannage…) | pages prestations | consultation ✓ | inchangé |

**26 liens vers le tunnel** trouvés sur les pages métier, dont **22 portaient un libellé de
consultation**. Les 4 restants disent ce qu'ils font (« demander », « être rappelé ») : ils
restent au tunnel, c'est leur rôle.

Le total des boutons de consultation sur ces pages est de **234** : les 212 autres pointaient déjà
vers du contenu (pages prestations, zones, réalisations). Le défaut était concentré sur ce seul
bouton, décliné neuf fois.

## WRONG_TARGET

`/catalogue#cat=<slug>` → le module de demande réécrit l'URL en `/catalogue#step=lieu&cat=<slug>`
et affiche l'étape 1 sur 6. Aucune prestation, aucun prix : un formulaire.

## FIXED_TARGET

`/nos-prestations.html#sec-<slug>` → la page catalogue public, **filtrée sur le métier**. L'ancre
`#sec-<slug>` n'est pas inventée pour l'occasion : cette page la lit déjà au chargement pour
activer le filtre correspondant et y défiler.

Les slugs viennent du catalogue lui-même, pas d'une supposition — `chauffage`, `electricite`,
`plomberie`, `renovation`, `serrurerie`, `vitrerie` — et chaque page conserve celui qu'elle
utilisait déjà dans son lien.

## FILES_CHANGED

22 pages métier (4 chauffagiste + 4 plombier + 4 électricien + 4 serrurier + 2 vitrier +
2 menuisier + 2 travaux + 2 volets + 2 PMR — 26 au total, dont les 4 chauffagiste corrigées au
commit précédent `330210c9`), et `scripts/tests/pages-metier.test.mjs`.

## TESTS

Le contrôle exigé est en place et permanent :

> **aucun bouton de consultation n'ouvre le tunnel** — sur les 44 pages métier, aucun des
> 234 liens au libellé de consultation ne doit viser `/catalogue` (page ou fenêtre) ni une ancre
> d'étape `#step=`.

Il est **sensible** : rejoué contre l'état d'avant (worktree détaché sur `59ab1bc1`), il échoue et
nomme les 22 boutons fautifs, un par un, avec leur page et leur cible.

Suite complète : **784 contrôles, 0 échec**, SEO `ERRORS=0`, en-tête et inventaire stricts verts.

## SCREENSHOTS

Sur la page servie, le bouton porte bien `href="/nos-prestations#sec-chauffage"` (Netlify sert les
URL sans `.html`) — lu dans le DOM de la preview après déploiement. La capture du constat montrait
l'ancien lien : la page HTML était en cache côté navigateur.

## SHA

`0f09e466` sur `recette` (les 4 pages chauffagiste l'étaient déjà par `330210c9`).

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer

Puis le bouton « Voir nos prestations chauffage avec prix » en bas de la section savoir-faire.
Forcer le rechargement.

## ROLLBACK

```
git revert --no-commit 0f09e466 330210c9 && git commit
```

Le retour arrière ferait échouer le contrôle de routage : c'est voulu.

## NO_PROD_MUTATION_PROOF

- commits présents sur `recette` uniquement ; `origin/main` toujours sur `570225bf` (2026-09-25) ;
- fichiers touchés : 26 pages HTML et 1 fichier de test. **0** fichier sous `supabase/`,
  `assets/`, `.github/`, `netlify.toml`, `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify ; seul déploiement : la deploy preview de `recette` ;
- aucun formulaire soumis pendant la vérification.
