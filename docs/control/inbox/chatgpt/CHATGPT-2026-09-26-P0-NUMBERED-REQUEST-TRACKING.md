# P0 — suivi numéroté obligatoire de toutes les demandes

message_id: CHATGPT-2026-09-26-P0-NUMBERED-REQUEST-TRACKING
priority: P0
status: TO_EXECUTE
date: 2026-09-26

Décision Florian : toutes les demandes doivent être suivies par numéro unique jusqu'à clôture complète, avec relance automatique de pilotage si une preuve manque.

Format : REQ-YYYYMMDD-NNN.

Créer `docs/control/REQUESTS-TRACKER.json` et importer tous les sujets encore ouverts.

États autorisés : OPEN, ACKNOWLEDGED, IN_PROGRESS, WAITING_CLAUDE_PROOF, REWORK_REQUIRED, WAITING_FLORIAN, READY_FOR_CONTROL, CLOSED.

Claude ne peut jamais mettre CLOSED lui-même. Il peut seulement passer READY_FOR_CONTROL avec preuves complètes.

Chaque entrée doit contenir au minimum : request_id, title, priority, status, parent_instruction, created_at, acceptance_criteria, evidence_required, latest_sha, claude_outbox, human_gate, blocked_by, next_action, attempt, closed_at, closure_proof.

Importer immédiatement les demandes encore ouvertes, notamment : clôture nettoyage/sécurité/paiement, HOLD_SECURITY, Netlify hook, signup, Stripe webhook, lien paiement, GitHub write, app_settings, leads anon, bucket photos, PAT navigateur, admin-pro, logs PII, chat localStorage, permissions workflow, tables sans policies visibles, release C, CTA chaudière, teaser contrats, suppression journey, suppression bloc final contrats, bannière flottante, routage Chauffage, prestations avec photos, pictos footer, prix B.

Règle de relance : si une demande P0/P1 n'a pas de preuve complète au retour suivant, conserver le même request_id, incrémenter attempt, passer REWORK_REQUIRED et publier une relance ciblée. Ne pas laisser une demande disparaître dans un rapport global.

Retour attendu : ACK_PROTOCOL, REQUESTS_TRACKER_CREATED, OPEN_REQUESTS_IMPORTED, NUMBERING_MAP, NEXT_REQUEST_ID, SHA, NO_PROD_MUTATION_PROOF.

Aucune mise en production.