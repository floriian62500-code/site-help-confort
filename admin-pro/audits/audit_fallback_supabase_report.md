# Audit fallback Supabase — 2026-05-15 17:49

Sonde MEMOIRE #49 — toute page qui consomme Supabase doit déclarer un `LOCAL_CATALOG` / `FALLBACK_DATA` pour éviter une page vide en cas de coupure ou de RLS bloquée.

## Synthèse

- Pages auditées : **38**
- Pages qui consomment Supabase : **9**
- Pages avec fallback explicite : **2**
- **Alertes** : **7** (5 erreur(s), 2 warning(s))

## 🚨 Pages sans fallback

| Page | Sévérité | Signatures Supabase | Catch de secours ? |
|------|----------|---------------------|--------------------|
| `avant-apres.html` | ❌ erreur | `/rest/v1/realisations` | non |
| `blog.html` | ❌ erreur | `/rest/v1/articles` | non |
| `contrats-entretien.html` | ⚠️ warning | `createClient(` | non |
| `devis-express.html` | ❌ erreur | `/rest/v1/leads` | non |
| `realisation.html` | ❌ erreur | `createClient(` | non |
| `realisations.html` | ⚠️ warning | `createClient(` | non |
| `temoignages.html` | ❌ erreur | `/rest/v1/reviews` | non |

## ✅ Pages avec fallback (Supabase + LOCAL_CATALOG/FALLBACK)

- `index.html` — `LOCAL_CATALOG`
- `nos-prestations.html` — `LOCAL_CATALOG`

## ℹ️ Pages sans consommation Supabase (29)

> Non concernées par la sonde — pas d'attente de fallback.
