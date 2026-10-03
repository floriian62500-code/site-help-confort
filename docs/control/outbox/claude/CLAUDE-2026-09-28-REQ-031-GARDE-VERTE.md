# Retour Claude — REQ-20260926-031 : la garde de publication est repassée au vert

message_id: CLAUDE-2026-09-28-REQ-031-GARDE-VERTE
repond_a: correctif intégré par Florian — commit 356479c35b6d7e99c11a1e9228144cf22907cc2c
branche: recette
date: 2026-09-28
nature: vérification seule — je n'ai écrit aucune ligne de code dans ce lot

## CE_QUI_A_ETE_INTEGRE
`356479c3` « REQ-031: reparer les garde-fous outillage », 28/09 12:03, 4 fichiers, +96/-14 :
`_redirects`, `.editorconfig`, `.vscode/tasks.json`, `.cursor/rules/help-confort.mdc`.

Contrôle d'identité : le contenu de ces 4 fichiers dans `recette` est **identique au caractère
près** à la version que j'avais écrite et testée sur `tooling/cursor-vscode-setup`
(`git diff origin/recette origin/tooling/cursor-vscode-setup -- <les 4 fichiers>` → vide).
Rien n'a été altéré au passage.

## PREUVES — avant / après, sur `recette`
| contrôle | avant (`369ce8c8`) | après (`356479c3`) |
|---|---|---|
| `depot-propre` | **9 PASS / 1 FAIL** — `.cursor, .vscode` | **10 PASS / 0 FAIL** |
| suite complète (31 fichiers, `.mjs` + `.sh`) | 839 / **1 FAIL** | **840 PASS / 0 FAIL** |

Les deux règles qui referment la faille, désormais en place dans `_redirects` (lignes 23-24) :

```
/.vscode/*            /404.html 404!
/.cursor/*            /404.html 404!
```

Elles couvrent aussi `.cursor/mcp.json`, arrivé plus tard avec le lot Figma/Playwright
(REQ-20260926-030), puisque c'est le dossier entier qui est bloqué.

## ETAT_DE_LA_PR_11
Précision (28/09, après vérification ligne à ligne) : la branche `tooling/cursor-vscode-setup`
**n'apporte plus rien de nouveau** — elle est seulement *en retard* sur `recette`. Le seul `+`
de son diff est un `prochain_id` périmé (`REQ-20260926-028`). Autrement dit : son objet est entièrement intégré (le gros par le squash `1db70eed`, les correctifs par
`356479c3`). La PR #11 peut être fermée sans rien perdre — c'est un geste qui appartient à Florian,
je ne l'ai pas fait.

## NO_PUBLIC_MUTATION_PROOF
Aucune page, aucun asset, aucune image, aucune fonction edge, aucune migration, aucun Stripe,
aucune 301, aucune suppression de page, aucun changement de navigation, aucun merge vers `main`,
aucun déploiement. Le seul fichier de configuration publique touché par le correctif est
`_redirects`, et uniquement pour renvoyer 404 sur deux chemins de développement : aucune page
visible n'est affectée. Le gel visuel de REQ-023 reste intact.

## STATUT
REQ-20260926-031 → `READY_FOR_CONTROL`. Je ne prononce pas la clôture : c'est le contrôle qui la
prononce. À signaler aussi, sans y toucher : REQ-20260926-028 avait été passée `CLOSED` alors que la
garde échouait ; la situation est maintenant conforme à ce statut, mais la clôture, elle, avait
précédé la preuve.

## NEXT_ACTION
Inchangé : `WAIT_FLORIAN_VISUAL_REQ023`. La validation visuelle des 4 pôles reste ce qui débloque
REQ-026, REQ-020 et REQ-017.
