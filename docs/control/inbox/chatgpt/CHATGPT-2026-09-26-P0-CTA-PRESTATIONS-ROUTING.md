# P0 — Bug de routage sur page métier Chauffage (bouton « prestations avec prix »)

message_id: CHATGPT-2026-09-26-P0-CTA-PRESTATIONS-ROUTING
priority: P0
status: TO_EXECUTE
date: 2026-09-26
source: transmise par Florian en conversation, capture du tunnel à l'appui.

## Constat

Depuis la preview, le clic sur « Voir nos prestations chauffage avec prix » envoie vers
`/catalogue#step=lieu&cat=chauffage` et ouvre directement le tunnel de demande à l'étape Lieu.
Comportement refusé.

## Règle fonctionnelle

- un bouton qui parle de **prestations avec prix** = vue de **consultation** ;
- un bouton qui parle de **demande / devis / intervention** = **tunnel**.

## Action demandée

1. Corriger le lien du bouton.
2. Vérifier s'il existe d'autres CTA similaires mal routés sur les pages métier.
3. Auditer au minimum : Chauffage, Plomberie, Électricité, Serrurerie, Vitrerie, Menuiserie,
   Travaux.
4. Confirmer pour chaque CTA s'il pointe vers une vue contenu/catalogue ou vers un tunnel.

## Test obligatoire

Un contrôle qui vérifie que « Voir nos prestations … avec prix » n'ouvre jamais directement
`#step=` ni une autre étape du tunnel.

## Retour attendu

ROOT_CAUSE · CTA_AUDIT_TABLE · WRONG_TARGET · FIXED_TARGET · FILES_CHANGED · TESTS ·
SCREENSHOTS · SHA · PREVIEW · ROLLBACK · NO_PROD_MUTATION_PROOF

Aucune mise en production.
