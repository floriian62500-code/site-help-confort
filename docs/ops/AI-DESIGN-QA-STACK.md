# IA design / QA — HELP CONFORT

## Outils retenus

### Figma MCP
A utiliser pour donner a Claude Code / Cursor le contexte structure du design : composants, variables, layouts, frames et ressources.

Configuration projet Cursor : `.cursor/mcp.json`.
Serveur remote : `https://mcp.figma.com/mcp`.

Une authentification Figma reste obligatoire la premiere fois.

Regle : Figma sert a montrer et valider le design avant code pour les changements structurants. Il ne remplace pas la validation Florian.

### Playwright MCP
A utiliser pour le controle navigateur reel : navigation, clics, formulaires, responsive, captures et verification de regressions.

Configuration projet Cursor : `.cursor/mcp.json`.

Utilisations prioritaires HELP CONFORT :
- ouvrir la preview Netlify ;
- tester les CTA ;
- verifier les parcours devis / prestations ;
- verifier desktop 1440 et mobile 390 ;
- prendre les captures BEFORE / AFTER ;
- detecter les debordements et actions non cliquables ;
- verifier les 4 poles zones, catalogue et contrats.

Attention : ne jamais soumettre un vrai formulaire client ni declencher un paiement LIVE pour tester.

## Skills design

Les packs de type animation / taste / impeccable ne sont pas consideres comme indispensables par defaut.
Ils peuvent ameliorer la qualite visuelle, mais ils ne doivent pas devenir une nouvelle source de design concurrente.

Avant d'ajouter un skill tiers :
1. verifier sa source ;
2. verifier qu'il ne demande aucun secret ;
3. verifier qu'il ne pousse rien automatiquement ;
4. tester sur une branche isolee ;
5. conserver la charte HELP CONFORT comme source de verite.

## Workflow cible

1. Florian formule le besoin.
2. ChatGPT cree / controle la REQ.
3. Si changement structurel : prototype Figma ou wireframe.
4. Validation Florian.
5. Claude Code / Cursor implemente sur branche recette.
6. Playwright teste la preview reelle.
7. Captures 1440 / 390.
8. Tests depot + Lighthouse si necessaire.
9. Validation Florian.
10. Production uniquement sur GO explicite.

## Installation Claude Code

Playwright :
`claude mcp add playwright npx @playwright/mcp@latest`

Figma, methode recommandee :
`claude plugin install figma@claude-plugins-official`

Puis lancer `/mcp` dans Claude Code et authentifier Figma.
