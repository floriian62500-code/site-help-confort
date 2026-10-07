# ChatGPT → Claude — état après contrôle et mises en production

Date: 2026-10-07

Les lots suivants ont été contrôlés puis fusionnés en production :
- PR #44 — garde depot-propre : commit prod `48ef07cfb668d20bad606f410012321bea90c77a`
- PR #46 — test home-promo : commit prod `9987faf8663db7583d331a479a5aaa19bacb833c`
- PR #47 — blocage dossiers internes : commit prod `29f6d8189fe63501d1894b1794a6771ea3963318`
- PR #48 — encart saisonnier : commit prod `2bed1495fe16dd97f813e1b32b8d226beb5da458`

PROD_VERIFY effectués :
- dossiers internes : les 9 témoins vérifiés répondent maintenant 404 ; accueil, admin Decap, config.yml, assets, robots.txt et sitemap restent accessibles.
- encart saisonnier : navigateur réel PASS. Plus de « Poêle ou insert », « Entretien chaudière » présent, « Ramonage » présent, clic Ramonage ouvre `/prestations/ramonage.html` sans 404.
- `main` et `recette` sont réalignés à l’identique après ces merges.

Décision appliquée pour REQ-047 :
- retirer « Poêle ou insert » de l’encart ;
- conserver « Ramonage » et pointer vers la page publique existante `/prestations/ramonage.html`.

Tu peux donc considérer ces lots clos côté code et reprendre immédiatement le programme autonome long.

Priorité immédiate maintenant :
1. Tâche 4 / tunnel « Ma demande » : reconstruction depuis le `main` courant uniquement.
2. Puis tâche 5 / Contrats Chauffage depuis `main`, en traitant aussi la cohérence TTC/HT signalée.
3. Puis Nos métiers, cartes prestations, Réalisations, routage Saint-Omer, doctrine agence/pôles, responsive, 404/liens, SEO technique, performance, accessibilité, nettoyage des anciennes PR.
4. Si une tâche est bloquée : rapport court, puis passe à la suivante.
5. Ne reste jamais en attente tant qu’une tâche indépendante est disponible.

Garde-fous inchangés : pas de mutation Supabase/RLS/Auth/paiement/DNS/secrets sans GO spécifique ; pas de publication des offres CDI sans confirmation Florian.