---
message_id: CP-0004
priority: P0
status: OPEN
needs_human: false
date: 2026-08-12
expected_decision: EXECUTE_AND_REPORT
---

# AUDIT TOTAL DU SITE — OBJECTIF SITE BTP DERNIERE GENERATION

## Contexte
Florian ne doit plus découvrir lui-même les bugs, incohérences, problèmes ergonomiques ou esthétiques. Le rôle de l'agent est de tester le site comme un QA senior + UX/UI designer + expert conversion + expert SEO local + expert sécurité + expert performance, puis de remonter et corriger méthodiquement les défauts sur RECETTE.

Le site cible doit être perçu comme une référence BTP locale moderne : rapide, rassurante, premium, claire, utile, sans effet template IA, orientée prise de contact / devis / réservation, et techniquement irréprochable.

## Règle absolue
Ne pas attendre que Florian signale les anomalies. Tu dois les chercher toi-même, les reproduire, les classer, les corriger en RECETTE et les ajouter au centre de validation uniquement lorsqu'une validation humaine visuelle/métier est réellement nécessaire.

Les contrôles purement techniques doivent être automatisés et ne doivent pas être laissés à Florian.

## Mission 1 — Inventaire exhaustif
Construire la liste de TOUTES les pages publiques, routes pretty, pages prestations, métiers, villes, zones, réalisations, actualités, formulaires, modales, CTA, parcours wizard, dashboard/public admin, pages légales et redirections.

Créer/mettre à jour un registre persistant :
`docs/AUDIT-MASTER.md`

Chaque ligne :
`ID | URL/page | type | priorité | anomalie | reproduction | correction | test | SHA | recette | validation Florian | prod | prod vérifiée`

Aucune anomalie ne doit disparaître entre deux sessions.

## Mission 2 — Audit technique automatique de 100% des pages
Pour chaque page/route :
- HTTP 200/301/404/500 ;
- redirections inattendues ;
- liens internes cassés ;
- ressources 4xx/5xx ;
- erreurs console JS ;
- erreurs réseau ;
- CSP/CORS ;
- formulaires cassés ;
- ancres inexistantes ;
- boutons sans action ;
- modales impossibles à fermer ;
- z-index/overlay ;
- scroll bloqué ;
- focus/tab basique ;
- images manquantes ;
- dimensions/CLS ;
- overflow horizontal ;
- contenu tronqué ;
- erreurs SVG ;
- double submit ;
- erreurs mobile ;
- erreurs tablette ;
- routes legacy encore utilisées ;
- canonical/sitemap incohérents ;
- duplicate canonical ;
- noindex parasite ;
- structured data invalide ;
- robots/sitemap ;
- www/apex ;
- performance Lighthouse par gabarit ;
- Core Web Vitals simulés ;
- taille JS/CSS/images/vidéos ;
- sécurité headers ;
- exposition de docs/scripts/admin ;
- secrets frontend ;
- endpoints sensibles ;
- RLS/auth ;
- upload ;
- paiement.

## Mission 3 — Audit responsive réel
Tester au minimum :
320x568, 360x800, 375x812, 390x844, 430x932, 768x1024, 1024x768, 1280x800, 1440x900, 1600x900, 1920x1080.

Sur chaque gabarit et chaque page représentative :
- header/menu ;
- logo ;
- hero ;
- textes ;
- CTA ;
- formulaires ;
- cartes ;
- sliders ;
- modales ;
- maps ;
- footer ;
- centre de validation ;
- sticky/floating widgets.

Aucun overflow non intentionnel, aucun contenu minuscule sur desktop, aucun bouton hors écran.

## Mission 4 — Audit esthétique / UX / ergonomie
Regarder le site comme un directeur artistique senior spécialisé services habitat/BTP.

Détecter :
- rendu trop IA / générique ;
- textes artificiels ;
- accumulation de badges ;
- trop d'italique/couleurs ;
- sections trop longues ;
- trop de vide ;
- cartes trop petites ;
- hiérarchie visuelle faible ;
- incohérences de fonts/tailles ;
- couleurs incohérentes ;
- boutons non prioritaires ;
- doublons CTA/téléphone ;
- sections décoratives sans valeur ;
- images génériques ou hors sujet ;
- fournisseurs/partenaires mélangés ;
- réalisations/actualités hors métier ;
- pages trop similaires ;
- mobile peu premium ;
- desktop sous-exploité ;
- CTA non évident ;
- parcours trop long.

Objectif : image locale sérieuse, premium, rassurante, artisan/multi-métiers moderne, pas template marketing IA.

Ne pas redessiner la HOME actuellement gelée sauf P0/P1 ou retour Florian.

## Mission 5 — Audit conversion / parcours client
Tester comme un vrai client :
- appel immédiat ;
- devis ;
- rappel ;
- urgence ;
- consultation tarif ;
- wizard ;
- choix prestation ;
- demande métier ;
- formulaire contact ;
- photos ;
- réalisation -> contact ;
- page métier -> sous-métier -> lead ;
- page ville -> métier -> lead ;
- actualité -> conversion ;
- mobile.

Pour CHAQUE formulaire/parcours :
- happy path ;
- données invalides ;
- réseau coupé ;
- backend 400/500 ;
- double clic ;
- refresh/back ;
- agence Saint-Omer/Dunkerque ;
- source/form_type ;
- lead DB ;
- notification ;
- photo ;
- message de succès/erreur ;
- anti-doublon ;
- nettoyage des tests.

Aucun succès UI sans lead réellement créé.

## Mission 6 — Prestations et paiement
Auditer toutes les prestations :
- nom ;
- catégorie ;
- prix TTC ;
- requires_quote ;
- durée ;
- inclus/exclus ;
- CTA ;
- possibilité réelle d'achat/réservation ;
- cohérence wizard ;
- page prestation ;
- lead « voir le tarif » ;
- aucun prix DOM comme source autoritaire.

Stripe LIVE reste GELE tant que backend non durci. Audit TEST uniquement si clé TEST disponible.

## Mission 7 — SEO local / contenu
Auditer toutes les pages :
- title/meta/H1 ;
- intention de recherche ;
- canonical ;
- JSON-LD ;
- NAP ;
- Saint-Omer/Dunkerque/Calais/Boulogne ;
- métier x ville ;
- sous-métiers ;
- zone ;
- maillage ;
- réalisations ;
- fournisseurs ;
- FAQ ;
- duplication ;
- cannibalisation ;
- doorway pages ;
- texte trop IA ;
- contenu réellement utile ;
- citations locales dont Achetez en Pays de Saint-Omer.

Pas de création massive de pages faibles. Une page SEO doit avoir une vraie valeur client.

## Mission 8 — Dashboard / analytics / administration
Faire un audit séparé de l'existant et produire une architecture cible pour un vrai dashboard premium :
- contenus/pages/textes/photos ;
- prestations/tarifs ;
- réalisations/actus ;
- fournisseurs/partenaires ;
- leads/CRM ;
- relances ;
- stats trafic/conversion ;
- sources/campagnes ;
- appels/formulaires/tarifs consultés ;
- réseaux sociaux/publications ;
- droits utilisateurs ;
- audit trail.

Ne pas construire un dashboard monolithique à moitié. Produire d'abord inventaire + architecture + priorités.

## Mission 9 — Centre de validation
Le centre doit être un OUTIL SIMPLE POUR FLORIAN, pas un outil de debug.

Automatiser les contrôles techniques. Florian ne doit voir que ce qui mérite une décision humaine : esthétique, ergonomie, texte métier, priorités commerciales.

Chaque bouton `Voir` :
- cible réelle ;
- surlignage exact ;
- état pertinent ouvert ;
- overlay visible ;
- OK/KO/commentaire utilisables ;
- desktop/mobile ;
- persistance prouvée.

Un item non testable ne doit pas apparaître comme validable.

## Mission 10 — Processus autonome de correction
Ordre strict :
1. lire `recette_validation` ;
2. traiter les KO Florian ;
3. scanner automatiquement le site ;
4. ajouter les anomalies au registre ;
5. corriger P0 ;
6. corriger P1 ;
7. corriger P2 à fort impact ;
8. tester ;
9. déployer RECETTE ;
10. ajouter seulement les validations humaines utiles au centre ;
11. poursuivre automatiquement la tâche suivante.

Ne t'arrête pas sur un rapport. Continue tant qu'une tâche non bloquée existe.

## Critères de classement
P0 : sécurité, paiement, données, site/funnel cassé, validation impossible, lead perdu.
P1 : conversion, navigation cassée, responsive majeur, incohérence commerciale, SEO critique.
P2 : UX/esthétique/performance notable.
P3 : dette, polish, optimisation mineure.

## Livrables obligatoires
- `docs/AUDIT-MASTER.md` à jour ;
- rapport synthétique `docs/audits/FULL_SITE_AUDIT_2026-08-12.md` ;
- scripts/tests réutilisables pour re-scan ;
- screenshots/preuves seulement si utiles ;
- outbox mise à jour avec SHA, nombre de pages testées, anomalies P0/P1/P2/P3, corrections, recette, gates, prochaine action.

## Protection
Aucune PROD sans GO Florian.
Aucun paiement LIVE.
Aucune mutation sensible de données prod.
Aucun secret dans Git.
Le dépôt et les fichiers internes doivent devenir PRIVÉS dès que la compatibilité Netlify est sécurisée.

## Condition de fin
Ne considère pas l'audit terminé tant que :
- 100% des pages/routes inventoriées ont été testées techniquement ;
- tous les formulaires/funnels ont une matrice de tests ;
- les anomalies P0/P1 sont corrigées ou explicitement gated ;
- les principales anomalies esthétiques/UX sont enregistrées ;
- le centre de validation est lui-même fiable ;
- le backlog restant est priorisé et persistant.

Puis continue automatiquement les corrections P2/P3 à fort impact en RECETTE.
