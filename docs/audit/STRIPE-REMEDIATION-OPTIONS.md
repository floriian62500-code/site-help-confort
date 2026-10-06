# P1 CRITIQUE Stripe — DEUX options pour Florian (aucune mutation prod exécutée)

> Contexte : edge `stripe-create-payment-link` = `verify_jwt:false` + montant `amount_eur` **du client** (validé ≥1)
> + `app_settings.stripe` clé **LIVE** → **paiement LIVE public à montant choisi** (exploit sous-paiement/abus).
> Risque **actuel, ouvert**. Le gel frontend ne protège PAS l'edge. Aucune clé/secret publié ici.

## Option A — DURCIR puis TESTER (recommandée à terme)
| Champ | Détail |
|---|---|
| Principe | Montant **serveur** (lookup `services.base_price_ttc` par slug, client ignoré) + **auth** par secret partagé `HC_PAYMENT_SECRET` + **idempotence** (clé Stripe) + rejet prestations sur devis. Webhook signé pour confirmer le paiement avant prestation. |
| Fichiers/fonctions | `supabase/functions/stripe-create-payment-link/index.ts` (remplacer par `PROPOSED_index.ts` déjà écrit) ; secret env `HC_PAYMENT_SECRET` ; (webhook) `stripe-webhook`. |
| Impact client | Aucun tant que le front reste gelé ; à la réactivation, paiement à montant **fiable** (fin de l'exploit 1€). |
| Prérequis | **Clé Stripe TEST** (`sk_test_`) pour valider hors LIVE ; ne repasser LIVE qu'après E2E TEST PASS. |
| Commande exacte | (sur GO) déployer la fonction depuis `PROPOSED_index.ts` + définir `HC_PAYMENT_SECRET` ; basculer `app_settings.stripe` en TEST pour l'E2E, puis LIVE. |
| Rollback | redéployer l'ancienne version (versionnée Supabase) ; retirer le secret. |
| Preuve attendue | appel edge sans secret → 401 ; appel avec slug → montant = prix catalogue (jamais le montant client) ; E2E TEST : session Stripe TEST créée au bon montant + webhook signé reçu. |
| Risque | déploiement edge = action prod → **GO Florian** ; ne jamais tester en LIVE. |

## Option B — COUPER/NEUTRALISER l'endpoint (mitigation immédiate, recommandée MAINTENANT)
| Champ | Détail |
|---|---|
| Principe | Tant que le paiement n'est pas réactivé proprement, **désactiver** la capacité de créer des sessions LIVE : soit `app_settings.stripe.configured=false` (l'edge renvoie alors « Stripe pas configuré » 400), soit déployer une version « 503 gelé » de l'edge. |
| Fichiers/fonctions | `app_settings` (clé `stripe`) OU `stripe-create-payment-link/index.ts` (stub 503). |
| Impact client | **Nul côté site** (funnel déjà gelé). Impact = le **dashboard manuel** (si Florian crée des liens de paiement à la main) cesserait de fonctionner → à confirmer avant de couper. |
| Commande exacte | (sur GO) `update app_settings set value = jsonb_set(value,'{configured}','false') where key='stripe';` OU déployer un stub renvoyant 503. |
| Rollback | remettre `configured=true` OU redéployer l'edge normal. |
| Preuve attendue | appel edge → 400/503 ; plus aucune session Stripe créée par un anonyme. |
| Risque | casse le dashboard manuel s'il est utilisé → **question Florian** : utilises-tu encore la création manuelle de liens ? |

## Recommandation
**Court terme : Option B** (neutraliser l'exploit immédiatement) SI le dashboard manuel n'est pas utilisé — à confirmer.
**Cible : Option A** (durcir + Stripe TEST) pour rouvrir un paiement sûr.
**Décision Florian requise** : (1) utilises-tu la création manuelle de liens ? (2) fournis-tu une clé `sk_test_` ?
