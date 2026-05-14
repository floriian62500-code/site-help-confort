# 🚀 Guide de déploiement — Session du 13-14 mai 2026

Toutes les modifications de cette session sont **déjà poussées dans le code** (Netlify les déploie automatiquement à chaque commit). Il reste à activer côté **Supabase** quelques scripts SQL et **edge functions** pour que tout fonctionne.

---

## 1️⃣ Scripts SQL à exécuter dans Supabase

Ouvrir Supabase → projet **`help-confort`** → **SQL Editor** → **New query** → copier-coller le contenu de chaque fichier ci-dessous, puis **Run**.

| Ordre | Fichier | Ce que ça fait |
|------|---------|----------------|
| 1 | `admin-pro/scripts/fix_rls_contracts_public_insert.sql` | ✅ **DÉJÀ APPLIQUÉ** — Débloquait les soumissions du formulaire contrat |
| 2 | `admin-pro/scripts/setup_chat_conversations.sql` | Crée la table `chat_conversations` + RLS + vue stats pour le chatbot IA |
| 3 | `admin-pro/scripts/setup_actualites_table.sql` | Crée la table `actualites` (publication d'articles synchronisés depuis Facebook) |
| 4 | `admin-pro/scripts/setup_cron_sync_facebook.sql` | Programme le cron qui rapatrie les posts Facebook toutes les 6 h |
| 5 | `admin-pro/scripts/upgrade_services_langage_client.sql` | Ajoute les colonnes IA (`ai_generated`, `language_level`) au catalogue services |

**Vérification après exécution** : chaque script affiche une ligne de résultat de type `Table X créée ✅`.

---

## 2️⃣ Edge functions à déployer

Depuis un terminal local avec la CLI Supabase installée :

```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"

# Chatbot IA conversationnel (Claude)
supabase functions deploy chat-assistant --no-verify-jwt

# Générateur IA de contenu service (SEO + FAQ + posts) — déjà déployée
supabase functions deploy generate-service-content --no-verify-jwt

# Analyseur IA des conversations mal notées (suggère des améliorations au system prompt)
supabase functions deploy suggest-prompt-improvement --no-verify-jwt
```

Si la CLI n'est pas installée :
```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref <REF_DU_PROJET_HELP_CONFORT>
```

---

## 3️⃣ Vérification du système clé Anthropic

Le chatbot IA et le générateur SEO utilisent la clé Anthropic stockée dans la table `app_settings`.

Dans **Supabase → Table Editor → app_settings**, vérifier qu'il existe une ligne :

| key | value |
|-----|-------|
| `anthropic` | `{ "api_key": "sk-ant-…", "model": "claude-haiku-4-5-20251001" }` |

Si la ligne manque :
```sql
insert into public.app_settings (key, value)
values ('anthropic', jsonb_build_object(
  'api_key', 'sk-ant-VOTRE_CLE_ICI',
  'model',   'claude-haiku-4-5-20251001'
));
```

---

## 4️⃣ Tests de bon fonctionnement

À faire après les étapes 1 et 2 :

### Test chatbot IA
1. Ouvrir la home `https://www.helpconfort-saintomer.fr`
2. Cliquer sur la bulle de chat en bas à droite
3. Écrire « j'ai une fuite sous l'évier »
4. L'IA doit répondre en 2-4 secondes
5. Vérifier dans Supabase → Table `chat_conversations` qu'une ligne s'est créée

### Test modération admin
1. Ouvrir `admin-pro/chat-conversations.html`
2. La liste des conversations doit apparaître
3. Cliquer sur une conv → la modale s'ouvre avec l'historique complet
4. Donner une note 1-5 ★ + commentaire → "Enregistrer la note"

### Test générateur IA services
1. Ouvrir `admin-pro/services.html`
2. Sur une ligne du tableau, cliquer le bouton ✨ violet
3. La modale "Génération IA" s'ouvre et remplit 8 sections (SEO, FAQ, hashtags, posts FB/Insta…)

### Test formulaire contrat
1. Ouvrir `contrats-entretien.html`
2. Remplir le formulaire → "Envoyer"
3. Vérifier dans Supabase → Table `contracts` qu'une ligne `subscription_source = 'public_form'` s'est créée

### Test wizard home (bug du jour réparé)
1. Aller sur la home → cliquer "Dépannage rapide"
2. Step 2 : cocher un métier, taper **3 caractères** dans la description
3. Le bouton "Continuer →" doit être ACTIF (avant il fallait 6 caractères, en silence)

---

## 5️⃣ Fichiers nouveaux/modifiés cette session

### Nouveaux
- `supabase/functions/chat-assistant/index.ts` — chatbot IA Claude + mémoire
- `supabase/functions/generate-service-content/index.ts` — générateur SEO
- `supabase/functions/suggest-prompt-improvement/index.ts` — analyse des conv. mal notées
- `admin-pro/chat-conversations.html` — page admin modération chat
- `admin-pro/MEMOIRE_IA_MAINTENANCE.md` — rapport des bugs pour agent scan
- `admin-pro/scripts/setup_chat_conversations.sql`
- `admin-pro/scripts/setup_actualites_table.sql`
- `admin-pro/scripts/setup_cron_sync_facebook.sql`
- `admin-pro/scripts/upgrade_services_langage_client.sql`
- `admin-pro/scripts/fix_rls_contracts_public_insert.sql` ✅ déjà appliqué
- `images/marques/atlantic.svg`, `hansgrohe.svg`, `rs-ramon-soler.svg`
- `images/marques/quare-design.svg`, `kinedo.svg` (placeholders en attente de logo officiel)

### Modifiés majeurs
- `index.html` — refonte step 1 wizard (3 cards multi-métiers), step 2 chips multi-choix, fix validation
- `contrats-entretien.html` — refonte complète 6 steps, dates dropdown, brands triées, novalidate
- `plombier-saint-omer.html` — 5 marques partenaires avec logos officiels
- `assets/hc-widgets.js` — chatbot IA conversationnel (panneau, bulles, typing)
- `admin-pro/services.html` — bouton ✨ génération IA + modale résultat
- `admin-pro/assets/layout.js` — entrée sidebar "Conversations chatbot"

---

## 6️⃣ Logos partenaires à compléter

Deux logos restent en placeholder SVG inline (texte stylé) en attendant un upload officiel :
- `images/marques/quare-design.svg`
- `images/marques/kinedo.svg`

Quand Florian récupère les SVG officiels, simplement les remplacer dans le dossier `images/marques/` — aucune autre modif nécessaire, les `<img>` dans `plombier-saint-omer.html` y pointent déjà.

---

## ⚠️ À ne PAS oublier

- **Tester en navigation privée** après chaque déploiement (le cache navigateur peut masquer les changements)
- **Vider le cache Netlify** si les modifs JS/CSS ne s'appliquent pas : Netlify → Site settings → Build & deploy → Clear cache and retry deploy
- Les **RLS Supabase** sont la cause #1 de "ça marchait en local, ça plante en prod" — toujours tester un INSERT anon après création de table

---

*Document généré le 14 mai 2026.*
