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
- soit archivée en bas de ce fichier dans une section `## Archivé`.

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

## 2026-05-19 11:05 — Table `leads` vide (formulaire de contact ?)
**Source** : audit BDD via Supabase MCP session autonome 2026-05-19
**Constat** : La table `leads` contient **0 entrées** alors que le site reçoit du trafic et que contact.html a été optimisé pour la conversion. Soit aucun visiteur n'a rempli le formulaire (peu probable), soit le formulaire **n'écrit pas en BDD**.
**Pourquoi je ne traite pas** : Pour diagnostiquer il faut soumettre un faux lead E2E. Je peux faire le test mais la suppression du lead test après requiert ton aval (cf. garde-fou DELETE).
**Options** :
  1. Soumettre lead test depuis contact.html, vérifier BDD, puis DELETE (tu valides).
  2. Vérifier le code JS du formulaire pour voir s'il appelle bien Supabase ou poste ailleurs (non destructif).
  3. Vérifier les logs Edge Function `lead-handler` s'il existe.
**Reco** : option 2 d'abord (lecture code), puis 1 si nécessaire.
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
