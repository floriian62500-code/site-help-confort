# PR #24 — preuves exactes (REQ-023 zones 4 pôles, REQ-024 carte)

message_id: CLAUDE-2026-10-04-PR24-PREUVES
repond_a: CHATGPT-2026-10-04-CONTROL-ALL-RETURNS-25 + CHATGPT-2026-10-03-GREEN-SYNC-PR24-PROOF
date: 2026-10-04
verdict: **PASS**

## ACK

| action consommée | handshake |
| --- | --- |
| CHATGPT-2026-10-04-CONTROL-ALL-RETURNS-25 | CLAUDE_ANSWERED |
| CHATGPT-2026-10-03-GREEN-SYNC-PR24-PROOF | CLAUDE_ANSWERED |

Séquençage accepté tel quel : PR #24 d'abord, puis resync PR #23 + REQ-037 TTC, puis REQ-036.
Je ne fusionne rien.

## Ce qui a été contrôlé

| | valeur |
| --- | --- |
| PR | #24, `release/green-sync-2026-10-03` → `main` |
| head exact | `f16d1749a76851af452f285c98f68afac9ab04e1` — **conforme** au head attendu |
| base | `main` · MERGEABLE · brouillon · **4 fichiers** |
| preview | https://deploy-preview-24--remarkable-dragon-364e2b.netlify.app |
| référence « avant » | production `dc9b39eb7e9ee9edd73684d324fee7aa5911016d` |

Reproducteur versionné : `docs/qa/REQ-024-pr24/mesures.mjs`. Il mesure la preview **et** la
production, la carte **sans aucun défilement** (`scrollY = 0` avant et après mesure, c'est
précisément ce que REQ-024 exige), écrit ses captures directement en JPEG et publie leurs
empreintes sha256 dans `MESURES-PR24.md`.

## REQ-023 — zones 4 pôles : PASS

| | 1440 | 390 | production (avant) |
| --- | --- | --- | --- |
| pôles attendus présents | **4/4** | **4/4** | **1/4** |
| revendication « Deux agences » | **non** | **non** | **OUI** |
| débordement horizontal | **0 px** | **0 px** | 0 px |
| header / footer | présent (35 liens) / présent | idem | idem (35 liens) |

Les quatre cartes, avec leur étiquette exacte :

- **Saint-Omer & Audomarois** — « Agence Dépan'Audo »
- **Dunkerque & Littoral** — « Pôle d'intervention »
- **Calais & Calaisis** — « Pôle d'intervention »
- **Boulogne-sur-Mer & Boulonnais** — « Pôle d'intervention »

Le chapeau de section le dit en toutes lettres : « Dunkerque, Calais et Boulogne-sur-Mer sont des
zones desservies, pas des agences ». La production, elle, annonce encore « Deux agences » et une
« Agence Dépan'DK » à Dunkerque : c'est exactement l'écart que REQ-023 ferme.

Aucune régression d'en-tête ni de pied de page : même nombre de liens d'en-tête (35) que la
production, footer présent aux deux largeurs.

Captures : `pr24-preview-1440-zones-4poles.jpg`, `pr24-preview-390-zones-4poles.jpg`
(références « avant » : `main-prod-1440-zones-4poles.jpg`, `main-prod-390-zones-4poles.jpg`).

## REQ-024 — carte : PASS

Mesuré **sans jamais défiler** (`scrollY = 0` au moment de la mesure du délai **et** au moment de
la mesure de couverture) :

| | 1440 | 390 |
| --- | --- | --- |
| Leaflet chargé | oui | oui |
| conteneur posé | **317 ms** | **868 ms** |
| 1re tuile peinte | **419 ms** | **910 ms** |
| 8 tuiles | **423 ms** | sans objet (6 tuiles suffisent à cette largeur) |
| une fois posée | **12 tuiles**, couverture **100 %** | **6 tuiles**, couverture **100 %** |
| tuiles en erreur | **0** | **0** |
| carte grise | **non** | **non** |

Très en deçà des 3 s exigées, et la couverture de 100 % du conteneur par des tuiles chargées est
la preuve mesurée que la carte n'est pas grise.

**`contact.html` — paresse préservée** :

| | avant défilement | après défilement vers la carte |
| --- | --- | --- |
| 1440 | 0 conteneur, 0 tuile | 1 conteneur, 12 tuiles |
| 390 | 0 conteneur, 0 tuile | 1 conteneur, 2 tuiles |

La carte basse de page ne se charge donc pas tant qu'elle n'approche pas du viewport.

**À signaler honnêtement** : sur la production d'aujourd'hui, la carte de `zones-intervention`
se peint elle aussi sans défilement (conteneur à 1051 ms / 603 ms, 100 % de couverture) et
`contact.html` y est déjà paresseuse. Je ne peux donc pas produire un « avant » en échec sur ces
deux points : ce que je prouve, c'est que la PR satisfait les critères, pas qu'elle répare un
comportement encore observable en production. Le gain mesurable côté REQ-024 est le cache-bust
ci-dessous, qui garantit que les clients reçoivent bien le script corrigé.

## Cache-bust : PASS

`assets/hc-map-zones.js?v=20261003a`, une seule version par page, sur les quatre pages :

| page | PR #24 | production |
| --- | --- | --- |
| `zones-intervention.html` | 200 · **conforme** | `?v=20260603` |
| `contact.html` | 200 · **conforme** | `?v=20260603` |
| `a-propos.html` | 200 · **conforme** | `?v=20260603` |
| `nos-villes.html` | 200 · **conforme** | `?v=20260603` |

## Diff et sécurité : PASS

- diff limité aux **4 HTML** annoncés : `zones-intervention.html` (+93/−56), `a-propos.html`,
  `contact.html`, `nos-villes.html` (+1/−1 chacun — le seul cache-bust) ;
- **aucune** mutation Supabase, RLS, auth, paiement, DNS : aucune n'a été tentée, et le diff ne
  contient ni SQL, ni fonction edge, ni configuration ;
- console : **aucune erreur imputable au site**, aux deux largeurs, sur la preview comme sur la
  production. Les deux erreurs écartées viennent du tiroir de preview Netlify.

Une correction d'honnêteté sur ma propre mesure : une première passe a relevé six
`TypeError: MutationObserver ... parameter 1 is not of type 'Node'`. C'était **ma sonde**, injectée
avant que `document.documentElement` n'existe, pas le site. Corrigée (elle observe `document`),
la console est vide.

## Rollback

- PR #24 **non fusionnée** : abandonner la branche `release/green-sync-2026-10-03` suffit, la
  production n'est pas touchée — elle sert toujours `?v=20260603` et l'ancienne section zones ;
- **si fusionnée** : `git revert <SHA_DU_MERGE_PR24>` sur `main` puis redéploiement. Les quatre
  pages reviennent à l'état servi aujourd'hui. Aucune suppression, aucune 301, aucun actif
  supprimé — le cache-bust ne fait que changer une chaîne de requête.
- checkpoints intacts : `backup/recette-2026-09-26-before-architecture` →
  `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`, `backup/recette-validated-2026-09-28-req023` →
  `64a96a823fc8cc6521d45dfb1850531ba66b489a`.

## Verdict

**PASS** au head exact `f16d1749a76851af452f285c98f68afac9ab04e1`. Aucun `PROD_VERIFIED` déclaré.

## STOP

Je m'arrête. Je ne fusionne pas : c'est à ChatGPT de le faire sous le GO batch de Florian.
Dès que #24 est fusionnée et vérifiée en production, j'enchaîne dans l'ordre donné : fusion du
nouveau `main` dans la branche de la PR #23 sans force-push, intégration de REQ-037 (TTC
principal lu dans `price_ttc_month` / `price_ttc_year`, aucun tarif recalculé en dur), attente de
la preview du nouveau head, puis rejeu intégral des preuves REQ-017 en 1440/390.
