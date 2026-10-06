# P0 #8 — Refonte du flux de validation RECETTE → PRODUCTION

> Proposition technique + schéma d'états/DB + inventaire. **Aucune PROD pendant la refonte.**
> Statut : PROPOSITION (à valider par Florian avant implémentation de la réécriture `/recette.html`).

## 1. Inventaire (état réel au 2026-08-20)

### 1.1 Divergence git
- `recette` = `44a320e9` — **114 commits devant `main`**.
- `main` = `7b928eca` — **19 commits devant `recette`**, tous `github-actions[bot]` « rapports nightly [skip ci] » (bénins, non fonctionnels).
- ⚠️ Un merge global `recette → main` est **dangereux** : les 114 commits mêlent (a) vrais correctifs site, (b) commits **control-plane / runner / docs** destinés **uniquement à recette** (ne doivent JAMAIS aller en prod), (c) commits « Auto-push ».

### 1.2 Validations Florian (table `recette_validation`)
| Item | Page | Dernier statut | Version | Prod-ready ? |
|------|------|----------------|---------|--------------|
| `tarif-lead` | PRESTATIONS | **OK** | v2 | ✅ validé recette |
| `home-desktop-width` | HOME | **OK** | v1 | ✅ validé recette |
| `porte-entree` | MENUISERIE | à_corriger→**corrigé v2** | v1→v2 | 🔄 à revalider |
| `menuiserie-cards` | MENUISERIE | à_corriger→**corrigé v2** | v1→v2 | 🔄 à revalider |
| `zones-map` | HOME | à_corriger→**corrigé v2** | v1→v2 | 🔄 à revalider |
| `wizard-funnel` | HOME | à_corriger→**corrigé v2** | v1→v2 | 🔄 à revalider |
| `home-wizard-freeze` | HOME | à_corriger→**corrigé v2** | v1→v2 | 🔄 à revalider |

**Tout le reste** (issue #5, issue #6, A22 rebranchements, A-2026-001→019, refonte centre CP-0015, honnêteté paiement…) = **NON VALIDÉ** (jamais passé par une décision Florian dans le centre).

### 1.3 Classement migration
- **DÉJÀ EN PROD** : rien des correctifs récents (main figée hors nightly).
- **VALIDÉ RECETTE, PAS EN PROD** : `tarif-lead` v2, `home-desktop-width` v1 (2 items) — à mapper précisément vers leurs SHA.
- **À REVALIDER** : porte-entree, menuiserie-cards, zones-map, wizard-funnel, home-wizard-freeze (corrigés, en attente re-OK).
- **NON VALIDÉ** : l'essentiel du travail récent (à faire valider par lot).
> **Conclusion : rien ne doit partir en prod aujourd'hui.** Aucune base de lot validé n'existe encore.

## 2. Architecture cible

### 2.1 Notion de LOT DE RELEASE (immuable)
Un `release_lot` = ensemble **immuable** de commits à promouvoir :
- `release_id` (ex. `REL-2026-08-20-01`)
- `base_sha` (SHA prod/main de référence)
- `head_sha` (SHA recette validé)
- `commits[]` (liste exacte des SHA autorisés — **jamais** « toute la recette »)
- `files[]` (fichiers touchés — sert aux contrôles)
- `items[]` (les éléments de validation rattachés, avec leur version)

**Règle d'invalidation** : si un nouveau commit touche un fichier d'un item du lot → la validation de cet item repasse `A_REVALIDER` automatiquement (comparaison `head_sha` figé vs `recette` courant).

### 2.2 Quatre états (affichés dans `/recette.html`, avec SHA)
`A_TESTER` → `VALIDE_RECETTE` → `PRET_PROD` → `DEPLOYE_PROD`
- Validation item/page = **fonctionnelle/visuelle**, jamais « toute la branche publiable ».
- Bouton final = **« VALIDER LE LOT POUR PROD »** (pas « valider toute la recette »).

### 2.3 Schéma DB proposé (nouvelles tables — migration NON appliquée = gate)
```sql
create table release_lots (
  release_id   text primary key,
  base_sha     text not null,
  head_sha     text not null,
  status       text not null default 'A_TESTER'
               check (status in ('A_TESTER','VALIDE_RECETTE','PRET_PROD','DEPLOYE_PROD','BLOQUE')),
  created_at   timestamptz not null default now(),
  created_by   text,
  deployed_sha text,           -- SHA main après promotion
  deployed_at  timestamptz,
  proofs       jsonb           -- E2E, build, liens/console, responsive
);
create table release_commits (
  release_id text references release_lots(release_id) on delete cascade,
  sha        text not null,
  subject    text,
  primary key (release_id, sha)
);
create table release_items (        -- rattache les items de validation au lot
  release_id text references release_lots(release_id) on delete cascade,
  mod_id     text not null,
  version    text not null,
  status     text not null default 'A_TESTER',   -- A_TESTER/VALIDE/A_REVALIDER
  primary key (release_id, mod_id)
);
-- promotion_requests : trace de demande explicite de mise en prod
create table promotion_requests (
  id serial primary key,
  release_id text references release_lots(release_id),
  base_sha text, head_sha text, commits jsonb,
  requested_at timestamptz default now(), requested_by text,
  test_proofs jsonb, decision text default 'PENDING'
);
```
> `recette_validation` existante conservée (décisions item/version) ; on **relie** ses décisions à un `release_id`.

### 2.4 Contrôles automatiques AVANT promotion (obligatoires)
1. `head_sha` du lot **inchangé** depuis validation (sinon `A_REVALIDER`).
2. `main` **non bougée** depuis création du lot au-delà des nightly `[skip ci]` (sinon **BLOQUER** + reconstruire).
3. Build Netlify recette PASS + preview HTTP 200 sur SHA témoin.
4. E2E des parcours critiques (wizard réservation, formulaires) PASS.
5. Liens internes / console / responsive critique OK.
6. **Zéro** : Stripe LIVE, secret, fichier `docs/control/**` ou `scripts/control/**` (recette-only) dans le lot.
7. Promotion = **cherry-pick contrôlé** des commits du lot (ou PR de release ciblée), **jamais** les 114 commits de recette.

### 2.5 Après promotion
- Vérifier la PROD réellement : HTTP, parcours critique, SHA déployé.
- Marquer le lot `DEPLOYE_PROD` (+ `deployed_sha`, `deployed_at`).
- Rollback possible (revert du merge de release).
- Sections centre : **EN ATTENTE DE PROD** (lots validés non déployés) + **EN PROD** (date + SHA + release_id).

## 3. Plan d'implémentation (recette only)
1. **(ce doc)** proposition + inventaire — à valider par Florian.
2. Migration SQL des 4 tables — **écrite, NON appliquée** (apply = gate humain).
3. Générateur de lot `scripts/control/build-release-lot.mjs` : calcule base/head/commits/files, exclut `docs/control/**` + `scripts/control/**`, rattache les items validés.
4. Refonte `/recette.html` : 4 états + sections EN ATTENTE / EN PROD + bouton « VALIDER LE LOT POUR PROD » (crée une `promotion_request`, ne déploie rien).
5. Contrôles pré-prod automatiques (script) + E2E du nouveau flux.
6. La **promotion réelle** reste un **GATE humain** explicite (jamais automatique).

## 4. Gates
Aucune PROD, aucune branche main touchée, aucun Stripe LIVE, aucun secret, migration DB non appliquée sans GO. La promotion d'un lot validé exigera toujours un GO explicite de Florian.
