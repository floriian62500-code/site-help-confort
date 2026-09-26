# Correction Florian — bannière accueil flottante + routage Chauffage + prestations avec photos

message_id: CHATGPT-2026-09-26-P0-HOME-BANNER-FLOATING-ROUTING
priority: P0
status: TO_EXECUTE
date: 2026-09-26
source: transmise par Florian dans la conversation (copie du message ChatGPT) — enregistrée ici par
        Claude avant tout développement, conformément à la règle « une instruction = un action_id
        dans l'inbox ». Trois captures jointes : bannière accueil, écran « Vous avez une demande en
        cours » atteint depuis « Poêle ou insert », cartes « Notre savoir-faire en chauffage ».

## Décision Florian

Le comportement et la présentation actuels ne sont pas conformes.

### 1. Bannière accueil

La bannière Entretien / Ramonage / Poêle ou insert sur la page d'accueil ne doit pas rester comme
un gros bloc intégré dans le flux de page.

Attendu :
- la bannière doit être **flottante** sur la page d'accueil, comme une pub / mise en avant
  commerciale ;
- elle doit être **visuellement détachée** du contenu principal ;
- elle doit servir d'**entrée marketing**, pas de tunnel direct.

### 2. Routage des 3 CTA de la bannière

Les CTA « Entretien chaudière », « Poêle ou insert » et « Ramonage » ne doivent plus ouvrir
directement le tunnel ni retomber sur l'écran « Vous avez une demande en cours ».

Attendu : les 3 CTA ramènent vers la page Chauffage `/chauffagiste-saint-omer.html`. Des ancres sur
cette page sont possibles, mais la destination canonique reste la page Chauffage.

### 3. Logique voulue

Accueil → bannière promo → page Chauffage → choix des prestations → tunnel seulement ensuite si
nécessaire. La bannière accueil = porte d'entrée marketing ; la page Chauffage = porte d'entrée
métier ; le tunnel = étape transactionnelle, jamais directement depuis cette bannière.

### 4. Page Chauffage

Recréer / remettre en avant les prestations **avec photos** : des blocs/cartes prestations visuels
avec photos, pas un ressenti de module promo/tunnel. Notamment Chaudière, Dépannage urgence,
Entretien annuel, et si le parcours le nécessite les entrées Ramonage / Poêle ou insert.
L'utilisateur doit comprendre l'offre depuis la page Chauffage, puis cliquer sur la prestation.

### 5. À éviter

- ne pas ouvrir le resume gate depuis la bannière accueil ;
- ne pas envoyer directement au tunnel depuis les 3 boutons de la bannière ;
- ne pas laisser la bannière intégrée comme actuellement dans le flux de page ;
- ne pas transformer la page Chauffage en doublon du tunnel.

## Retour attendu

- ROOT_CAUSE
- OLD_BEHAVIOR
- NEW_HOME_BANNER_BEHAVIOR
- NEW_CTA_TARGETS
- CHAUFFAGE_PRESTATIONS_WITH_PHOTOS
- SCREENSHOTS_HOME_AND_CHAUFFAGE
- TESTS_DESKTOP_MOBILE
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Aucune mise en production.
