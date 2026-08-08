# 🔐 Guide de configuration des secrets — HELP Confort

**Principe** : aucun secret ne doit apparaître dans le code, dans nos échanges, ou dans le repo Git. Tout passe par des **Secrets d'environnement** stockés dans les dashboards des services concernés.

**Qui configure** : Florian, dans les dashboards.
**Qui lit** : les Edge Functions Supabase (via `Deno.env.get`) et les GitHub Actions (via `${{ secrets.XXX }}`).
**Qui n'a jamais accès** : Claude, le repo Git, les logs publics.

---

## 1. Secrets à configurer dans **Supabase**

**Chemin** : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/settings/functions
→ Onglet **"Secrets"** (ou "Edge Function Secrets").

Bouton **"Add new secret"** pour chacun ci-dessous.

| Nom du secret | Utilité | Où l'obtenir | Régénération |
|---|---|---|---|
| `GITHUB_TOKEN` | Permet aux Edge Functions `pipeline-health-check`, `gh-edit-file`, `gh-push-inline` de lire/écrire sur le repo GitHub | GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → Generate → Repository access = `site-help-confort` uniquement → Permissions = `Contents: Read and write` + `Metadata: Read only` → Générer → **copier immédiatement** (visible une seule fois) | Tous les 90 jours ou si compromission détectée |
| `HC_CRON_SECRET` | Authentifie les appels internes du cron `pg_cron` vers `sync-facebook-posts` (empêche que n'importe qui déclenche le sync) | Générer une chaîne random : `openssl rand -hex 32` dans un terminal | Tous les 6 mois ou si compromission |
| `RESEND_API_KEY` | Envoi email transactionnel + alertes monitoring (`pipeline-health-check`) | https://resend.com/api-keys → **Create API Key** → nom `HC Site Prod` → **Sending access** = domaine `depan59-62.fr` | Sur révocation manuelle |
| `NETLIFY_TOKEN` | Lire les derniers deploys Netlify pour le monitoring (`pipeline-health-check`) | https://app.netlify.com/user/applications → **New access token** → nom `HC monitoring read-only` | Tous les 6 mois |
| `ANTHROPIC_API_KEY` | Appels Claude API depuis Edge Functions (chat-assistant, generate-content, actu-generator, IA publication à venir) | https://console.anthropic.com/settings/keys → **Create Key** → nom `HC Edge Functions` | Sur révocation manuelle |
| `STRIPE_SECRET_KEY` | Créer les Payment Links pour la réservation en ligne prestations (`stripe-create-payment-link`) | https://dashboard.stripe.com/apikeys → clé **secrète live** (commence par `sk_live_...`) | Sur révocation manuelle |
| `STRIPE_WEBHOOK_SECRET` | Valider signature webhook Stripe reçu par `stripe-webhook` | https://dashboard.stripe.com/webhooks → endpoint HC → **Signing secret** (commence par `whsec_...`) | Sur régénération webhook |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER` | (Futur — quand SMS avis client sera activé) Envoi SMS post-intervention | https://console.twilio.com → Account SID + Auth Token + n° acheté | Sur révocation |

**Note importante Supabase** : `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont **auto-injectées** par Supabase dans les Edge Functions. Rien à faire.

---

## 2. Secrets à configurer dans **GitHub**

**Chemin** : https://github.com/floriian62500-code/site-help-confort/settings/secrets/actions
→ Bouton **"New repository secret"**.

Seulement utile si tu utilises GitHub Actions pour du CI/CD (build, tests). Aujourd'hui HC utilise Netlify Deploy Hook, donc ce secret est optionnel.

| Nom | Utilité | Où l'obtenir |
|---|---|---|
| `NETLIFY_BUILD_HOOK` | Déclencher un rebuild Netlify depuis un workflow GitHub Actions | Fichier `tools/.netlify-build-hook` (URL secrète actuelle) |
| `SUPABASE_ACCESS_TOKEN` | (Futur — CI/CD) Déployer les Edge Functions depuis GitHub Actions | https://supabase.com/dashboard/account/tokens → **Generate new token** |

---

## 3. Où NE PAS mettre les secrets

- ❌ Dans le code (aucune constante, aucun fallback)
- ❌ Dans les fichiers `.env` du repo (le repo est privé mais des `.env` traînent souvent en clair)
- ❌ Dans les URL de remote git (`https://user:token@github.com/...`)
- ❌ Dans les commit messages
- ❌ Dans nos échanges (chat, capture d'écran, email)
- ❌ Dans les logs Edge Function (`console.log(secret)` interdit)

---

## 4. Procédure de mise à jour d'un secret

### Cas 1 : rotation planifiée (tous les X mois)

1. Générer nouveau secret côté source (GitHub/Stripe/Meta/etc.)
2. Aller sur Supabase Dashboard → Edge Function Secrets → **Edit** le secret → coller nouvelle valeur → **Save**
3. Les Edge Functions liront la nouvelle valeur au prochain appel (aucun redéploiement nécessaire)
4. Révoquer l'ancien secret côté source

### Cas 2 : compromission (leak connu)

1. **URGENT — Révoquer immédiatement** l'ancien secret côté source
2. Générer un nouveau secret
3. Mettre à jour Supabase Secret
4. Vérifier qu'aucune fuite ne persiste (grep repo, historique git, logs)
5. Documenter dans `BUGS-HISTORY.md`

### Cas 3 : refresh_token OAuth (Meta, GBP, GA4)

Pour les tokens OAuth qui vivent dans la table `app_settings` (pas dans les env secrets), la procédure est différente :

- **Meta** → wizard `/admin-pro/wizard-meta.html` (ou System User Token permanent, cf `docs/META-SYSTEM-USER-TOKEN.md`)
- **GBP** → wizard `/admin-pro/oauth-gbp.html`
- **GA4** → wizard `/admin-pro/oauth-ga4.html`

Ces wizards écrivent directement dans Supabase `app_settings`. Pas de manipulation en env.

---

## 5. État actuel des secrets HC (2026-07-25)

| Secret | Statut | Action requise |
|---|---|---|
| `GITHUB_TOKEN` | 🔴 Révoqué par GitHub (leak) | **URGENT — regénérer et stocker en Supabase Secret** |
| `HC_CRON_SECRET` | 🟡 En dur dans `sync-facebook-posts` v9 | À migrer en Supabase Secret + refactor Edge Fn |
| `RESEND_API_KEY` | ✅ Déjà en Supabase Secret | RAS |
| `NETLIFY_TOKEN` | ✅ Déjà en Supabase Secret | RAS |
| `ANTHROPIC_API_KEY` | ✅ Déjà en Supabase Secret | RAS |
| `STRIPE_SECRET_KEY` | ⚪ Pas encore configuré | À faire quand on branchera la réservation en ligne (task #30) |
| `STRIPE_WEBHOOK_SECRET` | ⚪ Pas encore configuré | Même moment |
| `TWILIO_*` | ⚪ Pas encore utilisé | Backlog SMS avis clients |
| Meta `page_access_token` | ✅ System User Token permanent dans `app_settings.meta` | RAS depuis migration 2026-07-20 |
| GBP OAuth `refresh_token` | 🔴 Cassé (Bad Request) | Reconnecter via wizard-oauth-gbp |
| GA4 OAuth `refresh_token` | 🔴 Révoqué par Google (invalid_grant) | Reconnecter via wizard-oauth-ga4 |

---

## 6. Vérification post-configuration

Après avoir stocké un secret dans Supabase, tester :

```
GET https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/pipeline-health-check
```

Chaque section (`github`, `netlify`, `gbp`, `meta`, `ga4`) doit renvoyer `ok: true` ou `refresh_ok: true`. Si `error`, vérifier que le secret est bien orthographié dans le dashboard Supabase (nom exact, sans espace en début/fin).

---

*Guide créé le 2026-07-25 suite au recadrage sécurité Florian.*
*Toute modification de ce guide doit être validée par Florian avant push.*
