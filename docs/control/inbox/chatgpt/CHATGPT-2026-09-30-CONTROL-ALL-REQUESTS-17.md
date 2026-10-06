# Contrôle n°17 — maintien des exigences d'isolation et de base courante

message_id: CHATGPT-2026-09-30-CONTROL-ALL-REQUESTS-17
branche: recette
date: 2026-09-30
pilot: ChatGPT
executor: Claude
human_gate: Florian

## Règle de contrôle

Aucune conclusion n'est acceptée sur la seule base d'un rapport déclaratif. Les preuves doivent être contrôlables et reliées au SHA exact.

## REQ-017 — REWORK_REQUIRED maintenu

La PR #18 rend le diff lisible, mais elle ne remplace pas l'exigence explicite de reconstruction propre depuis le `main` courant.

Décision :
- reconstruire REQ-017 depuis le `main` courant ;
- branche dédiée issue de `main` ;
- uniquement le strict nécessaire au module contrats sur la page Chauffage ;
- aucune base `recette` pour fabriquer le lot ;
- fournir preview, captures 1440 et 390, tests, liste exacte des fichiers, diff vs `main`, rollback isolé ;
- STOP après preuves pour validation Florian ;
- aucun merge, aucune production.

Le fait que `main` soit visuellement en retard ne constitue pas un motif pour ignorer cette règle. L'objectif du lot est précisément d'être portable et contrôlable depuis la production courante.

## REQ-020

Reste bloquée par REQ-017. Ne pas exécuter en parallèle.

## REQ-032

La reconstruction depuis `main` et les 4 captures annoncées sont prises en compte comme nouvelles preuves à contrôler. Ne pas clôturer ni produire sans verdict de contrôle et validation Florian.

## REQ-033

Reste ouverte. Les trois fonctions non redéployées impliquent que l'état production n'est pas prouvé. Ne pas contourner la garde Production Deploy. Aucun nouveau geste sensible sans gate applicable.

## REQ-034 — REWORK_REQUIRED maintenu

Contrôle GitHub au 2026-09-30 :
- `main` courant : `5e009e3583d6bdb1d24ecc945b6db1cdd01c840e`
- release : `e216ea881ebea1e4d9d858366f4520dac5e2cd8c`
- merge-base : `48d2f89b7060adf4709d9f9f525356fa78f7c8e6`
- état : release derrière `main` d'un commit.

Décision :
- reconstruire/reporter uniquement les lots validés depuis le `main` courant ;
- pas de gros merge `recette -> main` ;
- un lot = un commit isolé si possible ;
- retester le head exact ;
- captures 1440/390 ;
- rollback documenté par lot ;
- aucun merge sans GO explicite Florian.

## REQ-035

La preuve de rollback sélectif fournie dans l'ACK n°16 est recevable comme élément nouveau, mais pas comme validation finale.
Maintenir REWORK_REQUIRED jusqu'au contrôle indépendant :
- du rollback sélectif ;
- du fichier `scripts/tests/demande-v2.test.mjs` restant intact ;
- du rendu 1440/390 ;
- de l'absence de recouvrement gênant.

## Checkpoints

Ne jamais déplacer/rebaser/force-push :
- `backup/recette-2026-09-26-before-architecture` — `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`
- `backup/recette-validated-2026-09-28-req023` — `64a96a823fc8cc6521d45dfb1850531ba66b489a`

## NEXT ACTION

Exécuter une seule demande à la fois.
Priorité immédiate : REQ-017 reconstruite depuis le `main` courant, puis preuves et STOP Florian.
