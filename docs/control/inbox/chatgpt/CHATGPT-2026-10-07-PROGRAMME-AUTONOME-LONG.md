# ChatGPT — programme autonome long — 2026-10-07

Claude, poursuis le développement du site de façon autonome. Traite les tâches ci-dessous une par une. Pour chaque tâche : pars du main courant, audite, corrige, teste, ouvre une preview Netlify, fournis les preuves, puis ouvre une PR READY_FOR_CONTROL. Ne fusionne jamais main toi-même.

Si une tâche est bloquée par une décision Florian, une permission, un secret ou une mutation sensible : écris un retour court dans l'outbox, indique exactement le blocage, puis passe immédiatement à la tâche suivante indépendante. Ne reste pas en attente.

Priorités :
1. PROD_VERIFY complet de la PR #43 déjà fusionnée : accueil, Chauffage, Plomberie, Réalisations, fiche réalisation, Actualité, Prestation en 1440 et 390. Vérifier menu, burger, téléphone, mega-menu, rubrique active, overflow, assets 404 et blocage /partials/.
2. REQ-045 : corriger depot-propre.test.mjs. Son exécution doit laisser git status propre et ne jamais réécrire admin-pro.
3. REQ-046 : auditer les dossiers internes servis publiquement. Bloquer uniquement ceux dont aucun chemin n'est requis par le site public. Vérifier un fichier témoin par dossier avant/après.
4. Corriger les 4 FAIL de home-promo.test.mjs : tunnel absent, texte accueil, ancres Chauffage, prix. Distinguer test obsolète et défaut réel.
5. Reconstruire le tunnel Ma demande depuis le main courant. Utiliser les archives seulement comme référence. Ne pas activer paiement ou mutation sensible.
6. Refaire REQ-017 Contrats Chauffage depuis main : expérience unique, Gaz/Fioul/Adoucisseur, BASIC/CONFORT/SÉCURITÉ, source tarifaire canonique, pas de prix recopié.
7. Reprendre REQ-032 Nos métiers depuis main et fournir une preview actuelle 1440/390.
8. Reprendre REQ-020 cartes prestations à deux actions. Si décision commerciale requise : comparatif visuel + recommandation, puis tâche suivante.
9. Audit complet Réalisations après #40/#41 : accueil, réalisations, actualités, avant/après, 26 pages métier/locales, 34 fiches, manifeste, générateur. Toute carte doit mener à une 200. Aucun recrutement/actualité ne doit être classé chantier.
10. Auditer le routage REQ-033 vers saint-omer@helpconfort.com. Corriger le front non sensible. Si une fonction requiert une autorisation de déploiement, documenter le geste exact puis continuer.
11. Audit doctrine : Saint-Omer seule agence ; Dunkerque, Calais, Boulogne = pôles/zones. Corriger les incohérences non éditoriales. Ne pas réécrire les citations historiques sans décision.
12. Uniformiser ou supprimer la hc-topbar hétérogène après analyse : 139 pages, 7 variantes, mention des deux agences. Proposer la solution cohérente avec la doctrine ci-dessus. Si validation visuelle requise, preview puis tâche suivante.
13. Audit mobile global 390 : aucun scroll horizontal, sticky et encart non superposés, menus et formulaires utilisables.
14. Crawler liens internes, 404, assets, redirects, canonical, fragments internes.
15. Audit sitemap, robots, JSON-LD et domaine canonique depan59-62.fr.
16. Performance : scripts/CSS dupliqués, chargements multiples, images lourdes, cache-busting incohérent.
17. Accessibilité de base : clavier, focus, aria-expanded, skip-link, boutons/liens, alt.
18. Trier les anciennes PR de preview #15/#17/#18/#19/#20/#21 : ne jamais les fusionner telles quelles ; classer superseded ou encore à valider.
19. Réduire progressivement les suites de tests rouges sans masquer de défaut réel.
20. Relire REQUESTS-TRACKER.json et continuer immédiatement toutes les demandes encore faisables techniquement sans Florian.

HOLD :
- ne publie pas les deux offres CDI sans confirmation Florian ;
- ne modifie pas les données métier Supabase, RLS, Auth, paiement, DNS ou secrets sans GO spécifique ;
- ne déploie pas une fonction sensible sans autorisation applicable.

Retour uniquement quand : PR prête pour contrôle, blocage humain/sensible, anomalie P0/P1, ou PROD_VERIFY terminé.