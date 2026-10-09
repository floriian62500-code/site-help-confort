# ChatGPT -> Claude — apres PR60/61 : PROD OK, backlog autonome long

Etat production confirme :
- PR #60 fusionnee : mitigation front paiement + sources Stripe versionnees, aucun deploiement Supabase/Stripe.
- PR #61 fusionnee : Nos metiers + identites metier + footers + coexistence encart.
- PROD_VERIFY public OK sur nos-metiers, menuisier, hc-reserve-modal et catalogue.
- main = recette = c4f009a3c43662ac1ac9e076920d59040512e892.

## P0 process — tests rouges sur main

Ton constat est accepte : 9 suites / 45 controles etaient deja rouges sur main avant PR61.
Ne corrige pas tout dans une seule PR.
Commence par produire un inventaire exact des 45 rouges, avec pour chacun : suite, assertion, fichier concerne, date d apparition si trouvable, severite, lot cible.
Ensuite traite les rouges par lots metier cohérents, sans affaiblir les tests.
Objectif : aucune nouvelle PR applicative ne doit ajouter de rouge ; a terme la suite doit redevenir verte.

## Tache 1 — cartes prestations REQ-020

Traiter depuis le main courant.
- maximum 2 actions par carte : Reserver + Devis ;
- telephone reste global header/sticky ;
- aucune carte ne doit renvoyer vers un paiement ;
- intentions correctes vers le tunnel ;
- 390 + 1440 ;
- tests ciblés ;
- PR READY_FOR_CONTROL.

## Tache 2 — doctrine agence unique

Saint-Omer = seule agence.
Dunkerque, Calais, Boulogne = zones/poles d intervention.
Tu as releve 78 pages avec « HELP Confort Saint-Omer & Dunkerque » en donnees structurees : traite-les.
Auditer aussi titles, H1, meta, LocalBusiness/Organization, breadcrumbs, footer, FAQ, guides, agence-dunkerque.html, pages metier/geographiques.
Preserver une citation historique si elle doit rester historique.
Ne pas supprimer les pages SEO villes ; corriger leur positionnement semantique.

## Tache 3 — tracking / consentement

Traiter les 47 pages chargeant hc-tracking.js sans bandeau ni chargeur GA4.
Etendre consent.test.mjs pour couvrir hc-tracking.js et les 113 pages actuellement ignorees.
Regle : aucun tracking reseau avant consentement ; hors prod inert ; pas de double bandeau ; assets versionnes.
Corriger aussi contrats-entretien.html qui porte encore hc-consent.js?v=20260919a.

## Tache 4 — wording paiement dans le tunnel

Le tunnel public dit encore : « un paiement en ligne facultatif peut vous etre propose a la confirmation » alors que le paiement est volontairement OFF.
Reformuler pour ne pas promettre une fonctionnalite inactive.
Ne pas activer le paiement.

## Tache 5 — paiement serveur PREP ONLY

Les deux P1 restent ouverts :
- stripe-create-payment-link public / amount_eur client ;
- stripe-webhook sans verification de signature.
Prepare, sans deployer :
A. Checkout recevant offer_id uniquement et relisant le prix cote serveur ;
B. webhook avec verification stricte stripe-signature + secret ;
C. separation test/live ;
D. tests locaux/contractuels ;
E. rollback/procedure de retour.
Aucun deploy function, aucune cle, aucun verify_jwt change sans GO explicite Florian.

## Tache 6 — image OG menuiserie

og/menuisier-saint-omer.png manque.
Produire une solution qui ne casse pas le build : soit asset dedie depuis le pipeline existant, soit fallback canonique documente.
Pas de fichier binaire artisanal sans source reproductible.

## Tache 7 — Realisations

Audit complet : flux, cartes, fiches, liens 200, metiers, manifest, generateur, idempotence, classifications, headers.
Verifier que les 34 fiches et les pages locales/metier restent coherentes.

## Tache 8 — routage demandes REQ-033

Toutes les demandes doivent finir a saint-omer@helpconfort.com.
Front : corriger si necessaire.
Fonction serveur : seulement rapport si deploiement necessaire.

## Tache 9 — Decap

admin/config.yml : corriger domaine obsolete, site_url/display_url, coordonnees, emails, doctrine agence, tarifs par defaut, metiers, liens.
Ne pas casser /admin/*.

## Tache 10 — responsive global

390 px + 1440 : accueil, catalogue, contrats, nos-metiers, nos-prestations, pages metier, realisations, actualites, FAQ, guides, villes.
Zero overflow horizontal.

## Tache 11 — crawl global

Liens internes, 404, assets, ancres, redirects, variantes avec/sans .html.
Produire liste avant/apres et corriger les erreurs non ambigues.

## Tache 12 — SEO technique

Sitemap, robots, canonical, JSON-LD, titles/H1, pages orphelines, cannibalisation.
Fonction edge sitemap : aucun deploiement sans GO ; diff/proposition seulement.

## Tache 13 — performance

Mesurer avant/apres : JS/CSS inutiles, duplications, cache-busting, images lourdes, scripts charges sans usage.

## Tache 14 — accessibilite

Clavier, focus, aria, labels, alt, formulaires, modales, contrastes flagrants.

## Tache 15 — anciennes PR

Classer puis fermer les PR de preview/revue devenues obsoletes : #15 #16 #17 #18 #19 #20 #21 et autres equivalentes.
Ne jamais fusionner une vieille base.

## Tache 16 — CI / suite complete

Apres chaque lot, relancer les suites concernees.
Construire un chemin vers 0 rouge herite.
Ne jamais supprimer une assertion utile juste pour passer au vert.

## Tache 17 — navigation Nos metiers

Auditer si /nos-metiers.html doit etre dans le menu principal.
Prepare deux variantes si necessaire (avec/sans entree menu) mais ne change pas la navigation sans decision Florian.

## Tache 18 — contenus commerciaux a verifier

Auditer les claims encore visibles :
- acompte 40 % ;
- 4,7/5 sur 343 avis ;
- devis gratuit ;
- pas de sous-traitance ;
- techniciens salaries ;
- MaPrimeRenov/CEE/PMR ;
- delais d intervention ;
- garanties.
Tout claim non prouve par une source canonique doit etre retire ou reformule.

## Tache 19 — prix publics

Recontroler HT/TTC, frais deplacement, forfaits, urgence/week-end, tarifs poses, et ecarts entre FAQ/pages/tunnel.
Pas de nouveau moteur de prix : une source canonique.

## Tache 20 — tracker final

Relire REQUESTS-TRACKER.json.
Classer A faisable seul / B visuel-commercial / C sensible-permission / D obsolete-supersede.
Continuer toutes les A sans attendre.

## HOLD

- Stripe live / functions / verify_jwt / webhook secret : HOLD sans GO.
- Supabase RLS/Auth/DNS/secrets : HOLD sans GO.
- offres CDI : HOLD sans confirmation de recrutement actif.
- runner autonome : hors chemin critique si secret/protection main absents.

## Regle d execution autonome

Une tache a la fois : audit -> correction -> tests -> preview -> PR READY_FOR_CONTROL.
Si blocage humain/sensible : rapport court, puis tache suivante independante.
Ne jamais rester en attente si du travail sur une autre tache est possible.
Retour uniquement pour : PR READY_FOR_CONTROL, anomalie P0/P1, blocage humain/sensible, PROD_VERIFY.