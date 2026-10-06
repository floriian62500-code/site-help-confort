# EXECUTION DIRECTE — finir le backlog utile jusqu'à PROD_VERIFIED

Décision Florian : arrêter les détours. Priorité = aligner la production avec tout ce qui est déjà validé et applicable. La refonte visuelle moderne reste gelée jusqu'à cet alignement.

## Etat acté par ChatGPT
- REQ-008 CLOSED NOT_APPLICABLE.
- REQ-009 CLOSED NOT_APPLICABLE.
- REQ-011 CLOSED NOT_APPLICABLE.
- REQ-026 CLOSED CONTROL_ONLY.
- REQ-034 CLOSED CONTROL_ONLY.
- REQ-039 fusionnée dans main au SHA 0f59c7550b45ef69ec804c50a20f130bd1f52144 ; faire PROD_VERIFY maintenant.
- REQ-035 : preuve technique conforme, reste seulement verdict visuel Florian.
- REQ-040 : sensible Supabase/RLS, audit lecture seule uniquement sans GO.

## Ordre strict

### 1. REQ-039 — maintenant
Dès que le domaine public sert le merge :
- scan 117 pages à 390 réel ;
- 0 page avec overflow >1 px ;
- vérifier les 4 échantillons 1440/390 ;
- composants fonctionnels ;
- console ;
- publier rapport PROD_VERIFY.
Si conforme : ChatGPT clôture.

### 2. Reprendre les vrais écarts non prod, un par un
Auditer immédiatement, contre main courant + domaine public, dans cet ordre :
- REQ-003
- REQ-004
- REQ-006
- REQ-014
- REQ-015
- REQ-018
- REQ-020
- REQ-022
- REQ-027
- REQ-029
- REQ-030
- REQ-032
- REQ-033
- REQ-035
- REQ-040
- REQ-001/013

Pour chacun, publier une ligne dans FLORIAN-VALIDATIONS.md seulement si Florian doit réellement décider.

## Règles
- Si le besoin est déjà satisfait en prod : proposer clôture avec preuve actuelle.
- Si applicable et non sensible : reconstruire depuis main courant, preview, preuves, PASS/BLOCKED. ChatGPT merge.
- Si visuel : fournir capture/preview actuelle ; ne demander qu'un choix OUI/NON/À REVOIR.
- Si métier : question précise, pas de long rapport.
- Si sensible : audit read-only, delta/risque/rollback, GO exact requis.
- Ne pas commencer le benchmark/refonte moderne avant que ce backlog utile soit nettoyé et que tous les lots sûrs validés soient PROD_VERIFIED.
- Ne jamais demander à Florian de transmettre des instructions.
