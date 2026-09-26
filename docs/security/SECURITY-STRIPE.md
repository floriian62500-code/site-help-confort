# Paquet SECURITY-STRIPE — P0-1 et P0-2

*Préparé, non appliqué. Aucun déploiement, aucune clé touchée.*

## P0-1 — Le webhook Stripe ne vérifie pas la signature

**État exact en production.** `supabase/functions/stripe-webhook/index.ts` est **déployée** et en
état `current`. Elle lit l'en-tête `stripe-signature`, puis l'abandonne : la ligne de vérification
est commentée derrière un `TODO`, et le corps est désérialisé tel quel.

**Ce que ça permet.** Poster un événement fabriqué sur l'URL publique de la fonction suffit à faire
passer une ligne de `payments` en `paid` — sans qu'un euro ait été versé — ou en `refunded`. Le
back-office affiche ensuite ce statut comme s'il venait de Stripe.

**Correctif minimal.** `supabase/functions-staging/stripe-webhook/index.ts` : une vérification de
signature avant tout traitement. Le reste du fichier est **identique à la production** — le diff
tient en un import, huit lignes et la suppression du `TODO`.

La logique vit à part, dans `_shared/stripe-signature.ts`, pour être testable sans réseau :
HMAC-SHA256 sur `timestamp.corps`, comparaison en **temps constant**, tolérance de 5 minutes contre
le rejeu, acceptation de plusieurs `v1` (rotation de secret).

Trois refus explicites, et chacun a sa raison :

| situation | réponse | pourquoi |
|---|---|---|
| pas de secret configuré | **503** | jamais de repli « on fait confiance au corps » |
| signature absente ou fausse | **400** | c'est le cas d'attaque |
| horodatage hors tolérance | **400** | sinon une requête valide capturée se rejoue à l'infini |

**Dépendances.** Une variable d'environnement à poser **avant** le déploiement :
`STRIPE_WEBHOOK_SECRET` (le `whsec_…` du endpoint, dans le tableau de bord Stripe). Elle ne vient
pas de `app_settings` : cette table est lisible par tout compte authentifié (voir
`SECURITY-RLS-SECRETS.md`). Sans la variable, la fonction refuse tout — c'est voulu, mais cela
signifie que **poser le secret et déployer doivent se faire dans le même geste**.

**Tests.** `supabase/functions-staging/_shared/stripe-signature.test.ts` — **15 contrôles**, sans
réseau : charge signée acceptée ; événement fabriqué refusé (c'est la faille d'aujourd'hui) ;
signature d'un autre corps refusée ; signature faite avec un autre secret refusée ; rejeu refusé ;
absence de secret → 503 et surtout pas d'acceptation par défaut ; en-têtes malformés ; rotation.

**Ordre.** 1 — poser `STRIPE_WEBHOOK_SECRET`. 2 — déployer. 3 — dans Stripe, « Send test webhook »
et vérifier un 200. 4 — rejouer le même corps sans en-tête : doit répondre 400.

**Rollback.** `supabase functions deploy stripe-webhook` depuis `supabase/functions/` : le fichier
d'origine est inchangé dans le dépôt. Retour en moins d'une minute.

**Interruption de service.** Aucune, **à une condition** : si le secret n'est pas posé, tous les
webhooks sont refusés et les paiements cessent d'être marqués payés. D'où l'ordre ci-dessus.

**GO humain : oui** — déploiement de fonction edge + secret Stripe.

## P0-2 — Lien de paiement : montant fourni par le client, appelant non identifié

**État exact.** `supabase/functions/stripe-create-payment-link/index.ts` est déployée, en
`quarantine` (déployée, non redéployée automatiquement). Le montant vient de la requête
(`amount_eur`), seul contrôle `≥ 1 €`. Aucune vérification d'appelant. La clé est lue **en base**,
dans `app_settings`, et l'en-tête du fichier indique qu'il s'agit de la clé de production.

Côté appelants : `admin-pro/interventions.html` demande le montant par un `prompt()`,
`admin-pro/paiements.html` par un champ de formulaire. **Le montant n'existe nulle part côté
serveur.**

**Correctif minimal.** `supabase/functions-staging/stripe-create-payment-link/index.ts` — le
durcissement existait déjà, mais sous un nom que l'outil de déploiement ne retient jamais
(`HARDENED_index.ts`). Il porte désormais le nom `index.ts`, dans un dossier que le workflow ne
regarde pas. Ce qu'il change : montant recalculé côté serveur, appelant authentifié et rôle
vérifié, séparation TEST/LIVE par variable d'environnement, refus si Stripe répond `livemode`
inattendu, URL de retour en liste blanche, clé d'idempotence.

**Dépendances.** La colonne `montant_ttc` sur `interventions`
(`_pending_migrations/20260922140000_interventions_montant.sql`, **non appliquée**) : sans elle, il
n'y a pas de montant serveur à recalculer. **Cette migration est un prérequis, pas une option.**

**Tests.** `supabase/functions-staging/stripe-create-payment-link/handler.test.ts` — 12 contrôles.

**Ordre.** 1 — appliquer la migration du montant. 2 — poser `STRIPE_TEST_SECRET_KEY`. 3 — déployer.
4 — vérifier qu'un appel sans jeton est refusé, et qu'un montant fourni par le client est ignoré au
profit du catalogue.

**Rollback.** Redéployer `supabase/functions/stripe-create-payment-link/index.ts`.

**Interruption.** Les deux pages d'admin qui envoient un montant libre **cesseront de fonctionner**
telles quelles : c'est précisément l'objet du correctif. Elles devront pointer une intervention
dont le montant est en base. À arbitrer avant, pas après.

**GO humain : oui.**
