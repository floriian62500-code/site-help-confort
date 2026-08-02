# Plan de rollback — mise en prod Lot 1/2 + correctifs leads (2026-08-02)

Objectif : pouvoir revenir à l'état stable en < 2 min si une anomalie apparaît en prod.

## Points de restauration disponibles

| Cible | État "avant" (rollback vers) | Comment revenir |
|---|---|---|
| **Site statique (Netlify)** | Deploy prod actuel = build de `origin/main` (inchangé) | Netlify → Deploys → sélectionner le dernier deploy "published" connu bon → **Publish deploy** (rollback instantané, pas de rebuild) |
| **Branche Git** | `safety/pre-staging-2026-08-02` (= `910bfd49`, état local avant intégration) | `git reset --hard safety/pre-staging-2026-08-02` sur la branche d'intégration si besoin |
| **Prod Git** | `origin/main` **jamais modifié** pendant la recette | rien à faire, la prod n'a pas bougé |
| **Edge `submit-lead`** | **v4** (actuellement LIVE) | voir ci-dessous |

## Rollback du site (Netlify) — cas le plus probable

1. Netlify → site `remarkable-dragon-364e2b` → onglet **Deploys**.
2. Repérer le deploy prod stable **précédant** la mise en ligne Lot 1/2.
3. **Publish deploy** dessus → prod restaurée en ~10 s (le CDN repointe sur l'ancien build).
4. Aucune perte de données (déploiement = fichiers statiques uniquement).

## Rollback `submit-lead` v5 → v4

- v4 reste la version LIVE tant que v5 n'est pas déployée : **ne rien déployer = pas de risque**.
- **Avant** de déployer v5, snapshot v4 : `get_edge_function(submit-lead)` (MCP Supabase) → sauvegarder le contenu dans `supabase/functions/submit-lead/index.v4-live.ts`.
- Pour revenir à v4 : redéployer ce snapshot (Supabase CLI `supabase functions deploy submit-lead` ou MCP `deploy_edge_function`).
- v4 = validation stricte (adresse+cp+ville+message≥20). v5 = validation assouplie (nom|prénom + tel|email + message).

## Daemon auto-push

- Reste **désactivé** (`launchctl bootout com.helpconfort.autopush`) jusqu'à validation prod.
- Réactivation (après refonte) : `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.helpconfort.autopush.plist`.

## Critères de déclenchement d'un rollback

- Erreur JS bloquante sur homepage / pages métiers / contact.
- Formulaire de lead qui ne s'envoie plus (régression capture).
- Chute brutale des conversions GA4 (`click_phone`, `form_submit`) sur 24 h.
- Erreur 5xx récurrente sur une Edge Function critique (`submit-lead`, `notify-lead`).
