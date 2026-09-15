# Help Confort — architecture du parcours de vente (conversion flow)

> Tâche ledger : **UX-COMMERCE-1** (rattachée à CMD-2/CMD-3/CMD-4/CMD-5 + TUN-1/TUN-2).
> Source : issue #9 commentaire 5441880835. Livrable **avant** gros refactor.
> Règle absolue : **un seul moteur** (le panier `assets/hc-cart.js` + le wizard `#hc-reservation`).
> **Aucun 4e moteur parallèle.** On RÉUTILISE l'existant et on SUPPRIME l'ancien sélecteur (CMD-5).
> Recette uniquement. Pas de main/PROD sans GO Florian. Stripe reste gated (réservation non bloquée).

## 0. Principe directeur

Deux clients, **un seul moteur, un seul panier** :
- **Client qui SAIT** → catalogue familles + recherche → ajoute au panier.
- **Client qui HÉSITE** → diagnostic guidé (métier → équipement/zone → symptôme) → prestations
  recommandées → ajoute au panier (1 ou plusieurs).

Les deux convergent vers le **même panier** (`window.__hcCart`) et le **même checkout**.

## 1. Arbre du parcours (états)

```
[ENTRÉE]  Home / page métier / deep-link
   │  CTA « Commander une intervention »  |  « Obtenir un devis »
   ▼
[LOCALISATION]  adresse + CP  ──► zone/agence/dispo (contexte mémorisé, jamais redemandé)
   │            hors zone ? → message honnête + rappel humain (pas de blocage brutal)
   ▼
[MODE]  ┌── A. JE SAIS ──► [CATALOGUE] familles → sous-familles → prestations
        └── B. J'HÉSITE ─► [DIAGNOSTIC] métier → équipement/zone → symptôme → reco prestations
   │            (A et B alimentent le MÊME panier)
   ▼
[PANIER]  lignes (prix ferme | fourchette | sur devis), quantité, modifier/supprimer
   │       séparation claire : « à payer » vs « à confirmer/sur devis »
   │       sticky desktop / bottom-sheet mobile
   ▼
[URGENCE vs RDV]  proposé seulement si pertinent — promesse = NOS horaires/capacités réels
   ▼
[COORDONNÉES]  nom, tel, email (validateurs hoistés existants)
   ▼
[CRÉNEAU / PRISE EN CHARGE]  rappel humain (pas de faux créneaux inventés)
   ▼
[CONSENTEMENTS]  RGPD / conditions nécessaires
   ▼
[CONFIRMATION]  référence HC-AAMM-XXXX + récap complet (adresse, agence, urgence/RDV,
                prestations, prix/statut tarifaire, créneau) — paiement seulement si Stripe validé
```

**Récapitulatif permanent** visible dès [PANIER] : adresse, agence, urgence/RDV, prestations,
prix/statut, créneau — modifications simples (retour arrière sans perte).

## 2. Règles tarifaires (source de vérité = serveur)

| Cas | Affichage | Panier | Total |
|---|---|---|---|
| Prix **ferme** TTC | montant TTC (calculé serveur, view `v_services_public.price_ttc`) | ligne « à payer » | additionné dans « total éléments à prix ferme » |
| **Fourchette** | « de X€ à Y€ » | ligne « à confirmer » | **non** additionné au total ferme |
| **Sur devis** (`requires_quote=true`) | « sur devis » | ligne « sur devis » | exclu du total ferme |

- **Interdit** : présenter comme ferme un prix qui dépend d'un diagnostic.
- Le total payable est **toujours recalculé côté serveur** (le front n'envoie que `id + qty`,
  cf. en-tête `hc-cart.js` / `serverPayload()`). Aucun prix client ne doit devenir la source.
- Panier mixte (ferme + sur devis) autorisé : `hcCart.mode()` → `paiement | devis | mixte | vide`.

## 3. Cas d'erreur / robustesse

| Cas | Comportement attendu |
|---|---|
| Adresse hors zone | message honnête + proposition rappel, **pas** de cul-de-sac |
| Refresh / retour navigateur | reprise du brouillon (localStorage `hc_cart_v1` + état étape) sans perte |
| Double-submit | bouton désactivé pendant l'envoi + idempotence (référence unique) |
| Champ invalide | erreur inline explicite (validateurs hoistés — fix FRM-1 déjà en place) |
| JS/catalogue KO | dégradation : téléphone humain + formulaire simple restent accessibles |
| Diagnostic sans reco | proposer « sur devis » / rappel plutôt qu'un vide |

## 4. Desktop / mobile

- **Desktop** : panier **sticky** à droite ; catalogue/diagnostic à gauche ; récap toujours visible.
- **Mobile-first** : panier en **bottom-sheet** (compteur + total repliés), étapes plein écran,
  navigation site réduite pour éviter la fuite **mais sortie explicite** (croix/retour clairs),
  clavier adapté (`inputmode`), cibles tactiles ≥44px.

## 5. Instrumentation conversion (sans données personnelles)

Événements (funnel, anonymisés — aucune PII dans analytics) :
`entrée → localisation → famille → diagnostic → ajout_panier → coordonnées → créneau → confirmation`
+ `abandon_par_étape`. Sert à mesurer, pas à profiler.

## 6. SEO — non-cannibalisation

- Les pages métiers/prestations restent **indexables et riches** (contenu, maillage).
- Le tunnel transactionnel reste `noindex` (déjà le cas sur `catalogue.html`).
- Chaque page SEO **deep-linke** vers le tunnel avec métier/prestation pré-sélectionné
  (déjà livré : `/catalogue#cat=<famille>` — CMD-2, SHA `3d11b469`).

## 7. Mapping vers composants EXISTANTS (réutiliser / supprimer, ne pas empiler)

| Bloc cible | Composant existant à réutiliser | Statut | Action |
|---|---|---|---|
| Moteur panier | `assets/hc-cart.js` (UMD, `window.__hcCart`) | ✅ livré, 12/12 tests | **réutiliser tel quel** |
| Catalogue familles/produits (wizard) | `#hc-cat-families` / `#hc-cat-products` dans `index.html` | ✅ livré (CMD-3 `ecf1b1a0`) | réutiliser ; ajouter **sous-familles** |
| Catalogue page dédiée | `catalogue.html` (noindex, deep-link `#cat=`) | ✅ livré (CMD-2) | réutiliser comme entrée plein écran |
| Panier UI | `#hc-cart-lines` / `#hc-cart-count` / `#hc-cart-total` | ✅ livré | ajouter **sticky/bottom-sheet** + section « sur devis » |
| Données prestations | view Supabase `v_services_public` (prix serveur) | ✅ en prod recette | réutiliser ; enrichir champs (inclus/exclus, délai, photo/picto) |
| Localisation | autocomplete `assets/hc-address-autocomplete.js` | ✅ corrigé (CMD-1 `fa662525`) | **remonter en tête** de parcours |
| Coordonnées + validateurs | wizard `#hc-reservation`, validateurs hoistés | ✅ livré (FRM-1 `c6f2d349`) | réutiliser |
| Checkout confirmation | handler succès `resa-pay` + `buildMailBody()` (récap + réf HC-AAMM-XXXX) | ✅ livré (CMD-4 `6cedb087`) | réutiliser ; ajouter **étapes dédiées** Panier/Créneau |
| **Diagnostic guidé (mode B)** | — (n'existe pas encore) | ❌ à créer | **nouveau, branché sur le MÊME panier** (pas un moteur séparé) |
| **Ancien sélecteur unique** | `proposePrestations` / `detectDetailedPresta` / `renderPrestaProposals` (index.html) | ⚠️ inerte, sur stubs cachés | **SUPPRIMER** après preuve 0-réf runtime (= **CMD-5**) |

## 8. Découpage incrémental (rattaché au ledger, ordre courant)

1. **CMD-5** — retirer l'ancien sélecteur (preuve 0-réf → suppression). *Débloque la dette.*
2. **UX-C-a** — sous-familles dans le catalogue + enrichissement fiche prestation
   (inclus/exclus, délai, picto) via `v_services_public`.
3. **UX-C-b** — localisation remontée en tête + contexte zone/agence mémorisé.
4. **UX-C-c** — panier sticky desktop / bottom-sheet mobile + section « sur devis » séparée.
5. **UX-C-d** — **diagnostic guidé** (mode B) branché sur `__hcCart`.
6. **UX-C-e** — étapes dédiées Panier / Créneau (TUN-2) + consentements.
7. **UX-C-f** — instrumentation funnel anonyme.

Chaque incrément : commit `recette`, smoke + E2E, preuve vérifiée depuis `origin/recette`, ledger MAJ.

## 9. E2E obligatoires (avant de considérer UX-COMMERCE-1 livrée)

- [ ] Client sait : adresse → famille → **2 prestations de familles différentes** → panier → coordonnées → créneau → confirmation
- [ ] Client hésite : métier → équipement/zone → symptôme → recommandation → panier → confirmation
- [ ] Deep-link page métier/prestation pré-sélectionne le tunnel
- [ ] Retour / refresh / reprise brouillon sans perte
- [ ] Mobile (bottom-sheet, clavier, cibles tactiles)
- [ ] Panier **mixte** : prix ferme + sur devis dans le même panier, totaux corrects
- [ ] Adresse **hors zone** : message honnête + rappel, pas de blocage
- [ ] **Double-submit** impossible

> Rappel hygiène recette : E2E uniquement avec un nom `NE PAS TRAITER` / `TEST RECETTE`
> (sinon l'agence reçoit une vraie notification), et **ne jamais cliquer « Réserver »** hors test contrôlé.
