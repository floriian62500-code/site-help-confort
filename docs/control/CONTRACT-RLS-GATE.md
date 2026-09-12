# GATE — Création de la row `contracts` (souscription) via voie serveur sûre

> `CONTRACT_RLS_FIX = BLOCKED_HUMAN_GATE` — nécessite un GO Florian (deploy edge OU apply policy). Aucun apply/deploy prod sans GO explicite et séparé.
> Source : retour Florian 5453208485 (P0 bloquant). Projet Supabase **btcbjwqiivhpwoszomhg**.

## Constat (cause racine)
La page `/contrats-entretien` faisait **deux soumissions concurrentes** sur le même form :
1. `submitSouscription()` → **INSERT anon direct** `sb.from('contracts').insert(...)` avec la clé **publishable** → **violé par la RLS** (`new row violates row-level security policy for table "contracts"`) → **erreur SQL brute rouge** affichée au client.
2. `data-hc-lead="souscription"` → `hc-leads-capture.js` → `submit-lead-v6` (service_role serveur) → **succès vert** « Demande envoyée ».
→ État contradictoire succès + erreur, et **aucune row `contracts`** réellement créée.

## Correctif livré (frontend, non gated) — commit `22e98c62`
- Retrait de `data-hc-lead` (fin du double handler).
- `submitSouscription()` route la demande via **submit-lead-v6** (service_role, anon-callable) → lead contrat fiable, message métier complet (énergie/formule/prix/agence/équipement/photos/RIB/SEPA), **aucune perte**.
- Succès affiché **uniquement si `resp.ok`** ; sinon message propre + réessai + données conservées ; **aucune erreur SQL/RLS brute** au client ; garde double-clic.
- Photos **facultatives** (retour 5453180213).
→ Le parcours est **utilisable** (0 erreur, capture fiable), mais la **row dédiée `contracts`** (modèle riche : status/tier/monthly_amount/metadata) n'est PAS créée.

## Ce qui reste = GATE (row `contracts`)
Il ne faut **PAS** ouvrir un INSERT anon large sur `contracts` juste pour « faire passer ». Voie cible **serveur** :

### Option A (recommandée) — Edge Function `submit-contract` (service_role)
- Nouvelle edge (Deno) `verify_jwt=false`, anon-callable, qui **valide côté serveur** puis **INSERT `contracts`** avec la clé **service_role** (jamais exposée au client).
- Validation serveur : champs requis, tier ∈ {basic,confort,securite,custom}, montant recalculé/borné serveur (ne pas faire confiance au prix client), sanitation, garde test-lead `NE PAS TRAITER`.
- Déclenche la notification (réutiliser notify-lead-v6 / notify-subscription).
- Retour `{ id }` → confirmation front basée sur ce succès.
- **Action humaine** : `supabase functions deploy submit-contract` (GATE deploy edge).

### Option B — Policy RLS INSERT minimale (si insert client conservé)
- Policy `INSERT` sur `public.contracts` pour le rôle `anon`, **strictement bornée** :
  `WITH CHECK (status = 'prospect' AND subscription_source = 'public_form' AND monthly_amount >= 0)` + colonnes sensibles verrouillées par trigger/DEFAULT (jamais de statut « actif », pas de prix arbitraire).
- Moins sûr que A (le client garde un accès write direct) → **A préférée**.
- **Action humaine** : migration SQL `apply` (GATE apply DB) + rollback prêt.

## Audit à mener avant apply (lecture seule, quand GO)
`policies RLS INSERT effectives · grants anon/authenticated · colonnes NOT NULL/DEFAULT · triggers · différence recette/prod`. Fournir test SQL avant/après.

## Sortie attendue après GO
`CONTRACT_GAS_BASIC/COMFORT/SECURITY=PASS · FUEL=PASS · SOFTENER=PASS · ZERO_PHOTO=PASS · DB_ROW=PASS · RLS=PASS · DUPLICATE_PROTECTION=PASS · NOTIFICATION=PASS · BACKOFFICE=PASS · SUCCESS_UI=PASS · RAW_DB_ERROR_TO_USER=NO`
