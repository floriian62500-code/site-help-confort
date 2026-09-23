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

---

# Statut de chaque fonction (ajouté le 2026-09-23, directive 5795806773 §5)

> « Vérifier que chaque source récupérée a son statut ; documenter son mode de déploiement ;
> interdire toute suppression automatique d'une fonction déployée sans preuve d'usage nul. »
> **Aucune modification de la production.**

## Mode de déploiement — le point à connaître avant tout

Deux chemins coexistent, et le second est le plus important :

1. **À la main**, `supabase functions deploy <nom>` : c'est ainsi qu'ont été déployées la plupart
   des fonctions, souvent sans source dans le dépôt (d'où la récupération du 20 au 23/09).
2. **Automatiquement**, par `.github/workflows/supabase-deploy.yml`, **à chaque poussée sur `main`** :
   le workflow parcourt `supabase/functions/*/` et déploie **tout** ce qu'il y trouve (sauf les
   dossiers en `_`). Il pousse aussi les migrations (`supabase db push`).

**Conséquence à ne pas manquer** : un futur `recette → main` **créerait en production les 10 fonctions
du dépôt qui n'y sont pas encore** et écraserait les autres par la version du dépôt. Ce n'est pas
théorique — c'est le comportement actuel du workflow. À traiter avant le prochain passage en prod.

## Les 10 fonctions présentes dans le dépôt mais absentes de la production

`actu-generator`, `auto-publish-from-photos`, `create-payment-session`, `crm-apogee-push`,
`generate-post-from-prompt`, `leads-abandon-sweep`, `manage-users`, `stripe-webhook-test`,
`suggest-prompt-improvement`, `suggest-reply`.

Trois d'entre elles ont un appelant en ligne, donc **un chemin qui échoue aujourd'hui** :

| Fonction | Appelée par | Ce que voit l'utilisateur |
|---|---|---|
| `create-payment-session` | `assets/hc-demande.js` (tunnel « Ma demande ») | la fonction répond 404 ; le code le gère et **masque simplement le bloc « Payer en ligne »**. Pas d'erreur affichée, pas de parcours cassé — mais **le paiement en ligne n'existe pas** dans le tunnel |
| `actu-generator` | `admin-pro/actu-generator.html` | l'écran d'administration ne peut pas générer |
| `auto-publish-from-photos` | `admin-pro/magic.html` | idem |

Décision à prendre (pas par moi) : les déployer, ou retirer les appels et les écrans.

## Statut, fonction par fonction

`CRON` = appelée par un planificateur de la base (vérifié dans `cron.job` le 23/09) ·
`CALLED` = appelée depuis le dépôt · `NO_CALLER` = déployée, aucun appelant trouvé ·
`NOT_DEPLOYED` = présente dans le dépôt, absente de la production.
La colonne « appels 24 h » vient de la journalisation des fonctions, **dont la fenêtre maximale est
de 24 heures** : un 0 n'y est donc pas une preuve d'inutilité.

| Fonction | Déployée | Statut | Appels 24 h | Appelant connu |
|---|---|---|---|---|
| `actu-generator` | **non** | CALLED | 0 | admin-pro/actu-generator.html |
| `auto-publish-from-photos` | **non** | CALLED | 0 | admin-pro/magic.html |
| `chat-assistant` | oui | CALLED | 0 | admin-pro/chat-conversations.html +2 |
| `chat-fallback-human` | oui | NO_CALLER | 0 | aucun |
| `check-tokens` | oui | NO_CALLER | 0 | aucun |
| `communes-list` | oui | CALLED | 11 | vitrier-saint-omer.html +6 |
| `create-payment-session` | **non** | CALLED | 0 | assets/hc-demande.js |
| `crm-apogee-push` | **non** | NOT_DEPLOYED | 0 | — |
| `ga4-oauth-test` | oui | NO_CALLER | 0 | aucun |
| `ga4-stats` | oui | NO_CALLER | 0 | aucun |
| `gbp-diagnostic` | oui | CALLED | 0 | admin-pro/reviews.html |
| `gbp-discover-account` | oui | NO_CALLER | 0 | aucun |
| `gbp-fix-account` | oui | NO_CALLER | 0 | aucun |
| `gbp-oauth-callback` | oui | CALLED | 0 | admin-pro/wizard-google.html |
| `generate-content` | oui | CALLED | 0 | admin-pro/realisations.html |
| `generate-post-from-prompt` | **non** | CALLED | 0 | admin-pro/templates.html |
| `generate-service-content` | oui | CALLED | 0 | admin-pro/services.html |
| `gh-bulk-purge-seo-stats` | oui | NO_CALLER | 0 | aucun |
| `gh-delete-files` | oui | NO_CALLER | 0 | aucun |
| `gh-edit-file` | oui | CALLED | 0 | assets/hc-edit-mode.js |
| `gh-push-batch` | oui | NO_CALLER | 0 | aucun |
| `gh-push-from-chunks` | oui | NO_CALLER | 0 | aucun |
| `gh-push-inline` | oui | CALLED | 0 | admin-pro/photos.html +1 |
| `google-ads-status` | oui | NO_CALLER | 0 | aucun |
| `hc-content-save` | oui | CALLED | 0 | assets/hc-edit-mode.js |
| `html-script-check` | oui | NO_CALLER | 0 | aucun |
| `indexnow-ping` | oui | CRON | 1 | planificateur : chaque jour 7 h |
| `js-syntax-check` | oui | NO_CALLER | 0 | aucun |
| `lead-action` | oui | CALLED | 0 | supabase/functions/notify-lead/index.ts +1 |
| `lead-auto-reply` | oui | CALLED | 0 | supabase/functions/submit-lead/index.ts +2 |
| `lead-photo-signed-url` | oui | NO_CALLER | 0 | aucun |
| `leads-abandon-sweep` | **non** | NOT_DEPLOYED | 0 | — |
| `manage-users` | **non** | NOT_DEPLOYED | 0 | — |
| `migrate-fb-images` | oui | NO_CALLER | 0 | aucun |
| `notify-action` | oui | NO_CALLER | 0 | aucun |
| `notify-lead` | oui | CALLED | 0 | supabase/functions/submit-lead/index.ts +4 |
| `notify-lead-v6` | oui | CALLED | 0 | supabase/functions/stripe-webhook-test/ind +2 |
| `notify-pending-reviews` | oui | NO_CALLER | 0 | aucun |
| `notify-subscription` | oui | NO_CALLER | 0 | aucun |
| `partner-logo` | oui | NO_CALLER | 0 | aucun |
| `partners-json` | oui | CALLED | 4 | supabase/functions/smoke-tests-prod/index. +1 |
| `pipeline-health-check` | oui | CRON | 48 | planificateur : */30 min |
| `promote-to-prod` | oui | CALLED | 0 | admin-pro/valider-staging.html |
| `publish-gbp` | oui | NO_CALLER | 0 | aucun |
| `publish-linkedin` | oui | NO_CALLER | 0 | aucun |
| `publish-meta` | oui | CALLED | 0 | supabase/functions/auto-publish-from-photo +1 |
| `publish-scheduled` | oui | CRON | 288 | planificateur : */5 min |
| `purge-orphan-lead-photos` | oui | NO_CALLER | 0 | aucun |
| `realisations-json` | oui | CALLED | 58 | avant-apres.html +5 |
| `refresh-fb-images` | oui | NO_CALLER | 0 | aucun |
| `refresh-meta-token` | oui | CALLED | 0 | scripts/automation/refresh-fb-token.sh |
| `reply-review` | oui | CALLED | 0 | admin-pro/reviews.html |
| `resend-status-check` | oui | NO_CALLER | 0 | aucun |
| `send-email-notification` | oui | NO_CALLER | 0 | aucun |
| `send-transactional-email` | oui | NO_CALLER | 0 | aucun |
| `sitemap` | oui | NO_CALLER | 5 | aucun |
| `smoke-tests-prod` | oui | CRON | 4 | planificateur : toutes les 6 h |
| `smoke-tests-staging` | oui | CRON | 96 | planificateur : */15 min |
| `stripe-create-payment-link` | oui | CALLED | 0 | admin-pro/paiements.html +1 |
| `stripe-webhook` | oui | CALLED | 0 | scripts/test/e2e-local.mjs |
| `stripe-webhook-test` | **non** | CALLED | 0 | scripts/test/e2e-local.mjs |
| `submit-lead` | oui | CALLED | 0 | devis-express.html +4 |
| `submit-lead-v6` | oui | CALLED | 0 | devis-express.html +4 |
| `suggest-prompt-improvement` | **non** | CALLED | 0 | admin-pro/chat-conversations.html |
| `suggest-reply` | **non** | CALLED | 0 | admin-pro/reviews.html |
| `suppliers-by-metier` | oui | NO_CALLER | 2 | aucun |
| `sync-facebook-posts` | oui | CRON | 30 | planificateur : */30 min 8-22 h |
| `sync-files-staging-to-main` | oui | NO_CALLER | 0 | aucun |
| `sync-google-ads` | oui | CRON | 6 | planificateur : toutes les 4 h |
| `sync-reviews` | oui | CRON | 4 | planificateur : toutes les 6 h |
| `sync-reviews-places` | oui | NO_CALLER | 0 | aucun |
| `upload-lead-photos` | oui | CALLED | 0 | scripts/test/e2e-local.mjs +1 |
| `weekly-recap` | oui | CRON | 0 | planificateur : lundi 6 h |

## Règle qui découle de tout ceci

**Aucune suppression automatique.** Le tableau ci-dessus est un point de départ, pas une autorisation :
`NO_CALLER` signifie « aucun appelant trouvé dans le dépôt », pas « morte ». Deux contre-exemples
démontrés le 23/09 : `indexnow-ping` et `smoke-tests-prod` étaient classées sans appelant, et sont
appelées chaque jour par un planificateur de la base. Le classement de chaque élément est tenu dans
`docs/audit/inventaire-classement.json`, et `node scripts/audit/inventaire.mjs --strict` échoue si
un élément n'y est pas expliqué.
