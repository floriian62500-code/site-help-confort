# Tunnel « Ma demande » — décision B appliquée — PR #52 READY_FOR_CONTROL

Base `main` `ccb17e9f`. Quatre commits, 214 fichiers, +3515 / −2276. Preview verte.

## L'accueil avait son propre tunnel

13 étapes, son propre appel à `submit-lead-v6`, sa propre anti-duplication, et **l'appel direct à
`stripe-create-payment-link` avec un montant venu du navigateur**.

La section `#hc-reservation` (105 ko) est remplacée par un bloc d'entrée de 15 ko : deux cartes
vers le tunnel et un rappel téléphonique court. Le CTA du héros ouvre le tunnel lui aussi.

```
accueil                           : 200 ko -> 107 ko
appels stripe-create-payment-link :   2 -> 0
ancien parcours (hc-resa-step)    :  13 -> 0
```

**Rien d'unique n'est perdu, vérifié avant de retirer.** Le tunnel canonique porte l'envoi de
photos et une qualification plus riche — choix, lieu, besoin, accès, précision, demande,
coordonnées, créneau — alimentée par le catalogue réel (`v_services_public`), là où l'accueil
n'offrait qu'**une seule** prestation écrite en dur.

## Les points demandés

- **Aucun paiement actif.** Plus un appel depuis l'accueil ; dans le tunnel `PAIEMENT_ACTIF = false`,
  et la fonction appelée n'est pas déployée.
- **Points d'accroche propres, rien de branché.** La mesure des CTA ne tourne qu'en production et
  `window.hcGtag` n'existe qu'après le consentement. Aucune donnée personnelle. Ni Stripe ni PostHog.
- **Un seul parcours.** Plus deux tunnels concurrents.

## Et le même piège de cache, une quatrième fois

Les **61 références** à `assets/tracking.js` et les **65** à `assets/hc-consent.js` n'avaient aucune
version, pour des fichiers servis avec un cache long. Toutes portent désormais `?v=20261007`.
C'est le même défaut que l'en-tête (#50), l'encart (#51) et le bandeau.

## Preuves

Les 31 suites du dépôt, jouées sur `main` puis sur le lot — **aucune ne régresse** :

```
demande-v2          ne démarrait pas  ->  190 PASS /  0 FAIL
price-gate          ne démarrait pas  ->   29 PASS /  0 FAIL
anti-double-envoi   ne démarrait pas  ->   12 PASS /  0 FAIL
hc-cart             ne démarrait pas  ->   12 PASS /  0 FAIL
back-nav            ne démarrait pas  ->   12 PASS /  0 FAIL
consent             ne démarrait pas  ->    8 PASS /  0 FAIL
intention-unique    ne démarrait pas  ->   14 PASS / 11 FAIL
catalogue-public     5 PASS / 1 FAIL  ->    6 PASS /  0 FAIL
header              14 PASS / 1 FAIL  ->   15 PASS /  0 FAIL
home-promo          16 PASS / 5 FAIL  ->   17 PASS /  4 FAIL
21 autres : inchangées
```

Preview à **1440** : les 3 CTA portent la bonne destination, en-tête 165 px, aucun débordement,
0 élément de l'ancien parcours. **Le clic ouvre réellement le tunnel** — « J'ai besoin d'être
dépanné » sur l'étape 1 sur 6 (« Où devons-nous intervenir ? »), « J'ai un projet » sur la branche
devis. À **390** : page à 390 px exactement, en-tête 95 px, tunnel plein écran sans débordement.

Aucun formulaire soumis, la porte des prix n'est pas franchie.

## Reste et suite

`intention-unique` (14/11) demande que les pages métier renvoient vers les contrats sans vendre et
qu'aucune page hors canonique n'affiche un prix de contrat en HT : **je le traite avec Contrats
Chauffage**, que j'enchaîne maintenant.

PR #51 (encart périmé) reste à passer en production par votre voie sûre — je n'y retouche pas.
