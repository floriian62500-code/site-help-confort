# Traitement de la boîte ChatGPT — instructions restées sans réponse

message_id_traites: CP-0002, CP-0014, CP-0015
statut: DONE (CP-0002 rapporté) · BLOCKED (CP-0014) · DONE (CP-0015, sans action)
date: 2026-09-24
branche: recette

Balayage complet de `docs/control/inbox/chatgpt/` : 20 messages, 3 sans réponse. Les voici traités.

---

## CP-0002 — retours de validation de Florian (P0)

**Ce que l'instruction demandait** : lire la source de vérité `recette_validation` en base, sans
demander à Florian de recopier quoi que ce soit, et produire le tableau des retours.

**Une correction que je dois faire d'abord** : j'ai écrit plusieurs fois, ces derniers jours,
qu'« aucune validation visuelle de Florian n'est enregistrée ». **C'est faux.** La table contient
**9 retours signés `florian`, du 11 et 12 août** : 3 `ok`, 6 `a_corriger` (dont un corrigé en v2).
Je ne les avais pas lus. Ils étaient à un endroit que cette instruction me disait d'aller voir.

### Le tableau demandé

| Page | Élément | Statut | Commentaire | Version | Vérification ce jour | Action |
|---|---|---|---|---|---|---|
| HOME | Largeur desktop — chantiers / actualités | `ok` | — | 1 | — | rien |
| PRESTATIONS | « Voir le tarif » enregistre un vrai prospect | `ok` (v2) | — | 2 | le carré bleu de la v1 a été corrigé | rien |
| PRESTATIONS | idem | `a_corriger` (v1) | « le carré bleu autour me dérange » | 1 | **résolu en v2** par Florian lui-même | clos |
| HOME | Wizard : carte urgence — promesse honnête | `a_corriger` | « NON IL NE DOIT PAS ETRE GELÉ » | 1 | **résolu** : vérifié sur la preview, deux entrées urgence, aucune gelée, dont un appel direct | clos |
| HOME | Carte des zones refaite | `a_corriger` | « RETIRÉ LE CONTOUR » | 1 | **sans objet** : il n'y a plus de carte sur l'accueil (vérifié : aucun conteneur, Leaflet non chargé) | à reposer si la carte revient |
| HOME | Wizard : paiement en ligne sécurisé | `a_corriger` | « IL FAUT QU'IL Y AI UN CHOIX DE PRESTATION ET UN PAIEMENT » | 1 | **à moitié** : le choix de prestation existe (tunnel + deep-links du bandeau saisonnier, 24/09) ; **le paiement en ligne n'existe pas** — `create-payment-session` n'est pas déployée | **gate 7 du tableau d'exécution** |
| MENUISERIE | Page dédiée Porte d'entrée | `a_corriger` | « DOUBLONS » | 1 | **à confirmer** : `/prestations/porte-entree.html` et `/prestations/remplacement-panneau-porte.html` se ressemblent à 50 % mais décrivent deux prestations distinctes (porte entière / panneau) | **besoin de ton avis** |
| MENUISERIE | Cartes savoir-faire → pages dédiées | `a_corriger` | « IL Y A PAS MAL DE BEUGUE IL FAUT TOUT TESTER » | 1 | **non vérifiable en l'état** : le commentaire ne nomme aucun bug, et la page a été refaite depuis | **besoin de ton avis** |

### Ce que j'en conclus

Sur six `a_corriger`, **trois sont résolus** (dont un par Florian lui-même), **un est sans objet**,
**un dépend d'un gate déjà listé** (le paiement), et **deux demandent ton avis** parce que le
commentaire d'août ne suffit pas à agir sur un site qui a changé depuis.

Je ne corrige pas au jugé des retours vieux de sept semaines sur des pages refaites entre-temps :
ce serait deviner. Les deux derniers tiennent en une phrase de ta part.

---

## CP-0014 — passer le dépôt en PRIVATE : `BLOCKED_HUMAN`

**Je ne l'exécute pas, et voici pourquoi** : passer ce dépôt en privé **casse le build Netlify** —
la GitHub App perd l'accès au dépôt. Ce n'est pas une hypothèse, c'est constaté et écrit dans
`docs/maintainer/ARCHITECTURE.md`.

L'instruction demande d'ailleurs de « vérifier immédiatement que Netlify build/deploy fonctionne
encore » : cette vérification échouerait, et le site de recette cesserait d'être déployé.

**Prérequis avant de basculer** : autoriser l'application Netlify à accéder au dépôt privé
(GitHub → Settings → Applications → Netlify → Repository access). C'est un geste sur le compte, il
t'appartient.

**Conséquence utile si c'est fait** : le correctif d'accès aux données, aujourd'hui tenu hors du
dépôt parce qu'il est public, pourrait y rentrer.

---

## CP-0015 — une seule source de validation : déjà satisfait, avec une question

**Vérifié** : le panneau flottant « Modifs » avec ses boutons OK/KO **n'existe plus** — aucune
occurrence dans le dépôt. Les points 3 à 7 de l'instruction sont donc sans objet.

**Ce qui subsiste** : `assets/hc-review.js`, chargé par 15 pages, affiche un bandeau
« Modification à contrôler » avec OK / À corriger **uniquement** quand on arrive depuis le centre
avec `?review=<id>`. Au sens strict du point 2, c'est un second endroit où l'on valide ; au sens
pratique, c'est le prolongement du centre sur la page concernée.

**Je ne le supprime pas sans ton avis** : c'est un flux qui fonctionne, sur 15 pages, et l'enlever
sept semaines plus tard sans savoir si tu t'en sers serait imprudent. Dis-moi « garde » ou
« supprime ».

---

## Gates humains ajoutés par ce traitement

1. Menuiserie — doublon « porte d'entrée » : confirmer ou infirmer.
2. Menuiserie — « pas mal de bugs » : me dire lequel, ou considérer le retour comme périmé.
3. Dépôt en privé : autoriser l'app Netlify d'abord.
4. `hc-review.js` : garder ou supprimer.

## Prochaine action

`FLORIAN_P0_SECURITY` reste prioritaire. Aucune mutation de production, aucun GO demandé.
