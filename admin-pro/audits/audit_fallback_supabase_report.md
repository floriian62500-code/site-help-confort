# Audit fallback Supabase — 2026-10-08 10:10

Sonde MEMOIRE #49 — toute page qui consomme Supabase doit déclarer un `LOCAL_CATALOG` / `FALLBACK_DATA` pour éviter une page vide en cas de coupure ou de RLS bloquée.

## Synthèse

- Pages auditées : **117**
- Pages qui consomment Supabase : **14**
- Pages avec fallback explicite : **6**
- **Alertes** : **10** (3 erreur(s), 7 warning(s))

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
| `realisations.html` | ⚠️ warning | `createClient(` | non |

## ✅ Pages avec fallback (Supabase + LOCAL_CATALOG/FALLBACK)

- `actualites.html` — `fetch('content/actualites/index.json?t='`
- `blog.html` — `fetch('content/actualites/index.json?t='`
- `nos-prestations.html` — `LOCAL_CATALOG`
- `temoignages.html` — `allReviews = [
 {author_name:`

## ℹ️ Pages sans consommation Supabase (103)

> Non concernées par la sonde — pas d'attente de fallback.
