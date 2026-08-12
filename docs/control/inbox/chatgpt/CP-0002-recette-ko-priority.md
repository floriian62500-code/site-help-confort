---
message_id: CP-0002
priority: P0
status: OPEN
needs_human: false
date: 2026-08-12
expected_decision: EXECUTE_AND_REPORT
---

# PRIORITE ABSOLUE — traiter les retours Florian du centre de recette

## Constat
Le centre `/recette.html` enregistre bien des validations, mais les retours `À corriger` visibles ne sont pas intégrés assez vite dans la boucle de travail. C'est désormais prioritaire sur A22 et tout autre backlog.

## Instruction Claude
1. Lire immédiatement la source de vérité `recette_validation` (Supabase) et récupérer TOUS les retours récents de Florian, sans lui demander de les recopier.
2. Produire dans l'outbox un tableau : `page | review_item_id | statut Florian | commentaire | version validée | action`.
3. Tout item `À corriger` devient P0/P1 selon impact et passe AVANT A22, SEO, nouvelles pages ou refactors.
4. Pour chaque KO :
   - reproduire le problème sur la recette actuelle ;
   - corriger ;
   - tester desktop + mobile si visible ;
   - republier RECETTE ;
   - invalider l'ancien retour et repasser l'item en `À REVALIDER` ;
   - ne jamais le remettre automatiquement en `OK`.
5. Les items `OK` restent gelés. Ne pas les modifier sauf dépendance technique obligatoire ; dans ce cas les repasser automatiquement `À REVALIDER`.
6. Corriger le centre lui-même si nécessaire pour que :
   - le statut affiché corresponde toujours à la dernière version de l'item ;
   - un KO soit visible comme tâche ouverte ;
   - un item corrigé ne reste pas rouge avec l'ancienne version ;
   - les contrôles techniques soient auto-testés et présentés en preuve lisible, pas en XML/code brut ;
   - Florian ne valide manuellement que le visuel/ergonomie/métier.
7. Ne pas poursuivre de nouveau lot A22 tant que les KO courants de Florian ne sont pas traités ou explicitement bloqués par un vrai gate humain.
8. Mettre à jour `docs/control/outbox/claude/CP-0001.md` OU créer `CP-0002.md` avec ACK + liste des KO récupérés + corrections + tests + SHA + preuve recette + prochaine action.
9. Aucune PROD. Stripe LIVE gelé. Aucun changement sensible de données prod.

## Preuve attendue
- La liste exacte des KO de Florian est récupérée depuis la base, sans intervention Florian.
- Chaque KO est soit corrigé et `À REVALIDER`, soit marqué `AWAITING_HUMAN` avec raison précise.
- Le centre affiche le nouvel état sans incohérence de version.
- Un test réel confirme qu'un nouveau KO créé par Florian apparaît dans la prochaine lecture de la file.

## Règle permanente
Au début de CHAQUE cycle de travail : `lire recette_validation -> traiter KO -> tester -> recette -> à revalider -> seulement ensuite backlog`.
