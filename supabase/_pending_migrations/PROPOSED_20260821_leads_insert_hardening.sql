-- PROPOSITION (NON APPLIQUÉE — gate humain). Durcit l'INSERT anon sur leads.
-- Objectif : forcer tous les leads via l'edge function submit-lead (service_role + validation + anti-spam),
-- au lieu d'un INSERT anon direct qui contourne la validation.
-- ⚠️ Vérifier AVANT d'appliquer qu'aucun formulaire front ne poste en direct sur /rest/v1/leads.

-- Option A (recommandée) : retirer l'INSERT anon direct (les leads passent par l'edge en service_role).
-- drop policy if exists leads_public_insert on public.leads;

-- Option B (moins strict) : conserver l'INSERT anon mais borner (ex. champs obligatoires + longueur),
-- et ajouter du rate-limiting côté edge/proxy. (À concevoir selon besoin réel des formulaires.)

-- Aucune action DDL active dans ce fichier : proposition à valider puis décommenter l'option retenue.

-- ─────────────────────────────────────────────────────────────────────────────
-- 2026-09-26 — LA VÉRIFICATION DEMANDÉE A ÉTÉ FAITE, l'option A devient applicable.
--
-- Ce fichier attendait une preuve : « vérifier AVANT d'appliquer qu'aucun formulaire front ne poste
-- en direct sur /rest/v1/leads ». Mesure du 2026-09-26 sur l'ensemble du dépôt :
--
--   grep -rn "rest/v1/leads" --include=*.html --include=*.js
--   → une seule occurrence, et c'est un COMMENTAIRE dans devis-express.html:372 qui constate que
--     l'ancien POST direct « était rejeté par la RLS => 0 lead devis-express ».
--   grep -rho "functions/v1/submit-lead[a-z0-9-]*"
--   → 7 occurrences, toutes vers submit-lead-v6.
--
-- Autrement dit : les sept formulaires du site passent par la fonction edge (service_role,
-- validation, honeypot, limite de débit). L'INSERT anonyme direct ne sert à personne — il n'ouvre
-- qu'une voie de contournement de toutes ces protections.
--
-- L'option A est donc décommentée ci-dessous. Elle reste NON APPLIQUÉE : ce dossier n'est pas
-- déployé automatiquement, et la décision appartient à Florian.

drop policy if exists leads_public_insert on public.leads;

-- ── RETOUR ARRIÈRE (exact), si un formulaire oublié se manifestait :
--   create policy leads_public_insert on public.leads
--     for insert to anon with check (status = 'nouveau' and assigned_to is null);
--
-- ── COMMENT LE VÉRIFIER APRÈS APPLICATION, sans écrire de vraie donnée :
--   une requête d'insertion avec la clé publiable doit répondre 401/403 au lieu de 201 ;
--   un envoi normal depuis un formulaire du site doit continuer à créer le lead.
--
-- ── INTERRUPTION DE SERVICE : aucune.
