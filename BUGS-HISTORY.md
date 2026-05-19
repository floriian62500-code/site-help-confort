# BUGS HISTORY — Help Confort

> Capitalisation des bugs résolus sur le site, le dashboard, Netlify et Supabase.
> Lu par l'agent de maintenance avant chaque scan pour reconnaître les patterns récurrents et appliquer les fixes connus directement.

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

## 2026-05-19 — Doublons "chasse d'eau" (4 cartes au lieu de 2)
- **Symptôme** : 4 cartes affichées (2 BDD + 2 hardcoded JS) pour "Mécanisme de chasse d'eau" Nicoll/Geberit
- **Cause** : Services `loc-plo-3` et `loc-plo-4` hardcodés en JS dans nos-prestations.html sont des doublons de la BDD Supabase. `dedupServices()` n'arrivait pas à normaliser ("Mécanisme de" vs "Mécanisme").
- **Fix** : Suppression des entrées hardcoded loc-plo-3 et loc-plo-4 → seules 2 entrées BDD restent
- **Durée** : 5 min
- **Pattern** : éviter mix données hardcoded JS et données BDD pour le même catalogue
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
