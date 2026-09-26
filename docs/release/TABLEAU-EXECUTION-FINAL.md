# Tableau d'exécution — ce qui reste, et qui ne dépend plus de moi

> Demandé par 5812637851 §5. Tous les chantiers techniques sont fermés. Ce qui suit n'attend qu'une
> décision, un accès ou un déploiement. **Une action Florian par ligne.**
>
> Les actions sensibles Supabase restent dans le dossier privé remis à Florian : le dépôt est public.

---

## P0 — Sécurité (à faire en premier)

### 1. Supabase — fermer l'accès aux données

| | |
|---|---|
| **Risque** | **Élevé.** Toute personne qui s'inscrit peut lire et modifier les demandes, paiements, interventions et commandes. Données personnelles de clients. |
| **Action Florian** | Le **paquet privé de trois lignes** (`A-FAIRE-3-LIGNES.md`, dossier hors dépôt) : fermer l'inscription — **10 secondes** — puis appliquer la migration fournie. |
| **Action Claude après GO** | Remettre la migration, son retour arrière et son test dans le dépôt (ils y ont leur place une fois la faille close) et compléter le retour public. |
| **Test de succès** | La requête de contrôle du paquet privé ne renvoie plus aucune politique sans condition ; back-office et espace client fonctionnent comme avant. |
| **Rollback** | Le fichier `.ROLLBACK.sql` du dossier privé rétablit les 15 politiques d'origine. Testé en base jetable (22 contrôles). |

### 2. Stripe — couper ou durcir le lien de paiement

| | |
|---|---|
| **Risque** | **Élevé.** La version en ligne accepte le montant envoyé par l'appelant et ne vérifie pas qui appelle. |
| **Action Florian** | Choisir : **couper** l'endpoint (suffit si le paiement en ligne n'est pas utilisé), **ou** donner le GO pour déployer la version durcie **en TEST d'abord**. |
| **Action Claude après GO** | Appliquer `docs/deploy/STRIPE-PAQUET-2026-09-24.md` : archiver la version en ligne, migration du montant, variables TEST, déploiement avec `verify_jwt`. **Aucun passage LIVE.** |
| **Test de succès** | Les six contrôles du paquet : 401 anonyme, 403 client, montant de la requête ignoré, 404/409/422, idempotence, `livemode: false`. |
| **Rollback** | Redéployer le dossier archivé. Effet immédiat. La migration a son propre retour arrière. |

### 3. Ancien jeton GitHub — le révoquer

| | |
|---|---|
| **Risque** | **Moyen.** Le jeton n'était pas publié (il vivait dans le `.git/config` local, retiré le 23/09) et il est probablement déjà invalide. Mais un jeton non révoqué reste un jeton. |
| **Action Florian** | GitHub → Settings → Developer settings → Personal access tokens → révoquer l'ancien jeton du dépôt. |
| **Action Claude après GO** | Rien. L'authentification passe par `gh` depuis le 23/09, vérifiée. |
| **Test de succès** | `git ls-remote origin` fonctionne toujours (il passe par `gh`, pas par le jeton révoqué). |
| **Rollback** | Sans objet : révoquer ne casse rien. En cas de doute, `gh auth login` régénère un accès. |

---

## P1 — Mise en production contrôlée

### 4. Sitemap — une seule source

| | |
|---|---|
| **Risque** | **Faible techniquement, réel en référencement.** La production sert un fichier figé au 11/06 qui pointe un hôte redirigé ; les réalisations publiées depuis juin n'y sont pas. |
| **Action Florian** | GO pour : déployer la fonction `sitemap` **et** fusionner `recette` → `main` (c'est la fusion qui retire le fichier statique). ⚠️ Cette fusion emporte **tout** le travail de recette : c'est une décision à part entière. |
| **Action Claude après GO** | `docs/deploy/SITEMAP-PAQUET-2026-09-23.md` : relever l'état, déployer, fusionner, contrôler, resoumettre à Search Console. |
| **Test de succès** | 0 URL en `www`, ≥ 147 URL, `/prestations/ramonage` présent, 0 URL `/actualites/2026`. |
| **Rollback** | Remettre le fichier statique sur `main` : tant que la règle est en `200` sans `!`, il reprend la main immédiatement. |

### 5. Build hook Netlify de production

| | |
|---|---|
| **Risque** | **Moyen.** Son identifiant est public dans le dépôt depuis juin : n'importe qui peut déclencher un build de production. |
| **Action Florian** | Netlify → Site settings → Build & deploy → Build hooks → **supprimer et recréer**. |
| **Action Claude après GO** | Retirer l'identifiant du dépôt et adapter ce qui l'appelait. |
| **Test de succès** | L'ancien identifiant renvoie une erreur ; le nouveau déclenche bien un build. |
| **Rollback** | Sans objet : on peut recréer un hook à volonté. |

### 6. `notify-lead-v6` — déployer l'email de rappel

| | |
|---|---|
| **Risque** | **Faible.** Le lead s'enregistre déjà ; seul l'email de notification reste générique. Aucune perte. |
| **Action Florian** | GO déploiement de la fonction. |
| **Action Claude après GO** | Déployer, puis un test réel marqué `NE PAS TRAITER`, archivé ensuite. |
| **Test de succès** | L'email reçu porte le bon type de demande et les bons champs. |
| **Rollback** | Redéployer la version précédente ; l'enregistrement du lead n'en dépend pas. |

### 7. `create-payment-session` — déployer ou renoncer

| | |
|---|---|
| **Risque** | **Faible aujourd'hui** : la fonction n'existe pas en production, le tunnel masque proprement le bloc « Payer en ligne ». Le client ne voit aucune erreur — il ne voit simplement pas le paiement en ligne. |
| **Action Florian** | Décider : déployer (le paiement en ligne existe alors dans le tunnel), ou renoncer et retirer l'appel. |
| **Action Claude après GO** | Les 7 prérequis de `docs/deploy/EDGE-FUNCTIONS.md` §2 : Stripe TEST, montant serveur, même dossier, idempotence, vérification rejouable, retour arrière, parcours complet en TEST. |
| **Test de succès** | Un parcours complet en TEST du panier au retour de paiement, sans aucun paiement réel créé. |
| **Rollback** | Repasser la fonction en `pending` : le site sait déjà se passer d'elle. |

### 8. Fonctions d'écriture GitHub en quarantaine

| | |
|---|---|
| **Risque** | **Moyen.** Sept fonctions déployées savent écrire dans le dépôt ; cinq n'ont aucun appelant connu. Elles exigent un jeton, donc pas exploitables seules — mais ce sont des relais ouverts. |
| **Action Florian** | Trancher : **supprimer** les 5 sans appelant, **ou** **durcir** celles qui restent. Le tableau de décision est dans `docs/security/DECISION-FONCTIONS-GITHUB-2026-09-23.md`. |
| **Action Claude après GO** | Suppression une par une avec contrôle après chacune, **ou** déploiement du patch durci (35 tests Deno déjà au vert) + migration du journal d'audit. |
| **Test de succès** | Suppression : le site et l'administration répondent normalement. Durcissement : anonyme → 401, jeton dans la requête → 403, `main` → 403, chemin `.github/…` → 403, 21ᵉ appel → 429. |
| **Rollback** | Redéployer la version relevée avant l'opération (relevé fait à l'étape 1 dans les deux cas). |

---

## P2 — Produit et affichage

### 9. Quatre décisions d'affichage

| | |
|---|---|
| **Risque** | **Nul.** Aucune ne touche au fonctionnement. |
| **Action Florian** | Répondre oui/non à quatre questions : bandeau de confiance sur 26 pages métier · newsletter et « Nos outils » sur À propos · reformuler des délais · CMS WYSIWYG (le câbler ou le retirer). Détail : `docs/produit/DECISIONS-AFFICHAGE-2026-09-23.md`. |
| **Action Claude après GO** | Appliquer, une décision par commit. |
| **Test de succès** | Rendu vérifié en 1440 et 390 sur la preview, suite de tests verte. |
| **Rollback** | `git revert` du commit concerné. |

### 10. « Sous 2 h en journée ouvrée »

| | |
|---|---|
| **Risque** | **Réel mais commercial**, pas technique : c'est l'engagement le plus fort du site, et il est public. |
| **Action Florian** | Dire si ce délai est tenu. Si non, dire par quoi le remplacer. Même question, moins urgente, pour « Sous 48 h » (4 pages) et « sous 24 h ouvrées » (2 pages). |
| **Action Claude après GO** | Reformuler les pages désignées. |
| **Test de succès** | Le test des prix publics reste vert ; aucun autre engagement chiffré n'apparaît ailleurs. |
| **Rollback** | `git revert`. |

### 11. Validation visuelle du bandeau d'accueil

| | |
|---|---|
| **Risque** | **Nul.** |
| **Action Florian** | Ouvrir la preview et dire si le rendu convient : `HOME_PROMO_VISUAL_APPROVAL` est en attente depuis le 23/09. |
| **Action Claude après GO** | Rien si c'est validé ; ajuster si tu demandes des changements. **Aucune refonte entre-temps.** |
| **Test de succès** | Ton accord. |
| **Rollback** | `git revert` du commit du bandeau. |

### 12. Identité de l'entreprise (prérequis du `@id` unique)

| | |
|---|---|
| **Risque** | **Nul tant qu'on ne bouge pas.** Aujourd'hui le site déclare 6 noms, 20 URL, 2 emails et 2 logos pour un seul établissement : les signaux ne se consolident pas. |
| **Action Florian** | Remplir les **sept lignes** de `docs/seo/IDENTITE-ENTREPRISE-A-TRANCHER.md` (le téléphone est déjà cohérent : six lignes en réalité). |
| **Action Claude après GO** | Normaliser ces champs sur toutes les pages, **puis** appliquer l'identité unique. L'outil existe, il est idempotent et contrôlé en CI. |
| **Test de succès** | Une seule valeur par champ sur l'ensemble du site ; 0 contradiction ; JSON-LD valide. |
| **Rollback** | `git revert` : les deux étapes sont mécaniques et réversibles. |

---

## Vue compacte — `PRIORITE | RISQUE | ACTION_FLORIAN | ACTION_CLAUDE_APRES_GO | TEST_SUCCES | ROLLBACK`

Demandée par 5812906621 §5. Le détail de chaque ligne est ci-dessus.

| # | Prio | Risque | Action Florian | Action Claude après GO | Test de succès | Rollback |
|---|---|---|---|---|---|---|
| 1 | P0 | Élevé — données clients lisibles et modifiables | Paquet privé : fermer l'inscription (10 s) puis appliquer la migration | Remettre migration, rollback et test dans le dépôt ; compléter le retour public | Plus aucune politique sans condition ; back-office et espace client intacts | `.ROLLBACK.sql` fourni, testé (22 contrôles) |
| 2 | P0 | Élevé — montant accepté depuis la requête, appelant non vérifié | Couper l'endpoint **ou** GO déploiement de la version durcie en TEST | Archiver la version en ligne, migration du montant, variables TEST, déployer avec `verify_jwt` | 6 contrôles en TEST : 401/403, montant de la requête ignoré, 404/409/422, idempotence, `livemode:false` | Redéployer le dossier archivé |
| 3 | P0 | Moyen — jeton non révoqué | Révoquer l'ancien jeton sur GitHub | Rien : l'authentification passe par `gh` depuis le 23/09 | `git ls-remote origin` fonctionne toujours | Sans objet |
| 4 | P1 | Faible technique, réel en référencement | GO déploiement fonction **+** fusion contrôlée (retire le statique) | Paquet sitemap : relever, déployer, fusionner, contrôler, resoumettre | 0 URL en `www`, ≥147 URL, ramonage présent, 0 URL d'actualité | Remettre le fichier statique (il reprend la main) |
| 5 | P1 | Moyen — identifiant public depuis juin | Netlify : supprimer et recréer le build hook | Retirer l'identifiant du dépôt | L'ancien échoue, le nouveau déclenche un build | Sans objet |
| 6 | P1 | **Élevé si fait par inadvertance** — pipeline de leads jamais mis en ligne | Décider : déployer `submit-lead-v6`/`notify-lead-v6` comme lot à part, ou les remettre en quarantaine | Déployer avec un test réel `NE PAS TRAITER`, archivé | Le lead s'enregistre, l'email porte le bon type | Redéployer la version relevée |
| 7 | P1 | Faible — pas de paiement en ligne aujourd'hui | Décider : déployer `create-payment-session` ou retirer l'appel | Les 7 prérequis (Stripe TEST, montant serveur, idempotence…) | Parcours complet en TEST, aucun paiement réel | Repasser en `pending` |
| 8 | P1 | Moyen — relais d'écriture ouverts | Trancher « supprimer » ou « durcir » les fonctions GitHub | Suppression contrôlée une par une, **ou** patch durci (35 tests) | Site et admin intacts, **ou** 401/403/403/429 | Redéployer la version relevée |
| 9 | P2 | Nul | Répondre oui/non aux 4 questions d'affichage | Appliquer, une décision par commit | Rendu 1440 + 390, suite verte | `git revert` |
| 10 | P2 | Commercial — engagement public | Dire si « Sous 2 h en journée ouvrée » est tenu | Reformuler les pages désignées | Test des prix publics vert | `git revert` |
| 11 | P2 | Nul | **Ouvrir la preview et valider le bandeau** | Rien si validé ; ajuster sinon | Ton accord | `git revert` |
| 12 | P2 | Nul tant qu'on ne bouge pas | Remplir les 6 champs d'identité | Normaliser puis appliquer l'identité unique | Une seule valeur par champ, 0 contradiction | `git revert` |
| 13 | P2 | **Non validé visuellement** | **Retester le bandeau saisonnier** sur la preview (les 3 CTA) | Promouvoir le lot si tu valides | Tes trois clics | `git revert` du lot |

## Ordre recommandé

**1 → 3 → 2** pour la sécurité (le premier prend dix secondes et protège des données clients ;
le troisième est presque gratuit), puis **4** quand tu veux passer en production, puis le reste
au fil de l'eau.

`AUTONOMOUS_QUEUE = EMPTY` · `NEXT_ACTION = FLORIAN_P0_SECURITY`

> **Écart avec la production** : l'inventaire complet est dans `ECART-PROD-2026-09-24.md`. La part
> réellement sûre de cet écart (docs et outillage) n'a aucun effet visible en production ; tout le
> reste passe par l'un des trois blocages décrits là-bas.
