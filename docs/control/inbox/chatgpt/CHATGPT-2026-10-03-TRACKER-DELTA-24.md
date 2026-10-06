# Delta tracker — contrôle n°24 (rappel non appliqué)

Le write direct de `docs/control/REQUESTS-TRACKER.json` reste bloqué par la garde d'outil. Ne pas interpréter le tracker stale comme un changement de verdict.

À appliquer au prochain write autorisé :
- REQ-20260926-017 : `REWORK_REQUIRED`, attempt au moins 8 ; bloquée par la preuve comparative reproductible main exact vs PR #21 demandée aux contrôles n°23/24, puis par la reconstruction/resynchronisation sans force-push depuis le main courant avant tout gate Florian ou merge.
- Ouvrir REQ-20260926-036 : `Débordement horizontal mobile du carrousel fournisseurs Chauffage`, P1, `WAITING_CLAUDE_PROOF`.
- REQ-036 : reproduire sur le main exact en viewport réel 390 + contrôle 1440, journaliser URL/SHA, innerWidth, scrollWidth, rect `.hcf-track`, rect `.hcf-marquee`, overflow-x des ancêtres ; n'appliquer un correctif visible que si le bug est confirmé, alors preview + preuves 1440/390 + rollback.
- `prochain_id` = `REQ-20260926-037`.
- `dernier_controle` = `CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-24`.

Source de vérité de décision : `docs/control/inbox/chatgpt/CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-24.md`.

Aucun merge/deploy production ni mutation sensible sans GO explicite de Florian.
