# Architecture Catalogue / Panier / Réservation (refonte P0 — issue #9 / 5398316639)

> Cible : parcours catalogue multi-panier clair. **Prix et éligibilité paiement = SERVEUR** (le navigateur n'est jamais source de vérité). Implémentation réelle sur `recette`, données existantes. Pas de Stripe LIVE.

## 1. Inventaire réel (source = Supabase `services` + `service_categories`, 2026-08-24)
36 prestations, **6 familles** :
| Famille | Total | Prix ferme (vendable) | Sur devis | Prix TTC |
|---|---|---|---|---|
| Plomberie & Sanitaires | 16 | 16 | 0 | 114–1333 € |
| Chauffage & Climatisation | 6 | 6 | 0 | 105–237 € |
| Serrurerie | 5 | 5 | 0 | 98–228 € |
| Rénovation | 5 | 0 | **5** | sur devis |
| Vitrerie | 2 | 1 | 1 | 120 € |
| Électricité | 2 | 1 | 1 | 114–385 € |

Champs par prestation : `id, slug, name, brand, short_desc, includes(jsonb), image_url, price_ht, vat_rate, requires_quote, deposit_pct, duration_min, warranty, active, category_id`.
TTC = `round(price_ht * (1 + vat_rate))`. Éligible paiement = `active AND NOT requires_quote AND price_ht > 0`.

## 2. Deux natures d'offre (séparation STRICTE)
- **A — PRIX FERME** (`requires_quote=false`) : vendable/réservable. Afficher le TTC + ce que couvre le prix (`includes`). CTA « Ajouter au panier ».
- **B — DIAGNOSTIC / DEVIS** (`requires_quote=true`) : **jamais de faux prix**. CTA « Demander un diagnostic / devis ». Pas d'ajout au panier payable.

## 3. Parcours cible (5 étapes)
1. **Catalogue** : familles d'abord → clic famille → cartes produits (photo, nom, marque, caractéristique, TTC si ferme / « sur devis » sinon), recherche globale.
2. **Panier** : lignes (produit, qté, PU, total), retrait/modif, retour catalogue sans perte, indicateur permanent « Mon panier (n) — XXX € TTC ».
3. **Coordonnées / adresse** (réutilise la validation wizard actuelle : nameOk/phoneFrOk/emailOk/cpFrOk + BAN).
4. **Créneau** (si données dispo ; sinon validation humaine, ne pas inventer de dispo).
5. **Paiement (panier 100 % ferme éligible) OU demande de devis** (panier contenant du B, ou mixte → demande globale sans paiement immédiat). **Ne jamais encaisser un montant incomplet.**

## 4. Règles panier
- Plusieurs lignes, familles différentes, quantité si pertinent.
- Panier persistant (localStorage `hc_cart_v1`) sur tout le wizard ; robuste : vide, ajout, retrait dernière ligne, doublon (incrémente qté), refresh, back/forward.
- **Panier mixte (ferme + devis)** → bascule en **demande globale sans paiement** (UX sûre) ; on n'encaisse jamais un panier partiellement chiffré.
- **Zone/agence** : CP 59* → Dunkerque, sinon Saint-Omer ; une prestation hors zone ne poursuit pas silencieusement (blocage + message).

## 5. Pricing serveur (OBLIGATOIRE — anti-exploit A08)
- Le client n'envoie que des **IDs produit + quantités**. Le serveur (edge) relit `services` et **recalcule** PU/TTC/total. Aucun montant client ne fait foi.
- Session Stripe **TEST** créée seulement pour un panier **100 % éligible** (edge durci `PROPOSED_index.ts` étendu au panier). Idempotence (une seule session par (panier, email, jour)). **Aucun Stripe LIVE.**
- **BLOQUÉ (gate)** : cet edge de calcul panier + Stripe TEST = déploiement prod → GO Florian + clé `sk_test_`.

## 6. Statuts commande/demande
`panier(brouillon) → coordonnees → creneau → paiement_attente → paye_test | demande_diagnostic | confirme | echec/abandon`.
Stockage : réutiliser `leads` (demande/devis) ; commandes payées = table `orders`/`payments` (à définir, gate DB).

## 7. Composant / mutualisation
- **`assets/hc-cart.js`** : source unique de la logique panier (add/remove/qty/total/éligibilité/persistance). Réutilisé par le wizard ET les deep-links pages métier.
- Données catalogue = une seule source (fetch `v_services_public`), jamais recopiées par page.
- **Deep-links** : `?famille=plomberie` (ou `#cat=<slug>`) ouvre le catalogue sur la bonne famille sans casser le panier.

## 8. SEO
- Ne pas indexer le wizard (dupliqué). Pages métier = portes SEO ; leurs CTA pointent vers la bonne famille du catalogue (deep-link).

## 9. Ce qui est BLOQUÉ (gate) vs faisable maintenant
- **Faisable recette** : catalogue familles→produits, panier (add/remove/qty/persist/éligibilité), coordonnées, demande de devis/lead, deep-links, responsive/a11y.
- **Gate** : edge de pricing panier serveur + Stripe TEST (paiement) ; table `orders` ; migration.

## 10. Non-régression
- Ne pas casser le flux lead actuel (`submit-lead-v6`) pendant la refonte. Retirer l'ancienne sélection unique **seulement après** preuve que le nouveau flux la remplace. Tests de non-régression (smoke).
