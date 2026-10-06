# COMMANDES EXACTES DES GATES (à exécuter sur GO Florian — NON exécutées)

> Ces actions touchent la **prod Supabase** (projet `btcbjwqiivhpwoszomhg` = base + edge + Stripe LIVE).
> ChatGPT ≠ décideur des gates prod (PROJECT_STATE.json : « live payment mutation » = human_gate).
> Aucune n'a été exécutée. Toutes réversibles/documentées.

## GATE 1 — Durcir l'edge Stripe (P1 CRITIQUE)
Fichier prêt : `supabase/functions/stripe-create-payment-link/PROPOSED_index.ts`
(montant serveur via `services.base_price_ttc` par slug ; auth secret `HC_PAYMENT_SECRET` ; idempotence ; rejet devis).
Avant deploy : fournir une clé **Stripe TEST** et basculer `app_settings.stripe` en TEST pour valider, PUIS repasser.
Deploy (sur GO) : remplacer le contenu de la fonction par PROPOSED_index.ts + définir le secret `HC_PAYMENT_SECRET`,
puis redéployer `stripe-create-payment-link`. **Ne pas déployer sans clé TEST + validation E2E TEST.**

## GATE 2 — Migrations de durcissement DB (RECETTE = même base prod, pas de branche Supabase)
- `supabase/migrations/PROPOSED_20260821_leads_insert_hardening.sql` — retire/​restreint `leads_public_insert`
  (force tous les leads via l'edge). Vérifier au préalable qu'aucun formulaire ne poste en direct sur `/rest/v1/leads`.
- `supabase/migrations/PROPOSED_20260822_storage_site_photos_hardening.sql` — drop des 3 policies public
  (INSERT/UPDATE/DELETE anon) sur bucket `site-photos`, écriture réservée `authenticated`.
Application (sur GO) : appliquer chaque migration, puis re-tester (page métier affiche ses photos ; lead via edge OK).

## GATE 3 — Release flow 4 tables + UI /recette.html
- `supabase/migrations/20260820_release_flow.sql` (4 tables release) — non appliquée.
- Une fois appliquée : réécrire `/recette.html` avec les 4 états À TESTER / VALIDÉ RECETTE / PRÊT PROD / DÉPLOYÉ PROD
  reliés à `release_id` + SHA immuable + timestamps (dépend des tables).

## Anomalie process (garde lead de test) — proposition, non déployée
Durcir `submit-lead-v6` : `isTestLead` ordre-indépendant (« test » ET « recette », tout ordre) +
auto-archiver les emails `@example.(fr|com|org)`. Évite qu'un test notifie l'agence.
