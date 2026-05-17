# ⏱️ Audit délais d'intervention promis — Sonde IA #43

*Généré le 2026-05-17 06:24 — `admin-pro/audits/audit_delais.py`*

**Pages scannées** : 45
**Findings (promesses commerciales détectées)** : **66**
**Pages concernées** : 21

## 🎯 Contexte

Décision Florian 15 mai 2026 : retirer tous les délais d'intervention promis du site. Tout engagement chiffré (« sous 1h », « rappel sous 30 min », « réponse en moins de 2h ») crée une obligation contractuelle non tenable en cas de surcharge / aléa. Source : MEMOIRE_IA addendum v9, sonde #43.

## 📊 Synthèse

| Pattern | Occurrences |
|---------|-------------|
| engagement « sous X (h/min) » | 45 |
| engagement « rappel sous … » | 19 |
| engagement « intervention sous X » | 2 |

## 📋 Findings détaillés

| Fichier | Ligne | Pattern | Match | Contexte |
|---------|------:|---------|-------|----------|
| `a-propos.html` | 865 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `actualites.html` | 807 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `chauffagiste-saint-omer.html` | 1370 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `chauffagiste-saint-omer.html` | 1370 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `chauffagiste-saint-omer.html` | 1370 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `chauffagiste-saint-omer.html` | 1912 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-saint-omer.html` | 2395 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-saint-omer.html` | 1912 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `contact.html` | 970 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …> · Renseignez le formulaire et nous validons votre dossier sous 24h.</p> </div> <form id="sousForm" onsubmit="return submi… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …oordonnées</h4> <p class="sw-step-hint">Pour vous rappeler sous 24h et envoyer votre contrat.</p> </div> <div style="display:… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …ons puis envoyez votre demande. Un conseiller vous rappelle sous 24h pour planifier la visite technique.</p> </div> <div cl… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …ata-validate="checked"> <span>J'accepte d'être contacté(e) sous 24h pour finaliser mon contrat. Je reconnais que ce formulaire… |
| `contrats-entretien.html` | 925 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 1044 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 410 | engagement « intervention sous X » | `Intervention sous 1` | …="item"><span class="dot" style="background:#FF6B1A"></span>Intervention sous 1h30 sur Dunkerque</span> <span class="item"><span class="do… |
| `depannage-saint-omer.html` | 1054 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `electricien-saint-omer.html` | 1122 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-saint-omer.html` | 1166 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `electricien-saint-omer.html` | 1166 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `electricien-saint-omer.html` | 1166 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `electricien-saint-omer.html` | 2143 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `faq.html` | 214 | engagement « sous X (h/min) » | `sous 24h` | …as votre réponse&nbsp;?</h3> <p>Notre équipe vous rappelle sous 24h ouvrées avec une réponse personnalisée.</p> <a href="conta… |
| `guide-fuite-eau.html` | 455 | engagement « sous X (h/min) » | `Sous 24h` | …uite simple (joint d'évier, mitigeur usé)</li> <li><strong>Sous 24h</strong> dans tous les cas — même si vous avez « réparé&nbs… |
| `index.html` | 2450 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `mentions-legales.html` | 731 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `menuisier-saint-omer.html` | 1183 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `menuisier-saint-omer.html` | 1183 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `menuisier-saint-omer.html` | 1183 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `menuisier-saint-omer.html` | 2295 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `plombier-saint-omer.html` | 1186 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `plombier-saint-omer.html` | 1186 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `plombier-saint-omer.html` | 1186 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `plombier-saint-omer.html` | 2294 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-saint-omer.html` | 929 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `pmr-saint-omer.html` | 1140 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `pmr-saint-omer.html` | 1140 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `pmr-saint-omer.html` | 1140 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `pmr-saint-omer.html` | 2035 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `realisations.html` | 1107 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `serrurier-saint-omer.html` | 1178 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `serrurier-saint-omer.html` | 1178 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `serrurier-saint-omer.html` | 1178 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `serrurier-saint-omer.html` | 2284 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `travaux-saint-omer.html` | 1153 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `travaux-saint-omer.html` | 1153 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `travaux-saint-omer.html` | 1153 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `travaux-saint-omer.html` | 2061 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `vitrier-saint-omer.html` | 1153 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `vitrier-saint-omer.html` | 1153 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `vitrier-saint-omer.html` | 1153 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `vitrier-saint-omer.html` | 2106 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `volets-saint-omer.html` | 1164 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `volets-saint-omer.html` | 1164 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `volets-saint-omer.html` | 1164 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `volets-saint-omer.html` | 2136 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `zones-intervention.html` | 790 | engagement « sous X (h/min) » | `Sous 1h` | …span class="z-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> </div> <div class="z… |
| `zones-intervention.html` | 1709 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |

## 🛠️ Procédure de correction

Pour chaque finding :
1. Ouvrir le fichier à la ligne indiquée.
2. Réécrire la phrase pour supprimer le délai chiffré.
   Exemples de réécriture :
   - « intervention sous 1h » → « intervention rapide »
   - « rappel sous 5 min » → « rappel rapide »
   - « réponse en moins de 2h » → « réponse au plus vite »
   - « délai moyen 45 minutes » → (supprimer)
3. Conserver les patterns INFO : `7j/7`, `24h/24`, `Lun-Sam 8h-18h`, garanties.

*Sonde IA #43 — référence MEMOIRE_IA_MAINTENANCE.md addendum v9.*
