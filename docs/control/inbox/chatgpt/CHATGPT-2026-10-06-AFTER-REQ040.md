# APRES REQ-040 — finir les vrais écarts avant la refonte visuelle

## REQ-040
Fusionnée dans main au SHA:
`5d475d3813b3efe60117eacdb2c64c8663ed05c7`

### PROD_VERIFY immédiat
Sur `depan59-62.fr/a-propos.html`, en 1440 et 390:
- appel stats_publiques = 200 ;
- aucun 401 stats_publiques ;
- aucune erreur console imputable au site ;
- aucun changement visuel inattendu.
Publier rapport PROD_VERIFY. Si conforme, ChatGPT clôture.

## REQ-041 — « 2 agences » incohérent
La doctrine a déjà été validée et est en production via REQ-023 :
- Saint-Omer = agence ;
- Dunkerque, Calais, Boulogne = pôles d'intervention, PAS des agences.

Ne demande pas un nouveau choix de fond à Florian.
Action :
1. auditer les 12 pages listées ;
2. reprendre EXACTEMENT la terminologie déjà validée sur zones-intervention ;
3. reconstruire lot isolé depuis main courant ;
4. aucun autre texte marketing modifié ;
5. preview 1440/390 sur au moins a-propos, contact, une page métier ;
6. recherche globale après correction : 0 occurrence publique de « 2 agences » ou formulation équivalente fausse ;
7. rollback exact ;
8. PASS/BLOCKED.
Si PASS, STOP merge ChatGPT.

## Clé publique révoquée — 6 autres fichiers
Ne fais PAS un remplacement global.

Classer :
### Sûr potentiel
- assets/hc-newsletter.js
- assets/hc-chat-widget.js
Audit fonctionnel précis. Si ces parcours sont purement newsletter/chat sans auth/paiement sensible, ouvrir un lot isolé avec correction de clé publique + preuve E2E non destructive.

### SENSIBLE — ne pas toucher sans GO spécifique
- espace-client.html
- espace-client-dashboard.html : AUTH
- assets/hc-reserve-modal.js
- index.html : paiement / stripe-create-payment-link

Pour ces 4 fichiers : audit read-only uniquement, documenter impact, aucune mutation.

## REQ-020
Préparer l'avant/après visuel demandé :
- actuel = Réserver + Devis + appel ;
- proposition = Réserver + Devis, appel conservé dans header/sticky mobile.
Captures 1440/390. Aucun merge sans verdict Florian.

## REQ-027
Préparer UNE question compacte avec les villes à confirmer :
Boulogne-sur-Mer, Le Portel, Outreau, Saint-Martin-Boulogne, Wimereux, Saint-Pol-sur-Mer, Aire-sur-la-Lys.
Réponse attendue pour chacune : DESSERVIE / NON DESSERVIE.
Ne rien muter.

## REQ-033
Rafraîchir seulement le delta exact des 3 edge functions et le rollback. Pas de déploiement sans GO sensible explicite.

## REQ-035
Le lot est techniquement prouvé. Fournir une seule planche visuelle claire 1440 + 390 à Florian. Pas de nouvelle rework tant qu'il n'a pas dit OUI/NON/À REVOIR.

## REQ-001 / 013
Aucune mutation. Résumer les GO sensibles encore nécessaires, sans secret.

## Objectif
Nettoyer tous les lots sûrs jusqu'à PROD_VERIFIED. Les seuls éléments qui peuvent rester ouverts à la fin doivent être de vrais HUMAN_GATE ou SENSITIVE_GATE.
