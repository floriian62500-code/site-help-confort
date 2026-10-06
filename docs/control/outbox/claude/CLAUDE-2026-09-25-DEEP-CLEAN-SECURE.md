# Rapport — nettoyage et sécurisation en profondeur

message_id: CLAUDE-2026-09-25-DEEP-CLEAN-SECURE
repond_a: CHATGPT-2026-09-25-P0-DEEP-CLEAN-SECURE
date: 2026-09-25
statut: DONE — STOP
production: AUCUNE MUTATION

## ACK

Arrêt fonctionnel acté : plus de nouvelle fonctionnalité, plus d'élargissement de périmètre. Ce
rapport clôt le travail et je m'arrête ensuite, comme demandé au §9.

Trois audits en lecture seule ont été menés en parallèle (dépôt, sécurité GitHub/CI, sécurité
applicative), puis j'ai corrigé ce qui pouvait l'être sans toucher à la production.

**Le constat central, et il est inconfortable : l'écart n'est pas un écart de connaissance, c'est
un écart d'application.** Les failles les plus graves de ce rapport sont déjà décrites dans le
dépôt, avec leur correctif écrit à côté, en attente d'une décision humaine — parfois depuis août.

## INVENTAIRE_NETTOYAGE

| catégorie | trouvé | état |
|---|---|---|
| copies de conflit iCloud | 162 fichiers + 7 dans `.git` (dont une fausse référence qui cassait `git fetch`) | **supprimées ce matin**, garde en CI |
| workflows dupliqués | 1 (`tests 2.yml`, que GitHub aurait exécuté) | **supprimé**, garde dédiée |
| fichiers temporaires classiques (`.bak`, `.tmp`, `.pyc`…) | **aucun** suivi | `.gitignore` les couvre déjà |
| fichiers prouvés inutiles | 4 | **supprimés** (détail plus bas) |
| rapports `logs/` suivis | 12, figés au 16 mai, lus par personne | **détachés du dépôt**, conservés sur disque |
| scripts morts | `scripts/legacy/` = archive **assumée et documentée** (54 fichiers) ; 16 scripts sans appelant dans le dépôt | **conservés** : 7 sont lancés par un LaunchAgent hors dépôt |
| doublons de contenu | 4 SQL dupliqués `admin-pro/scripts/` ↔ `supabase/migrations/`, 4 images, 3 journaux | **signalés**, non touchés |
| migrations mal placées | **aucune** dans le dossier auto-appliqué | la règle du 24/09 a tenu |
| références Git incohérentes | 7 | **supprimées** |
| fichiers générés suivis | légitimes (le site les sert) sauf `logs/` | traité |
| documents de contrôle contradictoires | 2 | **signalés** (voir RELEASE_CONTROL_AUDIT) |

## FICHIERS_SUPPRIMES_OU_CONSERVES

**Supprimés — preuve d'absence d'usage par chemin complet, pas par nom :**

| fichier | preuve |
|---|---|
| `logs/scan-memoire-ia-latest.json` | lien symbolique **mort** (cible hors dépôt, disparue) |
| `videos/.test` | 0 octet, **aucune** référence |
| `tools/_obsolete-main-empty` | 0 octet, **aucune** référence |
| `tools/_obsolete-auto-push-loop.sh` | **aucune** référence, préfixe `_obsolete` |
| `tools/.netlify-build-hook` | **secret** — voir SECRETS_AUDIT |

**Conservés bien qu'ils en aient l'air :**

- `.test-rm-perm` et `images/.test-write` — 0 octet, mais **référencés** par
  `tools/Deploy-Full-Prod.command`, `tools/Deploy-Staging-Draft.command` et un document d'audit.
  Ce sont des sondes de permission d'écriture. La règle « prouver 0 usage » les sauve.
- `scripts/legacy/` (54 fichiers) — son `README.md` dit explicitement qu'ils sont conservés « pour
  comprendre l'histoire du dépôt, pas pour être relancés ». Une archive assumée n'est pas du mort.
- les 16 scripts sans appelant — l'outil d'inventaire du dépôt prévient lui-même que « sans
  appelant dans le dépôt » ne veut pas dire « mort » : sept sont lancés par un LaunchAgent du Mac.

**Détachés du dépôt, gardés sur disque :** les 12 rapports de `logs/`.
*Conséquence assumée* : `admin-pro/maintenance-agent.html` lit `/logs/scan-latest.json` et ne le
trouvera plus. Cette page affichait des données figées au **16 mai 2026**.

## RISQUES_SECURITE

### Un vrai secret, exposé depuis juin

`tools/.netlify-build-hook` contenait l'URL d'un **build hook Netlify** : un `POST` non
authentifié dessus déclenche un déploiement de production. Committé le 2026-06-10, dépôt **public**.
La même URL était recopiée dans `docs/CLAUDE-CODE-HANDOFF.md`.

Asymétrie révélatrice : `.gitignore` couvrait `tools/.netlify-access-token` mais **pas**
`.netlify-build-hook`. Et le code de `promote-to-prod` traite déjà cet identifiant comme un secret
d'environnement, avec un commentaire disant « à faire tourner » — le code l'avait caviardé, le
dépôt l'exposait.

**Aucun autre secret**, ni au HEAD ni dans l'historique : scan exhaustif des blobs, pas seulement
des commits accessibles. Les 22 commits qui « matchent » un motif de JWT contiennent tous une clé
**anon** (`"role":"anon"`), jamais `service_role`. Les `ghp_` et `sk_test` trouvés sont des motifs
**cités** dans des scripts de détection et de la documentation.

### Le site servait ses propres coulisses

Netlify publie depuis la **racine du dépôt** (`publish = "."`). Tout fichier suivi est servi, sauf
règle de blocage. Piège important : le `ignore` de `netlify.toml` **ne protège rien** — il décide
seulement s'il faut reconstruire. Étaient donc accessibles publiquement :

| chemin | contenu |
|---|---|
| `tools/` | scripts de déploiement, changement de domaine, **et le secret ci-dessus** |
| `logs/` | rapports d'audit interne (findings, score de santé, chemins) |
| `.github/` | workflows : identifiant du projet Supabase, noms des secrets, logique de déploiement |
| `admin-pro/audits/`, `admin-pro/scripts/` | ~50 scripts + SQL montrant comment injecter la clé `service_role` |
| racine | ~20 notes de travail : historique des incidents, procédures, `_redirects` lui-même — donc la carte des protections |

### Sécurité applicative — ce qui est ouvert en production

Ces points sont **constatés dans le code**, non déployés par moi, et **aucun ne peut être corrigé
sans gate** : ils touchent des fonctions edge et des politiques d'accès sur la base partagée.

1. **`stripe-webhook` ne vérifie pas la signature.** La ligne de vérification est commentée,
   derrière un `TODO`. Un événement fabriqué peut marquer un paiement « encaissé » sans qu'un euro
   ait été versé. Fonction **déployée**.
2. **`stripe-create-payment-link` accepte le montant depuis la requête**, sans identifier
   l'appelant, avec une clé lue en base et documentée comme celle de production. La version durcie
   existe — et **ne peut structurellement jamais être déployée** : elle s'appelle
   `HARDENED_index.ts`, or l'outil ne déploie que `index.ts`.
3. **Neuf fonctions d'écriture GitHub sont des relais ouverts** : jeton, dépôt, branche et chemins
   viennent de la requête, sans authentification. Trois ont **`main` pour branche par défaut**. La
   pire, `hc-content-save`, va chercher un **jeton côté serveur** quand l'appelant n'en fournit
   pas : omettre un champ suffit pour obtenir une écriture privilégiée.
4. **`app_settings` est lisible par tout compte authentifié** (`USING (true)`). Cette table
   contient la clé Stripe, la clé Anthropic, les jetons Google et Meta. Le rôle le plus faible du
   système ouvre le coffre entier.
5. **Écritures anonymes** : `anon` peut insérer directement dans `leads` (contournant validation,
   honeypot et limite de débit), et selon le constat consigné dans le dépôt, le bucket
   `site-photos` autorise `INSERT`/`UPDATE`/`DELETE` publics — donc le défacement des photos du
   site. Les deux correctifs sont **écrits et non appliqués**.
6. **Un PAT GitHub vit dans `localStorage`** (`hc_gh_token`), sans expiration, envoyé en clair aux
   fonctions edge.
7. **Données personnelles dans les journaux** : adresses e-mail des destinataires, adresse IP du
   visiteur, réponses d'API entières. Ironie du code : une ligne affiche « (count only, no PII) »
   cinquante lignes après avoir journalisé la liste brute des adresses.
8. **Historique de chat en `localStorage` sans expiration** : texte libre du visiteur, conservé
   indéfiniment sur l'appareil, hors du mécanisme de purge du tunnel (qui, lui, est bien fait).

## CORRECTIONS_EFFECTUEES

Sur `recette`, sans effet production tant que rien n'est livré :

| correction | preuve |
|---|---|
| secret retiré du suivi, caviardé dans la doc, ajouté à `.gitignore` (+ `*.pem`, `*.key`, `id_rsa*`, `.npmrc`) | `git ls-files tools/.netlify-build-hook` → vide |
| **27 règles de blocage** ajoutées à `_redirects` : `tools/`, `logs/`, `.github/`, `.autopush/`, `secrets/`, `admin/`, `admin-pro/audits`, `admin-pro/scripts`, `admin-pro/comm-packs`, et les notes de la racine | 33 règles `404!` au total |
| **4 scripts qui écrivaient au simple import** rendus inertes : bump de version des assets, générateur de réalisations, générateur du sitemap, générateur d'empreintes | test dédié, vérifié contre l'ancien code |
| 4 fichiers morts supprimés, `logs/` détaché | preuve par chemin complet |
| copies de conflit (162 + 7 dans `.git`) | supprimées, `git fsck` sain |

## CORRECTIONS_PREPAREES_NON_DEPLOYEES

Rien de sensible n'a été déployé, conformément au §3. Existaient déjà et restent en attente :

| correctif | où | gate |
|---|---|---|
| `stripe-create-payment-link` durci (montant serveur, JWT + rôle, TEST/LIVE séparés) | `HARDENED_index.ts` | **le nom empêche tout déploiement** — à renommer le jour du GO |
| `gh-push-inline` / `gh-edit-file` durcis (liste blanche, refus de `main`, jeton serveur, débit) | `HARDENED_index.ts` + `_shared/github-write.ts` | idem ; la table de débit est une migration en attente |
| fermeture de l'insertion anonyme dans `leads` | `_pending_migrations/PROPOSED_20260821…` | migration, base partagée |
| fermeture des écritures publiques sur `site-photos` | `_pending_migrations/PROPOSED_20260822…` | idem |
| traçabilité des validations (`feature_id`, `code_sha`) | `_pending_migrations/PROPOSED_validation_sha.sql` | idem |

**Point que je n'avais pas vu et qui mérite d'être dit** : trois correctifs portent un nom de
fichier que l'outillage de déploiement ne peut structurellement jamais retenir. Ils donnent
l'impression que la faille est traitée alors qu'elle est entièrement ouverte.

## TESTS_PROPRETE

`scripts/tests/depot-propre.test.mjs` passe de 4 à **10 contrôles**, tous branchés en CI :

```
✅ aucune copie de conflit sur le disque (1359 fichiers parcourus)
✅ aucune copie de conflit suivie par git
✅ les workflows sont uniques et nommés proprement (3)
✅ .gitignore écarte les copies de conflit
✅ aucun secret en clair dans les 1334 fichiers suivis
✅ importer un script ne modifie aucun fichier du dépôt (27 modules)
✅ aucun test n'écrit dans le dépôt (26 fichiers joués)
✅ les dossiers internes sont tous bloqués (12 surveillés)
✅ aucun dossier suivi n'échappe à la liste des dossiers publics et aux règles de blocage
✅ les notes de travail de la racine ne sont pas servies
```

**Chacun a été éprouvé contre un cas cassé**, comme exigé :

- le contrôle des secrets a d'abord signalé trois pages d'admin qui emploient le marqueur PEM comme
  littéral, et une fixture `rk_live_restreinte` : les seuils ont été relevés jusqu'à séparer une
  vraie clé d'une fausse — vérifié dans les deux sens ;
- le contrôle « écrit à l'import » a trouvé **quatre vrais coupables** dès sa première exécution,
  et échoue toujours si on lui redonne l'ancien code ;
- le contrôle de couverture des dossiers a trouvé `tools/`, `logs/` et `.github/` non bloqués ;
- première version fausse, corrigée : la mesure était cumulée, donc le premier coupable faussait le
  verdict des suivants. Elle se fait maintenant autour de **chaque** élément.

Ailleurs : `actualites-generateur` (une URL redirigée ne peut pas être recréée), `garde-wip` (17),
`derive-release` (20), `validation-fraicheur` (15, dont « importer n'écrit rien », mesuré dans un
processus séparé parce qu'en ESM les imports passent avant le corps du module).

## TESTS_SECURITE

| couverture | fichier |
|---|---|
| motifs de secrets | `depot-propre` |
| workflow dupliqué | `depot-propre` |
| dossiers internes servis | `depot-propre` |
| migration mal placée | `deploy-allowlist` (4 contrôles) |
| déploiement edge hors liste blanche | `deploy-allowlist` (23) |
| fonctions edge durcies, sans réseau | `deno test` — 35 contrôles |
| cohérence de la release | `derive-release` (20) |

## WORKFLOWS_AUDIT

| workflow | déclencheur | permissions | peut muter ? |
|---|---|---|---|
| `tests.yml` | push `recette`, pull_request | **`contents: read`** | non — le mieux cadré |
| `audit.yml` | cron 3 h | `contents: write` (explicite) | écrit `admin-pro/audits/` uniquement, delta requis, `[skip ci]` |
| `supabase-deploy.yml` | push `main` + `paths` | **absentes** | **oui : `db push` + déploiement de fonctions** |

Aucun workflow ne mute la production sans condition explicite, et la liste blanche de déploiement
tient. **Le manque net : `supabase-deploy.yml` n'a pas de bloc `permissions:`** et hérite donc de
droits d'écriture dont il n'a pas besoin. Correction d'une ligne, mais elle touche le fichier qui
déploie la production : je ne l'ai pas faite sans gate.

Aucun `push --force`, aucun `DROP TABLE`, aucun `TRUNCATE`. Les 8 `rm -rf` visent tous un
répertoire temporaire ou un verrou, avec `trap`. Trois migrations de mai portent des
`DELETE FROM contracts/leads` — inoffensives en régime normal, mais elles vivent dans le dossier
que la production applique toute seule.

## SECRETS_AUDIT

| catégorie | résultat |
|---|---|
| vrai secret committé | **1** : le build hook Netlify — retiré |
| clé publique par conception | `sb_publishable_…` dans 36 fichiers — **normal** pour un site statique |
| noms de variables, gabarits, fixtures | ~70 occurrences — **aucune valeur réelle** |
| historique git (scan de tous les blobs) | **aucun** secret privilégié, jamais |
| credentials Google sur disque | correctement ignorés (`secrets/*`) |

**Gate humain** : le build hook doit être **fait tourner côté Netlify**. Le retirer du dépôt
n'invalide pas un jeton public depuis juin. Je ne peux pas le faire.

## RELEASE_CONTROL_AUDIT

| point | état |
|---|---|
| `CURRENT-RELEASE.json` cohérent | **oui** — champ `elements` rempli (c'est celui que l'outil lit), release C active, B en gate métier, A en `DEV` |
| une seule release active | **oui** — C ; BC marquée remplacée, rattrapage marquée vide |
| branches d'essai séparées | **oui** — `essai/…` marquée PREUVE_UNIQUEMENT |
| release créée depuis main | **oui** — `behind_by = 0` |
| merge global `recette → main` | **aucun**, et écarté définitivement |
| validations liées au SHA | mécanisme prêt et testé, **non branché** (gate) |
| anti-dérive bloquant | **oui** — il a refusé l'ouverture de plusieurs lots aujourd'hui |

**Deux documents contradictoires trouvés**, non corrigés parce qu'ils demandent un arbitrage :

1. `docs/release/TABLEAU-EXECUTION-FINAL.md` (24/09) affirme « **tous les chantiers techniques sont
   fermés** », quand `CURRENT-RELEASE.json` (25/09) décrit un élément en `DEV` et un autre en
   attente. **Le document au nom le plus définitif est le plus ancien des deux.**
2. `docs/control/PROJECT_STATE.json` est figé au **12 août** et sert pourtant de porte d'entrée au
   plan de contrôle. Il porte un fait de sécurité (« dépôt public, à passer en privé ») vieux de
   six semaines.

## MATRICE_RISQUES

| # | Risque | Niveau | Preuve | Correction | Test | Rollback | Gate | Impact prod |
|---|---|---|---|---|---|---|---|---|
| 1 | Webhook Stripe sans vérification de signature : un paiement peut être marqué encaissé sans versement | **CRITIQUE** | ligne de vérification commentée, `TODO` | à écrire | — | redéploiement | **humain** | fonction déployée |
| 2 | Lien de paiement : montant venu du client, aucun appelant vérifié, clé de production | **CRITIQUE** | montant lu dans la requête, seul contrôle ≥ 1 € | durci déjà écrit | 12 contrôles Deno | renommer le fichier | **humain** | fonction déployée |
| 3 | Relais d'écriture GitHub ouverts, dont un qui utilise le jeton du serveur ; `main` par défaut | **CRITIQUE** | 9 fonctions sans authentification | durci déjà écrit | 35 contrôles Deno | redéploiement | **humain** | fonctions déployées |
| 4 | `app_settings` lisible par tout compte authentifié alors qu'elle contient les clés du système | **CRITIQUE** | politique `USING (true)` | migration à écrire | — | migration inverse | **humain** | base partagée |
| 5 | Écritures anonymes : insertion directe dans `leads`, écriture/suppression sur le bucket des photos | **HAUT** | politiques constatées | 2 migrations **écrites** | — | migration inverse | **humain** | base partagée |
| 6 | Build hook Netlify exposé dans un dépôt public depuis juin | **HAUT** | fichier suivi, 61 octets | **retiré du dépôt** | `depot-propre` | — | **humain : faire tourner le jeton** | déclenchement de build |
| 7 | Coulisses servies publiquement (`tools/`, `logs/`, `.github/`, notes de la racine) | **HAUT** | `publish = "."`, aucune règle | **27 règles ajoutées** | `depot-propre` | retirer les règles | non | effectif à la livraison |
| 8 | PAT GitHub en `localStorage` sans expiration | **HAUT** | `hc_gh_token` | à concevoir | — | — | **humain** | poste utilisateur |
| 9 | `admin-pro/` servi : 70 pages de back-office, protection côté client seulement | **HAUT** | 2 pages bloquées sur 259 fichiers | authentification à poser | — | — | **humain** | exposition |
| 10 | `supabase-deploy.yml` sans bloc `permissions:` | **MOYEN** | absent du fichier | 1 ligne | — | retrait | **humain** (fichier de déploiement) | droits du job |
| 11 | Données personnelles dans les journaux des fonctions edge | **MOYEN** | ~12 lignes identifiées | à écrire | — | redéploiement | **humain** | journaux Supabase |
| 12 | Historique de chat sans expiration côté navigateur | **MOYEN** | `hc_chat_history` | à concevoir | — | — | non | poste utilisateur |
| 13 | Limite de débit des formulaires en mémoire de processus (donc indicative) | **MOYEN** | compteur non partagé | à concevoir | — | — | non | volume |
| 14 | Doublon exact de migration dans le dossier auto-appliqué | **MOYEN** | deux fichiers identiques à 17 min d'écart | ne pas retirer sans précaution | — | — | **humain** | historique Supabase |
| 15 | Scripts qui écrivaient au simple import | **MOYEN** | 4 trouvés | **corrigé** | `depot-propre` | revert | non | aucun |
| 16 | Copies de conflit iCloud, dont un second workflow | **MOYEN** | 162 + 7 | **corrigé** | `depot-propre` | revert | non | aucun |
| 17 | Documents de contrôle contradictoires | **MOYEN** | 2 fichiers | à trancher | — | — | **humain** | aucun |
| 18 | `admin-pro/audits/` : 2,3 Mo de rapports régénérés et suivis | **FAIBLE** | 164 fichiers | proposition ci-dessous | — | — | non | volume du dépôt |
| 19 | Historique git sans secret | **FAIBLE** | scan de tous les blobs | — | — | — | non | aucun |
| 20 | `rm -rf` bornés, aucun force-push | **FAIBLE** | 8 occurrences vérifiées | — | — | — | non | aucun |

## Réduction du bruit — propositions, rien d'appliqué

1. **`admin-pro/audits/` (2,3 Mo, 164 fichiers)** régénérés chaque nuit et committés. Ils ne
   servent ni au site ni au build (`netlify.toml` les exclut du déclencheur). Proposition : les
   sortir du dépôt et les garder en artefact de workflow. **Gain : ~7 % du dépôt, et la fin des
   commits nocturnes qui font avancer `main` sans rien livrer.**
2. **Commits automatiques.** Le démon a encore committé pendant ce lot — le verrou de session a
   expiré au bout de 90 minutes. Proposition : porter la durée à 3 h, ou faire renouveler le verrou
   par le démon lui-même tant qu'un lot est déclaré.
3. **`admin-pro/comm-packs/`** : 2,1 Mo pour deux images exportées en lot, jamais renommées.
4. **173 journaux `RUN-*.md` / `CLAUDE-*.md`** dans `docs/control/` : c'est le fonctionnement
   documenté du control-plane, pas du bruit accidentel. **À conserver** — mais c'est le dossier le
   plus dense du dépôt, et il mérite un archivage annuel.

## NO_PROD_MUTATION_PROOF

| vérification | résultat |
|---|---|
| `origin/main` | inchangée |
| merge vers main | aucun |
| migration appliquée | non — dernière `20260810063933` |
| fonction edge déployée | **aucune** |
| durcissement sensible déployé | **aucun** — c'était l'interdiction du §3 |
| écriture en base | aucune |
| Stripe | aucun appel |
| DNS, secrets | aucun changement |

## SHA_FINAL

`76ecf19e` sur `recette`.

*Note d'honnêteté sur l'historique* : le démon de sauvegarde a committé une partie de ce lot sous
deux messages génériques (`104b5354`, `f11b743c`) pendant que le verrou de session était expiré. Le
contenu est intact et décrit dans le commit `76ecf19e` ; je ne réécris pas un historique déjà
poussé.

## NEXT_ACTION = STOP_WAIT_CHATGPT

Je m'arrête. Rien de sensible n'a été déployé, rien n'a été fusionné.

Les quatre décisions qui n'attendent que Florian, par ordre d'urgence :

1. **faire tourner le build hook Netlify** — il est public depuis juin ;
2. **trancher sur les quatre CRITIQUES** : webhook Stripe, lien de paiement, relais GitHub,
   lecture de `app_settings`. Trois ont leur correctif déjà écrit ;
3. **appliquer les deux migrations de fermeture** (`leads` anonyme, bucket photos) ;
4. **décider du sort de `admin-pro/`** : authentification, ou blocage complet.
