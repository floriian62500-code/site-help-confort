# Configuration Notifications Push — À FAIRE par Florian

L'infrastructure est en place (table Supabase, SW dédié, composant frontend).
Il manque juste les **clés VAPID** à générer et configurer.

## 1. Générer les clés VAPID

```bash
npx web-push generate-vapid-keys
```

Cela produit :
- **Public Key** (à mettre dans le frontend)
- **Private Key** (à mettre dans Supabase Secrets)

## 2. Configurer côté frontend

Éditer `assets/hc-push-optin.js` ligne 11 :

```javascript
var VAPID_PUBLIC_KEY = 'COLLER_ICI_LA_CLÉ_PUBLIQUE';
```

## 3. Configurer côté Supabase

Dans le dashboard Supabase → Settings → Edge Functions → Secrets :

```
VAPID_PUBLIC_KEY=<même valeur que frontend>
VAPID_PRIVATE_KEY=<clé privée>
VAPID_EMAIL=mailto:saint-omer@helpconfort.com
```

## 4. Déployer l'EF d'envoi `send-push`

À créer (m'demander) — utilise `web-push` lib Deno-compatible pour envoyer notification à toutes les subscriptions actives.

## 5. Inclure le composant sur les pages

Pour activer l'opt-in sur une page, ajouter :
```html
<script defer src="assets/hc-push-optin.js"></script>
```

Tant que `VAPID_PUBLIC_KEY` est `null`, le bandeau ne s'affiche jamais (sécurité).

## Tables Supabase

`push_subscriptions` créée le 2026-05-28 avec colonnes :
- endpoint, p256dh, auth (clés Web Push)
- consent_type (maintenance / promo / both)
- user_email, active, fail_count

## Cas d'usage prévus

1. **Rappel entretien chaudière annuel** — cron 1 fois/an par utilisateur
2. **Confirmation rendez-vous** — push 24h avant intervention
3. **Mise à jour suivi intervention** — push quand technicien en route
4. **Promotion saisonnière** (opt-in séparé) — désembouage automne, dépoussiérage VMC printemps

Date : 28 mai 2026
