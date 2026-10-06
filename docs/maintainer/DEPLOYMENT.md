# Mise en ligne

> Mise à jour : 2026-09-20.

## Les trois canaux, et qui décide

| Canal | Déclencheur | Effet | Décision |
|---|---|---|---|
| **Site (recette)** | push sur `recette` | reconstruit la **preview** `deploy-preview-2--remarkable-dragon-364e2b.netlify.app` | automatique |
| **Site (production)** | push sur `main` | met en ligne `depan59-62.fr` | **humaine, explicite** |
| **Migrations SQL** | push sur `main` touchant `supabase/migrations/**.sql` | GitHub Actions applique les migrations sur la base de **production** | **humaine** (c'est le push sur `main` qui décide) |
| **Fonctions edge** | aucun automatisme | rien ne part tant qu'on ne déploie pas à la main | **humaine** |

```bash
# pousser recette sans jeton stocké (authentification déléguée à gh)
git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
    push https://github.com/floriian62500-code/site-help-confort.git HEAD:recette
```

Un démon local fait déjà ce push automatiquement : [../ops/AUTO-PUSH.md](../ops/AUTO-PUSH.md).

## Vérifier qu'un déploiement a réellement eu lieu

Un `200` sur la preview ne prouve rien : elle peut servir une version précédente.

```bash
gh api repos/floriian62500-code/site-help-confort/commits/<sha>/statuses --jq '.[0].state'
curl -s https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/<page> | grep "<un marqueur neuf>"
```

**Piège historique (18/09)** : la règle `ignore` de `netlify.toml` annule le build quand le diff ne
contient que des fichiers non publiés (docs, scripts, `.md`). Elle compare
`$CACHED_COMMIT_REF..$COMMIT_REF`. Sans cache, Netlify donne la **même valeur** aux deux références :
le diff est vide et le build est annulé à tort (« Canceled build due to no content change »). D'où la
garde ajoutée : si les deux références sont égales, **on construit**.

## Cache : la règle qui casse tout si on l'oublie

| Chemin | Cache | Conséquence |
|---|---|---|
| `/assets/*` | **1 an, immuable** | un fichier modifié n'est **jamais** rechargé : il faut changer son `?v=` dans les pages |
| `/*.css` (racine) | 30 jours (1 h via `_headers` pour `styles.css`) | bumper `styles.css?v=` en cas de modification visible |
| pages `.html` | revalidation | correctifs visibles rapidement |

```bash
node scripts/bump-module-version.mjs   # bumpe la version du module « Ma demande »
# ⚠️ il remplace la chaîne partout : relire le diff (il a déjà bumpé hc-consent par erreur)
```

## Déployer une fonction edge (décision humaine)

```bash
supabase functions deploy <nom> --project-ref btcbjwqiivhpwoszomhg
```

Avant de déployer : télécharger la version en production, la comparer à celle du dépôt (elles ont
divergé par le passé), vérifier `verify_jwt` (un cron appelle parfois sans en-tête d'autorisation) et
garder une copie de la version remplacée pour pouvoir revenir en arrière.

**En attente de déploiement aujourd'hui** : `sitemap` (ajout de `/prestations/ramonage.html` et des
deux offres d'emploi).

## Revenir en arrière

| Cas | Geste |
|---|---|
| recette cassée | `git revert <sha>` puis push (jamais de `--force`) |
| production cassée | revert sur `main` → Netlify reconstruit |
| fonction edge | redéployer la version précédente (copie conservée avant déploiement) |
| migration SQL | écrire une migration inverse ; ne jamais éditer une migration déjà appliquée |

## Points de vigilance

- **Ne jamais forcer un push.** L'historique de `recette` est partagé avec le démon.
- **Repo privé** : passer le dépôt en privé casse le build Netlify tant que l'accès de l'app GitHub
  n'est pas réparé (constaté).
- **Les fichiers internes ne doivent pas être servis** : `_redirects` renvoie `/docs/*`, `/scripts/*`,
  `/supabase/*`, `/partials/*` vers 404. Vérifier après tout ajout de dossier.
