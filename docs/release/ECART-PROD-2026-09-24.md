# Écart recette → production : ce qu'il contient, et pourquoi je n'ai rien déployé

> Demandé par 5812906621. **Aucun déploiement, aucune fusion, aucune migration.** Ce document dit
> ce qu'une fusion ferait réellement, lot par lot, et nomme les trois blocages qui l'empêchent
> aujourd'hui d'être « sûre ».

## 1. L'écart, mesuré

| | |
|---|---|
| Base commune | `755ed1bf` — **8 août 2026** |
| Commits recette absents de `main` | **697**, dont 251 sauvegardes automatiques → **446 porteurs de message** |
| Commits `main` absents de recette | **54** — 53 rapports d'audit nightly + 1 fusion. **Aucun travail de production ne serait perdu**, seuls 104 rapports reviendraient à une version plus ancienne (ils se régénèrent chaque nuit) |
| Fichiers modifiés | 936 · +68 551 / −49 689 |

### Ce qu'une fusion changerait *en production*

| Périmètre | Fichiers | Effet réel |
|---|---|---|
| Pages publiques | **104** | rendu du site |
| Pages `admin-pro` | 129 | back-office |
| Assets JS/CSS | 29 | comportement du tunnel, de l'en-tête, du panier |
| `_redirects` / `netlify.toml` | 2 | routage et en-têtes |
| **Fonctions edge** | **63** | ⚠️ **déclenche un redéploiement** |
| **Migrations SQL** | **3** | ⚠️ **déclenche `supabase db push` sur la base partagée** |
| Workflows CI/CD | 2 | déclenche le workflow lui-même |
| docs + scripts | 333 | inertes (non servis) |

## 2. Les trois blocages, prouvés

### Blocage 1 — la fusion appliquerait des migrations non validées à la base de production

Le workflow se déclenche sur `supabase/migrations/**.sql` **et** sur lui-même : les deux changent.
Il exécute alors `supabase db push --linked` **sur la base partagée avec la production**.

Parmi les 3 migrations d'écart, deux s'appelaient `PROPOSED_*` : des **propositions**, jamais
validées. L'une durcit l'insertion dans `leads` — **la table qui reçoit toutes les demandes du
site**. Mal calibrée, elle casse le formulaire public.

**Désamorcé aujourd'hui** : les deux propositions sont déplacées dans `supabase/_pending_migrations/`
(jamais exécuté), le dossier `migrations/` porte une note expliquant la règle, et un contrôle
automatique (23/23) refuse désormais toute proposition ou tout retour arrière dans le dossier
appliqué. Le piège ne peut plus se reproduire.

### Blocage 2 — la fusion remplacerait le pipeline de leads par une version jamais mise en ligne

J'ai téléchargé les sources **réellement déployées** et je les ai comparées au dépôt :

| Fonction | En production | Dans le dépôt | Écart |
|---|---|---|---|
| `submit-lead-v6` | 162 lignes | 251 lignes | **211 lignes** |
| `notify-lead-v6` | 261 lignes | 356 lignes | **296 lignes** |
| `realisations-json` | 83 | 89 | 0 (hors commentaires) |
| `communes-list` | 47 | 52 | 0 (hors commentaires) |

`submit-lead-v6` reçoit **toutes** les demandes du site. La version du dépôt ajoute le suivi
d'intention et le cycle de relance — du travail réel, mais **qui n'a jamais tourné en production**.
Une fusion la déploierait sans test de charge réel : si elle a un défaut, **chaque demande est
perdue**, sans que personne le voie tout de suite.

C'est un déploiement à décider, avec son propre test — pas un effet de bord d'un rattrapage.

### Blocage 3 — je ne peux pas certifier ce qui a été validé visuellement

La règle que tu poses est claire : « ne pousse jamais un lot encore refusé visuellement ou non
testé ». Or **aucune validation visuelle de Florian n'est enregistrée** depuis la RC du 07/09, et
deux lots sont explicitement en attente :

- le **bandeau d'accueil** — `HOME_PROMO_VISUAL_APPROVAL=WAITING_FLORIAN` depuis le 23/09 ;
- le **sous-lot saisonnier** (`5812875220`) — réouvert, corrigé, **non revalidé**.

Ces deux lots touchent `index.html`, `assets/hc-demande.js` et `hc-demande-core.js` — **les mêmes
fichiers** que la quasi-totalité du travail front validé techniquement. Les isoler par
cherry-pick n'est pas praticable : il faudrait une branche de release et des reverts ciblés, donc
un état qui n'a jamais été testé tel quel. On remplacerait un risque connu par un risque nouveau.

## 3. Ce qui, en revanche, est isolable sans risque

| Lot | Contenu | Effet en production | Statut |
|---|---|---|---|
| Documentation | 219 fichiers `docs/` | **aucun** — non servis | `VALIDATED_FOR_PROD`, sans intérêt à déployer seul |
| Outillage | 114 fichiers `scripts/` | **aucun** — `/scripts/*` renvoie 404 | idem |
| Rapports d'audit | `admin-pro/audits/` | back-office uniquement | déjà plus récents en production |

Autrement dit : **la part réellement sûre de l'écart n'a aucun effet visible en production.** Tout
ce qui aurait un effet passe par l'un des trois blocages ci-dessus.

## 4. Ce qu'il faut pour rendre un rattrapage possible

Dans cet ordre, et chacun est une décision :

1. **Fermer les deux P0 sécurité** — la directive le dit elle-même : la sécurité passe avant le
   rattrapage fonctionnel. Tant que l'accès aux données est ouvert, déployer des améliorations
   marketing revient à peindre une façade dont la porte est ouverte.
2. **Décider du pipeline de leads** : déployer `submit-lead-v6` et `notify-lead-v6` comme un lot à
   part, avec un test réel marqué `NE PAS TRAITER`, ou les remettre en `quarantine` pour qu'une
   fusion ne les emporte pas.
3. **Valider visuellement** le bandeau d'accueil et le sous-lot saisonnier sur la preview. Deux
   regards de trente secondes débloquent l'essentiel du front.
4. **Alors seulement**, la fusion devient un geste simple : plus de migration surprise, plus de
   fonction critique embarquée, plus de lot refusé.

## 5. Ce que j'ai fait aujourd'hui, et ce que je n'ai pas fait

**Fait** : l'inventaire ci-dessus, la preuve des divergences de fonctions, le désamorçage du dossier
de migrations et son contrôle automatique.

**Pas fait** : aucune fusion, aucun déploiement, aucune migration. Je ne considère pas cela comme un
refus de la directive : elle autorise le rattrapage « sous réserve des gates techniques réellement
indispensables ». Les trois ci-dessus en sont, et deux d'entre eux — base de production et pipeline
de leads — peuvent coûter des demandes clients.
