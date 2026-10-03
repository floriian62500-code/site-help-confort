# REQ-20260926-026 — garde de cohérence des zones : livrée · et REQ-032 rendue accessible

message_id: CLAUDE-2026-09-28-REQ-026-GARDE-ZONES
branche: recette
date: 2026-09-28
commit: 1534226d
déclencheur: validation visuelle de REQ-023 accordée par Florian + checkpoint
`backup/recette-validated-2026-09-28-req023` créé par lui à `64a96a82`

## POURQUOI CE LOT DÉMARRE MAINTENANT
L'ordre imposé était : REQ-023 validée → checkpoint → REQ-026. Les deux premières étapes sont
faites — la validation est écrite dans les décisions du jour, et le checkpoint existe bien en
distant, à l'empreinte annoncée. J'ai donc exécuté REQ-026, et rien d'autre de visuel.

## CE QUE FAIT LA GARDE
`scripts/tests/zones-coherence.test.mjs`, jouée avec le reste de la suite.

Elle déduit les **villes revendiquées** du nom des pages — onze familles locales
(`depannage-`, `chauffagiste-`, `plombier-`, `electricien-`, `serrurier-`, `vitrier-`,
`menuisier-`, `travaux-`, `volets-`, `pmr-`, `agence-`) — et non d'une liste réécrite à la main,
comme le demandait le critère d'acceptation. Elle les confronte à un **instantané versionné** de la
liste canonique (`scripts/tests/fixtures/communes-canoniques.json`, 222 entrées relevées le
2026-09-28 sur `communes-list`).

Six contrôles : instantané lisible ; des pages de ville sont détectées ; **aucune ville revendiquée
n'échappe au canonique sans écart déclaré** ; chaque écart porte une raison ; aucun écart n'est
devenu inutile ; aucun écart ne vise une page disparue. Aucun appel réseau à l'exécution, aucune
mutation, aucun fichier public touché — le diff se limite à `scripts/tests/`.

Rafraîchir l'instantané : `node scripts/tests/zones-coherence.test.mjs --refresh`.

## CE QU'ELLE A TROUVÉ — plus large que l'audit REQ-025
Preuve demandée « sortie du test en échec sur l'écart connu ». La voici, écarts déclarés vidés :

```
❌ aucune ville revendiquée publiquement n’échappe au canonique sans écart déclaré
   boulogne-sur-mer → chauffagiste-, depannage-, electricien-, plombier-, serrurier-boulogne-sur-mer.html
   outreau → chauffagiste-, plombier-, serrurier-outreau.html
   wimereux → chauffagiste-, plombier-, serrurier-wimereux.html
   saint-pol-sur-mer → depannage-saint-pol-sur-mer.html
   le-portel → plombier-le-portel.html
   saint-martin-boulogne → plombier-saint-martin-boulogne.html
RÉSULTAT : 5 PASS / 1 FAIL  (code de sortie 1)
```

**Six villes**, treize pages, alors que mon audit REQ-025 en annonçait trois. Les deux comptes ne
mesurent pas la même chose : l'audit regardait les villes **citées dans le contenu**, la garde
regarde les villes qui ont **une page dédiée**. C'est cette seconde mesure qui compte, parce
qu'une page dédiée est une promesse publique.

La cause est nette : **le Boulonnais canonique ne contient que six villages ruraux** — Boursin,
Caffiers, Fiennes, Hardinghen, Hermelinghen, Hocquinghen — alors que le site a des pages pour
l'agglomération boulonnaise. Et Saint-Pol-sur-Mer, commune de Dunkerque, a sa page sans exister au
canonique.

Les six écarts sont déclarés dans le test, chacun avec sa raison et un renvoi à **REQ-027**. La
suite est donc verte aujourd'hui, et elle **échouera dès qu'une nouvelle ville sera revendiquée**
sans commune canonique — c'est exactement l'objet de la demande.

Constat annexe, signalé sans bloquer : **`Pihen-lès-Guînes` est en double** dans la liste
canonique (222 entrées, 221 communes distinctes). Défaut de donnée, rattaché à REQ-027.

## TESTS
Suite complète : **846 PASS / 0 FAIL**, 31 fichiers en code 0 (840 auparavant : +6, les six
contrôles de la nouvelle garde).

Précision d'honnêteté : mes rapports précédents annonçaient « 31 fichiers » alors qu'il y en avait
**30** — c'est aujourd'hui, avec cette garde, que le compte atteint 31. Le nombre de contrôles,
lui, était bien mesuré à chaque fois.

## RETOUR ARRIÈRE
Un commit isolé, `1534226d`, deux fichiers ajoutés, aucun fichier existant modifié :
`git revert --no-commit 1534226d && git commit` suffit, sans effet sur quoi que ce soit d'autre.

## REQ-032 — maquette rendue accessible sans compte
Florian ne pouvait pas ouvrir la maquette publiée sur l'espace Claude. Une version **autonome** a
été produite et lui a été remise directement : un seul fichier HTML de 24 Ko, sans dépendance (hors
police Google), qui s'ouvre dans n'importe quel navigateur, sans compte ni connexion. Il contient
les **quatre vues** — page métiers 1440 et 390, bloc accueil 1440 et 390 — et la maison y est
cliquable. Aucun fichier du dépôt n'a été ajouté pour cela, et aucune page n'a été créée sur le
site : si Florian préfère un lien plutôt qu'un fichier, je peux le poser sur la recette en
`noindex`, mais je ne l'ai pas fait de moi-même — cela créerait une page, ce que le gel interdit.

## NEXT_ACTION
- REQ-026 : `READY_FOR_CONTROL`.
- Suite de l'ordre : **REQ-020** (cartes à deux actions), désormais débloquée par la validation de
  REQ-023, puis STOP visuel.
- Toujours en attente : les six villes du Boulonnais et Saint-Pol-sur-Mer relèvent de **REQ-027**,
  qui attend les réponses métier de Florian.
