# QA visuelle HELP CONFORT

## But
Eviter qu'une modification techniquement verte soit visuellement mauvaise sur la vraie preview.

## Regle
Pour tout changement visible :
1. capture BEFORE ;
2. implementation sur recette ;
3. capture AFTER ;
4. desktop 1440 ;
5. mobile 390 ;
6. verification du parcours avec Playwright ;
7. validation Florian ;
8. seulement ensuite release.

## Workflow GitHub
Le workflow `QA visuelle preview` prend une URL de preview Netlify et produit automatiquement des captures full-page de :
- Accueil ;
- Chauffage Saint-Omer ;
- Nos prestations ;
- Zones d'intervention ;
- Realisations ;
- Contrats d'entretien.

Les captures sont conservees 14 jours en artefacts GitHub.

## Playwright MCP
Cursor/Claude Code peuvent utiliser Playwright MCP pour :
- cliquer les CTA ;
- verifier les ancres ;
- detecter un element masque ;
- controler scrollWidth / overflow ;
- tester un parcours sans soumettre de vrai lead ;
- capturer un bug avant correction et la preuve apres.

## Figma
Pour les changements importants : maquette ou composant Figma avant code.
Le code ne part qu'apres validation de la direction visuelle.

## Interdits
- aucune soumission de formulaire reel pour tester ;
- aucun paiement LIVE ;
- aucune validation automatique a la place de Florian ;
- aucun correctif visuel en cascade sans rollback possible.