# REQ-20260926-020 — Cartes prestations limitées à deux actions

request_id: REQ-20260926-020
priority: P1
status: OPEN
date: 2026-09-26
origine: instruction canonique **créée par Claude** à la demande explicite du contrôle
         `CHATGPT-2026-09-26-CONTROL-PROPOSAL-1` §4 (« REQ-020 doit être débloquée : créer
         maintenant son instruction canonique dans l'inbox, car elle manque réellement »).
         Le contenu ci-dessous reprend la règle énoncée par ce contrôle ; il ne l'invente pas.

## Décision

Une carte de prestation du catalogue public porte **au maximum deux éléments cliquables** :

1. **une action commerciale principale**, et une seule, déterminée par le mode de la prestation :
   - `PRICE_FIXED` → « Réserver » ;
   - `QUOTE_ONLY` → « Demander un devis » ;
   - `PRICE_CONFIRM` → « Demander confirmation ».
2. **un lien secondaire « Voir le détail »**, autorisé, qui mène à la fiche prestation.

## Interdit

- une deuxième action commerciale concurrente sur la même carte ;
- le téléphone comme troisième action de carte — il reste dans l'en-tête et la barre mobile ;
- un bouton « devis » à côté d'un bouton « réserver » sur la même carte.

## Constat à l'origine

Une carte de `nos-prestations.html` peut aujourd'hui porter simultanément « Voir le tarif »
(verrouillé par la porte des tarifs), « Devis », et un bouton téléphone. Trois actions
concurrentes, aucune hiérarchie.

## Tests attendus

- aucune carte ne porte plus d'une action commerciale ;
- le lien « Voir le détail » mène à une fiche prestation qui existe ;
- aucun bouton téléphone dans une carte ;
- desktop 1440 et mobile 390 ;
- aucune mutation production.

## Retour attendu

ROOT_CAUSE · REGLE_APPLIQUEE · FILES_CHANGED · TESTS · SCREENSHOTS_1440_390 · SHA · PREVIEW ·
ROLLBACK · NO_PROD_MUTATION_PROOF

Statut après preuve : READY_FOR_CONTROL. Claude ne marque pas CLOSED.

**Dépendance** : cette REQ suppose le mode commercial disponible côté rendu. La matrice de
dérivation est établie (voir `docs/audit/PROPOSITION-SITE-CIBLE-2026-09-26.md` §5) : 28
`PRICE_FIXED`, 5 `QUOTE_ONLY`, 1 `PRICE_CONFIRM` (`vmc`), 0 ambigu. Aucune migration nécessaire.
