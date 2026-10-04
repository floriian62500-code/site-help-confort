# PRIORITÉ CAMPAGNE CHAUFFAGE — funnel conversion complet

Contexte : campagne Google Ads active. Toute la partie Chauffage devient prioritaire jusqu'à validation production.

## Objectif métier

Un visiteur venant de la campagne doit pouvoir, sans blocage :
1. comprendre immédiatement l'offre Chauffage ;
2. appeler le 03 66 10 01 34 ;
3. demander à être rappelé / demander un devis ;
4. voir les formules BASIC / CONFORT / SÉCURITÉ directement sur la page Chauffage ;
5. basculer Gaz / Fioul / Adoucisseur ;
6. choisir une formule ;
7. arriver sur la page Contrats avec énergie + formule conservées ;
8. ouvrir la souscription ;
9. envoyer une vraie demande qui arrive dans le pipeline leads et déclenche la notification agence.

## Blocage immédiat observé

La page publique a encore servi l'ancien teaser sombre alors que le module complet est présent dans main.

Hotfix : PR #25
Head : `1942a6bb5c615f3c5aa62f3963a22ebb768d1e07`
Objet : cache-bust des assets `hc-contrats.css/js` + nouveau déploiement HTML.

## Contrôle PR #25 obligatoire

Dès que Netlify est verte :
- vérifier `/chauffagiste-saint-omer` en 1440 et 390 ;
- prouver que l'ancien teaser sombre a disparu ;
- prouver que Gaz / Fioul / Adoucisseur sont visibles ;
- prouver BASIC / CONFORT / SÉCURITÉ ;
- prouver TTC principal ;
- prouver absence d'overflow horizontal ;
- prouver console sans erreur bloquante ;
- STOP et laisser ChatGPT merger.

## Contrôle funnel production après merge #25

### A. Entrées de conversion
- bouton Appeler : `tel:0366100134` fonctionnel ;
- CTA Demander une intervention / devis fonctionnel ;
- CTA Être rappelé fonctionnel ;
- source_page et UTM conservés dans le payload des formulaires.

### B. Contrats
- formules visibles directement sur Chauffage ;
- choix formule → `/contrats-entretien.html?energie=...&formule=...#formules` ;
- énergie et formule conservées ;
- carte choisie mise en évidence ;
- ouverture modale correcte ;
- prix TTC cohérent entre page Chauffage, page Contrats et modale.

### C. Lead
- endpoint `submit-lead-v6` actif ;
- notification `notify-lead-v6` active ;
- vérifier le code/pipeline sans créer de faux lead commercial par défaut ;
- si un test réel est nécessaire, utiliser une identité clairement marquée `TEST RECETTE - NE PAS TRAITER` afin que la logique serveur archive le lead et supprime la notification agence ;
- vérifier réponse HTTP 200 + id de lead + upload token ;
- vérifier que le lead test est archivé si test effectué ;
- vérifier aucun doublon.

### D. Mobile 390
- aucun débordement ;
- CTA visibles sans chevauchement ;
- module contrats exploitable au doigt ;
- modale entièrement utilisable.

## Ordre

1. PR #25 preview PASS
2. ChatGPT merge #25
3. Netlify production
4. PROD_VERIFY funnel Chauffage complet
5. seulement ensuite reprendre les sujets non liés à la conversion Chauffage.

Aucun autre sujet n'est prioritaire tant que ce funnel n'est pas PASS production.
