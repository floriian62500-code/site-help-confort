# Fonctions edge — inventaire du 2026-09-23

> Directive 5778526407 §2.D. Relevé par `supabase functions download --use-api` (lecture seule) et
> comparaison avec le dépôt. **Aucun déploiement, aucune suppression** : ce document sert à décider.

| | |
|---|---|
| déployées en production | 63 |
| dont **sans source dans le dépôt avant ce jour** | 33 → **0** (toutes récupérées et versionnées) |
| présentes dans le dépôt mais **non déployées** | 10 |
| qui écrivent sur GitHub | 10 |
| déployées sans aucun appelant dans le dépôt | 41 |

## 1. Fonctions qui écrivent sur GitHub

Toutes prennent le **jeton dans le corps de la requête** : sans jeton valide, elles ne font rien.
Elles restent des **relais d'écriture ouverts** (n'importe qui peut s'en servir avec son propre jeton)
et deux d'entre elles visent **`main` par défaut**.

| Fonction | Branche par défaut | Appelant dans le dépôt |
|---|---|---|
| `gh-bulk-purge-seo-stats` | staging | **aucun** |
| `gh-delete-files` | staging | **aucun** |
| `gh-edit-file` | staging | assets/hc-edit-mode.js |
| `gh-push-batch` | main | **aucun** |
| `gh-push-from-chunks` | main | **aucun** |
| `gh-push-inline` | main | admin-pro/photos.html, assets/hc-edit-mode.js |
| `hc-content-save` | staging | assets/hc-edit-mode.js |
| `pipeline-health-check` | — | **aucun** |
| `promote-to-prod` | — | admin-pro/valider-staging.html |
| `sync-files-staging-to-main` | — | **aucun** |

**Proposition** : supprimer celles sans appelant, durcir les deux encore référencées
(`gh-push-inline`, `gh-edit-file`) — patch dans `docs/security/`. Décision + déploiement : Florian.

## 2. Déployées sans appelant dans le dépôt

Appelées à la main, par une tâche planifiée, par un email ou plus du tout. À trier avant toute suppression :

`chat-fallback-human`, `check-tokens`, `ga4-oauth-test`, `ga4-stats`, `gbp-discover-account`, `gbp-fix-account`, `gh-bulk-purge-seo-stats`, `gh-delete-files`, `gh-push-batch`, `gh-push-from-chunks`, `google-ads-status`, `html-script-check`, `indexnow-ping`, `js-syntax-check`, `lead-action`, `lead-auto-reply`, `lead-photo-signed-url`, `migrate-fb-images`, `notify-action`, `notify-lead-v6`, `notify-pending-reviews`, `notify-subscription`, `partner-logo`, `pipeline-health-check`, `publish-gbp`, `publish-linkedin`, `publish-meta`, `publish-scheduled`, `purge-orphan-lead-photos`, `refresh-fb-images`, `resend-status-check`, `send-email-notification`, `send-transactional-email`, `sitemap`, `smoke-tests-prod`, `smoke-tests-staging`, `suppliers-by-metier`, `sync-facebook-posts`, `sync-files-staging-to-main`, `sync-google-ads`, `sync-reviews-places`

## 3. Dans le dépôt mais non déployées

Le code existe, la fonction n'existe pas en production — donc **le parcours qui en dépend ne marche pas** :

`actu-generator`, `auto-publish-from-photos`, `create-payment-session`, `crm-apogee-push`, `generate-post-from-prompt`, `leads-abandon-sweep`, `manage-users`, `stripe-webhook-test`, `suggest-prompt-improvement`, `suggest-reply`

> À noter : `create-payment-session` (paiement client du tunnel, Stripe TEST uniquement) n'est **pas déployée**.
> `leads-abandon-sweep` (relance des demandes abandonnées) non plus.

## 4. Hors périmètre du site

`send-transactional-email` embarque des gabarits d'anniversaire (`_shared/transactional-email-templates/`)
qui appartiennent à l'application RH, pas au site. À confirmer avant de la supprimer ou de la déplacer.

## 5. Reproductibilité

Les fonctions importent `supabase-js` en `@2` **flottant** : un redéploiement prend la dernière 2.x du
moment. Épingler la version au prochain déploiement de chaque fonction.

## 6. Secret trouvé et caviardé

`promote-to-prod` contenait en clair l'identifiant du **build hook Netlify de production**. Il est déjà
présent publiquement dans ce dépôt (`tools/.netlify-build-hook`, `docs/CLAUDE-CODE-HANDOFF.md`) depuis juin :
**à faire tourner côté Netlify** (supprimer puis recréer le hook). La copie versionnée lit désormais
`NETLIFY_BUILD_HOOK_ID` dans l'environnement.
