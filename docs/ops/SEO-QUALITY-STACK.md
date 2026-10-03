# Stack qualite / SEO - HELP CONFORT Saint-Omer

Objectif : completer les controles internes du depot par des controles externes utiles, sans multiplier les outils inutilement.

## Socle retenu

### Google Search Console
Propriete cible : `sc-domain:depan59-62.fr`.

A suivre :
- requetes reelles ;
- impressions, clics, CTR, positions ;
- indexation ;
- erreurs et exclusions ;
- nouvelles pages et redirections.

### Lighthouse / PageSpeed
Le workflow `.github/workflows/web-quality.yml` audite chaque lundi et a la demande :
- accueil ;
- Nos prestations ;
- Chauffage Saint-Omer ;
- Zones d'intervention ;
- Realisations.

Les rapports JSON sont conserves 14 jours dans les artefacts GitHub Actions.

Important : Lighthouse est une mesure de laboratoire. Les Core Web Vitals terrain se lisent dans Search Console / PageSpeed lorsqu'ils sont disponibles.

### Rich Results / donnees structurees
Avant publication d'un changement JSON-LD :
1. lancer les controles locaux existants ;
2. tester l'URL publique dans Google Rich Results Test.

### Screaming Frog
Outil de crawl externe pour controler notamment :
- erreurs 4xx ;
- redirections 3xx ;
- titles et meta descriptions dupliques ;
- canonicals ;
- noindex ;
- profondeur de clic ;
- pages orphelines ;
- liens vers des URL redirigees.

Script Mac : `scripts/quality/screaming-frog-mac.sh`.

### Google Business Profile
Verifier la fiche correspondant a l'agence physique : nom, adresse, telephone, horaires, categories, URL, photos et avis.

Ne jamais creer de fausse agence pour une simple zone d'intervention.

## Outils ponctuels

### Google Trends
A utiliser avant les gros contenus saisonniers : entretien chaudiere, ramonage, chauffage, fuite, serrurerie, chauffe-eau, renovation.

### AnswerThePublic / Ubersuggest
A utiliser ponctuellement pour les formulations et questions. Ne remplacent jamais Search Console et ne justifient pas seuls la creation d'une nouvelle page.

### Yoast
Non retenu : le site n'est pas WordPress.

## Routine avant production

1. tests du depot ;
2. preview Netlify ;
3. controle 1440 / 390 ;
4. Lighthouse sur les pages touchees ;
5. Rich Results si schema modifie ;
6. Screaming Frog si navigation, SEO ou redirections ;
7. validation Florian ;
8. production ;
9. suivi Search Console apres indexation.