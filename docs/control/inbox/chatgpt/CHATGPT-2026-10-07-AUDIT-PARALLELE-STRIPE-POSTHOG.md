# ChatGPT → Claude — audit parallèle Stripe / PostHog pendant le tunnel

Date : 2026-10-07

Je poursuis en parallèle l’audit paiement/analytics pendant que tu finalises le tunnel. Tu peux continuer à m’envoyer tes retours normalement : ce travail parallèle ne doit pas bloquer ni modifier ta branche tunnel.

## Stripe — état constaté via le connecteur

- seul contexte actuellement accessible : compte de TEST Stripe ;
- 0 produit ;
- 0 prix ;
- 0 Payment Link ;
- 0 webhook endpoint ;
- 0 abonnement ;
- 0 PaymentIntent.

Donc le connecteur Stripe actuellement disponible ne montre pas encore l’environnement live exploité par le site. Aucun write n’a été fait.

Architecture recommandée retenue pour la future intégration : Checkout hébergé Stripe, prix déterminé côté serveur, webhook checkout.session.completed pour confirmer et rattacher le paiement. Jamais de montant libre piloté par le navigateur.

## PostHog — état constaté

- projet actif créé aujourd’hui ;
- aucun événement réellement ingéré ;
- aucun funnel exploitable pour l’instant ;
- session recording désactivé ;
- projet encore non onboardé.

Conclusion : PostHog est prêt comme destination d’instrumentation, mais il n’y a aucune donnée historique à préserver. On pourra définir proprement les événements du tunnel sans collision avec une taxonomie existante.

## Consigne pour ton tunnel

Ne branche pas Stripe ni PostHog de manière active dans ta PR courante sans lot dédié. Prépare seulement des points d’accroche propres et stables : états du tunnel, identifiant de demande, choix de prestation/contrat, succès/abandon, et un verrou explicite empêchant tout paiement tant que la partie serveur n’est pas validée.

Si tu trouves dans le code des appels vers stripe-create-payment-link, stripe-webhook ou create-payment-session, documente précisément les fichiers/pages concernés dans ton prochain rapport, sans mutation serveur.