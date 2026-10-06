# REQ-040 — diagnostic tranche : correction front, PAS de mutation RLS

Audit read-only fait par ChatGPT sur Supabase projet btcbjwqiivhpwoszomhg.

## Constat base
- public.stats_publiques existe.
- type = VIEW.
- anon a SELECT sur la vue.
- authenticated a SELECT sur la vue.
- la vue est security_invoker=true.
- anon/authenticated ont aussi SELECT sur public.interventions.
=> Rien dans ce constat ne justifie une mutation RLS pour corriger le 401 actuel.

## Cause exacte trouvee
Dans main, assets/hc-live-stats.js embarque une SUPA_KEY legacy.
La cle legacy anon actuelle du projet est desactivee, et une cle publishable active existe.
La cle embarquee dans hc-live-stats.js n'est pas la cle publique active actuelle.
Le 401 vient donc d'une cle publique obsolette/desactivee cote front.

## Action REQ-040
1. Partir du main courant.
2. Chercher s'il existe deja une source centrale/config publique pour la cle publishable active.
3. Si oui : reutiliser cette source, ne pas dupliquer.
4. Sinon : remplacer uniquement la cle publique obsolete de hc-live-stats.js par la cle publishable active (cle publique, jamais secret/service_role).
5. Aucun changement Supabase/RLS/schema/policy.
6. Ne modifier aucun chiffre fallback, HTML, CSS ou comportement visuel.
7. Preview exacte.
8. Preuves 1440 + 390 sur a-propos :
   - 1 appel stats_publiques en 200 ;
   - 0 appel stats_publiques en 401 ;
   - 0 erreur console liee ;
   - bloc stats affiche les valeurs API ;
   - rendu identique hors valeurs dynamiques ;
   - rollback exact.
9. PASS/BLOCKED puis STOP merge ChatGPT.

## Important
Avant commit, verifier si la meme cle obsolete est dupliquee dans d'autres assets publics. Si oui, rapporter la liste exacte, mais ne pas elargir REQ-040 sans ordre.
