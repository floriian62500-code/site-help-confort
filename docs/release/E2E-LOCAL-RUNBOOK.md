# E2E LOCAL isolé — Runbook (voie A, ZÉRO PROD)

> Objectif : exécuter les parcours business de bout en bout contre un **stack Supabase LOCAL**,
> sans jamais toucher la PROD (fail-closed). Rend actionnable l'étiquette `BACKEND_E2E=WAITING_DOCKER`.
> Contexte : directives 5509915252 / 5645034544. Branche `recette` uniquement.

## État courant
`E2E_ISOLATED = BLOCKED_HUMAN_DOCKER` — le CLI Docker est présent (`Docker version 29.7.1`) mais **le démon Docker est arrêté** (`docker info` → DOWN). L'exécution réelle exige un geste humain : **ouvrir Docker Desktop**. Aucune écriture PROD tentée.

Le harnais est **déjà écrit et vérifié statiquement** (ne pas le réécrire) :
- `scripts/test/start-e2e-local.sh` — orchestrateur 9 étapes, fail-closed.
- `scripts/test/e2e-local.mjs` — 6 parcours contre `localhost:54321`, garde en tête.
- `scripts/test/prod-write-guard.mjs` — garde fail-closed. **Self-test = ALL GUARD TESTS PASS** (rejoué ce run).

## Preuve fail-closed (rejouée statiquement ce run)
- `assertTestTarget` **throw (ABORT)** si : `allowTest!==true`, `mode!=='test'`, cible vide, ref PROD `btcbjwqiivhpwoszomhg`, host PROD (`*.supabase.co` PROD, `depan59-62.fr`, `app.depan59-62.fr`, `api.resend.com`), ou ref non-local non-allowlisté. Ne **passe que** `localhost/127.0.0.1` ou un ref explicitement ajouté à `KNOWN_TEST_REFS` (vide aujourd'hui).
- `start-e2e-local.sh` : abort si Docker down, CLI absente, `supabase/.temp/project-ref == PROD`, ou `API_URL` ≠ localhost ; `supabase start` **jamais `--linked`** ; `RESEND_API_KEY=` **vide → 0 email** ; purge des fixtures locales en fin de run.

## Prérequis (humain)
1. **Docker Desktop lancé** (`docker info` doit répondre).
2. **Supabase CLI** installée (`command -v supabase`).
3. Fichiers présents : `supabase/local-test/bootstrap.sql` (jeu de données TEST) et les edge functions sous `supabase/functions/`.

## Commande exacte
```bash
bash scripts/test/start-e2e-local.sh
```

## Ce qui se passe (services attendus)
1. Docker OK → 2. CLI OK → 3. garde anti-PROD (projet lié) → 4. `supabase start` (Postgres+API+Storage LOCAL) → 5. garde API_URL=localhost → 6. `bootstrap.sql` (données TEST) → 7. `supabase functions serve` (env TEST, RESEND vide) → 8. `node scripts/test/e2e-local.mjs` → 9. purge des leads fixtures.

## Healthchecks
- `supabase status` renvoie `API_URL=http://127.0.0.1:54321` (sinon ABORT).
- `/tmp/hc-e2e-fns.log` = logs des functions servies localement.
- Sortie finale attendue : `✅ FULL_E2E_LOCAL=PASS`.

## Jeu de données de test
`supabase/local-test/bootstrap.sql` (LOCAL uniquement). Tous les leads de test portent `NE PAS TRAITER` + `source ~ e2e` et sont purgés en étape 9.

## Matrice E2E (couverture)
| # | Parcours | Couvert par `e2e-local.mjs` | À compléter |
|---|---|---|---|
| J1 | Price gate / lead `consultation_tarifs` + prestation tarifée | ✅ (submit-lead-v6) | — |
| J2 | Diagnostic guidé | ✅ | — |
| J3 | Devis **avec** photo (upload storage local) | ✅ (PNG minimal) | — |
| J3b | Devis **sans** photo | ✅ (payload sans upload) | — |
| J3c | Échec photo **non bloquant** | ⛔ | ajouter : upload invalide → lead reste OK |
| J4 | Entretien ponctuel | ✅ | — |
| J4b | Contrat entretien | ⛔ | ajouter payload `form_type=contrat` |
| J5 | Rappel | ✅ | — |
| J6 | Urgence (tel/CTA) | n/a (front only) | vérif front |
| X1 | Double-submit / idempotence | ⛔ | rejouer 2× le même payload, attendre 1 seul effet |
| X2 | Erreur réseau | ⛔ | cible injoignable → échec géré, pas de crash |

> Les compléments (J3c/J4b/X1/X2) exigent le stack local pour être **validés** ; à ajouter au harnais quand Docker est up (ne pas ajouter de test non exécutable/non prouvé).

## Nettoyage
`supabase stop` (arrête tout le stack local). L'étape 9 purge déjà les leads fixtures.

## Preuves attendues (à joindre au retour)
- `[guard] cible TEST validée: 127.0.0.1` ;
- 5 lignes `[Jn] HTTP 200 id=… OK` ;
- `✅ FULL_E2E_LOCAL=PASS` ;
- `PROD_WRITES=0`, `STRIPE_LIVE_CALLS=0`, `0 email` (RESEND vide).
