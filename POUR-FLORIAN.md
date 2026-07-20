# POUR FLORIAN — file d'attention humaine

> File des items détectés par les agents/conversations qui **requièrent l'arbitrage de Florian**.
> Les agents alimentent ce fichier mais ne le traitent **jamais**.
> Au début de chaque nouvelle conversation, l'instance Claude doit lire ce fichier et lister les items en attente à Florian.

---

## Format d'entrée

```markdown
## AAAA-MM-JJ HH:MM — <titre court>
**Source** : <conversation ou agent + contexte>
**Constat** : <description du problème>
**Pourquoi je ne traite pas** : <raison — OAuth, DROP, choix métier, comm à valider, dépense, etc.>
**Options** :
  1. <option 1>
  2. <option 2>
**Reco** : option <n>.
**Quand on se voit** : <temps estimé pour valider>.
```

Une fois traitée avec Florian, l'entrée est :
- soit déplacée vers `TODO.md` sous forme actionnable,
- soit archivée en bas de ce fichier dans une section `

---

## 2026-07-20 19:15 — ✅ RÉSOLU : Token Meta migré vers System User (permanent)

**État final** :
- System User `Helpconfortapi` (ID `61591756427273`, rôle Admin) créé dans Business Manager HELP Confort
- Attribué à la Page "Help Confort ST OMER" avec accès total + à l'App "Help Confort Back-Office" avec accès total
- Page Access Token permanent généré avec scopes : pages_show_list, pages_read_engagement, pages_read_user_content, pages_manage_posts, pages_manage_metadata
- Token écrit dans `app_settings.meta` avec `token_source=system_user_never_expires`
- Test `/me` OK (retourne "Help Confort ST OMER")
- Trigger sync FB OK (0 nouveau, tout déjà en base)
- Cron pg_cron `auto-sync-facebook-posts` (jobid 12) actif */30 8-22

**Conséquence** : plus JAMAIS besoin de régénérer le token Meta. Ne dépend plus de ton mot de passe FB perso. Ne peut plus être invalidé par un changement de session sécurité côté FB.

**Historique** : après le bug "chantiers pas publiés depuis 53j" (dernier cron_fb_sync 28 mai → 20 juillet), token FB perso invalidé après changement mdp FB → cron pg_cron manquant → double bug. Fix racine appliqué par migration System User Token, monitoring pipeline-health-check v4 ajouté qui surveille désormais le token FB et l'âge du dernier sync (alerte WARN >45j, CRITICAL si cassé ou >14j sans sync).

---

## ~~2026-07-20 18:47 — 🚨 URGENT : Régénérer token Facebook~~ (RÉSOLU cf entrée du dessus)

**Source** : Florian signale RÉCURRENT "les chantiers ne se publient toujours pas auto sur le site depuis Facebook".
**Constat** :
- Dernier chantier synchronisé depuis FB → BDD : **28 mai 2026** (il y a 53 jours).
- Cause exacte confirmée par appel `refresh-meta-token` : `"user changed their password or Facebook has changed the session for security reasons"` → token Meta invalidé côté FB, non rafraîchissable automatiquement.
- Deuxième bug corrigé côté serveur : le cron `auto-sync-facebook-posts` n'existait pas dans pg_cron (créé aujourd'hui, tournera toutes les 30 min entre 8h-22h dès que le token sera restauré).
**Pourquoi je ne traite pas** : régénération du token nécessite login FB Business Manager + validation Graph API Explorer + copie du token dans le wizard → impossible sans tes identifiants.
**Procédure** (~15 min) :
  1. Ouvrir https://www.depan59-62.fr/admin-pro/wizard-meta.html (le wizard 6 étapes est déjà prêt)
  2. Suivre les étapes 4-6 (les 3 premières sont déjà faites) : Générer User Access Token via Graph API Explorer, autoriser les scopes, échanger contre Page Token longue durée
  3. Coller le nouveau Page Token dans l'étape 6.2 du wizard
  4. Le wizard écrit automatiquement dans `app_settings.meta`
**Ce qui reprendra tout seul après ça** :
  - Cron pg_cron `auto-sync-facebook-posts` toutes les 30 min → détecte les nouveaux posts FB → insère comme chantiers dans `realisations`
  - Chaîne migrate-fb-images → download les images FB en local
  - Sync JSON statique (regen manuel encore nécessaire, cf `project_sync_realisations_supabase_json`)
**Reco après reprise** : IMPORTANT — ne plus jamais changer le mot de passe FB HELP Confort sans regénérer immédiatement le Page Token. Le message dans le wizard est explicite : "Le Page Token n'expire JAMAIS (sauf si tu changes ton mot de passe FB ou révoques l'App)".
**Quand on se voit** : 15 min pour la wizard, puis attendre 30 min pour voir un chantier récent (ou trigger manuel via l'edge fn).

---

## 2026-07-03 18:35 — DMARC : arbitrer canal des rapports (mail pollue Outlook)

**Source** : chat 2026-07-03 (Florian montre mail quotidien `DMARC Aggregate Report <dmarcreport@microsoft.com>` reçu chaque jour).
**Constat** : L'enregistrement DNS `_dmarc.depan59-62.fr` a un tag `rua=mailto:florian.dhaillecourt@helpconfort.com`. Résultat : chaque provider mail (Microsoft, Google, Free, Orange...) envoie 1 rapport agrégé XML par jour à ton adresse → 5-20 mails/jour pollution garantie.
**Pourquoi je ne traite pas** : modif DNS Gandi hors périmètre autonome (nécessite login registrar).
**Options** :
  1. **Suppression pure** — retirer `rua=` du DMARC. Zéro pollution, zéro surveillance. Aucun impact délivrabilité mails HC.
  2. **Alias jetable** — créer `dmarc@depan59-62.fr` + filtre Outlook auto-delete 30j. Garde la trace au cas où.
  3. **Service tiers gratuit** (Postmark DMARC Digest ou EasyDMARC free) — 1 mail hebdo lisible en FR, alertes usurpation identité. Setup 5 min sur postmarkapp.com/dmarc-digest.
**Reco** : **option 3** (Postmark). Protection contre faux devis "de la part de HELP Confort", zéro pollution quotidienne. Sinon option 1 si tu veux zapper le sujet 5 min sans compte tiers.
**Valeur DNS à coller chez Gandi** (Option 1) : remplacer TXT `_dmarc` par `v=DMARC1; p=quarantine; adkim=r; aspf=r;`
**Quand on se voit** : 5 min (choix + copier coller dans Gandi).

---

## 2026-07-03 18:38 — Push GitHub : divergence git à résoudre (37↑ / 60↓)

**Source** : session Cowork autonome 2026-07-03.
**Constat** : Branche `main` locale = ahead 37 / behind 60 vs origin/main. Le fix critique du sitemap Search Console (voir BUGS-HISTORY) est déjà en prod côté Supabase Edge Function v6, mais le fichier `supabase/functions/sitemap/index.ts` n'est **pas encore poussé sur GitHub**. Sans push, prochain deploy manuel de la fonction depuis un poste jour risque de réintroduire l'ancien SITE_URL erroné.
**Pourquoi je ne traite pas** : sandbox Cowork = proxy sortant fermé (curl vers GitHub / Supabase POST bloqué, HTTP 403). LaunchAgent auto-push local semble gelé depuis mi-juin (dernier push distant confirmé 21 juin).
**Options** :
  1. Double-cliquer sur `tools/Push-Force-Fix-Sitemap.command` (créé aujourd'hui) — pull rebase + push, ~30 sec.
  2. Ouvrir Terminal → `cd "SITE INTERNET" && git pull --rebase origin main && git push origin main`.
  3. Ignorer, redéployer manuellement Edge Function `sitemap` avec `supabase functions deploy sitemap --no-verify-jwt` si un jour nécessaire (mais tu perds l'historique Git de ce fix).
**Reco** : **option 1** (script). ~30 sec, résout aussi la divergence globale qui traîne.
**Quand on se voit** : 30 sec.

---

## 2026-05-29 — Drapeau Ukraine : reste 1 test 2 min de ton côté
**Source** : agent autonome hc-site-autonome (run 2026-05-29).
**Constat** : Le bug est clos côté code. La carte Leaflet de zones-intervention est entièrement désactivée depuis le fix V3 (kill-switch `if (true) return;` + balises Leaflet commentées) et remplacée par 2 cartes agence + CTA depuis le V4 (2026-05-22). Aucune tuile, aucun asset tiers, aucun fichier « ukrain » chargé sur la page (grep repo confirmé). Conclusion : si tu vois encore un drapeau, il ne vient PAS du site.
**Action de ton côté (2 min)** : ouvre depan59-62.fr/zones-intervention en fenêtre de navigation privée (extensions désactivées). Si le drapeau a disparu → c'était une extension Chrome (solidarité/dons), rien à corriger, on coche la dernière ligne. Si le drapeau est TOUJOURS là en privé → préviens-moi, on rouvre une investigation (mais c'est très improbable vu l'état du code).
**Quand on se voit** : 2 min.

---

## Archivé`.

---

## Items en attente

## 2026-06-01 — Carte Ukraine : diagnostic « code propre » périmé, une carte tierce est de nouveau active
**Source** : agent autonome hc-site-autonome (run 2026-06-01), traitement de la tâche TODO « Test fenêtre privée drapeau Ukraine — Florian ».
**Constat** : la note du 2026-05-29 affirmait qu'aucune tuile/asset tiers n'était plus chargé sur la page zones — c'est faux aujourd'hui. `assets/hc-map-zones.js?v=20260531-v3` (V3, 2026-05-30/31) est désormais chargé sur 4 pages (zones-intervention, contact, a-propos, nos-villes), charge lui-même Leaflet depuis unpkg et affiche des tuiles CartoDB Voyager. L'ancien Leaflet inline est bien neutralisé mais a été remplacé par ce nouveau système.
**Pourquoi je ne traite pas** : (1) le test fenêtre privée est une action manuelle qui t'est explicitement assignée ; (2) je n'applique pas de fix code spéculatif sur la carte live — CartoDB Voyager est en principe neutre et le script a déjà un `killUkraineOverlay()` défensif, donc rien à reproduire côté agent.
**Ce que tu dois faire** : ouvrir zones-intervention.html en fenêtre privée. Drapeau présent → vrai bug carte (CartoDB/Leaflet), me redonner le GO pour investiguer l'overlay. Drapeau absent → c'était une extension Chrome, on clôt.

## 2026-05-30 12:25 — 19 photos réalisations : aucune source réelle à rapatrier
**Source** : agent autonome hc-site-autonome (run 2026-05-30), traitement de la tâche TODO « Rapatrier 19 images Facebook CDN sur Supabase Storage ».
**Constat** : Les 19 réalisations en fallback gradient n'ont PAS de vraie image à migrer. Dans `content/realisations/index.json`, les 19 champs `image` valent tous `https://scontent.xx.fbcdn.net/v/t39.30808-6/...` — un placeholder tronqué qui finit par « … », pas une URL signée valide. Vérifié partout : `index.json.bak` (0 fbcdn), `seed_realisations.sql` (0 fbcdn), grep repo complet (0 URL scontent longue), dossier `images/realisations/` vide. Il n'existe donc nulle part de fichier ni d'URL exploitable. La tâche telle qu'écrite (« télécharger puis héberger sur Supabase Storage ») est mécaniquement impossible : il n'y a rien à télécharger. Même si de vraies URLs fbcdn signées avaient existé, elles expirent en quelques jours et dateraient du 2026-05-19 → mortes aujourd'hui.
**Pourquoi je ne traite pas** : besoin de re-sourcer les vraies photos — accès à la page Facebook (connexion/token requis) ou fichiers originaux à fournir, choix métier + asset manquant.
**Options** :
  1. Tu me fournis les 19 photos originales (export depuis ton téléphone, drive, ou la page FB une fois connecté) → je les upload sur le bucket Supabase Storage `realisations`, je mets à jour `index.json` + table `realisations`, je régénère et je déploie.
  2. On branche un accès Facebook (token Graph API page) pour ré-extraire automatiquement les visuels des posts → je scripte la migration de bout en bout.
  3. On abandonne la galerie photo et on assume le fallback gradient stylé (déjà en place, propre) tant qu'on n'a pas de vrais visuels.
**Reco** : option 1 (le plus rapide et fiable ; pas de dépendance API FB qui casse).
**Quand on se voit** : 10 min pour récupérer les photos + me les déposer dans `images/realisations/`.

---

## 2026-05-19 11:00 — sync-reviews retourne 401 (table reviews vide)
**Source** : audit BDD via Supabase MCP session autonome 2026-05-19
**Constat** : La table `reviews` contient **0 entrées** alors que tu as **343 avis Google**. Le cron `auto-sync-reviews` (jobid=1, toutes les 6h) tourne avec succès côté pg_cron, mais l'Edge Function `sync-reviews` répond **401 Unauthorized**. La clé `sync_reviews_service_key` stockée dans Supabase Vault est probablement expirée ou mal configurée. Conséquence : toolkit "Digest avis non répondus" sera vide tant que ça n'est pas résolu.
**Pourquoi je ne traite pas** : Régénérer/MAJ un service_role_key + ré-encrypter dans `vault.decrypted_secrets` touche aux **credentials d'authentification critiques** (cf. garde-fou OAuth).
**Options** :
  1. Régénérer SERVICE_ROLE_KEY (Dashboard Supabase → API → reset), MAJ vault. ⚠️ Peut casser autres Edge Functions.
  2. Créer un nouveau secret dédié `sync_reviews_service_key_v2` avec la clé actuelle.
  3. Diagnostic d'abord : vérifier pourquoi le secret est invalide (typo SQL ? expiration ?).
**Reco** : option 3 (diagnostic non destructif), puis 2 si confirmé invalide.
**Quand on se voit** : 10 min ensemble.

## 2026-05-20 09:35 — 🔥 CRITIQUE BUSINESS : RLS leads bloque les INSERT anon — ✅ RÉSOLU 2026-05-20 10:55
**Statut** : **CORRIGÉ** par déploiement Edge Function `submit-lead` V1 (verify_jwt=false, service_role bypass RLS) + refactor `assets/hc-leads-capture.js` (HC-FIX 2026-05-20). Testé OK via pg_net direct → 200 lead créé, supprimé après test. Tous les formulaires `data-hc-lead` du site passent désormais par l'Edge Function. Notif email à Florian conservée (déclenchée côté serveur).
**Source** : audit autonome 2026-05-20 (lecture code + test pg_net direct vers /rest/v1/leads)
**Constat initial** : **Aucun lead enregistré depuis la mise en place de la clé `sb_publishable_*`**. Tous les visiteurs qui ont rempli le formulaire de contact reçoivent un toast d'erreur ("Erreur d'envoi. Veuillez nous appeler..."). Cela représente potentiellement **des dizaines/centaines de leads perdus** selon le trafic.

**Preuve** :
- Table `leads` totalement vide (0 entrées, alors que site reçoit trafic depuis semaines)
- Test pg_net direct vers `https://btcbjwqiivhpwoszomhg.supabase.co/rest/v1/leads` avec clé `sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2` → **401 Unauthorized**, message exact : `"new row violates row-level security policy for table 'leads'"`
- Test reproduit en injectant `status='nouveau'` ET `assigned_to=NULL` explicitement → toujours 401
- Policy `leads_public_insert` : `WITH CHECK ((status = 'nouveau'::text) AND (assigned_to IS NULL))` — semble correcte mais n'est pas appliquée

**Hypothèse principale** : la clé `sb_publishable_*` (nouveau format Supabase) résout vers un rôle Postgres différent de `anon`. La policy `leads_public_insert` ciblant `{anon}` ne s'applique pas. PostgREST refuse l'INSERT car aucune policy ne couvre le rôle effectif de cette clé.

**Pourquoi je ne traite pas** : Garde-fou absolu — toute modification RLS/permissions doit être validée explicitement par toi.

**Options** :
  1. **Ajouter une policy permissive pour le nouveau rôle** (probablement `public_anon` ou `viewer`). À identifier avec `SELECT rolname FROM pg_roles`.
  2. **Créer une Edge Function `submit-lead`** (service_role, bypass RLS, anon-callable). Plus propre architecturalement et permet de logger/notifier instantanément.
  3. **Régénérer une clé anon "legacy" JWT** (`eyJ*`) et l'utiliser dans `hc-leads-capture.js` au lieu de `sb_publishable_*`.

**Reco** : **option 2** (Edge Function `submit-lead`). Bénéfices : centralisation logique lead + notif email auto à Florian + log d'erreur en BDD + bypass RLS propre + plus jamais ce problème.

**Action immédiate à valider** : modifier `hc-leads-capture.js` ligne 35 pour appeler l'Edge Function `submit-lead` au lieu de l'INSERT direct. Architecture identique à `publish-scheduled`.

**Quand on se voit** : 15 min pour valider + déployer l'Edge Function `submit-lead`.

**Impact** : tant que ce bug est ouvert, **chaque jour de trafic = leads perdus**. Priorité maximale.

## 2026-05-19 11:05 — Table `leads` vide (formulaire de contact ?) — REMPLACÉ par item ci-dessus
**Source** : audit BDD via Supabase MCP session autonome 2026-05-19
**Constat** : La table `leads` contient **0 entrées** alors que le site reçoit du trafic et que contact.html a été optimisé pour la conversion. Soit aucun visiteur n'a rempli le formulaire (peu probable), soit le formulaire **n'écrit pas en BDD**.
**Pourquoi je ne traite pas** : Pour diagnostiquer il faut soumettre un faux lead E2E. Je peux faire le test mais la suppression du lead test après requiert ton aval (cf. garde-fou DELETE).
**Options** :
  1. Soumettre lead test depuis contact.html, vérifier BDD, puis DELETE (tu valides).
  2. Vérifier le code JS du formulaire pour voir s'il appelle bien Supabase ou poste ailleurs (non destructif).
  3. Vérifier les logs Edge Function `lead-handler` s'il existe.
**Reco** : option 2 d'abord (lecture code), puis 1 si nécessaire.
**Quand on se voit** : 5 min.

## 2026-05-19 — Dynamiser le widget "4,7/5 sur 343 avis Google"
**Source** : audit promesses marketing 2026-05-19
**Constat** : le chiffre "4,7/5 sur 343 avis" est figé dans le HTML de 104 pages. À chaque nouvel avis, il faudrait tout mettre à jour manuellement.
**Pourquoi je ne traite pas** : nécessite création d'une vue Supabase + script JS de fetch + tests. Nécessite session dédiée 30-45 min.
**Options** :
  1. Créer une vue `v_reviews_stats` dans Supabase + script `hc-avis-stats.js` qui fetch et substitue.
  2. Continuer à mettre à jour manuellement à intervalle régulier (3 mois).
**Reco** : option 1 quand sync-reviews aura été réparé (cf. item du 2026-05-19 11:00).
**Quand on se voit** : 45 min après réparation sync-reviews.

## 2026-05-19 — Item logo header SVG (logo.svg manquant à la racine)
**Source** : audit bugs résiduels 2026-05-19
**Constat** : l'audit demandait de remplacer `logo-officiel.jpg` par `logo.svg` dans le header (classe `hc-logo`) de toutes les pages. **`logo.svg` n'existe pas à la racine** (seulement `images/apporteurs/logo.svg` qui est sans rapport). Aucun remplacement n'a été fait pour ne pas casser l'affichage.
**Pourquoi je ne traite pas** : il faut d'abord créer/déposer un vrai `logo.svg` à la racine du projet (vectoriel HC officiel).
**Options** :
  1. Tu déposes le SVG officiel HC à la racine → on relance le remplacement automatisé.
  2. On reste sur le JPG actuel (acceptable, juste un peu plus lourd).
**Reco** : option 1 dès que tu as 5 min pour exporter le SVG depuis ta source.
**Quand on se voit** : 2 min.

## 2026-05-19 18:30 — Supabase advisors : 37 warnings sécurité à arbitrer
**Source** : `get_advisors` Supabase MCP, session autonome 2026-05-19
**Constat** : Le linter Supabase remonte 37 issues sécurité dont :
- **4 ERROR — Vues SECURITY DEFINER** : `v_recent_prospects`, `v_interventions_today`, `v_services_public`, `v_contract_offers` (les vues utilisent les permissions du créateur au lieu du caller → contournent RLS)
- **11 WARN — Functions search_path mutable** (`touch_*`, `tg_*`, `update_contract_next_date`, etc.) : sans `SET search_path = public` figé, risque de hijacking
- **1 WARN — pg_net dans public schema** : devrait être dans un schema dédié
- **11 WARN — RLS policies trop permissives** sur `app_settings`, `contracts`, `leads`, `realisations`, `reviews`, `scheduled_publications`, `service_orders` : USING (true) ou WITH CHECK (true) pour INSERT/UPDATE/DELETE = pas de filtre par user
- **5 WARN — SECURITY DEFINER functions exposées à anon** : `current_role`, `handle_new_user`, `is_owner`, `ping_indexnow_on_publish`, `rls_auto_enable`
- **1 WARN — Auth Leaked Password Protection désactivé** (HaveIBeenPwned check)

**Pourquoi je ne traite pas** : Garde-fou absolu CLAUDE-AUTONOME — "Jamais DROP / suppression données / RLS sans validation explicite". Toutes ces corrections impliquent des modifs RLS/permissions/SECURITY DEFINER, donc validation obligatoire.

**Options** :
  1. Session dédiée 60-90 min pour traiter tous les items un par un (le plus propre).
  2. Traiter en priorité les 4 ERROR (vues SECURITY DEFINER) qui sont le risque le plus critique, et reporter les WARN.
  3. Activer Leaked Password Protection (1 clic dans Supabase Auth settings) — c'est gratuit et sans risque.

**Reco** : commencer par option 3 (Auth Settings → 1 toggle), puis option 2 pour les vues SECURITY DEFINER (impact réel sur exposition data), puis session dédiée pour les RLS si tu veux durcir.

**Lien Supabase** : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/database/database-advisors

**Quand on se voit** : 60-90 min (session sécurité dédiée) ou 5 min pour le toggle Leaked Password.

---

## 2026-05-19 18:00 — Doublons chauffe-eau hardcoded vs BDD
**Source** : audit catalogue services session autonome 2026-05-19
**Constat** : 5 chauffe-eau hardcoded en JS dans nos-prestations.html (loc-ce-100eco, 100st, 150eco, 150st, 200eco) sont en **doublon partiel** avec 10 chauffe-eau Atlantic en BDD. Noms légèrement différents :
- BDD : "Chauffe-eau 100L mural — Gamme Éco (résistance blindée)"
- Hardcoded : "Chauffe-eau 100 L Éco (mural)"
`dedupServices()` ne capture pas → Florian voit potentiellement 2× chaque modèle sur nos-prestations.
**Particularités** :
- Le hardcoded `loc-ce-contrat` (Contrat entretien annuel à 220€) n'est PAS en BDD → à conserver.
- Les prix peuvent diverger entre hardcoded et BDD → vérifier avant suppression.
**Pourquoi je ne traite pas** : Risque de présenter des prix incorrects si on supprime sans vérifier. Garde-fou : ne jamais modifier des prix affichés sans validation.
**Options** :
  1. **Source de vérité = BDD** : on supprime les 5 chauffe-eau hardcoded en JS. Le catalogue ne montre que les 10 modèles Atlantic en BDD (plus complet : sol/mural × Éco/Stéatite × 100/150/200/300L).
  2. **Source de vérité = JS hardcoded** : on désactive les 5 services BDD correspondants. Plus simple visuellement (5 modèles vs 10).
  3. Améliorer `dedupServices()` pour reconnaître ces variantes (régex plus large) — risque de fausses dédup.
**Reco** : option 1 (BDD source unique = aligné sur l'objectif "tout passe par le CMS"). À faire en session 5 min ensemble pour vérifier que les prix BDD sont à jour avant suppression hardcoded.
**Quand on se voit** : 5 min.

## 2026-05-19 11:10 — Logo PNG transparent HC à fournir
**Source** : refonte logo footer V2 session 2026-05-19
**Constat** : Le logo officiel HC (maison + "HELP! Confort" + "Une marque de La Poste") n'est pas dans le projet en version PNG transparente. Seul `logo-officiel.jpg` (1080×1080 carré) est disponible. Workaround CSS V2 (cartouche blanc carré 110×110px) fonctionne mais sub-optimal.
**Pourquoi je ne traite pas** : Le fichier source doit venir de toi (Drive interne HC, charte graphique).
**Options** :
  1. Tu uploades le PNG transparent dans Cowork (drag-drop chat) → sauvé `logo-officiel-dark.png` + modif footer.
  2. Tu partages un lien Drive/Dropbox.
  3. Garder le workaround CSS actuel.
**Reco** : option 1 quand tu as 30 sec.
**Quand on se voit** : 2 min.

---

## Archivé

*(rien encore)*
