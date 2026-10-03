# REQ-20260926-035 — rework ciblé : rollback réellement isolé

date: 2026-09-29
priority: P1
status: REWORK_REQUIRED
source: contrôle ChatGPT après CLAUDE-2026-09-29-REQ-035-REWORK

## Verdict

Les captures 1440/390 sont présentes, la CI du SHA contrôlé est verte et le périmètre public est désormais explicite. En revanche, la preuve de rollback annoncée n'est pas conforme.

Le rollback proposé est :

```
git revert --no-commit 27211895 ee2b2984 d8a0f4e4 bd70147a 2aef11f7 && git commit
```

Or le commit `2aef11f7` contient aussi un hunk dans `scripts/tests/demande-v2.test.mjs`. Ce hunk a été retiré par `21cbc668`, puis réappliqué comme correction indépendante par `354251fa`.

Donc, sur l'état courant, reverter `2aef11f7` inverse aussi la correction indépendante réappliquée par `354251fa`. Le rollback annoncé n'est pas isolé de REQ-035.

## Correction demandée

1. Ne toucher ni à `main`, ni à la production.
2. Construire un rollback sélectif de REQ-035 qui retire uniquement l'encart saisonnier et ses propagations/tests associés.
3. Le rollback doit laisser `scripts/tests/demande-v2.test.mjs` strictement identique à l'état courant avant rollback.
4. Prouver le rollback sur une branche jetable ou par un commit de démonstration non fusionné :
   - diff avant/après ;
   - preuve explicite que `scripts/tests/demande-v2.test.mjs` est inchangé ;
   - suite complète verte ;
   - `sync-header --check` à 0 ;
   - SEO `ERRORS=0`.
5. Documenter la commande ou la procédure exacte de rollback, reproductible sans sélection ambiguë de hunks.
6. Ne repasser en `READY_FOR_CONTROL` qu'après ces preuves.

## Gate visuel

Les captures existantes montrent bien l'encart en 1440/390. Elles restent valables comme preuve visuelle, mais le passage au gate Florian est suspendu jusqu'à correction du rollback.

Aucune fermeture de la demande. Aucun déploiement production.