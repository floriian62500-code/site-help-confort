# CHANGELOG — 2026-05-16 (soir)

## 🎨 Refonte esthétique "revendable" + suppression module RH

### ✅ Module RH supprimé
- `admin-pro/assets/layout.js` : MODULES réduit à 2 (Comm + Outils)
- Migration auto : si localStorage avait `hc-active-module-v1 = "rh"` → bascule sur `comm`
- Section `RH & Équipe` retirée de SECTIONS (lien `users.html` reste accessible par URL directe)
- Switcher passe de 3 boutons à 2 (grille 1fr 1fr, plus lisible, libellés complets)

### ✅ Switcher modules — design refait
- Conteneur avec inset shadow et bordure subtile
- Boutons actifs : gradient color → colorDark avec ombre colorée
- Boutons inactifs : hover state visible
- Transitions cubic-bezier(.16,1,.3,1) — fluide

### ✅ Polish CSS global (`admin.css` — couche "REVENDABLE" en fin de fichier)
- **Page heads** : titre gradient ink-900 → ink-700, letter-spacing serré
- **Cards / stat-cards** : gradient bg subtil, ombres niveau Linear/Stripe, hover micro-lift
- **Stat-card-value** : 2.05rem, font-weight 900, tabular-nums
- **Boutons CTA** : reflet subtil + élévation hover
- **Inputs** : focus ring 4px premium (était 3px)
- **Tableaux** : header uppercase tracking large, hover background HC tinted
- **Badges** : système unifié `.badge.success/.warning/.danger/.info/.neutral`
- **Empty states** : gradient bg, icons grayscale .2, typo polished
- **Scrollbars** : sobres, 10px, fade-in/out subtil
- **Selection** : couleur HC tinted
- **Animation fade-in** : staggered .04s per child, désactivée en `prefers-reduced-motion`
- **Tooltip** `[data-tooltip]` : prêt à l'emploi, ombre douce
- **Skeleton loader** : `.skeleton` réutilisable
- **Ambient background** : 2 radial gradients HC primary + orange (fixe, derrière)
- **Topbar** : backdrop-blur 24px, letter-spacing -.015em sur le titre
- **Sidebar items** : icon scale 1.08 au hover
- **Toolbar** (reals, leads) : gradient blanc → ink-50, ombre subtile
- **Boutons secondaires** : meilleurs états hover

### ✅ Tarifs.html — CRUD complet "Forfaits métiers"
- Onglet "Forfaits métiers" passe en mode éditable (auparavant lecture seule)
- Chaque ligne : inputs inline name / price_ht (TTC calculé live avec TVA)
- Bouton 🗑 supprime la prestation (confirmation)
- Bouton ➕ "Ajouter une prestation [Métier]" en bas de chaque section
- Création via prompt() name + ht, slug auto-généré
- Catégorie absente en base → encart "Lecture seule" avec lien vers services.html
- Badge `✏️ Éditable` quand mode CRUD actif

### ✅ Analytics — Top villes upgraded
- 8 villes affichées (au lieu de 6) avec médailles 🥇🥈🥉 pour top 3
- Badge agence (SO / DK) auto-détecté par mapping ville
- Bandeau "Répartition agences" en bas : barre 2 couleurs + % par agence
- Gradient bar Orange→Yellow pour densité visuelle

### ✅ Réalisations admin — Suivi vues par chantier (GA4)
- Carte chantier : badge `👁 N` en bas à gauche de la photo (vues 90 derniers jours)
- Tableau réalisations : colonne dédiée "Vues" avec valeur tabulaire
- Chargement asynchrone GA4 OAuth (re-render automatique quand prêt)
- Match par slug : `/realisation/SLUG.html` et `/actualites/SLUG.html`
- Agrégation si plusieurs paths matchent le même slug
- État "0 vues" en gris quand publié sans trafic, "—" sinon

### 🎯 Résultat attendu
- Look-and-feel niveau Linear / Stripe / Notion / Supabase
- 2 modules clairs (Comm + Outils) — plus lisible que 3
- Pages individuelles bénéficient toutes du polish CSS layer
- Stack vendable telle quelle à un confrère plombier/chauffagiste

---

## 🐛 Fix carrousel "Nos dernières actualités" (13:25)

**Problème récurrent** : Des chantiers (importés Facebook) s'affichaient dans le bloc « Nos dernières actualités » de l'accueil. Filtre `CHANTIER_RE` titre seul trop fragile : `votre [mot] est X` ratait `votre panneau de porte PVC est X` (à cause du complément « de … »).

**Fix** :
- Double filtre **TITRE + RÉSUMÉ** (défense-en-profondeur). Les chantiers FB ont des résumés très stéréotypés (« Help Confort intervient pour… », « Nos prestations : », « Notre équipe est intervenue ») → impossible d'en laisser passer un nouveau.
- Détection métier réordonnée : `panneau|pvc` testé AVANT `porte|serrurerie` (« panneau de porte PVC » → Menuiserie 🚪, plus Serrurerie 🔒).
- Ajout `soupape`, `manomètre`, `cumulus` → Chauffage 🔥 (au lieu du fallback générique).
- Visuel : flèches prev/next du carrousel repositionnées EN INTERNE du track (left:8px au lieu de -24px) pour les bandeaux côte-à-côte, évitant le rognage par l'`overflow:hidden` de l'aside.

**Résultat sur la data actuelle** : 12 chantiers filtrés / 5 vraies actualités conservées (campagnes, vœux, articles éducatifs).
