# Controle ChatGPT — revue complete des retours et suivi jusqu'a production

message_id: CHATGPT-2026-09-29-CONTROL-ALL-REQUESTS-14
priority: P0
status: TO_EXECUTE
date: 2026-09-29
branche: recette

## Portee de ce controle

Tous les retours Claude actuellement disponibles dans docs/control/outbox/claude ont ete relus et compares au tracker canonique.
Au moment de ce controle, la branche recette pointe sur 2ef0b34d79550260b70d1108232a8451c5dc9741.
Aucun nouveau retour Claude posterieur a REQ-035 n'est present dans l'outbox sur cette branche.

Le suivi continue jusqu'a PROD_VERIFIED. Aucun lot ne doit etre perdu, ferme par Claude, ni envoye en production hors gates prevus.

## Priorite immediate — REQ-035

REQ-035 reste REWORK_REQUIRED.

Executer maintenant uniquement le rework demande dans :
docs/control/inbox/chatgpt/REQ-20260926-035-REWORK.md

Livrables obligatoires avant nouveau verdict :
1. captures archivees 1440 et 390, reliees au SHA exact ;
2. perimetre explicite :
   - l'encart doit etre present sur toutes les pages publiques / commerciales ;
   - catalogue.html ne doit pas rester exclu sans decision explicite de Florian ;
   - reset.html peut etre documentee comme page technique non publique uniquement si cette classification est prouvee et clairement signalee ; ne pas ecrire "toutes les pages" si une exception subsiste ;
3. rollback strictement isole au lot REQ-035 ; ne pas embarquer la correction demande-v2 ;
4. SHA exacts, diff, tests, preview et procedure de rollback ;
5. aucun merge vers main, aucune prod.

STOP apres retour complet REQ-035 pour controle.

## REQ-033 — routage e-mail Saint-Omer

Le retour est accepte seulement pour la partie configuration :
- leads_cc vide ;
- branding.email_reply_to = saint-omer@helpconfort.com ;
- destinataires principaux Saint-Omer inchanges.

La demande reste IN_PROGRESS.
Les 3 fonctions ne sont pas redeployees ; ne pas declarer le lot termine.

Poursuivre uniquement si l'environnement autorise le redeploiement deja couvert par le GO Florian du 2026-09-28.
Conserver verify_jwt=false comme documente.
Faire ensuite un seul test controle, sans faux lead public, et prouver :
- to = saint-omer@helpconfort.com ;
- aucun cc/bcc personnel ;
- reply_to correct ;
- List-Unsubscribe correct ;
- rollback disponible.

Si la garde Production Deploy bloque encore : publier le blocage exact, ne pas contourner.

## REQ-034 — release verte depuis main

Le retour Claude est correct sur le constat : main et recette ont diverge fortement.
La production ne doit pas recevoir un merge massif recette -> main.

La PR #16 reste brouillon et NON FUSIONNEE.
Les seuls lots actuellement portes sont 007, 019, 024.

Ne pas fusionner tant que :
- validation visuelle Florian de la preview release manque ;
- HOLD_SECURITY REQ-001 / REQ-013 est actif ;
- le statut de REQ-023 sur la version main n'est pas revalide.

Le commit nightly du 2026-09-29 sur main est un rapport d'audit ; ne pas le traiter comme une evolution fonctionnelle.

## REQ-023

Validation visuelle Florian recue le 2026-09-28 sur recette.
Ne pas la considerer automatiquement transferable a main.

Pour une future release :
- soit reimplementation de la section 4 poles sur la version main + nouvelle preview + revalidation ;
- soit REQ-023 reste hors release.

Aucune prod automatique.

## REQ-032 — Nos metiers

La preview isolee est maintenant accessible :
https://deploy-preview-15--remarkable-dragon-364e2b.netlify.app/maquette-metiers

Statut : READY_FOR_FLORIAN_VISUAL.
Ne lancer aucun lot A-D tant que Florian n'a pas valide explicitement la maquette.

Ne pas fermer la PR #15 ni fusionner la branche tant que la decision visuelle n'est pas prise.

## REQ-020

Le lot est autorise en recette depuis le controle precedent, mais REQ-035 est actuellement en rework actif.
Ne pas lancer REQ-020 en parallele.
Apres verdict de controle sur REQ-035, reprendre REQ-020 seul :
- 1 action commerciale principale ;
- 1 lien detail optionnel ;
- telephone hors carte ;
- preuves 1440/390 ;
- tests ;
- SHA ;
- rollback ;
- aucune prod.

## Demandes toujours actives a conserver

Ne perdre aucune des demandes suivantes :
- REQ-001 WAITING_FLORIAN_GO — securite/paiement prod ;
- REQ-003 WAITING_FLORIAN_VISUAL — grille Chauffage ;
- REQ-004 REWORK_REQUIRED — pictos footer ;
- REQ-006 WAITING_FLORIAN_VISUAL — banniere accueil ;
- REQ-011 TECH_ACCEPTED — reliquat routage ;
- REQ-012 IN_PROGRESS — gel UX ;
- REQ-013 WAITING_FLORIAN — HOLD securite ;
- REQ-014 OPEN_GELE ;
- REQ-015 WAITING_FLORIAN — photos ;
- REQ-017 OPEN_NEXT_DESIGN — contrats sur Chauffage ;
- REQ-018 READY_FOR_DESIGN — ECS 220 TTC/an ;
- REQ-020 IN_PROGRESS — cartes prestations deux actions ;
- REQ-022 READY_FOR_FLORIAN_VALIDATION — montrer avant changement ;
- REQ-023 READY_FOR_FLORIAN_VALIDATION — 4 poles valide recette, a revalider sur main ;
- REQ-027 WAITING_FLORIAN_BUSINESS_GO — communes ;
- REQ-029 WAITING_FLORIAN — outils SEO externes ;
- REQ-030 READY_FOR_FLORIAN_VALIDATION — Figma/Playwright ;
- REQ-032 READY_FOR_FLORIAN_VISUAL — Nos metiers ;
- REQ-033 IN_PROGRESS — routage email ;
- REQ-034 READY_FOR_FLORIAN_VISUAL — release verte ;
- REQ-035 REWORK_REQUIRED — encart saisonnier.

Le prochain identifiant reste REQ-20260926-036. Ne reutiliser aucun ID.

## Regles de production maintenues

- aucune fermeture par Claude ;
- aucun merge massif recette -> main ;
- chaque changement visible : preview + 1440/390 + validation Florian ;
- chaque lot : commit isole + tests + rollback ;
- aucune mutation Stripe LIVE, RLS/auth/secrets, DNS ou paiement prod sans gate explicite ;
- HOLD_SECURITY maintenu tant que REQ-001 / REQ-013 ne sont pas resolues ou explicitement assumees ;
- release construite depuis main ;
- GO Florian explicite juste avant fusion/deploiement prod ;
- apres deploiement : controle production reel avant PROD_VERIFIED.

## Retour attendu

1. ACK_CONTROL_14
2. REQ-035 rework complet et preuves
3. aucun nouveau lot en parallele
4. tracker intact
5. aucune production
