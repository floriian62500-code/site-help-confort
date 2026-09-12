# Audit isolation backend recette + plan E2E zéro-écriture-PROD

> Réponse au lot ChatGPT 5509522354 (E2E recette isolé / zero prod write).
> **Étape 1 = audit (ci-dessous). Aucun E2E écrivant tant que `PROD_WRITE_GUARD=PASS`
> ET `TEST_BACKEND_ISOLATED=PASS` ne sont pas prouvés — les deux sont BLOCKED aujourd'hui.**

## 1. Matrice cible backend (deploy-preview `recette`)

| COMPOSANT | PREVIEW_TARGET | PROD_TARGET | ISOLÉ | RISQUE_WRITE_PROD | ACTION |
|---|---|---|---|---|---|
| Supabase DB | **PROD** `btcbjwqiivhpwoszomhg` (hardcodé, 409 réf. front) | même | **NON** | **ÉLEVÉ** (INSERT `leads`) | isoler (stack local ou projet test) |
| Edge functions | **PROD** (submit-lead-v6 → notify-lead-v6 + lead-auto-reply) | même | **NON** | **ÉLEVÉ** | idem |
| Storage | **PROD** bucket privé `lead-photos` | même | **NON** | **MOYEN** (upload test) | idem |
| Email (Resend) | **PROD** : agence `saint-omer@helpconfort.com` + **auto-reply au client** | même | **NON** | **ÉLEVÉ** (mails réels) | sink/sandbox test |
| CRM / webhook | **aucun actif** | — | N/A | **NUL** | — |
| Stripe | endpoint LIVE existe mais **NON invoqué par le tunnel** (0 appel dans catalogue.html) | LIVE | N/A (tunnel) | **NUL** côté tunnel | garder coupé ; TEST-only si un jour testé |

**Conclusion** : le front (public deploy-preview) pointe **en dur** vers le projet Supabase PROD.
Il n'existe **aucune instance/branche de recette** (org Supabase non-Pro = pas de branche cf
[[gate-a-test-infra]] ; seul un Postgres local Docker a servi pour des tests RPC). Toute
soumission de formulaire depuis le preview **écrit en PROD** et **déclenche des emails réels**
(agence + client) — prouvé par le lead test historique `7e52628a` (laissé intouché sans GO).

## 2. PROD_WRITE_GUARD (fail-closed) — LIVRÉ

`scripts/test/prod-write-guard.mjs` : refuse tout E2E écrivant si la cible n'est pas
**explicitement TEST**. Échoue fermé (`allowTest!==true` OU `mode!=='test'` OU cible ∈ refs/hosts
PROD OU cible inconnue → ABORT). Self-test inclus (`node scripts/test/prod-write-guard.mjs`).
Tout futur harnais E2E DOIT appeler `assertTestTarget()` avant la 1ʳᵉ écriture.

## 3. Plan isolation (Étape 2) — préparer le sûr, nommer le geste humain

Aucun système inutile : **réutiliser** ce qui existe. Deux voies, par ordre de préférence sûreté/coût :

### Voie A (recommandée, zéro coût/compte) — stack Supabase LOCAL (Docker)
- `supabase start` (CLI + Docker) → DB + Edge + Storage en local (`http://localhost:54321`), refs 100% locales.
- Appliquer migrations + RLS + créer bucket privé `lead-photos` en local ; fixtures **anonymes** (`prestations`, `v_services_public`).
- Edge en mode test : **RESEND_API_KEY vide / sink** → aucun email réel (fail-safe : la fonction n'envoie pas).
- Front pointé vers le local via un **override borné** (ex. `?backend=local` accepté UNIQUEMENT sur `localhost` ; jamais sur le domaine preview/prod) — à ajouter derrière le guard.
- **Geste humain restant** : lancer Docker + `supabase start` sur la machine (aucun compte/coût/secret cloud). Je prépare tout le reste (config, fixtures, override, guard) en recette, non actif par défaut.

### Voie B (si E2E cloud voulu) — projet Supabase TEST dédié
- Nouveau projet Supabase (compte Florian, coût éventuel) + clés TEST (jamais service-role dans le navigateur) + Resend en domaine sandbox.
- **Geste humain = GATE Florian** : création projet + fourniture des clés TEST (anon) via canal sûr.

## 4. Retour

`PREVIEW_BACKEND_AUDIT=DONE | SUPABASE_PREVIEW=PROD | EMAIL_PREVIEW=PROD(Resend→agence+auto-reply client) | CRM_PREVIEW=NONE | STRIPE_PREVIEW=LIVE_endpoint_exists_NOT_invoked_by_tunnel | PROD_WRITE_GUARD=DELIVERED(guard fail-closed) mais E2E=BLOCKED | TEST_BACKEND_ISOLATED=BLOCKED(aucune instance test) | HUMAN_GATE=lancer stack local Docker (voie A, sans coût) OU créer projet Supabase TEST (voie B, GATE Florian) | SAFE_NEXT=preparer config stack local + fixtures + front override borne (non actif) puis SEO-2 | SHA_DOC=43e3c591`

**Aucun E2E écrivant lancé.** `FULL_E2E` ne sera JAMAIS déclaré sur des mocks. Le lead PROD `7e52628a` reste intouché.
