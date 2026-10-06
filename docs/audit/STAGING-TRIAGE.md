# Triage branche `staging` (62 commits ∉ recette) — MERGE SÉLECTIF

> Analyse 2026-08-24. Branche `staging` tip `6d05c311` (tag `savepoint/staging-tip-6d05c311`).
> **Décision globale : MERGE SÉLECTIF — jamais de merge complet, ne PAS supprimer la branche.**
> Fichiers les plus touchés : `hc-widgets.js` (22×), `contact.html` (12×), `hc-edit-mode.js` (4×).

## ⛔ NE PAS MERGER (dangereux ou divergent)
| Thème | Raison |
|---|---|
| `feat(admin): 🚀 Promouvoir en prod` (`317919e3`, valider-staging.html) | **C'est le mécanisme promote-to-prod que T8 (`2ab95305`) a bloqué.** Le merger réintroduirait la faille. |
| WYSIWYG / `hc-widgets.js` (22 commits) | `hc-widgets.js` a **divergé sur recette** (CP-0015 : widget OK/KO retiré → CTA « Centre de validation »). Merger la lignée staging **écraserait** les changements recette. Conflit lourd. |
| `feat(prestations): double CTA Réserver/Commander` (`e91cf93a`) + `hotfix(paiements)` | Flux **paiement/commande** — lié au **Stripe gelé + P1 CRITIQUE edge**. À ne pas réactiver tant que la gate Stripe n'est pas traitée. |

## 🟡 CANDIDATS À REVUE puis cherry-pick (si non déjà superseded sur recette)
| Thème | Commits | Note |
|---|---|---|
| `fix(metiers): no-trust-band` | `ec9c7446`,`512e254c`,`523074bc`,`ba6640cc`,`1991d685` (task 70) | Corrections de bandeau réassurance sur pages métier — vérifier si déjà couvert par le travail recette avant cherry-pick. |
| `fix(map): polygone zone réel` | `3e55d6fc` | Fix du polygone de zone (var `zonePoly` undefined) — pertinent si la carte est encore utilisée ailleurs. |
| `polish(contact)` / `fix(contact)` | 10 commits sur `contact.html` | Améliorations page contact — revue visuelle requise. |
| `feat(a-propos)` | 2 commits | Contenu a-propos — revue. |

## Méthode recommandée (strangler, pas big-bang)
1. Pour chaque candidat 🟡 : `git show <sha>` → vérifier que le correctif n'est pas déjà présent sur recette.
2. Cherry-pick **un commit à la fois** sur recette (jamais un merge de branche), tester, pousser.
3. Ne jamais cherry-pick un commit touchant `hc-widgets.js` sans résoudre manuellement la divergence.
4. Laisser `staging` intacte (tag de sauvegarde posé). **Aucune suppression** (contient du travail unique).

## Statut
- **Décision** : MERGE SÉLECTIF. Aucun cherry-pick effectué ce cycle (revue business/QA requise sur les candidats).
- **Suppression branche** : NON (62 commits uniques, dont des correctifs potentiellement utiles).
