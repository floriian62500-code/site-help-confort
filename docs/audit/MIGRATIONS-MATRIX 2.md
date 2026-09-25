# Matrice des migrations de durcissement (AUCUN apply — GO Florian requis)

> Projet Supabase `btcbjwqiivhpwoszomhg` = base **prod** (pas de branche Supabase : org non-Pro).
> Toute application = mutation prod = gate. Fichiers `PROPOSED_*` prêts, non appliqués.

| MIGRATION | POURQUOI | RISQUE | RÉVERSIBILITÉ | TEST AVANT | TEST APRÈS | ROLLBACK |
|---|---|---|---|---|---|---|
| `PROPOSED_20260821_leads_insert_hardening.sql` (retire/restreint `leads_public_insert`) | INSERT anon direct court-circuite l'edge (validation/rate-limit/honeypot) = spam | Casser un formulaire qui POST en direct `/rest/v1/leads` | Élevée (recréer la policy) | Vérifier `grep -r "/rest/v1/leads"` côté front = 0 POST direct (chemin = edge submit-lead) | Soumettre un lead via le site → OK ; INSERT anon REST direct → refusé | `create policy leads_public_insert ...` (réappliquer l'ancienne) |
| `PROPOSED_20260822_storage_site_photos_hardening.sql` (drop 3 policies public sur `site-photos`) | anon peut INSERT/UPDATE/DELETE = défacement/DoS ; le front ne fait que LIRE | Casser un upload légitime **si** un outil admin upload via anon (à vérifier) | Élevée (recréer les policies) | Confirmer que l'upload admin passe par un compte `authenticated` (pas anon) | Page métier affiche toujours ses photos (lecture publique conservée) ; upload anon → refusé | recréer `site_photos_public_insert/update/delete` |
| `20260820_release_flow.sql` (4 tables release) | socle release flow / UI 4 états | Faible (création de tables neuves, pas de modif existant) | Élevée (`drop table`) | Vérifier absence de collision de noms de tables | `select` sur les 4 tables OK ; générateur écrit un lot | `drop table release_*` |

## Ce qui est testable HORS mutation prod (préparé)
- Les SQL sont **relisibles** ; leur effet est décrit ci-dessus.
- Le générateur de lot (`build-release-lot.mjs`) tourne déjà sans les tables (mode DRAFT).
- Pour `leads`/`storage` : la vérification « aucun POST direct / upload anon » se fait par **grep + audit RLS** (fait : front poste via edge ; buckets audités).

**Aucun apply sans GO.** Ordre recommandé : storage (isolé, sûr) → leads (après vérif 0 POST direct) → release tables (neuves).
