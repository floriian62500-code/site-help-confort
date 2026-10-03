# Paquet SECURITY-ANON-WRITES — P0-5

*Préparé, non appliqué.*

Deux écritures ouvertes à l'anonyme, sans rapport entre elles sinon qu'elles contournent toutes les
protections prévues.

## 5a — Insertion directe dans `leads`

**État exact.** `supabase/migrations/20260511000000_baseline_existing.sql:163` :
`leads_public_insert` autorise le rôle `anon` à insérer dans `leads`, sous la seule condition
`status = 'nouveau' and assigned_to is null`. Cette voie contourne intégralement la validation, le
honeypot et la limite de débit de `submit-lead-v6`. La clé publiable nécessaire est dans le
JavaScript du site — elle est publique par conception.

**La vérification qui manquait a été faite** (2026-09-26). Le correctif préparé en août attendait
une preuve : « vérifier qu'aucun formulaire ne poste en direct ». Mesure sur tout le dépôt :

```
grep -rn "rest/v1/leads" --include=*.html --include=*.js
→ une seule occurrence, un COMMENTAIRE dans devis-express.html:372 qui constate que l'ancien
  POST direct « était rejeté par la RLS => 0 lead devis-express »
grep -rho "functions/v1/submit-lead[a-z0-9-]*"
→ 7 occurrences, toutes vers submit-lead-v6
```

Les sept formulaires passent par la fonction edge. **L'insertion anonyme ne sert à personne.**

**Correctif minimal.** `_pending_migrations/PROPOSED_20260821_leads_insert_hardening.sql` — l'option
A y est désormais active (elle était entièrement commentée) : `drop policy leads_public_insert`.

**Rollback exact.**
```sql
create policy leads_public_insert on public.leads
  for insert to anon with check (status = 'nouveau' and assigned_to is null);
```

**Vérification après application, sans écrire de vraie donnée** : une insertion avec la clé
publiable doit répondre 401/403 au lieu de 201 ; un envoi depuis un formulaire du site doit
continuer à créer le lead. *(Rappel de méthode : ne jamais soumettre un vrai formulaire du site en
test — cela crée un vrai prospect et déclenche une vraie notification à l'agence.)*

**Interruption : aucune.**

## 5b — Bucket `site-photos` en écriture publique

**État exact.** `_pending_migrations/PROPOSED_20260822_storage_site_photos_hardening.sql` documente
trois politiques `public` en `INSERT`, `UPDATE` et `DELETE` sur `storage.objects` pour ce bucket.
Selon ce constat, un visiteur anonyme peut **téléverser, écraser ou supprimer les photos servies
sur le site en ligne** — c'est-à-dire défacer le site.

**Correctif.** Le fichier contient déjà du DDL actif (contrairement à celui des leads) : il retire
les trois politiques publiques et réserve l'écriture aux comptes authentifiés. Son auteur note que
le front ne fait que **lire** ce bucket : la correction est sans effet de bord.

**Ce que je n'ai pas pu vérifier.** L'état réel des politiques en production ne se lit pas dans le
dépôt. Avant d'appliquer, il faut confirmer côté Supabase que ces trois politiques existent bien —
sinon la migration ne fera rien, ce qui est sans danger mais mérite d'être su.

**Rollback** : recréer les trois politiques, qui sont citées dans l'en-tête du fichier.

**Interruption : aucune** pour le site public, qui lit seulement. Un outil interne qui téléversait
en anonyme devrait s'authentifier.

## Tables sans politique visible dans le dépôt

À signaler, sans correctif préparé : `payments`, `chat_conversations`, `chat_messages`,
`click_events`, `lead_action_tokens`, `_gh_push_chunks`, `unsubscribe_tokens`,
`email_suppressions` n'ont **aucune migration** dans le dépôt. Qu'elles soient protégées ou non en
production, **rien ici ne permet de le savoir ni de le reconstituer** : une restauration depuis le
dépôt les recréerait sans politique. C'est un risque de continuité autant que de sécurité.

## Ordre d'application

1. 5a (leads) — la preuve est faite, l'impact est nul ;
2. 5b (photos) — après confirmation de l'état réel des politiques ;
3. inventaire des tables sans migration — travail séparé, à cadrer.

## GO humain : oui — migrations sur base partagée.
