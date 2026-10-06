# RLS / Storage / Rollback — Runbook préparé (directive 5664439054 §6)

> **Préparation seule. Aucune migration/policy/Storage appliquée. Aucune écriture PROD.**
> Projet PROD Supabase : `btcbjwqiivhpwoszomhg`. À exécuter uniquement sur GO Florian, gate par gate.

## A. RLS `leads` — à CERTIFIER (SEC-2)
**Objectif** : l'insertion publique est voulue (formulaires), mais **aucune lecture publique** ne doit être possible.
- **Vérif (lecture seule, à faire avec accès DB)** :
  1. Lister les policies : `select * from pg_policies where tablename='leads';`
  2. Confirmer : une policy `INSERT` pour le rôle `anon` (voulue) ; **aucune** policy `SELECT`/`UPDATE`/`DELETE` pour `anon`/`public`.
  3. Test négatif (clé anon) : `select * from leads limit 1;` doit renvoyer **0 ligne / erreur RLS**.
- **Si une lecture publique existe** → durcissement (migration PROPOSED) : révoquer toute policy SELECT anon sur `leads`, ne garder que `leads_public_insert`.
- **ACTION_FLORIAN** : soit certifier (les 3 vérifs OK) soit `supabase db push` de la migration de durcissement. **Rollback** : `supabase db reset` sur branche de test, ou revert de la migration.

## B. `service_orders` — insert anon direct (P2)
- **Constat** (audit) : `nos-prestations.html` insère `price_ttc`/`deposit` **calculés client** directement via clé anon.
- **Vérif** : `select * from pg_policies where tablename='service_orders';` → l'INSERT anon existe-t-il ? Le prix est-il recalculé côté serveur (trigger/edge) ?
- **Durcissement préparé** : edge de création qui recalcule le montant depuis une table `services` + règle TVA serveur ; migration RLS retirant l'INSERT anon direct (l'insert passe par l'edge en service_role).
- **ACTION_FLORIAN** : GO edge + migration. **Rollback** : revert migration (réautorise l'insert anon), redeploy edge n-1.

## C. Storage (photos leads / prestations)
- **Constat** : upload via edge `upload-lead-photos` **token-gated** (jeton 15 min usage unique émis par submit-lead-v6) ; pas d'upload anonyme direct. `lead-photo-signed-url` sert des URLs signées.
- **Vérif** : buckets privés (non public) ; policies Storage n'autorisant pas la lecture/écriture anonyme directe ; `purge-orphan-lead-photos` actif.
- **ACTION_FLORIAN** : certifier buckets privés + policies ; sinon migration de durcissement. **Rollback** : revert policy.

## D. Rollback / smoke PROD (si un jour merge→main→prod)
> Rien ici n'est exécuté. Plan pour le jour du GO prod (hors périmètre RC actuel).
1. **Avant** : tag/snapshot de `main` actuel (`git tag prod-YYYYMMDD <main>`), noter le SHA Netlify déployé.
2. **Deploy** : merge `recette`→`main` (FF), laisser Netlify build ; vérifier le déploiement.
3. **Smoke 10 min** : routes clés 200 (`/`, `/catalogue`, `/nos-prestations`, `/contact`, `/sitemap.xml`, `/robots.txt`) ; 1 lead réel **NE PAS TRAITER** (doit être auto-archivé + **pas** d'email agence grâce à la garde corrigée) ; price gate = pas de prix sans identification ; mobile.
4. **Rollback** : `git revert` du merge → redeploy Netlify du SHA précédent (`main` gelé = point de retour) ; pour l'edge : redeploy version n-1 ; pour une migration : revert SQL préparé.
5. **Monitoring** : formulaires/leads 24 h.

## Statut
`RLS_LEADS=À_CERTIFIER (gate DB)` · `SERVICE_ORDERS=durcissement préparé (gate DB+edge)` · `STORAGE=à certifier (gate DB)` · `ROLLBACK=plan prêt`. Aucune mutation faite.
