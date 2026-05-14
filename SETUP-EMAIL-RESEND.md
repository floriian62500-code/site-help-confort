# Setup Resend — Recevoir les notifications email (5 min, 1 seule fois)

À faire pour que tu reçoives un email à chaque souscription contrat ou commande prestation.

## Pourquoi Resend ?

- **Gratuit** : 100 emails/jour (largement suffisant)
- **3 min de setup** : pas de SMTP, pas de DNS au démarrage
- **API simple** : déjà intégrée dans l'Edge Function `notify-subscription`

## Les 3 étapes

### 1. Crée ton compte Resend (1 min)

https://resend.com/signup → inscris-toi avec ton mail pro (`florian.dhaillecourt@helpconfort.com`).

### 2. Récupère ta clé API (30 s)

1. Dans le dashboard Resend → **API Keys**
2. Bouton **Create API Key**
3. Nom : `helpconfort-site`, permission : **Full access** (ou *Sending access*)
4. **Copie la clé** (commence par `re_…`)

### 3. Ajoute la clé dans Supabase (2 min)

Dans ton Terminal Mac :

```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
supabase secrets set RESEND_API_KEY=re_ta_cle_ici --project-ref btcbjwqiivhpwoszomhg
```

Tu peux vérifier :

```bash
supabase secrets list --project-ref btcbjwqiivhpwoszomhg
```

C'est tout. À partir de maintenant :

- 📧 Email reçu **dès qu'un client souscrit un contrat** sur `/contrats-entretien.html`
- 📧 Email reçu **dès qu'un client commande une prestation** sur `/nos-prestations.html` *(à ajouter, suivra)*

## Vérification

1. Ouvre `/contrats-entretien.html` sur ton site
2. Clique "Souscrire" sur n'importe quelle formule
3. Remplis avec tes infos
4. Tu dois recevoir un email dans les 10 secondes à `florian.dhaillecourt@helpconfort.com`
5. La souscription apparaît aussi dans `/admin-pro/contracts.html` (filtre "Prospects")

## En cas de problème

### Tu ne reçois pas l'email
- Vérifie dans Supabase → Edge Functions → `notify-subscription` → logs : tu verras la raison
- Vérifie que `RESEND_API_KEY` est bien configurée : `supabase secrets list --project-ref btcbjwqiivhpwoszomhg`
- Vérifie tes spams (Resend envoie depuis `noreply@depan59-62.fr` au démarrage)

### Tu veux personnaliser l'expéditeur
Pour envoyer depuis ton **propre domaine** (ex. `contact@depan59-62.fr` au lieu de `onboarding@resend.dev`) :

1. Dans Resend → **Domains** → Add domain → `depan59-62.fr`
2. Resend te donne 3 enregistrements DNS (SPF, DKIM, return-path) → ajoute-les chez ton registrar
3. Verification automatique sous quelques heures
4. Modifie ensuite la valeur `from_email` dans `app_settings` (table Supabase) sans toucher au code

### Tu veux changer l'adresse qui reçoit les notifications
Édite la table `app_settings` dans Supabase :

```sql
UPDATE public.app_settings
SET value = jsonb_set(value, '{subscriptions_to}', '"nouveau@email.com"')
WHERE key = 'notification_emails';
```

## Tarification Resend

- **Free** : 100 emails/jour, 3 000/mois
- **Pro** : $20/mois pour 50 000 emails (à voir quand le site décolle)

Pour estimer : si tu reçois 5 souscriptions/jour, tu es à 150 emails/mois → free largement OK.
