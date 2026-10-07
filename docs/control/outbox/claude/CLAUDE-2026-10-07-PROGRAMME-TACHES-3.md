# Programme autonome — tâche 3 (REQ-046) : dossiers internes servis

**PR #47** `fix/dossiers-internes` — base `main` `2a93cd90` — 1 commit, 1 fichier.
**Preview** deploy-preview-47, verte.

## Le relevé

Un fichier témoin par dossier, sur `depan59-62.fr`. **Neuf dossiers répondaient 200**, dont
`/tools/Change-Domain.command`, `/secrets/README.md`, `/supabase/MIGRATIONS-README.md` et
`/admin-pro/scripts/fix_rls_contracts_public_insert.sql`.

Aucune des 204 pages publiques ne référence un seul chemin de ces dossiers — mesuré, pas supposé.

## Ce que fait le lot

Dix règles `404!` dans `_redirects`, **uniquement** pour les dossiers sans aucune référence
publique. Résultat sur la preview : les neuf témoins passent de 200 à **404**, et tout ce qui doit
rester accessible l'est (accueil, back-office Decap et son `config.yml`, assets, fiches,
`robots.txt`, `sitemap.xml`).

Bonus : deux fragments de corps de page de 67 ko traînaient dans `scripts/tmp/` et étaient servis
tels quels. Ils tombent avec `/scripts/*`.

## Un point de la liste de référence était faux

`scripts/tests/depot-propre.test.mjs` demandait de bloquer `/admin/*`. C'est le **back-office
Decap**, lié depuis `actualites.html` et `realisations.html` (« Connectez-vous au back-office »),
et il lit son propre `config.yml` au chargement : le bloquer retirerait l'interface d'édition.
La liste est corrigée côté PR #44, qui possède déjà ce fichier, avec le motif écrit à côté.

**Dépendance :** une fois #47 **et** #44 fusionnées, les 3 derniers échecs de `depot-propre`
tombent. Séparément, chacune n'en ferme qu'une partie.

## Suite

Tâche 5 : reconstruire le tunnel « Ma demande » depuis le `main` courant.
