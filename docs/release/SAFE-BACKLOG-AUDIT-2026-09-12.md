# Backlog SAFE — Audit consolidé (2026-09-12, directive 5645034544)

> HOLD front `a7299202` maintenu. Ce document = résultats des lots SAFE/non-visuels (A–L).
> Aucune écriture PROD, aucun Stripe LIVE, aucune migration, aucun nouveau tag RC, aucun rendu de page modifié.
> Convention sévérité : P0 (bloquant prod) · P1 (grave) · P2 · P3/INFO.

## Synthèse par lot
| Lot | Sujet | État | Livrable |
|---|---|---|---|
| A | E2E isolé / Docker | **BLOCKED_HUMAN_DOCKER** | runbook `docs/release/E2E-LOCAL-RUNBOOK.md`, guard fail-closed rejoué PASS |
| B | Tests non-régression | **DONE** | `scripts/tests/price-gate.test.mjs` (18/18) + cart 12/12 |
| C | Sécurité frontend | **DONE (audit)** | 0 P0/P1, 1 P2 (CDN), P3 défense-en-profondeur — voir §C |
| D | Backend/API static | **DONE (audit)** | carte endpoints + findings — voir §D |
| E | Stripe séparation | **DONE (audit)** | P1 endpoint LIVE public (gate) — voir §E |
| F | Contrats/photos | **DONE (audit)** | via §D (submit-lead-v6 + upload-lead-photos) |
| G | Performance | **PARTIEL** | ~21 Mo orphelins **supprimés** ; mascotte/défer **documentés** — §G |
| H | Accessibilité | **DONE (audit)** | 2 modals sans focus-trap (staged) — §H |
| I | SEO/GEO guardrails | **DONE** | garde `AGENCE_DUNKERQUE_LABEL` (7 pages) ; ERRORS=0 ; sitemap OK (edge) |
| J | Tracking/acquisition | **DONE (doc)** | `docs/marketing/TRACKING-ACQUISITION-READINESS.md` (GA4 actif) |
| K | Release/rollback/blockers | **DONE** | inventaire BLOCKED_HUMAN ci-dessous |
| L | Cohérence/dette | **DONE** | orphelins purgés ; REMAINING_EXECUTABLE ci-dessous |

---

## §C — Sécurité frontend (0 P0, 0 P1, 1 P2)
- **Aucun** XSS exploitable prouvé, **aucun** secret privilégié en dur, **aucun** open-redirect, **0** `target=_blank` sans `noopener` (403 liens OK). `esc()`/`escapeHtml()` appliqué partout. Fichiers gelés (catalogue/index) = **0 finding actionnable**.
- **P2 (HUMAN_GATED)** : `@supabase/supabase-js@2` chargé depuis `cdn.jsdelivr.net` en **version flottante + sans SRI** sur ~10 pages → compromission CDN = fort impact. Fix = pin exact + `integrity` (peut changer le comportement → gate).
- **P3 défense-en-profondeur (STAGED, non-visuel)** : whitelist de protocole sur `href/src` construits (`hc-avis-live.js:109`, `partenaire.html:151`, `fournisseur.html:248`) ; échapper 2 sinks attribut BAN/réalisation (`realisation.html:282-289`, `hc-form-autocomplete.js:122`) ; SRI sur Leaflet dynamique (`hc-map-zones.js:113`). Données admin/API-gouv, non arbitraires.
- **P3 produit** : PII prefill en `sessionStorage['hc_lead_v1']` (24h TTL, ok) ; transcript chat en `localStorage['hc_chat_history']` **sans TTL** (`hc-widgets.js:543`) → décision rétention.
- **INFO** : CSP (`netlify.toml:42`) solide mais `script-src 'unsafe-inline' 'unsafe-eval'` → l'échappement JS reste la seule défense XSS. Durcir = gros refactor (gate).

## §D/E/F — Backend / Stripe / contrats-photos
- **P1 CRITIQUE (HUMAN_GATED)** — `stripe-create-payment-link` **déployé** fait confiance à `amount_eur` **client**, `verify_jwt:false`, clé `sk_live_` → n'importe qui (clé publishable) peut générer un **paiement LIVE à montant arbitraire**. Le gel *front* ne protège **pas** l'endpoint. Version durcie `PROPOSED_index.ts` (prix serveur via `slug`, secret `X-HC-Payment-Secret`, idempotence) **non déployée**. recette & prod = **même projet Supabase** → même clé LIVE (pas de séparation TEST, fail-open).
  - **Mitigation intérimaire (ton GO)** : l'UI publique n'appelle plus cet endpoint → le **désactiver** en attendant : `app_settings.stripe.configured=false` (le code durci échoue fermé) **ou** `supabase functions delete stripe-create-payment-link --project-ref btcbjwqiivhpwoszomhg`.
- **P2 (HUMAN_GATED)** — `nos-prestations.html:1751-1829` calcule `price_ttc`/`deposit`/`VAT` **côté client** et les insère directement dans `service_orders` (clé anon) → falsifiable. Impact limité (aucun paiement en ligne réel). Fix = edge de recalcul serveur + RLS anti-insert anon.
- **P3 (STAGED, non-visuel)** — `nos-prestations.html:1842` appelle l'**ancien** `notify-lead` sans `lead_id` (→ 400, agence jamais notifiée) ; `assets/hc-reserve-modal.js:86-104` `createStripePayment()` **mort** (jamais appelé) + clé publishable en dur → suppression sûre.
- **Bon point** : le tunnel catalogue n'envoie **aucun prix** au backend (`hc-cart.js.serverPayload` = ids+qty, test #10) ; honeypot + sanitation présents dans `submit-lead-v6`.
- **INFO** — anti-spam `submit-lead-v6` = `Map` en mémoire (poreux multi-instance), pas d'idempotency-key ; CORS `*` sur les fonctions publiques ; sources edge manquantes du repo (`realisations-json`, `communes-list`, `lead-auto-reply`, `lead-action`, `hc-content-save`, `gh-*`) → à versionner pour audit (surtout `gh-*` qui prend un token GitHub en body).

## §G — Performance
- **FAIT (non-visuel)** : ~21 Mo d'orphelins **0-ref supprimés** (hero-metier.mp4 15 Mo, index-reservation.css, Gemini png 2.1 Mo, .bak 204K, 12 *.tmp.png, locks) — commit `a47ea855`.
- **STAGED / DOCUMENT_ONLY (touche le rendu → gel)** : `images/mascotte.png` 604K servi **eager** au-dessus de la ligne de flottaison sur ~30 pages villes alors qu'un **webp 85K existe** (`images/mascotte.webp`) = plus gros gain user réel ; hero `-720p` 6.2 Mo se télécharge en autoplay (index gelé) ; 7 images Unsplash hotlinkées (`nos-prestations.html`) ; ajouter `defer` à 2 `<script>` (`index.html:1344,1435`). Images `prestations/` **non supprimées** (servies dynamiquement par l'edge `realisations-json`).

## §H — Accessibilité (technique, non-visuel)
- **STAGED (non-visuel)** : `assets/hc-reserve-modal.js:19` modale sans `role="dialog"` ni focus-trap (26 pages) ; `assets/hc-widgets.js:286,616` chat/estimateur sans `Escape` ni focus-trap (site-wide). Correctifs comportementaux sans impact visuel — **différés** (assets chargés par pages en QA).
- **BON** : price gate `#priceGate` + `#s-devis` (catalogue) = `role=dialog`+`aria-modal`+`aria-labelledby`+Escape+focus mgmt **corrects** ; **0** `<img>` sans `alt`.

## §L — Cohérence / dette
- **FAIT** : orphelins/junk purgés (voir §G) ; `.gitignore` durci.
- **À ARBITRER (HUMAN)** : `assets/hc-reserve-modal.js` = **moteur de réservation parallèle** au price-gate sur 26 pages tarifs/villes → confirmer que c'est **voulu** (ces pages SEO affichent des prix publics, hors tunnel) et qu'il ne peut pas contourner les règles du tunnel. `recette.html` (page QA) orpheline mais **publiquement atteignable/crawlable** (absente de robots) → recommandé : `Disallow: /recette.html` (non-visuel) ou ne pas déployer.
- **P3 STAGED** : 3 `console.log` shippés (`nos-prestations.html:1105,1226,1269`) + `hc-avis-live.js:16`.
- **CLEAN** : aucun TODO/FIXME/debugger réel ; `#hc-reservation` = wizard home **vivant** (pas l'ancien bloc retiré) ; hc-cart/priceGate **confinés** à catalogue.html (pas de fuite cross-page).

---

## §K — Inventaire BLOCKED_HUMAN (action exacte)
| # | Item | Sévérité | Action humaine exacte |
|---|---|---|---|
| 1 | Stripe LIVE endpoint public à montant client | **P1** | Désactiver : `app_settings.stripe.configured=false` **ou** `supabase functions delete stripe-create-payment-link --project-ref btcbjwqiivhpwoszomhg`. Puis (permanent) déployer `PROPOSED_index.ts` avec clé **TEST** + secret `HC_PAYMENT_SECRET`. |
| 2 | E2E isolé | — | Ouvrir Docker Desktop → `bash scripts/test/start-e2e-local.sh` (fail-closed, 0 PROD). |
| 3 | `service_orders` prix client | P2 | Edge de recalcul serveur + migration RLS (retirer INSERT anon). |
| 4 | RLS leads/storage (SEC-2) | À CERTIFIER | Certifier 0 lecture publique **ou** appliquer migration durcissement (`supabase db push`). |
| 5 | supabase-js CDN pin+SRI | P2 | Pinner version exacte + `integrity` sur ~10 pages (revue rendu). |
| 6 | notify-lead-v6 deploy (CBK-1) | — | `supabase functions deploy notify-lead-v6` + 1 test réel `NE PAS TRAITER`. |
| 7 | Sources edge manquantes | INFO | Versionner `realisations-json`, `communes-list`, `lead-auto-reply`, `lead-action`, `hc-content-save`, `gh-*`. |
| 8 | Libellé « Agence Dunkerque » (7 pages) | P2 single-agency | **Arbitrage** : remplacer par « Agence Saint-Omer » / « Zone Dunkerquois » (texte **visible** → gel). Détecté en WARNING par le garde-fou. |
| 9 | Rotation PAT | HYGIÈNE | Roter le PAT (hors artefact publié). |

## §STAGED_SAFE_FIXES (prêts, non-visuels, appliqués seulement sur ton GO post-QA)
Aucun appliqué pendant le gel visuel (assets chargés par les pages en QA). Prêts : suppression `createStripePayment` mort ; repoint/retrait `notify-lead` cassé ; whitelist protocole `href/src` (avis/partenaire/fournisseur) ; SRI Leaflet ; `defer` 2 scripts index ; focus-trap/Escape sur `hc-reserve-modal`/`hc-widgets` ; retrait `console.log` shippés ; `Disallow: /recette.html`.

## §REMAINING_EXECUTABLE (sans nouveau gate, hors gel visuel)
1. Étendre le harnais E2E (J3c échec photo, J4b contrat, X1 double-submit, X2 réseau) — **exécutable seulement Docker up**.
2. Appliquer les STAGED_SAFE_FIXES ci-dessus — **nécessite le déblocage du gel visuel** (post-retest Florian) car ils touchent des pages/assets en QA.
3. Versionner les sources edge manquantes — **nécessite l'accès au déployé** (décision Florian).

> Tout le reste est **HUMAN_GATED** (Docker, Stripe, migrations DB, budgets Ads, arbitrage texte visible). Aucun item SAFE non-visuel exécutable ne reste sans l'un de ces déblocages.
