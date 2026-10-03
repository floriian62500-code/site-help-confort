# P0 — Clôture réelle nettoyage + sécurité + paiement en ligne

message_id: CHATGPT-2026-09-26-P0-CLOSE-SECURITY-CLEANUP-PAYMENT
priority: P0
status: TO_EXECUTE
date: 2026-09-26
needs_human: true

## Décision Florian

Il faut FINALISER et CLOTURER le chantier nettoyage/sécurisation. Les sujets ne doivent plus rester au stade « préparé » sans état de clôture clair.

Le paiement en ligne fait explicitement partie du périmètre de clôture et ne doit plus être traité comme un sujet secondaire.

## Règle

Claude doit maintenant fermer tout ce qui peut l'être sans mutation production, puis produire une liste très courte des seules actions production qui nécessitent le GO explicite Florian.

Pas de nouvelle feature. Pas de nouveau chantier. Pas de nouveau rapport dispersé.

## 1. Paiement en ligne — clôture obligatoire du diagnostic

Publier un état unique et sans ambiguïté pour :
- stripe-webhook ;
- stripe-create-payment-link ;
- create-payment-session si encore appelé ;
- pages/admin qui déclenchent un paiement ;
- source serveur du montant ;
- TEST vs LIVE ;
- idempotence ;
- authentification appelant ;
- vérification rôle ;
- URL retour ;
- stockage du statut payment ;
- webhook signature ;
- rollback.

Pour chacun, classer exactement :
- PROD_SAFE
- PROD_UNSAFE
- NOT_DEPLOYED
- QUARANTINED
- NEEDS_FLORIAN_GO

Interdiction d'utiliser « prêt » ou « durci » sans dire si c'est réellement en production.

## 2. Correctifs paiement à terminer hors prod

Avant toute demande de GO, il faut que les versions de staging soient réellement déployables et que les tests couvrent :
- faux webhook refusé ;
- replay refusé ;
- absence de secret = fail closed ;
- montant client ignoré/refusé ;
- montant serveur utilisé ;
- appel sans auth refusé ;
- mauvais rôle refusé ;
- séparation TEST/LIVE ;
- idempotence ;
- URL retour non autorisée refusée ;
- aucun secret dans app_settings si le chemin sécurisé utilise l'environnement.

Si create-payment-session ou un autre endpoint parallèle existe encore, le recenser et décider : intégrer au paquet sécurisé ou désactiver/quarantiner. Aucun endpoint paiement oublié.

## 3. Nettoyage sécurité — clôture documentaire unique

Créer un document unique de clôture avec trois colonnes :
- CLOTURE SUR RECETTE
- A APPLIQUER EN PROD AVEC GO
- BLOQUE / DECISION FLORIAN

Y inclure obligatoirement :
- Netlify build hook ;
- inscription publique ;
- app_settings ;
- leads anon ;
- bucket photos ;
- fonctions GitHub write ;
- PAT navigateur/localStorage ;
- admin-pro exposé ;
- logs PII ;
- historique chat localStorage ;
- permissions supabase-deploy.yml ;
- tables sans migrations/policies visibles ;
- paiement Stripe complet.

Ne rien omettre sous prétexte que le point a déjà été documenté ailleurs.

## 4. Code cleanup — clôture obligatoire

Confirmer avec preuve :
- 0 copie conflit ;
- 0 workflow doublon ;
- 0 secret privilégié suivi ;
- 0 script qui écrit au simple import ;
- 0 test qui salit le dépôt ;
- migrations proposées hors dossier auto-appliqué ;
- documents de contrôle contradictoires corrigés ou explicitement obsolètes ;
- PROJECT_STATE.json remis à jour ;
- TABLEAU-EXECUTION-FINAL.md ne doit plus annoncer un faux état final ;
- aucun rapport nightly inutile ne doit faire croire qu'une release fonctionnelle a avancé.

## 5. Production : aucune action sans GO explicite

Ne PAS appliquer en production dans cette instruction :
- migration ;
- rotation de secret ;
- fonction Stripe ;
- fonction GitHub ;
- changement RLS ;
- fermeture signup ;
- Netlify hook ;
- déploiement site.

Mais préparer un runbook final numéroté, exécutable en une seule séquence après GO Florian.

## 6. Définition de DONE

Le chantier n'est DONE que si :
1. tout ce qui est corrigeable hors prod est réellement corrigé/testé ;
2. aucun correctif sensible n'est seulement « caché » sous un nom non déployable ;
3. le paiement en ligne a un état exhaustif ;
4. les risques restants sont uniquement des actions humaines/prod identifiées ;
5. la source de vérité est à jour ;
6. NEXT_ACTION contient uniquement les GO humains nécessaires, pas de nouveau travail technique diffus.

## Retour attendu

Publier UN rapport consolidé :
- CLEANUP_FINAL_STATUS
- PAYMENT_FINAL_STATUS
- PAYMENT_ENDPOINT_MATRIX
- SECURITY_FINAL_STATUS
- CLOSED_ON_RECETTE
- PROD_ACTIONS_REQUIRING_GO
- BLOCKED_DECISIONS
- TESTS_FINAL
- CONTROL_PLANE_CLEANUP
- RUNBOOK_PROD_SEQUENCE
- NO_PROD_MUTATION_PROOF
- SHA_FINAL
- NEXT_ACTION = WAIT_FLORIAN_GO_ONLY

Aucun nouveau sujet après ce rapport. STOP.