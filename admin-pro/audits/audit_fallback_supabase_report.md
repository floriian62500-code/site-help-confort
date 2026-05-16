# Audit fallback Supabase — 2026-05-16 05:56

Sonde MEMOIRE #49 — toute page qui consomme Supabase doit déclarer un `LOCAL_CATALOG` / `FALLBACK_DATA` pour éviter une page vide en cas de coupure ou de RLS bloquée.

## Synthèse

- Pages auditées : **38**
- Pages qui consomment Supabase : **9**
- Pages avec fallback explicite : **13**
- **Alertes** : **3** (2 erreur(s), 1 warning(s))

## 🚨 Pages sans fallback

| Page | Sévérité | Signatures Supabase | Catch de secours ? |
|------|----------|---------------------|--------------------|
| `contrats-entretien.html` | ⚠️ warning | `createClient(` | non |
| `devis-express.html` | ❌ erreur | `/rest/v1/leads` | non |
| `realisation.html` | ❌ erreur | `createClient(` | non |

## ✅ Pages avec fallback (Supabase + LOCAL_CATALOG/FALLBACK)

- `avant-apres.html` — `fetch('content/realisations/index.json?v='`
- `blog.html` — `fetch('content/actualites/index.json?t='`
- `index.html` — `LOCAL_CATALOG`, `fetch('content/apporteurs/index.json?v='`, `fetch('content/config/reviews.json?v='`
- `nos-prestations.html` — `LOCAL_CATALOG`
- `realisations.html` — `actus = [
 { slug:'2026-05-07-remplacement-de-panneau-pvc-modele-surinam-3', title:`, `fetch('content/realisations/index.json'`
- `temoignages.html` — `allReviews = [
 {author_name:`

## ℹ️ Pages sans consommation Supabase (29)

> Non concernées par la sonde — pas d'attente de fallback.
