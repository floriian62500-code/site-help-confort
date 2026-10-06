# CHATGPT-2026-10-04 — avancer toutes les demandes jusqu'à production

Contexte business : campagne active, perte de business si le funnel reste imparfait. Priorité : exécuter vite sans casser la prod.

## État acté par ChatGPT

### PROD_VERIFIED et clôturées
Les preuves Claude sur le domaine public sont suffisantes. Sont clôturées :
- REQ-007
- REQ-017
- REQ-019
- REQ-023
- REQ-024

### REQ-037 — fusionnée
PR #26 fusionnée dans main.
Merge SHA : `a7b91f61995bb8cb4003bee43b21626259e23daf`

Action immédiate :
- attendre déploiement public ;
- vérifier 1440 + 390 sur `depan59-62.fr` :
  - Chauffage Gaz CONFORT = 14,30 € TTC/mois ;
  - page Contrats = 14,30 € TTC/mois ;
  - modale = 14,30 € TTC/mois et 171,60 € TTC/an ;
  - énergie/formule conservées ;
  - aucun lead soumis ;
  - console propre.
- si conforme : rapport PROD_VERIFY et STOP ; ChatGPT clôture.

## PRIORITÉ P0 IMMÉDIATE — REQ-036

Ne pas attendre pour commencer la préparation du lot, mais partir du `main` courant après merge REQ-037.

Corriger **les deux overflows mobiles** :
1. page Chauffage : +452 px à 390, cause carrousel fournisseurs / ancêtres ;
2. page Contrats : +90 px à 390.

Objectif :
- à 390 réel, `scrollWidth - innerWidth <= 1 px` sur les deux pages ;
- carrousel fournisseurs toujours fonctionnel ;
- module contrats et modale utilisables ;
- aucune régression 1440.

Périmètre minimal depuis main courant. Pas de refonte.

Preuves obligatoires :
- avant/après 390 réel pour les 2 pages ;
- 1440 pour les 2 pages ;
- mesures DOM de l'élément fautif + ancêtres ;
- interaction carrousel ;
- modale Contrats ;
- console ;
- rollback.

Verdict PASS/BLOCKED puis STOP. ChatGPT fusionne si PASS.

## REQ-038 — P2 ensuite

Bug réel en production sur `/nos-prestations.html` :
- requête PostgREST 400 à cause de `_ts` interprété comme filtre ;
- second appel de repli masque le défaut.

Après REQ-036 :
- lot isolé depuis main ;
- supprimer le 400 ;
- conserver l'affichage identique ;
- 1 seul appel utile à `v_services_public` ;
- réseau/console 1440+390 ;
- rollback ;
- PASS/BLOCKED puis STOP.

## Lots à gate humain

Ne pas toucher sans nouveau GO spécifique :
- REQ-001 sécurité/paiement ;
- REQ-003/004/006/032/035 validation visuelle/direction ;
- REQ-027 décision métier ;
- REQ-029/030 accès/outils ;
- REQ-033 déploiement sensible de fonctions.

## Règle

- main = production
- recette = contrôle
- jamais recette -> main en bloc
- chaque lot repart du main courant
- preview + preuves sur SHA exact
- merge ChatGPT
- vérification domaine public
- seulement ensuite CLOSED / PROD_VERIFIED

Avancer sans ouvrir de sujets secondaires tant que REQ-037, REQ-036 puis REQ-038 ne sont pas terminées.
