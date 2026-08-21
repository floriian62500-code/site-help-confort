# Audit sécurité — Help Confort (2026-08-21, brief §5)

Périmètre : secrets, RLS Supabase, accès données client, Stripe, edge functions.
Projet Supabase : `btcbjwqiivhpwoszomhg`.

## ✅ Points sains vérifiés
- **Aucun secret privilégié en clair** dans le front/repo : pas de `sk_live_`, `sk_test_`, `ghp_`, PAT, ni JWT `service_role`. (`index.html:2332` « service_role » = simple commentaire.)
- **Données client NON lisibles par anon** : `leads` → 200 mais **0 ligne** (RLS bloque le SELECT) ; `newsletter_subscribers` → 0 ligne ; `recette_validation` → 401 ; `lead_action_tokens` → 0 ligne. Aucune fuite de PII.
- **7 tables `rls_enabled_no_policy`** (advisor INFO) = RLS activée **sans policy = deny-all** → correctement verrouillées (`lead_action_tokens`, `_gh_push_*`, `agent_files`, `smoke_test_results`, `pipeline_health_reports`, `hc_temp_blobs`).
- **Stripe : aucun chemin LIVE actif.** `hc-reserve-modal.js` : le clic « Réserver/payer » est **gelé** (HC-FIX A08) → route vers devis/lead, `createStripePayment` (montant DOM) jamais appelé. Pas de montant client envoyé à Stripe.

## 🔴 Corrigé ce cycle
- **P1 — anon JWT legacy désactivé (401) encore utilisé** par 4 scripts (chat-widget 111 pages, réservation modale 26, newsletter 6, live-stats 4) → appels Supabase cassés. **Corrigé** : remplacé par la clé publishable (SHA `a4762884`). Endpoints re-testés non-401.

## ⚠️ Findings à traiter (migrations = GATE DB, non appliquées)
- **P1 — INSERT anon direct sur `leads`** : policy `leads_public_insert` (anon INSERT, check `status='nouveau' AND assigned_to IS NULL`) permet de créer des leads via l'API REST **en contournant l'edge `submit-lead`** (validation + anti-spam + notifications). Le chemin applicatif actif est l'edge function ; la policy anon directe = **vecteur de spam/pollution**.
  → **Remédiation proposée** (à valider) : supprimer ou restreindre `leads_public_insert` pour forcer tous les leads via l'edge `submit-lead` (service_role + validation + rate-limit). Vérifier au préalable qu'aucun formulaire ne poste en direct.
- **P2 — `staging_validations` lisible par anon** (1 ligne retournée) : ancienne table de l'ex-widget de validation (retiré CP-0015). → verrouiller (RLS deny) ou supprimer la table si plus utilisée.
- **P2 — Vue `recette_validation_status` en `SECURITY DEFINER`** (advisor ERROR) : contourne la RLS de l'appelant. Délibéré pour la lecture anon du statut, mais à revoir en `security_invoker` + policy dédiée.
- **P3 — extensions `pg_net`/`pg_trgm` en schéma `public`** (advisor WARN) ; **fonctions `current_role()`/`is_owner()` SECURITY DEFINER exécutables** par `authenticated` ; **protection mots de passe compromis désactivée** (Auth). Durcissements mineurs (dashboard/migration).

## Migration proposée (NON appliquée — gate)
Voir `supabase/migrations/PROPOSED_20260821_leads_insert_hardening.sql`.

## Gates
Aucune migration appliquée sans GO Florian. Aucune donnée métier supprimée (seul 1 lead de test `AUDIT_TEST_DELETE_ME` créé pendant l'audit a été nettoyé). Aucune PROD.
