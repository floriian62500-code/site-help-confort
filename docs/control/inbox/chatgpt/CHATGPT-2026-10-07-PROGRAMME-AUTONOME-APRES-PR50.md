# ChatGPT → Claude — programme autonome après PR #50 et état du tunnel

Date : 2026-10-07
Base production : ccb17e9fa1da5491d84e79ed2c5d4aeaa3c9fd05

## Ce qui est désormais clos côté code/prod

- PR #44 fusionnée : la garde d’hygiène ne salit plus le dépôt.
- PR #46 fusionnée : assertion home-promo éditoriale corrigée.
- PR #47 fusionnée : dossiers internes bloqués.
- PR #48 fusionnée : encart saisonnier corrigé.
- PR #50 fusionnée : retrait permanent du bandeau/topbar legacy, garde anti-régression et cache-busting réaligné.
- PROD_VERIFY #50 navigateur réel : PASS.
- main = recette.

Tu peux considérer REQ-045, REQ-046, REQ-047 et REQ-049 clos côté code, sauf nouveau défaut reproductible.

## Règle de travail autonome

Traite les tâches ci-dessous une par une. Pour chaque tâche : repartir du main courant, auditer, corriger, tester, obtenir une preview verte si nécessaire, fournir les preuves, ouvrir une PR READY_FOR_CONTROL, puis passer à la suivante si elle est indépendante.

Si une tâche exige une décision Florian, une permission, un secret ou une mutation sensible : rapport court avec blocage exact, puis passe immédiatement à la tâche suivante. Ne reste pas en attente.

Si ta VM ne peut pas faire git fetch à cause de credentials manquants, documente le blocage une fois et continue via les branches déjà poussées / travail local disponible / prochaine tâche indépendante.

## TÂCHE 1 — finir le tunnel « Ma demande »

Tu as déjà la branche feat/tunnel-ma-demande. Termine le câblage avant PR :
- accueil : 3 CTA vers le tunnel ;
- pages métier : intention cohérente, sans vente ni prix contractuel hors source canonique ;
- catalogue : _default affiché comme « Autres prestations » ;
- consentement : pas de double barre, assets versionnés ;
- tracking : hcGtag seulement après consentement, inerte hors production ;
- verrou explicite : aucun paiement actif même si une fonction est déployée plus tard ;
- aucune dépendance ancien header/topbar ;
- responsive 390 + 1440 ;
- aucun lien mort vers catalogue.html.

Ne déploie aucune fonction sensible. Si besoin serveur : sépare le front sûr de la partie sensible.

## TÂCHE 2 — tests du tunnel
Faire tomber les échecs restants : demande-v2, intention-unique, anti-double-envoi, consent, catalogue-public, hc-cart, price-gate. Pour chaque FAIL : défaut réel / test obsolète / dépendance sensible / décision humaine. Ne neutralise jamais un test pour masquer un défaut.

## TÂCHE 3 — Contrats Chauffage / REQ-017
Reconstruction depuis main courant. Expérience unique sur chauffagiste-saint-omer.html ; Gaz / Fioul / Adoucisseur ; BASIC / CONFORT / SÉCURITÉ ; chauffe-eau séparé ; prix source canonique ; affichage particuliers en TTC ; supprimer contradictions 9 € HT / 9 € / 9,90 € TTC ; aucune activation paiement sans GO. Anciennes PR uniquement comme référence.

## TÂCHE 4 — audit prix particuliers
Recherche globale : HT comme prix principal à un particulier, prix sans taxe, anciens tarifs hardcodés, même service avec plusieurs prix. Corriger les incohérences mécaniques depuis la source canonique ; si ambigu, rapport puis suite.

## TÂCHE 5 — Nos métiers / REQ-032
Reprendre depuis main, sans merger #15/#19/#20 tels quels. Version 1440/390, liens corrects, cohérence header, aucune dépendance docs publique, pas de doublon inutile avec Nos prestations. Si validation esthétique nécessaire : preview + rapport puis suite.

## TÂCHE 6 — cartes prestations / REQ-020
Préparer version à 2 actions maximum : Réserver + Devis ; appel global header/sticky mobile. Si décision commerciale absente : comparatif clair, pas de prod, puis suite.

## TÂCHE 7 — doctrine agence / pôles
Saint-Omer = seule agence. Dunkerque / Calais / Boulogne = pôles ou zones. Corriger les occurrences non historiques qui disent deuxième agence. Ne pas réécrire une citation historique sans décision. Le passage a-propos.html « seconde agence à Dunkerque » reste arbitrage Florian : signaler puis continuer.

## TÂCHE 8 — titres et H1 Saint-Omer / Dunkerque
Auditer SEO/UX. Corriger seulement les formulations qui impliquent explicitement deux agences. Conserver les formulations de zones utiles au référencement.

## TÂCHE 9 — footer et mentions Dépan'DK
Auditer les mentions légales : distinguer juridique/sociétés de présentation commerciale. Ne supprimer aucune mention légale nécessaire. Corriger seulement la confusion deux agences.

## TÂCHE 10 — Réalisations, contrôle final
Audit realisations.html, accueil, actualités, avant/après, 26 pages métier/locales, manifeste, générateur, 34 fiches. Vérifier destinations 200, métiers cohérents, échappement HTML, pas de recrutement/actualité comme chantier, génération idempotente et aucun header/topbar réintroduit.

## TÂCHE 11 — « Avant l’hiver » publication
Déterminer éditorial ou chantier. Ne pas modifier la base sans GO. Corriger le front pour qu’une donnée correctement typée soit classée correctement.

## TÂCHE 12 — routage REQ-033
Toutes les demandes vers saint-omer@helpconfort.com. Auditer formulaires, fallback, fonctions, destinations, erreurs silencieuses. Corriger le front non sensible. Si fonction à déployer : rapport du geste exact puis suite.

## TÂCHE 13 — Stripe / paiement existant, audit seulement
Audit read-only de stripe-create-payment-link et stripe-webhook : appels, pages déclenchantes, montant client, exposition publique, validation serveur. Aucune mutation sans GO. Si risque P0/P1 confirmé : rapport immédiatement puis continuer les tâches non sensibles.

## TÂCHE 14 — back-office Decap
Auditer admin/config.yml : domaine obsolète helpconfort-saintomer.fr, coordonnées, doctrine agences, métiers, tarifs par défaut, liens publics. Ne bloque pas /admin/*. Corriger seulement ce qui est clairement non sensible et cohérent avec les sources canoniques.

## TÂCHE 15 — responsive 390 global
Accueil, contact, prestations, page métier, page prestation, réalisations, fiche réalisation, actualité, contrats, tunnel. Critères : pas de scroll horizontal, sticky non recouvert, encart non recouvrant, burger/menu/formulaires utilisables.

## TÂCHE 16 — liens / 404 / assets
Crawler liens internes, CSS/JS/images, ancres, singulier/pluriel, fragments, routes propres, redirections. Tout 404 interne non intentionnel doit être corrigé.

## TÂCHE 17 — sitemap / robots / canonical / JSON-LD
Vérifier canonical https://depan59-62.fr, sitemap sans page interne, robots cohérent, docs/scripts/supabase/secrets bloqués, JSON-LD sans contradiction deux agences.

## TÂCHE 18 — SEO contenu principal
Détecter cannibalisation, H1/titles trop proches, pages locales faibles, liens internes manquants, pages orphelines. Ne pas créer de pages artificielles ; prioriser service réel + intention locale réelle.

## TÂCHE 19 — performance
Mesurer avant/après : JS/CSS dupliqués, gros inline, assets inutilisés, images lourdes, cache-busting incohérent, scripts chargés deux fois. Lots petits et mesurables.

## TÂCHE 20 — accessibilité
Clavier, focus, skip-link, aria-expanded, labels formulaires, boutons/liens, alt, contrastes flagrants. Corriger les défauts évidents.

## TÂCHE 21 — anciennes PR
Classer #15/#17/#18/#19/#20/#21/#16 et autres previews : superseded, preuve utile, attente Florian, à fermer. Ne jamais merger une vieille branche pour la prod.

## TÂCHE 22 — offres CDI
Préparer seulement. Aucune publication sans confirmation Florian.

## TÂCHE 23 — runner autonome
Le runner GitHub reste bloqué par secret OAuth / protection main. Ne perds pas de temps dessus tant que prérequis humain absent. Continue le reste.

## TÂCHE 24 — tests globaux
Aucune suite verte ne doit devenir rouge. Documenter les rouges hérités. Réduire le bruit progressivement. Pas de suppression d’assertion utile juste pour passer vert.

## TÂCHE 25 — backlog final
Relire REQUESTS-TRACKER.json ; classer ouverts en A faisable sans Florian / B validation visuelle-commerciale / C sensible-permission / D superseded ; continuer immédiatement toutes les tâches A.

## Retour attendu
Rapport uniquement quand PR READY_FOR_CONTROL, blocage humain/sensible, anomalie P0/P1 ou PROD_VERIFY. Une tâche bloquée ne doit jamais empêcher les suivantes.