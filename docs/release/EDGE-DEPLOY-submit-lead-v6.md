# Runbook deploy edge — `submit-lead-v6` (garde NE PAS TRAITER)

> **NE PAS DÉPLOYER sans GO Florian explicite.** Aucun autre changement edge dans ce deploy.
> Objet : corriger la garde test-lead ordre/champ-dépendante (leads test notifiaient l'agence à tort).

| Champ | Valeur |
|---|---|
| **Fonction** | `submit-lead-v6` |
| **Projet** | `btcbjwqiivhpwoszomhg` (PROD Supabase) |
| **SHA source** | `2a3bd414` (branche `hardening/safe-2026-09`) — fichier `supabase/functions/submit-lead-v6/index.ts` |
| **Diff** | 1 ligne : `isTestLead` teste `${prenom} ${nom} ${nom} ${prenom} ${message}` (2 ordres + message) au lieu de `${nom} ${prenom}` |
| **Variables requises** | déjà présentes : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ; `RESEND_API_KEY` (pour notify, non sollicité par le test) — **aucune nouvelle var** |
| **Commande deploy** | `supabase functions deploy submit-lead-v6 --project-ref btcbjwqiivhpwoszomhg --no-verify-jwt` |

## Test post-deploy UNIQUE, non destructif
Soumettre **un lead marqué par form_type** (nom = « NE PAS TRAITER » ⇒ auto-archivé, **aucun email agence**). Vérifie en un seul passage : (a) row **persistée**, (b) notif **neutralisée**, (c) **contrats** rappel/devis/entretien/demande_metier acceptés (pas de régression).

```bash
# ANON key publique (déjà dans les pages). Aucun email : les leads "NE PAS TRAITER" sont auto-archivés.
SUPA=https://btcbjwqiivhpwoszomhg.supabase.co ; ANON="<clé publishable publique>"
for FT in rappel devis_express demande_metier wizard_urgence contact_complet ; do
  curl -s -X POST "$SUPA/functions/v1/submit-lead-v6" -H "Content-Type: application/json" -H "apikey: $ANON" \
    -d "{\"prenom\":\"NE PAS\",\"nom\":\"TRAITER\",\"telephone\":\"0612345678\",\"email\":\"e2e@example.com\",\"code_postal\":\"62500\",\"ville\":\"Saint-Omer\",\"adresse\":\"1 rue Test\",\"metier\":\"Plomberie\",\"message\":\"NE PAS TRAITER — post-deploy $FT\",\"form_type\":\"$FT\"}" \
    | grep -q '"success":true' && echo "  $FT: 200 OK (persisté + archivé)" || echo "  $FT: ECHEC" ;
done
```
**Attendu** : 5× `200 OK`. Puis vérifier en base (lecture) que ces rows ont `status='archive'` (persistées + neutralisées) — et **confirmer côté boîte agence qu'AUCUN email n'est arrivé**. Ce sont des marqueurs « NE PAS TRAITER » : nettoyage optionnel `delete from leads where message ilike '%post-deploy%';`.

> Note : le cas discriminant du bug (prénom=TEST / nom=RECETTE) est déjà couvert unitairement (`notify-lead.test.mjs`) ; en prod on valide surtout persistance + neutralisation + acceptation des contrats.

## Rollback exact
```bash
git checkout <SHA_precedent> -- supabase/functions/submit-lead-v6/index.ts
supabase functions deploy submit-lead-v6 --project-ref btcbjwqiivhpwoszomhg --no-verify-jwt
git checkout hardening/safe-2026-09 -- supabase/functions/submit-lead-v6/index.ts   # restaure la version corrigée en local
```
`<SHA_precedent>` = tip recette avant merge (la version actuellement déployée). Risque du deploy = **nul fonctionnellement** (la garde devient seulement plus stricte : plus de leads test notifiés) ; aucune perte de lead réel (persistance inchangée).
