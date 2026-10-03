# Paquet SECURITY-GITHUB-WRITE — P0-3

*Préparé, non appliqué.*

## État exact en production

Neuf fonctions edge acceptent un **jeton GitHub**, un **dépôt**, une **branche** et des **chemins**
depuis le corps de la requête, sans vérifier qui appelle :

`gh-push-inline`, `gh-push-batch`, `gh-push-from-chunks`, `gh-edit-file`, `gh-delete-files`,
`gh-bulk-purge-seo-stats`, `sync-files-staging-to-main`, `promote-to-prod`, `hc-content-save`.

Trois d'entre elles ont **`main` pour branche par défaut** : un appel qui omet `branch` écrit en
production. Aucune n'a de limite de débit ni de trace.

**Le cas le plus grave n'a besoin d'aucun secret.** `hc-content-save` : quand l'appelant ne fournit
pas de jeton, la fonction va en chercher un **côté serveur** (RPC en `service_role`). Omettre un
champ suffit donc pour obtenir une écriture sur le dépôt du site, sans rien détenir. Les seuls
garde-fous sont l'extension `.html` et le refus de `..`.

Côté navigateur, `assets/hc-edit-mode.js` lit un PAT GitHub dans `localStorage` (`hc_gh_token`),
sans expiration, et l'envoie en clair à ces fonctions. Le mode d'édition est restreint par un
cookie et un nom d'hôte : c'est un garde d'interface, pas un contrôle d'accès — les fonctions
restent appelables depuis n'importe où.

## Correctif minimal, et ce qui le rendait indéployable

Le durcissement était **déjà écrit** (`_shared/github-write.ts` + deux `HARDENED_index.ts`) et
**structurellement indéployable** : l'outil ne déploie que `index.ts`. C'est le point le plus
sournois de ce paquet — le dépôt donnait l'impression que la faille était traitée.

Les versions portent désormais le bon nom, dans `supabase/functions-staging/` :

| fichier | ce qu'il impose |
|---|---|
| `gh-push-inline/index.ts` | appelant authentifié **et** membre du personnel ; jeton pris côté serveur ; un jeton fourni dans la requête est **refusé**, pas ignoré |
| `gh-edit-file/index.ts` | idem, plus la branche obligatoire (l'ancienne visait `staging` par défaut) |
| `_shared/github-write.ts` | liste blanche de dépôts et de branches ; **`main` et `master` refusées même si listées** ; chemins d'exécution interdits (workflows, migrations, `_redirects`, `.env`) ; remontée de dossier refusée ; 50 fichiers et ~5 Mo maximum ; 20 appels / 10 min par appelant ; journal sans jeton ni donnée personnelle |

**Non traitées dans ce paquet** : les sept autres fonctions `gh-*`. Elles sont en `quarantine`
(déployées, jamais redéployées automatiquement). La décision la plus simple et la plus sûre est de
les **supprimer du projet Supabase** plutôt que de les durcir : rien dans le site public ne les
appelle. C'est une décision, pas un nettoyage — donc un gate.

## Dépendances

La table de débit `gh_write_calls`
(`_pending_migrations/20260923150000_gh_write_calls.sql`, **non appliquée**). Sans elle, la limite
de débit ne peut pas compter : le durcissement fonctionne, mais sans plafond.

## Tests

`supabase/functions-staging/gh-push-inline/handler.test.ts` (24) et `gh-edit-file/handler.test.ts`
(11), sans réseau : 401 sans jeton d'appelant, 403 pour un client, 403 si un jeton est fourni dans
la requête, refus de `main`/`master`, refus hors liste blanche, refus des chemins d'exécution, 413
au-delà des bornes, 429 au 21ᵉ appel, journal sans fuite.

## Ordre d'application

1. appliquer la migration `gh_write_calls` ;
2. poser `GITHUB_WRITE_TOKEN` (portée étroite : ce dépôt, contenu seulement, **pas** `workflow`),
   `GITHUB_WRITE_REPOS`, `GITHUB_WRITE_BRANCHES` ;
3. déployer les deux fonctions avec `verify_jwt = true` ;
4. décider du sort des sept autres (suppression recommandée) ;
5. révoquer le PAT qui traîne dans les navigateurs, et retirer `hc-edit-mode.js` du chemin public.

## Rollback

Redéployer depuis `supabase/functions/<nom>/index.ts`, inchangés dans le dépôt.

## Interruption de service

Les outils internes qui appelaient ces fonctions avec un PAT de navigateur **cesseront de
fonctionner** : c'est l'objet du correctif. Le site public n'en dépend pas.

## GO humain : oui — déploiement, secrets, et décision sur les sept fonctions restantes.
