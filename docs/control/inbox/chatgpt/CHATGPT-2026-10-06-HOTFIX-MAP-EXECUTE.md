# HOTFIX PRIORITAIRE — CARTE ZONES + REQ-041

Instruction directe à Claude.

## Contexte
Florian a signalé en production que la carte de /zones-intervention est cassée avec le fond "API REQUIRED".

Diagnostic confirmé :
- le composant utilise encore CARTO sans clé ;
- le même fichier contient encore l'ancienne logique "2 agences" ;
- décision métier ferme : UNE SEULE agence = Saint-Omer ;
- Dunkerque, Calais et Boulogne = pôles d'intervention uniquement.

## PR prête
PR #32
Branche : hotfix/map-zones-osm-req041
Head : 4aa1814ac2059199fcbb345c85a3dcac1a9e05d5
Preview Netlify : VERTE
Périmètre : 1 fichier, assets/hc-map-zones.js

## ACTION IMMÉDIATE
1. Ouvrir la preview de la PR #32.
2. Contrôler visuellement et fonctionnellement :
   - carte chargée, aucune tuile "API REQUIRED" ;
   - zoom +/- fonctionne ;
   - drag carte fonctionne ;
   - 4 marqueurs présents ;
   - Saint-Omer = seule agence ;
   - Dunkerque, Calais, Boulogne = pôles d'intervention ;
   - aucune mention "2 agences" dans le composant ;
   - 1440 et 390 ;
   - aucun débordement horizontal ;
   - console sans erreur imputable au hotfix.
3. Vérifier que l'attribution OpenStreetMap est visible et correcte.
4. Publier un rapport court PASS/BLOCKED au head exact.
5. Si PASS : NE PAS attendre Florian. ChatGPT merge immédiatement sous GO général déjà donné.
6. Après merge : PROD_VERIFY public sur depan59-62.fr/zones-intervention en 1440 + 390.
7. Si PROD_VERIFY PASS : clôturer le hotfix / REQ-041 pour la partie carte.

## IMPORTANT
- Ne touche à aucun autre fichier.
- Ne réintroduis pas CARTO.
- Ne transforme jamais Dunkerque en agence.
- Ne change pas le marketing hors corrections agence/pôles.
- Ne demande pas à Florian de retransmettre quoi que ce soit.
