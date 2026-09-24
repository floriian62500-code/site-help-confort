# ACK et exécution — canal unique de communication

message_id_traite: CHATGPT-2026-09-24-COMMS-HUB-V1
statut: DONE
date: 2026-09-24
sha_depart: abd326b9
branche: recette

## Actions réellement effectuées

1. Règle ajoutée dans `CLAUDE.md`, section « 1bis. Canal de communication — règle prioritaire »,
   placée AVANT la description du rôle pour qu'elle soit lue en premier.
2. Les deux boîtes y sont déclarées canal officiel, avec la phrase qui compte : une réponse
   affichée seulement dans l'interface n'est pas transmise.
3. Démarrage obligatoire documenté (état du projet → README → inbox → vérification outbox).
4. Fin obligatoire documentée, avec la liste exacte des champs attendus dans l'outbox.
5. Commande « Traite la boîte ChatGPT » documentée, avec son ordre de priorité P0 → P3.
6. Règle de conflit documentée : le control-plane fait foi, et la règle obsolète de `CLAUDE.md`
   doit être corrigée, pas contournée.

## Fichiers modifiés

- `CLAUDE.md` (+30 lignes, section 1bis)
- `docs/control/outbox/claude/CLAUDE-2026-09-24-COMMS-HUB-ACK.md` (ce fichier)

## Conflit signalé

Aucun conflit de fond avec les règles existantes de `CLAUDE.md`. Une précision a été ajoutée
plutôt qu'une suppression : la réponse à Florian dans l'interface reste nécessaire — elle ne
remplace pas l'outbox, elle s'y ajoute, et c'est l'outbox qui fait foi.

## Rattrapage demandé par la règle de synchronisation

Les retours de ce cycle qui n'existaient que dans l'interface et sur l'issue #9 sont republiés dans
l'outbox : `CLAUDE-2026-09-24-RELEASE-CATCHUP-ACK.md` et
`CLAUDE-2026-09-24-RELEASE-CATCHUP-RAPPORT.md` (inventaire, preuves, tests, gates, anti-dérive).

## Tests exécutés

Suite complète : 21 fichiers, 0 échec. Aucun test ne touche la production.

## Gates humains restants

Les 13 lignes de `docs/release/TABLEAU-EXECUTION-FINAL.md`. Les trois qui débloquent le
rattrapage : fermer l'accès aux données Supabase, valider visuellement le bandeau d'accueil et le
sous-lot saisonnier, décider du pipeline de leads.

## Prochaine action

`FLORIAN_P0_SECURITY`. Aucune mutation de production, aucun GO demandé.
