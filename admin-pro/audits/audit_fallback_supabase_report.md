# Audit fallback Supabase — 2026-06-06 06:32

Sonde MEMOIRE #49 — toute page qui consomme Supabase doit déclarer un `LOCAL_CATALOG` / `FALLBACK_DATA` pour éviter une page vide en cas de coupure ou de RLS bloquée.

## Synthèse

- Pages auditées : **115**
- Pages qui consomment Supabase : **15**
- Pages avec fallback explicite : **7**
- **Alertes** : **9** (3 erreur(s), 6 warning(s))

## 🚨 Pages sans fallback

| Page | Sévérité | Signatures Supabase | Catch de secours ? |
|------|----------|---------------------|--------------------|
| `avant-apres.html` | ❌ erreur | `/rest/v1/realisations` | non |
| `contrats-entretien.html` | ⚠️ warning | `createClient(` | non |
| `devis-express.html` | ❌ erreur | `/rest/v1/leads` | non |
| `espace-client-dashboard.html` | ⚠️ warning | `createClient(` | non |
| `espace-client.html` | ⚠️ warning | `createClient(` | non |
| `fournisseur.html` | ⚠️ warning | `/rest/v1/suppliers` | non |
| `nos-villes.html` | ⚠️ warning | `/rest/v1/communes` | oui |
| `partenaire.html` | ⚠️ warning | `/rest/v1/partners` | non |
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

## ℹ️ Pages sans consommation Supabase (100)

> Non concernées par la sonde — pas d'attente de fallback.
