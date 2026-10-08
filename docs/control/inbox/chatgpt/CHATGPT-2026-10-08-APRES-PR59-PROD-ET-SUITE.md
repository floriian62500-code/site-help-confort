# Apres PR59 — PROD OK et poursuite autonome longue

Etat confirme :
- PR59 fusionnee en production : 919f828c697bd2c89a0e8095ea437c90a93e8ce7.
- main = recette.
- PROD_VERIFY public OK sur FAQ, blog entretien chaudiere et guide.
- la promesse week-end des contrats Securite a ete retiree du texte visible et des donnees structurees.
- restriction chaudiere < 5 ans / controle technique visible.

## Priorite 1 — audit Stripe / paiement en lecture seule

Ne modifie et ne deploie rien cote Stripe/Supabase sans GO explicite.
Traite une cartographie complete :
1. stripe-create-payment-link : code source, call sites, statut de deploiement, auth, params recus.
2. stripe-webhook : evenements acceptes, verification de signature, confiance dans metadata/amount.
3. create-payment-session : statut reel de deploiement et call sites.
4. tous les liens Payment Link ou Checkout encore exposes.
5. toute valeur amount / amount_eur / prix venant du navigateur.
6. ancien anon key ou cle publiee encore referencee.
7. difference test/live dans les integrations visibles.
8. chemin cible recommande : offer_id canonique serveur -> lookup prix cote serveur -> Stripe Checkout -> webhook signe -> rattachement lead/contrat.
9. lister les changements necessaires par ordre de risque, sans les executer.

Si un montant peut etre falsifie publiquement aujourd hui, classe P1 et fais un rapport immediat, puis passe a la tache suivante.

## Priorite 2 — Nos metiers REQ-032

Reconstruction depuis le main courant uniquement. Ne reprends pas les vieilles PR telles quelles.
- page publique finale, pas une maquette docs ;
- desktop 1440 et mobile 390 ;
- liens vers pages metier reelles ;
- coherente avec header/footer actuels ;
- aucune route /docs publique ;
- pas de duplication inutile ;
- preview Netlify puis PR READY_FOR_CONTROL.

## Priorite 3 — cartes prestations REQ-020

Maximum 2 actions : Reserver + Devis. Telephone global header/sticky. Si arbitrage visuel/commercial, preview + rapport puis suite.

## Priorite 4 — doctrine agence unique

Saint-Omer = seule agence. Dunkerque / Calais / Boulogne = zones ou poles d intervention.
Auditer et corriger si non ambigu :
- footer ;
- titles / H1 ;
- meta descriptions ;
- JSON-LD LocalBusiness/Organization ;
- breadcrumbs ;
- agence-dunkerque.html ;
- pages metier geographiques ;
- FAQ, guides, blog ;
- textes « Saint-Omer & Dunkerque » qui suggerent deux agences.
Preserve les citations historiques et demande arbitrage uniquement si le contexte l impose.

## Priorite 5 — Realisations

Controle complet :
- flux ;
- cartes ;
- fiches ;
- liens 200 ;
- metiers ;
- manifest ;
- generateur ;
- idempotence ;
- aucun recrutement/actu dans chantier ;
- aucun ancien topbar/header ;
- aucun lien interne casse.

## Priorite 6 — routage des demandes

Toutes les demandes doivent arriver a saint-omer@helpconfort.com.
- front : corriger si clair ;
- fonctions serveur : rapport du changement necessaire uniquement si deploiement requis.

## Priorite 7 — Decap

Auditer admin/config.yml :
- site_url/display_url ;
- ancien domaine ;
- emails ;
- coordonnees ;
- doctrine agence ;
- tarifs par defaut ;
- metiers ;
- liens publics.
Ne bloque jamais /admin/*.

## Priorite 8 — responsive global 390

Accueil, tunnel, contrats, contact, nos-metiers, nos-prestations, realisations, actualites, FAQ, guides, pages zones, pages metier.

## Priorite 9 — crawl global

Liens, 404, assets, ancres, redirects, variantes avec/sans .html, routes canoniques.

## Priorite 10 — SEO technique

Sitemap, robots, canonical, JSON-LD, titles/H1, pages orphelines, cannibalisation.
La fonction edge sitemap reste sans deploiement tant qu il n y a pas de GO.

## Priorite 11 — performance

Mesurer avant/apres : JS/CSS morts, duplications, cache-busting, images, inline historiques, ressources chargees inutilement.

## Priorite 12 — accessibilite

Clavier, focus, aria, labels, alt, formulaires, modals, contrastes flagrants.

## Priorite 13 — anciennes PR

Classer et fermer les PR obsoletes de preview/review (#15, #17, #18, #19, #20, #21, etc.) sans merger de vieille base.

## Priorite 14 — tests globaux

Rejouer toutes les suites. Aucun vert ne doit repasser rouge. Reduire les rouges herites sans affaiblir les tests.

## Priorite 15 — tracker final

Relire REQUESTS-TRACKER.json et classer :
- A faisable seul ;
- B visuel/commercial ;
- C sensible/permission ;
- D obsolete/supersede.
Continuer toutes les A une par une.

## HOLD

- paiement Stripe actif : HOLD jusqu au GO ;
- deploiement fonction paiement / RLS / auth / DNS / secrets : HOLD sans GO ;
- offres CDI : HOLD sans confirmation de recrutement ;
- runner autonome : hors chemin critique si secret/protection main absent.

Regle stricte : audit -> correction -> tests -> preview -> PR READY_FOR_CONTROL -> attendre controle pour merge. Si blocage humain/sensible : rapport court puis tache suivante. Retour uniquement pour PR READY_FOR_CONTROL, P0/P1, blocage ou PROD_VERIFY.