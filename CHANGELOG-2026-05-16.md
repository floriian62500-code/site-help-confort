# CHANGELOG — Session 2026-05-16

Session "finalisation connexions + séparation contenus".

## 🎯 Objectifs traités
1. Finaliser la connexion GA4 (service account + plan B OAuth)
2. Séparer Chantiers vs Actualités (admin + frontend public)
3. Centraliser le diagnostic de toutes les connexions
4. Améliorer les UX d'upload/validation

---

## ✅ Nouvelles pages

| Page | Rôle |
|---|---|
| `admin-pro/finalize-config.html` | Wizard 1-clic pour finaliser config (GA4 JSON upload + Claude IA + infos société) |
| `admin-pro/diagnostic-connexions.html` | État live de toutes les APIs (Supabase, Meta, GBP, GA4, Claude IA, Resend, CRM, site) |
| `admin-pro/oauth-ga4.html` | **Plan B GA4** — OAuth user au lieu de service account, contourne le blocage Google |

## 🔧 Améliorations majeures

### Admin → Réalisations
- **3 onglets** : 🔨 Chantiers · 📰 Actualités · 📋 Tout (avec compteurs live)
- **Détection auto** : classification chantier/actu via tag manuel + mots-clés + présence d'avant/après
- **Toggle manuel** dans le modal d'édition : 🔨 Chantier ↔ 📰 Actualité (priorité absolue)
- **Bouton "Valider et publier"** vert : force `status=publie` + canal site coché en 1 clic

### Admin → Analytics
- **Appel client-side** direct à l'API GA4 (signature JWT RS256 native via `crypto.subtle`)
- Plus de dépendance à l'Edge Function `ga4-stats` (qui n'existe pas)
- Plan A : service account `ga4-reader` + JSON
- Plan B : OAuth user (refresh_token stocké dans `app_settings.ga4_oauth`)
- Top sources + top pages affichés en bonus
- Bandeau d'erreur clair avec 4 boutons d'action si KO

### Admin → Réglages
- **Bouton "Auto-récupérer Page Access Token" masqué** (Edge Function inexistante)
- **Documentation OAuth GA4** dans Settings → GA4

### Site public
- `/realisations.html` : nouveau filtre qui respecte le tag `ai_generated.post_type`
- `/actualites.html` : charge maintenant aussi les imports FB classés "actualite" depuis Supabase
- Combine articles legacy CMS + actus depuis Supabase

## 🐛 Bugs critiques corrigés

### 1. Bouton upload "Sélectionner le fichier .json" n'avait pas de handler JS
**Symptôme** : clic sans effet. **Cause** : oubli du `onchange` handler. **Fix** : branchement complet du file picker → lecture → validation → injection dans textarea.

### 2. Modal de réalisation : ajout du Toggle Chantier/Actualité
**Avant** : impossible de manuellement classer un post. **Après** : 2 radios visibles en haut du formulaire, valeur préfillée par classification auto, stockée dans `ai_generated.post_type`.

### 3. Analytics page : "Failed to fetch" silencieux
**Avant** : page disait "Edge Function ga4-stats n'a pas répondu" sans alternative. **Après** : appel direct à `analyticsdata.googleapis.com` avec messages d'erreur détaillés et boutons de résolution.

## 📊 État connexions au 2026-05-16 (matin)

| Outil | État | Action restante |
|---|---|---|
| 📘 Meta (FB + IG) | 🟢 OK | Token courte durée — App ID/Secret en base |
| 📍 Google Business Profile | 🟢 Config OK | Quota My Business API : attente Google (2-7 j) |
| 📊 Google Analytics 4 | 🟡 SA rejeté par UI GA | Plan B OAuth prêt à activer demain si besoin |
| 🤖 Claude IA | ⏸ | Clé `sk-ant-...` à coller |
| 🏢 CRM Apogée | ⏳ | Réponse Hugo Bulthé (Dynoco) en attente |
| 💬 Chat IA test | ❌ | Edge Function `chat-assistant` à déployer |
| 🌐 Site public | 🟢 OK | depan59-62.fr — Netlify build <30s |

## 🩺 Edge Functions absentes (à déployer plus tard)
- `ga4-stats` — remplacée par appel client-side ✅
- `refresh-meta-token` — remplacée par parseur JSON ✅
- `gbp-diagnostic` — bouton masqué ✅
- `chat-assistant` — à déployer pour activer le chatbot
- `notify-order`, `notify-contract`, `notify-lead` — à vérifier

→ La plupart sont contournées par du code client-side dans le back-office, qui marche sans Supabase CLI.

## 📁 Fichiers touchés cette session

```
admin-pro/realisations.html          — 3 onglets + toggle Chantier/Actu + bouton publier
admin-pro/analytics.html             — Plan A (SA) + Plan B (OAuth) GA4 client-side
admin-pro/finalize-config.html       — Upload JSON GA4 + clé Claude + infos société (+ handler fix)
admin-pro/oauth-ga4.html (nouveau)   — Flow OAuth user pour GA4 plan B
admin-pro/diagnostic-connexions.html (nouveau) — Pings live de toutes les APIs
admin-pro/assets/layout.js           — Sidebar : ajout OAuth GA4 + Finaliser config
realisations.html (public)           — Filtre respecte post_type tag
actualites.html (public)             — Charge legacy CMS + imports FB depuis Supabase
CHANGELOG-2026-05-16.md (nouveau)    — Ce fichier
```

---

## 🚀 Pour Florian quand tu reviens

### À faire (5 min total)
1. **Re-tester l'ajout du service account dans Property Access Management** → demain matin (délai propagation Google)
2. **Si bloqué** → utiliser le [Plan B OAuth GA4](https://depan59-62.fr/admin-pro/oauth-ga4.html) en 30 secondes
3. **Coller ta clé Claude IA** dans [Settings → IA](https://depan59-62.fr/admin-pro/settings.html#claude) ou via [finalize-config.html](https://depan59-62.fr/admin-pro/finalize-config.html)
4. **Envoyer la réponse à Hugo Bulthé** (mail rédigé hier — option B pour le webhook)

### Pour valider l'auto-classification Actus/Chantiers
1. Va sur [admin-pro/realisations.html](https://depan59-62.fr/admin-pro/realisations.html)
2. Clique l'onglet **📰 Actualités** — tu devrais voir tes vœux 2026, fin d'année, "radiateurs glacés"
3. Clique l'onglet **🔨 Chantiers** — tu devrais voir tes vraies réalisations (porte garage, vitre cassée, cellier…)
4. Si une publi est mal classée → clique dessus → Toggle 🔨/📰 → Enregistrer

### Pour vérifier le site public
- [depan59-62.fr/realisations.html](https://depan59-62.fr/realisations.html) — ne montre QUE les chantiers
- [depan59-62.fr/actualites.html](https://depan59-62.fr/actualites.html) — montre les vœux + posts FB marketing

---

**Auteur** : Florian Dhaillecourt + Claude
**Date** : 2026-05-16
**Branche** : main
**Commits** : ~30 auto-push via `autopush.sh` sur Mac
