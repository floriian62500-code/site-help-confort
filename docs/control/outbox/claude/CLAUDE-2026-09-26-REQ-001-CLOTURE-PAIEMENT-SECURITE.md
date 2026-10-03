# REQ-20260926-001 — clôture paiement en ligne / sécurité / nettoyage

run : 2026-09-26 · branche `recette` · **aucune mise en production** · statut : **READY_FOR_CONTROL**
parent : `CHATGPT-2026-09-26-P0-CLOSE-SECURITY-CLEANUP-PAYMENT` · attempt 2

> Règle tenue dans tout ce rapport : le mot « prêt » n'apparaît jamais seul. Chaque ligne dit ce
> qui **tourne en production aujourd'hui**, et séparément ce qui est écrit et testé mais **non
> déployé**. Les deux ne sont pas le même sujet.

## 1. Paiement en ligne — état réel, lu en production

Source : lecture directe des fonctions déployées sur le projet `btcbjwqiivhpwoszomhg` le
2026-09-26 (API Supabase, lecture seule). Ce ne sont pas des souvenirs de code : c'est le code
servi.

### 1.1 Ce qui tourne

| # | sujet | état en production | classement |
|---|---|---|---|
| 1 | `stripe-webhook` | déployée, v1, `verify_jwt=false` | **PROD_UNSAFE** |
| 2 | `stripe-create-payment-link` | déployée, v1, `verify_jwt=false` | **PROD_UNSAFE** |
| 3 | `create-payment-session` | **n'existe pas** dans le projet ; pourtant appelée par `assets/hc-demande.js` (`payApi`) | **NOT_DEPLOYED** |
| 4 | signature du webhook | **jamais vérifiée** : l'en-tête `stripe-signature` est lu, puis la vérification est un `// TODO` en commentaire | **PROD_UNSAFE** |
| 5 | authentification de l'appelant (lien de paiement) | **aucune** : POST public, CORS `*` | **PROD_UNSAFE** |
| 6 | vérification du rôle | **aucune** | **PROD_UNSAFE** |
| 7 | source du montant | **le corps de la requête** (`body.amount_eur`), seul garde-fou `>= 1 €` | **PROD_UNSAFE** |
| 8 | TEST vs LIVE | déterminé par la clé lue dans `app_settings.stripe.secret_key` ; `livemode` seulement recopié en metadata | **NEEDS_FLORIAN_GO** |
| 9 | secret Stripe | stocké **en base**, table `app_settings`, pas en variable d'environnement | **PROD_UNSAFE** |
| 10 | idempotence | **aucune** : ni `Idempotency-Key` côté Stripe, ni déduplication d'événement côté webhook | **PROD_UNSAFE** |
| 11 | URL de retour | en dur, `https://depan59-62.fr/paiement-ok.html` / `paiement-annule.html` | **PROD_SAFE** |
| 12 | stockage du statut | table `payments` (`pending` → `paid`/`failed`/`expired`/`refunded`), champ `created_by` codé en dur à `"manual_dashboard"` même pour un appel public | PROD_SAFE sur la forme, **trompeur** sur la traçabilité |
| 13 | paiement public depuis le site | **gelé depuis le 2026-08-08** : `hc-reserve-modal.js` route vers une demande de devis au lieu du paiement | **QUARANTINED** |
| 14 | déclencheurs admin | `admin-pro/paiements.html` et `admin-pro/interventions.html` appellent la fonction avec un montant saisi | **PROD_UNSAFE** (par la fonction, pas par la page) |

### 1.2 Ce que ça permet concrètement, aujourd'hui

Deux conséquences, et je les écris sans adoucir :

1. **N'importe qui peut marquer un paiement comme encaissé.** Un POST anonyme sur
   `stripe-webhook`, avec un JSON `{"type":"checkout.session.completed","data":{"object":{"id":"cs_…"}}}`,
   passe `status` à `paid` sans qu'un euro soit versé. Le même chemin permet `refunded`.
2. **N'importe qui peut créer un lien de paiement au montant de son choix.** La fonction est
   publique et le montant vient du client. Avec une clé LIVE dans `app_settings`, c'est un lien
   Stripe réel.

Le gel du 2026-08-08 a fermé la porte côté **site public** (aucun bouton n'y mène). Il n'a pas
fermé les **fonctions**, qui restent joignables directement.

### 1.3 Ce qui est écrit, testé, et NON déployé

`supabase/functions-staging/` — deux fonctions durcies et leur module partagé. **64 tests Deno,
0 échec**, rejoués aujourd'hui.

| écart avec la production | staging |
|---|---|
| signature du webhook | **vérifiée** (HMAC-SHA256 sur `t.corps`, comparaison en temps constant, tolérance 5 min, refus si secret absent — jamais de repli permissif) |
| secret | lu dans l'**environnement** (`STRIPE_WEBHOOK_SECRET`, `STRIPE_TEST_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY`), plus jamais dans `app_settings` |
| montant | **relu en base** sur l'intervention (`montant_ttc`), jamais accepté du client |
| authentification | JWT vérifié **dans** la fonction (`auth.getUser`), puis rôle contrôlé dans `user_profiles` |
| idempotence | `Idempotency-Key` sur l'appel Stripe ; réutilisation du lien existant si la session est encore valide |
| TEST/LIVE | `STRIPE_MODE` explicite, deux clés séparées |

**Prérequis avant tout déploiement** — et c'est pour ça que rien n'est déployé :

1. la migration `supabase/_pending_migrations/20260922140000_interventions_montant.sql` (colonne
   `montant_ttc`) doit être appliquée **avant** la fonction, sinon la relecture serveur échoue ;
2. les trois variables d'environnement doivent exister dans le projet ;
3. `admin-pro/interventions.html` doit enregistrer le montant sur l'intervention **avant**
   d'appeler la fonction ;
4. le endpoint webhook Stripe doit fournir son `whsec_…`.

### 1.4 Ordre de déploiement proposé, et retour arrière

| étape | action | retour arrière |
|---|---|---|
| 1 | appliquer `20260922140000_interventions_montant.sql` | `…ROLLBACK.sql` fourni |
| 2 | poser les 3 variables d'environnement | les retirer |
| 3 | déployer `stripe-webhook` durcie | redéployer la v1 archivée |
| 4 | vérifier un événement de test Stripe (mode test) | — |
| 5 | déployer `stripe-create-payment-link` durcie | idem étape 3 |
| 6 | brancher l'écran Interventions sur le montant serveur | revert du commit |

Chaque étape est **NEEDS_FLORIAN_GO** : elles touchent la production.

## 2. Sécurité hors paiement — état réel

| # | sujet | état | classement |
|---|---|---|---|
| 15 | `gh-push-inline`, `gh-edit-file`, `gh-push-batch`, `gh-push-from-chunks`, `gh-delete-files`, `gh-bulk-purge-seo-stats` | déployées, **`verify_jwt=false`** : écriture GitHub joignable sans authentification | **PROD_UNSAFE** |
| 16 | versions durcies de `gh-push-inline` et `gh-edit-file` | écrites, testées (incluses dans les 64 tests) | **NOT_DEPLOYED** |
| 17 | `app_settings` (secrets Stripe, jetons) | lisible par tout compte authentifié | **PROD_UNSAFE** — correctif `PROPOSED_app_settings_lecture_restreinte.sql` **NOT_DEPLOYED** |
| 18 | insertion anonyme dans `leads` | possible ; durcissement écrit (`PROPOSED_20260821_leads_insert_hardening.sql`) | **NOT_DEPLOYED** |
| 19 | bucket photos `site-photos` | durcissement écrit (`PROPOSED_20260822_storage_site_photos_hardening.sql`) | **NOT_DEPLOYED** |
| 20 | crochet de build Netlify exposé | procédure de rotation écrite (`docs/security/NETLIFY-HOOK-ROTATION.md`) ; **le secret n'est ni affiché ni versionné** | **NEEDS_FLORIAN_GO** |
| 21 | inscription publique ouverte | ouverte | **NEEDS_FLORIAN_GO** |
| 22 | `promote-to-prod`, `sync-files-staging-to-main`, `hc-content-save` | déployées, `verify_jwt=false` | **PROD_UNSAFE** (non traité : hors des 5 paquets préparés) |

## 3. Nettoyage du dépôt — état

| sujet | état | classement |
|---|---|---|
| copies de conflit iCloud (162 fichiers + 7 dans `.git` + 2 dossiers) | supprimées après preuve d'identité, `.gitignore` étendu | **fait** |
| fichiers internes servis par Netlify (`docs/`, `scripts/`, `supabase/`, `tools/`, `logs/`, `.github/`…) | 33 règles `404!` dans `_redirects` | **fait** |
| scripts qui écrivaient à l'import | 4 corrigés, garde permanente | **fait** |
| secrets en clair dans le dépôt | 0 sur 1 346 fichiers suivis, contrôlé à chaque exécution | **fait** |
| garde d'hygiène | `depot-propre` : 10 contrôles, verts | **fait** |

## 4. Ce qui attend un GO de Florian — la liste courte

1. **Webhook Stripe signé** (étapes 1 à 4 ci-dessus). Sans lui, un tiers peut déclarer un paiement
   encaissé. C'est le premier de la liste.
2. **Lien de paiement à montant serveur** (étapes 5 et 6).
3. **Fermer l'écriture GitHub non authentifiée** (paquet 16).
4. **Restreindre `app_settings`** (paquet 17) — à faire **après** le passage des secrets Stripe en
   variables d'environnement, sinon la fonction en production perd sa clé.
5. **Rotation du crochet Netlify** (20) et **fermeture de l'inscription publique** (21).

Rien d'autre ne demande de décision : le reste est soit fait, soit préparé et en attente de ces
cinq-là.

## 5. Preuves

- fonctions lues en production le 2026-09-26 : `stripe-create-payment-link` (v1, créée le
  2026-05-27, `verify_jwt=false`) et `stripe-webhook` (v1, même jour) — le `// TODO` de signature
  est dans le code servi, pas dans une copie ;
- `create-payment-session` : absente des 62 fonctions du projet, alors que le tunnel l'appelle ;
- 64 tests Deno du paquet durci, 0 échec, rejoués ce jour ;
- suite du site : 784 contrôles, 0 échec.

## NO_PROD_MUTATION_PROOF

- ce rapport n'a produit **aucune écriture** : les seules interactions avec Supabase ont été des
  lectures (liste des fonctions, source des fonctions, listage de buckets publics) ;
- aucune migration appliquée, aucune fonction déployée, aucune variable d'environnement posée ;
- aucun commit hors `docs/control/` ; `origin/main` toujours sur `570225bf` (2026-09-25).

## NEXT_ACTION

`WAIT_FLORIAN_SECURITY_GO` sur les cinq points du §4, dans cet ordre. Je ne marque pas CLOSED.
