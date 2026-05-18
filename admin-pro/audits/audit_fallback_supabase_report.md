# Audit fallback Supabase — 2026-05-18 07:00

Sonde MEMOIRE #49 — toute page qui consomme Supabase doit déclarer un `LOCAL_CATALOG` / `FALLBACK_DATA` pour éviter une page vide en cas de coupure ou de RLS bloquée.

## Synthèse

- Pages auditées : **76**
- Pages qui consomment Supabase : **10**
- Pages avec fallback explicite : **34**
- **Alertes** : **3** (2 erreur(s), 1 warning(s))

## 🚨 Pages sans fallback

| Page | Sévérité | Signatures Supabase | Catch de secours ? |
|------|----------|---------------------|--------------------|
| `contrats-entretien.html` | ⚠️ warning | `createClient(` | non |
| `devis-express.html` | ❌ erreur | `/rest/v1/leads` | non |
| `realisation.html` | ❌ erreur | `createClient(` | non |

## ✅ Pages avec fallback (Supabase + LOCAL_CATALOG/FALLBACK)

- `actualites.html` — `fetch('content/actualites/index.json?t='`
- `avant-apres.html` — `fetch('content/realisations/index.json?v='`
- `blog.html` — `fetch('content/actualites/index.json?t='`
- `index.html` — `LOCAL_CATALOG`, `fetch('content/apporteurs/index.json?v='`, `fetch('content/config/reviews.json?v='`
- `nos-prestations.html` — `LOCAL_CATALOG`
- `realisations.html` — `actus = [
 { url:'guide-entretien-chaudiere.html', title:`, `fetch('content/realisations/index.json'`
- `temoignages.html` — `allReviews = [
 {author_name:`

## ℹ️ Pages sans consommation Supabase (66)

> Non concernées par la sonde — pas d'attente de fallback.
