# REQ-20260926-034 — matrice `main` vs `recette` et release verte

message_id: CLAUDE-2026-09-28-REQ-034-RELEASE-VERTE
branche de release: `release/green-2026-09-28` (partie de `main` 48d2f89b)
preview de release: https://deploy-preview-16--remarkable-dragon-364e2b.netlify.app
PR: #16, **brouillon, à ne pas fusionner sans GO**
date: 2026-09-28

---

## LE FAIT QUI COMMANDE TOUT LE RESTE
`main` n'a reçu **aucun travail fonctionnel depuis le 8 août**. Ses 58 commits d'avance sont
**57 rapports d'audit nocturnes et une fusion**, rien d'autre. Vérifié en lisant les 58 sujets.

De l'autre côté, `recette` a **876 commits** d'avance. La base commune remonte au **08/08/2026**.
La production n'est donc pas « un peu en retard » : c'est un **autre site**, plus ancien de sept
semaines.

Conséquence directe sur les candidats : pour plusieurs d'entre eux, **le défaut à corriger n'existe
pas en production**, parce que la fonctionnalité qui le porte n'y existe pas non plus.

---

## 1. MATRICE — par demande candidate

| REQ | objet | existe sur `main` ? | portable ? | décision |
|---|---|---|---|---|
| **007** | retrait du module « parcours » | **oui** — `hc-metier-journey` présent sur les 7 pages | oui, chirurgical | **PORTÉ** |
| **008** | retrait du bloc final contrats | **non** — `ct-final`, « Une question avant de souscrire ? » : 0 occurrence | sans objet | **HORS** |
| **009** | régression `#intervention` | **non** — `catalogue.html` et `assets/hc-demande.*` absents de `main` | sans objet | **HORS** |
| **019** | `_default` visible au catalogue | **oui** — `data-subcat-slug` ×4, `nv-subcat-label` ×3, correctif absent | oui, chirurgical | **PORTÉ** |
| **023** | quatre pôles de zones | page présente mais **ancienne version à deux blocs** | techniquement oui, **mais** | **HORS — décision** |
| **024** | carte grise sans défilement | **oui** — observateur présent, correctif absent | oui, 3 lignes | **PORTÉ** |
| **026** | garde de cohérence des zones | **non** — `main` contient **0 fichier de test** | sans intérêt ici | **HORS** |

### Le cas REQ-023, à trancher par Florian
La section des quatre pôles a été écrite **sur la page de `recette`**, qui a 29 commits d'écart avec
celle de `main`. La porter, ce n'est pas copier un correctif : c'est **réécrire la section sur une
page différente**. Le résultat ne serait pas celui que Florian a validé — donc **sa validation
visuelle ne se transfère pas**. Deux options, et c'est son choix :
1. je réécris la section sur la version `main` et il la **revalide** sur la preview de release ;
2. on la laisse dehors pour cette release.

---

## 2. DÉPENDANCES
Aucune des trois demandes portées n'en entraîne d'autre : `hc-metier-journey` est un bloc
auto-porté (balisage + style dans la même `<section>`), le correctif `_default` est local au script
de `nos-prestations.html`, et celui de la carte tient dans `assets/hc-map-zones.js`. Aucun fichier
partagé, aucun `assets/` versionné à rebumper, aucune fonction edge, aucune migration.

---

## 3. LOTS RÉELLEMENT PORTABLES
Trois, et seulement trois, sans embarquer quoi que ce soit de non validé : **007, 019, 024**.

---

## 4. COMMITS DE PORTAGE — un par lot

| commit | lot | fichiers |
|---|---|---|
| `02511ae5` | REQ-007 | 7 pages métier, −161 lignes |
| `970683a7` | REQ-019 | `nos-prestations.html` |
| `e216ea88` | REQ-024 | `assets/hc-map-zones.js` |

Diff final `release` vs `main` : **9 fichiers, +13 / −163**.

Méthode : le module « parcours » a été retiré **par ancrage sur sa section**, jamais par numéro de
ligne — c'est le piège qui avait déjà corrompu un fichier multi-`<style>` dans ce dépôt. Les deux
autres correctifs ont été réécrits à l'identique sur le contexte de `main`, qui s'y prêtait tel quel.

---

## 5. TESTS ET CI SUR L'ÉTAT EXACT DE RELEASE
**Il n'y a pas de suite de tests sur `main`** : `scripts/tests/` y compte **0 fichier**, et ni
`seo-guardrails`, ni `duplicate-intent`, ni `sync-header` n'y existent. « Rejouer la suite complète
sur l'état exact de release » **n'est pas exécutable** — je le dis plutôt que de prétendre l'avoir
fait. C'est d'ailleurs une raison de plus de ne pas faire vivre la production sur cette branche.

Ce qui **a** été vérifié sur l'état de release :
- syntaxe des deux scripts modifiés (`node --check`) : valide ;
- équilibre des balises sur les 7 pages métier : `<section>` et `<style>` appariés sur chacune ;
- **preuves en ligne sur la preview de release** :
  `hc-metier-journey` → **0 occurrence** sur `/chauffagiste-saint-omer` ·
  `SLUGS_TECHNIQUES` → **présent** sur `/nos-prestations` ·
  `getBoundingClientRect` → **présent** dans `/assets/hc-map-zones.js` ;
- **QA visuelle** : `/zones-intervention` en 1440 — la **carte est peinte sans défilement**, ce qui
  est exactement l'objet de REQ-024 ; `/chauffagiste-saint-omer` en 390 — page intacte, aucun trou
  là où le module a été retiré.

---

## 6. RETOUR ARRIÈRE
Trois commits isolés : `git revert --no-commit <sha> && git commit` annule un lot sans toucher aux
autres. Et tant que la PR #16 n'est pas fusionnée, **la production est strictement inchangée** :
`main` reste à `48d2f89b`.

---

## 7. LISTE FINALE

**IN** — REQ-007, REQ-019, REQ-024.
**OUT sans objet** — REQ-008 (le bloc n'existe pas en prod), REQ-009 (le tunnel n'existe pas en prod).
**OUT sur décision** — REQ-023 (revalidation visuelle nécessaire).
**OUT sans intérêt ici** — REQ-026 (aucun test sur `main`).
**OUT par consigne** — 003, 004, 006, 012, 014, 015, 017, 018, 020, 022, 027, 029, 030, 032, 033 et
tout lot sécurité/paiement.

---

## 8. VERDICT : **BLOCKED**, pour trois raisons nommées

Le portage est fait et prouvé en ligne, mais la release **ne peut pas être déclarée prête** :

1. **aucune preuve automatisée possible** sur cette branche — il n'y a pas de tests sur `main` ;
2. **la validation visuelle de Florian manque** sur la preview de release : les trois lots sont
   visibles, et la règle du projet impose preview + 1440/390 validés par lui, pas par moi ;
3. **`HOLD_SECURITY` reste actif** (REQ-001 / REQ-013), et je ne le contourne pas.

Aucune mise en production n'a été faite, aucune n'est possible sans son GO explicite.

---

## CE QUE JE DOIS DIRE EN PLUS, MÊME SI CE N'ÉTAIT PAS DEMANDÉ
Cette release apporte à la production : un bloc retiré de sept pages, un libellé technique masqué au
catalogue, et une carte qui s'affiche sans défilement. C'est propre, mais c'est **trois correctifs
sur un site figé au 8 août**. Tout ce que Florian valide depuis des semaines — la bannière
d'accueil, la grille Chauffage, le tunnel « Ma demande », le catalogue, les quatre pôles — **n'existe
pas en production** et ne peut pas y arriver par des portages unitaires : ce sont des pages et des
fonctionnalités entières.

La vraie question n'est donc pas « quels lots porter », c'est **quand et comment `recette` devient
la production**. Tant qu'elle n'est pas posée, on continuera de porter des miettes dans un site que
personne ne reconnaîtra. Je ne propose pas de le faire maintenant — c'est une décision de Florian,
et elle demande une recette complète — mais il faut qu'elle soit posée.

## NEXT_ACTION
1. Florian regarde la preview de release et valide, ou non, les trois lots ;
2. il tranche REQ-023 : réécriture + revalidation, ou hors release ;
3. son GO, ensuite seulement, pour fusionner la PR #16 dans `main`.
