# Paiement

> Mise à jour : 2026-09-20. Deux chemins de paiement coexistent : **l'un est sûr, l'autre est un
> point de sécurité ouvert.** Les connaître tous les deux évite un incident.

## 1. Paiement client du tunnel — `create-payment-session` (sûr)

Le paiement en ligne d'une demande finalisée est **facultatif** et **Stripe TEST uniquement** :

- la fonction refuse toute clé qui n'est pas `sk_test_` et ne lit **jamais** la configuration Stripe
  de production ;
- le client prouve qu'il est l'auteur du dossier (`pay_token` remis à la finalisation) ;
- le **montant est recalculé côté serveur** depuis le catalogue : jamais celui envoyé par le
  navigateur ;
- un panier non éligible (sur devis, mixte) n'ouvre pas de paiement.

Webhook associé : `stripe-webhook-test` (signature vérifiée avec `STRIPE_TEST_WEBHOOK_SECRET`).

**Pour passer un jour en production** : fournir la clé LIVE par les secrets (pas par la base),
rebrancher le webhook signé, garder le montant serveur et l'idempotence, puis vérifier de bout en bout
sur un vrai paiement à 1 €.

## 2. Lien de paiement back-office — `stripe-create-payment-link` 🔴

Utilisée par `admin-pro/paiements.html` et `admin-pro/interventions.html` pour envoyer un lien de
paiement à un client. **Telle qu'elle est déployée aujourd'hui** :

| Constat | Conséquence |
|---|---|
| `verify_jwt = false` → **appelable par n'importe qui** | aucune authentification |
| le **montant vient du corps de la requête** | un tiers peut créer un lien de n'importe quel montant |
| la clé Stripe lue est celle de `app_settings.stripe` (**production**) | les sessions créées sont réelles |
| chaque appel insère une ligne dans `payments` | la table peut être polluée |

Les pages qui l'appellent sont bloquées côté site (`_redirects` renvoie `/admin-pro/valider-staging.html`
et `/admin-pro/photos.html` en 404), mais **la fonction, elle, reste publique**.

**Correction proposée (décision + déploiement humains)** : exiger une authentification
(`verify_jwt` ou jeton serveur), calculer le montant côté serveur à partir d'une intervention
existante, limiter le débit, et journaliser l'appelant. Tant que ce n'est pas fait, considérer la
fonction comme exposée.

La source a été récupérée depuis la production le 20/09 et versionnée dans
`supabase/functions/stripe-create-payment-link/` : elle n'avait aucune source dans le dépôt.

## Où regarder quand un paiement pose question

| Question | Où |
|---|---|
| le paiement a-t-il abouti ? | table `payments` (`status`, `stripe_checkout_session_id`) |
| quelle clé a servi ? | `metadata.stripe_session.livemode` sur la ligne `payments` |
| le webhook a-t-il été reçu ? | journaux de la fonction `stripe-webhook-test` |
| le montant est-il celui du catalogue ? | recalcul serveur : `create-payment-session` (jamais le DOM) |

## Règles

- **Jamais de clé LIVE en recette**, jamais de clé dans le dépôt.
- **Jamais de montant venant du navigateur.**
- Un paiement réel de test se fait avec l'accord explicite de Florian, sur un montant symbolique,
  et se documente.
