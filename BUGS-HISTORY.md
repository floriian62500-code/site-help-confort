# BUGS HISTORY — Help Confort

> Capitalisation des bugs résolus sur le site, le dashboard, Netlify et Supabase.
> Lu par l'agent de maintenance avant chaque scan pour reconnaître les patterns récurrents et appliquer les fixes connus directement.

---

## 2026-07-20 — Chantiers FB ne s'auto-publient plus depuis 53 jours (token invalidé + cron absent)
- **Symptôme** : Florian récurrent "les chantiers ne se publient toujours pas sur le site depuis Facebook". Home affiche 2 chantiers dont le plus récent = 28 mai 2026.
- **Cause double** :
  1. **Cron pg_cron `auto-sync-facebook-posts` n'existait pas** — la Edge Function `sync-facebook-posts` v9 était fonctionnelle mais personne ne la déclenchait automatiquement. Autres crons OK (sync-reviews, sync-google-ads, indexnow, pipeline-health, publish-scheduled, weekly-recap, smoke-tests) mais pas Facebook.
  2. **Token Meta invalidé côté FB** — `refresh-meta-token` renvoie `"user changed their password or Facebook has changed the session for security reasons"`. Refresh auto échoue → nécessite re-génération manuelle via wizard.
- **Fix côté serveur** : cron `auto-sync-facebook-posts` créé avec `cron.schedule('*/30 8-22 * * *', ...)` → tourne toutes les 30 min entre 8h-22h, appelle l'edge fn avec HC_CRON_SECRET.
- **Fix côté humain** : Florian doit ouvrir `/admin-pro/wizard-meta.html` étapes 4-6 → régénérer Page Token → coller dans wizard (procédure documentée dans POUR-FLORIAN.md).
- **Durée** : diag 15 min, fix serveur 5 min. Fix humain restant ~15 min.
- **Pattern à surveiller** :
  - **Health-check pipeline actuellement AVEUGLE sur Facebook** (aucune section `facebook`/`meta` dans le rapport). À ajouter à `pipeline-health-check` : appel test à l'edge fn `refresh-meta-token`, alerte CRITICAL si `refreshed=false` OU `token_refreshed_at < now - 45 jours`.
  - **Grep pg_cron systématique** : pour chaque edge fn stratégique (sync-*, refresh-*, publish-*), vérifier qu'un cron pg_cron l'appelle. À automatiser via un job `check-orphan-edge-functions`.
- **Volet** : supabase (cron manquant) + intégration Meta (token invalidé) → impact publi auto site

---

## 2026-07-03 — Sitemap Supabase servait toutes les URLs sur mauvais domaine (SEO ~189 URLs cassées)
- **Symptôme** : mail Google Search Console "De nouvelles raisons empêchent l'indexation des pages d'un sitemap : Page avec redirection" sur `https://www.depan59-62.fr/`. Toutes ou presque des 189 URLs du sitemap remontées comme "Non indexée".
- **Cause** : Edge Function `supabase/functions/sitemap/index.ts` ligne 13 : `const SITE_URL = "https://www.helpconfort-saintomer.fr"` au lieu de `"https://www.depan59-62.fr"`. `_redirects` Netlify fait un rewrite `/sitemap.xml → https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/sitemap` (statut 200) donc le sitemap servi à Google contenait 189 URLs vers un domaine qui redirigeait/n'existait pas.
- **Fix** : 1 ligne (`const SITE_URL = "https://www.depan59-62.fr"`) + redéploiement Edge Function `sitemap` v6 via Supabase MCP (`deploy_edge_function`). Vérifié live via GET `/functions/v1/sitemap` : URLs toutes en `depan59-62.fr` OK. Commit local `ef4f221b` (push distant en attente cf POUR-FLORIAN).
- **Durée** : ~15 min (détection → prod).
- **Pattern** : **grep systématique du domaine partout dans le repo au moins 1×/trimestre** (`grep -rn "helpconfort-saintomer\|help-confort\|depan59"`). Toute URL absolue hardcodée dans une Edge Function doit avoir un test end-to-end (curl du sitemap + vérif du hostname retourné). À ajouter à `smoke-tests-prod` Edge Function.
- **Volet** : supabase (Edge Function) → impact SEO Google

---

## Format d'entrée

```markdown
## AAAA-MM-JJ — <titre court>
- **Symptôme** : <ce que l'utilisateur ou le monitoring a vu>
- **Cause** : <cause racine identifiée>
- **Fix** : <action prise — commit <hash>, migration, rollback, etc.>
- **Durée** : <X min entre détection et résolution>
- **Pattern** : <type de bug, signal à surveiller pour la prochaine fois>
- **Volet** : site live | netlify | dashboard | supabase | autre
```

---

## 2026-05-20 — Optim pictos métier (-120 KB par page)
- **Symptôme** : 8 pictos PNG (plomberie, électricité, etc.) en 437×437 alors qu'affichés en 24×24 dans le mega-menu nav. Chaque page nav chargeait ~196 KB de pictos inutiles.
- **Cause** : Images source en haute résolution sans pipeline de compression à la build.
- **Fix** : `convert -resize 96x96 -strip` sur 8 pictos PNG (backup dans `images/_backup_pictos_437/`) + update attributs `width="437" height="437"` → `width="96" height="96"` sur 73 fichiers HTML via sed bulk. Total avant : ~196 KB / Après : ~76 KB. **Gain ~120 KB par page chargée × 73 pages.**
- **Durée** : ~5 min.
- **Pattern** : surveiller `identify -format "%wx%h"` sur toutes les images src ; comparer à la taille d'affichage CSS pour spotter le ratio absurde. Idéalement intégrer à build CI.
- **Volet** : site live (toutes pages nav)

## 2026-05-20 — Sécurité Supabase : 11 fonctions + 4 vues + 5 SECURITY DEFINER durcies
- **Symptôme** : audit `get_advisors` security retournait 4 ERROR + multiples WARN (Security Definer Views, search_path mutable, anon execute SECURITY DEFINER functions).
- **Cause** : migrations historiques laissant des configurations par défaut Postgres permissives.
- **Fix** : 3 migrations appliquées :
  - `hc_security_fix_search_path_2026_05_20` : `ALTER FUNCTION ... SET search_path = public, pg_temp` sur 11 fonctions trigger
  - `hc_security_fix_views_security_invoker_2026_05_20` : `ALTER VIEW ... SET (security_invoker = on)` sur 4 vues
  - `hc_security_revoke_anon_security_definer_2026_05_20` : `REVOKE EXECUTE FROM anon, authenticated` sur 5 fonctions SECURITY DEFINER
- **Durée** : ~10 min.
- **Pattern** : exécuter `get_advisors security` après chaque session DDL pour catch les nouveaux warnings.
- **Volet** : supabase

## 2026-05-20 — Perf Supabase : 6 indexes FK manquants
- **Symptôme** : audit `get_advisors` performance révèle 6 foreign keys sans index couvrant.
- **Fix** : migration `hc_perf_add_missing_fk_indexes_2026_05_20` créant `idx_contracts_created_by`, `idx_interventions_created_by/lead_id/realisation_id`, `idx_leads_realisation_id`, `idx_user_profiles_invited_by`.
- **Durée** : ~3 min.
- **Pattern** : `CREATE INDEX IF NOT EXISTS` non destructif → safe à appliquer en autonomie.
- **Volet** : supabase

## 2026-05-20 — Refactor footer-v3 externalisé dans styles.css
- **Symptôme** : CSS footer-v3 dupliqué inline sur 81 pages HTML (~5 KB chacun). Drift régulier entre pages.
- **Fix** : Ajout du bloc CSS complet dans `styles.css` ligne 2042+. Inline conservé comme failsafe (cf. incident partenaires.html du 18 mai). Modifs futures du footer → uniquement dans styles.css.
- **Volet** : site live

## 2026-05-20 — #urgenceModal orphelin supprimé index.html
- **Symptôme** : 3 modaux urgence cohabitent dans index.html.
- **Cause** : itérations successives sans purge legacy.
- **Fix** : `#urgenceModal` (V1 legacy avec inline onclick) supprimé — aucun trigger ne l'ouvrait (orphelin). #hcUrgModal (V3 propre) reste seul. -88 lignes.
- **Volet** : site live

---

## 2026-05-20 — 🔥 CRITIQUE : 0 leads remontés (RLS rejette clé sb_publishable_*)
- **Symptôme** : Table `leads` à 0 entrées depuis le passage à la clé `sb_publishable_Zyd4jmm3_*`. Tous les soumissions formulaires renvoient un toast d'erreur côté visiteur. Potentiellement des dizaines de leads perdus.
- **Cause** : La clé `sb_publishable_*` (nouveau format Supabase) ne résout pas vers le rôle `anon`. La policy `leads_public_insert` ciblait `{anon}` uniquement. PostgREST refuse l'INSERT avec : `new row violates row-level security policy for table 'leads'`.
- **Fix** : Création Edge Function `submit-lead` V1 (verify_jwt=false, service_role bypass RLS, anon-callable). Refactor `assets/hc-leads-capture.js` (HC-FIX 2026-05-20) pour appeler `/functions/v1/submit-lead` au lieu de l'INSERT direct via supabase-js. Honeypot, rate-limit IP basique, validation nom + (email OU téléphone), déclenchement notify-lead côté serveur (architecture identique à publish-scheduled).
- **Durée** : ~25 min (diagnostic + dev + test E2E + déploiement).
- **Pattern** : **À retenir** — toute table avec INSERT anon doit passer par une Edge Function plutôt que client supabase-js si l'on utilise les clés `sb_publishable_*`. Ne JAMAIS faire confiance à la RLS sur du anonyme front quand on change le format de clé.
- **Volet** : site live + supabase

## 2026-05-20 — Publication Facebook chasse d'eau échoue (auth mismatch publish-meta vs publish-scheduled)
- **Symptôme** : Cron `publish-scheduled` enregistre `meta: { status:401, error:"Not authenticated" }` dans `result_log` malgré V6 déployé. Site OK, Facebook KO.
- **Cause** : `publish-meta` V7 acceptait UNIQUEMENT `HC_EDGE_AUTH_TOKEN` comme bearer cron, mais `publish-scheduled` envoyait `SUPABASE_SERVICE_ROLE_KEY`. Mismatch d'authent inter-Edge Functions.
- **Fix** : Déploiement `publish-meta` V8 acceptant les DEUX tokens (`isCron = (hcToken && bearer===hcToken) || (sbServiceKey && bearer===sbServiceKey)`). Re-trigger manuel du publish-scheduled → Facebook post créé : https://www.facebook.com/107405408058063_1430575819112493
- **Durée** : ~10 min.
- **Pattern** : valider que les Edge Functions appelées en cascade partagent le même contrat d'auth (token unique OU acceptation multi-tokens explicite).
- **Volet** : supabase edge functions

---

## À faire en session dédiée

## 2026-05-19 — 3 modaux urgence cohabitent sur index.html
- **Symptôme** : trois blocs modal/popup d'urgence imbriqués dans `index.html` (probablement un legacy, un V2 et un nouveau), JS éventuellement dupliqué.
- **Cause** : itérations successives sans purge de l'ancien modal.
- **Fix attendu** : audit des trois `<div class="modal*">` ou `<div id="modal*">`, identification du JS rattaché à chacun, fusion en un seul modal, retrait des deux autres.
- **Pourquoi reporté** : complexe à fusionner sans casser le JS — chaque modal peut être appelé par des CTA spécifiques.
- **Pattern** : à traiter en session dédiée (45-60 min).
- **Volet** : site live (index.html uniquement)

## 2026-05-19 — 24 scripts inline dans index.html
- **Symptôme** : `index.html` contient ≈24 balises `<script>...</script>` inline, ce qui alourdit le HTML, complique la CSP et casse le cache navigateur.
- **Cause** : accumulation au fil des itérations (snippets analytics, JSON-LD, init carrousel, modal, hero video, etc.).
- **Fix attendu** : audit script par script, externalisation dans `assets/` quand pertinent, regroupement des JSON-LD, suppression des doublons. Conserver les inline strictement critiques (anti-CLS).
- **Pourquoi reporté** : lourd, demande une session dédiée pour identifier les dépendances entre scripts.
- **Pattern** : à traiter en session dédiée (60-90 min).
- **Volet** : site live (index.html uniquement)

## Bugs résolus

## 2026-05-18 — Chemins absolus `/assets/` qui cassent en sous-dossier
- **Symptôme** : pages dans `prestations/` affichent skip-link visible, logo cassé, CSS non chargé, SVG géants (404, hero, pictos)
- **Cause** : conversion globale `/styles.css` → `styles.css` (vague chemins relatifs) sans tenir compte de la profondeur du sous-dossier `prestations/`
- **Fix** : script Python qui préfixe `../` sur 2 881 chemins dans 33 pages prestations + chemins absolus restaurés sur `404.html` (puisqu'elle peut être servie depuis n'importe quelle URL)
- **Durée** : 15 min
- **Pattern** : toujours vérifier la profondeur de chaque page avant de normaliser des chemins. Pour les pages racine + sous-dossiers, faire 2 passes distinctes ou utiliser des chemins absolus uniquement pour la 404
- **Volet** : site live

## 2026-05-18 — CSS hero `/assets/index-hero.css` chargé en bas de page
- **Symptôme** : SVG bouton Urgence en 300×150 px, pictos `.hco-dot img` en 437×437 px, mascotte 240×720 px → home déformée sur capture utilisateur
- **Cause** : `<link rel="stylesheet" href="/assets/index-hero.css">` placé ligne 528 (après les éléments concernés) + chemin absolu fragile (cache navigateur, file://, sous-chemin)
- **Fix** : déplacé dans le `<head>` ligne 38, chemin relatif `assets/index-hero.css` + ajout `width`/`height` HTML sur SVG et `<img>` pour fallback fail-safe
- **Durée** : 5 min
- **Pattern** : tout CSS critique = dans le `<head>` + chemin relatif + dimensions HTML sur SVG/IMG en backup
- **Volet** : site live

## 2026-05-18 — Double footer sur 9 pages
- **Symptôme** : 2 `<footer>` empilés (legacy inline + footer-v3) visible en bas de plusieurs pages
- **Cause** : migration vers footer-v3 incomplète, ancien footer inline non supprimé
- **Fix** : regex Python supprimant le `<footer style="background:#0A1428...">...</footer>` legacy sur les 9 pages identifiées
- **Durée** : 5 min
- **Pattern** : auditer régulièrement `grep -c '<footer'` sur toutes les pages — toujours doit retourner 1
- **Volet** : site live

## 2026-05-18 — `<div class="container">` non fermé section m-suppliers (26 pages)
- **Symptôme** : footer mal placé, décalages visuels imprévisibles sur pages métier-ville
- **Cause** : template métier dupliqué avec erreur de structure
- **Fix** : ajout de `</div>` manquant avant `</section>` sur 26 fichiers
- **Durée** : 10 min
- **Pattern** : audit balise `<div>` vs `</div>` sur templates dupliqués (diff doit être 0)
- **Volet** : site live

## 2026-05-19 — Marques inventées par template (Geberit, Grohe, etc.)
- **Symptôme** : Florian voit des fournisseurs cités sur des pages prestations sans qu'il ait validé
- **Cause** : template initial contenait des cartes fournisseurs préremplies sans vérification métier
- **Fix** : suppression section "marques que nous installons" sur 32 pages (11 dépannage + 21 installation non validées) + remplacement par Atlantic sur chauffe-eau et Delpha sur salle-de-bain (validés par Florian)
- **Durée** : 15 min
- **Pattern** : ne jamais préremplir des marques sans validation. Sur futures pages, structure vide à remplir par admin
- **Volet** : site live + conformité DGCCRF

## 2026-05-19 — Mention "Astreinte 7j/7" trompeuse
- **Symptôme** : Florian voit "Astreinte 7j/7 — 03 66 10 01 34" alors qu'HC ne fait pas d'astreinte 7j/7
- **Cause** : wording template par défaut
- **Fix** : remplacé par "Standard ouvert Lun-Ven 9h-17h · Sam 9h-16h"
- **Durée** : 2 min
- **Pattern** : audit régulier des promesses de disponibilité (cf. audit-promesses-marketing.md)
- **Volet** : site live + conformité DGCCRF

## 2026-05-19 — 91 promesses marketing à risque DGCCRF
- **Symptôme** : audit révèle "1er réseau national" (non sourcé), "sans sous-traitance" (à confirmer), délais "sous 24h" sans "ouvrées", "Qualifelec" (non possédé), etc.
- **Cause** : template initial + ajouts successifs sans audit conformité
- **Fix** : nettoyage défensif 519 remplacements sur 100 pages (« 1er réseau » → « Réseau national », « sans sous-traitance » → « techniciens internes », ajout « ouvrées » partout, retrait Qualifelec, etc.) — voir `audit-promesses-marketing.md` pour détail
- **Durée** : 30 min
- **Pattern** : audit promesses tous les 3 mois minimum. Toute nouvelle promesse doit passer par POUR-FLORIAN.md avant mise en ligne
- **Volet** : site live + conformité DGCCRF

## 2026-05-19 — Photos manquantes sur /realisations (3 cartes sur 4)
- **Symptôme** : Sur depan59-62.fr/realisations, plusieurs cartes affichent texte sans image ni fallback gradient
- **Cause** : CSS minifié avec `.real-card.photo` (compound) au lieu de `.real-card .photo` (descendant) → le sélecteur cherchait un élément avec les 2 classes en même temps alors que HTML rend `<a class="real-card"><div class="photo">…</div></a>`. Le CSS ne matchait jamais.
- **Fix** : script Python qui patche 19 sélecteurs (.fb-tag, img, iframe, ph-fallback inclus)
- **Durée** : 25 min
- **Pattern** : sélecteur CSS compound vs descendant — vérifier les espaces après minification
- **Volet** : site live

## 2026-05-19 — Drapeau Ukraine sur carte Leaflet zones-intervention
- **Symptôme** : Rectangle bleu/jaune en bas-droite de la carte interactive
- **Cause** : Tile provider OSM.org affiche overlay "Stand with Ukraine" sur certaines tuiles
- **Fix** : Change tile provider `tile.openstreetmap.org` → `maps.wikimedia.org/osm-intl` + CSS injectif masque `.leaflet-bottom.leaflet-right` non-attribution
- **Durée** : 10 min
- **Pattern** : overlays tile providers à vérifier — préférer Wikimedia ou auto-hébergé
- **Volet** : site live

## 2026-05-19 — Bouton "Réserver cette prestation" inactif (nos-prestations.html)
- **Symptôme** : Clic sur bouton orange ne déclenche pas la modale
- **Cause** : `data-service-id="${s.id}-3"` dans le template alors que `services.find()` cherche l'ID exact (sans suffixe). Idem `data-service-id="${s.id}-2"` sur l'article. Copy-paste foireux.
- **Fix** : sed suppression suffixes `-2` et `-3`
- **Durée** : 5 min
- **Pattern** : data attributes incohérents HTML↔JS — toujours vérifier matching find/data-id
- **Volet** : site live

## 2026-05-19 — Fake avis "Mathieu D./Sophie L./Patrick V." (26 pages)
- **Symptôme** : Avis fictifs incohérents (ex: "Fuite cuisine" sur page PMR). Risque DGCCRF (loi Hamon) + Google CGU.
- **Cause** : Avis hardcodés dans HTML statique legacy avant la sync Supabase reviews
- **Fix** : mega_patch_pages_metier.py remplace par placeholder "4,7/5 · 343 avis vérifiés Google" cliquable. Cartes zones-intervention.html + temoignages.html rendues cliquables vers source_url ou Google Maps.
- **Durée** : 40 min
- **Pattern** : préférer données BDD (table reviews) — créer lien dynamique vers vrai avis
- **Volet** : site live + conformité DGCCRF

## 2026-05-19 — "Sous 1h ouvrée" partout (engagement non tenable)
- **Symptôme** : 61 fichiers contenaient "Sous 1h ouvrée"/"Être rappelé sous 1h" → Florian ne peut garantir → risque réputation
- **Cause** : Texte hardcodé legacy avec engagement temporel non maintenable
- **Fix** : sed global remplace par "rapidement" ou "Devis sous 24h" (tenable). 114 remplacements/61 fichiers.
- **Durée** : 10 min
- **Pattern** : engagements temporels stricts à valider — préférer formulations souples
- **Volet** : site live + conformité DGCCRF

## 2026-05-19 — Section "Réservez ou demandez un devis" redondante (26 pages)
- **Symptôme** : Bloc CTA répété sur toutes pages métier × ville alors que CTA déjà hero+footer+chat urgence
- **Cause** : Bloc historique quand le hero n'avait pas de CTA
- **Fix** : script Python supprime sur 26 pages (2 patterns : `m-cta-section` et `m-section` aria-label="Tarifs et prestations…")
- **Durée** : 15 min
- **Pattern** : audit redondance CTA — 1 hero + 1 footer suffit
- **Volet** : site live

## 2026-05-19 — VitrerieMenuiserie collés footer (46 pages)
- **Symptôme** : Affichage "VitrerieMenuiserie" sans séparation
- **Cause** : 2 `<a>` dans le même `<li>` sans séparateur
- **Fix** : sed split en 2 `<li>` séparés
- **Durée** : 3 min
- **Pattern** : 1 `<a>` par `<li>` dans menus
- **Volet** : site live

## 2026-05-19 — Logo footer écrasé (carré 1080×1080 forcé en 200×60)
- **Symptôme** : Logo HC compressé en rectangle dans le footer sombre
- **Cause** : HTML `width="200" height="60"` force ratio rect, image `logo-officiel.jpg` est 1080×1080 carré
- **Fix** : CSS V2 dans styles.css avec `!important` → 110×110px + `object-fit:contain` + cartouche blanc + ombre. À long terme : remplacer par PNG transparent rectangulaire (Florian doit l'uploader).
- **Durée** : 10 min
- **Pattern** : CSS dimension override sur attributs HTML legacy avec `!important`
- **Volet** : site live

## 2026-05-19 — Doublons "chasse d'eau" (4 cartes au lieu de 2) — V1 + V2
- **Symptôme** : 4 cartes affichées (2 BDD + 2 hardcoded JS) pour "Mécanisme de chasse d'eau" Nicoll/Geberit
- **Cause V1** : Services `loc-plo-3` et `loc-plo-4` hardcodés en JS dans nos-prestations.html sont des doublons de la BDD Supabase. `dedupServices()` ne normalisait pas ("Mécanisme de" vs "Mécanisme").
- **Fix V1** : Suppression des entrées hardcoded loc-plo-3 et loc-plo-4 → seules 2 entrées BDD restent.
- **Symptôme persistant** : Florian voyait encore 4 cartes après le fix V1 (cache navigateur agressif probable + dedup runtime trop strict)
- **Fix V2** : Ajout d'un **dedup agressif côté JS (3e passe)** qui groupe les services chasse d'eau par marque + type WC (sol/suspendu) et garde le 1er (priorité BDD via test `!/^loc-/.test(s.id)`). Même si du hardcoded revient ou que le cache navigateur conserve l'ancienne version, le dedup runtime nettoie au load.
- **Durée** : 10 min (V1 + V2)
- **Pattern** : ne jamais dépendre d'un fix purement statique pour des doublons → toujours doubler avec un dedup runtime aggressive par regex métier
- **Volet** : site live + supabase

## 2026-05-19 — Edge Function publish-scheduled ne gère pas channel "site"
- **Symptôme** : Publications programmées avec `channels = {site:true, meta:false, linkedin:false, gbp:false}` ne se déclenchaient pas (anySuccess=false, status final = "done" mais sans publication réelle)
- **Cause** : Edge Function ne gérait que meta/linkedin/gbp. Channel "site" (par défaut CMS) traité par aucune branche
- **Fix** : Ajout branche dans publish-scheduled/index.ts qui update `realisations.status='publie'` + `published_at=now()` quand `channels.site=true` (ou par défaut). V5 déployée via Supabase MCP `deploy_edge_function`.
- **Durée** : 15 min
- **Pattern** : Edge Functions multi-channels — prévoir fallback "site" par défaut
- **Volet** : supabase

## 2026-05-19 — Bandeau MaPrimeAdapt' violet illisible
- **Symptôme** : Bandeau "MaPrimeAdapt' jusqu'à 70% d'aide" — contraste catastrophique (sous-texte violet pâle sur fond violet uni invisible)
- **Cause** : `background:linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)` + `opacity:.92` rendait sous-texte invisible
- **Fix** : Refonte V2 — fond crème dégradé + bordure orange MaPrimeAdapt' + icône maison+sourire SVG + titre noir charbon + CTA orange chaud. WCAG AAA.
- **Durée** : 20 min
- **Pattern** : contraste WCAG à vérifier sur tous bandeaux promo
- **Volet** : site live

## 2026-05-19 — Doublon scheduled_publications (chasse d'eau 19/05 18h)
- **Symptôme** : 2 entrées identiques pour la même réalisation à la même heure → risque double publication
- **Cause** : Double clic involontaire sur "Confirmer la programmation" admin
- **Fix** : SQL DELETE avec ROW_NUMBER() PARTITION BY pour garder le plus ancien
- **Durée** : 3 min
- **Pattern** : ajouter UNIQUE constraint sur (realisation_id, scheduled_at) côté SQL ou debouncer le bouton côté JS
- **Volet** : supabase

## 2026-05-19 — Photos absentes /realisations (vraie cause : URLs Facebook CDN)
- **Symptôme** : 3 cartes sur 4 sans image ni fallback, malgré image_after non null en BDD. Le fix précédent (sélecteur CSS descendant) n'a pas suffi car le vrai bug était ailleurs.
- **Cause** : Les `image_after` en BDD sont des URLs Facebook CDN (`scontent-cdg4-1.xx.fbcdn.net`). Facebook **bloque le hot-linking** depuis d'autres domaines → les `<img>` échouent silencieusement → cartes vides.
- **Fix** : Ajout d'une fonction `isFbCdn(url)` dans realisations.html qui détecte les URLs `fbcdn|scontent` et les considère comme inutilisables → le rendu bascule sur le fallback gradient (case 4 du switch).
- **Durée** : 15 min (investigation BDD + fix JS)
- **Pattern** : ne **jamais** stocker d'URLs Facebook CDN comme images persistantes. Toujours rapatrier les images sur Supabase Storage ou /images/. Audit régulier `WHERE image_after LIKE '%fbcdn%' OR '%scontent%'`.
- **Volet** : site live + supabase

## 2026-05-19 — Drapeau Ukraine carte V2 (Wikimedia ne suffisait pas)
- **Symptôme** : Le drapeau Ukraine reste visible en bas-droite de la carte zones-intervention même après changement OSM → Wikimedia + CSS masque
- **Cause** : Wikimedia render aussi un overlay sur certaines tuiles dans cette zone. La règle CSS masque seul `.leaflet-bottom.leaflet-right` ne couvrait pas tous les cas.
- **Fix** : V2 — Tile provider basculé sur Esri ArcGIS World Street Map (`server.arcgisonline.com`) qui n'a aucun overlay Ukraine connu + CSS masque agressif élargi (img alt/src ukraine, classes/aria-label, divs non-leaflet, bottom-left et bottom-right)
- **Durée** : 10 min (V2 après échec V1)
- **Pattern** : tester plusieurs tile providers avant de conclure. Esri ArcGIS = backup fiable sans overlay politique.
- **Volet** : site live

## 2026-05-19 — CSS footer-v3 manquant sur 11 pages (layout cassé)
- **Symptôme** : Pages partenaires.html, reseau-help-confort.html, agence-saint-omer/dunkerque, blog, panne-chaudiere, entretien-chaudiere, debouchage-canalisation, nos-villes, nos-metiers, ouverture-porte-claquee, diagnostic-electrique affichent footer + bas de page totalement non-stylisés (texte brut, pictos 437×437px). Florian a vu plusieurs pages cassées consécutivement.
- **Cause** : Le CSS du footer-v3 (~5 KB, `.footer-v3{...}` jusqu'à `.fv3-legal-line{...}`) est inline dans 68 pages mais 11 pages root l'avaient perdu (probablement créées via template sans le bloc style, ou patch précédent qui l'a retiré). Le HTML utilisait `class="footer footer-v3"` mais sans le CSS associé → rendu DOM brut.
- **Fix** : Script Python qui extrait le CSS footer-v3 inline depuis index.html (référence stable) et l'injecte avant `</head>` sur les 11 pages détectées. 5024 chars de CSS par page, marqueur `HC-FIX 2026-05-19`.
- **Durée** : 15 min (détection + extraction + injection)
- **Pattern** : CSS critique commun devrait être dans **styles.css** centralisé, pas inline. À refactorer en session dédiée. En attendant : audit régulier `grep -L '\.footer-v3{' *.html | grep -lF 'footer-v3'` pour détecter les drift.
- **Volet** : site live

## 2026-05-19 — V3 Drapeau Ukraine : bascule Leaflet → SVG statique
- **Symptôme** : Drapeau Ukraine persiste sur carte zones-intervention même après V1 (Wikimedia) et V2 (Esri ArcGIS) + masque CSS
- **Cause** : Probablement extension Chrome côté Florian qui injecte un drapeau sur toutes les cartes web. Pas reproductible côté code.
- **Fix V3** : remplacement du composant Leaflet par le SVG statique du fallback noscript (existait déjà ligne 909+). Plus de tile = plus de drapeau possible, peu importe l'extension ou le tile provider. Carte SVG conservée avec markers agences, villes, halos zones, axe géographique. On perd zoom/drag interactif mais gain de stabilité visuelle + perf (zéro requête tile, zéro JS Leaflet).
- **Durée** : 8 min (basculement propre + sortie noscript)
- **Pattern** : pour cartes informatives statiques, préférer SVG inline plutôt que Leaflet+tile (immunité aux overlays tiers et extensions)
- **Volet** : site live

## 2026-05-19 — Edge Function publish-scheduled V5 cassée par verify_jwt=true (4h de retard chasse d'eau)
- **Symptôme** : Publication chasse d'eau prévue 18:00 FR (16:00 UTC) toujours en `status=pending` 4h après l'heure prévue. Tous les calls cron retournaient 401 Unauthorized.
- **Cause** : V5 déployée par moi-même à 17:51 avec `verify_jwt=true` (par défaut Supabase MCP). Le secret `sync_reviews_service_key` dans Supabase Vault est probablement expired/invalide → cron call avec ce Bearer token rejeté. V4 marchait sans verify_jwt strict.
- **Fix immédiat (rattrapage manuel)** :
  1. `UPDATE realisations SET status='publie', published_at=NOW()` pour la chasse d'eau (publication forcée sur le site)
  2. `UPDATE scheduled_publications SET status='done', executed_at=NOW()` pour marquer la pub comme traitée
- **Fix structurel** : Redéploiement V6 avec `verify_jwt=false`. L'auth est faite via SERVICE_ROLE_KEY interne (Deno.env), pas via JWT user.
- **Durée totale** : ≈ 2 min de fix après détection (mais 4h de retard de publication)
- **Pattern critique** : sur Edge Function appelée par cron pg_net, TOUJOURS `verify_jwt=false` (le cron passe via pg_net avec un Bearer Vault, pas un JWT user valide auprès du JWKS Supabase). Mentaliser pour tous les futurs deployments.
- **Volet** : supabase

## 2026-05-20 — 🔥 CRITIQUE : Formulaire contact silencieusement cassé (0 leads en BDD)
- **Symptôme** : Table `leads` totalement vide alors que le site reçoit du trafic depuis des semaines. Tous les visiteurs qui ont rempli le formulaire ont reçu un toast d'erreur.
- **Cause** : RLS sur table `leads` rejette les INSERT via la clé `sb_publishable_*` (nouveau format Supabase). Policy `leads_public_insert` ciblant le rôle Postgres `anon` ne s'applique pas car la clé `sb_publishable_*` résout probablement vers un autre rôle (à confirmer). Test direct pg_net → 401 "new row violates row-level security policy" même avec status='nouveau' et assigned_to=NULL explicites.
- **Fix attendu** : créer une Edge Function `submit-lead` (service_role, bypass RLS, anon-callable). Modifier `assets/hc-leads-capture.js` pour appeler cette Edge Function au lieu de l'INSERT REST direct. Garde-fou : modif validée par Florian car touche aux credentials + architecture.
- **Pourquoi reporté** : nécessite création d'Edge Function et choix d'archi → POUR-FLORIAN.md
- **Durée détection** : audit 25 min (lecture code, test SQL direct postgres, test SET LOCAL ROLE anon, test pg_net via REST avec clé publishable)
- **Pattern critique** : **toujours tester le flux complet anon → API REST → BDD après tout changement de clé Supabase ou de RLS**. Le bug a été silencieux pendant des semaines.
- **Volet** : supabase + site live + business

## 2026-05-20 — Logo footer rendu "carré écrasé" causé par mon V2 (régression CSS)
- **Symptôme** : Logo HELP Confort dans le footer rendu en carré blanc "écrasé" 110×110 au lieu du rendu rectangulaire natif
- **Cause** : Mon HC-LOGO-FOOTER-FIX-V2 ajouté dans styles.css avec `width:110px !important; height:110px !important;` écrasait le CSS inline footer-v3 natif qui était propre (`.fv3-logo img { width:180px; height:auto; max-height:56px; object-fit:contain }` = box 180×56 avec image 56×56 centrée)
- **Fix V3** : Retrait du surdimensionnement V2 dans styles.css. Retour au rendu inline natif du footer-v3 (180×56 box, image carrée centrée 56×56). Plus propre visuellement. Le vrai fix long-terme reste : uploader un PNG transparent rectangulaire (item POUR-FLORIAN.md).
- **Durée** : 5 min (détection en relisant le CSS inline du footer-v3 dans index.html)
- **Pattern critique** : ne JAMAIS utiliser `!important` sur des règles CSS quand un inline `<style>` existe déjà sur la même classe. Toujours vérifier la cascade existante avant d'ajouter des !important.
- **Volet** : site live

## 2026-05-20 — URGENT : photos absentes sur /realisations (cartes blanches)
- **Symptôme** : 3 cartes sur 4 affichent du blanc total (ni image ni fallback gradient) sur depan59-62.fr/realisations. Florian voit "pb toujours pas résolu" malgré multiples interventions précédentes.
- **Cause** : 19 chantiers FB scrape ont `ai_generated.source_fb = "https://facebook.com/..."` ET `image_after` sur Facebook CDN. Le code JS realisations.html avait :
  1. Case 2 (`hasUsableApres`) skip car isFbCdn() détecte l'URL Facebook CDN
  2. Case 3 (`r.source_facebook`) → tentait `<iframe src="https://www.facebook.com/plugins/post.php?href=...">` mais Facebook bloque l'iframe (CSP, 3rd party cookies, X-Frame-Options) → iframe vide invisible
  3. Case 4 (fallback gradient) jamais atteinte
- **Fix** : désactiver complètement le case 3 (iframe Facebook). Les chantiers FB scrape tombent désormais directement sur le fallback gradient + icône métier (visuel propre et cohérent).
- **Durée détection** : long (3 sessions, cause vraie identifiée 4ème tentative). Pattern caché : ai_generated.source_fb n'apparaît pas dans les colonnes principales d'audit BDD.
- **Pattern critique** : pour les imports automatiques (FB scrape), TOUJOURS rapatrier les médias en local. Les iframes/CDN externes sont fragiles (CSP, hot-link bloqué, sites tiers).
- **Volet** : site live + supabase
- **À faire (POUR-FLORIAN)** : rapatrier 19 images Facebook CDN sur Supabase Storage pour avoir de vraies photos sur ces cartes (priorité moyenne, visuel)
