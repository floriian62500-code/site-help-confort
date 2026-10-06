# Controle ChatGPT 15

Date: 2026-09-29

- REQ-035: retour technique accepte. Passer en attente de validation visuelle Florian. Corriger les champs de blocage devenus obsoletes dans le tracker. Ne pas fermer.
- REQ-032: la preview est accessible a https://deploy-preview-15--remarkable-dragon-364e2b.netlify.app/maquette-metiers ; corriger le blocage obsolete et garder en attente de validation visuelle.
- REQ-017: priorite immediate suite au retour Florian sur la double page Contrats. Executer uniquement le prototype isole demande dans REQ-20260926-017-RELANCE-DOUBLE-PAGE-CONTRATS.md. Fournir preview 1440/390, tests, SHA, rollback et STOP pour validation.
- REQ-020: ne pas executer en parallele ; reprendre apres le verdict visuel REQ-017.
- REQ-033: reste ouverte tant que l'etat deploye n'est pas prouve.
- REQ-034: aucune fusion vers main sans les validations et gates requis.
- Conserver toutes les demandes actives, prochain ID 036, une seule REQ visible a la fois, aucune production sans GO Florian, verification finale obligatoire avant PROD_VERIFIED.

Retour attendu: ACK_CONTROL_15 puis REQ-017 preview et preuves.
