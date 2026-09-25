# Sitemap — paquet de déploiement, prêt et non déployé

> Demandé par 5800544498 §3.B. **Rien n'est déployé, rien n'est fusionné.** Ce document dit quoi
> faire, dans quel ordre, ce qu'on doit voir après, et comment revenir en arrière.

## 1. Ce que sert réellement la production, et pourquoi j'ai d'abord eu tort

J'ai écrit dans l'audit T14/T15 que « deux sitemaps circulent » sans savoir lequel. La cause est
maintenant identifiée, et elle est simple :

| | `main` (production) | `recette` |
|---|---|---|
| Fichier `sitemap.xml` à la racine | **présent**, 190 URL, figé au 11/06 | **supprimé** (commit `0e9b685e`) |
| Règle `_redirects` | `/sitemap.xml → fonction … 200` — **sans `!`** | `… 200!` — **forcé** |
| Ce qui est servi | **le fichier statique** : sans le `!`, le fichier l'emporte sur la règle | **la fonction** |

La production ne sert donc pas la fonction : elle sert un fichier figé depuis juin. Voilà l'écart
190 / 143.

**Correction d'une affirmation de mon audit** : j'avais dit que « 35 pages `/prestations/` sont
absentes du sitemap ». C'était vrai **de la fonction**, pas de la production — le fichier statique
en contient 33. En revanche, il ignore toutes les réalisations publiées depuis juin, et il pointe
l'hôte `www`.

### La preuve, pour ne plus avoir à y revenir

Comparaison faite le 2026-09-24 :

```
fichier sitemap.xml committé sur main   38 204 octets
réponse de https://depan59-62.fr/sitemap.xml   38 204 octets
empreintes SHA-1                        identiques
```

La production sert donc **octet pour octet** le fichier statique de `main`. La fonction edge, elle,
répond bien — mais seulement si on l'appelle directement. Elle n'a jamais alimenté le site public.

`SITEMAP_LIVE_SOURCE = fichier statique /sitemap.xml de main (identifié)`
`SITEMAP_DUPLICATE_SOURCE = fonction edge « sitemap » (identifiée, jamais servie en production)`

## 2. Source canonique, source à neutraliser

- **Source canonique : la fonction edge `sitemap`.** Elle lit les réalisations en base, donc elle
  reste à jour toute seule. C'est déjà le choix acté sur `recette` (`0e9b685e`).
- **Source à neutraliser : le fichier `sitemap.xml` de `main`.** Il est déjà supprimé sur `recette` ;
  la fusion vers `main` le retire. La règle `_redirects` y passe aussi en `200!`, ce qui interdit
  qu'un fichier statique reprenne la main un jour.

Après l'opération, **une seule source** produit le sitemap.

## 3. Ce que la fonction doit émettre

| Point | Attendu |
|---|---|
| Hôte | `https://depan59-62.fr` **uniquement** — l'apex, celui de tous les canonicals. Aucune URL en `www` (qui répond 301) |
| Pages statiques déclarées | **147** (liste `PACKED` de la source du dépôt, prestations comprises) |
| Réalisations | ajoutées dynamiquement depuis la base (`status = publie`), en URL jolie `/realisations/<slug>` |
| Actualités | **aucune** URL `/actualites/<date>-<slug>` : une publication chantier n'a qu'une URL, la fiche. La branche qui les listait a été retirée |
| `/prestations/ramonage.html` | présent (destination de la campagne et du bandeau d'accueil) |
| Total attendu | **147 + nombre de réalisations publiées** (≈ 178 au 23/09) |

Écart connu et voulu avec le fichier statique : les 17 URL `/actualites/<date>-<slug>` disparaissent
— ce sont précisément celles qui redirigent désormais en 301 vers les fiches.

## 4. Procédure, le jour du GO

1. **Relever l'état actuel** : `curl -s https://depan59-62.fr/sitemap.xml > sitemap-avant.xml`
   (190 URL). C'est le point de retour.
2. **Déployer la fonction** depuis la source du dépôt :
   `supabase functions deploy sitemap --project-ref btcbjwqiivhpwoszomhg --no-verify-jwt`.
   ⚠️ `sitemap` est en état `current` dans `supabase/functions/DEPLOIEMENT.json` : elle est donc
   autorisée au déploiement. Rien d'autre ne part avec elle — la liste blanche s'en charge.
3. **Fusionner `recette` vers `main`** pour retirer le fichier statique et poser la règle `200!`.
   ⚠️ Cette fusion emporte tout le reste du travail de recette : c'est une décision à part entière,
   pas une étape technique du sitemap.
4. **Contrôles d'après-déploiement** (les quatre doivent passer) :
   - `curl -s https://depan59-62.fr/sitemap.xml | grep -c 'www\.depan59-62'` → **0**
   - `curl -s https://depan59-62.fr/sitemap.xml | grep -c '<loc>'` → **≥ 147**
   - `curl -s https://depan59-62.fr/sitemap.xml | grep -c '/prestations/ramonage'` → **1**
   - `curl -s https://depan59-62.fr/sitemap.xml | grep -c '/actualites/2026'` → **0**
5. **Google Search Console** : soumettre à nouveau `https://depan59-62.fr/sitemap.xml`.

## 5. Retour arrière

- **Fonction** : redéployer la version précédente (relevée à l'étape 1 côté sortie ; la version
  déployée est la 7 du 08/08). Sans archive de son code, le retour se fait en redéployant la source
  du dépôt corrigée — c'est pourquoi l'étape 1 conserve la **sortie** attendue, qui suffit à
  constater une régression.
- **Fichier statique** : `git revert` de la fusion, ou remise du fichier `sitemap.xml` à la racine
  de `main`. Tant que la règle `_redirects` reste en `200` (sans `!`), le fichier reprend la main
  immédiatement.
- **Délai** : un sitemap erroné n'a pas d'effet immédiat sur le référencement ; le retour arrière
  peut se faire dans la journée sans dommage.

## 6. Ce qui reste hors de ce paquet

Rien de ce document ne touche au contenu du site. Le sitemap ne fait que **déclarer** des URL qui
existent déjà et qui répondent 200.
