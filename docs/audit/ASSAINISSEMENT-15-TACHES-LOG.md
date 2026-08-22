# Journal d'exécution — 15 tâches issue #9

> Exécution séquentielle. Une tâche = analyse → correction → test → commit → push recette → SHA.
> Statut : ✅ FAIT / ⛔ BLOQUÉE (validation humaine) / 🔄 EN COURS.
> `recette` uniquement. Aucun main, aucune PROD, aucun Stripe LIVE. Mise à jour 2026-08-22.

---

## ✅ TÂCHE 1 — P0 achat/réservation E2E — **FAIT**

**Test E2E réel piloté sur la recette live** (`deploy-preview-2--…`), funnel complet :
1. Étape 1 — catégorie « 🚨 Urgence · Prise en charge rapide » (parcours tarifé simple).
2. Étape 2 — métier **Plomberie** coché + description « Fuite sous l'évier, urgent ».
3. Étape 3 — coordonnées : Test / Recette / 0612345678 / test-recette-e2e@example.fr / 12 rue de Dunkerque / Saint-Omer / 62500 / maison.
4. Étape 4 — **résultat catalogue réel** : prestation auto-suggérée **« 💧 Chauffe-eau 100L mural Atlantic — 771 € TTC »** ; catalogue complet avec prix (837 €, 907 €, 1214 €, 1333 €, 242 €, contrat 220 €).

**Réservation réellement créée (preuve base)** : clic `#resa-pay` → lead inséré en base
`id=4797d9e5-…`, `source=home_wizard_reservation_rappel`, `metier=Plomberie` (vérifié en SQL, **puis supprimé** — nettoyage donnée test TÂCHE 14).

**Verdict — peut-on acheter/payer en ligne aujourd'hui ? NON, par gel délibéré (sûr).**
- CTA final = « 📅 Réserver ma prise en charge · **Sans paiement en ligne · on vous rappelle pour finaliser** ».
- `window.createStripePayment` = **undefined** (aucune fonction de paiement chargée).
- **Cause racine prouvée** : `index.html:2504` — un `return;` **arrête le handler juste après l'enregistrement du lead**. Tout le bloc Stripe (`STRIPE_LINKS`, `stripe-create-payment-link` avec montant DOM) aux lignes **2505-2572 est du code MORT inatteignable** (gel HC-FIX A08 : l'ancien code envoyait un montant client manipulable = exploit 1 €).
- **Ce n'est pas une régression** : c'est le gel voulu. Le parcours réservation=lead fonctionne de bout en bout.

**Anomalie annexe corrigée pendant l'audit** : promesse « Acompte 40 % en ligne » résiduelle dans l'`og:description` de `nos-prestations.html` (incohérente avec le gel) → retirée (`a74c9ec3`), détectée par le smoke test.

**Faux positif écarté** : le blocage initial « étape 3 » venait d'une **donnée test invalide** (nom « RECETTE E2E » contient le chiffre 2, rejeté par l'anti-fausses-données `nameOk` — **bonne feature**), pas d'un bug. Avec un nom valide, l'étape passe.

⛔ **Sous-point BLOQUÉ (gate humain)** : *achat en ligne réel + Stripe TEST*. Nécessite une clé `sk_test_` + durcissement serveur de `stripe-create-payment-link` (montant serveur + webhook signé + idempotence) avant de retirer le `return;` 2504. Voir TÂCHE 10.

**SHA E2E / preuves** : parcours live + `a74c9ec3` (honnêteté) + `7806540c` (smoke test anti-régression).

---

## ✅ TÂCHE 2 — P0 wizard/formulaires — **FAIT (bug corrigé)**

**Anomalie réelle trouvée et corrigée** : les **erreurs inline par champ ne s'affichaient JAMAIS**.
- Cause racine : `nameOk/phoneFrOk/emailOk/cpFrOk/villeOk` étaient définies **localement dans `canGoNext()`** (bloc `if(current===3)`), mais `refreshNext()` les appelait **hors scope** → `ReferenceError` **avalé par son `try/catch`** (index.html:1707) → aucune bordure rouge ni message.
- Fix (`c6f2d349`) : **hoist** des 5 validateurs au scope partagé, avant `canGoNext`. Copies internes intactes (aucune régression canGoNext). Validateurs re-testés 11/11 (node).

**Preuve live sur recette (après déploiement)** — étape 3, champs invalides non vides :
| Champ | Valeur | Résultat |
|---|---|---|
| Prénom | `A1` | bordure `rgb(220,38,38)` + « ⚠️ Prénom invalide (lettres uniquement, ≥2…) » |
| Téléphone | `12` | bordure rouge + « ⚠️ Téléphone FR invalide (ex: 06 12 34 56 78) » |
| Email | `pasunemail` | bordure rouge + « ⚠️ Email invalide (format vous@domaine.fr) » |

**Autres exigences TÂCHE 2 vérifiées en live** :
- ✅ « Continuer » **jamais bloqué en silence** (`tryNext` : bouton cliquable même invalide ; `btnClickableWhenInvalid=true`).
- ✅ **Focus/scroll premier champ invalide** (`focusedField=resa-prenom` après clic).
- ✅ **Validation adresse/CP/ville** : ville+CP alimentés par sélection **BAN** (autocomplete adresse) ; hint « Renseignez vos coordonnées complètes ».
- ✅ **Retour arrière** : bouton « ← Retour » → étape précédente, **données conservées**.
- ✅ **Double-clic** : `dataset.sending` anti-double-clic (handler `resa-pay`/`resa-send-complex`).
- ✅ **Erreur réseau** : `resaMsg(false, resaErrorText(res))` reste sur la page + message précis (pas de navigation).
- ✅ **Anti-fausses-données** : `nameOk` rejette chiffres/symboles/répétitions/sans-voyelle (feature voulue).

**SHA** : `c6f2d349`.

---

## ✅ TÂCHE 3 — Pages métiers : nettoyage UX — **FAIT (complété)**

**Anomalie réelle trouvée et corrigée** : la grande carte de zone n'avait PAS été retirée
« partout » — le commit initial `2a7494b8` (40 pages) avait **sauté les familles `depannage-*`
et `travaux-*`**. Retrait complété ce run (`38e6077d`, 14 pages) → **0 page ne monte plus la carte**.

| Élément | État | Preuve |
|---|---|---|
| Grande carte de zone (`data-hc-mini-zone`) | ✅ retirée **partout** | 0 mount sur tout le repo (grep) ; `38e6077d` (travaux-saint-omer + travaux-dunkerque + 12 depannage-*) |
| Bloc fournisseurs doublon (`hc-metier-brands`) | ✅ retiré | 0 sur les 7 pages métier (grep) ; `44771708` |
| Bloc « 6 engagements » | ✅ compacté | CSS `.m-pourquoi`/`mpq-` réduit présent (31-37 refs) ; `458a1928` |
| Overflow horizontal mobile (dépannage 375) | ✅ aucun | `documentElement.scrollWidth == viewport` ; carte zone absente (0 rendu) |

**Note** : le script `hc-mini-zone.js` reste inclus (mais monté nulle part) sur **54 pages** →
**orphelin dead-include**, traité en TÂCHE 6. Responsive complet 320→1920 = TÂCHE 12.

**SHA** : `38e6077d`.

---

## ✅ TÂCHE 4 — Cartographie complète du dépôt — **FAIT**

- Doc de cartographie **déplacé au chemin exact demandé** : `docs/ARCHITECTURE.md` → **`docs/maintainer/ARCHITECTURE.md`** (git mv, références .md mises à jour).
- Contenu couvre : arborescence, pages/templates/composants, JS/CSS partagés, Netlify (`netlify.toml`, `_redirects`, `_headers`, ignore rule), Supabase (edge functions, catalogue, RLS), Stripe TEST (gel), leads/wizard, centre de validation, release flow, control plane, variables d'env (sans secret), procédures locale/test/recette/release/rollback, « où intervenir », dette résiduelle.
- Complété ce run : section **Tests** (`scripts/tests/smoke.mjs`) + **CI/CD** (build Netlify conditionnel + runner GitHub Actions).

**SHA** : voir commit de déplacement ci-dessous.

---

## ✅ TÂCHE 5 — Audit branches — **FAIT (re-vérifié 2026-08-22)**

| Branche | Tip | ∉ recette | Rôle | Décision |
|---|---|---|---|---|
| `main` | `970375e8` | 21 | PROD apex | **CONSERVER (intouchable)** — les 21 commits ∉ recette sont **tous** des `chore(audits): rapports nightly [skip ci]` (bot) + 1 merge PR#1 = bénins |
| `recette` | `32e50b15` | — | Travail applicatif | **CONSERVER (intouchable)** — 148 commits ∉ main = travaux en attente de promotion (gate release) |
| `staging` | `6d05c311` | 62 | WYSIWYG/edit-mode + SEO | **MERGER SÉLECTIVEMENT** — tag de sauvegarde requis, ne PAS supprimer |
| `integration/lot1-lot2-vs-prod` | `32e50b15` | 0 | Miroir de recette | **CONSERVER/ARCHIVER** — 0 commit unique, aucune perte |
| `chore/control-plane-bootstrap` | `6fdde716` | 4 | Bootstrap control-plane | **ARCHIVER + tag** |
| `chore/claude-control-runner` | `3a4610ca` | 12 | Runner GitHub Actions | **CONSERVER** (design runner) |

**Décisions & preuves** :
- **Aucune branche supprimée** (règle #9 : pas de suppression sans preuve d'absence de perte + tag). `integration` = miroir voulu (0 unique) ; toutes les autres portent des commits uniques.
- **SHA de sauvegarde** = tip courant de chaque branche (ci-dessus).
- **Constat** : `main` **n'est pas figée** — un cron nightly y committe des rapports `[skip ci]` (docs-only → ne déclenchent pas de déploiement). La vraie divergence applicative = 148 commits recette non promus (gate release flow, GO humain).

**SHA** : voir commit de log.

---

## ✅ TÂCHE 6 — Code mort / fichiers orphelins — **FAIT (3 lots atomiques)**

**Lot A — composant carte-zone mort** (`2e14e04f`) : après retrait des mounts (T3),
`hc-mini-zone.js` était monté nulle part (unique trigger `querySelectorAll('[data-hc-mini-zone]')`
= 0 élément). Supprimé : `assets/hc-mini-zone.js` (110 l) + **54 includes `<script>`**. 0 référence résiduelle.

**Lot B — backups** (`791416fd`) : `images/_backup_png/` (**4.6M, 43 fichiers**) référencés nulle part
(grep html/css/js = 0) + déjà exclus du build. **Tag de sauvegarde `savepoint/backup-png-pre-removal`
poussé** avant retrait (récup triviale). Supprimé réellement (git history conserve).

**Lot C — CSS mort `.m-suppliers`** (`95fea5d1`) : **16 règles × 26 pages** (773 suppressions).
0 usage HTML de la classe, 0 rendu. Retrait par **parseur conscient des accolades, par bloc `<style>`**
(jamais de traversée de balise — une 1re version naïve corrompait `<style>`, prouvé et rejeté).
Garde-fous vérifiés/fichier : `<style>` préservées, accolades équilibrées, 0 règle restante,
classes voisines intactes (`.m-modal`/`.m-supp-logo-img`/`.m-pourquoi`/`.m-hero`). Inclut le compound
mort `.m-suppliers-intro.made-in` (made-in : 0 HTML, aucune règle standalone).

**Tests** : smoke **9/9 PASS** après déploiement ; carrousel fournisseurs **réel** (`data-hc-fournisseurs`
+ `hc-fournisseurs.js`) intact — seul le mort a été retiré.

**Scan assets/*.js** : aucun autre JS orphelin (seul `hc-edit-mode.js` html=0 = chargé dynamiquement
par `hc-widgets.js`, faux positif connu → conservé).

**Reste mineur** : `scripts/tmp/plomberie-body.html` (scratch suivi, hors build) — candidat nettoyage annexe.

**SHA** : `2e14e04f`, `791416fd`, `95fea5d1`.

---

## ✅ TÂCHE 7 — Doublons et mutualisation — **ANALYSÉE (mutualisation dynamique OK ; extraction inline = recommandation chiffrée)**

**Déjà mutualisé (composants dynamiques)** — aucune logique copiée, tout via `assets/hc-*.js` :
`hc-chat-widget.js` (111 pages), `hc-tracking.js` (113), `hc-a11y-fixes.js` (114),
`hc-sticky-cta.js` (104), `hc-fournisseurs.js` (56), `hc-engagements.js` (53), etc.
Les blocs fournisseurs/zone/engagements sont montés par attribut `data-hc-*` (source unique).

**Duplication résiduelle mesurée (inline, pages métier×ville)** :
| Type | Blocs | Pages/ bloc | Taille |
|---|---|---|---|
| CSS `<style>` inline | 4 blocs identiques | 22–25 pages | ~65 Ko CSS/page cumulés |
| JS `<script>` inline | 2–3 blocs identiques | 22–25 pages | ~3.4–4.0 Ko/bloc |

**Décision (conforme T7 « centraliser uniquement si ça réduit la duplication ET le risque » + règle no-big-bang)** :
l'extraction de ces blocs vers des fichiers `.css`/`.js` **cachés** réduirait nettement la duplication et le
poids, MAIS c'est un refactor sur **~25 pages live** dont je **ne peux pas prouver l'absence de régression
visuelle** dans cet environnement (screenshots du pane blancs). Exécuter à l'aveugle **augmenterait** le risque.
→ **Recommandé** en session avec QA visuelle (strangler : 1 bloc → 1 fichier caché → vérif 25 pages → suivant).
Gain estimé : −~65 Ko HTML/page + cache mutualisé. **Non exécuté à l'aveugle (choix de sûreté).**

**Statut** : dynamique mutualisé = FAIT ; extraction inline = **recommandation documentée** (QA visuelle requise).

---

## ✅ TÂCHE 8 — Sécurité frontend — **FAIT (finding corrigé)**

| Contrôle | Résultat |
|---|---|
| Secrets/PAT en clair dans le front | **0** (grep sk_live/sk_test/ghp_/service_role = aucun hardcodé) |
| **Pages admin PAT/promote-to-prod publiques** | **P1 CORRIGÉ** — `admin-pro/valider-staging.html` (PAT + `promote-to-prod`) et `admin-pro/photos.html` (PAT) étaient **HTTP 200 sans auth** → bloquées 404 via `_redirects` (`2ab95305`). Vérifié : 404/404 ; témoin `analytics.html`=200 |
| Open redirect | **Aucun** — seuls `location.href='contact.html?...'` (cible fixe, pas d'input) |
| XSS reflété (innerHTML ← param URL) | **Aucun** |
| PII en URL | **Non** — funnel met la PII en `localStorage` (`hc_lead_v1`), URL ne reçoit que `presta`/`action` (et ce code est post-`return` 2504 = mort) |

**SHA** : `2ab95305`.

## ✅ TÂCHE 9 — Sécurité backend/API/Supabase — **FAIT (2 findings P1, migrations = gate)**

| Contrôle | Résultat |
|---|---|
| Validation/sanitation serveur | ✅ edge `submit-lead-v6` : sanitize + validation tel/email/CP + contrats par `form_type` |
| CORS | ✅ `Access-Control-Allow-Origin:*` acceptable (endpoint form public, POST/OPTIONS, sans credentials) |
| Rate limit / anti-spam | ✅ **serveur** : 5 req/min/IP + honeypot (`website`/`url_site`) + hygiène leads test |
| RLS / PII | ✅ `leads`/`newsletter` non lisibles anon (0 ligne) ; tables sensibles verrouillées (deny-all) |
| **Endpoint public permissif** | **P1** : `leads_public_insert` permet l'INSERT anon direct (court-circuite l'edge) → migration `PROPOSED_20260821_leads_insert_hardening.sql` **(gate DB)** |
| **Storage** | **P1** : bucket public `site-photos` autorise **INSERT/UPDATE/DELETE anon** (défacement/DoS ; front ne fait que lire) → migration `PROPOSED_20260822_storage_site_photos_hardening.sql` **(gate DB)** ; `lead-photos` privé (OK) ; `realisations` policies mortes (accent) |
| Clés privilégiées frontend | ✅ **aucune** (seule la clé publishable, publique par design ; service_role côté serveur uniquement) |
| Idempotence/double soumission | anti-double-clic front ; idempotence serveur = à évaluer au dégel Stripe |

⛔ **Sous-points BLOQUÉS (gate DB, GO Florian)** : appliquer les 2 migrations de durcissement (leads INSERT + storage site-photos). Non appliquées (aucune action prod sans GO).

**SHA** : findings documentés dans `docs/audits/SECURITY-AUDIT-2026-08.md` (`f771c259` + ce run).

---

## ⚠️ TÂCHE 10 — Stripe et séparation TEST/PROD — **FAIT (audit) + 1 finding P1 CRITIQUE (gate)**

**Côté frontend (site) — sain** :
- **0 clé Stripe** dans le front (grep pk_live/pk_test/sk_* = 0).
- `STRIPE_LINKS` **vide** (aucun lien LIVE configuré).
- **Gel** : `index.html:2503 return;` s'exécute avant tout appel Stripe → le site ne peut PAS déclencher de paiement. `createStripePayment` undefined (confirmé E2E T1). Montant DOM non envoyé.

**🔴 Côté edge — finding P1 CRITIQUE** :
- `stripe-create-payment-link` : `verify_jwt: false`, **montant `amount_eur` fourni par le client** (validé seulement `≥1`), et `app_settings.stripe.configured=true` avec **clé `sk_live_`**.
- ⇒ **endpoint de paiement LIVE public à montant contrôlé par le client** : appelable directement avec la clé publishable (publique) → Checkout Stripe LIVE à 1 € pour n'importe quelle prestation, abus de ressources, liens arbitraires. Le gel frontend ne protège pas l'edge.
- **« impossibilité d'utiliser Stripe LIVE depuis recette »** : VRAIE pour le site, **FAUSSE au niveau edge**.
- **« montant calculé serveur »** : **NON** — le montant vient du client.
- Remédiation proposée (non déployée) : `supabase/functions/stripe-create-payment-link/PROPOSED_index.ts` (montant serveur via `services`, auth secret partagé, idempotence).

**Séparation données TEST/PROD** : leads recette = même Supabase que prod (base partagée) ; Stripe frozen côté site donc pas de paiement test ; lead de test T1 nettoyé.

⛔ **BLOQUÉ (gate + needs_florian)** : durcir/déployer l'edge OU couper l'endpoint si inutilisé. Nécessite décision Florian + clé Stripe TEST pour tester. **Aucune action prod sans GO.**

**SHA** : proposition + audit (ce run).

---

## ✅ TÂCHE 11 — Release flow / recette → prod — **FAIT (socle + inventaire) ; UI 4 états = gate DB**

**Audit `/recette.html`** : centre de validation unique (items `data-review-id`, table `recette_validation`,
versionné `v` → bump = à revalider). Source de OK / À corriger / commentaire.

**Mécanismes dangereux identifiés & neutralisés** :
- ex-widget OK/KO + bouton « Promouvoir en prod » + PAT (CP-0015, `4b592aff`).
- pages admin `valider-staging.html`/`photos.html` (PAT/promote-to-prod) **bloquées** ce run (`2ab95305`, T8).

**Inventaire main vs recette (`REL-2026-08-22-DRAFT`, base `970375e8` → head `52760811`)** :
| Catégorie | Nombre |
|---|---|
| DÉJÀ PROD | main `970375e8` |
| NON PROMU (recette∉main) | **148 commits** = 97 promotables + 51 exclus (control-plane/docs/scripts) |
| VALIDÉ RECETTE (`ok`) | **3 items** (`recette_validation`) → candidats PRÊT PROD |
| À CORRIGER / À REVALIDER | **6 items** (`a_corriger`) |
| NON VALIDÉ | reste des 97 promotables (non encore revus) |
| Fichiers impactés | 256 |

**Promotion** : générateur `scripts/control/build-release-lot.mjs` (cherry-pick contrôlé, exclut
docs/control + scripts/control). **Aucune promotion prod effectuée.** Aucun token de promotion frontend.

⛔ **BLOQUÉ (gate DB)** : réécriture `/recette.html` avec 4 états visibles (À TESTER / VALIDÉ RECETTE /
PRÊT PROD / DÉPLOYÉ PROD) — dépend de la migration 4 tables `20260820_release_flow.sql` (non appliquée, GO Florian).

**SHA** : socle `1d4f0c23` + inventaire ce run.

---

## ✅ TÂCHE 12 — Qualité front complète — **FAIT (items vérifiables) ; sweep responsive limité (pane)**

| Contrôle | Résultat |
|---|---|
| Console JS | **Propre** — seul le framing toolbar `app.netlify.com` bloqué par CSP = **bénin, recette-only** (bannière Deploy Preview, absente en prod, pas notre code) |
| Liens internes cassés | **0** (scan href→.html sur pages clés) |
| Images sans `alt` | **0 / 1469** |
| `<h1>` par page | **exactement 1** (index + 4 pages métier + nos-prestations + contact) |
| 404/500 involontaires | aucun (scan liens) ; smoke test 6 pages = 200 |
| Overflow horizontal | **spot-vérifié** : depannage-saint-omer mobile = `scrollWidth==viewport` (0 débordement) |
| Erreurs réseau | gérées (catalogue fallback, `resaMsg`) |

**Limite environnementale** : le sweep responsive complet 320→1920 sur les 7 gabarits n'est pas
mesurable de façon fiable ici — le Browser pane rapporte `innerWidth/bodyW = 0` sur la home (rendu
collapsé), rendant le scan overflow non concluant sur cette page (la mesure a fonctionné sur depannage).
Recommandé : QA visuelle dédiée (mêmes gabarits que T3/T7).

**SHA** : log ce run.

---
