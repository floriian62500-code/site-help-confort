# LOT DE STABILISATION — Runbook déploiement groupé + rollback

Un **seul passage contrôlé, testable, réversible**. Ne rien déployer séparément en prod.

## Versions du lot (branche `integration/lot1-lot2-vs-prod`)
- Site : commit courant de la branche (à figer au moment du deploy)
- `submit-lead` : v5 (validation par `form_type`, jeton upload) — remplace v4
- Edge Function : `upload-lead-photos` v1 (nouvelle)
- Storage : bucket privé `lead-photos` (`_pending_migrations/20260806_storage_lead_photos_private_bucket.sql`)
- Dashboard : inchangé + compte RECETTE (`docs/RECETTE-ADMIN-ACCOUNT.md`)

## 0. Pré-requis rollback (AVANT toute action prod)
- [ ] Branche + commit confirmés ; tag de sécurité créé (`safety/pre-deploy-<date>`)
- [ ] **Snapshot v4 de submit-lead sauvegardé** (`get_edge_function submit-lead` → `index.v4-live.ts`)
- [ ] Daemon auto-push **désactivé** (déjà fait : `launchctl bootout com.helpconfort.autopush`)
- [ ] Working tree propre, pas de merge en cours

## Ordre de déploiement (obligatoire)
1. **Sauvegarde + tag** (ci-dessus).
2. **Netlify Draft** (`tools/Deploy-Staging-Draft.command`, jamais `--prod`) → URL preview. Prod inchangée.
3. **Déployer `submit-lead` v5** (edge).
4. **Tests formulaires SANS photo** sur le Draft : contact / wizard / devis-express — 1 lead chacun, données exactes, notif + accusé.
5. **Créer bucket privé + `upload-lead-photos`** (migration Storage + deploy edge).
6. **Tests photo** : 0 / 1 / 3 fichiers · trop lourd · mauvais format · coupure réseau · reprise · vérif Storage + association lead.
7. **Test Dashboard** avec compte RECETTE (login/logout/session/pages/permissions/leads test/photos).
8. **Corriger les P0/P1** détectés.
9. **Validation globale du Draft** (checklist GO/NO-GO ci-dessous).
10. **Déploiement production** (Netlify prod + edge déjà en prod).
11. **Smoke tests prod** (`smoke-tests-prod` + parcours réels).
12. **Surveillance des logs** (get_logs, pipeline-health-check).

## Rollback (par composant, exécutable immédiatement)
- **Site** : Netlify → republier le deploy précédent (≈ 10 s, sans rebuild).
- **submit-lead** : redéployer le snapshot v4 (`supabase functions deploy submit-lead`). ≈ 1-2 min.
- **upload-lead-photos** : la retirer (les leads restent valides, seules les photos ne s'attachent plus).
- **Storage** : vider puis supprimer le bucket (SQL de rollback dans la migration).
- **Compte RECETTE** : `is_active=false` + suppression auth.
- **Git** : `git reset --hard safety/pre-deploy-<date>`.
Délai estimé de retour arrière complet : **< 10 min**.

## GO / NO-GO
**GO** si : contact + wizard + devis OK · 1 seul lead/soumission · notif reçue · accusé reçu · données exactes ·
photos associées au bon lead · aucun secret exposé · aucune erreur console/réseau bloquante · Dashboard OK avec bons droits · rollback prêt.
**NO-GO** si : perte de lead · double création · photo perdue silencieusement · 4xx/5xx non gérée ·
permissions trop larges · PII dans l'URL · accès admin non maîtrisé · écart Draft/prod non compris.

## Validations critiques requises (regroupées, au moment du passage)
1. Token Netlify en place → Draft puis prod.
2. GO déploiement `submit-lead` v5 (edge).
3. GO création bucket privé + `upload-lead-photos` (Storage + edge).
4. GO création compte RECETTE (auth).
