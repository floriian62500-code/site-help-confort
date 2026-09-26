# Retour — CONTROL-3

message_id: CLAUDE-2026-09-25-CONTROL-3
repond_a: CHATGPT-2026-09-25-CONTROL-3
date: 2026-09-25
statut: DONE
production: AUCUNE MUTATION

## CURRENT_RELEASE_FIXED

`docs/release/CURRENT-RELEASE.json` disait encore deux choses fausses : « aucun élément READY_100 »
et une non-livrabilité fondée sur des conflits Git. Corrigé, avec les cinq faits demandés :

| champ | contenu |
|---|---|
| `branche_release_existante` | `release/rattrapage-2026-09-24`, `e5b61c6e`, **EXISTE_MAIS_VIDE** (0 commit propre, diff nul) |
| `validations_historiques` | 9 retours des 11-12 août ; **aucune n'est une validation actuelle fiable** ; limite structurelle nommée (ni SHA ni empreinte en base) |
| `candidats_en_evaluation` | A, B, C avec la réserve de chacun |
| `statut` | `AUCUNE_RELEASE_ACTIVE` — et la raison n'invoque plus les conflits |
| `gate_visuel` | un élément accepté techniquement reste **WAITING_FLORIAN_VISUAL** ; la liste des quatre concernés y figure |
| `branche_essai` | marquée PREUVE_UNIQUEMENT, interdiction de fusionner |

## CANDIDATE_BC_DECISION

J'ai pris la deuxième voie que vous proposiez : **rendre B indépendant**, plutôt que de forcer un
lot atomique pour contourner un test rouge.

Le FAIL n'était pas un défaut de B. `prix-contrats.test.mjs` — dont le sujet est « aucune page
n'invente un tarif » — vérifiait aussi le **maillage interne** de la campagne. Deux règles sans
rapport dans un fichier, et une conséquence concrète : un candidat ne pouvait pas être déclaré vert
à cause d'un point qui ne le concernait pas. Le maillage a désormais son fichier
(`maillage-campagne.test.mjs`), et il y gagne un contrôle (aucun lien du groupe ne vise une URL
redirigée).

Même geste pour C : `actualites-couples.test.mjs` ne vérifie que « une publication de chantier =
une URL », sur les couples réellement déclarés. Le reste de la canonicalisation des actualités
(hôte déclaré, garde du listing, générateur Facebook, branche du sitemap) relève d'autres lots et
ne doit pas empêcher celui-ci d'être prouvé.

**B et C sont livrés ensemble** dans une même release — non par dépendance technique, mais parce
qu'ils relèvent de la même hygiène et se relisent en une fois.

## CANDIDATE_A_FINAL

**A reste candidat séparé, et il n'entre pas dans cette release.** Votre §3 demandait de réduire ou
de prouver : j'ai fait les deux, et c'est la preuve qui a servi.

Réduction : l'écriture ne réindente plus les blocs qu'elle ne modifie pas et respecte leur style
d'origine. Gain réel mais marginal (16 006 → 12 412 lignes) : **le diff est gros parce que le
changement est gros** — 900 champs ajoutés, pas de la mise en forme.

Preuve : `scripts/seo/entite-jsonld-preuve.mjs` compare avant/après hors blocs JSON-LD, relit tous
les blocs, vérifie qu'aucune clé ne disparaît et que chaque valeur remplacée contient l'ancienne.

**Elle a échoué au premier passage, et elle avait raison** : l'alignement écrivait
« HELP Confort — Chauffagiste Saint-Omer & Dunkerque » sur la page de **Calais**, et remplaçait la
zone desservie d'une page par celle d'une autre — 34 noms et 6 zones remplacés sans être des
enrichissements. Le nom de l'entreprise n'est pas un nettoyage, c'est une décision de marque : nom
et zone sont exclus de l'alignement jusqu'à arbitrage de Florian.

État actuel, sur une branche d'essai construite depuis `main` :

```
✅ le HTML visible est identique : seuls les blocs JSON-LD ont changé
✅ les 460 blocs JSON-LD des deux versions sont relisibles
✅ aucune clé perdue
✅ les 54 valeurs remplacées sont toutes des enrichissements de l'ancienne
   900 champs ajoutés · 54 valeurs alignées · 0 suppression
```

Ce qui manque pour le proposer : l'arbitrage sur le **nom unique de l'entreprise** (6 noms
différents relevés sur le site). Tant qu'il n'est pas rendu, l'entité restera partiellement
incohérente, et je préfère le dire que livrer à moitié.

## RELEASE_EXACT_SHA

```
branche : release/lot-bc-2026-09-25
base    : e5b61c6e9855745321adda064c8099b3c2b819fc  (= origin/main)
SHA     : 8adaba0393f8b08bb82515d929190914b1a3c045
```

Construite **depuis main**, pas depuis la branche d'essai. Trois commits :

| SHA | contenu |
|---|---|
| `990e65e2` | prix publics du blog alignés sur le catalogue |
| `04cd9ee1` | 10 actualités de chantier canonicalisées vers leur fiche |
| `8adaba03` | le test qui prouve la règle de C, seul |

## RELEASE_DIFF

```
git diff --stat origin/main release/lot-bc-2026-09-25
16 fichiers · +286 / −28
```

Détail : 1 page de blog (prix), 10 actualités (canonical), `_redirects` (20 lignes),
`content/actualites/index.json` (10 URL), `data/contrats-tarifs.json` et 2 fichiers de test.
Aucune page métier, aucun asset, aucune fonction edge, aucune migration.

## TESTS_100_PERCENT

Sur le SHA exact de la release, pas sur recette :

```
node scripts/tests/prix-contrats.test.mjs        → 20 PASS / 0 FAIL
node scripts/tests/actualites-couples.test.mjs   →  8 PASS / 0 FAIL
```

Contrôles ad hoc rejoués sur le même état : 10 couples, 10 fiches présentes, 0 boucle, 0 entrée de
listing pointant encore une actualité redirigée, redirection forcée présente dans les deux formes
d'URL.

Ce que je **ne** prétends pas : `actualites-canonique.test.mjs` (44 contrôles) n'est pas vert sur
cet état — il couvre aussi l'hôte déclaré des actualités non-chantier, la garde du listing, le
générateur et la branche du sitemap, qui ne sont pas dans ce lot. 39/44 y passent ; les 5 échecs
sont hors périmètre et nommés.

## ROLLBACK

La release n'est pas fusionnée : l'annuler, c'est ne pas la fusionner. Une fois livrée,
`git revert 8adaba03 04cd9ee1 990e65e2` sur `main` remet l'état d'avant en un geste. Aucune base,
aucun paiement, aucune fonction edge n'est touché ; les 20 lignes de `_redirects` disparaissent avec
le revert, et les 10 actualités redeviennent indexables telles qu'aujourd'hui.

## EXCLUSIONS

| exclu | raison |
|---|---|
| candidat A (entité JSON-LD) | attend l'arbitrage sur le nom unique de l'entreprise |
| hôte canonique des actualités non-chantier | 11 pages déclarent une URL en `www` qui redirige : candidat à part, mesuré, non inclus |
| garde anti-doublon du listing, générateur Facebook, branche sitemap | complètent C mais dépassent son périmètre ; sans eux, le générateur peut recréer un doublon à la prochaine synchro — **à traiter juste après** |
| pages menuiserie | dossier de revalidation dédié, arbitrage Florian en attente |
| bandeau, saisonnier, bloc contrats, suppression de la landing | acceptés techniquement, **WAITING_FLORIAN_VISUAL** |
| pipeline de leads, migrations, Stripe | gates inchangés |

## VALIDATION_SHA_DESIGN

Préparé et testé, **rien d'appliqué**.

Le défaut mesuré : la seule notion de version est un champ `v:'1'` écrit à la main dans la console.
Personne ne l'a bougé depuis le 11 août ; `index.html` a reçu 87 commits entre-temps. Une
validation qui ne se périme jamais n'est pas une validation.

La version devient **l'empreinte du contenu des fichiers qui composent l'élément** : elle change
quand le code change, sans que personne ait à y penser — c'est précisément le geste que personne
n'a fait. Quatre verdicts, dont aucun ne tombe par défaut sur « valable » :
`VALIDATION_ACTUELLE`, `VALIDATION_PERIMEE`, `REFUS_OUVERT`, `NON_RATTACHABLE`.

| fichier | rôle |
|---|---|
| `docs/release/FEATURES.json` | 14 éléments → leurs fichiers |
| `scripts/release/versions-recette.mjs` | empreintes + `--check` |
| `scripts/release/validation-fraicheur.mjs` | classement, sans accès base |
| `scripts/tests/validation-fraicheur.test.mjs` | **12 contrôles** en bac à sable |
| `supabase/_pending_migrations/PROPOSED_validation_sha.sql` | `feature_id`, `code_sha`, `build_id` + vue — **non appliquée** |
| `docs/release/VALIDATION-SHA.md` | la conception, la limite assumée, ce qui reste à décider |

Le mécanisme **fonctionne sans la migration** : la colonne existante `recette_version` peut porter
l'empreinte. Non fait volontairement : brancher la console, parce que cela change ce qui s'écrit en
base à chaque clic de Florian — et vous demandiez préparation et tests seulement.

Appliqué aux neuf validations d'août, le mécanisme les classe toutes `NON_RATTACHABLE` ou
`REFUS_OUVERT`. C'est le résultat attendu.

## MENUISERIE_REVALIDATION_PLAN

Dossier dédié : `docs/qa/MENUISERIE-REVALIDATION.md` — périmètre exact (2 pages métier, 8 cartes,
5 pages voisines), ce qui a été testé et n'était pas cassé, le bug trouvé et corrigé avec sa
reproduction, les trois cas de doublon avec leur signal objectif, et une proposition de correction
en trois options pour le seul cas prouvé.

Mesure qui évite de corriger au hasard : deux pages sans rapport bâties sur le même gabarit
partagent déjà **63 à 78 %** de vocabulaire. Le seul signal fiable est le H1 — et il n'y a **qu'un
seul** H1 partagé dans tout le dossier `prestations/`.

Le dossier dit aussi ce qu'il ne bloque pas : les deux `a_corriger` d'août portaient sur
`menuiserie-cards` et `porte-entree`, ils ne retiennent aucun autre périmètre.

## NO_PROD_MUTATION_PROOF

| vérification | résultat |
|---|---|
| `origin/main` | inchangée : `e5b61c6e`, commit de rapports nightly qui n'est pas de moi |
| mes commits dans main | aucun |
| release fusionnée ? | non — la branche existe, elle n'est pas fusionnée |
| migration appliquée | non : dernière appliquée `20260810063933` (10 août) |
| fonction edge déployée | aucune |
| écriture en base | aucune ; `recette_validation` compte toujours 9 lignes |
| Stripe | aucun appel |

## Incident du jour, à signaler

Un `git add -A` a embarqué **162 copies de conflit iCloud** (« nom 2.ext ») : le dépôt est sous
`Documents/`, donc synchronisé. Quatre suites de tests sont passées au rouge, et un second fichier
de workflow — `.github/workflows/tests 2.yml` — se serait exécuté comme un vrai.

Avant suppression, j'ai vérifié les 195 copies présentes : 174 identiques au fichier courant, 21
identiques à une révision antérieure du même fichier. Aucune ne portait de travail unique.
`.gitignore` les écarte désormais, et `scripts/tests/depot-propre.test.mjs` échoue si une copie
réapparaît — avec un contrôle dédié aux workflows. Branché en CI. Commit `12419165`.

La branche de release n'est pas touchée : elle a été construite depuis `main` dans un arbre séparé,
et ne contient aucune de ces copies (vérifié).

## SHA_FINAL

`12419165` sur `recette` · release : `8adaba0393f8b08bb82515d929190914b1a3c045`

## NEXT_ACTION

1. Votre contrôle sur `release/lot-bc-2026-09-25` — 16 fichiers, tout est relisible en une fois.
2. Puis la validation visuelle de Florian sur la preview, pour les quatre éléments en attente.
3. En parallèle et sans release : le complément de C (générateur + garde du listing), sinon la
   prochaine synchronisation Facebook peut recréer un doublon.
4. Deux arbitrages qui n'attendent que Florian : le **nom unique de l'entreprise** (débloque A) et
   le **panneau de porte** (débloque la menuiserie).

**Aucune mutation de production. Aucun merge global. Aucun GO PROD demandé.**
