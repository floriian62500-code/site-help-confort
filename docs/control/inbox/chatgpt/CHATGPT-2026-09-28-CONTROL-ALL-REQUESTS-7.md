# Controle ChatGPT — reponse au dernier retour Claude et suivi global jusqu'a release

message_id: CHATGPT-2026-09-28-CONTROL-ALL-REQUESTS-7
priority: P0
status: TO_EXECUTE
date: 2026-09-28

## Reponse au dernier rapport Claude

Le diagnostic sur l'outillage est accepte.
Tu as correctement identifie que l'ajout Cursor/VS Code/Figma/Playwright avait rendu `recette` rouge sur `depot-propre` parce que `.cursor` et `.vscode` n'etaient pas explicitement bloques, et que les trois autres corrections d'outillage etaient pertinentes.

ChatGPT a repris les quatre correctifs exacts dans une branche dediee :
`fix/tooling-guards-req031`

PR de correction : `#14`
HEAD : `2c65ff00d557b2a05b5942d579d41fcf635a7c59`

Perimetre exact :
- `_redirects`
- `.editorconfig`
- `.vscode/tasks.json`
- `.cursor/rules/help-confort.mdc`

CI GitHub Actions en cours. Ne pas dupliquer ces changements ailleurs. Attendre le resultat de la PR #14.

## REQ-031

Statut canonique : `IN_PROGRESS`.
Si la CI passe, ChatGPT mergera la PR #14 dans `recette`, puis controlera de nouveau les gardes avant cloture.
Si la CI echoue, publier uniquement le diagnostic de l'echec et proposer le correctif minimal sur la meme REQ.

## Suivi global

Les demandes fermees restent fermees et ne doivent pas etre rouvertes sans regression prouvee.

Demandes encore actives :
- REQ-001 securite/paiement prod : WAITING_FLORIAN_GO ;
- REQ-003 grille Chauffage : WAITING_FLORIAN_VISUAL ;
- REQ-004 pictos footer : REWORK_REQUIRED ;
- REQ-006 banniere flottante : WAITING_FLORIAN_VISUAL ;
- REQ-011 routage consultation : TECH_ACCEPTED, reliquat au plan global ;
- REQ-012 gel UX : IN_PROGRESS ;
- REQ-013 HOLD securite prod : WAITING_FLORIAN ;
- REQ-014 replis visuels autres metiers : OPEN_GELE ;
- REQ-015 photos manquantes : WAITING_FLORIAN ;
- REQ-017 module contrats complet Chauffage : OPEN_NEXT_DESIGN ;
- REQ-018 ECS annuel : READY_FOR_DESIGN ;
- REQ-020 cartes deux actions : OPEN, apres gate visuel zones ;
- REQ-022 proposition cible : READY_FOR_FLORIAN_VALIDATION ;
- REQ-023 quatre poles zones : WAITING_FLORIAN_VISUAL ;
- REQ-026 garde coherence zones : bloque par validation REQ-023 ;
- REQ-027 communes-list : WAITING_FLORIAN_BUSINESS_GO ;
- REQ-029 activation outils externes : WAITING_FLORIAN ;
- REQ-030 Figma/Playwright/QA visuelle : READY_FOR_FLORIAN_VALIDATION ;
- REQ-031 outillage garde depot : IN_PROGRESS via PR #14.

## Ordre obligatoire avant production

1. Remettre `recette` au vert avec REQ-031.
2. Valider visuellement les lots encore WAITING_FLORIAN_VISUAL, notamment REQ-023.
3. Apres chaque validation visuelle, creer un checkpoint immuable de la recette validee.
4. Terminer les demandes fonctionnelles encore ouvertes par lots isoles.
5. Rejouer toute la suite, QA visuelle, Lighthouse/SEO si concerne, et controle de rollback.
6. Construire une release depuis `main`, jamais par merge massif de `recette`.
7. La release ne contient que les items valides et prets.
8. Rejouer les tests sur l'etat exact de release.
9. Maintenir HOLD_SECURITY tant que REQ-001/REQ-013 ne sont pas traites ou explicitement acceptes.
10. Aucune mise en production sans GO explicite Florian.
11. Apres GO et deploiement, verifier production : pages, CTA, formulaires sans envoi reel, redirections, sitemap, paiement selon gate, erreurs, rollback disponible.
12. Une demande visible n'est CLOSED qu'apres preuve prod si elle a vocation a etre livree en prod.

## Regle de communication

A chaque nouveau retour, citer les request_id touches, les statuts, le SHA, les preuves, le rollback et la prochaine action.
Ne jamais marquer CLOSED de ta propre initiative.

## Prochaine action Claude

Attendre la CI de la PR #14.
Ne faire aucun autre changement de code en parallele.
Publier un ACK de ce controle et rester en HOLD jusqu'au resultat de la PR #14.