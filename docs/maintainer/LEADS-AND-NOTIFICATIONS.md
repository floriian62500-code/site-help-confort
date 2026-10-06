# Demandes clients et notifications

> Le cœur commercial du site. Mise à jour : 2026-09-20.
> **Toute demande envoyée depuis le site part réellement à l'agence.** On ne teste jamais « pour voir ».

## Le chemin d'une demande

```
formulaire (page)  →  assets/hc-leads-capture.js  →  edge submit-lead-v6  →  table leads
                                                          ├→ notify-lead-v6   (email agence)
                                                          ├→ lead-auto-reply  (accusé client)
                                                          └→ crm-apogee-push  (CRM, si activé)
```

- Le tunnel « Ma demande » (`assets/hc-demande*.js`) suit le même chemin serveur.
- `leads-abandon-sweep` relance les demandes abandonnées (~15 min) sans créer de doublon.
- `upload-lead-photos` gère les photos jointes (bucket privé, URL signée via `lead-photo-signed-url`).

## Le contrat serveur, par type de formulaire

`submit-lead-v6` **refuse** tout envoi non conforme au contrat déclaré par le champ caché
`form_type`. C'est volontaire : la qualité des leads ne se relâche pas globalement.

| `form_type` | nom | contact | code postal | ville | message | métier |
|---|---|---|---|---|---|---|
| `contact_complet` | ✔ | ✔ | ✔ | ✔ | ✔ (+ adresse) | — |
| `demande_metier` | ✔ | ✔ | **✔** | **✔** | ✔ | — |
| `wizard_urgence` | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| `devis_express` | ✔ | ✔ | ✔ | — | ✔ | ✔ |
| `rappel` | ✔ | ✔ | — | — | — | — |
| `price_gate` | ✔ | ✔ | — | — | — | — |

> **Incident du 20/09** : le formulaire de candidature déclarait `demande_metier` sans champ code
> postal → **100 % des candidatures refusées** (HTTP 400). Quand on ajoute un formulaire, on vérifie
> son contrat (méthode dans [TESTING.md](TESTING.md)).

Le client n'envoie que les champs du contrat : un champ supplémentaire (poste visé, expérience, lien
CV…) doit être **porté dans un champ existant** (`metier`, `message`), sinon il est perdu en silence.

## Ce qui distingue les demandes entre elles

| Champ | Rôle |
|---|---|
| `type_demande` | `devis`, `contact`, `candidature`, `prestation`… — vient de `data-hc-lead` |
| `metier` | prestation ou poste visé, lisible par l'agence |
| `utm.form_type` | contrat utilisé |
| `utm.correlation_id` | **clé de déduplication** : relie l'intention (consultation des tarifs) à la demande finale |
| `status` | `nouveau`, ou `intent` pour une intention silencieuse (priorité basse) |

## Confidentialité

- Aucune donnée personnelle dans une URL, un fragment, la mesure d'audience ou un journal.
- Les données de session du tunnel expirent (2 h) et la référence de dossier est remise à zéro après
  envoi, sinon une seconde demande écraserait la première.
- Les photos vivent dans un bucket **privé** ; les orphelines sont purgées.

## En cas de doute

| Symptôme | Piste |
|---|---|
| « le formulaire ne fait rien » | ouvrir la console : `submit-lead-v6` renvoie les erreurs **par champ** ; comparer au contrat ci-dessus |
| lead reçu sans le détail | un champ hors contrat a été ajouté au formulaire sans être porté dans `metier`/`message` |
| doublons | vérifier `utm.correlation_id` ; la relance d'abandon ne doit pas recréer de lead |
| l'agence ne reçoit rien | journaux de `notify-lead-v6` (Resend), puis `lead-auto-reply` |
| candidature mélangée aux demandes clients | `type_demande = candidature` les distingue ; un canal RH dédié reste à créer (gate serveur) |
