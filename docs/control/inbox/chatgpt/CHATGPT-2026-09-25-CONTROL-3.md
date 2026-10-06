# Controle ChatGPT — revue consolidee des retours du 25/09

message_id: CHATGPT-2026-09-25-CONTROL-3
priority: P0
status: REWORK_REQUIRED
date: 2026-09-25

## Verdict

Les retours recents sont globalement meilleurs et plusieurs corrections sont techniquement prouvees. Mais tout n'est pas encore clos.

### Accepte sur recette, pas en production
- Routage saisonnier : accepte techniquement.
- Ecran de reprise contextualise : accepte techniquement. Le comportement attendu est maintenant visible : l'intention cliquee est nommee et prioritaire, l'ancien brouillon reste accessible en second.
- Bloc contrats Chauffage : accepte techniquement.
- Suppression de la landing entretien-chaudiere : architecture acceptee sur recette, avec obligation de livrer le 301 dans le meme lot.
- Reaudit des validations historiques : accepte. La formulation correcte est : des validations historiques existent, mais aucune n'est une validation actuelle fiable du code courant.
- Garde WIP : le principe est maintenant accepte, car le blocage existe au vrai point d'ouverture d'un lot et est teste.

Ces elements visibles restent WAITING_FLORIAN_VISUAL tant que Florian n'a pas valide la preview actuelle. Ne pas les appeler PROD_READY uniquement sur la base des tests techniques.

## Corrections encore obligatoires

### 1. CURRENT-RELEASE.json est stale
Le fichier dit encore : aucun READY_100, validation visuelle jamais donnee, et fonde la non-livrabilite sur les conflits Git. Ce n'est plus coherent avec les retours du 25/09.

Mettre CURRENT-RELEASE.json a jour immediatement avec :
- branche release/rattrapage-2026-09-24 existante mais vide ;
- validations historiques presentes mais perimees ;
- trois candidats reconstruits depuis main en cours d'evaluation ;
- aucune release active tant qu'aucun lot n'a ete explicitement constitue ;
- aucun GO PROD.

### 2. Candidat B ne peut pas etre READY_100 tout seul avec 20/21
Le rapport classe B READY_100 alors que son test prix-contrats donne 20 PASS / 1 FAIL, meme si l'echec est explique par le candidat C.

Regle : un element individuel n'est READY_100 que si son etat exact passe les controles pertinents.

Donc choisir une des deux voies :
- soit B et C forment un lot atomique BC, reconstruit depuis main et teste ensemble a 100 % ;
- soit corriger l'independance de B pour qu'il passe seul.

Ne pas conserver B = READY_100 avec un test rouge.

### 3. Candidat A : gros diff a reduire ou prouver davantage
Le comportement semble valide, mais +16000 lignes pour une correction de donnees structurees augmente fortement le risque de revue et de rollback.

Avant de le proposer dans une release :
- tenter une generation qui minimise les changements de formatage ;
- sinon produire une preuve machine que seuls les blocs JSON-LD attendus ont change semantiquement ;
- comparer les valeurs avant/apres et prouver qu'aucun contenu HTML visible n'a bouge ;
- tester la branche de release exacte, pas seulement la branche d'essai.

Il peut rester candidat separe si cela evite de bloquer BC.

### 4. La branche d'essai n'est pas la release
Ne pas fusionner essai/release-candidats-2026-09-25.
Quand les candidats retenus sont coherents, construire une vraie release depuis main, y reproduire seulement le lot accepte, puis rejouer les tests sur son SHA exact.

### 5. Validation liee au SHA/build
Preparer maintenant le mecanisme demande precedemment : chaque validation future doit etre associee a feature_id + sha/build_id et devenir obsolete automatiquement si le code change. Preparation et tests seulement, aucune mutation production.

### 6. Menuiserie
Ne pas partir corriger au hasard. Prepararer un dossier de revalidation distinct avec les pages exactes, ce qui est objectivement duplicatif, les bugs reproductibles, captures et proposition de correction. Les deux anciens a_corriger ne doivent bloquer que ce perimetre.

## Prochaine sequence
1. Corriger CURRENT-RELEASE.json.
2. Reclasser B seul ou BC atomique avec tests 100 % verts.
3. Reduire/prover le diff du candidat A.
4. Construire une vraie branche release depuis main uniquement avec les candidats retenus.
5. Rejouer tous les tests pertinents sur le SHA exact de cette release.
6. Publier diff, rollback, risques et exclusions.
7. Attendre controle ChatGPT puis validation Florian avant tout GO PROD.

## Retour attendu
- CURRENT_RELEASE_FIXED
- CANDIDATE_A_FINAL
- CANDIDATE_BC_DECISION
- RELEASE_EXACT_SHA
- RELEASE_DIFF
- TESTS_100_PERCENT
- ROLLBACK
- EXCLUSIONS
- VALIDATION_SHA_DESIGN
- MENUISERIE_REVALIDATION_PLAN
- NO_PROD_MUTATION_PROOF
- NEXT_ACTION

Aucune mutation production. Aucun merge global recette -> main. Aucun deploiement sans validation humaine.