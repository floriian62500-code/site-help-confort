# Audit fallback Supabase — 2026-05-30 06:27

Sonde MEMOIRE #49 — toute page qui consomme Supabase doit déclarer un `LOCAL_CATALOG` / `FALLBACK_DATA` pour éviter une page vide en cas de coupure ou de RLS bloquée.

## Synthèse

- Pages auditées : **114**
- Pages qui consomment Supabase : **12**
- Pages avec fallback explicite : **7**
- **Alertes** : **6** (3 erreur(s), 3 warning(s))

## 🚨 Pages sans fallback

| Page | Sévérité | Signatures Supabase | Catch de secours ? |
|------|----------|---------------------|--------------------|
| `avant-apres.html` | ❌ erreur | `/rest/v1/realisations` | non |
| `contrats-entretien.html` | ⚠️ warning | `createClient(` | non |
| `devis-express.html` | ❌ erreur | `/rest/v1/leads` | non |
| `espace-client-dashboard.html` | ⚠️ warning | `createClient(` | non |
| `espace-client.html` | ⚠️ warning | `createClient(` | non |
| `realisation.html` | ❌ erreur | `createClient(` | non |

## ✅ Pages avec fallback (Supabase + LOCAL_CATALOG/FALLBACK)

- `actualites.html` — `fetch('content/actualites/index.json?t='`
- `blog.html` — `fetch('content/actualites/index.json?t='`
- `index.html` — `LOCAL_CATALOG`, `fetch('content/apporteurs/index.json?v='`, `fetch('content/config/reviews.json?v='`
- `nos-prestations.html` — `LOCAL_CATALOG`
- `realisations.html` — `actus = [
 { url:'guide-entretien-chaudiere.html', title:`
- `temoignages.html` — `allReviews = [
 {author_name:`

## ℹ️ Pages sans consommation Supabase (102)

> Non concernées par la sonde — pas d'attente de fallback.
