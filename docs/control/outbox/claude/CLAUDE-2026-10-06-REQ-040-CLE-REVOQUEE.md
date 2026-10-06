# REQ-20260926-040 — ce n'était pas un problème de droits : la clé était révoquée

message_id: CLAUDE-2026-10-06-REQ-040-CLE-REVOQUEE
repond_a: GO audit en lecture seule de Florian
date: 2026-10-06
verdict: **PASS** — et deux constats plus larges que la demande

## L'audit autorisé, et ce qu'il a trouvé

Je n'ai **pas** touché à la base : l'audit s'est fait entièrement par appels HTTP, en lecture.

| endpoint | clé anon historique | clé publiable |
| --- | --- | --- |
| `rest/v1/stats_publiques` | **401** « Invalid API key » | **200**, avec les données |
| `rest/v1/newsletter_subscribers` | **401** | **200** |
| `auth/v1/settings` | **401** | **200** |

La vue `stats_publiques` est donc **parfaitement lisible**. Aucune RLS à ouvrir, aucun droit à
changer. Ce qui échouait, c'est la clé : `assets/hc-live-stats.js` utilisait encore l'ancienne
clé anon, que Supabase refuse désormais.

Conséquence invisible mais réelle : la page tombait **toujours** sur les valeurs de repli écrites
en dur dans le script, en journalisant `[hc-stats] fallback values Error: http 401` à chaque
visite.

## Le lot

| | valeur |
| --- | --- |
| branche | `feat/req-040-cle-publiable-stats`, depuis le `main` courant |
| PR | **#30**, brouillon |
| head | `3cc281bb2900f5875cdcd8c36abfdb60697c59e3` |
| périmètre | **1 fichier**, `assets/hc-live-stats.js` — une chaîne de caractères |

| | avant (production) | après (PR #30) |
| --- | --- | --- |
| appel `stats_publiques` | **401** | **200** ✅ |
| console | `401` + `[hc-stats] fallback values Error: http 401` | **aucune erreur imputable au site** ✅ |

Aucune mutation Supabase, aucune RLS, aucune donnée écrite.

## Premier constat plus large : six autres fichiers portent la même clé révoquée

`assets/hc-chat-widget.js`, `assets/hc-newsletter.js`, `assets/hc-reserve-modal.js`,
`espace-client.html`, `espace-client-dashboard.html`, `index.html`.

Ils n'appellent rien au chargement — c'est pourquoi aucune erreur ne se voit — mais ils appellent
**à l'usage** : inscription à la newsletter, chat, espace client, réservation. Avec une clé que le
serveur refuse, **ces parcours échouent pour le visiteur qui les emprunte**. L'inscription
newsletter et la connexion à l'espace client sont prouvées cassées par le tableau ci-dessus
(`401` sur `rest/v1` et sur `auth/v1`).

**Je n'y touche pas, et voici pourquoi c'est important :** `index.html` et `hc-reserve-modal.js`
appellent `functions/v1/stripe-create-payment-link` avec un **montant fourni par le client**.
La clé révoquée est aujourd'hui **ce qui empêche cet appel d'aboutir**. Remettre la clé
là-bas rouvrirait ce chemin de paiement. C'est exactement le sujet de REQ-001, sous gate.

**Décision demandée**, et elle se découpe en deux :
1. **newsletter, chat, espace client** — parcours cassés, correctif identique et sans paiement :
   je peux le faire dès votre accord ;
2. **réservation / lien de paiement** — à ne pas rétablir sans trancher REQ-001 d'abord.

## Second constat : la page dont on parle n'affiche aucune statistique

`hc-live-stats.js` est chargé sur `/a-propos.html` et sur l'accueil, mais la section qu'il
remplit — `.hc-stats-live` — **n'existe sur aucune page**. Le script récupère donc des données que
personne n'affiche. Le correctif ci-dessus supprime une vraie erreur, mais le script reste du
poids mort : à câbler ou à retirer, au choix.

## Troisième constat, et celui-là est factuel : « 2 agences » subsiste sur 12 pages

Sur `/a-propos.html` et `/contact.html`, un bloc annonce « **2 Agences locales** ». C'est
exactement l'affirmation que REQ-023 a corrigée sur la page Zones, où le texte dit désormais que
Dunkerque, Calais et Boulogne sont des **pôles d'intervention, pas des agences** — « on ne promet
pas une implantation qui n'existe pas ».

**12 pages de production** portent encore cette affirmation : `a-propos`, `contact` (via le même
bloc), `chauffagiste-saint-omer`, `electricien-saint-omer`, `menuisier-saint-omer`,
`nos-villes`, `notre-equipe`, `plombier-saint-omer`, `reseau-help-confort`,
`serrurier-saint-omer`, `travaux-saint-omer`, `vitrier-saint-omer`.

Le site se contredit donc d'une page à l'autre. Je l'inscris en **REQ-20260926-041**. Le correctif
est simple, mais **la formulation vous appartient** : je ne réécris pas un argument commercial
sans votre mot.

## STOP

Je ne fusionne pas la PR #30. Rien d'autre n'a été modifié, et la base n'a pas été touchée.
