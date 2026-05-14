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

## 🔵 ADDENDUM — Bugs trouvés sur seconde passe (14 mai 2026)

### 21. Bouton désactivé sans message d'aide
- **Symptôme** : L'utilisateur tape "dez" (3 caractères) dans la description d'un wizard, le bouton "Continuer →" reste désactivé en gris. Aucun message, aucun feedback. L'utilisateur ne sait pas quoi faire.
- **Cause** : `canGoNext()` exigeait `state.desc.trim().length > 5` sans aucun hint visuel à côté du bouton.
- **Règle de scan à ajouter** :
  - Pour chaque bouton avec `disabled` au render initial OU `disabled` géré dynamiquement, vérifier qu'un élément texte adjacent (frère ou cousin proche) contient un hint qui explique la condition manquante.
  - Si bouton désactivé sans texte explicatif à moins de 3 niveaux DOM → ALERTE UX.

### 22. Multi-select sans state JS
- **Symptôme** : Des `<input type="checkbox">` dans un groupe de chips multi-choix laissent l'utilisateur cocher visuellement, mais aucune variable JS ne capture la sélection. À la soumission, l'info se perd.
- **Cause** : Aucun `addEventListener('change', …)` n'est attaché aux checkboxes du groupe.
- **Règle de scan à ajouter** :
  - Pour chaque groupe `<input type="checkbox" name="…[]">` (notation tableau), vérifier qu'il existe un listener `change` qui les lit collectivement.
  - Si le payload final (submit/mailto) ne référence pas le nom du groupe → ALERTE.

### 23. Page admin référençant des scripts inexistants
- **Symptôme** : Console error "Failed to load resource: assets/admin-config.js" + page blanche.
- **Cause** : Copie d'un template d'une autre stack ; les noms de scripts ne matchent pas ceux du projet.
- **Règle de scan à ajouter** :
  - Pour chaque `<script src="…">` local d'une page admin, vérifier que le fichier existe.
  - Si 404 → ALERTE CRITIQUE.

### 24. Widget chatbot manquant sur certaines pages publiques
- **Symptôme** : Le chatbot n'apparaît pas sur `realisation.html` et `nos-prestations.html`.
- **Cause** : `<script src="assets/hc-widgets.js">` oublié au moment de la création/refonte de ces pages.
- **Règle de scan à ajouter** :
  - Lister toutes les pages publiques `.html` (exclut admin-pro et 404).
  - Vérifier que `hc-widgets.js` est référencé sur chaque.
  - Si manquant → ALERTE.

### 25. Inputs `required` et `pattern` dans un wizard non-form
- **Symptôme** : Aucun effet runtime, mais c'est trompeur en lecture de code et risque de bugger plus tard si on enveloppe le wizard dans un `<form>`.
- **Cause** : Copie de markup form classique sans nettoyage.
- **Règle de scan à ajouter** :
  - Détecter les `required` / `pattern` sur des inputs qui ne sont PAS descendants d'un `<form>`.
  - Suggérer de les retirer ou de valider en JS.

### 26. URL hardcodée d'edge function (couplage projet Supabase)
- **Symptôme** : Si le projet Supabase change de ref (`btcbjwqiivhpwoszomhg`), tout le front casse silencieusement.
- **Cause** : URL `https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/…` répétée dans plusieurs fichiers.
- **Règle de scan à ajouter** :
  - Détecter les chaînes URL Supabase répétées dans plusieurs fichiers.
  - Recommander de centraliser dans une seule constante (`SUPABASE_URL` ou un fichier `config.js`).

### 27. Modal de chargement sans bouton d'annulation
- **Symptôme** : Quand l'IA met 20s à répondre, l'utilisateur ne peut pas fermer la modale "Analyse en cours…" → impression de blocage.
- **Cause** : L'animation de chargement n'est pas accompagnée d'un bouton "Annuler".
- **Règle de scan à ajouter** :
  - Pour chaque modale qui attend un fetch async > 5s typiquement, vérifier qu'un bouton de fermeture reste accessible pendant l'attente.

### 28. Pas de gestion d'erreur RLS sur lecture publique
- **Symptôme** : Si la table n'existe pas encore (script SQL non exécuté), la page affiche une erreur Supabase brute incompréhensible.
- **Cause** : Pas de catch sur `error.code === '42P01'` (table missing).
- **Règle de scan à ajouter** :
  - Pour chaque `from('…').select`, vérifier qu'un test `error.code === '42P01'` est présent OU qu'un fallback explicite est affiché.
  - Sinon → ALERTE UX (message d'erreur trop technique pour le user).

### 29. URL hardcodée pour edge function dans plusieurs places
- **Symptôme** : Risque de fork de version si une URL est mise à jour à un endroit et oubliée ailleurs.
- **Cause** : Cf. #26, généralisation.
- **Règle de scan à ajouter** :
  - Pour chaque `/functions/v1/<name>`, lister les fichiers source qui contiennent cette chaîne. Si > 2 fichiers → suggestion de factoriser.

### 30octies. 🚨 CRITIQUE — Tarifs inventés par IA en production
- **Symptôme** : Catalogue plomberie affichait "89 € TTC", "149 € TTC", "119 € TTC", "187-203 € TTC"… alors qu'AUCUNE source officielle ne fournissait ces prix.
- **Cause racine** : L'agent IA (moi) a inventé des fourchettes "plausibles" pour le secteur, sans valider avec le client.
- **Impact** : Engagement légal envers les clients qui réservent au prix affiché. Risque de plainte, de mauvaise réputation et de non-respect de l'obligation d'information précontractuelle (Code de la consommation, art. L. 111-1).
- **Correctif appliqué** : Remplacement de tous les tarifs inventés par "sur devis · annoncé avant intervention". Le vrai pricing viendra du catalogue admin (table `services` colonnes `price_ht` + `vat_rate`).
- **Règle de scan À AJOUTER EN PRIORITÉ 1** :
  - Scanner tous les fichiers `.html` publics pour détecter les motifs `\d+\s*€` ou `\d+,\d+\s*€` ou `\d+\s*€\s*TTC`.
  - Pour chaque tarif trouvé, vérifier qu'il provient d'une source authoritaire :
    a) soit lu via `fetch` depuis la table `services` (prix dynamique),
    b) soit présent dans `app_settings` avec une clé `validated_prices.<service_slug>`,
    c) soit explicitement marqué `data-source="<reference>"`.
  - Si AUCUNE source → ALERTE CRITIQUE rouge.
  - Le scan doit refuser de laisser passer un site en prod avec des tarifs "orphelins" non rattachés à une source de vérité.

### 30sexies. Bouton mobile flottant qui déborde du viewport
- **Symptôme** : Un bouton CTA fixed `bottom:14px;left:14px;right:14px` apparaît sur les pages métier alors qu'un bouton tel équivalent existe déjà dans le header sticky → doublon visible + déborde du viewport sur certaines largeurs (entre 980 et 1100px) car la media-query de masquage est `min-width:1100px`.
- **Cause** : Élément `.sticky-call` historique ajouté avant que le header sticky n'embarque le bouton tel.
- **Correctif appliqué** : `display:none !important` sur `.sticky-call`.
- **Règle de scan à ajouter** :
  - Détecter les éléments `position:fixed` qui dupliquent un CTA déjà présent dans le header.
  - Vérifier la cohérence des breakpoints d'apparition/masquage entre éléments fixed de la même intention.

### 30septies. Topbar paraît changer de dimensions entre pages
- **Symptôme** : L'utilisateur perçoit que la barre orange du haut a une taille différente selon la page consultée.
- **Cause potentielle** : `.hc-topbar` a `flex-wrap:wrap`, donc le contenu (Saint-Omer + Dunkerque + horaires) peut wrapper sur 1 ou 2 lignes selon la largeur disponible. Le CSS est identique sur toutes les pages, mais des CSS additionnels (`index-hero.css`, `index-reservation.css`) sur certaines pages peuvent décaler le contenu et provoquer un wrap différent.
- **Règle de scan à ajouter** :
  - Pour chaque composant partagé (header, footer, topbar), capturer son `offsetHeight` à largeur fixe sur chaque page et alerter si les hauteurs divergent de plus de 5%.
  - Vérifier que chaque page charge la même liste de CSS dans le même ordre.

### 30quinquies. Duplication de logique entre home et page liste (DRY violé)
- **Symptôme** : Le placeholder amélioré (icône métier + gradient) est appliqué sur `index.html` mais PAS sur `actualites.html`. Résultat : la page de liste affiche encore les vieilles cards génériques "Article" alors que la home a la version améliorée.
- **Cause** : Deux moteurs de rendu d'actualités vivent dans deux fichiers HTML séparés, avec leur propre code JS de génération de card. Aucune fonction partagée.
- **Règle de scan à ajouter** :
  - Détecter les patterns de génération de card (`function*Card`, `.actu-card`, `.hc-mini-card`) qui apparaissent dans plus d'un fichier HTML.
  - Suggérer d'extraire la logique dans `assets/hc-card-renderer.js` partagé.
  - Quand un fix UI est appliqué à un fichier, alerter si d'autres fichiers partagent la même structure non patchée.

### 30quater. Slogan / contenu marketing dupliqué sur 30+ fichiers HTML
- **Symptôme** : Quand le client veut supprimer un slogan, il faut éditer 30 fichiers. Une seule oubli = incohérence visible.
- **Cause** : Le site est un site statique sans système d'include/partial pour les composants partagés (header, footer).
- **Règle de scan à ajouter** :
  - Détecter les blocs HTML strictement identiques (par hash) répétés > 5 fichiers (typiquement header, footer, bandeau).
  - Suggérer d'extraire en partial chargé via fetch côté client OU build-time include.
  - Pour les sites Netlify, suggérer l'usage d'Edge Functions ou de `data-include` JS.

### 30ter. Payload INSERT avec colonnes inexistantes ou NOT NULL vidé
- **Symptôme** : Un fetch POST vers Supabase REST renvoie un 4xx silencieux (best-effort, ne bloque pas l'UX) → aucun lead enregistré.
- **Cause** : Le payload JS contenait une clé `meta` qui n'existe pas dans le schéma de `leads` (la vraie colonne est `utm`/`tags`/`notes_internes`). Et `nom` était `null` alors qu'il est `NOT NULL` en BDD.
- **Règle de scan à ajouter** :
  - Pour chaque appel `fetch('/rest/v1/<table>', { method: 'POST', body: JSON.stringify(...) })`, extraire les clés du payload et croiser avec `information_schema.columns` pour la table.
  - Si une clé envoyée n'existe pas dans la table → ALERTE.
  - Si une colonne `NOT NULL` est absente du payload OU envoyée à `null` → ALERTE.
  - Bonus : si une colonne a une `CHECK` constraint, vérifier que la valeur envoyée respecte la contrainte.

### 30bis. Images vides dans JSON statique → placeholder générique partout
- **Symptôme** : Sur la home, le carousel "Nos dernières actualités" affiche systématiquement un placeholder "❓ HELP! Confort" au lieu d'images de chantiers.
- **Cause racine** : Toutes les entrées de `content/actualites/index.json` ont `"image": ""` ET `"source_facebook": ""`. Le code passe au fallback générique.
- **Cause amont** : La sync Facebook qui devait peupler ces champs ne tourne pas (cf. bug #9 cron non configuré).
- **Correctif court terme** : Améliorer le placeholder pour qu'il devine le métier depuis le titre (`mitigeur` → 💧 Plomberie, `vitrage` → 🪟 Vitrerie, `panneau PVC` → 🚪 Menuiserie) avec un gradient et une icône appropriée. Ajout `onerror` sur `<img>` pour fallback gracieux.
- **Règle de scan à ajouter** :
  - Pour chaque JSON statique du site (`content/**/*.json`), compter les entrées avec champ image vide.
  - Si plus de 50% des entrées ont une image vide ET un fallback placeholder existe → ALERTE INFO + suggérer d'enrichir.
  - Vérifier en parallèle que la source amont (cron sync, scraper FB) tourne bien.

### 30. Manque de boucle d'amélioration sur features IA
- **Symptôme** : Un chatbot IA déployé sans mécanisme de retour qualité finit par stagner.
- **Solution implémentée cette session** :
  - Table `chat_conversations` avec colonnes `rating` (1-5) et `rating_notes`.
  - Edge function `suggest-prompt-improvement` qui analyse les conversations notées ≤3/5 et propose des améliorations concrètes au system prompt.
  - Bouton ✨ dans l'admin pour déclencher l'analyse à la demande.
- **Règle générique pour le scan** :
  - Pour chaque feature IA déployée, vérifier qu'il existe :
    a) Un mécanisme de notation utilisateur ou admin.
    b) Un mécanisme d'analyse des sessions ratées.
    c) Une boucle de feedback documentée dans le code.

---

## 🆕 Sondes additionnelles pour le scan IA (v2)

À ajouter aux 7 sondes initiales :

8. **Sonde Hint** : pour chaque bouton désactivé au render, exiger un message d'aide adjacent.
9. **Sonde Multi-select** : pour chaque groupe de checkboxes `name="x[]"`, vérifier le listener `change` + l'inclusion dans le payload.
10. **Sonde Script-404** : pour chaque `<script src>` local, vérifier l'existence du fichier.
11. **Sonde Widget-coverage** : tous les `hc-widgets.js`, `hc-address-autocomplete.js`, etc. sur les pages publiques attendues.
12. **Sonde Required-orphan** : `required`/`pattern` hors `<form>`.
13. **Sonde URL-DRY** : URLs d'edge functions répétées > 2 fichiers.
14. **Sonde Modal-escape** : modales async sans bouton de fermeture.
15. **Sonde 42P01** : `.from().select()` sans gestion d'erreur table manquante.
16. **Sonde Feedback-loop** : features IA sans mécanisme de notation+amélioration.
17. **Sonde JSON-images-vides** : JSON statique avec >50% d'entrées sans image → alerte de pipeline d'enrichissement cassé.
18. **Sonde Payload-schema** : croiser les clés de chaque payload INSERT REST avec les colonnes réelles de la table cible.
19. **Sonde DRY-UI** : détecter les blocs HTML strictement identiques ou les fonctions de rendu UI dupliquées entre plusieurs fichiers — alerter quand un fix UI sur un fichier laisse les autres dans l'état précédent.
20. **Sonde Partial-orphan** : un même header/footer/slogan textuel répété > 5 fichiers → suggestion d'extraire en partial.
21. **Sonde CTA-doublon-fixed** : élément `position:fixed` qui duplique un CTA déjà présent dans le header sticky → alerte de redondance + risque de débordement viewport.
22. **Sonde Composant-stable** : capturer `offsetHeight` de chaque composant partagé sur chaque page à largeur fixe, alerter si divergence > 5%.
23. **🚨 Sonde Tarif-orphelin (PRIORITÉ ABSOLUE)** : tout montant `\d+\s*€` ou `\d+,\d+\s*€` ou `\d+\s*€\s*TTC` détecté dans une page publique doit être rattaché à une source de vérité (table `services`, `app_settings.validated_prices`, ou attribut `data-source`). Sinon : ALERTE rouge, halte recommandée du déploiement.

---

## ✅ Plan d'action proposé à l'agent IA (v2)

À chaque scan quotidien, ajouter ces **16 sondes** prioritaires :

1. **Sonde RLS** — INSERT anon test sur chaque table publique
2. **Sonde Form** — simuler submit complet et vérifier la requête sortante
3. **Sonde Selector** — croiser JS `querySelector` ↔ HTML
4. **Sonde Table** — croiser `supabase.from('...')` ↔ `information_schema.tables`
5. **Sonde Function** — croiser appels `/functions/v1/...` ↔ functions déployées
6. **Sonde Cron** — lister edge functions périodiques attendues ↔ `cron.job`
7. **Sonde Clé** — tester chaque JWT hardcodé
8. **Sonde Hint** — bouton désactivé sans texte d'aide
9. **Sonde Multi-select** — groupes de checkboxes sans listener `change`
10. **Sonde Script-404** — `<script src>` local invalide
11. **Sonde Widget-coverage** — JS attendu manquant sur certaines pages
12. **Sonde Required-orphan** — `required`/`pattern` hors `<form>`
13. **Sonde URL-DRY** — URLs d'edge functions répétées
14. **Sonde Modal-escape** — modales async sans fermeture possible
15. **Sonde 42P01** — `select()` sans fallback table manquante
16. **Sonde Feedback-loop** — features IA sans notation+analyse

Chaque sonde retourne ✅ / ⚠️ / ❌ + le snippet incriminé + une suggestion de fix.

---

*Document généré le 14 mai 2026 — version 2 enrichie le même jour avec 10 nouveaux bugs et 9 nouvelles sondes.*
