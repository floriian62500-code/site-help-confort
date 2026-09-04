# GO-LIVE CHECKLIST — Release Candidate site Help Confort

> **Doc unique de décision.** Objectif : Florian décide **GO / NO-GO en 10-15 min** sans relire 200 commentaires GitHub.
> Source : issue #9 (5451349606). Tenu à jour à chaque cycle. Branche `recette` uniquement — aucun PROD/main/Stripe LIVE sans GO explicite.
>
> **État courant : `RC_STATUS = NOT_READY`** (bloquants prod ouverts + validations humaines en attente).
> Preview publique unique : **https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app**
> Tip `recette` de référence : `f7eeef1b` (2026-08-28). RC figée : **non encore figée**.

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
| T08 | Code mort retiré | **PASS** | `2e14e04f`,`791416fd`,`95fea5d1`,`62d83216`,`70c5ae7c` (CLN-1) |
| T09 | Hygiène branches (recette/integration only, jamais main) | **PASS** | push `HEAD:recette` + `HEAD:integration/lot1-lot2-vs-prod` uniquement |
| T10 | Aucun secret dans la **source déployée** | **PASS** | source site = 0 secret (SEC-1 `2ab95305` pages PAT/promote 404) |
| T11 | Canonical / host canonique | **PASS (baseline)** | canonical home = `https://depan59-62.fr/` (**non-www apex**). Cohérence redirects/sitemap complète = T15 |
| T12 | Double-clic / idempotence submit | **PENDING** | à certifier : garde anti double-submit sur `submit()` moteur + formulaires rappel |
| T13 | Back / refresh / reprise brouillon | **PASS (partiel)** | `hc_book_v1` + `hc_cart_v1` localStorage (UX-COMMERCE-2) ; reset confirmation corrigé `dd6bac25`. Reprise inter-session à re-certifier (T13b) |
| T14 | Validation **JSON-LD / schema** (échantillon représentatif) | **PENDING** | 5451295186 pt2 : home, 6 métiers, St-Omer/Dunkerque, prestation, réalisation, actu, entretien/devis → `SCHEMA_TESTED`/`SCHEMA_ERRORS` (cycle GEO) |
| T15 | **Sitemap** : classification des URLs hors sitemap (~201 vs 139) | **PENDING** | 5451295186 pt2 : `OUT_OF_SITEMAP_TOTAL/EXPECTED/ANOMALOUS` + liste anomalies (cycle GEO) |
| T16 | RLS leads/storage (pas de fuite lecture) | **À CERTIFIER** | SEC-2 : `leads_public_insert` = insert public voulu ; **certifier 0 lecture publique** OU appliquer durcissement proposé (gate DB) |
| T17 | Isolation Stripe TEST / LIVE gelé | **BLOQUANT — voir C** | SEC-3 : endpoint `stripe-create-payment-link` = LIVE public à montant client |
| T18 | Plan rollback + snapshot | **PENDING** | section E (diff recette→main + tag prod avant deploy) |

**Compte : PASS/PARTIAL = 11 · PENDING/À CERTIFIER = 7 (dont 1 bloquant = T17).**

---

## C. BLOQUANTS PROD RÉELS

Un item n'est **BLOQUANT PROD** que s'il peut causer : perte de lead/commande · erreur prix/paiement · fuite sécurité/données · page critique cassée · mobile inutilisable · mauvaise identité/téléphone · rollback impossible.
GEO/AEO, SEO fin, cosmétique, perfection visuelle non critique, docs secondaires = **NON bloquants** pour une V1 saine.

| ITEM | STATUT | PREUVE | SHA | BLOQUANT PROD | ACTION HUMAINE |
|---|---|---|---|---|---|
| **SEC-3 — edge `stripe-create-payment-link` LIVE public à montant client** | BLOCKED_HUMAN | `PROPOSED_index.ts` (durcissement prêt) | — | **OUI** (paiement/sécurité) | **GO Florian** : couper l'endpoint **OU** déployer version durcie (montant serveur). V1 sans paiement en ligne → **couper** suffit. |
| **SEC-2 — RLS `leads_public_insert` + storage `site-photos`** | À CERTIFIER | migrations `PROPOSED` | — | **À CONFIRMER** | Soit je certifie 0 fuite lecture (cycle sécu), soit **GO apply migration** durcissement. |
| CBK-1 — email rappel `notify-lead-v6` non déployé | READY_FOR_HUMAN_GATE | `d099417b`,`a9a73c53` (deno check PASS) | recette | **NON** (le lead s'insère quand même ; email générique dégradé, pas de perte) | **GO deploy edge** après validation ; puis 1 test réel `NE PAS TRAITER` (phrase complète, 1 champ) |
| Garde test-lead ordre-sensible (`nom`+`prénom`) | À CORRIGER (code) | edge `notify/submit` | — | **NON** (risque théorique : prénom/nom inversés notifient l'agence en recette) | fix code préparé (non déployé) → deploy avec CBK-1 |
| OVL-1 — overlay gris preview | EXTERNAL / NO_CODE_FIX | DOM `iframe app.netlify.com/cdp` ; absent prod | — | **NON** (outil Deploy Preview, absent de `depan59-62.fr`) | (option) désactiver le tiroir collaboration Netlify |
| Secret — PAT en clair dans remote git **local** | HYGIÈNE | `.git/config` local (hors site déployé) | — | **NON** (pas dans l'artefact publié) | **Roter le PAT** (recommandé) |

**PROD_BLOCKERS = 2** (1 confirmé T17/SEC-3 ; 1 à confirmer SEC-2).

---

## D. RELEASE CANDIDATE

- **Condition de figeage** : SEC-3 traité (coupé ou durci-déployé) **ET** SEC-2 certifié/durci **ET** T12/T14/T15 clôturés (ou classés non-bloquants explicitement par Florian).
- Quand vert : figer un SHA **`RC1`** sur `recette` + publier **UNE** URL preview → validation Florian. **Gel des changements** hors bug bloquant pendant sa revue.
- **RC1 = none** (pas encore figée).

## E. APRÈS GO FLORIAN (préparation, aucun deploy sans GO)

1. Tag/snapshot de la prod actuelle (`main`) avant tout.
2. Plan rollback : `git revert` RC → redeploy Netlify du SHA précédent (`main` gelé = point de retour).
3. Diff `recette` → `main` (revue des écarts réels).
4. Liste migrations/fonctions edge à appliquer (SEC-2, notify-lead-v6, CMD-6) — chacune = gate séparé.
5. Smoke post-deploy 10 min (routes clés + 1 lead réel `NE PAS TRAITER` + email + back-office).
6. Monitoring formulaires/leads 24 h.

---

## Retour compact
`RC_STATUS=NOT_READY | PROD_BLOCKERS=2 | HUMAN_CHECKS=5 | TECH_CHECKS_PASS=11/18 | GATED_ACTIONS=6 | RC_SHA=none | PREVIEW=https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app`

**GATED_ACTIONS (6)** : (1) SEC-3 couper/durcir Stripe LIVE ; (2) SEC-2 migration RLS ; (3) deploy `notify-lead-v6` ; (4) CMD-6 clé `sk_test_` + deploy ; (5) désactiver tiroir Netlify ; (6) activation runner RUN-1 (secret OAuth + protection main + merge PR #10).
