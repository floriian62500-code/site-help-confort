# Fonctions edge qui écrivent sur GitHub — dossier de décision

> Demandé par 5795806773 §3B : « ne supprime rien, ne déploie rien ; prépare le patch de
> durcissement ; pour les 5 sans appelant, un tableau non sensible ; le but est que Florian puisse
> trancher en une seule fois sans nouvel audit ».
>
> **Rien n'a été supprimé, rien n'a été déployé.** Tout ce qui suit est prêt et testé, en attente.

## 1. De quoi on parle, sans détail exploitable

Sept fonctions edge savent écrire dans le dépôt GitHub. Elles sont **toutes déployées et actives**.
Le point commun de leurs versions actuelles : elles n'identifient pas qui appelle, et elles
utilisent un jeton GitHub **fourni dans la requête**. Deux d'entre elles visent `main` par défaut.

## 2. Les cinq sans appelant — tableau de décision

Aucune n'est appelée par une page du site, une page d'administration, une autre fonction, un
planificateur de la base ou un workflow. Zéro appel sur les dernières 24 h (c'est la fenêtre
maximale que donne la journalisation : au-delà, je n'ai pas de mesure, et je ne l'invente pas).

| Fonction | Dernier appel connu | Ce dont elle dépend | Risque si on la supprime | Recommandation |
|---|---|---|---|---|
| `gh-push-batch` | aucun sur 24 h ; aucun appelant depuis la récupération des sources | jeton fourni par l'appelant ; **vise `main` par défaut** | faible : aucun appelant connu. À vérifier auprès de toi : un outil externe (n8n, Make, script perso) pourrait l'appeler sans trace dans le dépôt | `REMOVE_CANDIDATE` |
| `gh-push-from-chunks` | idem | idem ; **vise `main` par défaut** ; complète `gh-push-batch` pour les gros fichiers | faible, même réserve | `REMOVE_CANDIDATE` |
| `gh-delete-files` | idem | jeton fourni par l'appelant | faible — et c'est la plus dangereuse à laisser ouverte : elle **supprime** des fichiers | `REMOVE_CANDIDATE` |
| `gh-bulk-purge-seo-stats` | idem | jeton fourni par l'appelant ; écrite pour une opération unique de juin (purge des blocs `seo-stats`) | faible : l'opération est passée, et le sujet a été traité autrement depuis | `REMOVE_CANDIDATE` |
| `sync-files-staging-to-main` | idem | jeton fourni par l'appelant ; **copie des fichiers de `staging` vers `main`, donc vers la production** | faible côté usage, élevé côté conséquence si elle est appelée par erreur : elle publie en prod | `REMOVE_CANDIDATE` |

**La réserve, honnêtement** : « aucun appelant dans le dépôt » ne veut pas dire « jamais appelée ».
Le même raisonnement m'aurait fait supprimer `indexnow-ping`, qui tourne chaque matin par un
planificateur invisible depuis le dépôt. Si l'une de ces cinq est déclenchée depuis un outil
extérieur que tu connais, dis-le : elle passe alors en `KEEP_HARDEN`.

## 3. Les deux encore utilisées — `KEEP_HARDEN`

| Fonction | Appelée par | Décision |
|---|---|---|
| `gh-push-inline` | `admin-pro/photos.html`, `assets/hc-edit-mode.js` | `KEEP_HARDEN` |
| `gh-edit-file` | `assets/hc-edit-mode.js` | `KEEP_HARDEN` |

Note liée au §6 : `hc-edit-mode.js` (le CMS WYSIWYG) **n'est chargé par aucune page aujourd'hui**.
Si tu décides de retirer ce mode d'édition, ces deux fonctions n'ont plus qu'un appelant
(`admin-pro/photos.html`) — et elles peuvent aussi devenir des `REMOVE_CANDIDATE`.

## 4. Le patch de durcissement — prêt, testé, non déployé

Logique commune : `supabase/functions/_shared/github-write.ts`.
Branchements : `gh-push-inline/HARDENED_index.ts` et `gh-edit-file/HARDENED_index.ts`.
Les versions actuelles (`index.ts`) restent en place, inchangées, pour le retour arrière.

Ce que le patch impose :

1. **Appelant** : membre du personnel authentifié (jeton Supabase + rôle actif). Plus d'appel anonyme ;
   `verify_jwt = true` au déploiement.
2. **Jeton GitHub côté serveur** (`GITHUB_WRITE_TOKEN`). Un jeton présent dans la requête est un
   **refus net**, pas une valeur de repli : sinon l'ancienne faille survivrait au patch.
3. **Liste blanche** dépôt (`GITHUB_WRITE_REPOS`) et branche (`GITHUB_WRITE_BRANCHES`).
   **`main` et `master` sont refusées même si quelqu'un les ajoute à la liste.** Plus de branche
   par défaut : l'absence de branche est une erreur, pas une invitation à écrire sur `main`.
4. **Chemins protégés** : refus de `.github/**`, `supabase/functions/**`, `supabase/migrations/**`,
   `netlify.toml`, `_redirects`, `_headers`, `.env*`, fichiers `.git*` — c'est-à-dire tout ce qui
   change l'exécution du projet ou expose des secrets. Refus aussi des remontées de dossier.
5. **Jamais de force-push**, un seul commit par appel, 50 fichiers et 5 Mo au maximum.
6. **Débit** : 20 appels par 10 minutes et par appelant.
7. **Journal d'audit** : liste blanche de clés (qui, quel dépôt, quelle branche, combien de fichiers,
   quel commit, quel motif de refus). **Jamais le jeton, jamais le contenu, jamais de donnée personnelle.**

**Tests : 35, tous au vert, sans réseau** (`deno test supabase/functions/gh-push-inline/handler.test.ts`
et `.../gh-edit-file/handler.test.ts`) — dont : appel anonyme refusé, client refusé, jeton de requête
refusé, `main` refusée même listée, dépôt hors liste refusé, absence de liste blanche = refus,
chemins d'exécution refusés, remontée de dossier refusée, volume borné, 21ᵉ appel refusé, texte
introuvable ou ambigu refusé, et deux contrôles qui vérifient qu'aucun jeton ni contenu ne fuit
dans le journal.

**Prérequis base** : `supabase/_pending_migrations/20260923150000_gh_write_calls.sql`
(table du journal + limitation de débit). Rejouable, RLS activée sans aucune politique — donc
inaccessible depuis le navigateur —, retour arrière fourni, **vérifiée dans une base jetable**.
**Non appliquée.**

## 5. Procédure, le jour où tu donnes le GO

**Si la décision est « supprimer » (les cinq)** — dans cet ordre :
1. je note la version déployée de chacune (pour pouvoir la remettre) ;
2. suppression une par une, en vérifiant après chacune que le site et l'administration répondent ;
3. retour arrière = redéployer la version notée.

**Si la décision est « durcir »** :
1. appliquer la migration du journal ;
2. poser les trois variables d'environnement ;
3. remplacer `index.ts` par `HARDENED_index.ts`, déployer avec `verify_jwt = true` ;
4. contrôles d'après-déploiement : appel anonyme → 401 ; jeton dans le corps → 403 ; `main` → 403 ;
   chemin `.github/…` → 403 ; écriture normale sur `recette` → commit visible ; 21ᵉ appel → 429 ;
5. retour arrière = redéployer `index.ts` (conservé tel quel dans le dépôt).

⚠️ **Le jeton `GITHUB_WRITE_TOKEN` doit être à portée étroite** : ce dépôt, contenu seulement,
**sans portée workflow**. Je ne crée ni ne manipule aucun jeton.

## 6. Deux remarques qui sortent du périmètre mais qui comptent

- Le workflow `.github/workflows/supabase-deploy.yml` déploie **toutes** les fonctions du dossier à
  chaque poussée sur `main`. Un futur `recette → main` déploierait donc aussi les versions durcies
  **sans décision explicite**, et créerait en production les 10 fonctions qui n'y sont pas encore
  (voir `docs/audit/FONCTIONS-EDGE-2026-09-23.md`). À traiter avant le prochain passage en prod.
- Tant que la décision n'est pas prise, **les versions actuelles restent en ligne telles quelles** :
  ce dossier ne change rien à la production.
