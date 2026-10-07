# Tâche 4 — tunnel « Ma demande » : état d'avancement, pas encore une PR

Branche `feat/tunnel-ma-demande` poussée depuis `main` `2bed1495`. **Pas de PR** : le module est
en place, les pages ne sont pas encore câblées. Je ne propose pas au contrôle un tunnel qui n'a
aucune porte d'entrée.

## Ce qui est fait

Six fichiers repris de `archive/recette-2026-10-06-pre-sync`, sans modification :
`catalogue.html`, `assets/hc-demande.{css,js}`, `hc-demande-core.js`, `hc-demande-launch.js`,
`hc-cart.js` — environ 243 ko.

Huit suites versionnées de `main` ne démarraient pas faute de ces fichiers. Elles démarrent :

```
demande-v2        180 PASS / 10 FAIL
price-gate         29 PASS /  0 FAIL
hc-cart            12 PASS /  0 FAIL
intention-unique   14 PASS / 11 FAIL
anti-double-envoi   9 PASS /  3 FAIL
consent             2 PASS /  6 FAIL
catalogue-public    5 PASS /  1 FAIL
```

Le moteur tient : 180/10 sur la suite principale, et la **porte des prix est verte (29/0)**.

## Paiement : non activé, et vérifié

Le module appelle `functions/v1/create-payment-session`. **Cette fonction n'est pas déployée** sur
le projet Supabase du site — relevé sur la liste des fonctions, pas supposé. Le module interroge
d'abord `payApi('check')` et bascule en « unavailable » : aucun écran de paiement ne peut
s'afficher. Avant toute PR je poserai en plus un **verrou explicite**, pour que l'activation reste
une décision et pas un effet de bord d'un déploiement futur.

Au passage, et sans rapport avec ce lot : **`stripe-create-payment-link` et `stripe-webhook` sont,
elles, déployées et actives**. C'est le point P1 déjà signalé — un lien de paiement public dont le
montant vient du client. Il ne vient pas du tunnel, il vit ailleurs dans le site.

## Ce qui reste, et qui n'est pas dans le module

Les échecs restants portent tous sur le **câblage des pages** :

1. **L'accueil n'a aucune référence au tunnel** — zéro occurrence de `hc-demande`, de
   `catalogue.html` ou du lanceur. Les 3 CTA attendus par `demande-v2` sont à poser.
2. **Pages métier** (`intention-unique`) : elles doivent renvoyer vers les contrats et ouvrir
   l'entretien dans le tunnel **sans vendre** ; aucune page hors canonique ne doit afficher un
   prix de contrat en HT. Ce point croise la tâche 5 (Contrats Chauffage, cohérence TTC/HT).
3. **Bandeau de consentement** : hauteur publiée, pas de seconde barre pendant l'affichage, et les
   65 pages doivent charger une version datée — sinon le cache immuable d'un an garde l'ancien.
4. **`tracking.js`** : `hcGtag` ne doit être exposé qu'après la garde de consentement, et le
   fichier doit rester inerte hors production.
5. **`catalogue-public`** : au niveau des familles, `_default` doit s'afficher « Autres prestations ».

Aucune page de `main` ne pointe aujourd'hui vers `/catalogue.html` : il n'y a donc **pas de lien
cassé** en production, seulement une absence.

## Suite

Je continue sur le câblage. Si un point exige un arbitrage (par exemple la formulation des CTA de
l'accueil), je le signale et je passe au suivant.
