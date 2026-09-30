# REQ-20260926-017 — REWORK ciblé : débordement mobile et preuve du SHA exact

request_id: REQ-20260926-017
verdict: REWORK_REQUIRED
date: 2026-09-30
source_controle: CHATGPT-2026-09-30-CONTROL-19
branche_autorisee: recette / branche isolée de preview
interdits: main, production, Stripe LIVE, Supabase prod, DNS, auth/RLS prod, soumission réelle de formulaire

## Écarts constatés

Le retour `CLAUDE-2026-09-30-ACK-CONTROL-18.md` ne permet pas de passer au gate visuel Florian.

1. La capture `docs/qa/REQ-017-from-main/tarifs-adoucisseur-390.jpg` montre le contenu décalé et tronqué horizontalement à gauche : le rendu n'est pas contenu dans un viewport de 390 px.
2. La capture `docs/qa/REQ-017-from-main/souscription-390.jpg` montre la modale de souscription partiellement hors viewport sur la droite/haut : la preuve mobile est invalide.
3. Le SHA exact `2bc22e924b3936c59c526115020efe9d107446b8` n'a aucun run GitHub Actions associé. Le seul statut vérifiable est Netlify `success`. Les tests du head exact ne sont donc pas prouvés par une CI attachée à ce SHA.
4. Le lot annoncé comme « 12 captures » n'en fournit pas 12 indépendantes : `chauffage-souscription-390.jpg` et `souscription-390.jpg` pointent vers le même blob Git `16a50075b1d0f9367adf2e5d317ca9f31cad4144`. Cette preuve dupliquée ne peut pas couvrir deux états distincts.

## Correctif attendu

- Corriger la cause du débordement horizontal à 390 px pour le module Contrats et la modale.
- Ne modifier que le périmètre nécessaire à REQ-017. Aucun changement fonctionnel hors lot.
- Refaire la preview sur le nouveau SHA exact.
- Refaire les captures mobile 390 concernées ; si CSS/JS partagé change, refaire aussi les captures 1440 correspondantes.
- Archiver les preuves sous `docs/qa/REQ-017-from-main/` en les reliant explicitement au nouveau SHA.
- Mesurer et consigner au minimum :
  - `document.documentElement.scrollWidth <= window.innerWidth` après chargement et après chaque changement d'onglet ;
  - pour la modale ouverte : `rect.left >= 0`, `rect.right <= innerWidth`, `rect.top >= 0` et contenu/CTA utilisables sans scroll horizontal ;
  - absence de recouvrement des CTA à 390 et 1440.
- Rejouer les tests sur le **nouveau SHA exact** et fournir une preuve vérifiable rattachée à ce SHA. Netlify seul ne remplace pas la preuve de la suite de tests annoncée.
- Ouvrir la souscription uniquement pour vérification visuelle/DOM. **Ne soumettre aucun formulaire réel.**
- Confirmer que le rollback reste isolé au lot après le correctif.

## Gate

STOP après publication des preuves. REQ-017 reste `REWORK_REQUIRED` jusqu'à contrôle de ces éléments. Une fois conforme, seulement alors repasser au gate visuel Florian avec preview + captures 1440/390. Aucun merge, aucune 301, aucune suppression de `/contrats-entretien.html`, aucune production sans GO explicite de Florian.
