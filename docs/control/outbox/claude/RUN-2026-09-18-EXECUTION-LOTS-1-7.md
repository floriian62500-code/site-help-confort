# RUN 2026-09-18 — Exécution des lots 1 à 7 (demande Florian du 18/09, 13 h)

- run_id: RUN-2026-09-18-execution-lots-1-7
- branch: recette (+ integration/lot1-lot2-vs-prod) — tip `97c898d8` (code), docs à suivre
- preview: https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/ (module `20260918r`, en-tête css `54651f4abb`)
- acks :
  - 5713247831, 5717005198, 5717112366, 5717153299, 5717166232 : exécutés le 18/09. Le fichier du 17/09 les disait « non exécutés », il est annoté.
  - 5718214970 (en-tête) : CLAUDE_ANSWERED, exécuté dans ce run.

## Livraison par lot
| Lot | Commits | Preuve preview (envoi simulé) 1440 + 390 | Preuve serveur (Supabase local isolé, 18/09) |
|---|---|---|---|
| 1. Récapitulatif final | `a17d8989`, `0a95eafe`, `97c898d8` | client prénom + nom, téléphone, email, adresse, prestations et inclus, montant par ligne, total, réserve tarifaire, statut de paiement, « Et maintenant ? », agence Saint-Omer ; emplacement de la référence visible en simulation | PAY_L (récapitulatif relu « payé ») |
| 2. Paiement | `a17d8989`, `151dff29` (libellé « Payer en ligne »), `2b013fe8` (panier mixte) | bouton seulement si tout est à prix ferme ; panier mixte et devis : aucun bouton ; simulation → « Paiement reçu » | PAY_A → PAY_M OK (montant serveur, jeton falsifié refusé, webhook rejoué sans effet, jamais refacturé, LIVE refusé) |
| 3. Notifications | `7fb283db` | — (aucun email en recette) | CYCLE_G : 1 notification interne, rappel sans effet ; client jamais en copie |
| 4. Coordonnées | `4bb7cfb5`, `d7b6ab78`, `0de3a73a` | aucun champ redemandé, récapitulatif + « Modifier », prénom et nom séparés | — |
| 5. Intention / abandon / CRM | `179b5892` | — | CYCLE_A → F OK ; Apogée : BLOCKED (aucun accès API) |
| 6. En-tête | `dd512af4` | 6 pages × 4 largeurs identiques à l'accueil | — (local : 198 pages × 4 largeurs identiques) |
| 7. Confidentialité | `143414d5` (après `fb1d302f`) | nouvelle demande vide, reprise explicite seulement | — |

Documents : `docs/release/HEADER-UNIQUE-2026-09-18.md`, `docs/release/PAIEMENT-TEST-2026-09-18.md`, `docs/release/CYCLE-LEAD-2026-09-18.md`, `docs/release/AGENT-QA-MODULE-V2-2026-09-17.md`.

## Tests
en-tête 15/15 · demande-v2 148/148 · lead-cycle 67/67 · price-gate 29/29 · panier 12/12 · SEO ERRORS=0 · E2E local complet PASS (run 15).

## Limites (vérité)
- Le comportement serveur (paiement, notifications, doublons, abandon) est prouvé sur la pile Supabase **locale isolée**, pas sur la preview. La preview est en envoi simulé et **les fonctions ne sont pas déployées** (gate).
- Stripe TEST : BLOCKED faute de clé `sk_test_` ; aucun Stripe LIVE.
- Apogée CRM : BLOCKED (aucun accès API ni identifiants) ; mapping et file d'attente prêts, aucun faux succès.

## Gates / needs_florian
needs_florian: true
1. GO déploiement des fonctions serveur + clés Stripe TEST (procédure `docs/release/PAIEMENT-TEST-2026-09-18.md`). Sans ce déploiement, la production garde l'ancien comportement.
2. Jeton GitHub du dépôt site invalide : le démon d'auto-push ne pousse plus rien depuis 12 h 17 (configuration persistante, geste humain).
3. Hors périmètre, constaté : contenu qui déborde (a-propos en 1024, 15 pages métier en 768), bandeau cookies qui couvre le bas du tunnel sur mobile.

Discipline : RECETTE uniquement, aucun main, aucune PROD, aucun Stripe LIVE, aucun lead réel créé.
