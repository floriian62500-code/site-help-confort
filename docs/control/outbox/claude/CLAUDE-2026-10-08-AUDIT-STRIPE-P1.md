# Audit paiement — lecture seule — **deux P1 ouverts**

> **CORRECTION du 2026-10-09** — la phrase « chemin public réel : `hc-reserve-modal.js`, chargé par
> 26 pages métier » ci-dessous est **inexacte**. Les cartes tarif que ce module accroche n'ont
> **aucun balisage** sur les 26 pages (mesuré : 26/26 inertes, seul le CSS subsiste) : le module
> sortait immédiatement et **aucun visiteur ne pouvait déclencher ce paiement**. Les deux P1
> restent entiers — la fonction demeure appelable **directement**, sans authentification, et cela
> ne dépend pas du front. Détail et mesure : `CLAUDE-2026-10-09-PR60-PAIEMENT-FRONT.md`.

Rien n'a été modifié ni déployé. Tout ci-dessous est relevé, pas supposé : sources des fonctions
déployées lues par l'API, tables lues en SQL, call sites lus dans `main` (`919f828c`).

## P1 — n'importe qui peut créer un paiement Stripe **en production réelle**

`stripe-create-payment-link` est **déployée, active, `verify_jwt` désactivé**, avec
`Access-Control-Allow-Origin: *`. Elle lit le corps de la requête et fait :

```
const amount = Number(body.amount_eur);
if (!amount || amount < 1) return ... // seule validation : au moins 1 €
...unit_amount: String(Math.round(amount * 100))
```

Le **montant et le libellé viennent entièrement de l'appelant**. La fonction crée une vraie
Checkout Session Stripe avec la clé lue dans `app_settings`, puis insère une ligne dans `payments`.

**La clé configurée est une clé `sk_live`** — vérifié sans l'afficher : `configured = true`,
préfixe `sk_live`. Ce ne sont donc pas des paiements de test.

Conséquence : un tiers peut obtenir à volonté un lien `checkout.stripe.com` **au nom de HELP
Confort**, avec le montant et le texte de son choix. Le risque principal n'est pas qu'on vous vole
de l'argent — c'est qu'on encaisse **en votre nom** auprès de vos clients, avec les impayés, les
litiges et les remboursements qui suivent. Accessoirement : création illimitée de lignes en base.

~~**Chemin public réel** : `assets/hc-reserve-modal.js`, chargé par **26 pages métier**, lit un prix
dans la page (`parsePrice`) et l'envoie comme `amount_eur`, puis redirige vers le lien reçu.~~
**Corrigé le 09/10** : ce code existait mais n'avait **aucun déclencheur** — 0 carte tarif sur les 26 pages.

## P1 — le webhook accepte n'importe quel message, sans signature

`stripe-webhook` est **déployée, active, `verify_jwt` désactivé**. Son code porte encore :

```
// TODO : vérifier la signature avec webhook_secret quand on l'aura
const event = JSON.parse(rawBody);
```

Elle **ne vérifie pas la signature Stripe** et fait confiance au corps reçu. Sur un
`checkout.session.completed` forgé, elle passe la ligne correspondante à `status = 'paid'`.

Enchaîné avec la première fonction — qui **retourne le `checkout_session_id`** à l'appelant — on
peut marquer une facture payée sans qu'un centime ait bougé. Si le back-office se fie à
`payments.status`, c'est une fraude directe contre l'entreprise.

## Ce qui n'est **pas** arrivé, vérifié

```
public.payments : 2 lignes, toutes « pending », créées le 2026-05-27, 2,00 € au total
aucune ligne « paid », aucune ligne sans payment_intent
```

**Aucune trace d'abus à ce jour.** Les deux portes sont ouvertes, personne ne les a poussées.

## Le reste de la cartographie

| point | relevé |
|---|---|
| `create-payment-session` | **non déployée**. Appelée par `assets/hc-demande.js`, sous verrou `PAIEMENT_ACTIF = false` |
| appels à `stripe-create-payment-link` | `assets/hc-reserve-modal.js` (public, 26 pages), `admin-pro/paiements.html`, `admin-pro/interventions.html` |
| sources dans le dépôt | **aucune** : les trois fonctions n'existent que déployées. Le dépôt ne permet ni relecture ni retour arrière |
| ancienne clé anon révoquée | encore écrite dans 5 fichiers : `espace-client.html`, `espace-client-dashboard.html`, `hc-newsletter.js`, `hc-reserve-modal.js`, `hc-chat-widget.js`. **Elle ne protège rien** ici : la fonction ne vérifie aucune clé |
| test / live | une seule configuration, `sk_live`. Pas de séparation test/production visible |

## Chemin cible — celui que vous avez retenu, et ce qu'il implique

`offer_id` canonique → prix **relu côté serveur** depuis le catalogue → Checkout → webhook signé →
rattachement au lead. Concrètement, le serveur ne doit plus jamais recevoir un montant : il doit
recevoir **ce qui est acheté**, et aller chercher le prix lui-même dans `v_contract_offers` ou
`v_services_public`.

## Ce que je recommande, par ordre de risque — **rien n'est exécuté**

1. **Fermer l'écriture publique.** Retirer l'appel public est **fait** (PR #60), mais ne suffit pas :
   le code était déjà inerte. Il faut **exiger un en-tête d'autorisation sur la fonction**. Tant que
   `verify_jwt` est désactivé et le CORS ouvert, tout le reste est cosmétique.
2. **Vérifier la signature du webhook** avec le `webhook_secret` Stripe, et refuser ce qui n'est pas
   signé. Sans cela, `payments.status` ne vaut rien.
3. **Ne plus accepter de montant** : passer un identifiant d'offre et relire le prix côté serveur.
4. **Verser les trois fonctions dans le dépôt**, pour qu'elles soient relisables et réversibles.
5. **Retirer l'ancienne clé anon** des 5 fichiers (hygiène : elle ne protège rien, mais elle laisse
   croire qu'une clé est nécessaire).
6. **Séparer test et production** avant toute reprise du paiement.

Les points 1 à 3 sont des déploiements de fonction : **je ne les fais pas sans GO explicite**, et le
GO devrait être séparé pour chacun.

## Suite

Je passe à la tâche suivante — Nos métiers (REQ-032) — comme demandé.
