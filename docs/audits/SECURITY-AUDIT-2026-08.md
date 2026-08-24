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
- **P1 — Storage `site-photos` : écriture publique (anon)** (audit 2026-08-22) : le bucket public `site-photos` (25 Mo, images+PDF) porte 3 policies rôle `{public}` → un **anonyme non authentifié** peut **INSERT** (uploader, DoS/coût), **UPDATE** (écraser une photo servie sur le site live = **défacement**) et **DELETE** (supprimer les photos du site). Preuve d'inutilité : le front n'écrit jamais dans `site-photos`, il ne fait que **lire** (`<img src=".../object/public/site-photos/...">`, ~20 pages) ; l'upload légitime est admin/authentifié.
  → **Remédiation proposée** : `supabase/migrations/PROPOSED_20260822_storage_site_photos_hardening.sql` — drop des 3 policies public, écriture réservée `authenticated`, lecture publique conservée. **Non appliquée (gate DB).**
  → Buckets vérifiés : `lead-photos` **privé** (photos client, correct) ; `partners-logos`/`prestations`/`site-photos` publics avec MIME/taille bornés ; `realisations` public **sans limite MIME/taille** (policies écriture pointent `bucket_id='réalisations'` **avec accent ≠ id réel `realisations`** → policies mortes, aucune écriture possible = fermé par défaut, à nettoyer).
- **P2 — `staging_validations` lisible par anon** (1 ligne retournée) : ancienne table de l'ex-widget de validation (retiré CP-0015). → verrouiller (RLS deny) ou supprimer la table si plus utilisée.
- **P2 — Vue `recette_validation_status` en `SECURITY DEFINER`** (advisor ERROR) : contourne la RLS de l'appelant. Délibéré pour la lecture anon du statut, mais à revoir en `security_invoker` + policy dédiée.
- **P3 — extensions `pg_net`/`pg_trgm` en schéma `public`** (advisor WARN) ; **fonctions `current_role()`/`is_owner()` SECURITY DEFINER exécutables** par `authenticated` ; **protection mots de passe compromis désactivée** (Auth). Durcissements mineurs (dashboard/migration).

## 🔴 P1 CRITIQUE (2026-08-22, #9 T10) — endpoint de paiement LIVE public à montant client
- **`stripe-create-payment-link`** : `verify_jwt: false` + montant `amount_eur` **lu depuis le corps client** (validé seulement `>= 1`) + `app_settings.stripe` = **configured=true avec une clé `sk_live_`** (107 car.). ⇒ **quiconque possède la clé publishable (publique dans le front) peut appeler l'edge directement et créer un Checkout Stripe LIVE au montant de son choix** (exploit sous-paiement 1 €, abus de ressources / pollution `payments`, liens de paiement arbitraires sur le compte Stripe HELP Confort). Le gel frontend (`index.html:2503 return;`) empêche le *site* d'appeler, **mais pas l'edge**.
- **Remédiation proposée** (NON déployée = GATE) : `supabase/functions/stripe-create-payment-link/PROPOSED_index.ts` — montant **serveur** (lookup `services.base_price_ttc` par slug, client ignoré), auth par secret partagé `HC_PAYMENT_SECRET`, idempotence, rejet des prestations sur devis.
- **needs_florian** : décider (a) durcir + déployer l'edge (tester d'abord en Stripe TEST), ou (b) si l'endpoint n'est plus utilisé par le dashboard manuel, le retirer / passer `app_settings.stripe.configured=false`. **Aucune action prod effectuée sans GO.**

## Migration proposée (NON appliquée — gate)
Voir `supabase/migrations/PROPOSED_20260821_leads_insert_hardening.sql`.

## Gates
Aucune migration appliquée sans GO Florian. Aucune donnée métier supprimée (seul 1 lead de test `AUDIT_TEST_DELETE_ME` créé pendant l'audit a été nettoyé). Aucune PROD.

## Matrice RLS (audit table par table, 2026-08-24)
| TABLE | RLS | anon | authenticated | risque |
|---|---|---|---|---|
| `leads` | on | INSERT | ALL | **P1** INSERT anon direct (leads_public_insert) — migration proposée |
| `newsletter_subscribers` | on | INSERT | SELECT | OK (anon signup, non lisible) |
| `payments` | on | — | ALL | OK (non lisible anon ; insert via service_role) |
| `services` | on | SELECT (public) | ALL | OK (catalogue public) |
| `recette_validation` | on | INSERT | INSERT | OK (centre recette) |
| `lead_action_tokens` | on | — | — | OK (deny-all) |
| `app_settings` | on | — | ALL | **P2** contient la clé Stripe → lisible par `authenticated` (devrait être service_role only) |
| `staging_validations` | on | **ALL** | ALL | **P2** accès anon complet (table obsolète ex-widget) → verrouiller/DROP |

**Nouveaux findings (remédiation = gate DB, non appliquée)** :
- **P2 `app_settings`** : restreindre SELECT/ALL au `service_role` (retirer l'accès `authenticated` à une table portant un secret Stripe).
- **P2 `staging_validations`** : `revoke`/DROP (table de l'ex-widget retiré CP-0015, plus utilisée).
