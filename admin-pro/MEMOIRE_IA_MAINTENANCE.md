# 🧠 Mémoire IA — Rapport de bugs non détectés

> **Destinataire :** Agent IA de maintenance quotidienne (scan automatique du site)
> **Émetteur :** Claude (session de refonte du 13-14 mai 2026)
> **But :** Améliorer les futurs scans en y intégrant les patterns de bugs ci-dessous

Ce document recense tous les bugs trouvés manuellement pendant la session du 13-14 mai 2026 que le scan automatique n'avait **PAS** détectés. Chaque entrée propose une **règle de détection** à ajouter au scan.

---

## 🔴 BUGS CRITIQUES BLOQUANT LE BUSINESS

### 1. RLS Supabase bloquant les soumissions de formulaires publics
- **Symptôme** : "new row violates row-level security policy for table contracts" sur formulaire contrat d'entretien.
- **Cause** : Aucune policy `INSERT` pour le rôle `anon` sur la table `contracts`.
- **Impact** : 100% des soumissions du formulaire public échouaient en silence (lead perdu).
- **Règle de scan à ajouter** :
  - Lister toutes les tables référencées par les `fetch()` côté front public.
  - Pour chaque table, tester un `INSERT` anonyme avec un payload type.
  - Si erreur RLS → ALERTE CRITIQUE.
  - Vérifier que toutes les tables avec formulaire public ont une policy `anon insert` correctement scopée.

### 2. HTML5 pattern validation bloquant silencieusement le submit
- **Symptôme** : Bouton "Envoyer" sans réaction, aucune erreur console.
- **Cause** : Attribut `pattern="..."` sur des inputs CACHÉS du formulaire (steps précédents) qui bloquent la validation HTML5 du form entier sans afficher de message.
- **Règle de scan à ajouter** :
  - Pour chaque `<form>` multi-step, vérifier qu'il a `novalidate` OU que tous les champs avec `pattern`/`required` sont validés AU MOMENT de leur step uniquement.
  - Tester en simulant un clic submit sur le dernier step et vérifier que la requête réseau part.

### 3. Photo upload cassé (input display:none + label imbriqué)
- **Symptôme** : Clic sur "Ajouter une photo" sans effet.
- **Cause** : `<input type="file" style="display:none">` à l'intérieur d'un `<label>` avec d'autres handlers qui interceptaient le click.
- **Règle de scan à ajouter** :
  - Pour chaque `<input type="file">`, vérifier qu'il est soit visible, soit positionné `absolute;opacity:0;left:-9999px` (pas `display:none`).
  - Vérifier qu'aucun parent n'a `pointer-events:none` ou un handler qui fait `e.preventDefault()`.

---

## 🟠 BUGS UI / UX

### 4. Validation de wizard exigeant un état d'UI supprimée
- **Symptôme** : Bouton "Continuer" toujours désactivé en step 2.
- **Cause** : `canGoNext()` testait `state.urg` mais les boutons `.urg-btn` avaient été retirés du DOM lors d'une refonte.
- **Règle de scan à ajouter** :
  - Diff JS↔HTML : pour chaque variable de state lue dans `canGoNext()` / validators, vérifier qu'au moins un élément du DOM permet d'y écrire.
  - Si state lu mais aucune écriture possible → ALERTE.

### 5. Conflit de scripts d'autocomplete sur le même input
- **Symptôme** : Bandeau d'adresse qui reste affiché en permanence.
- **Cause** : Deux scripts (un inline + `hc-address-autocomplete.js`) attachés au même input, deux dropdowns superposés.
- **Règle de scan à ajouter** :
  - Pour chaque input avec autocomplete BAN, compter le nombre de listeners attachés et le nombre de dropdowns créés au focus.
  - Si > 1 → ALERTE de duplication.

### 6. Renommage de classe CSS cassant les handlers JS
- **Symptôme** : Les cartes de qualification ne réagissaient plus au clic.
- **Cause** : Les cards étaient passées de `.resa-need` à `.mq-card[data-presta]`, mais le `addEventListener` listait toujours `.resa-need`.
- **Règle de scan à ajouter** :
  - Extraire tous les `querySelector(All)` du JS et vérifier qu'au moins 1 élément correspond dans le HTML.
  - Si 0 match → ALERTE de selector obsolète.

### 7. Champ image vide créant une zone visuelle vide
- **Symptôme** : Cartes Actualités avec une zone grise vide en haut.
- **Cause** : `<img src="">` ou absence de fallback quand `actu.image` est null.
- **Règle de scan à ajouter** :
  - Scanner tous les `<img>` dynamiques (`src="${...}"`) et vérifier qu'il y a un fallback (placeholder SVG, `onerror`, ou test conditionnel).

---

## 🟡 BUGS DATA / CONTENU

### 8. Tables Supabase référencées mais inexistantes
- **Symptôme** : Erreur 404 silencieuse, données non chargées (actualités).
- **Cause** : Code front qui requête `actualites` mais la table n'avait jamais été créée.
- **Règle de scan à ajouter** :
  - Extraire tous les noms de tables des appels `supabase.from('...')`.
  - Pour chacun, vérifier l'existence dans `information_schema.tables`.
  - Si manquant → ALERTE + script SQL à générer.

### 9. Cron jobs non configurés
- **Symptôme** : Sync Facebook bloquée depuis le 11 mai (aucun nouvel article).
- **Cause** : `pg_cron` non programmé pour `sync-facebook-posts`.
- **Règle de scan à ajouter** :
  - Lister les edge functions qui devraient tourner périodiquement.
  - Vérifier `cron.job` dans Postgres pour chaque function attendue.
  - Si absent → ALERTE.

### 10. Sitemap incomplet
- **Symptôme** : 13 pages publiques absentes du sitemap.xml.
- **Cause** : Edge function `sitemap` avec liste hardcodée non mise à jour.
- **Règle de scan à ajouter** :
  - Lister tous les `.html` à la racine du repo.
  - Comparer à la liste des URLs dans `sitemap.xml` retournée par l'edge function.
  - Si différence → ALERTE.

### 11. Données JSON obsolètes
- **Symptôme** : Seulement 5 articles d'actualités sur 17 affichés en vitrine.
- **Cause** : `actualites.json` statique pas synchronisé avec la base.
- **Règle de scan à ajouter** :
  - Comparer le nombre de lignes en BDD (table source) vs le nombre d'entrées dans les fichiers JSON statiques.
  - Si écart > 10% → ALERTE.

### 12. Liste de marques incohérente avec le métier
- **Symptôme** : Marques de PAC (Daikin, Mitsubishi…) listées alors que l'entreprise ne fait que la chaudière.
- **Cause** : Copie/collage générique sans validation métier.
- **Règle de scan à ajouter** :
  - Croiser les listes de marques affichées avec les "métiers déclarés" dans le footer / about / schema.org.
  - Si marque hors périmètre → ALERTE LÉGÈRE (à valider humain).

### 13. Logos hot-linked sur CDN tiers
- **Symptôme** : Risque de rupture si le CDN tiers retire ou renomme le fichier.
- **Cause** : `<img src="https://cdn.fournisseur.com/logo.svg">` au lieu de `images/marques/logo.svg`.
- **Règle de scan à ajouter** :
  - Lister toutes les balises `<img>` avec `src` externe (non même origine et non `data:`).
  - Pour chaque domaine externe, tester un HEAD et vérifier le content-type.
  - Recommander de télécharger les assets critiques en local.

---

## 🔑 BUGS SÉCURITÉ / CONFIG

### 14. Clés Supabase anon révoquées encore présentes dans le code
- **Symptôme** : Erreurs 401 silencieuses sur certains endpoints.
- **Cause** : Anciennes clés `anon` hardcodées dans plusieurs HTML alors qu'elles ont été rotation côté Supabase.
- **Règle de scan à ajouter** :
  - Extraire toutes les `eyJ...` (JWT) trouvées dans le code public.
  - Tester chacune contre l'endpoint Supabase actuel (`GET /rest/v1/`).
  - Si 401 → ALERTE CRITIQUE.

### 15. Edge functions citées mais non déployées
- **Symptôme** : 404 sur appel front.
- **Cause** : Function développée localement mais jamais `supabase functions deploy`.
- **Règle de scan à ajouter** :
  - Pour chaque `fetch` vers `/functions/v1/<name>`, vérifier que `<name>` est listé dans `supabase functions list`.
  - Si absent → ALERTE.

---

## 🎨 BUGS SEO / ACCESSIBILITÉ

### 16. Titres et meta descriptions hors plages SEO
- **Symptôme** : `<title>` > 65 caractères ou `<meta description>` > 160.
- **Règle de scan à ajouter** :
  - Vérifier la longueur des `<title>` (50-65), `<meta description>` (130-160), `<h1>` unique par page.

### 17. Schema.org JSON-LD manquant ou invalide
- **Règle de scan à ajouter** :
  - Tester chaque page sur l'endpoint Schema Validator.
  - Vérifier la présence d'au moins un `LocalBusiness` sur les pages métier.

### 18. Images sans `alt`
- **Règle de scan à ajouter** :
  - Compter les `<img>` sans `alt=""` ou avec `alt=""` vide non décoratif.

---

## 📋 BUGS COMPORTEMENTAUX

### 19. Doublon de modules visuels
- **Symptôme** : Deux blocs "qualification" sur la page d'accueil au lieu d'un.
- **Cause** : Lors d'une refonte, l'ancien bloc n'a pas été retiré.
- **Règle de scan à ajouter** :
  - Détecter des `<section>` avec des classes très proches (`m-qualif` et `mq-card`) sur la même page.
  - Alerter si > 1 module de même catégorie sémantique.

### 20. CTA répétés avec libellés divergents
- **Règle de scan à ajouter** :
  - Lister tous les boutons "Demander un devis" / "Devis gratuit" / "Estimation" et vérifier qu'ils pointent vers la même URL (cohérence funnel).

---

## ✅ Plan d'action proposé à l'agent IA

À chaque scan quotidien, ajouter ces 7 sondes prioritaires :

1. **Sonde RLS** : INSERT anon test sur chaque table publique.
2. **Sonde Form** : simuler submit complet sur chaque `<form>` public et vérifier la requête sortante.
3. **Sonde Selector** : croiser JS `querySelector` ↔ HTML.
4. **Sonde Table** : croiser `supabase.from('...')` ↔ `information_schema.tables`.
5. **Sonde Function** : croiser appels `/functions/v1/...` ↔ functions déployées.
6. **Sonde Cron** : lister edge functions périodiques attendues ↔ `cron.job`.
7. **Sonde Clé** : tester chaque JWT hardcodé.

Chaque sonde retourne ✅ / ⚠️ / ❌ + le snippet incriminé + une suggestion de fix.

---

*Document généré le 14 mai 2026 — à intégrer dans la base de mémoire de l'agent.*
