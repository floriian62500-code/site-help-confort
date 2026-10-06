# PRIORITE ABSOLUE — aligner la prod avant toute refonte

Décision Florian :
1. finir tout ce qui est déjà en cours ;
2. la production doit refléter tout ce qui a été validé ;
3. ne pas commencer la refonte moderne tant que les lots validés applicables ne sont pas PROD_VERIFIED ;
4. fournir à Florian une liste VISUELLE, courte et exploitable, de ce qu'il doit encore valider.

## Etat immédiat

REQ-039 / PR #29 est fusionnée dans main au SHA:
`0f59c7550b45ef69ec804c50a20f130bd1f52144`

### Action 1 — PROD_VERIFY REQ-039 maintenant
Dès que le domaine public sert le merge :
- scanner les 117 pages à 390 réel ;
- objectif : 0 page avec overflow >1 px ;
- contrôler les 4 échantillons 1440/390 ;
- vérifier carrousels, labels, tableau ;
- console ;
- publier rapport PROD_VERIFY dédié.
Si conforme : ChatGPT clôture.

### Action 2 — inventaire "validé mais pas prod"
Comparer chaque REQ non CLOSED au main courant + domaine public + recette.
Identifier uniquement les éléments:
- déjà validés techniquement/visuellement ;
- applicables au main courant ;
- non sensibles ;
- pas encore PROD_VERIFIED.

Pour chacun :
- reconstruire depuis le main courant si nécessaire ;
- preview exacte ;
- preuves ;
- PASS/BLOCKED ;
- STOP merge ChatGPT.
Ne jamais fusionner recette globalement.

### Action 3 — dashboard Florian
Créer :
`docs/control/FLORIAN-VALIDATIONS.md`

Format très visuel et court, avec seulement les vraies décisions humaines restantes.

Pour chaque validation :
- REQ ;
- titre en langage métier ;
- statut ;
- capture/preview actuelle ;
- ce qui change en une phrase ;
- risque si validé ;
- bouton logique à répondre : ✅ OUI / ❌ NON / 🔁 À REVOIR.

Séparer en 3 blocs :
A. VISUEL À VALIDER
B. DÉCISION MÉTIER À VALIDER
C. GO SENSIBLE À VALIDER

Ne pas mettre dans cette liste les sujets que ChatGPT/Claude peuvent décider seuls.

## Gel refonte moderne
Les briefs VISUAL-MEDIA-REDESIGN et MODERN-WEB-BENCHMARK restent valides, mais passent APRES l'alignement prod des lots actuels.
Aucune nouvelle maquette A/B/C avant que:
- REQ-039 soit PROD_VERIFIED ;
- les lots validés applicables aient été portés ;
- la liste Florian soit publiée.
