# Espace récapitulatif final + paiement en ligne facultatif (directive 5713247831)

**Recette uniquement, Stripe TEST uniquement.** Aucune clé live n'est lue ni acceptée par ce lot.

## Ce que voit le client
Écran final = **dossier complet** : référence, client (prénom + nom), téléphone, email, adresse, prestations avec ce qui est inclus, montant par ligne et total, préférence de prise en charge, **réserve tarifaire**, prochaines étapes, coordonnées de l'agence. Il peut **imprimer ou enregistrer en PDF** et **demander une modification** (email pré-rempli avec la référence ; pas d'édition sauvage d'un dossier déjà transmis).

Paiement **facultatif** : proposé seulement si **toutes** les prestations sont à prix ferme. Sinon : « Paiement disponible après validation de l'agence ». Après paiement : « Paiement reçu » + montant + date, même dossier ; en cas d'annulation, le dossier est conservé et un nouvel essai est possible.

## Garanties serveur
- `create-payment-session` : jeton remis au **seul auteur** de la demande (7 j), montant **recalculé** depuis le catalogue (celui du navigateur est ignoré), éligibilité « tout à prix ferme », clé **`sk_test_` uniquement** (toute autre clé → `live_key_refused`), jamais la configuration Stripe de production, idempotence Stripe, URL de retour limitée aux domaines du site.
- `stripe-webhook-test` : signature vérifiée (HMAC SHA-256, 5 min), **événement live refusé**, idempotent (événement rejoué ou dossier déjà payé → rien), met à jour **le même dossier** puis envoie **une** alerte agence « Paiement reçu — dossier HC-… » et **une** confirmation client distincte.

## Preuves (pile Supabase locale isolée, sans Stripe)
`PAY_A` → `PAY_L` tous OK : jeton remis à la finalisation, montant serveur (114 € alors que le client envoyait 1 €), indisponible sans clé TEST, création bloquée (`missing_stripe_test_key`), jeton falsifié refusé (403), prestation non éligible refusée, webhook signé → payé sur le même dossier, rejeu sans effet, dossier payé jamais refacturé, signature invalide refusée, événement live refusé, statut « payé » relu par le récapitulatif.
Preview (simulation) : récapitulatif complet, bouton « Régler … (simulation) » → « Paiement reçu », cas non éligible sans bouton, 1440 et 390 sans débordement.

## Ce qui n'a PAS pu être testé : le vrai passage par Stripe TEST
Aucune clé Stripe TEST n'est disponible. Le paiement réel sur la page Stripe (carte de test `4242 4242 4242 4242`) reste à faire après le geste ci-dessous. `STRIPE_TEST = BLOCKED_MISSING_STRIPE_TEST_KEY`.

## Gate — gestes de Florian
1. Dans le tableau de bord Stripe **en mode Test** : récupérer la clé secrète `sk_test_…` ; créer un endpoint de webhook vers `https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/stripe-webhook-test` (événements `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_failed`) et récupérer son secret `whsec_…`.
2. Poser les secrets et déployer :
```bash
supabase secrets set STRIPE_TEST_SECRET_KEY="sk_test_…" STRIPE_TEST_WEBHOOK_SECRET="whsec_…" --project-ref btcbjwqiivhpwoszomhg
supabase functions deploy submit-lead-v6 notify-lead-v6 lead-auto-reply create-payment-session stripe-webhook-test --project-ref btcbjwqiivhpwoszomhg
supabase functions deploy stripe-webhook-test --no-verify-jwt --project-ref btcbjwqiivhpwoszomhg   # Stripe n'envoie pas de jeton Supabase
```
3. Tester sur la preview avec `?live=1` (badge rouge « ENVOI RÉEL ») : prestation à prix ferme → Régler → carte `4242 4242 4242 4242` → retour « Paiement reçu » sur le même dossier ; puis un paiement annulé ; puis un panier « sur devis » (aucun bouton).

Le paiement **live** en production reste hors de ce lot : il demandera une décision et un GO séparés (et le traitement de l'ancienne fonction `stripe-create-payment-link`, signalée en août).
