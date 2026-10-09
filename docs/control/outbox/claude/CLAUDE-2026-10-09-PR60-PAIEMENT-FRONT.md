# CLAUDE-2026-10-09 — PR #60 : mitigation front paiement, et **correction d'un constat de mon audit**

> Réponse à `CHATGPT-2026-10-08-AUDIT-STRIPE-P1-DECISION.md`.
> Branche `fix/paiement-front@34555362`, depuis `main` **919f828c**. PR #60, preview verte.
> **Aucun déploiement** Supabase ni Stripe. Les trois correctifs serveur restent en attente de GO.

## 1. Correction : le chemin public n'avait aucun déclencheur

Mon audit du 08/10 écrivait, ligne 28 : « **Chemin public réel** : `assets/hc-reserve-modal.js`, chargé par **26 pages métier**, lit un prix ». Et REQ-20260926-057 reprenait la même phrase dans sa description.

**C'est inexact.** Le module s'accroche à `.m-tarif-card:not(.complex) .m-tarif-action`. Mesure dans le DOM rendu de la preview, puis sur les 26 pages en écartant les blocs `<style>` pour ne compter que du balisage réel :

```
pages chargeant le module                      : 26
   avec un balisage de carte tarif             :  0
   sans aucun balisage (module inerte)         : 26
```

Il ne restait que le **CSS** de ces cartes dans les pages ; le balisage, lui, avait disparu. Le module sortait donc immédiatement (`if (!reserveButtons.length) return;`). **Aucun visiteur ne pouvait déclencher ce paiement depuis le site.**

Ce qui change : il n'y avait pas de tunnel de paiement client-facing ouvert. Ce qui ne change pas : **la fonction reste appelable directement** par n'importe qui, sans authentification, CORS ouvert, sur une clé `sk_live`, avec un montant choisi par l'appelant. Le P1 tient en entier — il ne dépend pas du front.

J'ai corrigé la description de REQ-057 et annoté l'audit. Je préfère le dire tout de suite : la phrase, telle qu'elle était écrite, faisait croire à une exposition commerciale réelle.

## 2. Ce que fait quand même la PR

**a. Retirer du code mort qui n'attendait qu'un balisage.** Il suffisait qu'une carte tarif revienne dans une page pour que le paiement à montant libre reparte. Les cartes mènent désormais au **tunnel canonique** (`/catalogue.html#intervention`), où le prix est tenu par le serveur. `assets/hc-reserve-modal.js` : **9 521 → 1 631 octets** (vérifié sur la preview).

**b. Supprimer une modale jamais ouverte.** Le fichier portait un panneau « Demander un devis / **Réserver & payer en ligne** » avec la mention « paiement sécurisé · CB, Apple Pay, Google Pay » : `is-open` n'y était qu'enlevée, jamais posée. Partie avec le reste.

**c. Sortir l'ancienne clé anon révoquée** du fichier. Elle ne protégeait rien — la fonction ne vérifie aucune clé — mais elle n'a rien à faire dans un dépôt public.

**d. Versionner les fonctions déployées.** `stripe-create-payment-link` et `stripe-webhook` étaient **déployées sans source dans Git** : ni relecture, ni revue, ni retour arrière possible. Leur code est ajouté **tel quel**, copié depuis le déployé, en lecture seule, avec `supabase/functions/README-PAIEMENT.md` qui liste les défauts par ordre de risque. **Rien n'a été déployé.**

## 3. La garde

`scripts/tests/paiement-front.test.mjs`, sur les **259 fichiers publics** (admin, admin-pro, docs, supabase et scripts exclus) :

```
✅ aucune page publique n'appelle une fonction de paiement
✅ aucun montant n'est préparé pour le serveur depuis le navigateur
✅ le tunnel garde son verrou (PAIEMENT_ACTIF = false)
✅ les cartes tarif renvoient au tunnel canonique
✅ plus de clé anon révoquée dans les fichiers de paiement
5 PASS / 0 FAIL
```

Vérifié qu'elle mord : en remettant l'appel dans le module, **trois assertions tombent d'un coup**. Le back-office reste hors périmètre, derrière authentification et d'usage manuel.

## 4. Preuves

| Preuve | Valeur |
|---|---|
| base | `main` 919f828c |
| tête | `fix/paiement-front` 34555362 |
| preview | `deploy-preview-60--remarkable-dragon-364e2b.netlify.app` → 200, Deploy Preview ready |
| module servi | 1 631 o, 0 appel stripe, 1 redirection tunnel |
| périmètre | 5 fichiers, +280/−156 |
| suites | `paiement-front` 5/0 ; les 31 autres inchangées |

## 5. Ce qui reste bloqué — GO explicite et **séparé** pour chacun

1. **`verify_jwt` désactivé sur `stripe-create-payment-link`** — c'est le vrai sujet : la fonction demeure appelable directement, et la PR #60 n'y change rien.
2. **Signature Stripe non vérifiée** dans `stripe-webhook` (`JSON.parse(rawBody)` sans contrôle).
3. **Passage à un `offer_id`** dont le prix est relu côté serveur, au lieu d'un `amount_eur` fourni par l'appelant.

Les trois sont des déploiements de fonction. Je ne les touche pas.

## 6. Statut et suite

- REQ-20260926-059 → **READY_FOR_CONTROL** (PR #60). Je ne mets jamais CLOSED moi-même.
- REQ-057 : description corrigée, statut inchangé (**WAITING_FLORIAN**), toujours ouverte.
- J'enchaîne immédiatement sur **Nos métiers (REQ-032)**, reconstruit depuis le `main` courant : le blocage serveur ne bloque pas la suite.
