# GO-LIVE CHECKLIST — Release Candidate site Help Confort

> **Doc unique de décision.** Objectif : Florian décide **GO / NO-GO en 10-15 min** sans relire 200 commentaires GitHub.
> Source : issue #9 (5451349606). Tenu à jour à chaque cycle. Branche `recette` uniquement — aucun PROD/main/Stripe LIVE sans GO explicite.
>
> **État courant : `RC_STATUS = NOT_READY`** (bloquants prod ouverts + validations humaines en attente).
> Preview publique unique : **https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app**
> Tip `recette` de référence : voir le dernier commit de la branche. **Aucune RC figée** — celle du
> 07/09 (`2201903d`) est périmée.
>
> **Le HOLD front du 12/09 est levé** : il portait sur le retest de `a7299202` par Florian, et
> plusieurs directives ont demandé et validé des lots front depuis (tunnel v2, en-tête unique,
> campagne entretien, assainissement). Le gel en vigueur porte uniquement sur le bandeau d'accueil :
> `HOME_PROMO_VISUAL_APPROVAL=WAITING_FLORIAN`, aucune refonte tant que Florian n'a pas vu le rendu réel.

---

## A. À VALIDER PAR FLORIAN (humain) — 5 contrôles

Florian ne fait QUE ces 5 blocs. Chacun sur la **preview publique** ci-dessus.

| # | Contrôle | Où | Attendu |
|---|---|---|---|
| **H1** | **HOME** — ordre des blocs + rendu général + CTA principaux | `/` | hero → réassurance → **module « Comment pouvons-nous vous aider ? »** → partenaires → avis → réalisations/actus. 3 CTA + urgence + rappel visibles et cohérents. |
| **H2** | **CATALOGUE / COMMERCE** — rendu launcher + compréhension immédiate des parcours | `/catalogue` | Launcher premium : « Je sais ce qu'il me faut » (catalogue) vs « Aidez-moi » (diagnostic) + Devis + Entretien + Urgence. On comprend où cliquer en < 5 s. |
| **H3** | **PARCOURS CLIENT** — tester **une fois chacun** jusqu'au bout | `/catalogue` | (a) Commander une prestation tarifable → confirmation ; (b) Diagnostic guidé → reco/finalisation ; (c) Devis → confirmation ; (d) Entretien & contrats → confirmation ; (e) Rappel → email/back-office ; (f) Urgence → appel/alternative cohérente. **Aucun cul-de-sac.** |
| **H4** | **MOBILE** — contrôle visuel sur **téléphone réel** | tel réel | Home + catalogue + un formulaire + une confirmation : lisible, cliquable, pas de débordement. |
| **H5** | **CONTENU** — véracité commerciale | site | Téléphone `03 66 10 01 34`, horaires (Lun-Ven 9h-17h / Sam 9h-16h), zones **Saint-Omer / Dunkerque**, réalisations + actus présentes, wording commercial principal correct. |

> Note QA : faire les captures **toolbar Netlify / collaboration fermée** (le bandeau gris = outil externe de Deploy Preview, cf. section C / OVL-1) pour ne pas polluer le jugement visuel.

---

## B. CERTIFIÉ PAR CLAUDE (technique) — Florian ne rejoue pas ces tests

Auto-certification avec preuve (SHA `recette` + test). `PASS` = prouvé ce cycle ou SHA livré ; `PENDING` = travail restant identifié (non bloquant V1 sauf indication).

| # | Item technique | Statut | Preuve |
|---|---|---|---|
| T01 | Console 0 erreur (home) | **PASS** | vérif navigateur ce cycle (`read_console_messages` = vide) |
| T02 | Responsive / overflow horizontal 1440·1024·768·390·375 (home + catalogue) | **PASS** | `8c3a65ae` (RSP-1) + `docScrollW=iw` mesuré 1440/375 ce cycle |
| T03 | Routes 404/500 — 9 routes clés | **PASS** | curl preview : `/`, `/catalogue`, `/nos-prestations`, `/devis-express.html`, `/contrats-entretien.html`, `/plombier-saint-omer.html`, `/mentions-legales.html`, `/sitemap.xml`, `/robots.txt` = **200** |
| T04 | Liens internes + `target=_blank rel` | **PASS** | `c4ecba71`,`ee445b54` (SEC-4), `dbe68255` (QUA-1) |
| T05 | En-têtes sécurité (CSP, HSTS preload, X-Frame SAMEORIGIN, nosniff, Referrer-Policy, Permissions-Policy) | **PASS** | headers preview vérifiés ce cycle |
| T06 | Preview non indexable (isolation SEO) | **PASS** | header preview `x-robots-tag: noindex` ; HTML prod `<meta robots="index,follow">` + canonical apex |
| T07 | E2E automatiques (smoke) + matrice 6 parcours (navigateur + backend) | **PASS** | smoke 16/16 ; `dd6bac25` (E2E-1) 6/6 PASS + backend HTTP 200 (leads test archivés) |
| T08 | Code mort retiré et **classé** | **PASS** | `node scripts/audit/inventaire.mjs --strict` : 0 élément non classé ; chaque élément signalé est expliqué dans `docs/audit/inventaire-classement.json` — | `2e14e04f`,`791416fd`,`95fea5d1`,`62d83216`,`70c5ae7c` (CLN-1) |
| T09 | Hygiène branches (recette/integration only, jamais main) | **PASS** | push `HEAD:recette` + `HEAD:integration/lot1-lot2-vs-prod` uniquement |
| T10 | Aucun secret dans la **source déployée** | **PASS** | source site = 0 secret (SEC-1 `2ab95305` pages PAT/promote 404) |
| T11 | Canonical / host canonique | **PASS (baseline)** | canonical home = `https://depan59-62.fr/` (**non-www apex**). Cohérence redirects/sitemap complète = T15 |
| T12 | Double-clic / idempotence submit | **PENDING** | à certifier : garde anti double-submit sur `submit()` moteur + formulaires rappel |
| T13 | Back / refresh / reprise brouillon | **PASS (partiel)** | `hc_book_v1` + `hc_cart_v1` localStorage (UX-COMMERCE-2) ; reset confirmation corrigé `dd6bac25`. Reprise inter-session à re-certifier (T13b) |
| T14 | Validation **JSON-LD / schema** (échantillon représentatif) | **PENDING** | 5451295186 pt2 : home, 6 métiers, St-Omer/Dunkerque, prestation, réalisation, actu, entretien/devis → `SCHEMA_TESTED`/`SCHEMA_ERRORS` (cycle GEO) |
| T15 | **Sitemap** : classification des URLs hors sitemap (~201 vs 139) | **PENDING** | 5451295186 pt2 : `OUT_OF_SITEMAP_TOTAL/EXPECTED/ANOMALOUS` + liste anomalies (cycle GEO) |
| T16 | Accès aux données (lecture/écriture) | **CORRECTIF PRÊT — voir C (SEC-1)** | dossier complet remis à Florian **hors dépôt** (le dépôt est public) : constat, migration, retour arrière, 22 contrôles en base jetable |
| T17 | Isolation Stripe TEST / LIVE | **BLOQUANT — voir C (SEC-3)** | version durcie prête et testée (14 tests Deno), **non déployée** ; la fonction est en `quarantine` donc aucun redéploiement automatique ne peut remettre l'ancienne |
| T18 | Plan rollback + snapshot | **ÉCRIT** | section E ci-dessous + `docs/deploy/EDGE-FUNCTIONS.md` §5 (déploiement et retour arrière d'une fonction) + retour arrière fourni pour chaque migration en attente. Reste à exécuter le jour du GO (tag de `main` avant tout) |

**Compte : PASS/PARTIAL = 13 · PENDING = 3 (T12 double-clic, T14 JSON-LD, T15 sitemap) · BLOQUANTS = 2 (T16 accès aux données, T17 Stripe) — les deux avec correctif prêt et testé, en attente d'une décision.**

**Nouveau depuis le 23/09** : la suite de non-régression (17 fichiers, 550+ contrôles) tourne à chaque poussée sur `recette` et sur chaque pull request. Avant, elle ne tournait nulle part automatiquement.

---

## C. BLOQUANTS PROD RÉELS

Un item n'est **BLOQUANT PROD** que s'il peut causer : perte de lead/commande · erreur prix/paiement · fuite sécurité/données · page critique cassée · mobile inutilisable · mauvaise identité/téléphone · rollback impossible.
GEO/AEO, SEO fin, cosmétique, perfection visuelle non critique, docs secondaires = **NON bloquants** pour une V1 saine.

| ITEM | STATUT | PREUVE | BLOQUANT PROD | ACTION HUMAINE |
|---|---|---|---|---|
| **SEC-1 — durcissement de l'accès aux données** | READY_PRIVATE | dossier complet remis à Florian **hors dépôt** (le dépôt est public) : constat, migration, retour arrière, 22 contrôles en base jetable | **OUI** | **1)** une action de configuration Supabase de 10 s décrite dans le dossier privé ; **2)** appliquer la migration fournie |
| **SEC-3 — lien de paiement Stripe** | READY, NON DÉPLOYÉ | `HARDENED_index.ts` + `_shared/payment-link.ts` + `handler.test.ts` (14 tests Deno) ; prérequis `_pending_migrations/20260922140000_interventions_montant.sql` | **OUI** | **GO Florian** : couper l'endpoint **OU** déployer la version durcie (montant serveur, TEST/LIVE décidés côté serveur). V1 sans paiement en ligne → couper suffit |
| **SEC-4 — fonctions edge qui écrivent sur GitHub** | QUARANTINED | `docs/security/DECISION-FONCTIONS-GITHUB-2026-09-23.md` ; patch durci + 35 tests Deno ; 7 fonctions retirées du déploiement automatique | NON (plus de redéploiement automatique) | **Décision Florian** : « supprimer » les 5 sans appelant, ou « durcir » |
| **DEP-1 — déploiement des fonctions edge** | **RÉSOLU** le 23/09 | liste blanche `supabase/functions/DEPLOIEMENT.json` + 19 contrôles ; le workflow ne déploie plus tout le dossier | — | aucune |
| **PAY-1 — `create-payment-session` non déployée** | KEEP_PENDING_DEPLOY | appelée par le tunnel ; répond 404 ; le code masque le bloc « Payer en ligne » — aucune erreur visible | NON (dégradation propre) | **Décision Florian** : déployer (7 prérequis dans `docs/deploy/EDGE-FUNCTIONS.md`) ou rester ainsi |
| CBK-1 — email de rappel `notify-lead-v6` | READY_FOR_HUMAN_GATE | `deno check` PASS | NON (le lead s'insère ; email générique dégradé) | **GO deploy edge**, puis un test réel `NE PAS TRAITER` |
| Secret — jeton en clair dans le `.git/config` local | **RÉSOLU** le 23/09 | l'URL de la remote ne contient plus de jeton ; l'authentification passe par `gh` ; accès vérifié après nettoyage | NON (jamais publié) | rotation du jeton côté GitHub, par hygiène |
| Build hook Netlify de production | À TRAITER | son identifiant est public dans le dépôt depuis juin | NON | Netlify → Build hooks → supprimer et recréer |
| OVL-1 — tiroir collaboration Netlify sur la preview | EXTERNAL | absent de `depan59-62.fr` | NON | (option) le désactiver |

**PROD_BLOCKERS = 2** (SEC-1 accès aux données · SEC-3 lien de paiement). Les deux ont leur correctif
prêt et testé ; il ne manque qu'une décision humaine.

---

## D. RELEASE CANDIDATE

- **Condition de figeage** : SEC-3 traité (coupé ou durci-déployé) **ET** SEC-2 certifié/durci **ET** T12/T14/T15 clôturés (ou classés non-bloquants explicitement par Florian).
- Quand vert : figer un SHA **`RC1`** sur `recette` + publier **UNE** URL preview → validation Florian. **Gel des changements** hors bug bloquant pendant sa revue.
- **RC1 (prod) = none** — pas figée : conditionnée aux gates humains (SEC-3 Stripe, SEC-2 RLS, T12/T14/T15).
- **RC-VISUELLE du 07/09 (SHA `2201903d`) : périmée.** Le site a beaucoup changé depuis (tunnel « Ma demande » v2, en-tête unique sur 202 pages, campagne entretien, assainissement, liste blanche de déploiement). Il faudra refiger une RC quand les deux bloquants seront levés. URL de recette inchangée : `https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app`.
- **Non-régression** : depuis le 23/09, la suite (17 fichiers, 550+ contrôles) tourne à chaque poussée sur `recette` et sur chaque pull request (`.github/workflows/tests.yml`). Avant cette date, elle ne tournait nulle part automatiquement.

## E. APRÈS GO FLORIAN (préparation, aucun deploy sans GO)

1. Tag/snapshot de la prod actuelle (`main`) avant tout.
2. Plan rollback : `git revert` RC → redeploy Netlify du SHA précédent (`main` gelé = point de retour).
3. Diff `recette` → `main` (revue des écarts réels).
4. Liste migrations/fonctions edge à appliquer (SEC-2, notify-lead-v6, CMD-6) — chacune = gate séparé.
5. Smoke post-deploy 10 min (routes clés + 1 lead réel `NE PAS TRAITER` + email + back-office).
6. Monitoring formulaires/leads 24 h.

---

## Retour compact
`RC_STATUS=NOT_READY (prod) | RC_SHA=none (la RC du 07/09 est périmée) | PROD_BLOCKERS=2 (SEC-1 accès aux données · SEC-3 lien de paiement, correctifs prêts et testés) | CI_NON_REGRESSION=ON (17 fichiers, 550+ contrôles, à chaque push) | EDGE_DEPLOY=ALLOWLIST | READY_FOR_PROD=NO | MERGE_MAIN=NO | PROD=NO | BACKEND_E2E=WAITING_DOCKER | PREVIEW=https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app`

**GATED_ACTIONS (7)** : (1) action de configuration Supabase du dossier privé ; (2) appliquer la migration d'accès aux données ; (3) couper ou durcir le lien de paiement Stripe ; (4) trancher « supprimer » ou « durcir » les fonctions d'écriture GitHub ; (5) déployer `notify-lead-v6` ; (6) décider du sort de `create-payment-session` ; (7) recréer le build hook Netlify de production.

> Mis à jour le 2026-09-23 (SHA `60881951`). La version précédente datait du 07/09 et citait des artefacts qui n'existent plus (`PROPOSED_index.ts`), un SHA de RC périmé et un compte de bloquants faux.
