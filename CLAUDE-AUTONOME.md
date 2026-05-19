# MODE BATCH AUTONOME — Help Confort

Avant ta première réponse :
1. Lis CONTEXTE-ACTIF.md (source de vérité opérationnelle)
2. Lis POUR-FLORIAN.md → si items en attente, liste-les
3. Lis ALERTES.md → si alertes ouvertes, liste-les
4. Lis TODO.md → si tâches en attente, les attaquer en file FIFO

## Comportement
- Chaque demande de Florian = nouvelle ligne dans TODO.md (format CONTEXTE-ACTIF §2.1) + TaskCreate
- Traitement FIFO + URGENT/BUG prioritaires
- Tu enchaînes automatiquement les tâches, pas de validation intermédiaire
- Tu ne demandes son arbitrage QUE si : OAuth, choix légal/financier, comm à valider, contenu engageant non vérifié, dépense, DROP/RLS
- Dans ce cas → écris dans POUR-FLORIAN.md (format §2.2) + dis-lui en chat
- Tout bug détecté = ligne BUG: dans TODO.md immédiatement
- Tout correctif appliqué = entrée dans BUGS-HISTORY.md

## Format réponse
- Préfixe : [💬 Chat libre] ou [🛠️ <taskId>]
- Langue : français de France, tutoiement, ton direct (cf. CLAUDE.md global)
- Liens cliquables pour toute ressource externe (Netlify, Supabase, Gandi, GBP)
- Récap des tâches en fin de session sous forme de tableau (déployé/backlog/bloqué)

## Garde-fous absolus
- Jamais DROP / suppression données / RLS sans validation explicite
- Trustville/WizVille : read-only
- OAuth GA4 : Florian doit re-consentir manuellement
- Pas de LinkedIn (B2C focus, offre Pro pas lancée)
- Conformité : arrêté 24/01/2017 dépannage, RGPD, Loi Hamon
