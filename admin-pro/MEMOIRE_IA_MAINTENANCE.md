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

### 30decies. Catalogue métier pollué par d'autres métiers (cohérence sémantique cassée)
- **Symptôme** : La page plomberie affichait des prestations chauffage (entretien chaudière, désembouage radiateur). Le client cherche du dépannage plomberie, voit des cards chauffage → confusion.
- **Cause** : Sélection des prestations vedettes basée sur l'univers "plomberie" + mots-clés trop larges. Beaucoup d'opérations chauffage sont rangées dans l'univers "plomberie" de la base produits.
- **Correctif appliqué** : Filtrage strict par exclusion (chauffage/chaudière/radiateur/désembouage exclus de plomberie) + sélection manuelle des prestations vedettes par métier.
- **Règle de scan à ajouter** :
  - Pour chaque page métier, lister les noms de prestations affichées.
  - Détecter les mots-clés "d'un autre métier" (ex : "chaudière" sur la page plomberie, "ouverture porte" sur la page chauffage).
  - Si > 10% des cards utilisent du vocabulaire d'un autre métier → ALERTE cohérence.

### 30nonies. Bouton "Réserver" sans choix devis/paiement
- **Symptôme** : Le bouton Réserver des cards tarifs envoyait directement vers contact.html, sans distinguer "je veux juste un devis" de "je veux acheter en ligne".
- **Cause** : Lien direct unique. L'intention du clic n'était pas captée.
- **Correctif appliqué** : Modale globale `hc-reserve-modal.js` qui intercepte les clics et propose 2 voies (devis vs réservation+paiement), avec UI distincte côté contact.html.
- **Règle de scan à ajouter** :
  - Pour chaque bouton de réservation/achat sur une page commerciale, vérifier qu'il existe un branchement clair entre "demande d'info" et "intention d'achat".
  - Sinon → suggérer une modale ou un splitter de tunnel de conversion.

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
- **Symptôme** : Sur la home, le carousel "Nos dernières actualités" affiche systématiquement un placeholder "❓ HELP Confort" au lieu d'images de chantiers.
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
24. **Sonde Cohérence métier** : sur chaque page métier, vérifier que ≥ 90% des prestations affichées utilisent le vocabulaire du métier déclaré. Détecter les contaminations croisées (ex : chaudière sur la page plomberie).
25. **Sonde Tunnel de conversion** : tout bouton CTA d'achat/réservation doit proposer un branchement clair entre "demande d'info" et "intention d'achat" — pas de lien unique flou.
26. **Sonde Mégamenu sticky** : un mégamenu sans `mouseleave` programmé reste ouvert et bloque les clics sur le contenu sous-jacent. Vérifier la présence d'un `setTimeout` de fermeture après hover-out.

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

---

## 🔵 ADDENDUM v3 — Bugs trouvés sur troisième passe (15 mai 2026)

### 31. FAQ partagée non métier-specific sur 5 pages saint-omer
- **Symptôme** : Les pages `electricien-saint-omer.html`, `serrurier-saint-omer.html`, `chauffagiste-saint-omer.html`, `travaux-saint-omer.html` contiennent toutes la même FAQ avec des questions plomberie ("recherche de fuite", "débouchage de canalisation", "Professionnel du Gaz®"). Sur la page électricien, un client cherchant "tarif tableau électrique" tombe sur du contenu plomberie → confusion + cohérence métier cassée (sonde #24).
- **Cause** : Bloc FAQ copié-collé tel quel lors de la création des pages métier sans rewrite par métier. Seule la mention "urgences X" change (substitution naïve), pas le contenu des réponses.
- **Correctif appliqué** : Tarifs FAQ corrigés (sonde #23) MAIS contenu non rewrité — le rewrite par métier reste à faire.
- **Règle de scan à renforcer** :
  - Sonde #24 (Cohérence métier) doit s'étendre aux blocs FAQ : si plus de 50% des questions FAQ d'une page métier X utilisent du vocabulaire d'un autre métier Y → ALERTE.
  - Détecter les blocs FAQ identiques (hash) entre plusieurs pages métier différentes → suggérer rewrite spécifique.

### 32. JSON-LD FAQPage doublonné non synchronisé avec le HTML
- **Symptôme** : Si un développeur édite la FAQ HTML (le `<details>`) mais oublie de mettre à jour le JSON-LD `FAQPage` correspondant (~70 lignes plus bas), Google indexe une version désynchronisée du contenu.
- **Cause** : Le contenu de chaque réponse FAQ est dupliqué entre `<div class="faq-answer">` et le bloc JSON-LD `"acceptedAnswer": { "text": "..." }` sans mécanisme de génération automatique.
- **Règle de scan à ajouter** :
  - Pour chaque page avec un `script type="application/ld+json"` typé `FAQPage`, croiser le texte de chaque `acceptedAnswer.text` avec le contenu textuel des `.faq-answer` du HTML.
  - Si divergence → ALERTE (peut être un fix oublié).
  - Suggérer d'extraire les FAQ dans un JSON externe + rendu HTML+JSON-LD partagé.

### Sondes additionnelles v3 (à intégrer au scan IA)
27. **Sonde FAQ-cohérence-métier** : détecter les blocs FAQ partagés entre pages métier différentes ; alerter si >50% du vocabulaire est hors métier de la page.
28. **Sonde FAQ-JSON-LD-sync** : croiser texte HTML `.faq-answer` ↔ `acceptedAnswer.text` JSON-LD ; alerter en cas de divergence.

---

### 33. Schema.org `@type` = "Plumber" copié-collé sur les 5 pages métier
- **Symptôme** : `chauffagiste-saint-omer.html`, `electricien-saint-omer.html`, `serrurier-saint-omer.html`, `travaux-saint-omer.html` déclaraient toutes `@type: "Plumber"` dans le bloc `HC-SERVICE-SCHEMA-V1`. Description identique à celle de plombier ("dépannage… fuite… dégorgement… ballon d'eau chaude") sur toutes les pages. Google déduit que le site est un plombier qui propose aussi du chauffage/électricité plutôt qu'un multi-métier — pénalisant pour les requêtes type "électricien Saint-Omer".
- **Cause** : Template copié sans changer `@type`/`description` lors de la duplication des pages métier.
- **Correctif appliqué (15/05)** : Migration vers `HC-SERVICE-SCHEMA-V2` avec `@type` spécifique par métier (`HVACBusiness`, `Electrician`, `Locksmith`, `GeneralContractor`), description rewrites + `geo` + offres détaillées avec prix réels base produits.
- **Règle de scan à ajouter** :
  - Pour chaque page `*-saint-omer.html` métier, croiser `@type` JSON-LD avec le nom du métier dans le slug. Mapping attendu : plombier→Plumber, chauffagiste→HVACBusiness, electricien→Electrician, serrurier→Locksmith, travaux→GeneralContractor.
  - Si mismatch → ALERTE.

### 34. URLs JSON-LD malformées (accent + espace dans `url`)
- **Symptôme** : 
  - `electricien-saint-omer.html` déclarait `"url": "https://www.depan59-62.fr/électricien-saint-omer.html"` (accent é alors que le fichier est sans accent).
  - `travaux-saint-omer.html` déclarait `"url": "https://www.depan59-62.fr/expert travaux-saint-omer.html"` (espace + préfixe inexistant).
- **Cause** : Champ `url` rédigé à la main sans vérifier le slug réel.
- **Correctif appliqué (15/05)** : URLs normalisées dans `HC-SERVICE-SCHEMA-V2`.
- **Règle de scan à ajouter** :
  - Pour chaque JSON-LD à la racine du site, extraire `url` ; vérifier qu'il pointe vers un fichier réellement existant (HEAD 200) et que le slug correspond au filename (pas d'accent, pas d'espace, pas de préfixe parasite).

### Sondes additionnelles v4 (à intégrer au scan IA)
29. **Sonde Schema-@type-métier** : sur pages `<métier>-saint-omer.html`, vérifier que `@type` correspond au mapping attendu (Plumber/HVACBusiness/Electrician/Locksmith/GeneralContractor).
30. **Sonde JSON-LD-URL-valide** : valider chaque `url` JSON-LD avec un HEAD HTTP + cohérence slug.

---

*Addendum v3 généré le 15 mai 2026 par l'agent autonome — 2 nouveaux bugs + 2 nouvelles sondes.*
*Addendum v4 généré le 15 mai 2026 par l'agent autonome — 2 bugs schema.org + 2 nouvelles sondes.*

---

### 35. Double bloc JSON-LD `FAQPage` sur les 5 pages métier (top HC-FAQ-SCHEMA-V1 + bottom FAQ section)
- **Symptôme** : Chaque page `<métier>-saint-omer.html` contient 2 blocs `<script type="application/ld+json">` typés `FAQPage` — l'un en haut (HC-FAQ-SCHEMA-V1, 4 questions génériques "tarif/urgence/assurance/chauffe-eau") et l'autre en bas (5 questions liées au métier après rewrite 15/05). Google peut ne retenir qu'un seul des deux, et les deux blocs sont désynchronisés des `<details>` HTML.
- **Cause** : Le bloc HC-FAQ-SCHEMA-V1 a été ajouté à la création des pages métier sans HTML correspondant ; le bloc bottom a été ajouté plus tard avec ses propres `<details>` HTML.
- **Correctif à appliquer** : Fusionner en 1 seul bloc JSON-LD `FAQPage` synchronisé avec les `<details>` HTML. Supprimer HC-FAQ-SCHEMA-V1.
- **Correctif appliqué (15/05 PM)** : Bloc top HC-FAQ-SCHEMA-V1 supprimé sur les 5 pages métier (plombier/électricien/serrurier/chauffagiste/travaux-saint-omer.html), remplacé par un commentaire-trace. Le bloc FAQPage bottom restant est synchronisé avec les `<details>` HTML métier-spé (audit `re.findall` : 5/5 sync OK). Google ne voit plus qu'un seul bloc FAQPage par URL.
- **Règle de scan à ajouter** :
  - Pour chaque page HTML, compter le nombre de blocs `<script type="application/ld+json">` dont `@type === "FAQPage"`.
  - Si > 1 → ALERTE (Google recommande un seul bloc FAQPage par URL).

### 36. Top FAQ (HC-FAQ-SCHEMA-V1) contient encore du vocabulaire plomberie sur les pages non-plomberie
- **Symptôme** : La Q2 du bloc HC-FAQ-SCHEMA-V1 répond "fuite, ballon HS, canalisation bouchée" sur les pages électricien/serrurier/chauffagiste/travaux. Q4 "Posez-vous des chauffe-eau neufs ?" sur la page serrurier ou électricien.
- **Cause** : Bug #31 (FAQ partagée) — le rewrite 15/05 a touché uniquement la FAQ HTML bottom, pas le top-FAQ JSON-LD.
- **Correctif à appliquer** : Voir bug #35 (fusion en 1 seul bloc avec contenu métier-spé).
- **Correctif appliqué (15/05 PM)** : Résolu par #35 (suppression du bloc top HC-FAQ-SCHEMA-V1).

### Sondes additionnelles v5
31. **Sonde FAQPage-doublon** : compter les `<script type="application/ld+json">` typés `FAQPage` sur chaque page ; alerter si > 1.
32. **Sonde FAQ-top-métier-cohérence** : étendre sonde #27 au bloc HC-FAQ-SCHEMA-V1, pas uniquement aux `<details>` HTML.

*Addendum v5 généré le 15 mai 2026 par l'agent autonome — 2 bugs FAQPage doublonnée + 2 nouvelles sondes.*

---

### Sondes additionnelles v6 (15 mai 2026 PM)
33. **Sonde console.log résiduels** : `grep -nE "console\.(log|debug|trace)\(" *.html` sur la racine. Seuil : **0** match en prod (toléré sous `admin-pro/` et `scripts/`). Si match → ALERTE *fuite info debug*. Audit 15/05 16h45 : 0 match racine ✓.
34. **Sonde tarif inventé** : pour chaque match `\d+\s*€` sur les pages publiques racine, croiser avec `TARIFS_REFERENCE.md`. Tout montant non trouvé ET élément sans `data-source` voisin → ALERTE *tarif non sourcé*. Référencer le bug #23 (data-source manquant).
35. **Sonde RFC 9116** : vérifier que `.well-known/security.txt` existe ET que la date `Expires:` est dans le futur. Si manquant ou expiré → ALERTE.

*Addendum v6 généré le 15 mai 2026 par l'agent autonome — 3 nouvelles sondes (debug log, tarif inventé, security.txt expiré).*

---

### Sondes additionnelles v7 (15 mai 2026 — scripts d'audit exécutables)

Deux scripts d'audit Python ont été ajoutés sous `admin-pro/audits/` pour matérialiser les sondes #34 (tarif inventé) et la nouvelle #36 (data-source orphelin) :

- `audit_tarifs.py` → rapport `audit_tarifs_report.md` + `.json`. Croise tous les `\d+\s*€` des pages publiques racine avec `TARIFS_REFERENCE.md`. Première exécution 15/05 PM : **38 pages scannées, 45 montants validés reconnus, 25 alertes** (essentiellement guides avec estimations marché non marquées + quelques cards de tarifs sans `data-source`).
- `audit_datasource.py` → rapport `audit_datasource_report.md` + `.json`. Recense tous les attributs `data-source="..."` et vérifie le format. Première exécution 15/05 PM : **6 pages, 75 occurrences, 0 alerte** après whitelist des widgets non-tarifaires (`google`, `trustville`, `trustpilot`, `facebook`, `avis-verifies`).

36. **Sonde data-source orphelin** : pour chaque attribut `data-source="X"`, vérifier que `X` matche l'un des formats reconnus : `base-produits-YYYY-MM`, `BAREME AGENCE`, `devis YYYY-MM-DD`, `TARIFS_REFERENCE`, `estimation marché`, ou widget-avis (google/trustville/trustpilot/facebook/avis-verifies). Tout autre → ALERTE *source inconnue*.
37. **Sonde data-source obsolète** : la sous-règle de #36 alerte aussi quand `base-produits-YYYY-MM` ou `devis YYYY-MM-DD` ont plus de 12 mois → ALERTE *source périmée* (recroiser avec la base produits courante).

**Intégration scan quotidien** : ajouter à la suite des autres audits de `admin-pro/audits/` un appel à ces deux scripts ; consolider les rapports dans le digest. Si nb_alertes > 0 sur `audit_tarifs.py` → escalader à Florian (décision éditoriale, ne pas auto-corriger les prix).

*Addendum v7 généré le 15 mai 2026 par l'agent autonome — 2 nouvelles sondes #36-#37 + 2 scripts d'audit exécutables (tarifs + data-source).*

---

### Sondes additionnelles v8 (15 mai 2026 PM — accessibilité + RGPD)

38. **Sonde ARIA / a11y** : `admin-pro/audits/audit_aria.py` scanne 37 pages publiques racine et détecte 5 codes — `BTN-NO-NAME` (erreur), `A-NO-NAME` (warn), `IMG-NO-ALT` (warn), `INPUT-NO-LABEL` (warn), `DIALOG-NO-LABEL` (erreur), plus H1/DUP-ID/HTML-LANG. Première exécution 15/05 PM : **35 findings, 23 pages clean, 7 pages avec erreurs**. Codes à corriger en priorité : `BTN-NO-NAME` (3 occurrences sur index.html) + `DIALOG-NO-LABEL` (7 modales). Intégrer au scan quotidien : si nb_pages_erreur augmente entre deux scans → ALERTE régression a11y.
39. **Sonde Consent RGPD** : sur chaque page publique, vérifier que `assets/hc-consent.js` est référencé ET que `assets/tracking.js` (si présent) commence par le bloc `HC-CONSENT-V1` (garde `localStorage.getItem('hc-consent') === 'granted'`). Si tracking.js charge GA4/GTM/Clarity sans garde → ALERTE CRITIQUE *RGPD violé* (article 82 LIL).
40. **Sonde PWA manifest** : vérifier qu'`every` page publique a `<link rel="manifest">` ET `<meta name="theme-color">` ET `<link rel="apple-touch-icon">`. Vérifier que manifest.json contient icons 192/512 PNG. Si manquant → ALERTE.

*Addendum v8 généré le 15 mai 2026 par l'agent autonome — 3 nouvelles sondes (ARIA, Consent RGPD, PWA manifest) + script `audit_aria.py`.*

---

### Sondes additionnelles v9 (15 mai 2026 — session Claude A→Z compactée)

41. **Sonde CSP whitelist** : vérifier que `netlify.toml` Content-Security-Policy contient les domaines de TOUS les `<script src="https://...">` et `<link href="https://...">` utilisés sur le site. Pattern : extraire les hosts de toutes les balises `<script>` et `<link rel="stylesheet">` de toutes les pages racine, puis grep dans `netlify.toml` `script-src`/`style-src`. Si un host manque → ALERTE CRITIQUE *CSP block* (révélé par bug "map beuguer" 15/05 — `unpkg.com` chargé sur zones-intervention.html mais absent du CSP, donc Leaflet bloqué).

42. **Sonde Leaflet map init** : si la page contient `L.map(` ou `new L.Map(`, vérifier la présence d'un `setTimeout(() => map.invalidateSize(), 250)` OU d'un `window.addEventListener('load', ...)` après init. Sans cela, les conteneurs avec `aspect-ratio` ou `display:none` initial rendent des tuiles grises (bug "carte vide" récurrent).

43. **Sonde délais d'intervention** : pour les pages publiques racine, alerter sur les patterns commerciaux non engageables : `sous \d+\s*h(?!eures)`, `rappel sous`, `réponse sous`, `intervention sous \d`, `en moins de \d+`, `Délai moyen`, `remise en service en \d`. Ces patterns créent un engagement contractuel non tenable et exposent juridiquement HC (cf. décision Florian 15/05 : "retirer tous les délais présent sur le site"). Tolérer `7j/7`, `Lun-Sam 8h-18h`, `24h/24` (info structurelle, pas un délai promis).

44. **Sonde balises </head> et <body>** : pour chaque page publique, vérifier la présence des deux balises de fermeture/ouverture. Bug constaté 15/05 sur aides.html et processus.html — un fichier sans `</head>` ni `<body>` est toléré par les navigateurs mais déclenche le mode "quirks-lite" et peut casser le parseur JSON-LD de Google. Pattern : `grep -c '</head>\|<body'` doit retourner ≥ 2 chacun.

45. **Sonde Open Graph image** : chaque page publique doit avoir `<meta property="og:image" content="...">` ET le fichier référencé doit exister sur disque. Vérifier également les dimensions (`og:image:width` 1200, `og:image:height` 630). Sans OG image, Facebook/LinkedIn/Twitter génèrent un visuel par défaut désastreux (logo cropé, texte non lisible).

46. **Sonde aria-label sur inputs** : pour chaque `<input>` qui n'est pas `type="hidden|submit|button|reset|checkbox|radio|range|color|file"` ET qui n'a pas d'`id=`, vérifier la présence d'un `aria-label` OU d'un `aria-labelledby` OU d'un `<label>` parent. Le placeholder seul ne suffit pas (lecteurs d'écran l'ignorent une fois rempli). Mapping standard : `name="prenom"` → `aria-label="Prénom"`, `name="tel"` → `aria-label="Téléphone"`, etc. — voir `scripts/gen_og_images.py` style NAME_LABELS pour le dictionnaire.

47. **Sonde Service Worker version cache** : à chaque release d'assets (images, CSS, JS, OG), incrémenter `VERSION` dans `sw.js`. Pattern : `grep "const VERSION" sw.js` → si la version est ancienne (> 7 jours) ET qu'il y a eu push d'assets entre-temps → ALERTE *SW cache obsolète*. Sans bump, les utilisateurs récurrents continuent de servir l'ancienne version cached.

48. **Sonde sitemap pages manquantes** : croiser les `*.html` publics racine (hors `404.html` et `test-*`) avec les `<loc>` du `sitemap.xml`. Toute page absente → ALERTE *sitemap incomplet*. Bug constaté 15/05 : faq, témoignages, avant-après, devis-express absents du sitemap après leur création récente.

49. **Sonde catalogue dynamique avec fallback local** : pour les pages qui chargent leur contenu depuis Supabase (nos-prestations, témoignages, avant-après), vérifier la présence d'un `LOCAL_CATALOG`/`FALLBACK_DATA` hardcodé dans le `<script>` JS. Sans fallback, une coupure Supabase ou une RLS bloquée affiche une page vide et fait perdre 100% des leads. Pattern : grep `LOCAL_CATALOG|FALLBACK_` dans les fichiers concernés ; si Supabase fetch sans fallback → ALERTE.

50. **Sonde audit Lighthouse local** : exécuter `python3 admin-pro/audits/audit_lighthouse_local.py` quotidiennement et alerter si score moyen < 95/100 ou si nouvelles erreurs (par rapport au dernier rapport). Ce script vérifie title/description length, og:image, canonical, h1 unique, html lang, alt, viewport, charset, DOCTYPE, preconnect, lazy-loading.

*Addendum v9 généré le 15 mai 2026 par Claude (session A→Z) — 10 nouvelles sondes critiques (#41–#50) couvrant CSP/Leaflet/délais/HTML5/OG/A11y/SW/Sitemap/Fallback/Lighthouse.*

---

### Sondes additionnelles v10 (15 mai 2026 PM — session A→Z autonome)

51. **Sonde double nav identique** : si le menu nav contient 2 entrées qui pointent vers des pages au contenu similaire (ex. Réalisations + Actualités), fusionner en 1 entrée + ajouter une section dans la page cible. Bug fix 15/05 : nav passait de 7 à 6 liens, gain visuel en topbar.

52. **Sonde ponctuation FR typographie** : pour chaque page publique, compter les occurrences de ?!:;» NON précédés d'un `&nbsp;` ou espace insécable. Si > 5 → ALERTE *typographie FR non conforme*. Bug fix 15/05 : 870+ &nbsp; ajoutés sur 37 pages.

53. **Sonde heading hierarchy** : vérifier qu'il n'y a pas de skip de niveau (h1→h3, h2→h4, etc.). Pattern : extraire la séquence de `<h[1-6]>` dans body (hors script/svg) ; un saut de plus d'1 niveau = ALERTE. Bug fix 15/05 : 29 pages avec skips résolus (footer h4→h3, processus h4→h3, carrieres h5→h4→h3).

54. **Sonde honeypot anti-bot** : pour chaque `<form data-hc-lead="X">`, vérifier la présence d'un champ caché `name="website"` avec `aria-hidden="true"` et `tabindex="-1"`. Sans honeypot → ALERTE *formulaire exposé au spam*. Patch 15/05 : 30 forms protégés sur 21 pages + JS `assets/hc-leads-capture.js` détecte et silencieusement bloque les soumissions de bots.

55. **Sonde image alt vide + parent sans texte** : audit strict d'accessibilité. Une `<img alt="">` est OK seulement si :
    - Le parent `<a>` ou `<button>` contient du texte visible (label adjacent), OU
    - L'image a `aria-hidden="true"` ou `role="presentation"`.
    Sinon → ALERTE *image non accessible*. Audit 15/05 : 0 cas problématique.

56. **Sonde CLS prevention** : chaque `<img>` doit avoir `width` et `height` attributs explicites (ou être en flex/grid contenu). Sans dimensions, le navigateur reflows le layout pendant le chargement. Patch 15/05 : 259 `<img>` patchées via `scripts/gen_og_images.py` style (lecture dimensions disque PIL).

57. **Sonde target=_blank sans noopener** : pour chaque `<a target="_blank">`, vérifier `rel="noopener noreferrer"`. Sans → ALERTE *fuite window.opener (XSS reverse-tabnabbing)*.

58. **Sonde sitemap lastmod obsolète** : pour chaque `<url>` du sitemap.xml, vérifier que `<lastmod>` est < 90 jours. Au-delà → ALERTE *lastmod périmé* (mauvais pour SEO crawl).

59. **Sonde corrélation home wizard ↔ catalogue prestations** : croiser les slugs de `var ALL_PRESTAS` dans `index.html` avec les slugs de `const LOCAL_CATALOG` dans `nos-prestations.html`. Toute prestation qui apparaît dans le wizard mais pas dans nos-prestations (ou inverse) = ALERTE *catalogue désynchronisé*.

60. **Sonde photo obligatoire wizard home** : vérifier que la step 2 du wizard `<form data-hc-lead="reservation_home">` impose une photo (input file required + JS qui bloque le passage à step 3 sans `window.__resaPhotos.length > 0`). Bug fix 15/05 : photo passée d'optionnel à obligatoire (Florian a explicitement demandé).

*Addendum v10 généré le 15 mai 2026 par Claude (session A→Z autonome) — 10 nouvelles sondes #51-#60 couvrant Nav fusion / Typo FR / Headings / Honeypot / Alt strict / CLS / target_blank / sitemap / catalogue sync / photo obligatoire.*
