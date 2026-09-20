# Quand ça casse — pièges connus

> Les incidents d'exploitation (panne formulaire, Supabase, Stripe, rollback) sont dans
> [INCIDENT-RUNBOOK.md](INCIDENT-RUNBOOK.md). Ici : les pièges **du projet**, ceux qui ont déjà fait
> perdre du temps. Mise à jour : 2026-09-20.

## « J'ai poussé, mais rien ne change en ligne »

1. **Le build a été annulé.** La règle `ignore` de `netlify.toml` saute le build quand le diff ne
   contient que des fichiers non publiés. Sans cache, Netlify donne la même valeur à
   `$CACHED_COMMIT_REF` et `$COMMIT_REF` → diff vide → build annulé à tort. Garde en place depuis le
   18/09 ; vérifier l'état du déploiement, pas seulement un code 200.
2. **Le cache immuable.** Un fichier de `assets/` est figé un an côté navigateur : sans changement de
   `?v=`, personne ne voit la nouvelle version.
3. **Le démon a poussé autre chose.** `tail ~/Library/Application\ Support/HelpConfort/autopush.log`.

## « Le style de la page est parti »

Une ancienne minification a transformé les sélecteurs descendants `.a .b` en `.a.b` : les règles ne
s'appliquent plus à rien (boutons en texte brut, cartes sans style). 1 901 cas corrigés le 20/09.

```bash
node scripts/seo/fix-compound-selectors.mjs --check   # détecte
node scripts/seo/fix-compound-selectors.mjs           # corrige (avec preuve)
```

Même famille : `transition:all.3s` au lieu de `all .3s` — la transition ne s'applique pas.

## « La moitié de la page est passée dans le body »

Une balise `<meta>` ou `<link>` mal refermée (`…">>`) ferme le `<head>` : tout ce qui suit (canonical,
Open Graph, données structurées) bascule dans le `<body>` et n'est plus pris en compte. Vu le 20/09.
`node scripts/seo/seo-guardrails.mjs` le détecte (`HEAD_MALFORMED`).

## « Le bouton ne répond pas sur mobile »

Le bandeau de consentement est fixé en bas de l'écran : au premier passage, il peut recouvrir le
bouton principal. Vérifier avec `document.elementFromPoint(x, y)` — si la réponse n'est pas le bouton,
il est recouvert. Corrigé sur les 35 pages du gabarit premium (héros compacté sous 480 px).

## « Le clic sur une carte ne fait rien »

Une carte qui pointe vers une fiche **non générée** retombe sur la liste : la page se recharge, donc
« rien » ne se passe. Une carte ne doit pointer que vers une fiche présente dans
`realisations/index.json`. Ne jamais fabriquer une destination qui n'existe pas.

## « Le formulaire renvoie une erreur / ne crée rien »

`submit-lead-v6` applique un contrat par `form_type` et répond **champ par champ**.
Voir le tableau dans [LEADS-AND-NOTIFICATIONS.md](LEADS-AND-NOTIFICATIONS.md) et la méthode de
vérification sans créer de lead dans [TESTING.md](TESTING.md).

## « Le catalogue renvoie 400 »

Ne pas ajouter de paramètre anti-cache (`_ts=…`) à une requête PostgREST : il est interprété comme un
filtre sur une colonne inexistante. Utiliser l'en-tête `Cache-Control: no-store`.

## « Les liens perdent leur .html »

Netlify sert des « pretty URLs » : `/prestations/ramonage.html` devient `/prestations/ramonage` dans
le HTML servi. Normal. En tenir compte quand on compare des liens sur la preview.

## « Le déploiement du sitemap ne change rien »

Le sitemap est une **fonction edge** : modifier `supabase/functions/sitemap/index.ts` ne suffit pas,
il faut la déployer — décision humaine ([DEPLOYMENT.md](DEPLOYMENT.md)).

## Sécurité — points ouverts (décision humaine)

| Point | Risque | Où |
|---|---|---|
| `stripe-create-payment-link` publique, montant client, clé de production | création de liens de paiement réels par un tiers | [PAYMENTS.md](PAYMENTS.md) |
| `gh-push-inline` / `gh-edit-file` publiques | relais d'écriture GitHub ouvert (jeton fourni par l'appelant) | `supabase/functions/gh-push-inline/index.ts` |
| PAT GitHub lu dans le `localStorage` par `assets/hc-edit-mode.js` | un XSS donnerait un accès en écriture au dépôt | asset **chargé par aucune page** aujourd'hui |
| policy `leads_public_insert` | insertion anonyme directe dans `leads` (contourne la validation) | migration de durcissement proposée, non appliquée |

## Vérifier dans un navigateur sans se tromper

- Le volet de prévisualisation masqué **ne repeint pas** après un défilement : une capture prise après
  scroll est blanche. Utiliser une fenêtre haute (ex. 1440 × 2600) ou mesurer en JavaScript.
- Les animations et `scroll-behavior: smooth` sont gelés quand le volet est masqué : pour tester une
  ancre, passer `scrollBehavior = 'auto'`.
- L'émulation de taille est réinitialisée à la navigation : redimensionner **dans le même lot**.
