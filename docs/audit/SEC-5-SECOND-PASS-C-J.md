# SEC-5 — seconde passe sécurité C→J (issue #9)

Périmètre : site statique + Supabase front, `recette`. Suite de `SECOND-PASS-DEEP-CODE-SECURITY.md` (cat. B). READ-ONLY sauf 2 correctifs sûrs appliqués.

## Statut par catégorie
- **C Secrets** : ✅ PROPRE. Aucun `sk_live/sk_test/service_role/ghp_/re_` en dur ; seule clé front = publishable (publique par design). `functions.env` (service_role LOCAL éphémère) non commité → **gitignoré** (fix).
- **D CSP/headers** : ✅ solide (CSP + XFO + nosniff + Referrer-Policy + Permissions-Policy + HSTS, pas de wildcard). 🟡 P2 gate : `script-src 'unsafe-inline' 'unsafe-eval'` (chantier nonce, non sûr-recette).
- **E Validation/price gate** : ✅ validation client + serveur (submit-lead-v6), 0 PII en query string, HTTPS. Gate = capture lead (tarifs publics via `v_services_public`), pas un contrôle d'accès → contournement client = P3 accepté/documenté.
- **F Auth/RLS front** : ✅ aucun INSERT direct `/rest/v1/leads` (chemin edge) ; lecture publique de vues OK. Rappel gate DB : RLS `app_settings`/`staging_validations` (P2, SECURITY-AUDIT).
- **G/J Tiers/SRI/deps** : 🟡 **P2 sûr-recette** : scripts CDN sans SRI (jsdelivr/unpkg) + versions flottantes (`supabase-js@2`, `decap@^3`). Pas de package.json (statique). → correctif SRI ciblé = prochain sous-lot.
- **H PII client** : 🟡 `hc_book_v1` (prénom/tél/email…) sans purge (P3 sûr) ; `hc_gh_token` PAT admin en localStorage (P2 admin-only, dépend modèle auth admin).
- **I Redirects** : ✅ **P2 open-redirect CORRIGÉ** `espace-client.html` (voir fix) ; `_redirects` = seul externe = edge sitemap (contrôlé). Override `?backend=local` correctement borné localhost.

## Correctifs appliqués (sûrs recette)
1. **Open-redirect (P2, finding I-1)** — `espace-client.html` : l'ancien garde `startsWith('/') || !includes('://')` laissait passer `//evil.com` (protocole-relatif) → redirection d'un client connecté hors domaine (phishing). Nouveau garde rejette tout schéma (`http:`/`javascript:`…), `//`, `\` ; n'autorise que le same-origin relatif. **10/10 cas testés (node)**.
2. **Hygiène secret (finding C/#9)** — `.gitignore` : ajout `supabase/local-test/functions.env` (service_role LOCAL runtime).

## Confirmation ajouts récents (price gate / E2E) = sains
Override backend borné `hostname===localhost` + `?backend=local` (jamais prod) ; guard `prod-write-guard.mjs` fail-closed (self-test 8 cas) ; `start-e2e-local.sh` abort si projet lié PROD ou API≠localhost ; RESEND vide ; aucun service_role commité.

## Gates (non sûr-recette) / différés
- P2 SRI + épinglage CDN → prochain sous-lot sûr (nécessite hashes).
- P3 purge `hc_book_v1` après confirmation → à faire prudemment (éviter régression state tunnel).
- Gate : CSP nonce (D), RLS app_settings (F), Stripe LIVE (rappel P1), `hc_gh_token` admin (H).
