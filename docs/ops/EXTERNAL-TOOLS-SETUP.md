# Mise en place des outils externes

## Google Search Console

La documentation du projet reference deja `sc-domain:depan59-62.fr`.

A verifier avec Florian :
1. ouvrir Search Console ;
2. selectionner `depan59-62.fr` ;
3. confirmer le statut de proprietaire verifie ;
4. verifier que le sitemap est soumis ;
5. conserver les acces au niveau strictement necessaire.

Si la propriete n'est pas validee, utiliser la validation DNS d'une propriete de domaine.

## Google Business Profile

Verifier la fiche de l'agence physique Saint-Omer :
- nom ;
- adresse ;
- telephone ;
- horaires ;
- categories ;
- site ;
- photos ;
- avis.

Dunkerque, Calais et Boulogne ne doivent pas etre crees comme agences si aucune implantation physique validee n'existe.

## Screaming Frog

1. installer Screaming Frog SEO Spider sur macOS ;
2. l'ouvrir une premiere fois ;
3. accepter les conditions ;
4. lancer `sh scripts/quality/screaming-frog-mac.sh` ;
5. examiner 4xx, redirections, canonicals, metadata dupliquees et pages orphelines.

Ne pas acheter de licence tant qu'un besoin depassant la version gratuite n'est pas etabli.

## PageSpeed / Lighthouse

Le workflow GitHub `Qualite web externe` ne necessite aucune cle API.
Il est lancable manuellement depuis GitHub Actions.

## Rich Results

Pour toute page publique dont le JSON-LD change :
1. tests locaux ;
2. Rich Results Test Google ;
3. conserver la preuve dans le rapport de recette si le schema est critique.