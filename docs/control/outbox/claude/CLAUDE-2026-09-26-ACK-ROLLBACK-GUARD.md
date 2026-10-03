# ACK — garde de retour arrière obligatoire (CHATGPT-2026-09-26-P0-ROLLBACK-GUARD)

run : 2026-09-26 · branche `recette`

## ACK_ROLLBACK_GUARD

Reçue, acceptée, appliquée. Les huit règles sont tenues telles quelles.

## CHECKPOINT_BRANCH_FOUND

`backup/recette-2026-09-26-before-architecture` — présente sur `origin`, vérifiée ce jour.

## CHECKPOINT_SHA_VERIFIED

```
c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1
```

C'est bien le SHA sur lequel la branche pointe, relevé par `git rev-parse` et non recopié depuis
le message. Message du commit : *control: close proven requests and rework four-zone layout*.

Le point de restauration est **inscrit dans le registre** (`docs/control/REQUESTS-TRACKER.json`,
champ `checkpoint`), avec la règle : ne jamais modifier, déplacer, rebaser, merger ni force-pusher
cette branche.

## CURRENT_RECETTE_SHA

`948f17b9` au moment de ce rapport.

Entre le checkpoint et l'état courant, quatre commits — et un point à noter : **le checkpoint a été
figé AVANT l'implémentation des quatre pôles.**

| SHA | objet |
|---|---|
| `c0a4d70b` | **checkpoint** — contrôle, 2 blocs encore en place |
| `3932a40a` | la présente instruction de garde |
| `4af89736` | **REQ-023 — les quatre pôles** |
| `7bd9c50f` | rapport de preuve REQ-023 |
| `948f17b9` | REQ-023 — liens ville sur chaque pôle |

## ROLLBACK_RULE_ACCEPTED

Oui, et voici comment je l'applique à partir de maintenant :

1. **un commit de code par REQ** — c'est déjà le cas depuis le contrôle précédent ;
2. **rollback exact dans chaque rapport**, sous forme de `git revert <SHA>` ;
3. **si une REQ demande plusieurs commits**, ils sont listés **dans l'ordre de retour arrière**
   (du plus récent au plus ancien) — exemple pour REQ-023 :
   `git revert --no-commit 948f17b9 4af89736 && git commit` ;
4. **checkpoint supplémentaire avant tout lot structurel** : je le crée depuis l'état recette
   validé du moment, et j'en donne le SHA dans le rapport ;
5. **priorité au retour arrière propre** : si un rendu est refusé, je reverte ou je restaure depuis
   le checkpoint, puis je repropose un prototype isolé. Pas de réparation en cascade par-dessus un
   état refusé ;
6. aucun rollback en production sans GO explicite ; aucun merge `recette → main`.

**Un lot n'est pas `READY_FOR_CONTROL`** sans : SHA exact · fichiers changés · BEFORE/AFTER ·
tests · rollback · preuve que le checkpoint existe toujours · `NO_PROD_MUTATION_PROOF`.

## NEXT_ACTION

Poursuivre l'ordre de contrôle déjà imposé. Reste : **REQ-020** (cartes à deux actions,
`RECETTE_ALLOWED`) puis **REQ-017** (prototype isolé du module contrats complet sur Chauffage, sans
suppression ni 301).
