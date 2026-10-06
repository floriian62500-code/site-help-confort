# Instruction ChatGPT — arrêt fonctionnel, nettoyage et sécurisation en profondeur

message_id: CHATGPT-2026-09-25-P0-DEEP-CLEAN-SECURE
priority: P0
status: TO_EXECUTE
date: 2026-09-25
needs_human: false

## Décision Florian

Claude doit arrêter rapidement les développements fonctionnels en cours.

À partir de maintenant :
- ne plus ouvrir de nouveau gros lot fonctionnel ;
- ne plus ajouter de nouvelle feature ;
- ne plus élargir le périmètre métier ;
- se concentrer sur le nettoyage, la cohérence du dépôt, la réduction des risques et la sécurisation en profondeur.

Cette mission se fait sur recette / branches techniques uniquement.
Aucune mutation production sans gate explicite.

## Objectif

Rendre le dépôt et le flux de livraison :
- propres ;
- cohérents ;
- reproductibles ;
- minimaux ;
- sûrs ;
- faciles à auditer ;
- sans dette cachée évidente.

## 1. Nettoyage dépôt

Faire un audit complet et corriger ce qui est prouvé inutile ou dangereux :

- copies de conflits iCloud ;
- fichiers doublons ;
- workflows doublons ;
- fichiers temporaires ;
- autosaves non nécessaires ;
- branches d'essai obsolètes ;
- scripts morts prouvés ;
- références Git incohérentes ;
- fichiers générés suivis par erreur ;
- données de test ou artefacts de debug ;
- anciens fichiers de migration proposés placés au mauvais endroit ;
- fichiers de contrôle obsolètes ou contradictoires.

Ne rien supprimer sans preuve d'absence d'usage.

## 2. Sécurité GitHub / CI / dépôt

Contrôler en profondeur :

- aucun secret, token, clé API ou credential committé ;
- aucun workflow inattendu ou copie de workflow ;
- permissions GitHub Actions minimales ;
- aucun job capable de déployer ou écrire en production sans gate ;
- aucune branche technique avec comportement de déploiement implicite ;
- aucun force-push automatisé ;
- aucune commande destructive non protégée ;
- aucun fichier de configuration sensible exposé ;
- aucune fuite de variables ou logs sensibles.

Produire la liste des risques trouvés + correction + preuve.

## 3. Sécurité applicative

Sans toucher à la production, auditer le code présent sur recette :

- auth ;
- contrôles d'accès ;
- RLS / politiques préparées ;
- endpoints sensibles ;
- fonctions edge ;
- endpoints Stripe ;
- écriture GitHub ;
- formulaires publics ;
- anti-spam / rate limit si applicable ;
- validation serveur ;
- données personnelles ;
- stockage local/session ;
- exposition de données ;
- logs contenant des données personnelles.

Ne déployer aucun durcissement sensible.
Préparer seulement les correctifs et gates nécessaires.

## 4. Nettoyage flux release

Finaliser le control-plane :

- CURRENT-RELEASE.json cohérent avec l'état réel ;
- une seule release active ;
- branches d'essai clairement séparées ;
- branches de release créées depuis main ;
- aucun merge global recette -> main ;
- états de fonctionnalités cohérents ;
- validations reliées à SHA/build dès que le mécanisme est prêt ;
- anti-dérive réellement bloquant ;
- aucun document contradictoire encore présenté comme source de vérité.

## 5. Tests de propreté obligatoires

Ajouter ou compléter des tests automatiques pour détecter au minimum :

- copie de conflit ;
- workflow dupliqué ;
- secret pattern évident ;
- fichier de migration mal placé ;
- branche/release incohérente ;
- fichier généré modifié par simple import ;
- URL redirigée recréée par un générateur ;
- source de vérité release contradictoire ;
- tests qui écrivent dans le dépôt ;
- script qui modifie des fichiers à l'import.

Les tests doivent échouer contre un cas volontairement cassé et passer après correction.

## 6. Réduction du bruit

Identifier les mécanismes qui génèrent du bruit inutile :
- commits automatiques ;
- rapports nightly trop volumineux ;
- fichiers régénérés sans valeur ;
- logs ou docs auto-créés ;
- artefacts qui gonflent recette sans effet fonctionnel.

Proposer une réduction mesurée de ce bruit sans perdre les contrôles utiles.

## 7. Revue sécurité finale

À la fin, publier une matrice :

- CRITIQUE
- HAUT
- MOYEN
- FAIBLE
- ACCEPTÉ / À FAIRE / BLOQUÉ_HUMAIN

Pour chaque point :
- preuve ;
- fichier / SHA ;
- risque ;
- correction ;
- test ;
- rollback ;
- besoin de gate humain ;
- impact prod éventuel.

## 8. Interdictions

- aucune nouvelle feature ;
- aucun déploiement production ;
- aucun merge vers main ;
- aucune mutation Supabase/RLS prod ;
- aucun Stripe LIVE ;
- aucun changement DNS ;
- aucun secret modifié sans gate ;
- aucun nettoyage destructif sans preuve ;
- aucun changement métier non demandé.

## 9. Condition d'arrêt

Claude doit s'arrêter après :
1. nettoyage du dépôt ;
2. corrections de sécurité non sensibles sur recette ;
3. préparation des correctifs sensibles sans exécution ;
4. tests de non-régression ;
5. rapport de sécurité consolidé.

Ensuite : STOP et attendre contrôle ChatGPT / décision Florian.

## Retour attendu

Publier dans docs/control/outbox/claude/ :

- ACK
- INVENTAIRE_NETTOYAGE
- FICHIERS_SUPPRIMES_OU_CONSERVES
- RISQUES_SECURITE
- CORRECTIONS_EFFECTUEES
- CORRECTIONS_PREPAREES_NON_DEPLOYEES
- TESTS_PROPRETE
- TESTS_SECURITE
- WORKFLOWS_AUDIT
- SECRETS_AUDIT
- RELEASE_CONTROL_AUDIT
- MATRICE_RISQUES
- NO_PROD_MUTATION_PROOF
- SHA_FINAL
- NEXT_ACTION = STOP_WAIT_CHATGPT

Aucune mise en production.
