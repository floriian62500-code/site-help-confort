# ARCHITECTURE & GUIDE MAINTENEUR — Site Help Confort

> Document de reprise pour un développeur humain. Décrit l'architecture réelle, les
> branches, les flux métier, le release flow et où intervenir. Mis à jour 2026-08-21.

## 1. Vue d'ensemble
- **Nature** : site **statique HTML/CSS/JS** (pas de framework, pas de build). ~119 pages HTML à la racine + `prestations/` (pages dédiées) + `realisations/` (pré-rendus).
- **Hébergement** : **Netlify** (projet `remarkable-dragon-364e2b`, plan Pro). Publie depuis la racine (`publish = "."`, `command = ""`).
- **Domaines** : prod = apex `depan59-62.fr` (branche `main`). Recette = Deploy Preview PR #2 (`deploy-preview-2--remarkable-dragon-364e2b.netlify.app`, branche `recette`).
- **Backend** : **Supabase** (`btcbjwqiivhpwoszomhg`) — Postgres + RLS + Edge Functions + Storage. Clé front = **publishable** `sb_publishable_...` (rôle `anon`). ⚠️ l'ancien anon JWT est **désactivé** (ne plus l'utiliser).
- **Paiement** : **Stripe** — clé configurée **LIVE**, aucune clé TEST → **paiement client GELÉ** (voir §7).

## 2. Branches (audit 2026-08-21)
| Branche | Tip | Rôle | Commits uniques | Décision |
|---|---|---|---|---|
| `main` | a8272eb9 | **PROD** (apex) | — | **A CONSERVER — intouchable** |
| `recette` | (courant) | **Travail applicatif** (123∉main) | — | **A CONSERVER — intouchable** |
| `integration/lot1-lot2-vs-prod` | =recette | Miroir de recette (poussé en parallèle) | **0** | A CONSERVER (miroir) ou A ARCHIVER — sans perte |
| `staging` | 6d05c311 | Ancienne branche **WYSIWYG/edit-mode + SEO mode** | **62** (travail réel non mergé) | **A MERGER SÉLECTIVEMENT** — ne PAS supprimer, tag de sauvegarde requis |
| `chore/control-plane-bootstrap` | 6fdde716 | Bootstrap control-plane ChatGPT/Claude | 4 (docs control) | A ARCHIVER (superseded) — tag avant toute suppression |
| `chore/claude-control-runner` | 3a4610ca | Runner **hébergé GitHub Actions** (`.github/workflows/claude-control-plane.yml`) | 1 | A CONSERVER (design runner) |

> `main∉recette` = 20 commits `github-actions[bot]` « rapports nightly [skip ci] » (bénins).
> **Règle** : jamais de suppression de branche sans (a) preuve qu'aucun commit unique utile n'est perdu, (b) tag/SHA de sauvegarde, (c) exclusion de `main`/`recette`.

## 3. Pages, templates & composants
- **Pages métier×ville** : `plombier-*.html`, `chauffagiste-*.html`, `electricien-*.html`, `serrurier-*.html`, `vitrier-*.html`, `volets-*.html`, `menuisier-*.html` (~40). Les **7 landing `-saint-omer`** portent les gros blocs (carrousel marques, engagements, catalogue). Les variantes ville sont plus légères.
- **Pages prestations dédiées** : `prestations/*.html` (~35), reliées depuis les cartes savoir-faire des pages métier.
- **Réalisations** : `realisations/*.html` (25, pré-rendus SEO).
- ⚠️ **Pas de moteur de template runtime** : les pages sont statiques. La « source commune » = les **classes CSS partagées** (souvent inline par page) + les **scripts partagés** (§4). Pour un changement de composant : éditer le CSS/JS partagé, ou appliquer une édition scriptée identique aux pages concernées (voir le compacting « 6 engagements » comme exemple).

## 4. JS/CSS partagés (`assets/`)
| Script | Rôle | Portée |
|---|---|---|
| `hc-widgets.js` | FAB chat/assistant + **CTA unique « Centre de validation »** (recette-only, remplace l'ex-widget OK/KO) | ~toutes pages |
| `hc-review.js` | **Mode revue** du centre de validation (`?review=<id>` → surligne `[data-review-id]` + bandeau OK/À corriger) | pages avec ancre |
| `hc-fournisseurs.js` | **Carrousel marquee** de marques (monté sur `[data-hc-fournisseurs]`) | pages métier |
| `hc-mini-zone.js` | Carte « Notre rayon d'intervention » (monté sur `[data-hc-mini-zone]`) — **retiré des pages métier** (bloc jugé répétitif), conservé ailleurs | 14 pages |
| `hc-chat-widget.js` | Widget chat (Supabase `chat-assistant`) | 111 pages |
| `hc-reserve-modal.js` | Modale réservation — **paiement client gelé** (route vers devis) | 26 pages |
| `hc-leads-capture.js`, `hc-newsletter.js`, `hc-live-stats.js` | Capture lead / newsletter / stats | variable |
| **Orphelins** (0 référence) | `hc-avis.js`, `hc-avis-carousel.js`, `hc-edit-mode.js` (WYSIWYG, vit sur `staging`) | à confirmer/supprimer |

## 5. Netlify (`netlify.toml`, `_redirects`, `_headers`)
- **Ignore rule** (build) : compare `$CACHED_COMMIT_REF..$COMMIT_REF` (dernier déployé → HEAD), skip si tout est dans les paths exclus (docs, scripts, .md, logs…). ⚠️ piège historique : un tip docs-only annulait le build → fix appliqué.
- **CSP** dans `netlify.toml` (`[[headers]]`). connect-src inclut `*.google-analytics.com` (fix beacons GA4). script-src, style-src, img-src, frame-src cadrés.
- **`_redirects`** : `/docs/*`, `/scripts/*`, `/supabase/*` → 404 (anti-exposition) ; `/sitemap.xml` → edge function ; 25 `/realisations/<slug>` pré-rendus ; `/realisation.html` → 301 `/realisations.html`.
- **Sécurité privé** : ⚠️ passer le repo en **PRIVATE casse le build Netlify** (la GitHub App perd l'accès) — prouvé. Ne pas privatiser sans réparer l'accès de l'app Netlify au repo privé (GitHub → Settings → Applications → Netlify → Repository access).

## 6. Supabase
- **Clé front** : publishable (rôle `anon`). Edge functions : `submit-lead-v6`, `notify-lead-v6`, `lead-auto-reply`, `upload-lead-photos`, `stripe-create-payment-link`, `stripe-webhook`, `sitemap`, `chat-assistant`.
- **Catalogue** : vue `v_services_public` / table `services` (28 prestations à prix, 6 sur devis). Chargé côté front (fetch REST, `Cache-Control: no-store`). ⚠️ ne pas ajouter de param `_ts=` (PostgREST le parse comme filtre → 400 ; bug corrigé).
- **RLS** (audit §D) : PII (`leads`, `newsletter_subscribers`) **non lisible** par anon (0 ligne). Tables sensibles (`lead_action_tokens`, `_gh_push_*`…) **verrouillées** (RLS sans policy = deny-all). **Finding P1** : policy `leads_public_insert` autorise l'INSERT anon direct (vecteur spam, contourne l'edge de validation) → migration de durcissement proposée (`supabase/migrations/PROPOSED_20260821_leads_insert_hardening.sql`, **non appliquée**).

## 7. Stripe TEST (paiement gelé)
- Clé configurée = **LIVE** (`sk_live_`), aucune `sk_test_`. **Tout paiement client est GELÉ** : le wizard et `hc-reserve-modal.js` routent vers un **lead/devis** (« Réserver → on vous rappelle »), jamais vers un paiement. Le montant ne provient plus du DOM.
- Pour réactiver : fournir une clé **Stripe TEST**, durcir l'edge `stripe-create-payment-link` (montant serveur + webhook signé + idempotence), puis re-brancher le funnel.

## 8. Formulaires / wizard / leads
- **Wizard Home** (`index.html`) : étape 1 catégorie (dépannage=simple, devis/rappel routent ailleurs) → 2 description+métier → 3 coordonnées → 4 **résultat** : choix prestation (catalogue Supabase) + réservation « Réserver ma prise en charge » (lead). Validation : « Continuer » toujours cliquable, erreurs sous champ + focus/scroll (voir `tryNext`/`refreshNext`).
- **Chemin lead** : via edge `submit-lead` (validation + notifications). Ne pas poster en direct sur `/rest/v1/leads`.

## 9. Centre de validation & release flow
- **`/recette.html`** : seule source de OK / À corriger / commentaire (persistés dans `recette_validation`). Chaque item = `data-review-id` sur sa page + `hc-review.js`. Versionné (`v`) : bumper `v` repasse un item validé en « à revalider ».
- **Release flow (#8, socle)** : lots immuables (`release_id` + base/head SHA + liste de commits), 4 états, promotion **par cherry-pick contrôlé** (jamais tout recette). Migration 4 tables `supabase/migrations/20260820_release_flow.sql` (**non appliquée**). Générateur `scripts/control/build-release-lot.mjs` (exclut docs/control + scripts/control). Voir `docs/RELEASE-FLOW-PROPOSAL.md`.

## 10. Control plane ChatGPT/Claude
- `docs/control/inbox/chatgpt/CP-####-*.md` (instructions) ↔ `docs/control/outbox/claude/*.md` (réponses). `docs/control/runner-status.json` = état du runner. Runner autonome (local launchd / hébergé GitHub Actions) **non actif** (gates : repo privé + coût API). Ces fichiers sont **recette-only** — exclus de toute promotion prod.

## 11. Variables d'environnement attendues (sans secrets)
- **Netlify/Supabase edge** : `STRIPE_SECRET_KEY` (LIVE — gelé), `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement), clés notifications. **Aucun secret privilégié ne doit être dans le front/Git** (vérifié : 0 exposé).
- **Front** : uniquement la clé **publishable** Supabase (publique par design).

## 12. Procédures
- **Dev local** : site statique → ouvrir les `.html` ou servir la racine (`python3 -m http.server`). Pas de build.
- **Tests** : `node scripts/tests/smoke.mjs [baseURL]` — smoke test des parcours critiques (pages 200, catalogue Supabase à prix, anti-régression anon JWT legacy + promesse paiement en ligne). Aucune écriture de données. Défaut = recette Deploy Preview. Pas de suite unitaire formelle (site statique).
- **CI/CD** : pas de pipeline de build applicatif ; le « build » Netlify = publication statique conditionnée par l'`ignore rule` (§5). Runner control-plane = GitHub Actions `.github/workflows/claude-control-plane.yml` (gates : repo privé + coût API).
- **Recette** : pousser sur `recette` → Netlify build le Deploy Preview PR #2. Vérifier sur `deploy-preview-2--…`. Toute modif visible → item dans `/recette.html`.
- **Release/prod** : **jamais** de merge aveugle recette→main. Utiliser le lot de release (cherry-pick des commits validés, hors control-plane), vérifier la PROD réellement, marquer déployé. **GO humain obligatoire.**
- **Ne pas toucher** : `main`, PROD, Stripe LIVE, secrets, données métier.

## 13. Où intervenir (repère rapide)
- **Page métier** : le `.html` correspondant (ex. `plombier-saint-omer.html`) ; composants partagés = `assets/hc-*.js`.
- **Logique métier funnel** : `index.html` (wizard) + edge `submit-lead`.
- **Données** : Supabase (`services`, `leads`, `recette_validation`).
- **Tester** : recette Deploy Preview + centre `/recette.html`.
- **Sécurité** : voir `docs/audits/SECURITY-AUDIT-2026-08.md`.

## 14. Conventions de commit
- Format : `type(scope): résumé` — `type` ∈ {feat, fix, chore, docs, security, test, perf}.
- Scope utile : la zone (`#57`, `#9 T6`, `wizard`, `T8`…). Résumé à l'impératif, en français.
- Corps : cause racine + preuve (SHA, test, mesure). Un commit = un changement atomique et testable.
- `recette` uniquement ; jamais de `--force` ; jamais de secret ni de donnée métier supprimée sans preuve+tag.

## 15. Journal d'audit / assainissement
- **Registre de preuve** : `docs/audit/ASSAINISSEMENT-DEPOT-CHECKLIST.md` (13 sections cochées + SHA).
- **Journal des 15 tâches #9** : `docs/audit/ASSAINISSEMENT-15-TACHES-LOG.md` (statut FAIT/BLOQUÉ + SHA par tâche).
- **Sécurité** : `docs/audits/SECURITY-AUDIT-2026-08.md` (findings + migrations proposées).
- **Release flow** : `docs/RELEASE-FLOW-PROPOSAL.md` + `scripts/control/build-release-lot.mjs`.

## 16. Dette résiduelle & gates
- **Gates DB (GO Florian)** : migrations durcissement `leads` + Storage `site-photos` + release flow 4 tables ; réécriture `/recette.html` (4 états).
- **Gate Stripe** : clé `sk_test_` pour l'achat en ligne réel + durcissement `stripe-create-payment-link` (**P1 : montant client, endpoint LIVE public** — voir SECURITY-AUDIT + `PROPOSED_index.ts`).
- Branche `staging` : 62 commits WYSIWYG à trier (merge sélectif ou archive+tag).
- 18 `images/prestations/*.jpg` candidats orphelins — à confirmer (sources Supabase ?) avant retrait.
- SEO bi-ville (Saint-Omer+Dunkerque simultané) — décision stratégique.
- *(Résolu ce run : `.m-suppliers` CSS, `hc-mini-zone.js`, `images/_backup_png/`, `images/metiers/`, erreurs inline wizard, carte zone partout, blocage pages admin PAT.)*
