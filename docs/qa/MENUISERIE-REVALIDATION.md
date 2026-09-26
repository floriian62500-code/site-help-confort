# Menuiserie — dossier de revalidation

*Demandé par `CHATGPT-2026-09-25-CONTROL-3` §6 : ne pas partir corriger au hasard, délimiter le
périmètre, prouver ce qui est duplicatif et ce qui est un bug reproductible. Les deux `a_corriger`
de Florian du 12 août ne bloquent que ce périmètre.*

## Périmètre exact

| rôle | pages |
|---|---|
| pages métier | `menuisier-saint-omer.html`, `menuisier-dunkerque.html` |
| cartes savoir-faire (8, identiques sur les deux pages) | `prestations/` : `porte-entree`, `porte-garage`, `portail-cloture`, `fenetres-bois-alu-pvc`, `coulissant-baie-vitree`, `garde-corps-rampes`, `remplacement-panneau-porte`, `parquet` |
| pages voisines citées dans l'arbitrage | `prestations/` : `fenetres-completes`, `vitrerie-panneau-porte`, `ouverture-porte`, `porte-claquee`, `porte-fermee-cle` |

Les deux retours d'origine : `menuiserie-cards` → « IL Y A PAS MAL DE BEUGUE IL FAUT TOUT TESTER » ;
`porte-entree` → « DOUBLONS ». Tous deux du 2026-08-12, jamais levés.

## Ce qui a été testé, et qui ne l'était pas

| contrôle | résultat le 2026-09-25 |
|---|---|
| liens internes des deux pages métier | **0 mort** (70 et 68 liens uniques) |
| ancres internes | **0 morte** |
| images | **0 cassée** |
| débordement horizontal 1440 et 390 | **0 px** |
| les 8 cartes | **8 × HTTP 200**, 8 titres distincts |

Le bug de liens, s'il existait en août, n'existe plus : 29 commits ont touché ces pages depuis.

## Bug trouvé et corrigé (reproductible)

**`menuisier-saint-omer.html` vendait la promesse du vitrier.** Sous son titre « Menuiserie rapide
à Saint-Omer » : « Bris de glace, double vitrage, vitrage sur-mesure : nos **vitriers**
interviennent rapidement ». Mot pour mot l'accroche de `vitrier-saint-omer.html`. La description
envoyée à Google disait la même chose, à cinq endroits (meta, og, twitter, données structurées).

*Reproduction :* ouvrir `/menuisier-saint-omer` avant `05ac1e94` ; lire le paragraphe sous le H1 ;
comparer avec `/vitrier-saint-omer` → texte identique.
*Correction :* accroche et description refaites d'après ce que la page vend (ses 8 cartes), sur le
modèle de la page sœur de Dunkerque, qui était juste. Commit `05ac1e94`.
*Non-régression :* `scripts/tests/pages-metier.test.mjs` — deux métiers ne partagent ni accroche ni
description, aucune page n'emprunte le vocabulaire exclusif d'un autre, chaque accroche nomme son
métier, les 66 cartes du site mènent à une page existante. Deux de ces contrôles échouent sur la
page d'avant.

**Bruit de fond corrigé au passage** : toutes les pages métier lançaient à chaque chargement un
appel qui répond 400 (`storage/.../prestations/_manifest.json`, absent du bucket). Rien de cassé à
l'écran — mais c'est ce bruit qui m'a fait chercher un bug de menuiserie là où il n'y en avait pas.
Commit `5bfcfe80`.

## Doublons : ce qui est objectivement duplicatif

Mesure préalable, pour ne pas confondre doublon et gabarit commun : **deux pages sans rapport
bâties sur le même modèle partagent déjà 63 à 78 % de vocabulaire**. Le recoupement seul ne prouve
donc rien. Le signal fiable est le **H1**.

| # | pages | recoupement | signal objectif | statut |
|---|---|---|---|---|
| 1 | `remplacement-panneau-porte` ↔ `vitrerie-panneau-porte` | 86 % | **H1 identique** — seul cas du dossier `prestations/` ; et le corps de la page « vitrerie » décrit le remplacement du **panneau**, pas du vitrage | **doublon prouvé** |
| 2 | `fenetres-bois-alu-pvc` ↔ `fenetres-completes` | 80 % | titres quasi identiques (« pose neuve & rénovation » / « pose neuve ») ; aucun H1 partagé | à trancher |
| 3 | `ouverture-porte` ↔ `porte-claquee` ↔ `porte-fermee-cle` | 81-85 % | trois pages pour une même urgence ; aucun H1 partagé | à trancher |

Le cas 1 est le plus net et le plus coûteux : la page annonce du vitrage dans Google et livre du
remplacement de panneau. Aucune des deux prestations n'existe au catalogue (ce sont des pages de
devis) : il n'y a pas d'argument de prix pour les départager.

## Proposition de correction

**Cas 1 — décision demandée, trois options :**

1. **Fusionner** — `vitrerie-panneau-porte` → 301 vers `remplacement-panneau-porte`. C'est ce que
   son contenu décrit déjà. Le plus simple, et cohérent avec la suppression de la landing entretien.
2. **Distinguer** — réécrire son corps pour qu'il parle réellement du vitrage (verre feuilleté,
   double vitrage, sécurité) et lui donner son H1. Plus de travail, mais deux vraies prestations.
3. **Laisser** — dans ce cas, corriger au minimum son titre et sa description pour qu'ils annoncent
   ce que la page livre.

Je n'ai touché à aucune page : décider que « remplacer le panneau » et « remplacer son vitrage »
sont une ou deux prestations est un choix commercial, pas un nettoyage.

**Cas 2 et 3 —** même logique, sans urgence : ils ne trompent personne, ils diluent seulement le
référencement. À traiter après le cas 1.

**Garde en attendant** : `scripts/seo/duplicate-intent.mjs` signale désormais tout H1 partagé par
deux pages, en avertissement — pour que le cas ne se reperde pas.

## Ce que ce dossier bloque, et ce qu'il ne bloque pas

- **Bloqué** : toute mise en production des pages menuiserie listées ci-dessus, tant que le cas 1
  n'est pas tranché et que Florian n'a pas revalidé la preview.
- **Non bloqué** : le reste du site. Les deux `a_corriger` d'août portaient sur `menuiserie-cards`
  et `porte-entree` ; ils n'ont jamais concerné les autres périmètres, et ne doivent pas servir à
  les retenir.
