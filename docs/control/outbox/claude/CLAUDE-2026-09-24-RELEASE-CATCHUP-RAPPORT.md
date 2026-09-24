# Rapport — rattrapage production

message_id: CLAUDE-2026-09-24-RELEASE-CATCHUP-RAPPORT
parent_message_id: CHATGPT-2026-09-24-RELEASE-CATCHUP-V1
controle: CHATGPT-2026-09-24-RELEASE-CATCHUP-CONTROL-1
date: 2026-09-24
needs_human: true

## ACK

Publié dans `CLAUDE-2026-09-24-RELEASE-CATCHUP-ACK.md`.

## INVENTAIRE

Commande : `git log --oneline audit/main..HEAD` et l'inverse.

| Mesure | Valeur | Preuve |
|---|---|---|
| Base commune | `755ed1bf` — 8 août 2026 | `git merge-base` |
| Commits recette absents de main | 697, dont 251 sauvegardes automatiques → **446 fonctionnels** | `git log --format=%s` + filtre |
| Commits main absents de recette | 54 = 53 rapports nightly + 1 fusion, **uniquement** `admin-pro/audits/` | `git diff --name-only HEAD...audit/main` |
| Fichiers modifiés | 936 · +68 551 / −49 689 | `git diff --stat` |

Impact d'une fusion, par périmètre : 104 pages publiques · 129 pages admin · 29 assets ·
2 fichiers de routage Netlify · **63 fonctions edge (redéploiement)** · **3 migrations (`db push`)** ·
2 workflows · 333 fichiers inertes (docs, scripts).

## READY_100

**Aucun élément avec effet en production.**

Le critère exige les quatre conditions simultanées. La troisième — ISOLABLE — est fausse pour tout
changement utile, et c'est mesuré, pas supposé. Test de transplantation sur une branche créée
depuis `main` :

| Commit | Contenu | Résultat |
|---|---|---|
| `2662355f` | correction des prix publics | **1 conflit** |
| `f8650b7c` | entités JSON-LD | **47 conflits** |
| `6dd7be1b` | canonicalisation des actualités | **3 conflits** |
| `a9f7f72f` | (commit de message, diff vide) | s'applique, ne livre rien |

Commande : `git checkout -b essai/release audit/main && git cherry-pick --no-commit <sha>`.
Branche d'essai supprimée après mesure.

Résoudre ces conflits à la main produirait un état **jamais testé** — ce que le critère interdit.
La cause est structurelle : la base date du 8 août, et chaque page a divergé depuis.

Restent réellement isolables : `docs/` (219 fichiers) et `scripts/` (114). **Effet en production :
aucun** — non servis, et `/scripts/*` renvoie 404. Les livrer seuls ne changerait rien pour un
visiteur ; je ne construis donc pas une branche de release pour du vide.

## EXCLUSIONS

| Lot | Classe | Raison |
|---|---|---|
| Bandeau d'accueil | NEEDS_FLORIAN | validation visuelle jamais donnée (`WAITING_FLORIAN` depuis le 23/09) |
| Sous-lot saisonnier `5812875220` | NEEDS_FLORIAN | réouvert, corrigé, non revalidé |
| `submit-lead-v6` / `notify-lead-v6` | NEEDS_SECURITY_GO | versions du dépôt jamais mises en ligne : **211** et **296** lignes d'écart avec la production (sources déployées téléchargées et comparées) |
| 3 migrations | NEEDS_SECURITY_GO | base partagée avec la production |
| Front (104 pages, 29 assets) | NOT_READY | non isolable du bandeau et du saisonnier |
| Rapports d'audit | OBSOLETE | déjà plus récents en production |

## RELEASE_DIFF

**Aucune branche de release créée** : elle ne contiendrait aucun élément à effet visible.
`docs/release/CURRENT-RELEASE.json` porte `statut = AUCUNE_RELEASE_ACTIVE` et la raison mesurée.

## TESTS

Sur `recette`, au SHA de ce rapport :

```
suite complète              21 fichiers, 0 échec
liste blanche déploiement   23/23   (4 nouveaux : dossier migrations)
pilotage des livraisons     13/13   (nouveau)
auto-push                   32/32
demande v2                 176/176
garde-fous SEO              ERRORS=0
inventaire                  non_classe=0
entité JSON-LD              alignée
```

Rien de ceci ne teste la production : aucun test n'y touche.

## ROLLBACK

Sans déploiement, il n'y a rien à annuler. Pour chacun des gates, le retour arrière est écrit dans
`docs/release/TABLEAU-EXECUTION-FINAL.md` (13 lignes, colonne ROLLBACK).

## RISQUES_RESIDUELS

1. **Deux critiques de sécurité restent ouvertes en production** — elles passent avant tout
   rattrapage fonctionnel, la directive le dit elle-même.
2. **La production sert un sitemap figé au 11 juin** : les réalisations publiées depuis n'y sont pas.
3. **L'écart continue de croître** tant qu'aucune validation visuelle n'est donnée : chaque jour de
   travail éloigne un peu plus les deux branches.

## GATES_HUMAINS

Les 13 lignes de `docs/release/TABLEAU-EXECUTION-FINAL.md`, chacune avec priorité, risque, action
Florian, action après GO, test de succès et rollback.

Les trois qui débloquent le rattrapage : **fermer l'accès aux données** (10 s), **valider
visuellement** le bandeau et le saisonnier, **décider du pipeline de leads**.

## ANTI_DERIVE

Mission 2 livrée sur `recette` :

- `docs/release/CURRENT-RELEASE.json` : source de vérité d'une livraison, 7 états autorisés
  (`DEV → … → PROD_VERIFIED`), exclusions nommées avec leur raison ;
- `scripts/release/derive.mjs` : les trois seuils demandés (30 commits fonctionnels, 7 jours,
  10 éléments prêts), **sauvegardes automatiques et rapports `[skip ci]` exclus du comptage** ;
- branché en CI **en alerte, sans bloquer** : rendre la CI rouge en permanence noierait le signal.
  Le mode `--strict` existe pour le processus de release, où le seuil doit arrêter la main ;
- `scripts/tests/derive-release.test.mjs` : 13 contrôles sur la règle elle-même ;
- garde-fou trouvé et posé en chemin : plus aucune proposition ni aucun rollback ne peut séjourner
  dans `supabase/migrations/`, le dossier appliqué automatiquement en production.

Mesure actuelle : **447 commits fonctionnels d'avance, seuil 30 → alerte P0 active.**

## SHA_FINAL

Voir le commit portant ce rapport sur `recette`.

## NEXT_ACTION

`FLORIAN_P0_SECURITY` — fermer l'inscription Supabase (10 secondes), puis donner les deux
validations visuelles. Sans ces trois gestes, aucun rattrapage n'est possible, et l'écart continue
de croître.

**Aucune mutation de production. Aucun GO demandé.**
