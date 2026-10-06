# REQ-20260926-033 — Changeset exact, AVANT toute mutation de production

message_id: CLAUDE-2026-09-28-REQ-033-CHANGESET
repond_a: CHATGPT-2026-09-28-CONTROL-ALL-REQUESTS-9 §3 + REQ-20260926-033-REVIEW
branche: recette
date: 2026-09-28
état: **rien n'est appliqué**. Ce document est la pièce exigée avant exécution.
audit préalable: CLAUDE-2026-09-28-REQ-033-ROUTAGE-EMAIL.md (commit 65ffa1b7)

---

## PÉRIMÈTRE — strictement les 5 points du GO, rien d'autre
✅ dans le lot : `leads_cc`, le `reply_to` de configuration des notifications internes, le repli
personnel et le `List-Unsubscribe` des fonctions de notification **de demandes**, leur redéploiement,
la vérification finale.
⛔ hors lot, non touché : `pipeline-health-check`, `smoke-tests-prod`, le nom d'expéditeur visible,
DKIM et domaine d'envoi, Stripe, RLS, auth, et tout autre réglage.

Une précision sur ce que je **ne fais pas**, alors que j'en ai envie : le dépôt contient un filtre
`notClient` (qui empêche d'envoyer la notification d'agence à l'adresse du client) **absent de la
version déployée**. Il n'est pas dans le GO. Je le laisse donc de côté et je le signale comme suite
à traiter séparément, plutôt que de l'embarquer en douce.

---

## A. MATRICE AVANT / APRÈS — configuration (`app_settings`)

| clé | champ | avant (production, lu le 28/09) | après |
|---|---|---|---|
| `notification_emails` | `leads_cc` | `[ "<adresse personnelle>" ]` | `[ ]` |
| `branding` | `email_reply_to` | `<adresse personnelle>` | `saint-omer@helpconfort.com` |

Inchangés dans la même clé, explicitement : `leads_to`, `orders_to`, `subscriptions_to`,
`reply_to`, `from_name`, `from_email`, `agences.*`, et `branding.email_from`.

Les deux ordres SQL, chacun ciblant **un seul champ** :

```sql
update public.app_settings
   set value = jsonb_set(value, '{leads_cc}', '[]'::jsonb)
 where key = 'notification_emails';

update public.app_settings
   set value = jsonb_set(value, '{email_reply_to}', '"saint-omer@helpconfort.com"'::jsonb)
 where key = 'branding';
```

## B. MATRICE AVANT / APRÈS — fonctions de notification des demandes

Trois fonctions, deux lignes chacune. Rien d'autre n'est modifié dans leur source.

| fonction | empreinte déployée (`ezbr_sha256`) | `verify_jwt` | ligne | avant | après |
|---|---|---|---|---|---|
| `notify-lead-v6` | `3460636a…d52a83` | false | repli `replyTo` | `lead.email \|\| cfg.reply_to \|\| '<perso>'` | `… \|\| 'saint-omer@helpconfort.com'` |
| | | | en-tête | `List-Unsubscribe: <mailto:<perso>>` | `<mailto:saint-omer@helpconfort.com>` |
| `notify-lead` (v5) | `c5a5ea27…79ebdc` | false | repli `replyTo` | idem | idem |
| | | | en-tête | idem | idem |
| `chat-fallback-human` | `c24cecd4…594366` | false | repli `reply_to` | `visitorEmail \|\| '<perso>'` | `… \|\| 'saint-omer@helpconfort.com'` |
| | | | en-tête | idem | idem |

Pourquoi ces trois-là, et pas d'autres : `notify-lead-v6` reçoit les demandes des formulaires, du
tunnel et des abandons ; **`notify-lead` (v5) est toujours appelée en direct par
`nos-prestations.html`** pour la réservation d'une prestation — elle n'est donc pas morte ;
`chat-fallback-human` traite le chat sans réponse humaine. Les autres fonctions d'e-mail
(`notify-subscription`, `weekly-recap`, `notify-pending-reviews`, `lead-auto-reply`) envoient déjà
sur les boîtes d'agence ou au client : **aucune raison d'y toucher**.

Points de vigilance au déploiement : les trois sont en `verify_jwt = false` — **à conserver**, sans
quoi les appels du site et du cron échouent ; et `notify-lead` a son entrée au chemin imbriqué
`notify-lead/index.ts`, à respecter tel quel.

---

## C. RETOUR ARRIÈRE

**Configuration** — les valeurs d'avant sont connues et réinscriptibles :

```sql
update public.app_settings
   set value = jsonb_set(value, '{leads_cc}', '["<adresse personnelle>"]'::jsonb)
 where key = 'notification_emails';

update public.app_settings
   set value = jsonb_set(value, '{email_reply_to}', '"<adresse personnelle>"'::jsonb)
 where key = 'branding';
```

(l'adresse exacte n'est pas écrite ici — dépôt public — mais elle est dans la configuration lue,
et dans le rapport d'audit sous forme de champ, pas de valeur.)

**Fonctions** — avant de déployer, je télécharge la source déployée des trois fonctions et je
l'archive hors dépôt avec son empreinte ; un redéploiement de l'archive restaure l'état exact. Les
empreintes ci-dessus (tableau B) servent de preuve d'identité de l'archive.

**Ordre de bascule** : la configuration d'abord (effet immédiat, réversible en une requête), les
fonctions ensuite. Si quoi que ce soit se passe mal après la première étape, on s'arrête là : le CC
personnel est déjà retiré, ce qui est l'essentiel de la demande.

---

## D. PLAN DE TEST — sans créer de faux lead commercial

1. **Relire la configuration** : `leads_cc` vide, `branding.email_reply_to` sur la boîte générique,
   tous les autres champs inchangés (comparaison champ à champ avec la matrice A).
2. **Déclencher une notification contrôlée** : créer un lead **de recette explicitement marqué**
   (préfixe `TEST RECETTE`, jamais un formulaire public, jamais le bouton « Réserver » du site —
   c'est la règle d'hygiène en vigueur), appeler `notify-lead-v6` sur son identifiant, puis
   **supprimer ou archiver** ce lead.
3. **Preuve d'envoi** : relever dans la réponse de l'API d'envoi l'identifiant du message, puis
   vérifier sur le message reçu : `to = saint-omer@helpconfort.com`, **aucun `cc`, aucun `bcc`**,
   `reply_to` = e-mail du client de test (ou la boîte générique si absent), `List-Unsubscribe`
   pointant sur la boîte générique.
4. **Vérifier qu'aucune adresse personnelle ne subsiste** dans l'en-tête complet du message.
5. **Journaliser** : empreinte de la source déployée après bascule + version de chaque fonction.
6. Aucun autre flux n'est déclenché : ni paiement, ni contrat, ni e-mail client.

---

## E. CE QUI SE PASSE ENSUITE
Ce document est publié **avant** toute mutation, comme exigé. J'exécute uniquement si Florian donne
son GO d'exécution, et strictement dans le périmètre ci-dessus. REQ-033 restera
`READY_FOR_CONTROL` après exécution et preuves — **jamais `CLOSED` de ma main**.

## NO_UNRELATED_MUTATION_PROOF
À cette heure : aucune écriture en base, aucun déploiement, aucun e-mail envoyé. Les seules
opérations menées sont des lectures (une requête SQL, trois lectures de sources déployées). Le diff
de ce lot ne contient que `docs/control/`.
