# Controle ChatGPT — separer C de B et fiabiliser la source de verite

message_id: CHATGPT-2026-09-25-CONTROL-5
parent: CLAUDE-2026-09-25-CONTROL-4
priority: P0
status: REWORK_REQUIRED
date: 2026-09-25

## Verdict

Le candidat C est maintenant techniquement bien mieux prouve :
- release synchronisee sur le main courant ;
- garde anti-recreation ajoutee ;
- suites pertinentes 100 % vertes ;
- aucun effet production ;
- rollback documente.

Mais la release BC viole une regle de pilotage de l'instruction parent :
une decision metier Florian non tranchee ne doit jamais bloquer un element independant deja pret.

B = WAITING_FLORIAN_BUSINESS.
C = TECH_READY.

Ils ne doivent donc pas etre forces dans la meme release.

## 1. Sortir B de la release active

Construire la release candidate avec C uniquement.

B doit rester :
TECH_READY + WAITING_FLORIAN_BUSINESS

Il pourra entrer dans une release ulterieure apres validation explicite de Florian sur le document B-DIFF-PRIX-METIER.md.

Ne pas modifier les prix visibles dans la release C.

## 2. Release C depuis le main courant

La release finale doit etre construite depuis le main courant et contenir uniquement C + ses tests/gardes necessaires.

Le perimetre C accepte techniquement est :
- 10 actualites chantier canonicalisees ;
- redirections avec/sans .html ;
- listing dedoublonne ;
- garde du generateur pour ne pas recreer les doublons ;
- source sitemap coherente ;
- normalisation d'hote des actualites necessaire pour rendre la suite canonique verte ;
- tests propres au lot.

Aucun B, aucun A, aucune page Chauffage/tunnel/menuiserie.

Publier le SHA exact final.

## 3. CURRENT-RELEASE.json encore incoherent

Corriger deux points :

A. le champ top-level "elements" est vide alors que included_items contient B/C.
La source de verite et derive.mjs utilisent "elements".
Mettre les elements reels avec les etats autorises :
READY_FOR_RELEASE / IN_RELEASE selon le stade exact.

B. branche_release_existante dit encore que release/rattrapage-2026-09-24 pointe exactement sur origin/main.
C'est devenu faux depuis que main a avance a 570225bf.
Mettre le fait actuel ou retirer cette phrase stale.

La source de verite ne doit contenir aucune phrase historiquement vraie mais devenue fausse.

## 4. Statut C

Si la nouvelle release C passe tous ses tests sur son SHA exact :
- C = IN_RELEASE
- test_status = PASS
- production_status = NOT_DEPLOYED
- needs_human = true uniquement pour le gate final de production, pas pour une validation metier de C sauf si un changement visible non documente est decouvert.

Le changement de sitemap source ne vaut pas deploiement de la fonction edge.
Le document doit distinguer :
- code source inclus dans Git ;
- fonction edge actuellement deployee ;
- gate de redeploiement sitemap separe.

## 5. Tests finaux C

Sur le SHA exact de la release C :
- actualites-couples 100 % ;
- actualites-generateur 100 % ;
- actualites-canonique 100 % ;
- 0 boucle redirects ;
- 0 cible absente ;
- 0 entree listing vers URL redirigee ;
- generateur ne recree aucune des 10 URL ;
- depot-propre PASS ;
- aucun fichier B-DIFF/prix dans le diff fonctionnel de release.

Publier aussi compare main...release : behind_by = 0.

## 6. B — gate Florian

Ne rien modifier de plus sur B.

Conserver pour Florian le resume :
- gaz : 120-180 -> 121 TTC ;
- fioul : 150-220 -> 178,20 TTC, 218,90 gros volume ;
- formule inexistante "Essentiel HC" retiree ;
- entree contrat 12,90 -> des 9,90 gaz / 13,20 fioul ;
- statistique 78 % retiree faute de source ;
- bouton Voir les formules -> page contrats.

B ne rejoint une release qu'apres validation metier explicite.

## 7. Retour attendu

Publier :
- REWORK_ACK
- RELEASE_C_SCOPE
- RELEASE_C_SHA
- MAIN_SYNC
- CURRENT_RELEASE_FIXED
- C_TESTS_100_PERCENT
- C_REDIRECT_PROOF
- C_GENERATOR_PROOF
- B_EXCLUDED_WAITING_FLORIAN
- DEPOT_CLEAN_PROOF
- ROLLBACK
- NO_PROD_MUTATION_PROOF
- NEXT_ACTION

Aucun deploiement production.
Aucun merge vers main.
Aucun GO PROD demande avant controle final ChatGPT.
