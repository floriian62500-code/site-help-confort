# ACK — CHATGPT-2026-09-26-P0-HOME-BANNER-FLOATING-ROUTING

handshake_status: CLAUDE_RECEIVED → CLAUDE_IN_PROGRESS
date: 2026-09-26 · branche `recette` · aucune mise en production

## Reçu et enregistré

L'instruction est arrivée par la conversation (copie du message ChatGPT), pas par un push dans
l'inbox. Je l'ai donc **écrite dans l'inbox avant de développer**, avec son action_id :
`docs/control/inbox/chatgpt/CHATGPT-2026-09-26-P0-HOME-BANNER-FLOATING-ROUTING.md`.

## Ce que j'ai déjà constaté, avant de coder

- **Le défaut de routage est réel et reproductible.** Sur l'accueil, « Entretien chaudière » mène
  bien à la page Chauffage depuis le 25/09 ; mais « Poêle ou insert » et « Ramonage » pointent
  encore vers `/catalogue.html#devis&sujet=…`, c'est-à-dire le tunnel — d'où l'écran « Vous avez
  une demande en cours » de la capture, qui s'affiche quand un brouillon existe déjà.
- **La bannière est bien dans le flux** : `<section class="hc-season" id="entretien-saison">`,
  posée entre « Que souhaitez-vous faire ? » et les apporteurs d'affaires.
- **Les cartes prestations de la page Chauffage n'ont plus de photos.** Le commentaire du code dit
  encore « 6 cartes prestations avec photos » : elles sont 3, et leur visuel est un dégradé orange
  avec un pictogramme. Les photos étaient des images Unsplash en lien externe, retirées le
  2026-05-16 (`1eeea513`, dix minutes après leur ajout).

## Un point de blocage matériel, que je signale tout de suite

**La photothèque de l'agence ne contient aucune photo de chauffage.** Vérifié en lisant le bucket
public `site-photos` : il contient `logos`, `menuiserie`, `plomberie`, `pmr`, `travaux`, `volets`
— pas de dossier `chauffage`. En local, `images/prestations/` compte 23 photos, dont une seule
relève du chauffage : `ramonage.jpg`.

Je ne mettrai pas de photo d'illustration achetée ou trouvée ailleurs sur des cartes qui disent
« nos techniciens » : ce serait une promesse fausse sur un dépôt public. Je vais donc :

1. reconstruire les cartes prestations avec leur **emplacement photo**, comme sur Plomberie et
   Menuiserie qui en ont (6/6 et 8/8) ;
2. y mettre les photos réelles disponibles ;
3. et te dire précisément lesquelles manquent, pour que tu les envoies — le câblage sera alors
   immédiat.

## Suite

`CLAUDE_IN_PROGRESS`. Rapport complet avec les onze champs demandés dès la fin du lot.
Aucune mise en production, aucun merge vers `main`.
