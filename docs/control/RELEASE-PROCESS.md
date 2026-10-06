# Process recette → production — règle obligatoire

Date d'effet : 2026-10-03
Décideur métier : Florian D'Haillecourt
Contrôle : ChatGPT
Exécution technique : Claude / branches GitHub

## 1. Branches et source de vérité

- `main` = production, et uniquement production.
- `recette` = registre de contrôle, preuves, maquettes et travaux en validation. **On ne fusionne jamais recette en bloc vers main.**
- Toute mise en production est reconstruite depuis le `main` courant sur une branche `release/*`.
- Une branche release ne contient que des demandes explicitement classées vertes dans la matrice de release.

## 2. Définition stricte de « vert »

Une demande est éligible production seulement si toutes les conditions suivantes sont vraies :

1. correction/évolution identifiée par un `request_id` ;
2. preuve technique complète ;
3. changement visible : preuve desktop 1440 + mobile 390 sur la preview du **SHA exact** à fusionner ;
4. parcours fonctionnel testé jusqu'au dernier écran sûr, sans faux lead ni paiement LIVE ;
5. aucun blocker ouvert ;
6. rollback exact documenté ;
7. aucun fichier sensible Supabase/RLS/auth/paiement/DNS/destruction dans le lot, sauf GO spécifique de Florian ;
8. diff de release revu depuis le `main` courant.

`TECH_ACCEPTED` seul ne vaut pas `PROD_VERIFIED`.

## 3. Règle de release

À chaque release :

1. relever le SHA courant de `main` ;
2. créer `release/<nom>` depuis ce SHA ;
3. reporter uniquement le diff minimal de chaque REQ verte — jamais une vieille branche divergée en bloc ;
4. ouvrir une PR vers `main` ;
5. exiger preview Netlify verte sur le head exact ;
6. contrôler diff, fichiers touchés, 1440/390, console, parcours et rollback ;
7. fusionner uniquement après GO Florian applicable ;
8. attendre le déploiement production ;
9. vérifier le domaine public ;
10. seulement alors inscrire `PROD_VERIFIED`/clôture dans le tracker.

## 4. Gestion des conflits et chevauchements

- Une REQ modifiant un fichier déjà modifié par une release fusionnée doit être resynchronisée depuis le nouveau `main`.
- Toute PR devenue divergée/non mergeable est **bloquée**, même si son ancienne preview était verte.
- Les commits mélangeant plusieurs REQ ne sont jamais repris aveuglément : le diff utile est reconstruit proprement.

## 5. GO production du 2026-10-03

Florian a donné le GO pour « pousser en prod tout ce qui est vert ».

Ce GO est limité à la matrice des demandes déjà vertes au moment de cette décision et n'autorise pas :
- paiement LIVE ;
- mutation Supabase/RLS/auth ;
- DNS ;
- suppression destructive ;
- une demande encore en rework / validation visuelle / preuve manquante.

Toute nouvelle REQ créée après ce GO nécessite son propre cycle de validation.

## 6. Discipline de tracker

Statuts opérationnels à respecter :
- `IN_PROGRESS` / `REWORK_REQUIRED` : jamais en release ;
- `WAITING_FLORIAN_*` : jamais en release tant que le gate n'est pas satisfait ;
- `TECH_ACCEPTED` : techniquement vert, à reconstruire/packager depuis main si applicable ;
- `READY_FOR_FLORIAN_VISUAL` : pas vert production ;
- `WAITING_CLAUDE_PROOF` : pas vert production ;
- `PROD_VERIFIED` n'est jamais déclaré sur une preview.

## 7. Garde permanente

Avant chaque merge production, ChatGPT contrôle :
- `main` actuel ;
- tracker ;
- outbox Claude ;
- PR/head SHA exact ;
- statut preview ;
- diff et fichiers sensibles ;
- rollback.

Après merge, contrôle production obligatoire avant clôture.
