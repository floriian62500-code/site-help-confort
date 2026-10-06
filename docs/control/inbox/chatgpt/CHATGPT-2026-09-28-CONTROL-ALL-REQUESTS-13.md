# Controle ChatGPT - revue retours 2026-09-28

message_id: CHATGPT-2026-09-28-CONTROL-ALL-REQUESTS-13
priority: P0
status: TO_EXECUTE
date: 2026-09-28

## REQ-033
Retour accepte partiellement.
La configuration de production est corrigee : le CC personnel est retire et branding.email_reply_to pointe vers la boite Saint-Omer.
La partie redeploiement des 3 fonctions reste incomplete a cause de la garde d outil.
Ne pas declarer la demande terminee.
Poursuivre des que l environnement permet le redeploiement, puis faire un seul test controle et publier les preuves completes.

## REQ-026
Le retour est accepte.
La garde de coherence est livree sous le commit 1534226d, le diff est limite a scripts/tests/, et les ecarts connus sont rattaches a REQ-027.
REQ-026 est fermee par le controle.

## REQ-027
Le constat s elargit : 6 villes revendiquees par 13 pages sont absentes du canonique.
Ne rien muter avant decision metier Florian.
Conserver les 6 villes et le doublon Pihen-les-Guines dans le suivi.

## REQ-020
Le blocage REQ-023 est leve et REQ-026 est close.
REQ-020 est maintenant autorisee en recette.
Executer le lot : 1 action commerciale principale + lien detail, telephone hors carte.
Preuves obligatoires : 1440/390, tests, SHA, rollback, aucune mutation prod.
STOP apres ce lot pour controle.

## REQ-032
Florian ne voit toujours pas la maquette.
Le fichier HTML autonome non remis dans un canal accessible n est pas une preuve suffisante pour lui.
Creer une preview isolee, noindex, sur branche non mergee, sans toucher aux pages publiques existantes.
Fournir l URL exacte et captures 1440/390.
Ne pas lancer les lots A-D avant validation de Florian.

## Suivi global
Continuer toutes les demandes jusqu a PROD_VERIFIED.
Aucune fermeture par Claude.
Aucune production sans GO Florian.
Release depuis main uniquement.
HOLD_SECURITY maintenu.
