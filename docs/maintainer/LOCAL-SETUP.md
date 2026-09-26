# Faire tourner le site en local

> Mise à jour : 2026-09-20. Aucun build : c'est du HTML/CSS/JS statique.

## Le minimum

```bash
cd "<dépôt>"
python3 -m http.server 8765      # puis http://localhost:8765/
```

C'est suffisant pour 95 % du travail : pages, styles, scripts, tunnel de demande, formulaires
(qui, eux, parlent à la **vraie** Supabase — voir l'avertissement plus bas).

**Ne pas ouvrir les fichiers en `file://`** : les `fetch` (catalogue, réalisations, manifeste) et les
chemins absolus `/assets/…` ne fonctionnent qu'avec un serveur HTTP.

## Ce qui marche en local, ce qui ne marche pas

| | En local | Pourquoi |
|---|---|---|
| Pages, styles, scripts, tunnel | ✅ | statique |
| Catalogue, avis, réalisations | ✅ | appels directs à Supabase (clé publique) |
| Formulaires | ⚠️ **ils créent de vrais leads** | `submit-lead-v6` est la fonction de production |
| Mesure d'audience GA4 | ❌ volontairement | `hcGtag` n'existe qu'en production **et** après consentement ; en local tout est consigné dans `window.__hcFunnel` |
| Redirections `_redirects`, en-têtes `netlify.toml` | ❌ | c'est Netlify qui les applique : vérifier sur la preview |
| URLs sans `.html` | ❌ | « pretty URLs » de Netlify uniquement |
| Sitemap | ❌ | fonction edge |

> **Règle absolue** : on ne soumet jamais un formulaire « pour voir ». Pour vérifier un contrat serveur,
> envoyer un payload volontairement invalide : la réponse 400 prouve le contrat **sans rien créer**
> (exemple dans [TESTING.md](TESTING.md)).

## Vérifier le rendu comme un visiteur

Le plus fiable reste la **preview Netlify de la branche `recette`** :
`https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/`
Elle applique les redirections, les en-têtes, les URLs propres et le cache réels.

## Base de données en local (optionnel)

Pour un test d'intégration sans toucher à la production :

```bash
supabase start            # stack locale Docker (Colima sur ce Mac)
supabase db reset         # applique supabase/migrations/ sur la base locale
```

- Ne **jamais** lancer `supabase db push` sans décision explicite : cela écrit sur la **production**.
- Ne pas délier le projet (`supabase link`) : les scripts s'appuient dessus.
- Les tests d'intégration utilisés jusqu'ici tournent dans une transaction annulée à la fin
  (aucune donnée laissée derrière).

## Outils attendus

| Outil | Pour quoi | Remarque |
|---|---|---|
| `node` ≥ 18 | tous les contrôles `scripts/*.mjs` | aucun `npm install` : pas de dépendance |
| `python3` | scripts historiques `scripts/*.py`, serveur local | — |
| `gh` (GitHub CLI) | pousser sans jeton stocké | `gh auth status` |
| `supabase` CLI | base locale, déploiement de fonctions | déploiement = décision humaine |
| `rsync` | copie de travail pour les vérifications navigateur | — |

## Dépôt et branches

- `recette` : la branche de travail. Tout part de là.
- `integration/lot1-lot2-vs-prod` : miroir de `recette`, poussé en parallèle.
- `main` : **production**. On n'y touche pas sans décision explicite.

Un démon local committe et pousse `recette` automatiquement : [../ops/AUTO-PUSH.md](../ops/AUTO-PUSH.md).
Pendant un gros chantier, le mettre en pause pour garder des commits atomiques :

```bash
touch "$HOME/Library/Application Support/HelpConfort/autopush.off"   # pause
rm    "$HOME/Library/Application Support/HelpConfort/autopush.off"   # reprise
```
