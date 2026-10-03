# Lien de paiement durci — paquet de déploiement

> Demandé par 5808233570 §3. **Rien n'est déployé. Aucun passage en LIVE dans ce lot.**
> Le code est prêt depuis le 22/09 et n'a pas été retouché : ce document ne décrit que l'exécution.

## 1. Ce qui change, en une phrase

La fonction `stripe-create-payment-link` accepte aujourd'hui le **montant envoyé par l'appelant**,
sans vérifier qui appelle. La version durcie lit le montant **sur l'intervention**, n'accepte que le
personnel authentifié, et décide TEST/LIVE **côté serveur**.

## 2. Prérequis exacts, dans l'ordre

| # | Prérequis | Pourquoi |
|---|---|---|
| 1 | Appliquer `supabase/_pending_migrations/20260922140000_interventions_montant.sql` | la version durcie lit `interventions.montant_ttc` ; sans la colonne, elle refuse tout (503) |
| 2 | Poser `STRIPE_MODE=test` et `STRIPE_TEST_SECRET_KEY=sk_test_…` | sans mode explicite, la fonction refuse de démarrer un paiement |
| 3 | **Ne pas** poser `STRIPE_LIVE_SECRET_KEY` dans ce lot | le LIVE exige `STRIPE_MODE=live` **et** une clé `sk_live_` **et** une origine de production : les trois manquent volontairement |
| 4 | Vérifier que `stripe-create-payment-link` est en `quarantine` dans `DEPLOIEMENT.json` | aucun redéploiement automatique ne doit pouvoir remettre la version vulnérable |

Le montant doit être saisi sur l'intervention par le personnel (colonne tracée : qui, quand).

## 3. Ordre de déploiement

1. **Archiver la version en ligne** : `supabase functions download stripe-create-payment-link --use-api`
   → conserver le dossier hors du dépôt. C'est le seul retour arrière fidèle.
2. Appliquer la migration (prérequis 1), vérifier la colonne : elle est idempotente et son rollback
   est fourni à côté.
3. Poser les variables d'environnement (prérequis 2).
4. Remplacer `index.ts` par `HARDENED_index.ts`, puis déployer **avec `verify_jwt = true`**.
5. Repasser l'état de `quarantine` à `current` dans `DEPLOIEMENT.json` **seulement si** vous voulez
   que les déploiements automatiques la suivent désormais. Sinon, la laisser en `quarantine`.

## 4. Contrôles d'après-déploiement — en Stripe TEST uniquement

Les six doivent passer. Aucun ne crée de paiement réel.

| Contrôle | Attendu |
|---|---|
| Appel anonyme | **401** |
| Appel par un client (non personnel) | **403** |
| Montant envoyé dans la requête | **ignoré** : c'est celui de l'intervention qui sert |
| Intervention inconnue / annulée / déjà payée | **404 / 409 / 422** |
| Deux appels de suite sur le même dossier | le **même** lien est renvoyé (idempotence) |
| Lien créé | l'URL Stripe est en **mode test** (`livemode: false`) |

Journal : vérifier qu'aucune ligne ne contient de nom, d'email ni de téléphone.

Ces six contrôles sont déjà couverts par les **14 tests Deno** de `handler.test.ts`, qui tournent
sans réseau. Le déploiement ne fait que les rejouer sur le vrai service.

## 5. Retour arrière

- **Fonction** : redéployer le dossier archivé à l'étape 1. Effet immédiat.
- **Migration** : `20260922140000_interventions_montant.ROLLBACK.sql`. À n'exécuter que si la
  version durcie n'est plus déployée — elle en dépend.
- **Variables d'environnement** : les retirer ne suffit pas à revenir en arrière ; c'est le
  redéploiement de l'ancienne version qui rétablit l'état précédent.

## 6. Ce que ce paquet ne fait pas

- **Aucun passage en LIVE.** Le mode LIVE reste inatteignable tant que les trois conditions ne sont
  pas réunies, et ce lot n'en pose aucune.
- **Aucune modification du site.** Le tunnel n'appelle pas cette fonction ; elle sert au back-office.
- **Aucune suppression** de l'ancienne version : elle reste dans le dépôt, sous son nom, pour le
  retour arrière.
