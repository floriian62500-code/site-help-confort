# Où modifier quoi

> Le raccourci du projet : « je veux changer X, je touche quoi ? ». Mise à jour : 2026-09-20.
> En cas de doute, la règle est toujours la même : **chercher l'existant avant de créer**.

## Contenu du site

| Je veux changer… | Fichier / commande | Piège |
|---|---|---|
| un texte, un titre, une image d'une page | la page `.html` elle-même | les pages sont **statiques**, il n'y a pas de moteur de gabarit |
| l'**en-tête** (menu, logo, mégamenu) | `partials/header.html` puis `node scripts/header/sync-header.mjs` | ne **jamais** éditer l'en-tête dans une page : `scripts/tests/header.test.mjs` échoue |
| le **pied de page** | il est copié dans chaque page (pas encore de partiel) | modifier par script sur toutes les pages, jamais une seule |
| les **prix** affichés | ils viennent de Supabase (`v_services_public`, `v_contract_offers`) | aucun prix en dur : voir [DATABASE.md](DATABASE.md) |
| une **offre d'emploi** | `data/offres-emploi.json` puis `node scripts/gen-offres-emploi.mjs` | ne jamais inventer salaire, prime, horaires |
| une **fiche chantier** | base Supabase (`realisations`) puis `node scripts/gen-realisations.mjs` | le manifeste `realisations/index.json` conditionne l'affichage des cartes |
| **créer une page** | d'abord `node scripts/seo/duplicate-intent.mjs --intent "…"` | cf. [../process/REGLE-PAGE-CANONIQUE.md](../process/REGLE-PAGE-CANONIQUE.md) |
| le **sitemap** | `supabase/functions/sitemap/index.ts` | il faut **déployer la fonction** pour que ça prenne effet (décision humaine) |
| une **redirection** | `_redirects` | l'ordre compte : la première règle qui matche gagne |

## Apparence

| Je veux changer… | Fichier | Piège |
|---|---|---|
| un style global (couleurs, boutons, grilles) | `styles.css` (chargé par 115 pages) | penser à bumper `styles.css?v=` sur les pages concernées |
| le style de l'en-tête | `assets/hc-header.css` | version dans `sync-header.mjs` |
| le style d'une page particulière | le `<style>` inline de la page | vérifier ensuite `node scripts/seo/fix-compound-selectors.mjs --check` |
| le **gabarit premium** d'une page d'atterrissage | copier le bloc `<style>.seo-…` d'une page `prestations/` | c'est le niveau visuel de référence du site |

## Parcours client

| Je veux changer… | Fichier | Piège |
|---|---|---|
| le **tunnel de demande** (« Ma demande ») | `assets/hc-demande.js`, `assets/hc-demande-core.js`, `assets/hc-demande.css` | bumper la version : `node scripts/bump-module-version.mjs` (il remplace la chaîne partout : vérifier le diff) |
| le **panier / catalogue** | `catalogue.html`, `assets/hc-cart.js` | voir [CATALOGUE-PANIER-ARCHITECTURE.md](CATALOGUE-PANIER-ARCHITECTURE.md) |
| un **formulaire** de page (rappel, candidature) | la page + `assets/hc-leads-capture.js` | le serveur impose un contrat par `form_type` : [LEADS-AND-NOTIFICATIONS.md](LEADS-AND-NOTIFICATIONS.md) |
| le **bandeau cookies** | `assets/hc-consent.js` | il publie `--hc-consent-h` : les éléments flottants doivent s'en écarter |
| la **mesure d'audience** | `assets/tracking.js`, `hc-landing.js`, `hc-recrutement.js` | rien ne part avant consentement, et jamais de donnée personnelle |

## Serveur

| Je veux changer… | Où | Qui déploie |
|---|---|---|
| une **fonction edge** | `supabase/functions/<nom>/index.ts` | **déploiement manuel** = décision humaine ([DEPLOYMENT.md](DEPLOYMENT.md)) |
| le **schéma de la base** | `supabase/migrations/*.sql` | appliqué **automatiquement** au push sur `main` (GitHub Actions) |
| une migration à ne PAS appliquer tout de suite | `supabase/_pending_migrations/` | rien ne s'exécute depuis ce dossier |
| les **en-têtes HTTP / le cache** | `netlify.toml`, `_headers` | `/assets/*` est immuable un an |

## Automatisations de la machine de Florian

| Je veux… | Où |
|---|---|
| arrêter l'auto-push | `touch "$HOME/Library/Application Support/HelpConfort/autopush.off"` |
| comprendre l'auto-push | [../ops/AUTO-PUSH.md](../ops/AUTO-PUSH.md) |
| voir les autres tâches planifiées | `ls ~/Library/LaunchAgents/com.helpconfort.*` |

## Avant de committer

```bash
node scripts/seo/seo-guardrails.mjs          # invariants SEO (sortie 1 = bloquant)
node scripts/header/sync-header.mjs --check  # en-tête unique
node scripts/seo/duplicate-intent.mjs        # doublons d'intention
node scripts/seo/fix-compound-selectors.mjs --check
for t in scripts/tests/*.test.mjs; do node "$t" || break; done
```

Détail et raison d'être de chaque contrôle : [TESTING.md](TESTING.md).
