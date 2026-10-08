# PR #58 — la page contrats, et l'audit des promesses

Base `main` `a4a9720d`. Un commit, 8 fichiers. Preview verte.

```
contrats        8 PASS / 27 FAIL  ->  35 PASS / 0 FAIL
prix-contrats  40 PASS /  1 FAIL  ->  41 PASS / 0 FAIL
```

## Ce que la suite décrivait depuis le 26/09, sans que personne puisse le voir

Faute des fichiers de référence, `contrats.test.mjs` ne démarrait pas. Ce qu'il décrivait :

- **la souscription n'envoyait aucun téléversement** — ni RIB, ni facture, ni photo. Seul
  « RIB fourni : oui » partait. Un client qui joignait son RIB croyait l'avoir transmis ;
- un objet `payload` était construit puis **jamais envoyé** ;
- l'agence était choisie **selon le code postal**, avec une « agence Dunkerque » ;
- des promesses inexactes : priorité pour tous, économies chiffrées, « sans engagement »,
  « résiliation en 1 clic », tarif personnalisé ;
- en 390, les boutons de l'assistant **sortaient de l'écran**.

## L'ancien module de prix part

`assets/hc-pricing.js` affichait « Essentiel 12,90 € / Confort 19,90 € / Premium » — les mêmes
montants obsolètes que l'article du blog, avec des noms de formules que le catalogue ne connaît pas.

Il était **chargé par 5 pages et monté par aucune** : le seul `data-hc-pricing` restant est dans un
commentaire qui documente son retrait de mai. Vérifié dans le DOM rendu en production : aucun
élément monté. Son départ ne change rien à l'écran et retire 10 ko par page.

## Le délai CONFORT était annoncé à deux valeurs

Blog : « sous 24h en formule Confort ». Page canonique : « sous 48 h ». **Le catalogue tranche** :
`Intervention sous 48h max`. Le blog s'aligne. (La troisième occurrence, « Devis express sous 24h »
sur `partenaire.html`, est une offre partenaire qui porte le même mot sans parler du même sujet.)

## L'audit des promesses, comme demandé

J'ai lu `v_contract_offers` en base, en lecture seule, et comparé **chaque** engagement :

| promesse | catalogue |
|---|---|
| CONFORT : 2 dépannages/an (MO + déplacement) | ✅ |
| CONFORT : intervention sous 48 h | ✅ `48h max` |
| SÉCURITÉ : intervention sous 24 h | ✅ `24h max` |
| SÉCURITÉ gaz : pièces incluses | ✅, **hors corps de chauffe, échangeur principal, ballon ECS** |
| SÉCURITÉ fioul : pièces | ✅ **jusqu'à 1 000 € HT**, au-delà devis |
| SÉCURITÉ : **chaudières < 5 ans, après contrôle technique** | ✅ `legal_note` |
| BASIC : dépannages facturés en sus | ✅ |
| TVA 10 % | ✅ `vat_rate 0.100` |
| prix TTC mensuels | ✅ identiques |

**Et les restrictions sont bien à l'écran**, vérifié dans le DOM rendu (les cartes viennent du
catalogue, la source ne suffit pas à le prouver) :

> « FORMULE FIOUL SÉCURITÉ 29,70 € TTC / mois · Tout CONFORT inclus · **Pièces jusqu'à 1 000 € HT ·
> Au-delà : devis remplacement** · Intervention sous 24h max · **Réservée aux chaudières < 5 ans,
> après contrôle technique** »

La formule la plus chère ne se vend pas sans ses conditions — une restriction omise trompe autant
qu'une promesse inventée.

Un point que la page a raison de taire : **les montants annuels du fioul ne valent pas douze
mensualités** (154 € contre 158,40 ; 209 contre 211,20 ; 352 contre 356,40). Elle n'affiche aucun
montant annuel.

**390** : page à 390 px, aucun débordement, grille lisible, prix affichés.

## Suite

Nos métiers (REQ-032) depuis le `main` courant.
