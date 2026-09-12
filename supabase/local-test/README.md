# E2E LOCAL isolé (voie A) — runbook zéro-écriture-PROD

But : exécuter les 6 parcours du tunnel de bout en bout contre un backend Supabase **local**
(Docker), sans jamais toucher la PROD. Réponse au lot ChatGPT 5509522354.

## Geste humain (une fois)
Tout le reste est déjà préparé dans le repo (non actif par défaut). Il reste à **lancer le stack local** :

```bash
# prérequis : Docker en marche + Supabase CLI installé
cd "SITE INTERNET"
supabase start                                   # DB+Edge+Storage locaux → http://localhost:54321
supabase db execute --file supabase/local-test/bootstrap.sql   # schéma minimal + fixtures + bucket
# récupérer la clé anon LOCALE affichée par `supabase start` (ligne "anon key")
supabase functions serve --env-file supabase/local-test/functions.env   # RESEND vide = 0 email réel
```

`supabase/local-test/functions.env` (à créer localement, NON commité) :
```
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role LOCAL affiché par `supabase start`>
RESEND_API_KEY=                # vide → notify-lead-v6 n'envoie aucun email
```
> Ne jamais mettre une clé service-role PROD ici. Le service-role LOCAL est un jeton de dev,
> valable uniquement pour le stack local.

## Vérifier le front en local
Servir le site en local puis ouvrir le tunnel avec l'override borné :
```bash
python3 -m http.server 8080         # ou tout serveur statique
# puis dans le navigateur :
#   http://localhost:8080/catalogue.html?backend=local
#   (avant, injecter la clé anon locale : dans la console)  window.__LOCAL_ANON='<anon LOCAL>'
```
L'override backend n'est actif QUE sur `localhost`/`127.0.0.1` **et** avec `?backend=local`
(cf catalogue.html). Il n'a aucun effet sur le domaine preview/prod.

## Lancer l'E2E automatisé (protégé par le guard)
```bash
LOCAL_ANON='<anon LOCAL>' node scripts/test/e2e-local.mjs
```
Le harnais appelle d'abord `assertTestTarget()` (fail-closed) : il **ABORTE** si la cible n'est pas
`localhost`. Il exécute les 6 parcours (prestation tarifée, diagnostic, devis 0/1 photo, entretien,
rappel, urgence) contre le stack local et vérifie HTTP + insertion DB TEST + storage TEST.

## Purge (après tests)
```sql
delete from public.leads where source ilike '%e2e%' or message ilike '%NE PAS TRAITER%';
```
Storage : supprimer les objets `leads/<id>/` via Supabase Studio local (http://localhost:54323).

## Garde absolue
- `PROD_WRITE_GUARD` (`scripts/test/prod-write-guard.mjs`) refuse toute cible ≠ localhost/allowlist TEST.
- Aucune clé PROD, aucun `supabase db push`, aucun email réel (RESEND vide), aucun Stripe.
- `TEST_BACKEND_ISOLATED=PASS` seulement une fois `supabase start` prouvé actif et le guard vert.
