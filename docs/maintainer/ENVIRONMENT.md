# Variables d'environnement et secrets

> Mise à jour : 2026-09-20. **Ce document ne contient aucune valeur de secret et ne doit jamais en
> contenir.** Il dit seulement quelles variables existent, où elles vivent, et qui les lit.

## Règle

- Les secrets vivent dans **Supabase Secrets** (fonctions edge) et **GitHub Secrets** (CI).
  Jamais dans le dépôt, jamais dans une page, jamais dans un message.
- Le front ne connaît que la **clé publique** Supabase (publishable, rôle `anon`) : elle est publique
  par conception et ne donne accès qu'à ce que la RLS autorise.
- L'ancien JWT anonyme est **désactivé** : ne plus l'utiliser.

## Côté fonctions edge (Supabase Secrets)

| Variable | Lue par | Rôle |
|---|---|---|
| `SUPABASE_URL` | toutes | adresse du projet |
| `SUPABASE_SERVICE_ROLE_KEY` | toutes les fonctions serveur | accès complet à la base — **jamais côté client** |
| `SUPABASE_ANON_KEY` | quelques fonctions | appels en lecture publique |
| `RESEND_API_KEY` | `notify-lead-v6`, `lead-auto-reply`, `weekly-recap`… | envoi des emails |
| `STRIPE_TEST_SECRET_KEY` | `create-payment-session` | paiement client, **clé TEST uniquement** (la fonction refuse toute clé qui n'est pas `sk_test_`) |
| `STRIPE_TEST_WEBHOOK_SECRET` | `stripe-webhook-test` | signature du webhook de test |
| `HC_PAYMENT_SECRET` | paiement | signature des jetons de paiement |
| `HC_EDGE_AUTH_TOKEN` | fonctions internes | authentification entre fonctions / tâches planifiées |
| `ANTHROPIC_API_KEY` | `chat-assistant`, générateurs de contenu | assistance IA |
| `APOGEE_API_URL`, `APOGEE_API_KEY` | `crm-apogee-push` | envoi des leads vers le CRM Apogée |

> ⚠️ La clé Stripe **de production** n'est pas une variable d'environnement : elle est stockée en base
> (`app_settings.stripe`) et lue par `stripe-create-payment-link`. Voir [PAYMENTS.md](PAYMENTS.md) :
> c'est un point de sécurité ouvert.

## Côté CI (GitHub Secrets)

| Variable | Utilisée par |
|---|---|
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID` | `.github/workflows/supabase-deploy.yml` (application des migrations au push sur `main`) |

## Côté machine de Florian

| Endroit | Contenu | Remarque |
|---|---|---|
| Trousseau macOS (via `gh auth login`) | jeton GitHub | utilisé par le démon d'auto-push : **aucun jeton stocké en clair** |
| `~/Library/Application Support/HelpConfort/` | journaux, verrou, kill-switch de l'auto-push | pas de secret |
| URL distante `origin` du dépôt local | contient encore un ancien PAT **invalide** | inutilisé depuis la v3 du démon ; à nettoyer avec `git remote set-url` |

## Vérifier qu'aucun secret n'a fuité

```bash
grep -rEn "(sk_live_|sk_test_|ghp_|gho_|service_role|eyJhbGciOi)" \
  --include='*.html' --include='*.js' --include='*.json' . | grep -v node_modules
```

Attendu : aucune ligne. La clé publique Supabase (`sb_publishable_…`) est normale côté front.
