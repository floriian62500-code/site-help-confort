# ASSAINISSEMENT TOTAL DU DÉPÔT — CHECKLIST DE PREUVE

Statut : EN COURS. `recette` uniquement. Mise à jour 2026-08-22.
Légende : `[x]` fait+prouvé · `[~]` partiel · `[gate]` bloqué validation humaine · `[ ]` à faire.

## 1. Parcours commercial critique
- [x] Achat/réservation testé E2E sur recette — parcours piloté de bout en bout (`44a320e9`)
- [x] Prix affiché et vérifié — **771 € TTC · tarif catalogue** (Chauffe-eau 100L Atlantic)
- [x] Coordonnées client validées — nom/tél/email/adresse/CP
- [~] Commande/réservation réellement créée — **RÉSERVATION = lead** créé ; commande PAYÉE = non
- [gate] Stripe TEST testé — **aucune clé `sk_test_`** → paiement gelé (voir Gates)
- [x] Confirmation finale — « réservation enregistrée · on vous rappelle · sans paiement en ligne »
- [x] Parcours devis/contact séparé — `devis-travaux` → contact#form, `rappel` → callback (routage étape 1)
- [~] Double clic / retour / refresh / erreur réseau — anti-double-clic présent (`dataset.sending`) ; matrices complètes → §11

## 2. Wizard et formulaires
- [x] Aucun bouton bloqué sans erreur visible — `814a911c` (bouton cliquable + `tryNext`)
- [x] Erreurs inline par champ — step 3 : bordure rouge + message sous champ
- [x] Focus/scroll premier champ invalide — `tryNext` scrollIntoView+focus
- [x] Validation adresse/CP/ville explicite — `cpFrOk`/`villeOk`/`nameOk`, hint « coordonnées complètes »
- [x] Téléphone/email testés — E2E (phoneFrOk/emailOk)
- [ ] Erreurs serveur et réseau traitées — `resaMsg` erreur existe ; matrice E2E → §11
- [ ] Anti-doublon/idempotence — anti-double-clic front ; idempotence serveur → §9

## 3. Pages métiers
- [x] Grande carte de zone supprimée des pages métiers — `2a7494b8` (40 pages, `data-hc-mini-zone` retiré)
- [x] Carte de zone retirée **partout** — `38e6077d` (14 pages manquées : depannage-*/travaux-*) ; `hc-mini-zone.js` désormais orphelin **supprimé** (`2e14e04f`)
- [x] Bloc fournisseurs doublon supprimé — `44771708` (7 pages, section statique `hc-metier-brands`), carrousel `hc-fournisseurs.js` conservé
- [x] Bloc 6 engagements compacté — `458a1928` (7 pages, padding/icônes/gaps réduits) + item centre `2ca85333`
- [x] Pas de répétition avec bandeau réassurance — engagements distincts du bandeau (Certifié/Devis/Techniciens/Standard)
- [x] Templates/composants communs corrigés à la source — éditions CSS communes scriptées (identiques sur les 7)
- [x] CSS/JS/Leaflet inutiles retirés — `.m-suppliers` CSS mort retiré (16 règles × 26 pages, `95fea5d1`) ; `hc-mini-zone.js` orphelin retiré (`2e14e04f`)
- [~] Desktop + mobile testés — valeurs CSS vérifiées ; test visuel 11 gabarits limité (pane viewport)

## 4. Branches (audit complet — ARCHITECTURE.md §2)
- [x] main — PROD apex — **CONSERVER (intouchable)**
- [x] recette — travail (123∉main) — **CONSERVER (intouchable)**
- [x] staging — WYSIWYG+SEO mode, **62 commits uniques** — **MERGER SÉLECTIVEMENT** (tag requis, ne pas supprimer)
- [x] integration/lot1-lot2-vs-prod — miroir recette, **0 commit unique** — CONSERVER/ARCHIVER (aucune perte)
- [x] chore/control-plane-bootstrap — 4 commits control — **ARCHIVER + tag** (main∉recette = 21, tous nightly bot [skip ci])
- [x] chore/claude-control-runner — workflow runner hébergé, **12 commits** — **CONSERVER**
> SHA de sauvegarde = tip courant de chaque branche (aucune suppression effectuée).

## 5. Cartographie architecture — `docs/maintainer/ARCHITECTURE.md` (`fd276717`)
- [x] Arborescence · [x] Pages/templates/composants · [x] JS globaux/spécifiques · [x] CSS
- [x] Netlify · [x] Supabase · [x] Fonctions serverless · [x] Stripe TEST · [x] Leads/commandes
- [x] Centre de validation · [x] CI/CD · [x] Control plane · [x] Variables d'env (sans secrets)
- [x] Procédures locale/test/recette/release/rollback

## 6. Code mort / doublons / orphelins
- [x] Fichiers/assets/JS orphelins recherchés — scan 0-référence
- [x] Supprimés (prouvés) : `hc-avis.js`, `hc-avis-carousel.js` (`2d0c8b0d`, 0 include, 10 faux avis à risque) ; conservé `hc-edit-mode.js` (chargé dynamiquement, faux positif corrigé)
- [x] Anciens systèmes de validation retirés — ex-widget OK/KO + promote-prod (`4b592aff`)
- [x] Anciens mécanismes PROD dangereux — bouton « Promouvoir en prod » + PAT retiré (CP-0015)
- [x] Duplications HTML/JS/CSS recherchées — fournisseurs/zone/engagements mutualisés à la source
- [x] CSS `.m-suppliers` mort retiré — 16 règles × 26 pages (`95fea5d1`), parseur accolades par bloc `<style>`, 0 régression
- [x] `images/_backup_png/` (4.6M, 43 fichiers) retiré (`791416fd`) + tag `savepoint/backup-png-pre-removal`

## 7. Sécurité — `docs/audits/SECURITY-AUDIT-2026-08.md` (`e2d58346`)
- [x] Secrets/tokens/PAT repo — **0 exposé** (grep sk_live/ghp_/service_role)
- [x] Clés privilégiées frontend — aucune (seul publishable, public par design)
- [x] XSS/innerHTML/paramètres URL — scan clean (params URL, review/chat échappés `esc()`)
- [x] Validation/sanitation — client (wizard) + serveur (edge `submit-lead-v6` : sanitize+validation tel/email/CP)
- [x] CORS — edge `submit-lead-v6` : `Access-Control-Allow-Origin:*` **acceptable** (endpoint form public, POST/OPTIONS, sans credentials/cookies) ; pas de wildcard sur ressource authentifiée
- [x] Endpoints publics/permissifs — **P1 : INSERT anon `leads`** (`leads_public_insert` court-circuite la validation/rate-limit/honeypot de l'edge) → migration proposée
- [x] Rate limit/anti-spam — **serveur** : edge rate-limit 5/min/IP + honeypot (`website`/`url_site`) + hygiène leads test ; front anti-double-clic
- [x] Supabase RLS — PII non lisible anon (leads/newsletter 0 ligne) ; tables sensibles verrouillées
- [x] Storage permissions — 5 buckets audités : `lead-photos` **privé** (correct) ; **P1 `site-photos` écriture publique anon** (INSERT/UPDATE/DELETE = défacement/DoS ; front ne fait que lire) → migration `PROPOSED_20260822_storage_site_photos_hardening.sql` (gate) ; `realisations` policies mortes (accent `réalisations`≠id)
- [x] Headers sécurité — HSTS, X-CTO, Referrer, Permissions-Policy, CSP (GA corrigé `c77fa5bd`)
- [ ] Dépendances vulnérables — site statique, pas de package.json applicatif (à confirmer)
- [x] Stripe TEST/LIVE — chemin client **gelé**, impossible LIVE depuis recette (montant DOM neutralisé)
- [x] Prix recalculés serveur si nécessaire — actuellement montant non envoyé (gelé) ; à câbler serveur au dégel

## 8. Données et environnements
- [x] Tests ne polluent pas les vraies données — lead de test `AUDIT_TEST_DELETE_ME` **nettoyé** (§ audit sécu)
- [x] Données recette/prod séparées — recette = Deploy Preview ; control-plane exclu de la promo
- [x] Aucun endpoint recette sur ressources LIVE non voulu — Stripe gelé, pas d'appel LIVE

## 9. Release flow — `docs/RELEASE-FLOW-PROPOSAL.md` + `1d4f0c23`
- [x] Modèle release_id + SHA immuable — proposé (migration 4 tables, non appliquée)
- [x] Modification après validation ⇒ revalidation — règle `v` (bump = à revalider)
- [x] États A TESTER/VALIDÉ RECETTE/PRÊT PROD/DÉPLOYÉ PROD — spécifiés
- [x] Inventaire promotables/exclus — générateur : **71 promotables / 47 exclus**
- [x] Aucun merge aveugle recette→main — promotion par cherry-pick contrôlé
- [x] Aucun token de promotion frontend — bouton promote-prod + PAT **supprimé** (CP-0015)
- [ ] Réécriture `/recette.html` (4 états visibles + EN ATTENTE/EN PROD) — reste (gate DB)

## 10. Front / UX / qualité
- [x] Console JS propre — GA CSP (`c77fa5bd`) + catalogue 400 (`efc0a5db`) corrigés ; reste framing toolbar Netlify (bénin recette)
- [x] 404/500 involontaires — scan liens : 0 cassé réel
- [x] Erreurs réseau gérées — catalogue fallback + resaMsg
- [~] Responsive 320…1920 — 0 débordement réel mesuré (home 320 + métier) ; visuel 11 gabarits limité (pane)
- [x] Pas de débordement horizontal — vérifié (carrousels clippés)
- [x] Alt/H1 — **0/1468 img sans alt**, 1 `<h1>`/page
- [~] LCP/CLS/ressources lourdes — images orphelines lourdes identifiées (§13 perf)
- [x] SEO technique — titres réalisations tronqués corrigés (`a433ed7c`)

## 11. Tests automatisés
- [x] Smoke tests — `scripts/tests/smoke.mjs` (`7806540c`) : 6 pages critiques 200, catalogue 28 prestations à prix, anti-régression anon JWT legacy + promesse paiement en ligne. **8 PASS / a détecté 1 régression réelle** (og:description « Acompte 40% en ligne » résiduel → corrigé même run)
- [~] E2E funnel critique / erreurs formulaire / mobile — funnel piloté manuel fait ; automatisation Playwright headless → reste (gate outillage)
- [x] Nettoyage données TEST — smoke test **n'écrit aucune donnée** (GET only) ; lead test manuel `AUDIT_TEST_DELETE_ME` nettoyé

## 12. Documentation mainteneur — `docs/maintainer/ARCHITECTURE.md`
- [x] Architecture · [x] Arborescence · [x] Politique branches · [x] Règles recette/main
- [x] Modifier page métier · [x] Ajouter prestation (Supabase services) · [x] Supabase/Netlify/Stripe TEST
- [x] Release/rollback · [x] Points sensibles à ne pas casser
- [~] Conventions commits · [~] Lancer tests (site statique — pas de suite formelle)

## 13. Rapport de fin — matrice
Voir §1-12 + `docs/maintainer/ARCHITECTURE.md` (branches+décisions) + `docs/audits/SECURITY-AUDIT-2026-08.md` + `docs/RELEASE-FLOW-PROPOSAL.md` + `docs/AUDIT-MASTER.md`.

### Gates (bloqués validation humaine — non exécutables par Claude)
1. **Stripe TEST** : fournir `sk_test_` → achat en ligne réel + E2E complet (tâches 1/10).
2. **Migrations DB** : durcissement INSERT `leads` + 4 tables release flow (apply = GO Florian) (tâches 9/11).
3. **Netlify privé** : autoriser l'app Netlify sur repo privé avant activation runner autonome.

### Reste à faire (sûr, exécutable)
- §8 sécurité XSS/innerHTML/CORS/Storage · §6 retrait `.m-suppliers` CSS orphelin · §11 smoke/E2E scriptés · §13 perf (recompression images orphelines après confirmation).
