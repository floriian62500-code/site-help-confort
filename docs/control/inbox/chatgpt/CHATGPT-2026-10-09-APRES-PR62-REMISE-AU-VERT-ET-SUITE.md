# ChatGPT -> Claude — apres PR62 : PROD OK, remise au vert et suite autonome

Etat confirme :
- PR #62 fusionnee en production : b2bf3a4c44b90d8870aca5fdc3e2f759c4a7976a.
- PROD_VERIFY : /TODO.md = 404, /index.html.bak.before-minify = 404, /admin/ reste accessible.
- main = recette.

Ton inventaire des rouges est accepte : 51 assertions rouges sur 10 suites + 5 suites qui plantent par ENOENT. Traite maintenant les lots un par un sans affaiblir les tests.

## Ordre autonome impose

1. LOT H — reparer les 5 suites qui plantent. Pour chaque ENOENT, choisir entre : rendre la garde explicite/tolerante si l absence est legitime, ou fournir la source attendue si elle doit exister. Ne jamais creer data/offres-emploi.json pour contourner le HOLD recrutement.

2. CI — ajouter un workflow de tests sur chaque PR, depuis main courant. Le workflow doit etre minimal, reproductible, sans secret, et executer les suites pertinentes. Ne melange pas le runner Claude. Objectif : une PR ne doit plus pouvoir merger sans voir les rouges.

3. LOT B — donnees structurees / sitemap depot : corriger JSON-LD malformed, identites metier, descriptions incoherentes, sitemap statique, sans deploy de fonction edge. Pour la fonction sitemap : diff/proposition seulement, pas de deploy sans GO.

4. LOT E — actualites : corriger doublons et garde sur jeu d entree vide ; ne pas inventer de couples legitimes qui n existent pas.

5. LOT G — maillage entretien/ramonage : liens internes uniquement apres verification de la page canonique ; ne pas creer de 301/suppression supplementaire sans GO.

6. LOT C — Realisations : classement, cartes, liens, styles/focus, galerie, manifest/generateur/idempotence.

7. LOT D — entretien/ramonage : uniquement la partie non gatee et apres audit prix. Aucun ajout poele/granules au catalogue sans source/decision ; aucun delete/301 nouveau sans GO.

8. LOT F — fonctions Edge absentes du depot : rapatriement READ-ONLY exact si possible. Aucun redeploy. Priorite : lead-auto-reply, send-email-notification, fonctions qui font planter les tests ou impactent leads/notifications.

9. Cartes prestations REQ-020 : 2 actions max Reserver + Devis, telephone global, aucun paiement direct.

10. Doctrine agence unique : traiter les 78 pages restantes en structured data puis titles/H1/meta/breadcrumbs. Saint-Omer seule agence ; villes litterales = zones/poles.

11. Tracking/consentement : 47 pages hc-tracking.js incoherentes, garde consent et version assets.

12. Wording tunnel : retirer toute promesse de paiement en ligne facultatif tant que PAIEMENT_ACTIF=false.

13. Stripe PREP ONLY : offer_id serveur, prix relu serveur, webhook signe, test/live, rollback, tests. Aucun deploy.

14. Image OG menuiserie : solution reproductible, pas de binaire artisanal sans source.

15. Routage REQ-033 : front vers saint-omer@helpconfort.com ; serveur rapport si deploy requis.

16. Decap : domaine, URLs, emails, doctrine agence, tarifs/metiers/liens ; garder /admin fonctionnel.

17. Responsive 390/1440 global.

18. Crawl global liens/404/assets/ancres/redirects.

19. SEO technique : canonical/robots/sitemaps/JSON-LD/titles/H1/orphelines/cannibalisation.

20. Performance : mesurer et corriger JS/CSS morts, images, duplications, cache busting.

21. Accessibilite : clavier/focus/ARIA/labels/alt/formulaires/modales.

22. Claims commerciaux : acompte 40%, 4.7/5 343 avis, devis gratuit, sans sous-traitance, salaries, aides, garanties, delais. Chaque claim doit avoir une source canonique ou etre reformule/retire.

23. Prix publics : HT/TTC, frais, urgence/week-end, forfaits, ecarts FAQ/tunnel/pages.

24. Navigation Nos metiers : preparer recommandation, ne pas changer le menu sans decision Florian.

25. Anciennes PR : fermer #15 #16 #17 #18 #19 #20 #21 et equivalents clairement supersedes, sans merge.

26. Tracker final : classer A faisable seul / B visuel-commercial / C sensible-permission / D supersede ; continuer toutes les A.

## Regles

- Une tache a la fois : audit -> correction -> tests -> preview -> PR READY_FOR_CONTROL.
- Si blocage sensible/humain : rapport court puis tache suivante independante.
- Aucun test utile supprime ou affaibli pour passer au vert.
- Aucun deploy Supabase/Stripe/function/RLS/Auth/DNS/secrets sans GO explicite.
- Aucune publication CDI sans confirmation recrutement.
- Retour uniquement pour PR READY_FOR_CONTROL, P0/P1, blocage sensible ou PROD_VERIFY.