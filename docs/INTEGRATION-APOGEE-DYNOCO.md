# Intégration Apogée ↔ Site HELP Confort

> **À envoyer à Dynoco** pour discuter de l'intégration d'un flux automatique entre le formulaire public du site et le CRM Apogée.

## Contexte

**SARL Dépannage 59-62** (marque **HELP Confort** Saint-Omer / Dunkerque) utilise Apogée pour la gestion des interventions, contrats et clients.

Le site web public **https://depan59-62.fr** propose plusieurs formulaires qui génèrent actuellement des leads stockés dans une base intermédiaire (Supabase) puis ré-saisis manuellement dans Apogée.

**Objectif** : automatiser l'import des nouveaux leads dans Apogée → zéro double-saisie → la prise en charge commerciale est plus rapide.

## Architecture cible

```
┌──────────────────┐        ┌────────────────────┐       ┌─────────────┐
│ Site web public  │        │ Supabase           │       │ Apogée      │
│ depan59-62.fr    │───────▶│ (buffer + log)     │──────▶│ (CRM)       │
│ Formulaires      │ POST   │ Edge Function      │ POST  │ Endpoint    │
│ (souscription,   │        │ notify-subscription│       │ /lead/new   │
│ commande, devis) │        └────────────────────┘       └─────────────┘
└──────────────────┘                  │
                                      │ email notif
                                      ▼
                            saint-omer@helpconfort.com
```

Supabase joue le rôle de **passerelle/buffer** : si Apogée est temporairement injoignable, le lead est conservé et re-pushé plus tard. Email de secours envoyé en parallèle (réactivité immédiate).

## Besoin Dynoco

**Ajouter sur l'instance Apogée de Florian Dhaillecourt, l'une des 3 options suivantes** (par ordre de préférence) :

### Option A — Endpoint webhook REST (recommandé)

Un endpoint HTTPS dédié sur l'instance Apogée qui accepte un POST JSON et crée un nouveau lead/contact.

**Spec :**
- URL : `https://apogee.depan59-62.fr/api/v1/lead/new` (par ex.)
- Méthode : `POST`
- Auth : header `X-Apogee-Token: <token>` (token statique fourni par Dynoco)
- Content-Type : `application/json`
- Réponse attendue : `{ "ok": true, "lead_id": "ABC123" }` (HTTP 200/201)

### Option B — API REST CRUD complète

Une vraie API REST avec endpoints standardisés (`GET /leads`, `POST /leads`, `PATCH /leads/:id`, etc.). Permet aussi à terme la **synchronisation bidirectionnelle** (statuts, étapes commerciales).

### Option C — Import par email

Une adresse email dédiée (ex : `import-leads@apogee.depan59-62.fr`) qui parse un format JSON dans le corps de l'email et crée le lead. Moins propre mais plus simple.

## Payload JSON attendu

Pour les **souscriptions de contrats d'entretien** (BASIC / CONFORT / SÉCURITÉ) :

```json
{
  "source": "site_web_depan59-62",
  "type": "souscription_contrat",
  "received_at": "2026-05-14T10:30:00Z",

  "client": {
    "civilite": "M.",
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "0612345678",
    "address": "12 rue de la République",
    "postal_code": "62500",
    "city": "Saint-Omer"
  },

  "contract": {
    "tier": "CONFORT",
    "energie": "gaz",
    "monthly_amount_ht": 12.50,
    "monthly_amount_ttc": 15.00,
    "yearly_amount_ttc": 180.00,
    "start_date_wished": "2026-06-01",

    "logement": {
      "type": "Maison",
      "statut": "Propriétaire"
    },

    "equipement": {
      "marque": "Saunier Duval",
      "modele": "Thelia 23",
      "annee_pose": 2019,
      "dernier_entretien": "2025-09"
    }
  },

  "consent": {
    "cgv_accepted_at": "2026-05-14T10:29:42Z",
    "marketing_opt_in": false
  },

  "tracking": {
    "supabase_contract_id": "8d137e2a-1234-5678-9abc-def012345678",
    "source_page": "/contrats-entretien.html",
    "user_agent": "Mozilla/5.0 ...",
    "ip_country": "FR"
  }
}
```

Pour les **commandes de prestations** ponctuelles (catalogue Services) :

```json
{
  "source": "site_web_depan59-62",
  "type": "commande_prestation",
  "received_at": "2026-05-14T10:30:00Z",

  "client": { ... },

  "service": {
    "category": "plomberie",
    "name": "Détartrage chauffe-eau 100L",
    "variant": "premium",
    "price_ht": 95.00,
    "price_ttc": 114.00,
    "deposit_amount": 45.60
  },

  "planning": {
    "preferred_date": "2026-05-20",
    "preferred_slot": "matin",
    "notes": "Accès facile, chauffe-eau dans le garage"
  },

  "tracking": { ... }
}
```

Pour les **demandes de devis / leads** :

```json
{
  "source": "site_web_depan59-62",
  "type": "demande_devis",
  "received_at": "2026-05-14T10:30:00Z",

  "client": { ... },

  "demande": {
    "metier": "chauffage",
    "type_demande": "devis",
    "message": "Besoin d'un devis pour remplacement chaudière fioul",
    "budget_estime": "5000-10000",
    "urgence": "normale"
  },

  "tracking": { ... }
}
```

## Workflow d'erreurs

- **HTTP 200/201** : lead créé OK, Supabase marque le contract comme `imported_to_crm_at = now()` + stocke le `lead_id` Apogée
- **HTTP 4xx (erreur validation)** : Supabase logge l'erreur, garde le lead en "à importer manuellement", email d'alerte envoyé à l'admin
- **HTTP 5xx / timeout** : retry automatique 3 fois avec backoff (1min, 5min, 15min). Si tous échouent → fallback manuel via l'interface admin

## Délai et budget

**Demande Florian :** ordre d'idée du **délai** (combien de jours/semaines de dev côté Dynoco) et du **coût** de cette intégration.

Pas urgent absolu, idéalement déployable dans les 30 prochains jours. Si l'option A (webhook simple) suffit, ça devrait être 1-2 jours de dev max. L'option B (API REST complète) est plus structurant pour l'avenir.

## Contact

**Florian Dhaillecourt**
- Email : florian.dhaillecourt@helpconfort.com
- Téléphone : 03 66 10 01 34
- Site : https://depan59-62.fr

## Notes techniques pour Dynoco

- Côté Supabase : Edge Function `notify-subscription` (Deno/TypeScript). Le code source est dans le repo du site. Je peux fournir un accès lecture si nécessaire.
- Côté Resend : domaine `depan59-62.fr` vérifié pour les emails sortants (DKIM + SPF déjà configurés chez Gandi).
- Aucune contrainte forte sur le format de l'API côté Dynoco — on s'adaptera au standard que vous proposez.
- Si vous avez besoin de tester l'envoi côté Supabase, on peut faire un POST de test depuis le bouton "Tester le pipeline" du back-office.
