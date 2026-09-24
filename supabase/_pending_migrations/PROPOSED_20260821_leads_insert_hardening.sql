-- PROPOSITION (NON APPLIQUÉE — gate humain). Durcit l'INSERT anon sur leads.
-- Objectif : forcer tous les leads via l'edge function submit-lead (service_role + validation + anti-spam),
-- au lieu d'un INSERT anon direct qui contourne la validation.
-- ⚠️ Vérifier AVANT d'appliquer qu'aucun formulaire front ne poste en direct sur /rest/v1/leads.

-- Option A (recommandée) : retirer l'INSERT anon direct (les leads passent par l'edge en service_role).
-- drop policy if exists leads_public_insert on public.leads;

-- Option B (moins strict) : conserver l'INSERT anon mais borner (ex. champs obligatoires + longueur),
-- et ajouter du rate-limiting côté edge/proxy. (À concevoir selon besoin réel des formulaires.)

-- Aucune action DDL active dans ce fichier : proposition à valider puis décommenter l'option retenue.
