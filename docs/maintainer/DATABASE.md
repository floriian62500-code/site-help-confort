# Données

> Projet Supabase **`btcbjwqiivhpwoszomhg`** — c'est la **production**. Il n'y a pas de base de
> recette : le site de recette lit et écrit dans la même base. Mise à jour : 2026-09-20.

## Ce que le site lit vraiment

| Source | Sert à | Lue par |
|---|---|---|
| `v_services_public` (vue de `services`) | catalogue des prestations et **leurs prix** (`price_ht`, `vat_rate`, `price_ttc`) | tunnel « Ma demande », catalogue, pages prestations |
| `v_contract_offers` (vue) | formules d'entretien (BASIC / CONFORT / SÉCURITÉ, gaz et fioul), prix mensuels et annuels | `contrats-entretien.html` |
| `realisations` | chantiers et actualités publiés (via la fonction `realisations-json`) | accueil, page Réalisations, générateur de fiches |
| `communes` | communes actives par zone (via `communes-list`) | composant « Zone d'intervention » |
| `reviews` | avis Google affichés | `hc-avis-live.js` |
| `partners`, `suppliers` | partenaires et fournisseurs | pages dédiées |
| `stats_publiques` | chiffres affichés | `hc-live-stats.js` |

## Ce que le site écrit

| Table | Quand | Par quoi |
|---|---|---|
| `leads` | demande, rappel, candidature, intention tarifaire | **uniquement** via la fonction `submit-lead-v6` |
| `newsletter_subscribers` | inscription newsletter | fonction dédiée |
| `payments` | création d'un lien de paiement | `stripe-create-payment-link` (voir [PAYMENTS.md](PAYMENTS.md)) |
| `recette_validation` | validation de recette | `/recette.html` |

**Jamais d'écriture directe** depuis le navigateur sur `/rest/v1/leads` : tout passe par l'edge, qui
valide, déduplique et notifie. (Une policy `leads_public_insert` autorise encore l'insert anonyme :
durcissement proposé dans `supabase/migrations/PROPOSED_…`, **non appliqué**.)

## Règle des prix

Aucun prix n'est écrit en dur dans une page. Il vient de `v_services_public` ou `v_contract_offers`,
ou d'un document interne tracé (`admin-pro/TARIFS_REFERENCE.md`) quand la prestation n'est pas encore
au catalogue. `scripts/tests/price-gate.test.mjs` le vérifie.

Cas particulier en cours : l'entretien poêle / insert (EPB 115 € HT, EPG 136 € HT) est un **barème
agence** documenté, pas encore au catalogue. L'ajout est préparé dans
`supabase/_pending_migrations/20260919100000_catalogue_entretien_poele_insert.sql` et **non appliqué**.

## Migrations

```
supabase/migrations/            appliquées automatiquement au push sur main (GitHub Actions)
supabase/_pending_migrations/   n'est JAMAIS exécuté : ce qui attend une décision
```

- Ne jamais modifier une migration déjà appliquée : en écrire une nouvelle.
- Un fichier « _rollback » rangé dans `migrations/` s'exécute comme les autres et **annule** son
  correctif : piège déjà rencontré, ne pas le reproduire.
- Trois migrations installent des tâches `pg_cron` ; certaines appellent des fonctions edge avec la
  clé **anon** : durcir une fonction sans regarder son cron casse la tâche.

## Accès et prudence

- Lecture : le rôle `anon` ne voit que ce que la RLS autorise (aucune PII).
- Écriture : `service_role`, côté serveur uniquement.
- **Toute écriture manuelle en base est une décision humaine.** En lecture, préférer une requête
  consolidée à dix requêtes successives.
