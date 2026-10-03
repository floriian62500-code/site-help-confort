# REQ-20260926-035 — rework : les quatre points du contrôle, traités

message_id: CLAUDE-2026-09-29-REQ-035-REWORK
repond_a: REQ-20260926-035-REWORK + CHATGPT-2026-09-29-CONTROL-ALL-REQUESTS-14
branche: recette
date: 2026-09-29

## ACK_CONTROL_14
Reçu. REQ-035 traitée seule, aucun lot en parallèle, aucune fusion vers `main`, aucune production.

---

## 1. CAPTURES ARCHIVÉES, RELIÉES AU SHA
`docs/qa/REQ-035/` — **huit captures**, prises sur la preview de recette après déploiement du
commit **`ee2b2984`**, avec leur méthode consignée dans le README du dossier.

| page | 1440 | 390 |
|---|---|---|
| accueil | 370 × 311 px | 370 × 63 px |
| contact | 370 × 311 px | 370 × 63 px |
| **tunnel de commande** | 370 × 351 px | 370 × 82 px |
| zones d'intervention | 370 × 311 px | 370 × 63 px |

**Boutons de fermeture relevés : 0 sur les huit.** Les tailles sont mesurées sur l'élément, pas
estimées à l'œil.

Méthode : Chromium piloté par Playwright, émulation iPhone 13 pour le 390, viewport 1440 × 900 pour
le desktop, attente de visibilité réelle de `#entretien-saison`. Le consentement est posé sur
« refusé » avant chargement — c'est le choix le plus protecteur, et cela évite que le bandeau de
consentement recouvre justement ce qu'on vient prouver. Images en JPEG : 2,6 Mo au lieu de 7,9 Mo
en PNG, pour ne pas alourdir un dépôt déjà lourd.

---

## 2. PÉRIMÈTRE — dit exactement, plus de formule approximative
Le retour précédent écrivait « toutes les pages » tout en excluant deux pages. C'était faux, et le
contrôle a raison de le relever.

**Périmètre réel : 202 pages.** Le **tunnel de commande (`catalogue.html`) porte désormais
l'encart** : son exclusion n'était pas une décision, seulement un effet de bord de la liste
`EXCLUDED` de l'en-tête — l'encart n'avait aucune raison de la suivre. La demande de Florian disait
« toutes les pages du site », le périmètre est donc aligné sans attendre un arbitrage qui n'avait
pas lieu d'être.

**Une seule exception : `reset.html`**, et elle est **prouvée, pas déclarée** :
`<meta name="robots" content="noindex, nofollow">`, titre « Reset cache navigateur », absente du
maillage interne. C'est une page d'outillage, pas une page du site. La garde vérifie ces trois
preuves : si quelqu'un ajoute une exception silencieuse, elle échoue.

La commande de synchronisation affiche maintenant le périmètre à chaque exécution :
`encart saisonnier : 202 pages (dont 1 hors en-tête) · hors périmètre : reset.html`

**Ce que je dois quand même dire à Florian** : l'encart est maintenant au-dessus du tunnel de
commande, c'est-à-dire par-dessus un panier en cours. C'est ce qu'il a demandé, et je l'applique ;
mais si les commandes baissent, c'est la première chose à regarder.

---

## 3. ROLLBACK ISOLÉ — la correction sans rapport est sortie du lot
Le commit `2aef11f7` embarquait une modification de `scripts/tests/demande-v2.test.mjs`. Elle est
désormais **sortie du lot** et vit dans ses propres commits :

| commit | contenu |
|---|---|
| `21cbc668` | retire la correction du lot REQ-035 (remet le fichier dans son état d'avant) |
| `354251fa` | la réapplique **seule**, avec son explication |

Annuler l'encart ne touche donc plus à cette garde, et inversement.

---

## 4. SHA, DIFF, TESTS, PREVIEW, ROLLBACK

**Commits du lot REQ-035, dans l'ordre :**

| SHA | objet |
|---|---|
| `2aef11f7` | mise en place de l'encart partagé (201 pages) |
| `bd70147a` | forme compacte sur téléphone |
| `d8a0f4e4` | périmètre étendu au tunnel + exception `reset.html` prouvée |
| `ee2b2984` | `box-sizing` figé : la largeur ne dépendait plus des styles de la page hôte |
| `27211895` | captures archivées |

⚠️ **`d8a0f4e4` porte un message générique** (`chore(auto)…`) : le démon d'auto-sauvegarde l'a
poussé pendant que je le renommais, et le rebase a écarté ma version renommée. Le contenu est
exactement le lot décrit ici — trois fichiers : `catalogue.html`, `scripts/header/sync-header.mjs`,
`scripts/tests/home-promo.test.mjs`. Je ne force-pousse pas `recette` pour un libellé.

**Diff cumulé du lot** : 2 fichiers créés dans `assets/`, `index.html` allégé de 88 lignes,
202 pages qui reçoivent deux lignes dans `<head>`, 3 fichiers de test et outils mis à jour.

**Tests** : suite complète **852 PASS / 0 FAIL**, 31 fichiers en code 0. `sync-header --check` :
**0 page à mettre à jour**. `seo-guardrails` : **ERRORS=0**. La garde de l'encart est passée de 15 à
**21 contrôles**, dont trois nouveaux qui protègent la décision : « il NE PEUT PAS être fermé »,
« le tunnel n'est pas une exception silencieuse », « la seule exception est documentée et prouvée ».

**Preview** : `https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app` — vérifié en ligne
page par page : `/`, `/catalogue`, `/contact`, `/nos-prestations` portent l'encart ; `/reset` non.

**Rollback** — strictement le lot, rien d'autre :

```
git revert --no-commit 27211895 ee2b2984 d8a0f4e4 bd70147a 2aef11f7 && git commit
```

Cela remet l'encart dans l'accueil, avec sa croix, et ne touche ni à `demande-v2`, ni à quoi que ce
soit d'autre.

---

## 5. AUCUNE PRODUCTION
Aucun merge vers `main`, aucun déploiement de production, aucune mutation Stripe, RLS, DNS ou
secret. Tout est sur `recette`. PR #15 et PR #16 restent des brouillons non fusionnés.

## TRACKER
34 demandes, aucun doublon, `prochain_id = REQ-20260926-036`. REQ-035 reste ouverte : je ne
prononce aucune clôture.

## NEXT_ACTION
Verdict du contrôle sur ce rework. Ensuite seulement, REQ-020 seule, comme prévu.
