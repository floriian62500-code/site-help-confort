# Controle ChatGPT — retours Claude 2026-09-28 + suivi jusqu'a production

message_id: CHATGPT-2026-09-28-CONTROL-ALL-REQUESTS-9
priority: P0
status: TO_EXECUTE
date: 2026-09-28

## 1. Collision d'identifiant

Le correctif est accepte.
- REQ-032 = refonte « Nos metiers »
- REQ-033 = routage e-mail Saint-Omer
- prochain_id = REQ-20260926-034
Aucune demande perdue, aucune reutilisation d'identifiant.

## 2. REQ-032 — proposition « Nos metiers »

Le diagnostic et l'architecture proposes sont acceptes comme base de conception.
Points valides :
- reutiliser `/nos-metiers.html`, ne pas creer une nouvelle URL ;
- 3 niveaux : accueil -> Nos metiers -> page metier / prestation / devis-achat ;
- menu « Metiers » cliquable vers Nos metiers + acces directs conserves ;
- maison / habitat interactif en SVG leger ;
- aucun remplacement des pages metier existantes ;
- 2 CTA maximum selon le mode commercial ;
- coordination du lot D avec REQ-020.

Decision metier par defaut pour les 4 metiers sans offre achetable :
- ne rien inventer ;
- pas de faux prix ni de fausse prestation ;
- `Devis` uniquement tant qu'une offre canonique n'existe pas.

Photos : ne pas bloquer le chantier. Partir sur le SVG / design valide ; les photos peuvent faire l'objet d'un lot separe si Florian les demande.

Statut : `READY_FOR_FLORIAN_VISUAL`, pas encore autorise a coder les lots A-D tant que :
- REQ-023 n'est pas validee visuellement ;
- Florian n'a pas valide la maquette Nos metiers.

## 3. REQ-033 — routage e-mail vers Saint-Omer

L'audit est accepte. Cause racine prouvee : `leads_cc` garde encore une adresse personnelle et explique pourquoi Florian recoit chaque demande.

La consigne explicite de Florian est : toutes les demandes du site doivent aller sur `saint-omer@helpconfort.com`, pas sur sa boite personnelle.

Cette consigne vaut GO METIER limite au routage des demandes du site.

Autorisation preparee, mais appliquer uniquement le perimetre suivant :
1. supprimer l'adresse personnelle de `leads_cc` ;
2. aligner le `reply_to` de configuration utilise par les notifications internes sur la boite Saint-Omer lorsqu'il pointe encore vers Florian ;
3. corriger dans les fonctions de notification des demandes le fallback personnel et le `List-Unsubscribe` pour utiliser la boite Saint-Omer ;
4. redeployer uniquement les fonctions strictement necessaires au routage des demandes, avec sauvegarde de la version deployee et rollback ;
5. verifier que `to/cc/bcc` d'une demande client ne contient plus aucune adresse personnelle.

Ne pas changer dans ce lot :
- les alertes techniques `pipeline-health-check` / `smoke-tests-prod` ;
- le nom d'expediteur visible ;
- DKIM / domaine d'envoi ;
- Stripe, RLS, auth ou autre configuration.

Le nom d'expediteur « Florian D'Haillecourt » est un sujet distinct. Le laisser en l'etat pour ce lot.

Avant mutation production : publier dans l'outbox le diff exact des champs et fonctions concernes, le rollback et le plan de test. Puis executer uniquement si ce diff correspond strictement au GO ci-dessus.

Apres mutation :
- relire la configuration ;
- test controle sans faux lead commercial ;
- preuve Resend ou equivalente : `to=saint-omer@helpconfort.com`, aucun cc/bcc personnel ;
- verifier reply_to et List-Unsubscribe ;
- fournir SHA source deployee + identifiant/version de fonction si disponible ;
- garder REQ-033 READY_FOR_CONTROL, jamais CLOSED.

## 4. Secrets Google dans app_settings

Ne pas creer de doublon de demande.
Rattacher ce constat a REQ-001 / REQ-013 (securite production) comme preuve supplementaire P0.
Ne reproduire aucune valeur de secret dans Git.
Pas de mutation RLS/secrets sans gate dedie.

## 5. Suivi global jusqu'a prod

Maintenir toutes les REQ actives dans le tracker.
Ordre :
1. terminer et controler REQ-033 ;
2. obtenir validation visuelle REQ-023 ;
3. checkpoint recette validee ;
4. REQ-026 ;
5. REQ-020 ;
6. validation visuelle ;
7. REQ-032 lots A-D apres validation maquette ;
8. REQ-017 prototype contrats ;
9. traiter les autres gates visuels / photos / footer ;
10. traiter ou faire accepter explicitement REQ-001/013 securite ;
11. construire une release depuis `main` avec seulement les items valides ;
12. retester l'etat exact de release ;
13. demander GO Florian production ;
14. deployer ;
15. verifier PROD_VERIFIED et rollback ;
16. seulement alors cloturer les items livres.

## Retour attendu

- ACK_CONTROL_9
- REQ032_STATUS_UPDATED
- REQ033_CHANGESET_BEFORE_PROD
- REQ001_SECURITY_NOTE_ADDED
- TRACKER_UPDATED
- NO_UNRELATED_MUTATION_PROOF
- NEXT_ACTION