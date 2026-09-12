# RUNBOOK INCIDENT — site Help Confort

> Procédures minute-par-minute. `recette` = Deploy Preview PR#2 ; prod = `main` = apex depan59-62.fr.

## Panne formulaire / wizard (leads non créés)
1. Console navigateur + `read_network_requests` → l'appel `submit-lead-v6` échoue ?
2. Supabase → Edge Functions → logs `submit-lead-v6`. Vérifier la clé publishable front (pas l'anon JWT désactivé).
3. Tester `node scripts/tests/smoke.mjs` (catalogue + pages). Corriger sur recette, pousser, revérifier.

## Panne Supabase (catalogue vide / 400)
1. Vérifier `v_services_public` (REST) répond. Ne PAS ajouter `_ts=` (parsé comme filtre → 400).
2. RLS : `services` doit avoir SELECT public. Vérifier `get_advisors`.

## Panne / incident Stripe
1. **Le paiement client est GELÉ** (front `return` 2503). Si un paiement LIVE anormal apparaît : l'edge `stripe-create-payment-link` est le vecteur (P1). Neutraliser : `app_settings.stripe.configured=false` (GO Florian).
2. Ne jamais tester en LIVE. Clé LIVE dans `app_settings` (service_role).

## Rollback recette
`git revert <sha>` sur recette + push, OU `git checkout <bon-sha> -- <fichier>`. Tags `savepoint/*` pour les gros retraits.

## Rollback PROD (main)
JAMAIS de merge aveugle. Promotion = cherry-pick contrôlé (build-release-lot.mjs). Rollback = revert du commit promu sur main + vérif Netlify prod. **GO humain.**

## Désactivation runner autonome
Kill-switch : créer `docs/control/RUNNER_STOP` (préflight SKIP). OU Actions → Disable workflow. OU supprimer le secret `CLAUDE_CODE_OAUTH_TOKEN`.

## Restauration branche / tag
`git checkout -b restore <tag>` (ex. `savepoint/backup-png-pre-removal`). Tags de sauvegarde poussés avant chaque gros retrait.

## Rotation d'un secret compromis
1. Révoquer côté fournisseur (Stripe/GitHub/Supabase). 2. Régénérer. 3. Mettre à jour le secret GitHub/Supabase (jamais dans Git). 4. Vérifier aucun secret en clair : `grep -rE 'sk_live|ghp_|eyJ'`.

## Discipline de persistance control-plane (run_id — obligatoire)
Chaque cycle Claude/runner DOIT :
1. Générer un **`run_id` unique** (`run-<UTC>-<sha>`), écrit dans l'outbox `RUN-<horodatage>.md` **ET** dans `runner-status.json`.
2. Créer un **NOUVEL** outbox (jamais réutiliser/modifier un ancien RUN).
3. `runner-status.last_report` doit pointer **exactement** ce nouvel outbox ; `heartbeat` = timestamp ISO récent.
4. postflight (`runner-postflight.sh`) refuse (FAIL) si : pas de nouvel outbox, last_report incohérent, heartbeat périmé, **run_id status ≠ run_id outbox**.
5. **Vérifier depuis `origin/recette`** (pas le disque local) que status+outbox sont visibles et cohérents avant tout « TERMINÉ ». Sinon état = `PERSISTENCE_FAILED`.
> ⚠️ Fuseau : les timestamps outbox/heartbeat sont en **UTC**. Paris = UTC+2 (été). 16:57 UTC = 18:57 Paris (même instant) — ne pas confondre avec un état périmé.
