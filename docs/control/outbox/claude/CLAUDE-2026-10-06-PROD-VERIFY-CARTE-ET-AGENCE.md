# PROD_VERIFY final — carte réparée, et une seule page reste en écart

message_id: CLAUDE-2026-10-06-PROD-VERIFY-CARTE-ET-AGENCE
repond_a: ordre Florian du 2026-10-06 (PROD_VERIFY après les fusions #31 et #32)
date: 2026-10-06
verdict: **la carte est PASS en production** · **l'affichage « une agence » l'est à une page près**

## 1. La carte, sur `depan59-62.fr`

Fusion `998aadb5132ccfc9e75073a232de6f945aed4e0f`. Le script servi ne contient **plus aucune
occurrence de `cartocdn`**.

| critère | 1440 | 390 |
| --- | --- | --- |
| tuiles | **12 chargées**, 0 en erreur, couverture **100 %** | **6 chargées**, 0 en erreur, **100 %** |
| source | `a/b/c.tile.openstreetmap.org` | idem |
| `API REQUIRED` | **disparu** | **disparu** |
| zoom | opérant, tuiles rechargées 12 → 9 | opérant |
| déplacement | opérant, **0 tuile en erreur** | opérant |
| marqueurs | **4** | **4** |
| rôles | **1 × `agence` (★ Saint-Omer)** + **3 × `zone`** (D, C, B) | idem |
| panneau | « **1 AGENCE À SAINT-OMER · 3 PÔLES D'INTERVENTION** » | idem |
| attribution | **visible**, lien OpenStreetMap **visible** : « © OpenStreetMap contributors » | idem |
| mentions « 2 agences » sur la page Zones | **aucune** | **aucune** |
| débordement | **0 px** | **0 px** |
| console | **aucune erreur imputable au site** | **aucune** |

Artefacts : `docs/qa/CARTE-prod/`.

## 2. Le relevé des 117 pages, après les deux fusions

DOM rendu, même méthode, **0 erreur de chargement**.

| | |
| --- | --- |
| avant | **32** pages incohérentes |
| après #31 seule | 5 |
| **après #31 + #32** | **2** |

Artefact : `docs/qa/REQ-041-prod/releve-dom-final.json`.

### Les 2 restantes

| page | ce qui reste | statut |
| --- | --- | --- |
| `reseau-help-confort.html` | « 100+ agences locales **en France** » | **l'exception normale que vous avez nommée** |
| `a-propos.html` | « deux agences locales : Dépan'Audo… et Dépan'DK » | **écart réel, pas une exception** |

Je ne peux donc pas écrire « aucune fausse présentation ne subsiste » : **`a-propos.html` en
présente encore une**, et c'est moi qui l'ai laissée de côté, volontairement, parce qu'elle
contient une citation.

## 3. Ce que contient exactement `a-propos.html`

J'ai classé ses **7** occurrences une par une sur la page servie :

| | nature | extrait |
| --- | --- | --- |
| 1 | **texte courant** | « Notre enseigne commerciale est HELP Confort Saint-Omer & Dunkerque, opérée par **deux agences locales** : Dépan'Audo… et Dépan'DK » |
| 2 | **citation** | « *Aujourd'hui, on couvre toute la Côte d'Opale avec deux agences locales…* » |
| 3 | texte courant | intertitre « Une enseigne, **deux agences locales** » |
| 4 | texte courant | titre « Une enseigne locale, **deux agences** sur la Côte d'Opale » |
| 5 | texte courant | « …l'ensemble du Dunkerquois grâce à **nos deux agences**. » |
| 6 | texte courant | « **Nos deux agences** appartiennent au réseau national HELP Confort » |
| 7 | texte courant | « **Nos deux agences** mettent à votre disposition des techniciens… » |

**Six sur sept sont du texte courant.** Une seule est une citation entre guillemets — et on ne
réécrit pas une citation : elle rapporte ce qui a été dit, à une date donnée.

**Proposition, prête à partir sur un mot :** je corrige les six, je laisse la citation telle
quelle. La production tombe alors à **une seule occurrence sur 117 pages**, qui est un propos
rapporté, et l'exception du réseau national. Lot court, même méthode, preuves 1440/390.

Si vous préférez clore REQ-041 en l'état, c'est défendable aussi — mais alors l'écart
d'`a-propos.html` doit être **écrit dans la clôture**, pas oublié.

## 4. Ce qui reste derrière, inchangé

`agence-dunkerque.html` est toujours servie en 200, avec ses horaires et sa fiche
`schema.org Plumber`, **sous le même SIREN** que Dépan'Audo, alors que les mentions légales ne
déclarent qu'une entité. Les phrases sont corrigées ; la fiche d'établissement, non.

## STOP

Rien d'autre n'a été modifié. Je n'ai rien fusionné.
