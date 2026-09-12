# SECOND-PASS-DEEP-CODE-SECURITY — revue profonde par pattern (issue #9 / 5398476753)

> Périmètre scanné : **256 pages HTML + 37 assets JS** (repo-wide, hors `docs/` et `node_modules/`). 2026-08-24. `recette`.

## B — Patterns d'exécution / injection (occurrences repo-wide + verdict)
| Pattern | Occurrences | Verdict |
|---|---|---|
| `eval(` | **0** | ✅ aucun |
| `new Function(` | **0** | ✅ aucun |
| `setTimeout('string')` / `setInterval('string')` | **0** | ✅ aucun |
| `data:text/html` | **0** | ✅ aucun |
| `postMessage(` | **0** | ✅ aucun |
| `XMLHttpRequest` | **0** | ✅ (fetch uniquement) |
| `document.write(` | **2** | 🟡 admin-only (`admin-pro/leads.html` PDF print, `wizard-google.html` rendu HTML admin) — hors surface publique |
| `javascript:` URL | **39** | ✅ **38 = `javascript:void(0)`** (no-op bénin) + 1 fragment ; aucun exécutable risqué |
| `.innerHTML =` | **611** | 🟡 majorité = templates statiques ; les cas alimentés par param URL/review/chat = **échappés `esc()`** (vérifié T8/T26) ; aucun XSS reflété trouvé |
| `insertAdjacentHTML` | **5** | 🟡 templates internes (données catalogue Supabase, pas d'input libre) |
| `document.cookie` | **7** | 🟡 consentement/analytics (pas de secret) |
| **`target="_blank"` sans `rel`** | **70 → CORRIGÉ (71 balises)** | ✅ **P2 corrigé** `ee445b54` : `rel="noopener noreferrer"` ajouté (reverse tabnabbing / fuite `window.opener`) |

## B4 — Appels réseau (matrice de volume)
- `fetch(` : **143** occurrences ; `Supabase REST/edge` (`/rest/v1/`, `/functions/v1/`, `supabase.`) : **472**.
- Auth : clé **publishable** (publique par design) côté front ; **aucune** clé privilégiée (0 `service_role`/`sk_live` réel — scan #28).
- Endpoint lead = edge `submit-lead-v6` (validation+rate-limit+honeypot serveur). Catalogue = `v_services_public` (SELECT public). Pas de POST direct `/rest/v1/leads` côté front (chemin = edge).

## #31 — catch silencieux
- `catch(){}` vides : **178** occurrences. La majorité = défensif (non-bloquant volontaire). **1 cas critique déjà trouvé et corrigé** : le `catch` de `refreshNext()` masquait le bug d'erreurs inline du wizard (fix `c6f2d349`). Recommandation : au fil des touches futures, logguer dans les `catch` de flux métier (pas un chantier de masse sûr sans revue cas par cas).

## Findings de ce second pass
| # | Finding | Sévérité | Statut |
|---|---|---|---|
| 1 | 71 `target=_blank` sans `rel` (reverse tabnabbing) | P2 | ✅ **CORRIGÉ** `ee445b54` |
| 2 | `document.write` sur 2 pages admin | P3 | 🟡 admin-only ; couvrir par auth admin (déjà recommandé) |
| 3 | 178 `catch{}` silencieux | P3 | 🟡 code-smell ; 1 cas métier déjà corrigé ; reste = revue cas par cas |
| 4 | (rappel) app_settings/staging_validations RLS | P2 | gate DB (SECURITY-AUDIT) |
| 5 | (rappel) edge Stripe LIVE public | P1 CRITIQUE | gate (STRIPE-REMEDIATION) |

## Métriques de couverture prouvée
- Fichiers scannés : **293** (256 HTML + 37 JS).
- Patterns d'exécution dangereux (`eval`/`Function`/`document.write`-public/`setTimeout-string`) : **0 sur surface publique**.
- Correction concrète appliquée ce pass : **71 balises** (`ee445b54`), smoke **12/12** après.
- Risques résiduels bornés : 5 findings ci-dessus (2 gate, 2 P3 admin/code-smell, 1 corrigé).
