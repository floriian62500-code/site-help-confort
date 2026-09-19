# CRM Apogée — branchement des coordonnées (état : EN ATTENTE D'ACCÈS)

> Demande Florian (directives 5713150094 / 5713186419) : les coordonnées collectées sur le site doivent aussi entrer dans **Apogée**.

## État réel, sans enjolivement
Le dépôt ne contient **aucun connecteur Apogée** : seulement deux documents de démarche commerciale (`MAIL-APOGEE-API.md` vers Hugo, `docs/INTEGRATION-APOGEE-DYNOCO.md` vers Dynoco). Aucun endpoint, aucune clé, aucun schéma de champs fourni par l'éditeur. **Rien n'a été inventé.**

`APOGEE_CRM = BLOCKED_MISSING_CREDENTIAL/API`.

## Ce qui est prêt côté site (recette)
1. **File d'attente sans perte** : `submit-lead-v6` marque chaque dossier `metadata.crm_status = 'pending'` dès la collecte des coordonnées (y compris une simple consultation des tarifs) et à la finalisation. Aucun dossier n'est perdu en attendant le branchement.
2. **Fonction d'envoi** : `supabase/functions/crm-apogee-push` lit les dossiers `pending`, applique le mapping ci-dessous et POSTe vers `APOGEE_API_URL`. Sans `APOGEE_API_URL` + `APOGEE_API_KEY`, elle **ne fait rien** et répond `blocked: missing_credentials` avec le nombre de dossiers en attente et un exemple de charge utile (utile pour la discussion avec l'éditeur).
3. **Reprise** : en cas d'échec HTTP, le dossier reste `pending` (5 tentatives), puis passe en `error` avec le message d'erreur.

## Mapping proposé (site → Apogée)
| Champ Apogée (proposé) | Source site |
|---|---|
| `external_id` | identifiant du dossier site (idempotence) |
| `correlation_id` | référence de corrélation intention ↔ demande finale |
| `first_name` / `last_name` | `prenom` / `nom` (jamais reconstruits l'un depuis l'autre) |
| `phone` / `email` | `telephone` / `email` |
| `address` / `postal_code` / `city` | `adresse` / `code_postal` / `ville` |
| `trade` | `metier` |
| `request_type` | `consultation_tarifs`, `commande`, `mixte`, `devis`, `entretien`, `contrat_entretien` |
| `status` | `intent`, `needs_followup`, `nouveau`, `archive` |
| `last_step` | dernière étape atteinte dans le tunnel |
| `message` | message métier complet |
| `source`, `source_page`, `referrer` | origine de la demande |
| `utm_source`, `utm_medium`, `utm_campaign`, `gclid`, `fbclid` | attribution (mémorisée avec consentement) |
| `created_at`, `updated_at` | horodatages |
| `agency` | `saint-omer` (agence physique unique) |

## Ce qu'il manque exactement (à demander à l'éditeur Apogée / Dynoco)
1. **URL de l'endpoint** de création/mise à jour de contact ou lead (par ex. `POST /api/v1/leads`).
2. **Méthode d'authentification** et la clé correspondante (jeton Bearer, clé d'API, OAuth ?).
3. **Schéma des champs attendus** + valeurs autorisées pour le type de demande et le statut.
4. **Règle d'idempotence** : Apogée accepte-t-il un `external_id` pour éviter les doublons lors de la mise à jour intention → demande finalisée ?
5. **Environnement de test (bac à sable)** pour valider sans polluer les données de production.

## Geste humain pour activer (quand l'accès est fourni)
```bash
supabase secrets set APOGEE_API_URL="https://..." APOGEE_API_KEY="..." --project-ref btcbjwqiivhpwoszomhg
supabase functions deploy crm-apogee-push --project-ref btcbjwqiivhpwoszomhg
# vérification à blanc, sans écriture CRM :
curl -s -X POST "https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/crm-apogee-push" \
  -H "Authorization: Bearer <service_role>" -H "Content-Type: application/json" -d '{"dry_run":true}'
```
Puis planifier l'appel (cron toutes les 10 min) une fois le premier envoi réel validé.
