# Retour Claude — REQ-20260926-033 : routage des demandes vers la boîte Saint-Omer

message_id: CLAUDE-2026-09-28-REQ-033-ROUTAGE-EMAIL
repond_a: REQ-20260926-032-ROUTAGE-EMAIL-SAINT-OMER.md (commit 00a392b7) — renumérotée 033
branche: recette
date: 2026-09-28
nature: **audit de la configuration réellement déployée** — aucune correction appliquée, aucun
déploiement, aucune écriture en base. Correctif prêt, en attente de GO.

---

## CAUSE — en une phrase
Les quatre destinataires principaux ont bien été basculés sur les boîtes d'agence ; **le champ
`leads_cc` a été oublié et contient toujours l'adresse personnelle**, qui part donc en copie de
**chaque** demande du site.

---

## 1. LA CONFIGURATION RÉELLEMENT DÉPLOYÉE
Lue le 2026-09-28 dans `app_settings.notification_emails` du projet de production :

| champ | valeur en production | verdict |
|---|---|---|
| `leads_to` | saint-omer@helpconfort.com | ✅ |
| `orders_to` | saint-omer@helpconfort.com | ✅ |
| `subscriptions_to` | saint-omer@helpconfort.com | ✅ |
| `reply_to` | saint-omer@helpconfort.com | ✅ |
| **`leads_cc`** | **[ adresse personnelle Florian ]** | ❌ **c'est le défaut** |
| `agences.saint-omer.email` | saint-omer@helpconfort.com | ✅ |
| `agences.dunkerque.email` | dunkerque@helpconfort.com | ✅ |
| `from_email` | saint-omer@helpconfort.com | ⚠️ ignoré par le code déployé (voir § 4) |

D'où vient le défaut : les migrations d'origine (`20260513200000`, `20260514120000`) créaient
`leads_to`, `orders_to`, `subscriptions_to` et `reply_to` **tous** sur l'adresse personnelle.
Quelqu'un les a corrigés depuis, un par un — et a laissé le CC.

---

## 2. FLUX AUDITÉS — avant / après

| flux | fonction | destinataire réel aujourd'hui | après correctif |
|---|---|---|---|
| contact, devis, demande métier, rappel, tunnel | `notify-lead-v6` (déployée) | **to** = agence (saint-omer@ ou dunkerque@ selon la ville) · **cc = adresse personnelle** | to inchangé · **cc vidé** |
| leads (ancienne fonction) | `notify-lead` | identique | identique |
| contrats / abonnements | `notify-subscription` | agence, sinon `subscriptions_to` = saint-omer@ | inchangé ✅ |
| achats / paiements vers l'agence | `orders_to` = saint-omer@ | ✅ | inchangé |
| chat sans réponse humaine | `chat-fallback-human` | to = saint-omer@ **et** dunkerque@ | inchangé ✅ |
| avis en attente | `notify-pending-reviews` | saint-omer@ (constante dans le code) | inchangé ✅ |
| récap hebdomadaire | `weekly-recap` | `weekly_recap_to` sinon saint-omer@ | inchangé ✅ |
| notifications back-office | `notify-action`, `send-email-notification` | to = e-mails des comptes ayant le rôle · **reply_to = `branding.email_reply_to` = adresse personnelle** | reply_to → saint-omer@ |
| réponse automatique au client | `lead-auto-reply` | to = client, reply_to = saint-omer@ | **non touché** (e-mail client) |
| abandons de tunnel | `leads-abandon-sweep` | ne fabrique pas de destinataire : repasse par `notify-lead-v6` | suit le correctif |
| alertes techniques | `pipeline-health-check`, `smoke-tests-prod` | **adresse personnelle en dur dans le `to`** | § 5 : décision à prendre |

---

## 3. ADRESSES PERSONNELLES RESTANTES DANS LE CODE DÉPLOYÉ
Trois occurrences, aucune dans un `to` de demande client, mais toutes à corriger :

1. **`List-Unsubscribe`** de `notify-lead`, `notify-lead-v6` et `chat-fallback-human` : l'en-tête
   expose `mailto:<adresse personnelle>`. Visible dans chaque notification.
2. **`reply_to` de repli** des mêmes fonctions : `lead.email || cfg.reply_to || <adresse
   personnelle>`. Aujourd'hui inerte (la config remplit `reply_to`), mais c'est un filet qui
   ramène l'adresse personnelle si la config est vidée un jour.
3. **`branding.email_reply_to`** en base vaut l'adresse personnelle et sert de `reply_to` à
   `notify-action` et `send-email-notification`.

---

## 4. ÉCART ENTRE LE CODE DÉPLOYÉ ET LE DÉPÔT — ce que l'audit devait débusquer
La fonction `notify-lead-v6` **déployée** n'est pas celle du dépôt :

| | dépôt (`supabase/functions/notify-lead-v6/index.ts`) | **déployé en production** |
|---|---|---|
| filtre anti-client | `to` et `cc` passent par `.filter(notClient)` | **absent** — rien n'empêche d'envoyer la notification agence à l'adresse du client |
| expéditeur | lu depuis la config | **codé en dur** : `Florian D'Haillecourt <noreply@depan59-62.fr>` |

Conséquences : le correctif `notClient` écrit dans le dépôt **ne protège rien aujourd'hui**, et le
`from_email` de la config (`saint-omer@helpconfort.com`) est **sans effet**. C'est d'ailleurs
heureux : le domaine qui porte les clés DKIM est `depan59-62.fr`, pas `helpconfort.com` — envoyer
depuis `saint-omer@helpconfort.com` dégraderait la délivrabilité. **Ne pas « corriger » ce champ
sans vérifier les DKIM du domaine.**

---

## 5. CE QUI RESTE À DÉCIDER (Florian)
- **Alertes techniques** (`pipeline-health-check`, `smoke-tests-prod`) : l'adresse personnelle y est
  en dur dans le `to`. Ce ne sont pas des demandes du site — l'instruction ne les couvre pas. Les
  bascule-t-on aussi sur la boîte générique, ou restent-elles personnelles ?
- **Le nom d'expéditeur** affiché aux clients est aujourd'hui « Florian D'Haillecourt ». On le
  garde (effet personnel, souvent meilleur en taux d'ouverture) ou on passe à un nom d'agence ?

---

## 6. CORRECTIF PRÊT — non appliqué, GO requis
Trois gestes, tous en production, donc **aucun n'est fait sans votre GO explicite** :

1. **Vider le CC** — un `UPDATE` sur `app_settings.notification_emails` retirant l'adresse
   personnelle de `leads_cc` (et rien d'autre : `jsonb_set` sur ce seul champ).
2. **Aligner `branding.email_reply_to`** sur saint-omer@helpconfort.com.
3. **Redéployer `notify-lead-v6`, `notify-lead` et `chat-fallback-human`** avec : `List-Unsubscribe`
   sur la boîte générique, repli `reply_to` sur la boîte générique, et le filtre `notClient` du
   dépôt qui n'est pas en ligne. Le pré-contrôle de déploiement s'applique : télécharger la source
   déployée, diff, archiver pour retour arrière, vérifier `verify_jwt`.

**Retour arrière** : la valeur actuelle de `notification_emails` est archivée dans ce rapport (§ 1),
donc un `UPDATE` inverse la restaure ; pour les fonctions, la source déployée est archivée avant
remplacement et redéployable telle quelle.

**Tests prévus après GO** : relire `app_settings` pour vérifier le CC vide, déclencher une
notification de test **sans créer de vrai lead** (lead de recette marqué, jamais un formulaire
public), vérifier dans Resend le `to`, l'absence de `cc`, le `reply_to` et l'en-tête
`List-Unsubscribe`.

---

## 7. HORS PÉRIMÈTRE — à traiter séparément, et vite
`app_settings` ne contient pas que des adresses : on y trouve aussi, en clair, des **secrets
Google** (clé privée de compte de service, jetons de rafraîchissement, secrets client, jeton
développeur Ads). Je ne les reproduis nulle part, et surtout pas ici : **le dépôt GitHub est
public**. La note de sécurité du projet indique que cette table est lisible par tout compte
authentifié — si c'est encore vrai, n'importe quel compte inscrit peut lire ces secrets. Cela
rejoint la fuite RLS déjà ouverte. **À ouvrir comme demande distincte, en P0.**

---

## PREUVE D'ABSENCE DE MUTATION
Aucune écriture en base, aucun déploiement de fonction, aucun e-mail envoyé. Les seules opérations
menées sont des **lectures** : une requête SQL sur `app_settings`, la lecture de la source déployée
de `notify-lead-v6`, et des lectures de fichiers du dépôt. Le diff de ce lot ne contient que
`docs/control/`.

## NEXT_ACTION
GO de Florian sur le § 6, plus ses deux décisions du § 5. Statut maintenu à `IN_PROGRESS` — je ne
prononce aucune clôture.
