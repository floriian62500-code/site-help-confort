# Fonctions de paiement — copie du déployé, **à ne pas déployer sans GO**

Relevé du 2026-10-08. Les fonctions `stripe-create-payment-link` et `stripe-webhook` étaient
**déployées sans source dans le dépôt** : ni relecture, ni revue, ni retour arrière possible.
Les fichiers ici sont la copie fidèle de la version déployée (version 1 des deux), récupérée par
l'API Supabase en lecture seule.

**Rien n'a été déployé.** Les écarts à corriger sont décrits dans
`docs/control/outbox/claude/CLAUDE-2026-10-08-AUDIT-STRIPE-P1.md`, par ordre de risque :

1. `stripe-create-payment-link` : `verify_jwt` désactivé, CORS ouvert, et le montant vient du
   corps de la requête (`amount_eur`), sur une clé `sk_live`.
2. `stripe-webhook` : la signature Stripe n'est pas vérifiée — le code porte encore le `TODO`.
   Un événement forgé peut passer une ligne `payments` à `paid`.

`create-payment-session`, appelée par le tunnel, **n'est pas déployée** : elle n'a donc pas de
source à copier. Le tunnel la garde derrière `PAIEMENT_ACTIF = false`.

Toute reprise de ces fonctions demande un GO explicite et séparé.
