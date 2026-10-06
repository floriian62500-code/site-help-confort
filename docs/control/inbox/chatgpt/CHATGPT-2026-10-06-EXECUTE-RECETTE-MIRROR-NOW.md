# EXECUTION IMMEDIATE — RECETTE = PROD

Florian a tranche : recette doit etre identique a prod. Ce n'est plus une question ouverte.

## 0. PROD_VERIFY FINAL REQ-041
PR #32 est fusionnee dans main au SHA:
998aadb5132ccfc9e75073a232de6f945aed4e0f

Faire maintenant le controle public APRES #31 + #32 :
- 117 pages DOM rendu ;
- carte zones 1440/390 ;
- 0 API REQUIRED ;
- 1 agence Saint-Omer ;
- Dunkerque/Calais/Boulogne = poles ;
- 0 fausse mention locale "2 agences" hors contenu reseau national ;
- console et overflow.
Publier le rapport final. Si PASS, REQ-041 = PROD_VERIFIED/CLOSED.

## 1. ARCHIVE DEJA SECURISEE
Ancienne recette sauvegardee dans :
archive/recette-2026-10-06-pre-sync
SHA archive source : 26f02a0b0053142519d92c23715ce20579052daf

Ne jamais perdre ni modifier cette archive.

## 2. INVENTAIRE DE L'ANCIENNE RECETTE
Comparer l'archive au main courant.
NE PAS raisonner par commits. Regrouper par fonctionnalite visible/reelle.

Pour chaque difference fonctionnelle ou visuelle utile :
- nom court ;
- fichiers impliques ;
- ce que voit/fait le visiteur ;
- statut :
  ALREADY_IN_PROD / OBSOLETE / CONTROL_ONLY / NEEDS_FLORIAN_VALIDATION / SENSITIVE_GATE / READY_TO_RELEASE ;
- preuve ;
- si NEEDS_FLORIAN_VALIDATION : preview actuelle depuis main + captures 1440/390 ;
- si READY_TO_RELEASE et non sensible : reconstruire depuis main, tester, PASS/BLOCKED, puis STOP merge ChatGPT.

Ne soumets PAS a Florian des centaines de fichiers. Regroupe par evolution metier coherent.

## 3. REALIGNEMENT RECETTE
Objectif final obligatoire :
recette = main EXACTEMENT.

La branche archive porte tout l'historique necessaire. Il n'est donc plus acceptable de conserver des prototypes dans recette.

Utiliser uniquement une procedure GitHub autorisee :
- si reset direct interdit, proposer/realiser la procedure supportee la plus propre pour recreer recette depuis main ;
- ne jamais fusionner archive -> main ;
- ne jamais porter des changements non valides juste pour obtenir l'egalite ;
- l'egalite doit se faire en ramenant recette vers main, pas l'inverse.

Publier un rapport avec :
- SHA main ;
- SHA recette final ;
- compare main...recette ;
- attendu : 0 difference de contenu public et, si possible, meme SHA ;
- si une protection GitHub rend le meme SHA impossible, expliquer exactement la seule action humaine necessaire.

## 4. REGLE PERMANENTE
Aucun futur developpement long dans recette.
Toute evolution :
main -> branche feature/preview -> validation -> merge prod -> PROD_VERIFY -> recette remise au niveau de main.

## 5. ELEMENTS A VALIDER
Apres inventaire, ne presenter a Florian QUE les evolutions jamais validees et encore pertinentes.
Tout ce qui a deja un GO explicite et reste applicable doit etre porte sans nouvelle validation.
