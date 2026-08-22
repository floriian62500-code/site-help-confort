# ASSAINISSEMENT TOTAL DU DEPOT — CHECKLIST DE PREUVE

Statut de cette mission : NON TERMINE tant que chaque section n'est pas couverte par des preuves, des tests et des SHA.

## 1. Parcours commercial critique
- [ ] Achat/reservation d'une prestation tarifable teste en E2E sur recette
- [ ] Prix affiche et verifie
- [ ] Coordonnees client validees
- [ ] Commande/reservation reellement creee
- [ ] Stripe TEST teste si applicable
- [ ] Confirmation finale verifiee
- [ ] Parcours devis/contact separe des prestations achetables
- [ ] Double clic / retour / refresh / erreur reseau testes

Preuves obligatoires : URLs, resultat E2E, SHA, donnees TEST creees/nettoyees.

## 2. Wizard et formulaires
- [ ] Aucun bouton bloque sans erreur visible
- [ ] Erreurs inline par champ
- [ ] Focus/scroll premier champ invalide
- [ ] Validation adresse/CP/ville explicite
- [ ] Telephone/email testes
- [ ] Erreurs serveur et reseau traitees
- [ ] Anti-doublon/idempotence controles

## 3. Pages metiers
- [ ] Grande carte de zone supprimee des pages metiers
- [ ] Carte conservee uniquement sur page zones-intervention
- [ ] Bloc fournisseurs en doublon supprime
- [ ] Bloc 6 engagements compacte
- [ ] Pas de repetition inutile avec bandeau reassurance
- [ ] Templates/composants communs corriges a la source
- [ ] CSS/JS/Leaflet inutiles retires
- [ ] Desktop + mobile testes

## 4. Branches
Branches a auditer :
- [ ] main
- [ ] recette
- [ ] staging
- [ ] integration/lot1-lot2-vs-prod
- [ ] chore/control-plane-bootstrap
- [ ] chore/claude-control-runner

Pour chaque branche documenter :
- role
- dernier usage
- divergence main/recette
- commits uniques utiles
- PR associee
- dependances
- decision CONSERVER / MERGER SELECTIVEMENT / ARCHIVER / SUPPRIMER
- SHA de sauvegarde avant toute suppression

Aucune suppression tant qu'un commit unique utile n'a pas ete securise.

## 5. Cartographie architecture
- [ ] Arborescence principale documentee
- [ ] Pages/templates/composants identifies
- [ ] JS globaux/specifiques identifies
- [ ] CSS globaux/specifiques identifies
- [ ] Netlify documente
- [ ] Supabase documente
- [ ] Fonctions serverless documentees
- [ ] Stripe TEST documente
- [ ] Leads/commandes documentes
- [ ] Centre de validation documente
- [ ] CI/CD documente
- [ ] Control plane ChatGPT/Claude documente
- [ ] Variables d'environnement documentees sans secrets
- [ ] Procedure locale/test/recette/release/rollback documentee

## 6. Code mort / doublons / orphelins
- [ ] Fichiers jamais references recherches
- [ ] Assets orphelins recherches
- [ ] JS inutilises recherches
- [ ] CSS/classes inutilises recherches
- [ ] Fonctions/listeners inutilises recherches
- [ ] Imports/variables inutiles recherches
- [ ] Anciens forms/widgets/modales recherches
- [ ] Anciens systemes de validation recherches
- [ ] Anciens mecanismes PROD recherches
- [ ] Backups/copies/debug/TODO obsoletes recherches
- [ ] Feature flags morts recherches
- [ ] Duplications HTML/JS/CSS recherchees
- [ ] Logique metier dupliquee recherchee

Pour chaque suppression : preuve d'inutilite + test apres suppression + SHA.

## 7. Securite
- [ ] Secrets/tokens/PAT dans repo et historique controles
- [ ] Cles privilegiees frontend controlees
- [ ] XSS/innerHTML/parametres URL controles
- [ ] Validation/sanitation client + serveur controlees
- [ ] CORS controle
- [ ] Endpoints publics/permissifs controles
- [ ] Rate limit/anti-spam evalues
- [ ] Double soumission/idempotence controles
- [ ] Messages d'erreur sensibles controles
- [ ] Supabase RLS controlee
- [ ] Storage permissions controlees
- [ ] Acces admin/recette controles
- [ ] Logs avec donnees personnelles controles
- [ ] Headers securite controles
- [ ] Dependances vulnerables controlees
- [ ] Stripe TEST/LIVE separation controlee
- [ ] Impossible d'utiliser LIVE depuis recette
- [ ] Prix/montants recalcules cote serveur si necessaire
- [ ] Separation TEST/PROD controlee

## 8. Donnees et environnements
- [ ] Tests ne polluent pas vraies donnees
- [ ] Fixtures nettoyees
- [ ] Leads TEST identifies
- [ ] Commandes TEST identifiees
- [ ] Donnees recette/prod separees
- [ ] Aucun endpoint recette sur ressources LIVE non voulu

## 9. Release flow
- [ ] Validation rattachee a release_id + SHA immuable
- [ ] Modification apres validation => revalidation
- [ ] Etats A TESTER / VALIDE RECETTE / PRET PROD / DEPLOYE PROD
- [ ] Inventaire DEJA PROD / VALIDE PAS PROD / A REVALIDER / NON VALIDE
- [ ] Aucun merge aveugle recette -> main
- [ ] Aucun token de promotion cote frontend
- [ ] Rollback documente

## 10. Front / UX / qualite
- [ ] Console JS propre
- [ ] 404/500 involontaires traites
- [ ] Erreurs reseau gerees
- [ ] Responsive 320/375/390/768/1024/1440/1920
- [ ] Pas de debordement horizontal
- [ ] Navigation clavier/focus controles
- [ ] Alt/H1/H2/H3 controles
- [ ] LCP/CLS et ressources lourdes controles
- [ ] DOM excessif recherche
- [ ] Scripts tiers evalues
- [ ] SEO technique controle

## 11. Tests automatises
- [ ] Smoke tests
- [ ] E2E funnel critique
- [ ] E2E erreurs formulaire
- [ ] E2E mobile
- [ ] Tests release flow
- [ ] Tests nettoyage apres creation donnees TEST

## 12. Documentation mainteneur
- [ ] README architecture
- [ ] Guide structure repertoires
- [ ] Politique branches
- [ ] Conventions commits
- [ ] Regles recette/main
- [ ] Lancer tests
- [ ] Modifier page metier
- [ ] Ajouter prestation
- [ ] Supabase/Netlify/Stripe TEST
- [ ] Release et rollback
- [ ] Points sensibles a ne pas casser

## 13. Rapport de fin obligatoire
Le rapport final doit contenir :
- toutes les branches et leur decision
- toutes les zones auditees
- zones non auditees et pourquoi
- code mort supprime
- doublons mutualises/supprimes
- failles/problemes securite trouves
- corrections effectuees
- tests executes + resultats
- liste complete des commits/SHA
- elements conserves avec justification
- dette residuelle
- prochaine action si quelque chose reste

Un simple message "audit termine" ou "rien a signaler" sans cette matrice = mission NON TERMINEE.
