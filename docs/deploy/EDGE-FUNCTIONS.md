# Déployer une fonction edge — la règle et les prérequis

> Écrit le 2026-09-23 (directive 5796732231 §1, §3, §4). **Rien de ce document n'a été déployé.**

## 1. La règle, en une phrase

**Une fonction ne part en production que si elle est en état `current` dans
`supabase/functions/DEPLOIEMENT.json`.** Un dossier qui existe ne suffit pas, n'a jamais suffi à
être une décision, et ne suffit plus techniquement.

### Avant / après

| | Avant le 23/09 | Depuis |
|---|---|---|
| Ce que déployait `main` | **tout** `supabase/functions/*/` | seulement les fonctions `current` |
| Une nouvelle fonction | partait en prod au premier merge | fait **échouer** le workflow tant qu'elle n'est pas déclarée |
| Un échec de déploiement | avertissement, le workflow réussissait quand même | le workflow échoue |
| Conséquence d'un `recette → main` | création de 10 fonctions jamais décidées | aucune |

### Les trois états

| État | Sens | Le workflow la déploie ? |
|---|---|---|
| `current` | déployée en production, redéploiement automatique autorisé | **oui** |
| `pending` | présente dans le dépôt, **pas** en production | non, jamais |
| `quarantine` | déployée, mais sous surveillance : chaque déploiement est une décision humaine | non, jamais automatiquement |

Passer une fonction en `current` est une modification visible de `DEPLOIEMENT.json`, donc un acte
tracé dans un commit et relu comme tel.

**Garde** : `node scripts/tests/deploy-allowlist.test.mjs` (19 contrôles), lancé **avant** le moindre
`supabase functions deploy` dans le workflow. Il échoue si un dossier n'est pas déclaré, si une
`pending` devient déployable, si une `current` n'est en fait pas en production, ou si le workflow
cesse d'appliquer la liste.

## 2. `create-payment-session` — `KEEP_PENDING_DEPLOY`

Elle est **appelée par le tunnel en ligne** (`assets/hc-demande.js`) et **n'est pas déployée**.
Elle répond 404 ; le code le gère et **masque le bloc « Payer en ligne »**. Aucun message d'erreur,
aucun bouton qui échoue : le client ne voit simplement pas le paiement en ligne.

**L'appel est conservé, la fonction aussi.** Le besoin produit existe ; on ne démonte pas un chemin
qu'il faudra rebrancher.

### Les prérequis avant GO, tous à satisfaire

1. **Stripe en TEST d'abord.** Clé `sk_test_`, aucune clé LIVE, sur la recette uniquement.
2. **Montant calculé côté serveur**, jamais celui envoyé par le navigateur — c'est exactement le
   défaut corrigé sur `stripe-create-payment-link` ; la même règle s'applique ici.
3. **Même dossier** : la session de paiement se rattache au lead créé par `submit-lead-v6`
   (`lead_id` + `pay_token`), jamais à des données reçues telles quelles.
4. **Idempotence** : deux clics ne créent pas deux sessions ; une session en attente pour le même
   dossier et le même montant est renvoyée.
5. **Rejeu de la vérification** : `mode: 'check'` doit être sans effet de bord, appelable en boucle.
6. **Retour arrière** : la fonction reste `pending` ; on annule en la repassant `pending` et en
   redéployant l'état précédent. Le site n'a pas besoin d'être modifié : il sait déjà se passer
   d'elle.
7. **Contrôle après déploiement** : un parcours complet en TEST, du panier au retour de paiement,
   et la preuve qu'aucun paiement réel n'a été créé.

Tant que ces sept points ne sont pas tenus et validés par Florian, l'état reste `pending`.

## 3. `actu-generator` et `auto-publish-from-photos` — `PENDING_PRODUCT_DECISION`

Deux écrans d'administration les appellent alors qu'elles ne sont pas déployées. Le bouton ne doit
pas avoir l'air de fonctionner pour finir en 404 : les écrans détectent l'absence de la fonction et
**désactivent l'action en le disant**, au lieu de laisser l'utilisateur tomber sur une erreur.

Elles ne seront pas déployées « parce qu'un écran les appelle » : c'est une décision produit.

## 4. Les fonctions en quarantaine

Huit fonctions sont `quarantine` :

- les **sept qui écrivent sur GitHub** (`gh-*`, `sync-files-staging-to-main`) — voir
  `docs/security/DECISION-FONCTIONS-GITHUB-2026-09-23.md`. Elles ne sont **pas supprimées** :
  24 heures sans appel ne prouvent rien, et une fenêtre d'observation plus longue est nécessaire,
  ainsi qu'une vérification des outils externes qui pourraient les appeler ;
- `stripe-create-payment-link`, parce qu'une version durcie l'attend : un redéploiement automatique
  remettrait la version vulnérable en ligne.

## 5. Déployer une fonction, le jour du GO

1. vérifier son état et le faire passer à `current` dans `DEPLOIEMENT.json` (commit dédié) ;
2. `node scripts/tests/deploy-allowlist.test.mjs` doit passer ;
3. relever la version en production avant (pour le retour arrière) ;
4. déployer, puis exécuter les contrôles d'après-déploiement propres à la fonction ;
5. mettre à jour `docs/audit/fonctions-deployees.json`.

Retour arrière : redéployer la version relevée à l'étape 3, et repasser l'état à `pending` ou
`quarantine`.
