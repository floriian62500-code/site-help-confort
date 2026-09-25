# Retour — les deux « à corriger » menuiserie du 12 août

message_id: CLAUDE-2026-09-25-MENUISERIE-A-CORRIGER
repond_a: recette_validation du 2026-08-12 (mod_id `menuiserie-cards` et `porte-entree`)
date: 2026-09-25
statut: PARTIEL — un défaut trouvé et corrigé, un arbitrage rendu à Florian
production: AUCUNE MUTATION

Ces deux retours étaient les seuls de la base à dire explicitement **non**, et ils dormaient depuis
six semaines. Mes deux rapports de ce matin les désignaient comme prochaine action : voici.

## 1. « IL Y A PAS MAL DE BEUGUE IL FAUT TOUT TESTER »

### Ce qui n'était pas cassé — et je le dis, parce que ça compte aussi

| contrôle | résultat |
|---|---|
| liens internes des deux pages menuisier | **0 mort** (70 et 68 liens uniques) |
| ancres internes | **0 morte** |
| images | **0 cassée** |
| débordement horizontal 1440 et 390 | **0 px** |
| cartes savoir-faire | **8**, toutes en 200, toutes vers une page distincte |

Si le bug était là en août, il a été corrigé depuis — 29 commits ont touché ces pages entre-temps.

### Le vrai défaut, invisible pour un test de liens

`menuisier-saint-omer.html` promettait, juste sous son titre :

> « Bris de glace, double vitrage, vitrage sur-mesure, sécurisation : nos **vitriers** interviennent
> rapidement… »

**Mot pour mot l'accroche de `vitrier-saint-omer.html`.** Et la description envoyée à Google disait
la même chose, à cinq endroits (meta, og:description, twitter:description, données structurées).
Un visiteur cherchant une porte ou une fenêtre lisait une promesse de vitrerie ; Google affichait
« bris de glace » sous un titre « Menuisier ».

**Corrigé** : l'accroche et la description décrivent ce que la page vend réellement — fenêtres,
portes, baies vitrées, panneaux PVC, parquet — c'est-à-dire exactement ses huit cartes. Rien
d'inventé : le modèle est la page sœur de Dunkerque, qui, elle, était juste.

**Vérifié sur les 44 pages métier × ville** : après correction, aucune n'emprunte l'accroche, la
description ni le vocabulaire exclusif d'un autre métier. C'était la seule.

### Un second défaut, trouvé en cherchant le premier

La console de **toutes** les pages métier portait une erreur 400 à chaque chargement :
`storage/…/prestations/_manifest.json` → « NoSuchKey ». Un manifest de photos qui n'existe pas dans
le bucket. Le repli sur les images locales fonctionnait, donc rien n'était cassé à l'écran — mais
l'appel repartait à chaque page et criait à chaque fois. C'est ce bruit qui m'a fait chercher un
bug de menuiserie là où il n'y en avait pas : une console qui crie tout le temps ne sert plus à rien.

L'absence est maintenant retenue pour la session, comme l'était déjà le manifest quand il existe.
Vérifié sur la preview : **0 appel** sur les pages suivantes de la session. Si le manifest est
déposé un jour, la fonction se réveille d'elle-même à la session suivante.

## 2. « DOUBLONS » — arbitrage à rendre

Mesure d'abord, pour ne pas confondre un doublon avec un gabarit commun : **deux pages sans rapport
bâties sur le même modèle partagent déjà 63 à 78 % de vocabulaire**. Le recoupement seul ne prouve
donc rien. Le signal fiable, c'est le H1.

| cas | recoupement | signal | mon avis |
|---|---|---|---|
| `remplacement-panneau-porte` ↔ `vitrerie-panneau-porte` | 86 % | **H1 identique** — seul cas du dossier `prestations/` | **doublon réel** |
| `fenetres-bois-alu-pvc` ↔ `fenetres-completes` | 80 % | titres très proches (« pose neuve & rénovation » / « pose neuve ») | à trancher |
| `ouverture-porte` ↔ `porte-claquee` ↔ `porte-fermee-cle` | 81-85 % | trois pages pour une même urgence | à trancher |

Le cas du panneau de porte est le plus net, et il est particulier : les deux pages ont le **même
H1**, et surtout le corps de la page « vitrerie » décrit le **remplacement du panneau**, pas du
vitrage (« dépose ancien panneau, pose panneau neuf, reprise joints, réglage »). Seuls son titre et
sa description parlent de vitrage. Elle promet donc une chose dans Google et en livre une autre.

Aucune de ces deux prestations n'existe au catalogue : ce sont des pages de devis, il n'y a pas
d'argument de prix pour les départager.

**Ce que je n'ai pas fait, et pourquoi** : je n'ai supprimé ni fusionné aucune page. Décider que
« remplacer le panneau » et « remplacer le vitrage du panneau » sont une seule prestation ou deux
est un choix commercial, pas un nettoyage — exactement comme la landing entretien la semaine
dernière. **Trois options, à ton choix :**

1. **fusionner** : `vitrerie-panneau-porte` → 301 vers `remplacement-panneau-porte` (c'est ce que
   son contenu décrit déjà) ;
2. **distinguer** : réécrire son corps pour qu'il parle vraiment du vitrage, et lui donner son
   propre H1 ;
3. **laisser** : dans ce cas la page doit au moins cesser d'annoncer du vitrage dans Google.

Le contrôle `duplicate-intent` signale désormais tout H1 partagé par deux pages, en avertissement —
pour que le cas ne se reperde pas en attendant ta décision.

## TESTS

| suite | résultat |
|---|---|
| `pages-metier` (**nouveau**, 6 contrôles) | 6/6 — **2 échecs prouvés** sur la page d'avant |
| `duplicate-intent` | OK · 2 avertissements hérités (dont le H1 partagé) |
| suite complète (22 fichiers) | **0 FAIL** |

Ce que verrouille le nouveau fichier : deux métiers ne partagent ni accroche ni description ; aucune
page ne vend le vocabulaire exclusif d'un autre métier ; chaque accroche nomme son métier ; les 66
cartes savoir-faire du site mènent à une page existante.

## BROWSER_E2E

Preview réelle, `/menuisier-saint-omer` et `/menuisier-dunkerque`, en 1440 et 390 : accroche
menuiserie à l'écran, description corrigée, 8 cartes cliquables vers 8 pages distinctes, 0
débordement, 0 image cassée, plus d'erreur 400 après la première page de la session.

## SHA

`05ac1e94` — branche `recette`. Rien sur `main`.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/menuisier-saint-omer

## ROLLBACK

`git revert` des trois commits du lot (accroche menuiserie, manifest photos, détecteur de H1).
Aucune donnée, aucun prix, aucun paiement touché.

## NEXT_ACTION

Ton arbitrage sur le panneau de porte (1, 2 ou 3 ci-dessus). Tant qu'il n'est pas rendu, je ne
touche à aucune de ces pages.
