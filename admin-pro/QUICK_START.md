# ⚡ Quick Start — 3 actions à faire maintenant

Pour activer toute la session du 13-14 mai :

## 1️⃣ Supabase SQL (5 minutes)

Ouvrir Supabase → projet **help-confort** → SQL Editor, et exécuter dans cet ordre :

```
admin-pro/scripts/setup_chat_conversations.sql       ← chatbot IA
admin-pro/scripts/setup_actualites_table.sql         ← articles FB
admin-pro/scripts/setup_cron_sync_facebook.sql       ← sync FB toutes les 6h
admin-pro/scripts/upgrade_services_langage_client.sql ← générateur IA services
```

Copier-coller le contenu, **Run**. Le script affiche `Table X créée ✅` quand c'est bon.

## 2️⃣ Déployer les 3 edge functions (2 minutes)

Dans un terminal :

```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
supabase functions deploy chat-assistant --no-verify-jwt
supabase functions deploy generate-service-content --no-verify-jwt
supabase functions deploy suggest-prompt-improvement --no-verify-jwt
```

## 3️⃣ Tester (2 minutes)

| Quoi | Où | Résultat attendu |
|------|-----|-------------------|
| Chatbot | Home → bulle en bas à droite | Réponse IA en 2-4s |
| Page admin chat | `admin-pro/chat-conversations.html` | Conversations listées + boutons "🧪 Tester" et "✨ Améliorer prompt" |
| Wizard | Home → "Dépannage rapide" → Step 2 | "Continuer →" actif dès 3 caractères de description |
| Formulaire contrat | `contrats-entretien.html` | "Envoyer" crée une ligne dans `contracts` |

---

📘 Le détail complet est dans `DEPLOY.md`.
🐛 Les bugs à intégrer au scan IA sont dans `MEMOIRE_IA_MAINTENANCE.md`.
