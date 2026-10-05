# REVUE EXHAUSTIVE — toutes les demandes non en production

Décision Florian : reprendre CHAQUE point qui n'est pas en production, déterminer s'il est encore applicable au main courant, le valider si possible, le pousser en prod si sûr, sinon identifier le vrai gate. Ne jamais laisser un statut historique bloquer un lot sans relecture du main courant.

## Règle de traitement pour chaque REQ
Pour chaque demande encore non CLOSED/PROD_VERIFIED :
1. comparer la demande au main courant et au domaine public ;
2. classer exactement :
   - READY_TO_RELEASE : applicable, non sensible, preuves suffisantes -> lot depuis main courant, preview, PASS/BLOCKED ;
   - NEEDS_REWORK : applicable mais preuve/code obsolète -> reconstruire depuis main courant ;
   - HUMAN_GATE : décision visuelle/métier de Florian réellement nécessaire -> fournir une preview/captures actuelles et une question OUI/NON précise ;
   - SENSITIVE_GATE : paiement, Supabase/RLS/auth, DNS, déploiement fonction sensible -> ne pas muter, fournir delta/risque/rollback et GO exact requis ;
   - NOT_APPLICABLE : cible absente ou demande déjà rendue sans objet par l'état actuel -> preuve actuelle et proposition de clôture sans prod ;
   - CONTROL_ONLY : outillage/process sans artefact à déployer -> preuve et proposition de clôture hors prod.
3. ne jamais réutiliser aveuglément un vieux SHA/une vieille preview : repartir du main courant quand une release est nécessaire ;
4. si READY_TO_RELEASE : exécuter jusqu'au PASS puis STOP merge pour ChatGPT, mais rester actif sur la préparation du suivant ;
5. après merge ChatGPT : PROD_VERIFY public puis clôture.

## Priorité immédiate

### REQ-039 — P1 — IN_PROGRESS
Continuer en premier. PR #29 head courant `da37ab6eeb2a9298b801a7d567797a306b7f0265`, preview verte.
Fournir le paquet final au head exact :
- scan complet 117 pages à 390 ;
- 0 page avec overflow > 1 px ;
- avant/après des 39 pages ;
- échantillons 390/1440 des 3 causes ;
- composants fonctionnels ;
- console ;
- rollback ;
- PASS/BLOCKED.
Ne pas ouvrir un autre changement dépendant avant verdict, mais préparer l'audit backlog ci-dessous.

## Revue demande par demande

### REQ-001 — paiement / sécurité
Classer SENSITIVE_GATE. Ne rien déployer. Rafraîchir uniquement l'état actuel et résumer les actions exactes qui nécessitent un GO spécifique. Ne jamais exposer de secrets.

### REQ-003 — grille prestations Chauffage
Ancien WAITING_FLORIAN_VISUAL. Reprendre contre le main actuel et la prod actuelle. Déterminer si la demande est déjà satisfaite, obsolète ou nécessite encore une nouvelle maquette. Si gate visuel réel : produire preview actuelle + captures 1440/390 et une question OUI/NON simple.

### REQ-004 — pictos footer Métiers
REWORK_REQUIRED ancien. Réauditer les footers sur le main courant. Si le défaut existe encore, reconstruire une proposition visuelle cohérente avec source unique ; preview/captures puis HUMAN_GATE. Ne pas pousser un choix visuel non validé.

### REQ-006 — bannière accueil flottante + routage Chauffage
Réauditer la prod actuelle. Si la bannière/routage voulu est déjà satisfait, fournir preuve et proposer clôture. Sinon reconstruire depuis main et fournir preview/captures pour validation Florian.

### REQ-008 — suppression bloc final page Contrats
Le précédent audit disait que la cible recette n'existait pas dans main. Revalider sur le main actuel. Si toujours sans objet : classer NOT_APPLICABLE et proposer clôture, pas une nouvelle modification visuelle inventée.

### REQ-009 — régression #intervention
Revalider que le tunnel cible n'existe toujours pas en production. Si oui : NOT_APPLICABLE, proposer clôture sans prod.

### REQ-011 — routage boutons prestations avec prix
Même contrôle que REQ-009. Si le tunnel cible n'existe pas : NOT_APPLICABLE, proposer clôture sans prod.

### REQ-012 — gel UX non correctif
C'est une règle/process, pas un artefact prod. Vérifier si elle a encore une raison d'être. Si le contexte qui la justifiait est terminé, proposer clôture CONTROL_ONLY ; sinon expliquer quel gate actuel la maintient.

### REQ-013 — HOLD production / sécurité
Ne pas appliquer comme blocage global des releases sûres. Maintenir uniquement sur le périmètre sensible lié à REQ-001. Classer CONTROL_ONLY/SENSITIVE_GATE selon le texte actuel et proposer mise à jour du tracker.

### REQ-014 — repli visuel cartes électricien/serrurier/vitrier
Ancien OPEN_GELE. Vérifier si le défaut existe encore sur la prod actuelle. Si oui et correctif non sensible : sortir du gel, reconstruire depuis main, preview/captures, PASS/BLOCKED. Si choix visuel nécessaire, HUMAN_GATE.

### REQ-015 — trois photos manquantes
HUMAN_GATE si les photos sont réellement toujours absentes et nécessaires. Vérifier d'abord si les médias actuels ont changé. Ne demander à Florian que ce qui manque réellement.

### REQ-018 — chauffe-eau/ECS dans l'offre contrats
Important : REQ-017 en prod affiche déjà l'entretien chauffe-eau annuel à 220 € TTC/an. Vérifier si cela satisfait intégralement REQ-018. Si oui : PROD_VERIFIED par héritage fonctionnel avec preuves actuelles et proposer clôture. Sinon lister le delta exact restant.

### REQ-020 — cartes prestations limitées à deux actions
Le blocage historique dépendait de REQ-017, désormais en production et validée. Considérer ce blocker comme potentiellement obsolète. Réauditer la prod actuelle ; si applicable, préparer lot depuis main ou preview si validation visuelle nécessaire.

### REQ-022 — montrer/prototyper avant modification structurelle
Process/gouvernance, pas artefact prod. Vérifier qu'il est désormais couvert par RELEASE-PROCESS et la pratique actuelle. Si oui : CONTROL_ONLY, proposer clôture.

### REQ-026 — garde automatique cohérence zones
Outillage recette uniquement. Classer CONTROL_ONLY si toujours sans vocation prod ; proposer clôture du tracker de release, sans portage vers main.

### REQ-027 — liste canonique communes
HUMAN_GATE métier. Rafraîchir les 4 questions métier uniquement si elles sont toujours nécessaires après les changements zones déjà en prod. Ne rien muter.

### REQ-029 — outils externes SEO/qualité
CONTROL/EXTERNAL_GATE, pas release applicative. Vérifier si cela doit rester dans le tracker prod. Proposer clôture ou déplacement hors backlog prod.

### REQ-030 — Figma + Playwright QA
Même logique : outillage/QA, pas fonctionnalité prod. Vérifier si cela doit être sorti du backlog prod. Si oui proposer CONTROL_ONLY/clôture.

### REQ-032 — refonte Nos métiers
HUMAN_GATE visuel. Les vieilles PR #15/#19/#20 sont historiques et ne doivent pas être mergées. Si le sujet reste voulu, reconstruire une preview actuelle depuis main courant et fournir captures 1440/390 pour décision Florian. Ne pas réutiliser une branche divergente.

### REQ-033 — routage demandes site vers saint-omer@helpconfort.com
SENSITIVE_GATE car déploiement de fonctions. GO métier existe mais le geste de prod est sensible. Faire un audit actuel read-only : quelles fonctions sont alignées ou non, delta exact, test contrôlé prévu, rollback, et formuler le GO sensible précis requis. Ne pas déployer sans ce GO.

### REQ-034 — rattrapage production lots verts
C'est probablement devenu obsolète puisque 007/017/019/023/024/036/037/038 sont désormais prod vérifiées. Recalculer l'état. S'il ne reste aucun lot vert historique à rattraper : CONTROL_ONLY/NOT_APPLICABLE et proposer clôture.

### REQ-035 — encart saisonnier
REWORK_REQUIRED avec preuve visuelle invalide. Vérifier d'abord si le besoin saisonnier est encore actuel et si l'encart est déjà en prod ou non. Si encore pertinent : refaire la preview depuis main courant + 8 captures propres sans bandeau cookies, puis HUMAN_GATE. Si saison passée/besoin obsolète : proposer clôture NOT_APPLICABLE.

## Livrable attendu
Publier un rapport unique de synthèse :
`docs/control/outbox/claude/CLAUDE-2026-10-05-REVUE-TOUT-NONPROD.md`

Table obligatoire :
REQ | état prod actuel | classification | action exacte | gate réel | release nécessaire ? | priorité

Puis exécuter automatiquement tous les READY_TO_RELEASE non sensibles, dans l'ordre P0 -> P1 -> P2, un lot à la fois depuis le main courant. Pour chaque lot : preview, preuves, PASS/BLOCKED, puis ChatGPT merge et PROD_VERIFY.

Ne demande pas à Florian de retransmettre quoi que ce soit. Les seules remontées Florian doivent être des décisions OUI/NON réellement humaines ou des GO sensibles explicites.
