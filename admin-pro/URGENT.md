# 🚨 ACTIONS URGENTES — Site EN LIGNE

Le code HTML/JS/CSS est **déjà déployé via Netlify** dès que tu pousses sur Git.
Mais il manque 3 actions côté **Supabase** sinon certaines features sont cassées en prod.

## ⚡ À faire MAINTENANT (3 minutes)

### 1. SQL chat_conversations (pour que le chatbot fonctionne)
Supabase → projet **help-confort** → SQL Editor → coller le contenu de :
```
admin-pro/scripts/setup_chat_conversations.sql
```
→ **Run**

### 2. Déployer l'edge function du chatbot
Terminal local :
```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
supabase functions deploy chat-assistant --no-verify-jwt
```

### 3. Vérifier la table `leads` accepte les anonymes
Supabase → SQL Editor :
```sql
select policyname from pg_policies where tablename = 'leads' and 'anon' = any(roles);
```
Tu dois voir `leads_public_insert`. Si vide → exécute :
```
admin-pro/scripts/setup_leads.sql
```

---

## ✅ Ce qui fonctionne déjà sans rien faire

- Wizard home (4 étapes, prestations suggérées, autocomplete BAN)
- Formulaire contrat d'entretien (RLS déjà corrigée)
- Pages métier avec marques partenaires
- Catalogue services admin avec bouton ✨ IA

## ⚠️ Ce qui dépend des 3 actions ci-dessus

| Si tu ne fais pas… | Conséquence |
|--------------------|-------------|
| #1 SQL chat | Chatbot home renvoie une erreur silencieuse → tu perds des leads |
| #2 Deploy edge fn | Pareil : chatbot inactif |
| #3 RLS leads | Le wizard home ne persiste plus dans la BDD (mais le mailto fonctionne) |

---

## 🔥 Test de fumée après les 3 actions (1 minute)

1. Ouvrir la home en **navigation privée**
2. Cliquer la bulle chat → écrire "j'ai une fuite" → réponse IA en 2-4s ✓
3. Cliquer "Dépannage rapide" → faire toutes les étapes → confirmer
4. Vérifier dans Supabase → Table `leads` qu'une ligne `source = home_wizard_*` est apparue ✓
5. Vérifier dans Supabase → Table `chat_conversations` qu'une ligne est apparue ✓

Si l'un des 2 échoue → me ping avec le message d'erreur visible en console (F12).

---

*Le détail complet est dans `DEPLOY.md`. Le rapport bugs est dans `MEMOIRE_IA_MAINTENANCE.md`.*
