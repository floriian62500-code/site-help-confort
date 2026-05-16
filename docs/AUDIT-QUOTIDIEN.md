# Audit HELP! Confort — 2026-05-16

## Top 3 actions prioritaires
- **Clé service_role Supabase manquante** → sync Facebook et Reviews bloquées depuis hier. Ajouter `SUPABASE_SERVICE_ROLE_KEY` dans [`.autopush/.env`](file:///Users/HP/Documents/Claude/Projects/SITE INTERNET/.autopush/.env), clé à récupérer sur [Supabase → API Settings](https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/settings/api). Détail : [`docs/ALERT-SYNC.md`](file:///Users/HP/Documents/Claude/Projects/SITE INTERNET/docs/ALERT-SYNC.md).
- **Test pipeline email Resend** → faire un envoi test via le formulaire de [contact](https://depan59-62.fr/contact.html) pour confirmer que le fix `from_email = noreply@depan59-62.fr` posé hier livre bien.
- **2 fichiers mascotte temporaires** (688 KB chacun) à supprimer : `images/mascotte.tmp.png` + `images/mascotte-opt.tmp.png`. Non référencés dans le code, alourdissent juste le repo. (Non auto-supprimés car la consigne interdit la suppression de fichiers sans validation.)

## Tout va bien
- 94 pages HTML scannées, **96 blocs `<script>` parsés sans erreur** après fix (cf. ci-dessous).
- 0 lien interne cassé dans `/admin-pro/`, `/admin/`, `/actualites/` ni à la racine.
- 22 migrations Supabase à jour (dernière : `20260515070000_reset_contracts_page.sql` posée hier).
- 21 Edge Functions déployées sur le projet `btcbjwqiivhpwoszomhg`.
- Autopush actif : commit le plus récent ce matin à 06:39 (`docs/ALERT-SYNC.md`).
- Aucune référence active à l'ancien domaine fictif `helpconfort-saintomer.fr` dans le code (3 mentions résiduelles uniquement dans les changelogs historiques `docs/`, normales).
- Scan maintenance : **98/100** (cf. [`logs/scan-2026-05-16.json`](file:///Users/HP/Documents/Claude/Projects/SITE INTERNET/logs/scan-2026-05-16.json)).

## Fixes appliqués automatiquement
- **`admin-pro/leads.html` (ligne 761)** — bug critique de parsing HTML. Dans le template literal JS qui génère le PDF d'export d'un lead, une balise `<script>...</script>` littérale (service worker injecté par erreur dans le HEAD du PDF) terminait prématurément le bloc `<script>` principal côté navigateur. Tout le JS de la page entre la ligne 762 et 1048 était donc traité comme du texte HTML, pas comme du JavaScript.
  Correctif : remplacement par le pattern d'échappement déjà utilisé ligne 840 du même fichier (`<scr${''}ipt>...</scr${''}ipt>`), qui découpe la chaîne pour que le parser HTML ne la voie pas comme balise mais que le navigateur exécute correctement le JS final.
  Vérification : `new Function(...)` réussit désormais sur les 2 blocs `<script>` de la page. À recharger : [`admin-pro/leads.html`](https://depan59-62.fr/admin-pro/leads.html) une fois le déploiement Netlify passé.

## Nécessite l'attention de Florian
- **Clé service_role Supabase** — voir top 3, blocage métier (avis Google non synchros, posts FB non récupérés).
- **Suppression des 2 fichiers `mascotte*.tmp.png`** — décision à prendre. Ce sont des sous-produits d'un script de détourage/optimisation (`scripts/detoure-mascotte.py`). Aucun fichier HTML/CSS/JS ne les référence. Tu peux les supprimer en une commande : `rm "/Users/HP/Documents/Claude/Projects/SITE INTERNET/images/mascotte.tmp.png" "/Users/HP/Documents/Claude/Projects/SITE INTERNET/images/mascotte-opt.tmp.png"`.
- **Optimisation `index.html` (179 KB)** — page d'accueil un peu lourde côté HTML inline. Pas urgent, mais un passage de minification CSS/HTML pourrait gagner 30-40 KB. À voir au prochain sprint perf.

## Stats projet
- **94 pages HTML** au total
- **22 migrations Supabase** (dernière : `20260515070000_reset_contracts_page.sql` — 15/05/2026 12:14)
- **21 Edge Functions** déployées (`auto-publish-from-photos`, `chat-assistant`, `notify-subscription`, `sync-reviews`, `sync-facebook-posts`, etc.)
- **Score maintenance** : 98/100 (3 findings — 1 optimisation, 2 importantes)
- **Derniers commits autopush** :
  - `404c317` 2026-05-16 06:39 — docs/ALERT-SYNC.md
  - `83947a4` 2026-05-15 22:04 — logs/scan-previous.json
  - `3041000` 2026-05-15 22:03 — 4 fichiers
  - `80fe050` 2026-05-15 21:49 — 5 fichiers
  - `3dfe454` 2026-05-15 21:48 — 8 fichiers

## Suggestions d'amélioration
- **Garde-fou anti-régression sur leads.html** : la racine du bug fixé aujourd'hui vient probablement d'un script d'injection automatique (`scripts/inject-topbar.py` ou `scripts/add-no-cache.py`) qui a inséré `<script>service worker</script>` dans le HEAD du template PDF embarqué dans la JS. Ces scripts devraient ignorer les `<head>` situés à l'intérieur de template literals JS (backticks). À envisager : un test unitaire qui charge chaque HTML et appelle `new Function(scriptBody)` sur chaque bloc — exactement ce que fait le bout de Node que j'ai utilisé pour détecter le problème.
- **Nettoyage générique des `*.tmp.*`** : ajouter `*.tmp.*` au `.gitignore` ou un cleanup au début du script de build pour éviter que ce type de fichier transitoire pollue le repo.
- **Documenter la convention `<scr${''}ipt>`** dans un `README-CONVENTIONS.md` côté `admin-pro/` — c'est une astuce non triviale, utile à connaitre pour quiconque touche aux templates HTML embarqués dans du JS.

---

Audit du 2026-05-16 terminé · 1 fix auto (leads.html) · 3 items pour Florian
