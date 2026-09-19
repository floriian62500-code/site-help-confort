---
message_id: CP-0003
priority: P0
status: OPEN
needs_human: false
date: 2026-08-12
expected_decision: EXECUTE_AND_REPORT
---

# P0 — CENTRE RECETTE / VALIDATION IMPOSSIBLE DEPUIS LA PAGE CIBLE

## Constat utilisateur
Florian ouvre `/recette.html` puis clique `Voir` sur l'item PRESTATIONS « Voir le tarif enregistre un vrai prospect ».
La page cible ouvre la modale « Voyez nos tarifs en 10 secondes » et le bandeau de revue en bas affiche :
`Modification à contrôler : « Voir le tarif » enregistre un vrai prospect (section non trouvée sur cette page)`.
Le bandeau de validation est partiellement masqué/coupé en bas de viewport et l'item est indiqué comme section non trouvée. Résultat : Florian ne peut pas réellement valider depuis la page cible.

## Priorité
P0 sur le dispositif de recette : si Florian ne peut pas valider, tout le workflow page-par-page est inutilisable.
Ce point passe AVANT A22 et tout autre backlog.

## Correctif attendu
1. Reproduire sur `deploy-preview-2` avec l'URL `nos-prestations.html?review=tarif-lead...`.
2. Corriger l'ancre de revue : l'item doit cibler un élément réel et stable sur `nos-prestations.html` (bouton/zone lead-gate ou modale), jamais `section non trouvée`.
3. Le bandeau `hc-review.js` doit rester entièrement visible et cliquable sur desktop + mobile, même quand une modale du site est ouverte.
4. Gérer correctement le z-index entre : modale tarif, backdrop, bandeau revue, centre de validation. Le bandeau ne doit ni être masqué ni rendre la modale inutilisable.
5. Permettre depuis la page cible :
   - `OK` ;
   - `À corriger` + commentaire ;
   - `Retour au centre` ;
   sans scroll impossible ni élément hors écran.
6. Si l'élément à valider est une modale/interaction, le bouton `Voir` doit pouvoir ouvrir ou préparer automatiquement l'état pertinent, ou guider explicitement Florian avec une action unique. Ne pas le laisser chercher l'élément.
7. Après clic OK/KO, persister réellement dans `recette_validation`, rafraîchir l'état visuel, puis revenir/mettre à jour le centre sans incohérence de version.
8. Tester au minimum 1920x1080, 1440x900, 390x844.
9. Ajouter un test E2E de non-régression pour chaque future carte `Voir` : `target found = true`, bandeau visible, actions cliquables.
10. Mettre à jour l'outbox avec reproduction, cause racine, fichiers modifiés, tests, SHA, preuve sur recette.

## Règle permanente
Aucune nouvelle carte ne doit entrer dans `/recette.html` si son bouton `Voir` n'est pas testé E2E et si l'ancre n'existe pas sur la version déployée.

## Gates
Aucune PROD. Aucun changement Stripe LIVE. Aucun changement de données prod sensibles.
