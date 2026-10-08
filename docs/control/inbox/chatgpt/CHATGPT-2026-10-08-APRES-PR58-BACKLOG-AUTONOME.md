# Apres PR58 - PROD OK, corrections restantes et backlog autonome

Etat confirme :
- PR58 fusionnee en production : fb26ecc10fb00ec45678a21958c12354dda3be80.
- main = recette.
- PROD_VERIFY public : page contrats servie, blog chauffage mis a jour, CONFORT affiche 48 h.
- aucune activation de paiement.

## Point important trouve au PROD_VERIFY

Le blog blog-entretien-chaudiere-annuel-obligatoire.html contient encore plusieurs promesses commerciales qui ne sont pas prouvees par ton tableau d audit et peuvent contredire la source canonique :
- BASIC ... + depannage prioritaire alors que ton audit dit BASIC = depannages factures en sus ;
- pas de majoration soir/week-end ;
- petites pieces incluses ;
- 78% des contrats souscrits ;
- Sans engagement, resiliation libre.

Traite cela en priorite : pour chaque phrase, preuve dans la source canonique ou suppression/reformulation. Ne laisse aucune statistique marketing non sourcee.

## Tache 1 - fermer proprement REQ-055

1. Audit complet du texte visible + JSON-LD + meta de contrats-entretien.html, blog, FAQ, guides, pages chauffagiste.
2. Chercher toutes les occurrences de depannage prioritaire, sans engagement, resiliation libre / 1 clic, week-end, pieces incluses, illimite, 24 h / 48 h, economie, pourcentage client / plus choisi / 78%.
3. Chaque claim doit etre prouve par v_contract_offers ou par une source contractuelle versionnee.
4. Sinon le retirer ou le reformuler.
5. Rejouer contrats, prix-contrats, intention-unique.
6. Nouvelle PR courte si corrections necessaires.

## Tache 2 - Stripe / paiement, audit technique seulement

Le paiement reste OFF. Continue en lecture seule :
1. cartographier stripe-create-payment-link, stripe-webhook, create-payment-session et tous leurs call sites ;
2. prouver si un montant peut encore venir du navigateur ;
3. documenter l ancien anon key et les fonctions deployees ;
4. verifier le webhook et son controle serveur ;
5. proposer architecture cible : prix canonique serveur -> Stripe Checkout -> webhook -> rattachement demande/contrat ;
6. ne rien activer ni deployer sans GO explicite.

Si une faille exploitable publique existe, rapport P1 immediat puis poursuis le reste.

## Tache 3 - Nos metiers REQ-032

Reconstruire depuis le main courant. Ne pas fusionner les anciennes PR de preview. Desktop 1440 + mobile 390, liens reels, aucune route docs publique.

## Tache 4 - cartes prestations REQ-020

Maximum 2 actions par carte : Reserver + Devis. Le telephone reste global header/sticky. Si arbitrage commercial necessaire, preview puis passe a la suite.

## Tache 5 - doctrine agence unique

Saint-Omer = seule agence. Dunkerque, Calais, Boulogne = zones ou poles d intervention.
Auditer footer, titles, H1, meta, JSON-LD, breadcrumbs, agence-dunkerque.html, pages metier/geographiques, textes historiques.
Ne pas reecrire une citation historique sans arbitrage.

## Tache 6 - Realisations

Audit complet : feeds, cartes, 34 fiches, liens 200, metiers, manifest, generateur, idempotence, aucune actualite/recrutement classee chantier, aucun retour de topbar/header legacy.

## Tache 7 - routage demandes

Toutes les demandes doivent finir a saint-omer@helpconfort.com. Front : corriger si non ambigu. Fonction serveur : rapport seulement si deploiement requis.

## Tache 8 - Decap

Auditer admin/config.yml : domaine obsolete, display_url/site_url, emails, doctrine agence, tarifs par defaut, metiers, liens. Ne pas bloquer /admin/*.

## Tache 9 - responsive global 390

Tester accueil, tunnel, contrats, contact, metiers, prestations, realisations, actualites, FAQ, guides, pages villes.

## Tache 10 - crawl global

Liens internes, 404, assets, ancres, redirects, routes sans .html, routes avec .html.

## Tache 11 - SEO technique

Sitemap, robots, canonical, JSON-LD, titles/H1, pages orphelines, cannibalisation. Pour la fonction edge sitemap : ne pas deployer sans GO, seulement fournir le diff/proposition.

## Tache 12 - performance

Mesurer avant/apres : JS/CSS inutiles, duplications, cache-busting, images lourdes, inline historiques.

## Tache 13 - accessibilite

Clavier, focus, aria, labels, alt, formulaires, contrastes flagrants, modals.

## Tache 14 - anciennes PR

Classer et fermer les previews/reviews obsoletes (#15, #17, #18, #19, #20, #21, etc.) sans merger de vieilles bases.

## Tache 15 - tests globaux

Rejouer toutes les suites. Aucun vert ne doit repasser rouge. Reduire les rouges herites sans affaiblir les assertions.

## Tache 16 - tracker final

Relire REQUESTS-TRACKER.json, classer A faisable sans arbitrage, B visuel/commercial, C sensible/permission, D obsolete/supersede. Continuer toutes les A.

## HOLD

- offres CDI : aucune publication sans confirmation de recrutement ;
- runner autonome : hors chemin critique si secret/protection main absent ;
- Supabase RLS/Auth/fonctions paiement/DNS/secrets : aucune mutation sans GO.

Regle d execution : une tache a la fois, audit -> correction -> tests -> preview -> PR READY_FOR_CONTROL. Si blocage humain/sensible : rapport court, puis tache suivante. Retour uniquement pour PR READY_FOR_CONTROL, blocage, anomalie P0/P1 ou PROD_VERIFY.