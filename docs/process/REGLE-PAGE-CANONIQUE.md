# Réutiliser avant de créer — règle de page canonique

> Directive Florian / ChatGPT du 2026-09-20 (commentaire `5744476570`), après le constat d'une
> landing d'entretien parallèle au design inférieur. **Cela ne doit plus arriver.**

## La règle

Avant **toute** création de page marketing, métier, locale, Ads ou recrutement :

```
SEARCH_EXISTING → IDENTIFY_CANONICAL → REUSE_OR_EXTEND → CREATE_ONLY_IF_NONE
```

Une nouvelle URL n'est autorisée que si **les cinq conditions** sont réunies :

1. aucune page existante ne couvre réellement le besoin ;
2. l'intention SEO/commerciale est distincte ;
3. il n'y a pas de cannibalisation avec une page qui se positionne déjà ;
4. la duplication de contenu est écartée ;
5. l'URL canonique et les liens internes sont définis.

Sinon : **modifier l'existant, ne pas recréer.**

## Le contrôle, en pratique

```bash
# 1. SEARCH_EXISTING — qu'est-ce qui couvre déjà cette intention ?
node scripts/seo/duplicate-intent.mjs --intent "entretien poele insert granules ramonage"

# 2. avant de committer — aucune paire non justifiée ?
node scripts/seo/duplicate-intent.mjs

# 3. contrôle de non-régression (joué avec les autres tests)
node scripts/tests/canonical-pages.test.mjs
```

Le script compare **slug + `<title>` + `<h1>`** de toutes les pages publiques indexables, en ignorant
la marque et les noms de villes, et signale les paires au-dessus de 62 % de similarité.

- ❌ **bloquant** : une paire non justifiée entre deux pages « éditoriales » → fusionner ou justifier.
- ⚠️ **avertissement** : doublon hérité déjà documenté (pages générées, familles métier × ville).

## Le registre : `docs/seo/pages-canoniques.json`

Source de vérité des intentions. Pour chaque intention :

| Champ | Rôle |
|---|---|
| `canonique` | **l'unique** URL à promouvoir (Ads, accueil, CTA, sitemap, liens internes) |
| `pages_liees` | pages proches conservées, avec le rôle et la **justification** de leur existence |
| `doublons_rediriges` | anciennes URLs supprimées, redirigées en 301 dans `_redirects` |
| `familles_locales` | préfixes légitimes (`depannage-`, `chauffagiste-`, …) : même gabarit × ville |
| `paires_autorisees` | exceptions explicites, avec la raison |
| `doublons_connus` | doublons hérités assumés, avec la décision et l'échéance |

Le script vérifie aussi que chaque page canonique **existe**, porte un `<link rel="canonical">`
auto-référent, **figure dans le sitemap**, que les doublons déclarés ont bien disparu et qu'**aucune
page ne pointe encore vers un doublon redirigé**.

## Checklist de fusion (quand un doublon est constaté)

1. **Auditer** : lister toutes les pages liées à l'intention (slug, titre, H1, liens entrants, sitemap, date de création `git log --diff-filter=A`).
2. **Identifier la page canonique historique** : celle qui est indexée, liée et ancienne — pas la dernière créée.
3. **Comparer** contenu, SEO, tracking, CTA, prix, structure.
4. **Fusionner uniquement les améliorations utiles** dans la page canonique.
5. **Rediriger** le doublon en `301!` dans `_redirects` (jamais de page orpheline laissée en ligne).
6. **Repointer** Ads, accueil, CTA, sitemap, liens internes vers l'URL canonique unique.
7. **Vérifier** canonical, JSON-LD, événements de tracking, et 390 / 1440 sur la preview réelle.
8. **Déclarer** la décision dans `docs/seo/pages-canoniques.json`.

## Design

Le niveau visuel de la page canonique reste celui du **site premium actuel** : gabarit `seo-*` des
pages `prestations/` (héros dégradé + `<h1>` avec emphase Playfair italique, bandeau de preuves,
contenu en deux colonnes avec encart collant, FAQ `<details>`, avis vérifiés).
**Jamais de landing parallèle au design inférieur.**

## Historique

| Date | Décision |
|---|---|
| 2026-09-20 | `/entretien-chaudiere.html` (existante depuis le 2026-05-17) confirmée **canonique** pour l'entretien chaudière et passée au gabarit premium. |
| 2026-09-24 | `/entretien-chaudiere.html` **supprimée** (décision Florian) : elle doublonnait la page Chauffage, la page contrats et le catalogue. La canonique de l'intention devient `/chauffagiste-saint-omer.html` ; la demande passe par le tunnel `#cat=chauffage&presta=entretien` ; 301 préparée, avec et sans `.html`. La page était **en ligne et dans le sitemap de production** : la redirection doit voyager dans le même lot que la suppression. |
| 2026-09-20 | `/entretien-poele-insert.html` (créée le 2026-09-19) **fusionnée** dans `/prestations/ramonage.html` (§ `#poele-insert`) puis redirigée en 301. |
| 2026-09-20 | Doublons hérités documentés : `/actualites/<date>-<slug>` ↔ `/realisations/<slug>`, gabarits `/fournisseur.html` et `/partenaire.html` dans le sitemap. |
