# PRIORITÉ CHAUFFAGE — après merge PR #24

État :
- PR #24 fusionnée dans main : merge `96e75d88f57dbe867fb8490dbdc2749093340a70`.
- PR #25 fermée sans merge : redondante, défaut non reproductible sur le domaine public.
- REQ-017 module contrats déjà en production.
- Deux défauts campagne réels restent prioritaires : REQ-037 TTC/HT et REQ-036 overflow mobile.

## 1. REQ-037 — corriger immédiatement

Créer une branche isolée depuis le `main` courant.

Objectif :
- page Chauffage : TTC principal ;
- page Contrats : TTC principal ;
- modale : TTC principal ;
- HT éventuellement secondaire et explicitement étiqueté ;
- utiliser uniquement `price_ttc_month` et `price_ttc_year` de la source canonique ;
- aucun montant copié/calculé en dur.

Preuves obligatoires :
- Gaz CONFORT en 1440 + 390 ;
- clic page Chauffage → page Contrats ;
- énergie + formule conservées ;
- prix identiques en TTC sur les 3 surfaces ;
- modale ouverte sans envoi ;
- 0 overflow ajouté ;
- console propre ;
- rollback.

Verdict PASS/BLOCKED puis STOP pour merge ChatGPT.

## 2. REQ-036 — juste après REQ-037

Branche isolée depuis le nouveau `main`.

Objectif :
- à 390 réel : scrollWidth = innerWidth ou écart <= 1 px ;
- supprimer le débordement causé par le carrousel fournisseurs / ses ancêtres ;
- conserver le carrousel fonctionnel ;
- aucune régression desktop.

Preuves :
- avant/après 390 réel ;
- 1440 ;
- mesures .hcf-track + ancêtres ;
- interaction carrousel ;
- console ;
- rollback.

Verdict PASS/BLOCKED puis STOP.

## 3. PROD_VERIFY

Après chaque merge :
- attendre déploiement ;
- vérifier le domaine public `depan59-62.fr` ;
- seulement ensuite marquer PROD_VERIFIED.

Aucun autre sujet secondaire tant que REQ-037 et REQ-036 ne sont pas PROD_VERIFIED.
