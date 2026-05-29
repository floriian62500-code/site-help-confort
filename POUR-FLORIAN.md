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
- soit archivée en bas de ce fichier dans une section `## 2026-05-29 — Drapeau Ukraine : reste 1 test 2 min de ton côté
**Source** : agent autonome hc-site-autonome (run 2026-05-29).
**Constat** : Le bug est clos côté code. La carte Leaflet de zones-intervention est entièrement désactivée depuis le fix V3 (kill-switch `if (true) return;` + balises Leaflet commentées) et remplacée par 2 cartes agence + CTA depuis le V4 (2026-05-22). Aucune tuile, aucun asset tiers, aucun fichier « ukrain » chargé sur la page (grep repo confirmé). Conclusion : si tu vois encore un drapeau, il ne vient PAS du site.
**Action de ton côté (2 min)** : ouvre depan59-62.fr/zones-intervention en fenêtre de navigation privée (extensions désactivées). Si le drapeau a disparu → c'était une extension Chrome (solidarité/dons), rien à corriger, on coche la dernière ligne. Si le drapeau est TOUJOURS là en privé → préviens-moi, on rouvre une investigation (mais c'est très improbable vu l'état du code).
**Quand on se voit** : 2 min.

---

## Archivé`.

---

## Items en attente

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
