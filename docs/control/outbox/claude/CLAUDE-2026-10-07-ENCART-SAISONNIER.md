# Base propre vérifiée · première évolution visible : l'encart saisonnier

message_id: CLAUDE-2026-10-07-ENCART-SAISONNIER
repond_a: ordre Florian du 2026-10-06 (évolutions visibles, une par une, depuis le main courant)
date: 2026-10-07
verdict: **base conforme** · **PR #38 prête, elle n'attend que votre œil**

## 1. La base, vérifiée de mon côté

| contrôle | résultat |
| --- | --- |
| `main` et `recette` | **même commit** `1c54c89d` · arbres identiques · **0 fichier de différence** · écart 0/0 |
| garde de build sur `main` | `CACHED_COMMIT_REF` présent |
| canonique servi en production | `https://depan59-62.fr/a-propos.html` — **le domaine nu** |
| plan de site servi | **0 URL en `www.`**, 190 en domaine nu |
| plan de contrôle sur `main` | `docs/control` 342 · `docs/qa` 254 · `scripts/tests` 33 |

Tout concorde. Je ne reviens plus sur le nettoyage technique.

## 2. L'encart saisonnier — PR #38

Reconstruit **depuis le `main` courant**, pas repris de l'ancienne recette.

| | valeur |
| --- | --- |
| branche | `feat/encart-saisonnier` |
| head | `75e52e02ab6dc4e68065ded7f387d44955848445` |
| périmètre | **198 pages** + 2 fichiers d'assets |
| preview | https://deploy-preview-38--remarkable-dragon-364e2b.netlify.app |

### Les trois décisions déjà prises, vérifiées sur la preview

| | 1440 | 390 |
| --- | --- | --- |
| aucun bouton de fermeture | **0** | **0** |
| s'affiche sans défilement | oui, `scrollY 0` | oui |
| présent et dans l'écran | oui | oui |
| **ne recouvre pas la barre d'action collante** | oui | **oui** |
| bandeau cookies pendant la mesure | absent | absent |

La source est unique : `assets/hc-promo-saison.{js,css}`, versionnés par empreinte. Rien n'est
recopié dans les pages — deux balises, et c'est tout. Seule `reset.html` reste dehors, page
technique en `noindex`.

### Ce que la planche montre, et ce qu'elle ne montre pas

La planche jointe (`docs/qa/ENCART-pr38/PLANCHE-encart.png`) montre l'accueil et la page
Chauffage, en 1440 et en 390, consentement refusé. **Le widget « Modifs » visible sur la preview
en est retiré : il n'existe pas en production** — je l'ai vérifié, il ne s'affiche que sur les
previews.

Une chose que je veux que vous regardiez plutôt que de la lire : **en desktop, l'encart se pose
par-dessus le contenu**, en bas à gauche. Sur l'accueil il masque une partie du bouton « Décrire
mon besoin », sur la page Chauffage une partie du visuel. C'est le principe même d'un encart
flottant — mais c'est votre appel, pas le mien.

En mobile il se réduit à une barre compacte en bas, au-dessus de la barre d'appel.

## 3. Ce que j'attends

Votre **oui** ou **non** sur la planche. Si c'est oui, vous fusionnez et je fais le contrôle
public. Si quelque chose vous gêne — la position, la taille, le fait qu'il couvre un bouton — je
le reprends avant.

Les quatre évolutions suivantes attendent leur tour : widgets de contenu, pages éditoriales,
en-tête unifié, tunnel de demande. Je prendrai la plus petite d'abord, sauf indication contraire.
