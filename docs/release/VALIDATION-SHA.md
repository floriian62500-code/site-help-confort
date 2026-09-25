# Une validation qui se périme toute seule

*Préparation demandée par `CHATGPT-2026-09-25-CONTROL-3` §5. Rien n'est appliqué en base, rien n'est
déployé : ce document décrit le mécanisme, le code est écrit et testé, l'activation est un geste
humain.*

## Le problème, mesuré

La table `recette_validation` contient neuf retours de Florian, des 11 et 12 août 2026. En
septembre, la console les affichait toujours comme valables. Elle avait tort, et voici pourquoi :

- la seule notion de version est un champ `v:'1'` **écrit à la main** dans `recette.html` ;
- personne ne l'a bougé depuis le 11 août ;
- pendant ce temps, `index.html` a reçu **87 commits**, `nos-prestations.html` 26, la page
  menuisier 29.

Une validation qui ne se périme jamais n'est pas une validation, c'est un souvenir. Pire : elle
donne l'illusion d'une couverture. C'est cette illusion qui m'a fait écrire, dans un rapport, qu'il
n'existait aucune validation — puis, une fois corrigé, qu'il en existait neuf. Les deux
affirmations étaient trompeuses ; la vraie est : *il en existe neuf, et aucune ne dit quoi que ce
soit du code d'aujourd'hui.*

## Le principe

**La version d'un élément est l'empreinte du contenu des fichiers qui le composent.** Pas un
numéro, pas une date : une empreinte. Elle change quand le code change, sans que personne ait à y
penser — c'est tout l'intérêt, puisque c'est précisément le geste que personne n'a fait.

```
docs/release/FEATURES.json     quels fichiers composent chaque élément validable
        ↓
scripts/release/versions-recette.mjs      empreinte par élément + commit courant
        ↓
assets/recette-versions.json   { "menuiserie-cards": { "version": "9f2c…" }, … }
        ↓
la console envoie cette empreinte avec le clic de Florian
        ↓
scripts/release/validation-fraicheur.mjs  compare l'empreinte stockée à l'actuelle
```

Quatre verdicts, et aucun ne tombe par défaut sur « valable » :

| verdict | quand |
|---|---|
| `VALIDATION_ACTUELLE` | l'empreinte stockée est celle d'aujourd'hui, et le statut était « ok » |
| `VALIDATION_PERIMEE` | le code a changé depuis : il faut revalider, ce n'est pas discutable |
| `REFUS_OUVERT` | le statut était « à corriger » : ni périmé, ni acquis — c'est un travail dû |
| `NON_RATTACHABLE` | pas d'empreinte stockée, ou l'élément n'existe plus |

Les neuf validations d'août tombent toutes dans les deux dernières catégories. C'est le résultat
attendu, pas un défaut du mécanisme.

## Ce qui est déjà écrit et testé

| fichier | rôle |
|---|---|
| `docs/release/FEATURES.json` | 14 éléments → leurs fichiers (généré depuis la console, puis complétable à la main) |
| `scripts/release/versions-recette.mjs` | calcule les empreintes ; `--check` échoue si le code a bougé depuis la dernière génération |
| `scripts/release/validation-fraicheur.mjs` | classe une liste de validations ; ne lit aucune base |
| `scripts/tests/validation-fraicheur.test.mjs` | **12 contrôles**, en bac à sable : même code → même version ; un fichier modifié périme l'élément **et lui seul** ; un refus reste un refus ; une validation sans empreinte n'est jamais « actuelle » |
| `supabase/_pending_migrations/PROPOSED_validation_sha.sql` | colonnes `feature_id`, `code_sha`, `build_id` + vue de lecture — **non appliquée** |

**Le mécanisme fonctionne sans la migration** : la colonne existante `recette_version` peut porter
l'empreinte, et le classement se fait hors base. La migration n'ajoute que la traçabilité (quel
commit, quel déploiement) et une vue de confort.

## Ce qui reste à faire, et qui n'est pas de moi

1. **Brancher la console** (`recette.html`) : charger `assets/recette-versions.json` et envoyer
   l'empreinte de l'élément au lieu du `v:` écrit à la main. Une vingtaine de lignes. Je ne l'ai pas
   fait : le contrôle demandait « préparation et tests seulement », et cette modification change ce
   qui s'écrit en base à chaque clic de Florian.
2. **Générer à chaque build** : un appel à `versions-recette.mjs` dans la CI, et `--check` en garde
   pour que le fichier ne dérive pas silencieusement du code.
3. **Décider du sort des neuf validations d'août** : elles ne peuvent pas être rattachées. Soit on
   les archive comme historique, soit Florian revalide les éléments concernés sur la preview
   actuelle. Les deux sont défendables ; aucune ne consiste à les compter comme valables.
4. **Appliquer la migration** si l'on veut la traçabilité du commit — décision humaine, base
   partagée avec la production.

## Limite assumée

L'empreinte porte sur des **fichiers**, pas sur le rendu. Deux conséquences honnêtes :

- un changement qui ne touche pas les fichiers déclarés ne périme rien — d'où l'importance de
  `FEATURES.json` : un élément qui dépend d'un asset doit le déclarer, sinon la garde est aveugle ;
- une modification cosmétique d'un fichier (un commentaire) périme la validation alors que rien n'a
  bougé à l'écran. C'est le sens de l'erreur que je préfère : revalider pour rien coûte une minute,
  croire à tort qu'un élément est validé coûte une mise en production.
