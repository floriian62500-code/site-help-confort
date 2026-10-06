# Controle ChatGPT — HOLD production, priorité sécurité avant release fonctionnelle

message_id: CHATGPT-2026-09-25-PROD-HOLD-SECURITY-1
priority: P0
status: TO_EXECUTE
date: 2026-09-25
needs_human: true

## Verdict

La release C est techniquement propre et testée, mais la mise en production est placée en HOLD.

Motif : le rapport DEEP-CLEAN-SECURE identifie plusieurs vulnérabilités CRITIQUES actuellement présentes en production. Tant que leur traitement ou leur acceptation explicite n'est pas cadré, on ne pousse pas une release fonctionnelle/SEO supplémentaire.

## État de la release C

Conserver :
- branche : release/lot-c-2026-09-25
- SHA : a33875773d1cfc739b203db86ab53369f64dadb7
- tests : PASS
- behind_by : 0 au dernier contrôle
- production_status : NOT_DEPLOYED

Ne pas merger vers main.
Ne pas déployer.

## Priorité sécurité avant toute mise en prod fonctionnelle

Préparer un plan d'exécution minimal et ordonné pour les risques suivants :

P0-1 — Stripe webhook sans vérification de signature.
P0-2 — création de lien de paiement avec montant piloté par le client et appelant non authentifié.
P0-3 — fonctions d'écriture GitHub ouvertes / jeton serveur / main par défaut.
P0-4 — app_settings lisible par tout compte authentifié alors qu'elle contient des secrets.
P0-5 — écritures anonymes leads / bucket photos.
P0-6 — build hook Netlify exposé : rotation humaine obligatoire.

## Ce que tu dois préparer, sans l'appliquer

Pour chaque P0 :
- état exact en production ;
- fonction/politique/fichier concerné ;
- correctif minimal ;
- dépendances ;
- tests disponibles ou à écrire ;
- ordre d'application ;
- rollback exact ;
- interruption de service éventuelle ;
- besoin de GO humain ;
- preuve que le correctif préparé est réellement déployable (notamment ne pas laisser un HARDENED_index.ts inutilisable par l'outil de déploiement).

## Paquets séparés obligatoires

Ne pas mélanger les sujets.

Préparer au minimum :
1. SECURITY-STRIPE
2. SECURITY-GITHUB-WRITE
3. SECURITY-RLS-SECRETS
4. SECURITY-ANON-WRITES
5. NETLIFY-HOOK-ROTATION (action humaine, runbook seulement)

Aucune feature dans ces paquets.

## Point spécifique Netlify

Le build hook exposé doit être considéré compromis.

Préparer un runbook très court pour Florian :
- où aller dans Netlify ;
- quel hook supprimer/régénérer ;
- comment remplacer la valeur dans l'environnement nécessaire ;
- comment vérifier qu'un ancien hook ne déclenche plus ;
- comment vérifier que le nouveau hook fonctionne si encore utilisé.

Ne pas afficher le secret ou l'ancienne URL dans le dépôt.

## Point spécifique fonctions HARDENED_index.ts

Le rapport dit que certains correctifs existent sous un nom que l'outil ne déploie jamais.

Corriger uniquement la préparation :
- produire la version finale déployable dans un emplacement de staging/non-prod sûr ;
- tests Deno ;
- diff exact vs version prod ;
- commande de déploiement proposée ;
- rollback.

Ne pas déployer.

## RELEASE C

Après préparation sécurité :
- C reste gelée mais conservée proprement ;
- ne pas la reconstruire inutilement ;
- si main avance avant GO, la resynchroniser et retester au dernier moment.

## Source de vérité

Mettre CURRENT-RELEASE.json en statut explicite :
HOLD_SECURITY

avec :
- release C techniquement PASS ;
- blocage prod = risques sécurité critiques ouverts ;
- aucun GO prod ;
- prochain gate = décision Florian sur le paquet sécurité.

## Retour attendu

Publier dans l'outbox :
- SECURITY_HOLD_ACK
- PROD_STATUS
- P0_SECURITY_ORDER
- PACKAGE_STRIPE
- PACKAGE_GITHUB_WRITE
- PACKAGE_RLS_SECRETS
- PACKAGE_ANON_WRITES
- NETLIFY_ROTATION_RUNBOOK
- DEPLOYABLE_HARDENED_PROOF
- TESTS
- ROLLBACKS
- HUMAN_GATES
- CURRENT_RELEASE_UPDATED
- NO_PROD_MUTATION_PROOF
- NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO

Aucune mise en production.
Aucun merge vers main.
Aucune mutation Supabase/Stripe/Netlify sans GO explicite Florian.
