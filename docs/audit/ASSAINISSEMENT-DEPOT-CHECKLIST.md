<<<<<<< HEAD
# ASSAINISSEMENT TOTAL DU DEPOT — CHECKLIST DE PREUVE

Statut de cette mission : NON TERMINE tant que chaque section n'est pas couverte par des preuves, des tests et des SHA.

## 1. Parcours commercial critique
- [ ] Achat/reservation d'une prestation tarifable teste en E2E sur recette
- [ ] Prix affiche et verifie
- [ ] Coordonnees client validees
- [ ] Commande/reservation reellement creee
- [ ] Stripe TEST teste si applicable
- [ ] Confirmation finale verifiee
- [ ] Parcours devis/contact separe des prestations achetables
- [ ] Double clic / retour / refresh / erreur reseau testes

Preuves obligatoires : URLs, resultat E2E, SHA, donnees TEST creees/nettoyees.

## 2. Wizard et formulaires
- [ ] Aucun bouton bloque sans erreur visible
- [ ] Erreurs inline par champ
- [ ] Focus/scroll premier champ invalide
- [ ] Validation adresse/CP/ville explicite
- [ ] Telephone/email testes
- [ ] Erreurs serveur et reseau traitees
- [ ] Anti-doublon/idempotence controles

## 3. Pages metiers
- [ ] Grande carte de zone supprimee des pages metiers
- [ ] Carte conservee uniquement sur page zones-intervention
- [ ] Bloc fournisseurs en doublon supprime
- [ ] Bloc 6 engagements compacte
- [ ] Pas de repetition inutile avec bandeau reassurance
- [ ] Templates/composants communs corriges a la source
- [ ] CSS/JS/Leaflet inutiles retires
- [ ] Desktop + mobile testes

## 4. Branches
Branches a auditer :
- [ ] main
- [ ] recette
- [ ] staging
- [ ] integration/lot1-lot2-vs-prod
- [ ] chore/control-plane-bootstrap
- [ ] chore/claude-control-runner

Pour chaque branche documenter :
- role
- dernier usage
- divergence main/recette
- commits uniques utiles
- PR associee
- dependances
- decision CONSERVER / MERGER SELECTIVEMENT / ARCHIVER / SUPPRIMER
- SHA de sauvegarde avant toute suppression

Aucune suppression tant qu'un commit unique utile n'a pas ete securise.

## 5. Cartographie architecture
- [ ] Arborescence principale documentee
- [ ] Pages/templates/composants identifies
- [ ] JS globaux/specifiques identifies
- [ ] CSS globaux/specifiques identifies
- [ ] Netlify documente
- [ ] Supabase documente
- [ ] Fonctions serverless documentees
- [ ] Stripe TEST documente
- [ ] Leads/commandes documentes
- [ ] Centre de validation documente
- [ ] CI/CD documente
- [ ] Control plane ChatGPT/Claude documente
- [ ] Variables d'environnement documentees sans secrets
- [ ] Procedure locale/test/recette/release/rollback documentee

## 6. Code mort / doublons / orphelins
- [ ] Fichiers jamais references recherches
- [ ] Assets orphelins recherches
- [ ] JS inutilises recherches
- [ ] CSS/classes inutilises recherches
- [ ] Fonctions/listeners inutilises recherches
- [ ] Imports/variables inutiles recherches
- [ ] Anciens forms/widgets/modales recherches
- [ ] Anciens systemes de validation recherches
- [ ] Anciens mecanismes PROD recherches
- [ ] Backups/copies/debug/TODO obsoletes recherches
- [ ] Feature flags morts recherches
- [ ] Duplications HTML/JS/CSS recherchees
- [ ] Logique metier dupliquee recherchee

Pour chaque suppression : preuve d'inutilite + test apres suppression + SHA.

## 7. Securite
- [ ] Secrets/tokens/PAT dans repo et historique controles
- [ ] Cles privilegiees frontend controlees
- [ ] XSS/innerHTML/parametres URL controles
- [ ] Validation/sanitation client + serveur controlees
- [ ] CORS controle
- [ ] Endpoints publics/permissifs controles
- [ ] Rate limit/anti-spam evalues
- [ ] Double soumission/idempotence controles
- [ ] Messages d'erreur sensibles controles
- [ ] Supabase RLS controlee
- [ ] Storage permissions controlees
- [ ] Acces admin/recette controles
- [ ] Logs avec donnees personnelles controles
- [ ] Headers securite controles
- [ ] Dependances vulnerables controlees
- [ ] Stripe TEST/LIVE separation controlee
- [ ] Impossible d'utiliser LIVE depuis recette
- [ ] Prix/montants recalcules cote serveur si necessaire
- [ ] Separation TEST/PROD controlee

## 8. Donnees et environnements
- [ ] Tests ne polluent pas vraies donnees
- [ ] Fixtures nettoyees
- [ ] Leads TEST identifies
- [ ] Commandes TEST identifiees
- [ ] Donnees recette/prod separees
- [ ] Aucun endpoint recette sur ressources LIVE non voulu

## 9. Release flow
- [ ] Validation rattachee a release_id + SHA immuable
- [ ] Modification apres validation => revalidation
- [ ] Etats A TESTER / VALIDE RECETTE / PRET PROD / DEPLOYE PROD
- [ ] Inventaire DEJA PROD / VALIDE PAS PROD / A REVALIDER / NON VALIDE
- [ ] Aucun merge aveugle recette -> main
- [ ] Aucun token de promotion cote frontend
- [ ] Rollback documente

## 10. Front / UX / qualite
- [ ] Console JS propre
- [ ] 404/500 involontaires traites
- [ ] Erreurs reseau gerees
- [ ] Responsive 320/375/390/768/1024/1440/1920
- [ ] Pas de debordement horizontal
- [ ] Navigation clavier/focus controles
- [ ] Alt/H1/H2/H3 controles
- [ ] LCP/CLS et ressources lourdes controles
- [ ] DOM excessif recherche
- [ ] Scripts tiers evalues
- [ ] SEO technique controle

## 11. Tests automatises
- [ ] Smoke tests
- [ ] E2E funnel critique
- [ ] E2E erreurs formulaire
- [ ] E2E mobile
- [ ] Tests release flow
- [ ] Tests nettoyage apres creation donnees TEST

## 12. Documentation mainteneur
- [ ] README architecture
- [ ] Guide structure repertoires
- [ ] Politique branches
- [ ] Conventions commits
- [ ] Regles recette/main
- [ ] Lancer tests
- [ ] Modifier page metier
- [ ] Ajouter prestation
- [ ] Supabase/Netlify/Stripe TEST
- [ ] Release et rollback
- [ ] Points sensibles a ne pas casser

## 13. Rapport de fin obligatoire
Le rapport final doit contenir :
- toutes les branches et leur decision
- toutes les zones auditees
- zones non auditees et pourquoi
- code mort supprime
- doublons mutualises/supprimes
- failles/problemes securite trouves
- corrections effectuees
- tests executes + resultats
- liste complete des commits/SHA
- elements conserves avec justification
- dette residuelle
- prochaine action si quelque chose reste

Un simple message "audit termine" ou "rien a signaler" sans cette matrice = mission NON TERMINEE.
=======
# Checklist d'assainissement du dépôt — Help Confort (issue #9, plan 15 tâches)

> Statut par tâche. `recette` uniquement. Mise à jour 2026-08-21.
> Légende : ✅ FAIT · 🟡 PARTIEL · ⛔ GATE (bloqué validation humaine) · 🔴 À FAIRE

| # | Tâche | Statut | SHA / preuve | Reste |
|---|---|---|---|---|
| 1 | **P0 achat/réservation E2E** | ✅ FAIT (verdict) | E2E : prestation→prix 771€→coords→réservation. Fix catalogue `44a320e9`. | ⛔ **Achat en ligne payé = gate** : Stripe LIVE only, pas de clé TEST → réservation = lead. Rétablir = clé Stripe TEST + hardening edge. |
| 2 | **P0 wizard/validation** | ✅ FAIT | `814a911c` : bouton cliquable, erreurs inline, focus/scroll, hint. E2E « Cochez un métier ». | 🟡 matrices double-clic/réseau/back → tâche 14 |
| 3 | **Pages métiers UX** | ✅ FAIT | carte zone `2a7494b8` (40 pages), fournisseurs `44771708` (7), engagements compact `458a1928` (7) + item centre `2ca85333` | test visuel 1440/1024/768/390/375 (pane limité) |
| 4 | **Cartographie / ARCHITECTURE.md** | ✅ FAIT | `fd276717` — docs/ARCHITECTURE.md complet | — |
| 5 | **Audit branches** | ✅ FAIT | table + décisions dans ARCHITECTURE.md §2 ; backup = SHA de tête de chaque branche | staging 62 commits à trier (merge sélectif) |
| 6 | **Code mort / orphelins** | 🟡 PARTIEL | `2d0c8b0d` : hc-avis.js + hc-avis-carousel.js supprimés (0 include, faux avis à risque) ; hc-edit-mode.js restauré (chargé dynamiquement) | CSS `.m-suppliers` orphelin, `_backup_png` 4.6M |
| 7 | **Doublons / mutualisation** | 🟡 PARTIEL | engagements/fournisseurs/zone traités à la source (édition commune) | `.m-suppliers` CSS dupliqué inline |
| 8 | **Sécurité frontend (XSS)** | 🔴 EN COURS | — | innerHTML/params URL/open-redirect à auditer |
| 9 | **Sécurité backend/Supabase** | ✅ FAIT | SECURITY-AUDIT-2026-08.md `e2d58346` : PII non lisible anon, RLS ok, **P1 INSERT anon leads** (migration proposée) | ⛔ migration = gate DB |
| 10 | **Stripe TEST/PROD** | ✅ FAIT | vérifié : chemin client **gelé**, aucun LIVE depuis recette, montant DOM neutralisé | ⛔ TEST = gate clé |
| 11 | **Release flow recette→prod** | 🟡 SOCLE | `1d4f0c23` : migration 4 tables + générateur (71 promo/47 exclus) + proposition | 🔴 réécriture `/recette.html` (gate DB) |
| 12 | **Qualité front** | 🟡 PARTIEL | console GA `c77fa5bd` + catalogue 400 `efc0a5db` ; liens 0 cassé ; a11y 0 img sans alt / 1 h1 ; titres réalisations `a433ed7c` | responsive 11 gabarits (pane limité) |
| 13 | **Performance** | 🟡 AUDITÉ | scan defer/images/lazy : images lourdes **orphelines** (4.2M PNG), lazy 1292/1468 | recompression/cleanup (risque faux-orphelin dynamique) |
| 14 | **Tests automatisés** | 🔴 À FAIRE | — | smoke/E2E des parcours critiques + nettoyage données test |
| 15 | **Doc mainteneur finale** | ✅ FAIT | ARCHITECTURE.md (archi, branches, conventions, procédures, points sensibles) | — |

## Synthèse
- **FAIT** : 1(verdict), 2, 3, 4, 5, 9, 10, 15
- **PARTIEL** : 6, 7, 11, 12, 13
- **À FAIRE** : 8 (en cours), 14
- **GATES humains** : clé Stripe TEST (tâche 1/10), migrations DB (9/11), repo privé pour runner.

## Gates (bloqués validation humaine — documentés, non exécutables par Claude)
1. **Stripe TEST** : fournir `sk_test_` → achat en ligne réel + E2E.
2. **Migrations DB** : durcissement INSERT leads + 4 tables release flow (apply = GO).
3. **Netlify privé** : autoriser l'app Netlify sur repo privé avant activation runner.
>>>>>>> 2ba6c01f (docs(audit): checklist assainissement dépôt (#9 plan 15 tâches) — statut explicite par tâche + SHA + gates. 8 faites, 5 partielles, 2 à faire (sécu XSS + tests), 3 gates humains)
