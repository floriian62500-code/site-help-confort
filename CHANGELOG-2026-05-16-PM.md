# CHANGELOG — Session 2026-05-16 (après-midi)

Sprint autonomie totale — sprint dense après que GA4 OAuth ait réussi.

## 🎯 Connexions finalisées

| Outil | État |
|---|---|
| 📊 **Google Analytics 4** | 🟢 OPÉRATIONNEL via OAuth user (refresh token), pas via service account |

→ Voir `memory/project_ga4_oauth_success.md` pour les détails.

## ✨ Nouveautés UI

### Analytics
- **Refonte UI complète** : header dégradé GA4 + 4 KPI hero colorés + graphique Chart.js d'évolution + top sources avec icônes par origine (Google Search, FB, IG, etc.) + top pages cliquables vers vraies pages publiques + devices + top villes
- **Sélecteur de période** : 7j / 30j / 90j / 1an (rechargement avec `?period=Xd`)
- **Heatmap horaire** : grille 7×24 (jour × heure) avec dégradé bleu selon intensité — utile pour pic d'audience
- **Funnel de conversion** : Visiteurs → Pages clés → Clics tel/email/WA → Leads → Contrats avec entonnoir visuel + CA estimé
- **3 boutons d'action** sur erreur GA4 : Plan B OAuth (vert) · Re-coller JSON · Test détaillé · Activer API

### Dashboard
- **Widget GA4 live** : Visiteurs / Sessions / Pages vues / Conversions (clics tel+email+WA+form) sur 7j
- **Top pages** mini + **mini heatmap horaire** (barres verticales 24h avec hauteur selon sessions)
- Lecture **via OAuth user** (priorité) puis fallback Service Account

### Réalisations admin
- **3 onglets** : 🔨 Chantiers · 📰 Actualités · 📋 Tout (avec compteurs)
- **Toggle Chantier/Actualité** dans le modal d'édition (priorité absolue sur la détection auto)
- **Bouton "Valider et publier"** vert : force status=publie + canal site coché en 1 clic
- Détection auto Chantier/Actu basée sur mots-clés métier + présence avant/après

### Tarifs
- **CRUD complet** sur `tarifs.html` : édition inline + suppression + ajout pour Tarif horaire ET Contrats annuels
- Stockage dans `app_settings.pricing` (sauvegarde auto à chaque modification)
- **services.html → onglet Tarifs** lit depuis la même source (cohérence cross-pages)
- Lien "✎ Modifier dans Tarifs →" depuis services.html
- **Tarifs Dunkerque ajoutés** : MO 55€ HT/h · Déplacement 48€ HT (anciennement 80€)

### Tracking (site public)
- **Clics tel / mailto / WhatsApp** automatiquement trackés via tracking.js (events GA4 `click_phone` / `click_email` / `click_whatsapp`)
- **Soumissions formulaire** trackées (event `form_submit`)
- **Scroll depth** tracked (25/50/75/100%)
- **UTM capture** : utm_source / utm_medium / utm_campaign / gclid / fbclid stockés en sessionStorage, injectés automatiquement comme hidden fields lors des submits → traçabilité totale des leads

### Nouvelles pages back-office
- `analytics.html` : refonte UI complète (déjà existant, totalement réécrit)
- `oauth-ga4.html` : flow OAuth user pour GA4
- `refresh-meta-token-client.html` : renouvellement Page Access Token FB côté client (long-lived → permanent)

## 🐛 Bugs corrigés

| Bug | Fix |
|---|---|
| `price_source` column not found sur seed-catalog | Retiré du payload (colonne pas en base) |
| Lien `TARIFS_REFERENCE.md` 404 (vers /docs/) | Corrigé vers `/admin-pro/` |
| `Déplacement Dunkerque 80€` (obsolète) | Remplacé par 48 € HT / 52,80 € TTC |
| Pictos catalogue admin non cliquables | Désormais cliquables vers pages métier publiques avec hover scale |
| Daemon autopush bloqué sur conflit nightly | Résolu via `git pull -X ours --no-rebase --no-edit && git push` |

## 📁 Fichiers touchés

```
admin-pro/analytics.html              — Refonte UI + OAuth + heatmap + funnel + UTM events
admin-pro/index.html                  — Widget GA4 live + mini heatmap dashboard
admin-pro/oauth-ga4.html (nouveau)    — Flow OAuth GA4
admin-pro/refresh-meta-token-client.html (nouveau) — Renouveler token FB permanent côté client
admin-pro/realisations.html           — Onglets Chantier/Actu + toggle modal + "Valider et publier"
admin-pro/tarifs.html                 — CRUD complet horaire + contrats
admin-pro/services.html               — Pictos cliquables + lecture app_settings.pricing
admin-pro/finalize-config.html        — Fix handler upload .json
admin-pro/settings.html               — Parseur JSON Meta amélioré
admin-pro/seed-catalog.html           — Fix price_source removed
admin-pro/assets/layout.js            — Sidebar : OAuth GA4 + Renouveler token FB
assets/tracking.js                    — UTM capture + form hidden fields + click_phone/email/wa + scroll_depth
realisations.html (public)            — Filtre respecte ai_generated.post_type
actualites.html (public)              — Charge legacy CMS + imports FB depuis Supabase
admin-pro/TARIFS_REFERENCE.md         — Tarifs Dunkerque
netlify.toml                          — CSP : graph.facebook.com + googleapis
memory/project_ga4_oauth_success.md (nouveau)
memory/project_pricing_rules.md (mis à jour)
CHANGELOG-2026-05-16.md (existant) + CHANGELOG-2026-05-16-PM.md (nouveau, ce fichier)
```

## ⏳ Reste à faire (non bloquant)

- Edge Functions à déployer côté serveur (chat-assistant, refresh-meta-token, notify-*)
- Webhook CRM Apogée (en attente réponse Hugo Bulthé / Dynoco)
- Quota Google My Business pour sync 343 avis (en attente Google)
- SIRET + clé Claude IA à coller par Florian
- Préciser ce qu'il voulait dire avec "FMB reineur"
- Export CSV/PDF stats GA4
- Comparaison année-année sur Analytics
- Suivi vues par chantier
- Page Bilan mensuel
- Refonte dashboard "3 modules" (Comm / RH / Outils) — plan validé, pas implémenté
- Toggle dark mode persistant

---

**Auteur** : Florian Dhaillecourt + Claude
**Date** : 2026-05-16 après-midi
**Commits** : ~30 auto-push via daemon autopush.sh + 1 push manuel après résolution de divergence
