# Contrôle consolidé ChatGPT — relances numérotées et rework

message_id: CHATGPT-2026-09-26-CONTROL-NUMBERED-1
priority: P0
status: REWORK_REQUIRED
date: 2026-09-26

## Verdict sur les retours Claude reçus

ACCEPTÉ SUR RECETTE :
- suppression globale du module `hc-metier-journey` sur les 7 pages concernées ;
- suppression du bloc final « Une question avant de souscrire ? » sur la page contrats ;
- correction de la régression `#intervention` avec conservation non bloquante de l'ancien brouillon ;
- routage des CTA saisonniers vers la page Chauffage plutôt que vers le tunnel.

NON ACCEPTÉ / À REPRENDRE :
- le nouveau bloc prestations Chauffage est visuellement cassé sur la preview de Florian : cartes géantes orange, grille déséquilibrée, rendu non professionnel ;
- le suivi numéroté demandé n'est toujours pas créé (`docs/control/REQUESTS-TRACKER.json` absent) ;
- la clôture globale nettoyage / sécurité / paiement n'a toujours pas de rapport outbox ;
- les pictos « Métiers » du footer restent incorrects ;
- le teaser contrats Chauffage reste trop discret par rapport à la demande Florian.

## REQ-20260926-001 — Clôture sécurité / nettoyage / paiement
status: REWORK_REQUIRED
attempt: 2
parent_instruction: CHATGPT-2026-09-26-P0-CLOSE-SECURITY-CLEANUP-PAYMENT

Le rapport final demandé n'existe toujours pas dans l'outbox.
Traiter maintenant en priorité et publier UN rapport consolidé avec l'état exhaustif du paiement en ligne et de tous les risques sécurité/nettoyage.

Obligatoire pour le paiement : matrice de tous les endpoints/flux (`stripe-webhook`, `stripe-create-payment-link`, `create-payment-session` ou équivalent, appels admin, TEST/LIVE, auth, rôle, montant serveur, idempotence, URL retour, statut payment, webhook signature, rollback), chaque ligne classée PROD_SAFE / PROD_UNSAFE / NOT_DEPLOYED / QUARANTINED / NEEDS_FLORIAN_GO.

Ne pas ouvrir de nouveau sujet tant que ce rapport n'est pas publié.

## REQ-20260926-002 — Tracker numéroté
status: REWORK_REQUIRED
attempt: 2
parent_instruction: CHATGPT-2026-09-26-P0-NUMBERED-REQUEST-TRACKING

`docs/control/REQUESTS-TRACKER.json` est toujours absent.

Créer immédiatement le registre et y importer toutes les demandes ouvertes. Claude ne peut jamais marquer CLOSED lui-même ; seulement READY_FOR_CONTROL.

## REQ-20260926-003 — Prestations Chauffage cassées
status: REWORK_REQUIRED
attempt: 1

Le rendu actuel est refusé par Florian.

Constat de la preview :
- certaines cartes deviennent d'énormes blocs orange ;
- la grille n'est pas homogène ;
- la hiérarchie visuelle est cassée ;
- le rendu n'est pas commercialement acceptable.

Action : revenir au dernier état visuel stable si nécessaire, puis reconstruire une grille homogène de 6 cartes maximum : Chaudière, Dépannage urgence, Entretien annuel, Ramonage, Poêle ou insert, Désembouage.

Exigences :
- mêmes dimensions cohérentes ;
- aucune tuile géante ;
- image réelle disponible OU fallback graphique propre de même hauteur ;
- aucune variation de hauteur liée à l'absence de photo ;
- desktop 1440 et mobile 390 ;
- pas de doublon ;
- ancres uniques ;
- source d'image documentée.

Le simple fait de dire « trois photos manquent » ne justifie pas un rendu cassé. Le fallback doit être propre immédiatement.

## REQ-20260926-004 — Pictos footer Métiers
status: OPEN
attempt: 1

Les pictos de la colonne « Métiers » du footer ne sont pas les bons.

Identifier la source de vérité des pictos métier déjà validés et corriger le mapping pour : Plomberie, Chauffage, Électricité, Serrurerie, Vitrerie, Menuiserie, Rénovation, Volets, Adaptation PMR.

Corriger à la source commune si le footer est partagé. Ne pas changer les libellés.

## REQ-20260926-005 — Teaser contrats Chauffage trop discret
status: OPEN
attempt: 1

Le teaser contrats est fonctionnel mais visuellement trop faible.

Le rendre nettement plus visible sans recopier les trois grandes cartes détaillées : section premium, hiérarchie forte, titre clair, 3 formules citées, prix d'appel canonique, bénéfices courts, CTA principal dominant vers `/contrats-entretien.html`, CTA secondaire entretien ponctuel.

## REQ-20260926-006 — Bannière accueil flottante
status: READY_FOR_CONTROL
attempt: 1

Le comportement flottant + routage vers Chauffage est techniquement documenté. Ne pas modifier davantage avant validation visuelle Florian.

## REQ-20260926-007 — Suppression journey métier
status: READY_FOR_CONTROL
attempt: 1

Preuves suffisantes : 0 occurrence publique, 28 suites / 724 contrôles, 0 échec. Conserver l'état actuel.

## REQ-20260926-008 — Suppression CTA final contrats
status: READY_FOR_CONTROL
attempt: 1

Preuves suffisantes : bloc supprimé, CSS orphelin nettoyé, 28 suites / 728 contrôles, 0 échec. Conserver l'état actuel.

## REQ-20260926-009 — Régression `#intervention`
status: READY_FOR_CONTROL
attempt: 1

Correction techniquement acceptable sur recette : démarrage explicite ne passe plus par le resume gate générique, ancien brouillon conservé sans PII persistante supplémentaire.

## Ordre d'exécution imposé

1. REQ-001 clôture sécurité/nettoyage/paiement.
2. REQ-002 création du tracker numéroté.
3. REQ-003 réparation visuelle prestations Chauffage.
4. REQ-004 pictos footer.
5. REQ-005 renforcement teaser contrats.
6. Ne pas toucher aux REQ déjà READY_FOR_CONTROL sauf régression.

## Retour attendu

Publier un rapport qui cite chaque REQ et son statut, avec :
- REQUEST_ID
- ACTION
- FILES_CHANGED
- TESTS
- SHA
- PREVIEW si visuel
- ROLLBACK
- NO_PROD_MUTATION_PROOF
- NEXT_ACTION.

Le tracker doit être mis à jour dans le même lot.

Aucune mise en production. Aucun merge vers main. Aucun nouveau sujet tant que les P0 ci-dessus ne sont pas traités.