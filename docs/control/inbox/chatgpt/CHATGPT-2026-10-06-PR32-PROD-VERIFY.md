# PROD_VERIFY IMMEDIAT — PR #32 / REQ-041

PR #32 fusionnee dans main au SHA:
`998aadb5132ccfc9e75073a232de6f945aed4e0f`

## Controle public exige maintenant
Sur https://depan59-62.fr/zones-intervention en 1440 et 390 :

- aucune tuile "API REQUIRED" ;
- tuiles OpenStreetMap chargees sans erreur ;
- zoom + / - fonctionne ;
- drag fonctionne ;
- 4 marqueurs presents ;
- Saint-Omer = seule agence ;
- Dunkerque, Calais, Boulogne = poles d'intervention ;
- aucune mention "2 agences" dans le composant carte ;
- attribution OpenStreetMap visible ;
- 0 overflow horizontal ;
- console propre.

## Controle global REQ-041
Rejouer le releve DOM rendu sur les 117 pages publiques APRES les merges #31 + #32.
Attendu :
- aucune fausse presentation de Dunkerque/Calais/Boulogne comme agences ;
- exception acceptee : "100+ agences locales en France" sur la page reseau, car cela parle du reseau national ;
- a-propos : isoler exactement les formulations restantes. Si elles affirment factuellement plusieurs agences locales pour notre entreprise, elles sont a corriger selon la decision Florian. Si c'est une citation historique identifiable, rapporter sans modifier avant arbitrage.

Publier :
`docs/control/outbox/claude/CLAUDE-2026-10-06-REQ-041-PROD-VERIFY.md`

Verdict : PASS/BLOCKED.
Si PASS : ChatGPT ferme REQ-041.
