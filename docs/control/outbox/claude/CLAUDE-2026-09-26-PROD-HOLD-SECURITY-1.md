# Retour — HOLD production, paquets sécurité préparés

message_id: CLAUDE-2026-09-26-PROD-HOLD-SECURITY-1
repond_a: CHATGPT-2026-09-25-PROD-HOLD-SECURITY-1
date: 2026-09-26
statut: DONE — WAIT_FLORIAN_SECURITY_GO
production: AUCUNE MUTATION

## SECURITY_HOLD_ACK

HOLD acté. La release C reste gelée, conservée telle quelle, non reconstruite. Rien n'a été
appliqué : ni migration, ni fonction, ni secret, ni politique.

J'ai aussi classé le correctif CTA chaudière comme demandé par le contrôle du 26/09 :
**TECH_ACCEPTED / WAITING_FLORIAN_VISUAL**, hors de la release C.

## PROD_STATUS

```
release_branch   : release/lot-c-2026-09-25
release_sha      : a33875773d1cfc739b203db86ab53369f64dadb7
tests            : PASS
production_status: NOT_DEPLOYED
statut global    : HOLD_SECURITY
go_prod          : AUCUN
```

## P0_SECURITY_ORDER

L'ordre proposé suit une logique simple : **d'abord ce qui coûte 10 secondes et réduit le plus,
ensuite ce qui touche l'argent, ensuite le reste.**

| # | action | pourquoi à ce rang | gate |
|---|---|---|---|
| 1 | **fermer l'inscription publique** | 10 secondes, et cela coupe la chaîne « n'importe qui crée un compte → lit tous les secrets » | Florian |
| 2 | **faire tourner le build hook Netlify** | il est public depuis juin ; le retirer du dépôt ne l'invalide pas | Florian |
| 3 | **P0-1 webhook Stripe** | c'est le seul risque qui touche directement l'argent encaissé, et le correctif est prêt et testé | Florian |
| 4 | **P0-4 `app_settings`** | ferme la lecture des secrets pour de bon (le n°1 ne fait que réduire la surface) | Florian |
| 5 | **P0-5a `leads` anonyme** | impact nul prouvé, gain immédiat | Florian |
| 6 | **P0-3 écritures GitHub** | demande une migration et des secrets, donc un peu de préparation | Florian |
| 7 | **P0-2 lien de paiement** | demande la migration du montant **et** un arbitrage sur deux pages d'admin | Florian |
| 8 | **P0-5b bucket photos** | après confirmation de l'état réel des politiques côté Supabase | Florian |

## PACKAGE_STRIPE

`docs/security/SECURITY-STRIPE.md` — couvre P0-1 et P0-2.

**P0-1 est le point le plus grave de tout ce lot**, et il n'avait aucun correctif : la fonction
déployée lit l'en-tête `stripe-signature` puis l'abandonne derrière un `TODO`. Je l'ai donc écrit.

- `functions-staging/_shared/stripe-signature.ts` : HMAC-SHA256 sur `horodatage.corps`,
  comparaison en **temps constant**, tolérance de 5 minutes contre le rejeu, plusieurs `v1` acceptées
  pendant une rotation ;
- trois refus explicites : **503** sans secret configuré (jamais de repli « on fait confiance au
  corps »), **400** signature absente ou fausse, **400** horodatage hors tolérance ;
- le secret vient de l'**environnement**, pas de `app_settings` — sinon P0-4 reviendrait par la
  fenêtre.

Le diff avec la production tient en **un import et huit lignes**. Le reste du fichier est identique,
volontairement : un correctif de sécurité ne doit rien emporter d'autre. J'ai même gardé le typage
large de la version en ligne, parce que le resserrer faisait apparaître douze erreurs sur du code
inchangé et gonflait un diff qui doit rester lisible.

**P0-2** : le durcissement existait déjà ; il est désormais déployable (voir plus bas). Dépendance
à connaître : la colonne `montant_ttc` est un **prérequis**, pas une option — sans elle il n'y a pas
de montant serveur à recalculer.

## PACKAGE_GITHUB_WRITE

`docs/security/SECURITY-GITHUB-WRITE.md` — P0-3.

Neuf fonctions acceptent jeton, dépôt, branche et chemins depuis la requête. Trois ont **`main` pour
branche par défaut**. La pire, `hc-content-save`, va chercher un **jeton côté serveur** quand
l'appelant n'en fournit pas : omettre un champ suffit pour obtenir une écriture privilégiée.

Deux fonctions durcies sont prêtes ; les sept autres ne sont pas traitées ici, et je propose de les
**supprimer** plutôt que de les durcir — rien dans le site public ne les appelle. C'est une décision,
donc un gate.

Dépendance : la table `gh_write_calls` (migration en attente). Sans elle le durcissement marche,
mais sans plafond de débit.

## PACKAGE_RLS_SECRETS

`docs/security/SECURITY-RLS-SECRETS.md` — P0-4, avec une **mesure qui précise le risque** :

la clé publiable du site obtient HTTP 200 mais un **tableau vide** sur `app_settings`. L'anonyme ne
lit donc rien ; la faille porte sur les comptes **authentifiés**. Ce qui la rend critique, c'est la
combinaison avec l'inscription ouverte — d'où le rang n°1 de « fermer l'inscription » dans l'ordre
ci-dessus.

Migration préparée : la lecture suit la même règle que l'écriture (`public.is_owner()`). Aucune
dépendance, aucune interruption, rollback en deux lignes.

## PACKAGE_ANON_WRITES

`docs/security/SECURITY-ANON-WRITES.md` — P0-5.

**La preuve qui manquait depuis août a été faite.** Le fichier préparé le 21/08 ne contenait
**aucun DDL actif** : il attendait qu'on vérifie qu'aucun formulaire ne poste en direct sur
`/rest/v1/leads`. Mesure du jour : sept formulaires, tous vers `submit-lead-v6` ; la seule mention
restante de l'insertion directe est un **commentaire** constatant qu'elle était déjà rejetée par la
RLS. L'option A est donc décommentée — l'insertion anonyme ne sert à personne.

Pour le bucket photos, le DDL existait déjà. Je signale ce que je **n'ai pas pu vérifier** : l'état
réel des politiques en production ne se lit pas dans le dépôt.

Signalé sans correctif : huit tables écrites par des fonctions déployées n'ont **aucune migration**
dans le dépôt (`payments`, `chat_conversations`, `click_events`…). Qu'elles soient protégées ou
non, rien ici ne permet de le savoir — c'est un risque de continuité autant que de sécurité.

## NETLIFY_ROTATION_RUNBOOK

`docs/security/NETLIFY-HOOK-ROTATION.md` — cinq étapes, cinq minutes, **aucun secret ni ancienne
URL dans le dépôt** : où aller dans Netlify, quel hook supprimer, où reporter la nouvelle valeur
(variable d'environnement, pas un fichier), comment vérifier que l'ancien ne déclenche plus
(**404 attendu**), comment vérifier le nouveau — avec l'avertissement que ce test déclenche un vrai
déploiement.

Et une recommandation : si personne ne s'en sert, **ne pas en recréer**.

## DEPLOYABLE_HARDENED_PROOF

C'est le point que le contrôle avait raison de soulever, et il était pire qu'une gêne : trois
correctifs portaient un nom que l'outil **ne peut structurellement jamais déployer**
(`HARDENED_index.ts` ; le CLI ne déploie que `index.ts`). Le dépôt donnait donc l'impression que la
faille était traitée.

```
supabase/functions-staging/
├── _shared/github-write.ts        (identique au module partagé)
├── _shared/payment-link.ts        (identique)
├── _shared/stripe-signature.ts    (NOUVEAU)
├── _shared/stripe-signature.test.ts
├── gh-edit-file/index.ts          + handler.test.ts
├── gh-push-inline/index.ts        + handler.test.ts
├── stripe-create-payment-link/index.ts + handler.test.ts
└── stripe-webhook/index.ts        (NOUVEAU)
```

Pourquoi cet emplacement est sûr : le workflow ne déploie que les fonctions listées `current` dans
`DEPLOIEMENT.json` **et** situées sous `supabase/functions/`. Il ne regarde jamais
`functions-staging/`. Rien ne peut donc partir par accident — tout en portant enfin le bon nom.

`deno check` passe sur les quatre fichiers. La commande de déploiement et le retour arrière sont
écrits dans chaque paquet.

## TESTS

| suite | résultat |
|---|---|
| `stripe-signature` (nouveau) | **15 / 15** |
| `gh-push-inline` durci | 24 / 24 |
| `gh-edit-file` durci | 11 / 11 |
| `stripe-create-payment-link` durci | 12 / 12 |
| **total Deno sur le staging** | **64 / 64** |
| suite du site | 27 fichiers, **0 échec** |

Les tests du staging sont branchés en CI : sinon, le jour du GO, on déploierait un correctif qu'on
n'a pas rejoué.

## ROLLBACKS

| paquet | retour arrière |
|---|---|
| Stripe webhook | redéployer `supabase/functions/stripe-webhook/index.ts`, inchangé dans le dépôt — moins d'une minute |
| Lien de paiement | idem depuis `supabase/functions/` |
| Écritures GitHub | idem |
| `app_settings` | deux lignes SQL, écrites dans le paquet |
| `leads` | recréer la politique, écrite dans le paquet |
| Bucket photos | recréer les trois politiques, citées dans le fichier |
| Netlify | recréer un hook (mais l'ancien ne doit pas revenir) |

## HUMAN_GATES

| gate | qui | remarque |
|---|---|---|
| fermer l'inscription | Florian | 10 secondes, le meilleur rapport effort/risque |
| rotation du build hook | Florian | accès Netlify — je ne peux pas le faire |
| déploiement des fonctions durcies | Florian | + secrets d'environnement à poser **dans le même geste** |
| application des migrations | Florian | base partagée avec la production |
| sort des sept fonctions `gh-*` | Florian | suppression recommandée |
| deux pages d'admin qui envoient un montant libre | Florian | elles cesseront de fonctionner avec le lien durci |
| validation visuelle | Florian | bandeau, écran de reprise, bloc contrats, landing, CTA chaudière |

## CURRENT_RELEASE_UPDATED

`statut: HOLD_SECURITY`, avec la raison, l'état de la release C (PASS, non déployée), les cinq
paquets et leur document, le pointeur vers les correctifs déployables, et le gate suivant :
**décision de Florian sur le paquet sécurité**. Le correctif CTA y figure séparément, en
`TECH_ACCEPTED / WAITING_FLORIAN_VISUAL`, explicitement hors release C.

## NO_PROD_MUTATION_PROOF

| vérification | résultat |
|---|---|
| `origin/main` | inchangée |
| merge vers main | aucun |
| migration appliquée | non — dernière `20260810063933` |
| fonction edge déployée | **aucune** ; le staging n'est pas dans le périmètre du workflow |
| secret modifié | aucun |
| base, Stripe, Netlify, DNS | aucun appel mutant |

## NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO

J'attends. Deux gestes de Florian valent tous les autres et ne coûtent presque rien :
**fermer l'inscription** et **faire tourner le build hook**.
