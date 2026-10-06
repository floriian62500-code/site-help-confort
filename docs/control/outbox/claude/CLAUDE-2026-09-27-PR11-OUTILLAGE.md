# Retour Claude — PR #11 outillage Cursor / VS Code (contrôle + correctifs)

message_id: CLAUDE-2026-09-27-PR11-OUTILLAGE
objet: PR floriian62500-code/site-help-confort#11 — « Tooling: préparer Cursor / VS Code sans toucher au site »
branche de la PR: tooling/cursor-vscode-setup (tête f34f6d18)
date: 2026-09-27
nature: contrôle + 4 correctifs poussés SUR LA BRANCHE DE LA PR — aucun merge fait par moi

## VERDICT_COURT
L'intention est bonne et le périmètre est tenu : aucun fichier public du site n'est modifié.
Mais la PR **échouait la propre garde du dépôt**, et cet état **est aujourd'hui dans `recette`**.
Les 4 correctifs sont écrits, testés et poussés sur la branche de la PR ; je n'ai pas pu les
porter dans `recette` (voir BLOQUAGE).

## ETAT_ACTUEL_DE_RECETTE — À TRAITER EN PREMIER
L'outillage a été fusionné dans `recette` (commit `1db70eed`, squash) **sans** les correctifs.
Résultat, mesuré sur `recette` à l'instant (`369ce8c8`) :

```
$ node scripts/tests/depot-propre.test.mjs
  ❌ aucun dossier suivi n’échappe à la fois à la liste des dossiers publics
     et aux règles de blocage
     .cursor, .vscode
RÉSULTAT DÉPÔT PROPRE : 9 PASS / 1 FAIL   (exit 1)
```

`recette` est donc **rouge** sur une garde de sécurité de publication, et REQ-20260926-028 a été
passée `CLOSED` alors que cette garde échoue. Je ne touche pas à ce statut — la clôture appartient
au contrôle — mais je le signale, preuve à l'appui, plutôt que de le laisser passer.

## CE_QUI_CLOCHAIT — 4 constats, chacun vérifié

### 1. `.vscode` et `.cursor` non déclarés (c'est ce qui casse la garde)
`netlify.toml` publie depuis la racine (`publish = "."`). `_redirects` le dit lui-même :
« Tout fichier suivi est donc servi, sauf regle ci-dessous ». Les deux nouveaux dossiers n'avaient
aucune règle, d'où l'échec de `depot-propre`.

**Exposition réelle : non, vérifiée.** Netlify ne sert déjà pas les chemins commençant par un point.
Codes relevés sur la preview, dont deux fichiers suivis **sans aucune règle de blocage** :

| chemin | code | règle `_redirects` ? |
|---|---|---|
| `/.gitignore` | 404 | non |
| `/.env.example` | 404 | non |
| `/.github/workflows/ci.yml` | 404 | oui |
| `/.autopush/state.json` | 404 | oui |
| `/.vscode/settings.json` | 404 | non |
| `/.cursor/rules/help-confort.mdc` | 404 | non |
| `/.editorconfig` | 404 | non |

Donc **pas de fuite** aujourd'hui. La règle explicite reste exigée par la garde, et elle protège
si ce comportement de Netlify change ou si un fichier sort d'un dossier caché.
Correctif : `/.vscode/*` et `/.cursor/*` → `404!`, dans le bloc « Dossiers internes ».
`depot-propre` repasse à **10 PASS / 0 FAIL**.

### 2. `.editorconfig` aurait produit des diffs parasites sur les pages
`insert_final_newline = true` s'appliquait à `[*]`, donc aux pages du site. Or **70 des 265 pages
suivies n'ont pas de saut de ligne final** (compté fichier par fichier). Ouvrir puis enregistrer
une page dans Cursor/VS Code y ajoutait une ligne → un diff sans rapport avec le travail, que le
démon d'auto-sauvegarde committe et pousse tout seul sur `recette`.
Correctif : exception `insert_final_newline = false` pour `[*.html]`, le reste inchangé.

### 3. Les tâches ne jouaient que la moitié de la suite
`HC: tests Node complets` et `HC: controles pre-commit` bouclaient sur `scripts/tests/*.test.mjs`
seulement : `garde-wip.test.sh` (17 contrôles) et `autopush.test.sh` (32 contrôles) étaient ignorés.
Correctifs : les deux tâches jouent les deux familles ; ajout de trois tâches pour le **verrou de
session** (ouvrir / prolonger / fermer — seul garde-fou contre le démon, et « ouvrir » deux fois ne
remet pas le TTL de 90 min à zéro) ; ajout d'une tâche **bump des assets** (`/assets/*` est en cache
immuable un an : sans bump du `?v=`, un correctif reste invisible en ligne) ; le serveur local
précise qu'il ne fait pas les URL sans `.html` comme Netlify, pour ne pas prendre un 404 local
pour un bug.

Chaîne pré-commit rejouée commande par commande sur la branche, toutes à `rc=0` :
`autopush.test.sh` 32/0 · `seo-guardrails` **ERRORS=0** (74 avertissements) · `sync-header --check` ·
`duplicate-intent` OK · `fix-compound-selectors --check` · `gen-offres-emploi --check`.
Aucune de ces commandes ne modifie le dépôt (vérifié : `git status` vide après exécution).

### 4. Les règles Cursor contenaient une affirmation fausse
« `catalogue.html` = tunnel historique » : c'est le **parcours de commande en service** (accueil
2 modes + diagnostic → panier → coordonnées → envoi). Le prendre pour un reliquat mène à le
dupliquer ou à le laisser pourrir. Corrigé, et complété par les pièges qui viennent chacun d'un
incident réel : cache immuable des assets, en-tête qui ne s'édite jamais dans une page, publication
depuis la racine, démon d'auto-sauvegarde et TTL du verrou, serveur local sans pretty URLs, ne
jamais franchir l'étape tarifs ni cliquer « Réserver » en test, immutabilité de la branche de
sauvegarde, pas de réécriture d'historique sur `recette`, rapport attendu sous
`docs/control/outbox/claude/`, un commit par request_id.

## CE_QUI_EST_ARRIVE_PENDANT_LE_CONTROLE — relu aussi
Cinq fichiers se sont ajoutés à la branche en cours de revue : workflow `web-quality.yml`
(Lighthouse hebdomadaire), `scripts/quality/lighthouse-summary.mjs`,
`scripts/quality/screaming-frog-mac.sh`, `docs/ops/SEO-QUALITY-STACK.md`,
`docs/ops/EXTERNAL-TOOLS-SETUP.md`. Contrôlés :
- **lecture seule** : `permissions: contents: read`, aucun secret, aucun déploiement, aucune écriture
  sur le site ni sur Supabase ; artefacts conservés 14 jours ;
- les 5 URL de production auditées répondent toutes **200** (vérifié par requête) — le rapport ne
  mesurera donc pas une page 404 par erreur ;
- `scripts/` et `docs/` sont déjà bloqués côté public ; le script Screaming Frog est en mode 644 et
  la doc l'appelle bien par `sh …`, c'est cohérent ;
- Lighthouse reste une mesure de laboratoire : utile en tendance, ce n'est pas le terrain (CWV).

## PREUVES
| contrôle | avant correctifs | après correctifs |
|---|---|---|
| `depot-propre` | **9 PASS / 1 FAIL** (`.cursor, .vscode`) | **10 PASS / 0 FAIL** |
| suite complète (31 fichiers, `.mjs` + `.sh`) | 839 PASS / **1 FAIL** | **840 PASS / 0 FAIL** |

Suite rejouée après l'arrivée des 5 fichiers qualité : toujours **840 PASS / 0 FAIL**, 31 fichiers
tous en code 0.

## BLOQUAGE — pourquoi `recette` est encore rouge
J'ai tenté de porter les 4 correctifs dans `recette` (`git cherry-pick`). L'action a été **refusée
par la garde d'outil de mon environnement**, motif « Merge Without Review » : je n'ai pas le droit
d'introduire dans une branche d'intégration des commits venant d'ailleurs sans revue humaine.
Je n'ai pas cherché à contourner. Les correctifs restent donc sur la branche de la PR.

**Deux façons de refermer, au choix de Florian :**
1. **merger la PR #11** dans `recette` : elle ne contient plus que mes 4 correctifs comme nouveauté,
   puisque le reste y est déjà par le squash `1db70eed` ;
2. ou me donner le GO pour **réécrire directement** les 4 fichiers sur `recette` (même contenu, mon
   propre commit, sans import de commits).

Tant que l'un des deux n'est pas fait, `recette` échoue `depot-propre` et la CI reste rouge.

## NO_PUBLIC_MUTATION_PROOF
Aucune page, aucun asset, aucune image, aucune fonction edge, aucune migration, aucun Stripe,
aucune 301, aucune suppression de page, aucun changement de navigation, aucun merge vers `main`,
aucun déploiement. Les seuls fichiers touchés par mes 4 commits : `_redirects` (deux lignes de
blocage pour des chemins de développement — aucune page affectée), `.editorconfig`,
`.vscode/tasks.json`, `.cursor/rules/help-confort.mdc`.

Le gel visuel REQ-023 est respecté : rien de visible n'a changé.

## NEXT_ACTION
1. Florian : merge de la PR #11 **ou** GO d'application directe → `recette` repasse au vert.
2. Le gel reste en place : la validation visuelle de REQ-023 est toujours ce qui débloque
   REQ-026, REQ-020 et REQ-017.

## DEUXIEME_LOT_D_OUTILLAGE — arrivé pendant que j'écrivais ce rapport
`df788e04` (REQ-20260926-030, Figma + Playwright + QA visuelle) a fusionné dans `recette` :
`.cursor/mcp.json`, `.github/workflows/visual-qa.yml`, `scripts/setup-ai-dev-tools.sh`,
`docs/ops/AI-DESIGN-QA-STACK.md`, `docs/ops/VISUAL-QA.md`.

Contrôlé tout de suite, parce que **le dépôt GitHub est public** :
- `.cursor/mcp.json` **ne contient aucun secret** — seulement l'URL du MCP Figma et la commande
  `npx @playwright/mcp@latest`. L'authentification Figma se fait à la main via `/mcp`, hors dépôt.
  Rien à retirer.
- `visual-qa.yml` : déclenchement manuel seulement, `permissions: contents: read`, captures 1440 et
  390 de 6 pages de la preview, artefacts uniquement. Aucune écriture, aucun déploiement.
- `setup-ai-dev-tools.sh` : installe les MCP en local, ne touche pas le dépôt, et rappelle lui-même
  de ne jamais envoyer un vrai lead ni un paiement LIVE.

**Mais le même trou reste ouvert et s'aggrave** : `.cursor/mcp.json` tombe dans `.cursor/`, toujours
sans règle de blocage. `depot-propre` reste donc à **9 PASS / 1 FAIL** sur `recette`. Le correctif de
la PR #11 couvre déjà ce fichier, puisqu'il bloque le dossier entier.

Conséquence de calendrier : mon suivi devient **REQ-20260926-031** — l'identifiant 030 a été pris
entre-temps par le lot Figma/Playwright, et un request_id ne se réutilise jamais.
