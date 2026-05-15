# CHANGELOG — Session 2026-05-15

Session "marathon connexions" — pose des fondations pour l'autonomie complète du back-office.

## 🎯 Objectif de la session
Brancher Facebook, Google Business Profile, Google Analytics 4 en bypassant les Edge Functions Supabase manquantes (CLI non disponible) — tout faire côté client avec le SDK Supabase + appels directs aux APIs Google/Meta.

---

## ✅ Connexions activées

### 📘 Meta (Facebook + Instagram) — CONNECTÉ
- App ID Meta : `986385010519313`
- App Secret Meta : saisi (rotated 15/05)
- Page Access Token : extrait du JSON `/me/accounts` via parseur automatique
- Page ID Facebook : `107405408058063` (Help Confort ST OMER)
- 4 champs en base via app_settings.meta
- Test API : ✅ "connexion OK"
- ⏳ Note : token courte durée → permanent à venir via App ID/Secret en client

### 📍 Google Business Profile — CONNECTÉ (config en base)
- Client ID OAuth : `410522966686-ejd9...`
- Client Secret : rotated (ancien révoqué, nouveau actif)
- Refresh Token : présent
- Account ID : `accounts/123456789012345` (à confirmer avec valeur réelle)
- 343 avis Google sur la fiche **HELP Confort Saint-Omer** (4,7 ★ · 812 interactions)
- ⏳ En attente : quota Google My Business (demande soumise hier, délai 2-7 j)

### 📊 Google Analytics 4 — CONNECTÉ (à finaliser)
- Property ID : `537770890`
- Service Account : `ga4-reader@help-confort-back-office.iam.gserviceaccount.com`
- ⚠️ Service Account JSON saisi tronqué (avec "...") → à re-coller en intégralité
- Page test client-side : `sync-ga4.html` (JWT RS256 via crypto.subtle, pas d'Edge Function)

---

## 🆕 Nouvelles pages back-office

| Page | Rôle |
|---|---|
| `sync-fb.html` | Rapatrie les 25 derniers posts FB → table `realisations` (auto-publié) |
| `sync-google-reviews.html` | Rapatrie les 343 avis Google → table `reviews` |
| `sync-ga4.html` | Test direct GA4 (JWT RS256 client-side, signed via crypto.subtle) |
| `seed-catalog.html` | Seed catégories + prestations manquantes (Chauffage, Électricité, Serrurerie, Vitrerie) + bouton fusion Chauffe-eau → Plomberie |
| `purge-tests.html` | Détecte et supprime leads + contrats test (nom/email/téléphone bidon) |

→ Toutes accessibles dans la **sidebar → "Outils maintenance"**

---

## 🐛 Fix critiques

### Bug n°1 — Save Settings écrasait les tokens (CRITIQUE)
**Problème** : `upsert({ value: payload })` remplaçait entièrement la value. Les champs password vides à l'affichage (sécurité) renvoyaient `undefined` → upsert vidait les autres champs en base.

**Cause** : Florian voyait son token FB "disparaître" à chaque enregistrement.

**Fix** : avant upsert, on lit la valeur actuelle en base, on merge avec payload, on upsert le merged. Les champs vides ne suppriment plus rien.

```javascript
const { data: current } = await c.from('app_settings').select('value').eq('key', key).maybeSingle();
const merged = { ...(current?.value || {}), ...payload };
await c.from('app_settings').upsert({ key, value: merged, ... });
```

### Bug n°2 — CSP bloquait graph.facebook.com
**Problème** : `Failed to fetch` sur sync-fb.html. Console révèle : "violates the following Content Security Policy directive: connect-src 'self' https://*.supabase.co ..."

**Fix** : ajout dans `netlify.toml` du `connect-src` :
- `https://graph.facebook.com`
- `https://*.fbcdn.net`
- `https://googleapis.com`
- `https://*.googleapis.com`

### Bug n°3 — Autofill browser remplit Instagram avec email
**Fix** : ajout de `autocomplete="off"` + `data-1p-ignore` + `data-lpignore="true"` sur tous les champs Meta + Instagram + Page ID. Aussi `inputmode="numeric" pattern="[0-9]*"` pour clavier mobile numérique.

### Bug n°4 — Bouton "Auto-récupérer Page Access Token" appelait Edge Function inexistante
**Fix** : bouton masqué `display:none` (le parseur JSON ci-dessus fait le job sans Edge Function). Texte des étapes mis à jour pour refléter la nouvelle méthode.

### Bug n°5 — Filtre frontend cachait les imports FB monophoto
**Problème** : la publi "Remplacement porte de garage" était importée mais cachée sur `/realisations.html` car le filtre exigeait `image_before` + `image_after`.

**Fix** : nouveau filtre — si l'import FB n'a qu'1 photo MAIS contient des mots-clés métier (`remplacement|installation|pose|dépannage|réparation|...`), il est accepté. Sinon (vœux/recrutement/com), il est exclu.

---

## 💰 Règles métier mises à jour

### Catégories catalogue
- **Chauffe-eau & Production ECS = sous-catégorie de Plomberie & Sanitaires** (décision Florian 2026-05-15)
- Bouton "🔀 Fusionner Chauffe-eau → Plomberie" sur seed-catalog.html
- Seed futur ne crée plus jamais la catégorie chauffe-eau séparée
- Mémoire mise à jour : `project_pricing_rules.md`

### Traitement des déchets
- **Ancien** : forfait fixe 1,67 € HT / 1,84 € TTC
- **Nouveau** : **1 % du montant HT du forfait** (calculé automatiquement)
- Référentiel + barème mis à jour dans services.html + TARIFS_REFERENCE.md

### Auto-validation imports FB
- Avant : `status='validation'` → Florian devait valider manuellement
- Maintenant : `status='publie'` + `published_at=now` directement à l'import
- Bouton "🟢 Auto-valider tous les imports FB en attente" pour rattraper l'existant

---

## 🎨 Dashboard épuré

**Avant** : 12 blocs (KPI, Live today, Pubs programmées, Connecter outils, Actions rapides x4, Synthèse commerciale, 2 graphiques, État canaux x6)

**Après** : 4 blocs minimaux pour le quotidien :
1. KPI x4 (Leads · Souscriptions · Commandes · Note Google)
2. Passerelle CRM (gros bouton Apogée + Inbox souscriptions)
3. Avis Google récents (conditionnel)
4. Activité récente (5 derniers événements)
5. Barre "Connexions à brancher" → Réglages

Les éléments retirés restent accessibles via leurs pages dédiées (SEO & Analytics, Réglages, Publications…). Placeholders cachés pour préserver les IDs JS référencés.

---

## 📧 Email Dynoco (CRM Apogée)

Hugo Bulthé (hugo@dynoco.fr) a répondu hier soir. Estime 2-3 h de dev pour créer une fonction API qui accepte un POST JSON et crée Lead/Tâche/Client selon le payload.

Réponse rédigée pour Florian (à valider/envoyer) :
- Option B : nouvelle fonction acceptant POST JSON
- Routage selon `type` : contract_subscription / service_order / contact_lead
- Schéma JSON proposé (client + détails + external_ref)
- Demande de budget HT + URL sandbox + endpoint prod + clé API header

---

## ⏳ En attente d'action externe

| Action | Délai | Bloquant ? |
|---|---|---|
| Quota Google My Business (sync 343 avis) | 2-7 jours ouvrés | Non — autre infra OK |
| Réponse Dynoco budget + endpoint | À leur main | Non — push manuel actuellement |
| Service Account JSON GA4 complet | À recoller par Florian | Bloque test GA4 |
| Clé Claude IA (sk-ant-...) | À coller par Florian | Bloque agents IA |
| SIRET pour Informations société | À fournir | Bloque mentions légales auto |

---

## 📊 Mémoires Claude mises à jour

- `project_pricing_rules.md` (nouveau) — Règles tarification : chauffe-eau ⊂ plomberie, déchets = 1 % du HT
- `MEMORY.md` index mis à jour

---

## 📁 Fichiers touchés

```
admin-pro/index.html              — Dashboard épuré
admin-pro/services.html           — Bannière auto-seed, 1% HT déchets, fusion CE
admin-pro/settings.html           — Parseur JSON Meta, autocomplete=off, fix save merge, bouton Auto-récupérer masqué
admin-pro/seed-catalog.html       — Bouton fusion Chauffe-eau, retrait catégorie CE du référentiel
admin-pro/sync-fb.html (nouveau)  — Sync FB côté client + auto-validation
admin-pro/sync-google-reviews.html (nouveau) — Sync avis Google
admin-pro/sync-ga4.html           — Test GA4 client-side (JWT RS256)
admin-pro/purge-tests.html (nouveau) — Purge leads + contrats test
admin-pro/assets/layout.js        — Nouvelle section "Outils maintenance" dans la sidebar
admin-pro/TARIFS_REFERENCE.md     — Déchets = 1 % du HT
realisations.html                 — Filtre permissif pour imports FB monophoto
netlify.toml                      — CSP : ajout graph.facebook.com + googleapis
memory/project_pricing_rules.md (nouveau)
memory/MEMORY.md
```

---

**Auteur** : Florian Dhaillecourt + Claude
**Date** : 2026-05-15
**Branche** : main
**Auto-push** : 30+ commits via daemon autopush.sh sur Mac
