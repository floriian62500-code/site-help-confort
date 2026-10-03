# CP-0015 — PRIORITE UX RECETTE : UNE SEULE SOURCE DE VALIDATION

Decision explicite de Florian : supprimer le doublon de validation visible dans le panneau flottant `Modifs`. Le centre `/recette.html` doit devenir l'UNIQUE source de verite pour OK / A corriger / commentaire / validation de page.

## Cible obligatoire
1. `/recette.html` = seul endroit ou Florian valide avec OK / A corriger / commentaire.
2. Sur les pages de recette : aucun deuxieme systeme de validation.
3. Le bouton/panneau flottant `Modifs` ne reste que s'il apporte une utilite reelle de navigation/localisation.
4. SUPPRIMER du panneau flottant tous les boutons OK/KO et toute logique de validation/persistance devenue redondante.
5. Ajouter un CTA unique et clair `Ouvrir le centre de validation` -> `/recette.html`.
6. Conserver `Voir` uniquement s'il localise reellement l'element modifie. Si ce panneau n'apporte pas de valeur distincte, le supprimer completement plutot que conserver du code mort.
7. Nettoyer CSS/JS/etat/stockage/listeners devenus inutiles. Pas de rustine ni deux implementations concurrentes.
8. Ne pas casser le mecanisme de surlignage/ancre utilise depuis le centre de validation.

## Tests obligatoires avant PASS
- Desktop + mobile.
- Depuis `/recette.html` : Voir -> bonne page -> bonne cible localisee/surlignee -> retour centre.
- OK / A corriger / commentaire fonctionnent UNIQUEMENT dans `/recette.html` et persistent correctement.
- Aucun bouton OK/KO residuel sur les pages normales de recette.
- Pas de console error, pas de double listener, pas de regression responsive.
- Verifier que le centre reste utilisable avec modale/formulaire ouvert.

## Livraison
- RECETTE uniquement. AUCUNE PROD.
- Commit/push recette + preuve de test.
- Repondre dans `docs/control/outbox/claude/CP-0015.md` avec fichiers modifies, SHA, tests desktop/mobile, code supprime, anomalies eventuelles, next_action.
- Apres CP-0015, reprendre automatiquement le backlog CP-0013/CP-0014 non bloque. Ne pas s'arreter apres le rapport tant qu'une tache executable existe.
