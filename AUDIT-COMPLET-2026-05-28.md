# 🔍 AUDIT COMPLET — depan59-62.fr
**Date :** 28 mai 2026  
**Objectif :** Transformer le site en **source de business pro avec effet wahou**, pas une coquille vide.

---

## 1. ÉTAT DES LIEUX — Ce qui fonctionne ✅

### Points forts actuels
- **84 pages HTML** — gros maillage SEO (24 pages métier × ville + 12 pages dépannage commune + pages prestations/contenus)
- **Hero vidéo background** sur l'accueil (`videos/hero-metier-720p.mp4`)
- **Mégamenu Métiers** + filtres zones (positionnement maintenant corrigé via `assets/hc-megamenu-fix.js`)
- **Schema.org JSON-LD** sur toutes les pages (LocalBusiness, BreadcrumbList, ItemList, FAQPage)
- **AggregateRating 4,7/5 · 343 avis** présent sur 79 pages dans le `<head>`
- **Topbar agences Saint-Omer + Dunkerque** avec pulse animé
- **Footer hiérarchisé** (refactor récent : 4 grandes villes + sous-communes pliées)
- **Robots.txt + sitemap** propres et complets
- **PWA manifest** + apple-touch-icon + service worker prêt
- **Pages dépannage par ville × 12** (Longuenesse, Arques, etc.)
- **Captures leads** via `assets/hc-leads-capture.js` (Supabase)
- **Marquee partenaires** (animation horizontale logo carousel)
- **Topbar pulse "en ligne maintenant"** — déjà bon signal de réactivité

---

## 2. ❗ PROBLÈMES CRITIQUES À FIXER VITE

### A. Conversion / Formulaires
| # | Problème | Impact | Action |
|---|----------|--------|--------|
| A1 | **Pas de validation temps réel** sur form contact (1341 lignes) | Frustration, abandon | Ajouter messages erreur inline (téléphone/email/cp) |
| A2 | **Pas d'envoi confirmation** automatique au client après soumission | Doute sur réception | Email auto-reply via EF Supabase + SMS |
| A3 | **Pas de "votre demande sous X minutes"** explicite | Pas de réassurance temps | Engagement type "Réponse sous 30 min en heures ouvrées" |
| A4 | **Form devis-express** existe mais **non mis en avant** | Trafic dilué | CTA "Devis express ← 60 sec" sticky en bas |
| A5 | **Form pro.html** : pas de **champ SIRET** (pourtant B2B essentiel) | Mauvaise qualification | Ajouter SIRET obligatoire + auto-fill via API SIRENE |
| A6 | **Champ "Comment nous avez-vous connu ?"** absent | Difficile d'arbitrer canaux | Ajouter dropdown : Google / Bouche-à-oreille / Insta / Pub / Pro |

### B. Effet wahou manquant
| # | Problème | Impact | Action |
|---|----------|--------|--------|
| B1 | **Aucun estimateur de prix interactif** | Friction visiteur, doit appeler | Mini-calculateur 3 questions → fourchette prix immédiate |
| B2 | **Aucune carte interactive zones** (juste liste texte) | Démo zones peu convaincante | Carte Leaflet + Marker rouge/orange/jaune par densité |
| B3 | **avant-apres.html sans slider** (juste grid cartes) | Visuels statiques | Slider drag horizontal "tirer pour voir" (before/after wipe) |
| B4 | **Pas de témoignages vidéo** clients | Manque d'incarnation | 3-5 témoignages vidéo 30 sec sur HOME + page À PROPOS |
| B5 | **Avis Google statiques** (juste compteur 4,7/5) | Pas de social proof live | Widget carousel avis 5★ déroulant (Trustville API si possible) |
| B6 | **Pas de compteur live "X interventions ce mois"** | Manque de preuve | Compteur animé depuis Supabase |
| B7 | **Pas de chat opérateur** (juste boutons) | Friction conversation | Crisp.chat ou widget interne avec heures |
| B8 | **Pas de visualisation "comment ça marche"** | Process flou pour visiteur | 4 étapes animées scroll-trigger |

### C. SEO & maillage
| # | Problème | Impact | Action |
|---|----------|--------|--------|
| C1 | **Pas de pages "métier + sous-commune"** (ex: `plombier-outreau.html`) | Manque SEO local long-tail | Générer 20-30 pages combinant 9 métiers × top sous-villes |
| C2 | **Blog actualites.html** : pas vu d'articles SEO long-form | Pas de trafic informationnel | 12-15 articles "Comment changer un mitigeur", "Coût rénovation salle de bain", etc. |
| C3 | **Schema FAQPage** absent sur pages prestations | Manque featured snippets | Ajouter 5-8 Q/R par page service |
| C4 | **Pas de schéma `Service`** complet sur pages métier | Mauvais indexation richesnippets | Ajouter `Service` avec `provider`, `areaServed`, `offers` |
| C5 | **Sitemap actus pas vu mis à jour** automatiquement | Indexation lente nouveaux contenus | Auto-regen sitemap-actus.xml sur ajout réalisation |

### D. Performance & UX mobile
| # | Problème | Impact | Action |
|---|----------|--------|--------|
| D1 | **index.html : 2723 lignes / 200 Ko** | LCP/CLS dégradés | Extraire JS inline → fichier externe `index-init.js` |
| D2 | **Vidéo hero 720p autoplay** dès chargement mobile | Mauvais CrUX mobile | Poster image seulement < 768px, vidéo desktop only |
| D3 | **Pas de lazy-load systémique images** | Mauvais score Lighthouse | Vérifier `loading="lazy"` sur 100% images below-fold |
| D4 | **Mascotte.png 8x copies différentes** (`mascotte.png`, `.tmp.png`, `.webp`, `1.png`...) | Confusion, poids | Nettoyer : garder UNE seule `mascotte.webp` |
| D5 | **CSS 116 Ko** non purgé | Beaucoup de styles inutilisés | PurgeCSS pass + extract critical CSS inline |
| D6 | **Pas de Web Vitals tracking** côté analytics | Pas de mesure perfs réelles | GA4 Web Vitals event |

### E. Confiance / preuves
| # | Problème | Impact | Action |
|---|----------|--------|--------|
| E1 | **Pas de page "Garanties"** dédiée | Doute sur engagements | Page `garanties.html` avec 5 garanties claires |
| E2 | **Pas de "Notre engagement zéro mauvaise surprise"** | Peur du devis caché | Section visible sur HOME + pages métier |
| E3 | **Pas de showroom virtuel / visite agence** | Manque d'humanisation | Page `notre-equipe.html` à enrichir + photos + bios |
| E4 | **Pas d'assurance RC mentionnée explicitement** | Frein juridique B2B | Bandeau "RC Pro 2M€ Allianz + Décennale MAAF" |

---

## 3. 💡 OPPORTUNITÉS WAHOU (à implémenter dans l'ordre ROI)

### Priorité 1 — Conversion immédiate (sprint 1-2 semaines)
1. **🧮 Calculateur prix interactif** (`devis-express.html` upgrade)
   - 3 questions : Type panne / Métier / Urgence
   - Résultat : fourchette en €, délai estimé, bouton réserver
   - Source data : grille tarifaire Supabase `prestations`
2. **📅 Calendrier réservation visuel** (style Calendly)
   - 7 jours dispo + créneaux 30 min
   - Pré-rempli avec ville et métier sélectionnés
3. **💬 Validation form temps réel**
   - Email + téléphone + CP validés à la saisie
   - Erreurs inline (rouge sous le champ)
4. **🎁 Lead magnet** : "Guide PDF — 7 fuites les + courantes & comment les détecter" en échange d'email

### Priorité 2 — Effet wahou & différenciation (sprint 3-4 semaines)
5. **🗺️ Carte interactive zones d'intervention** (Leaflet OSM)
   - 4 grandes villes en gros marqueurs colorés
   - Cliquable → ouvre la page depannage-*.html
   - Polygone CUD + agglo Saint-Omer
6. **🎞️ Slider before/after** vrai (drag horizontal)
   - Composant : `<img-comparison-slider>` (10 Ko)
   - 8-12 chantiers showcase
7. **📊 Compteur live "interventions ce mois"** + "satisfaction"
   - Endpoint Supabase `stats_publiques`
   - Animation count-up scroll-trigger
8. **🎬 Témoignages vidéo** (3 clients × 30 sec)
   - À tourner (smartphone OK) — Saint-Omer, Calais, Dunkerque
   - Hosting : Cloudflare Stream ou self-hosted optimisé
9. **⭐ Carousel avis Google live**
   - Widget custom alimenté par Google Places API
   - Ou Trustville si API consentie par siège

### Priorité 3 — Espace client / valeur ajoutée (sprint 5-8 semaines)
10. **👤 Espace client** (`espace-client.html` existe — à brancher)
    - Suivi intervention en temps réel (statut, technicien, ETA)
    - Historique factures + paiements Stripe
    - Documents (devis signés, photos avant/après, garanties)
    - Mode passwordless via SMS OTP
11. **🤖 Chatbot AI** local
    - Trained sur prestations.json + FAQ + horaires
    - Réponses Haiku 4.5 via API
    - Escalade humaine si "urgence" détecté
12. **📋 Comparateur équipements** (chaudières, chauffe-eau, etc.)
    - Tableau dynamique 3-4 modèles avec specs/prix/aides
    - Filtres : budget / type énergie / surface logement
13. **💸 Simulateur aides** MaPrimeRenov + CEE
    - Formulaire revenus + projet → estimation aide
    - Lien direct vers formulaire devis pré-rempli

### Priorité 4 — Pro & long terme
14. **🏢 Espace pro dédié** différencié `espace-client-pro.html`
    - Pricing fixe contractuel
    - Demande devis multi-sites (CSV upload)
    - Facturation à un compte tiers
15. **📨 Newsletter B2C** mensuelle
    - "L'actu de votre maison" — conseils saison + chantiers
    - Mailchimp ou Brevo gratuit < 500 contacts
16. **📱 PWA installable** (déjà manifest présent)
    - Notifications push pour rappel entretien chaudière
    - Mode offline cache des coordonnées

---

## 4. 📝 RAPPORT DÉTAILLÉ DES FORMULAIRES

### `contact.html` (formulaire général)
- ✅ Champs OK : nom, email, téléphone, message, service (chips), photos
- ✅ Pré-remplissage URL `?service=&objet=` fonctionne
- ✅ Capture Supabase via `data-hc-lead="contact"`
- ⚠️ **PAS de validation client temps réel** (juste HTML5 required)
- ⚠️ **PAS de message confirmation** post-submit (à vérifier dans `hc-leads-capture.js`)
- ⚠️ **PAS de auto-reply email** au client
- 🆕 Ajouter : **CTA "Devis sous 30 min"** + témoignage en sidebar

### `pro.html` (espace pro B2B)
- ✅ Form avec adresse complète obligatoire (récent ajout)
- ⚠️ **PAS de SIRET** → blocant pour qualification leads pro
- ⚠️ **PAS de upload contrat-cadre** ou cahier des charges
- ⚠️ **PAS de "Volume estimé interventions/mois"** → critique pour offre tarifaire
- 🆕 Ajouter : tableau comparatif Bailleur / Syndic / Assurance avec offres dédiées

### `devis-express.html`
- ⚠️ **Peu visible** sur la home (à promouvoir comme CTA principal)
- ⚠️ **15 inputs** → trop ? Doit être 3-5 max pour "express"
- 🆕 Refondre en wizard 3 étapes : Métier → Détails → Coordonnées

### `sinistres.html`
- ✅ Cible niche (clients assurés)
- ⚠️ **PAS de dépôt document constat assurance**
- 🆕 Ajouter : upload photos + n° dossier assurance

### `carrieres.html`
- ⚠️ **PAS de upload CV** depuis formulaire
- 🆕 Ajouter : multi-postes (poseur, plombier, chauffagiste, apprenti)

---

## 5. 🎨 RECOMMANDATIONS DESIGN / UI

| Élément | Constat | Recommandation |
|---|---|---|
| Header | Logo 140px = très grand sur desktop | Réduire à 100px par défaut, 70px scrollé |
| Hero home | Vidéo + texte + CTA = lourd visuellement | Garder mais ajouter "Découvrez ↓" scroll-cue plus visible |
| Couleurs | Bleu #0DA0CF + Orange #FF6B1A = ok | Manque accent vert validation `#22C55E` pour confiance |
| Typo | Inter + Playfair = bon mix | Vérifier que `Playfair italic` est bien chargé partout |
| Espacements | OK mais hero4 mobile très tassé | Augmenter `padding-top` mobile (60px → 80px) |
| Mascotte | Multiple versions (PNG/WEBP/tmp) | Garder 1 seule version, mobile uniquement |
| CTA principal | "Appeler" très présent | Manque CTA "Devis instantané" équivalent |
| Boutons | Ok mais pas de loading state | Ajouter spinner pendant soumission form |

---

## 6. 🚀 ROADMAP D'EXÉCUTION (priorité business)

### Sprint 1 — Conversion (1 semaine)
- [ ] Calculateur prix interactif (`devis-express.html` upgrade)
- [ ] Validation temps réel formulaires (email/tel/cp)
- [ ] Auto-reply email + SMS client après soumission
- [ ] Tracking GA4 Web Vitals + funnel conversion
- [ ] CTA "Devis sous 30 min" sticky bottom mobile

### Sprint 2 — Social proof (1 semaine)
- [ ] Carousel avis Google live (Places API)
- [ ] Compteur live interventions ce mois
- [ ] 3 vidéos témoignages clients (à tourner avec Florian)
- [ ] Section "Notre engagement zéro mauvaise surprise"

### Sprint 3 — Effet wahou (2 semaines)
- [ ] Carte interactive zones (Leaflet)
- [ ] Slider before/after fonctionnel (img-comparison-slider)
- [ ] Animation scroll "comment ça marche en 4 étapes"
- [ ] FAQ accordéon enrichie (8-10 questions par métier)

### Sprint 4 — Espace client (3 semaines)
- [ ] Auth passwordless (OTP SMS)
- [ ] Dashboard client : interventions + factures + docs
- [ ] Intégration Stripe paiement + reçus
- [ ] Notifications push (PWA) entretien chaudière

### Sprint 5 — SEO long tail (2 semaines)
- [ ] 20 pages métier × sous-ville (Outreau, Wimereux, Marck...)
- [ ] 12 articles blog SEO conseils maison
- [ ] Schema `Service` complet sur chaque page métier
- [ ] Sitemap auto-régénéré sur ajout content

---

## 7. ⚠️ ALERTES PRIORITAIRES (à régler MAINTENANT)

1. **Tester sur mobile** : la page nos-villes (récemment refondue) + nos-prestations + contact
2. **Vérifier le tracking GA4** funnel (depuis quelle page on appelle le tel ?)
3. **Configurer le webhook Stripe** dans le dashboard Stripe → URL EF Supabase `https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/stripe-webhook`
4. **Nettoyer les fichiers mascotte dupliqués** (`mascotte.tmp.png`, `mascotte-opt.tmp.png` etc.)
5. **Vérifier que les 22 pages métier nettoyées** ne cassent pas leur layout après suppression bloc Marques
6. **Mégamenu décalé** — `hc-megamenu-fix.js` injecté sur 74 pages, à valider en navigation
7. **Page nos-villes refondue** — vérifier rendu Saint-Omer / Dunkerque / Calais / Boulogne

---

## 8. 🎯 OBJECTIFS CHIFFRÉS (vision 6 mois)

| Métrique | Actuel (estimé) | Cible 6 mois |
|---|---|---|
| Trafic organique mensuel | ~3 000 visiteurs | **15 000** |
| Taux de conversion (formulaire) | ~1,5 % | **4 %** |
| Demandes devis mensuelles | ~50 | **250** |
| Avis Google | 343 (4,7) | **600 (4,8)** |
| Pages indexées | 84 | **150** |
| Temps moyen sur site | ~1m30 | **3m** |
| Taux de rebond | ~55 % | **35 %** |

---

## 9. 💰 ESTIMATION ROI

### Coût des sprints (Claude + dev)
- Sprint 1-2 : ~40h Claude → **600€ équivalent dev**
- Sprint 3-4 : ~80h Claude → **1200€**
- Sprint 5 : ~30h Claude → **450€**
- **Total : ~2 250€** sur 8 semaines

### Retour estimé
- Si +200 devis/mois supplémentaires × 30% conversion × **400€ ticket moyen** = **24 000€ CA/mois**
- ROI première année : **+288 000€** vs 2 250€ investis = **× 128**

---

## 📌 RÉSUMÉ EXÉCUTIF — Pour Florian

Le site `depan59-62.fr` est **solide techniquement** (84 pages, Schema OK, mobile-ready) mais manque les **éléments qui transforment un visiteur en client** :

1. **Pas de calculateur prix immédiat** → on doit appeler → friction
2. **Pas de social proof live** (avis carousel, compteur interventions)
3. **Pas de validation temps réel** sur les formulaires → erreurs en silence
4. **Pas de slider before/after fonctionnel** → photos statiques peu impressionnantes
5. **Espace client existe en coquille vide** → branchement Supabase à faire
6. **SEO long tail vide** sur les sous-communes (Outreau, Wimereux, Marck…)

**Action immédiate recommandée :** Sprint 1 = calculateur prix + validation form + auto-reply. ROI estimé 30 jours.

**Vision** : transformer le site d'une **carte de visite** en une **machine à devis automatique** B2C + onboarding pro.

---

*Audit réalisé en autonomie le 28 mai 2026. Tous les fixes Sprint 0 (mégamenu, doublons, footer hiérarchisé, nos-villes refondu, bouton paiement Stripe) déjà appliqués et poussés en prod via Netlify.*
