# ⏱️ Audit délais d'intervention promis — Sonde IA #43

*Généré le 2026-05-15 13:09 — `admin-pro/audits/audit_delais.py`*

**Pages scannées** : 40
**Findings (promesses commerciales détectées)** : **31**
**Pages concernées** : 17

## 🎯 Contexte

Décision Florian 15 mai 2026 : retirer tous les délais d'intervention promis du site. Tout engagement chiffré (« sous 1h », « rappel sous 30 min », « réponse en moins de 2h ») crée une obligation contractuelle non tenable en cas de surcharge / aléa. Source : MEMOIRE_IA addendum v9, sonde #43.

## 📊 Synthèse

| Pattern | Occurrences |
|---------|-------------|
| engagement « rappel sous … » | 15 |
| engagement « sous X (h/min) » | 13 |
| « dans l'heure » | 2 |
| engagement « intervention sous X » | 1 |

## 📋 Findings détaillés

| Fichier | Ligne | Pattern | Match | Contexte |
|---------|------:|---------|-------|----------|
| `a-propos.html` | 946 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `actualites.html` | 871 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `chauffagiste-saint-omer.html` | 1155 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div… |
| `chauffagiste-saint-omer.html` | 2421 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `contact.html` | 1007 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `contrats-entretien.html` | 1333 | engagement « sous X (h/min) » | `sous 24h` | …> · Renseignez le formulaire et nous validons votre dossier sous 24h.</p> </div> <form id="sousForm" onsubmit="ret… |
| `contrats-entretien.html` | 1333 | engagement « sous X (h/min) » | `sous 24h` | …s</h4> <p class="sw-step-hint">Pour vous rappeler sous 24h et envoyer votre contrat.</p> </div> <div s… |
| `contrats-entretien.html` | 1333 | engagement « sous X (h/min) » | `sous 24h` | …ons puis envoyez votre demande. Un conseiller vous rappelle sous 24h pour planifier la visite technique.</p> </div>… |
| `contrats-entretien.html` | 1333 | engagement « sous X (h/min) » | `sous 24h` | …ate="checked"> <span>J'accepte d'être contacté(e) sous 24h pour finaliser mon contrat. Je reconnais que ce formulaire… |
| `contrats-entretien.html` | 1059 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `depannage-dunkerque.html` | 1197 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `depannage-dunkerque.html` | 514 | engagement « intervention sous X » | `Intervention sous 1` | …="item"><span class="dot" style="background:#FF6B1A"></span>Intervention sous 1h30 sur Dunkerque</span> <span class="item"><span clas… |
| `depannage-saint-omer.html` | 1199 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `electricien-saint-omer.html` | 1131 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div… |
| `electricien-saint-omer.html` | 1284 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden=… |
| `electricien-saint-omer.html` | 2373 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `electricien-saint-omer.html` | 1346 | « dans l'heure » | `dans l'heure` | …cle class="m-tarif-card" data-presta="Intervention urgence (dans l'heure)" data-source="base-produits-2026-05"> <div class="… |
| `electricien-saint-omer.html` | 1346 | « dans l'heure » | `dans l'heure` | …01" y2="16"/></svg></div> <h3>Intervention urgence (dans l'heure)</h3> <p>Forfait main d'œuvre urgence électricité,… |
| `faq.html` | 239 | engagement « sous X (h/min) » | `sous 24h` | …s votre réponse&nbsp;?</h3> <p>Notre équipe vous rappelle sous 24h ouvrées avec une réponse personnalisée.</p> <a href="cont… |
| `guide-fuite-eau.html` | 503 | engagement « sous X (h/min) » | `Sous 24h` | …ite simple (joint d'évier, mitigeur usé)</li> <li><strong>Sous 24h</strong> dans tous les cas — même si vous avez « réparé&nbs… |
| `index.html` | 2197 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `mentions-legales.html` | 823 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `plombier-saint-omer.html` | 1147 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div… |
| `plombier-saint-omer.html` | 2431 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `realisations.html` | 1118 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `serrurier-saint-omer.html` | 1147 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div… |
| `serrurier-saint-omer.html` | 2413 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `travaux-saint-omer.html` | 1142 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div… |
| `travaux-saint-omer.html` | 2408 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |
| `zones-intervention.html` | 999 | engagement « sous X (h/min) » | `Sous 1h` | …span class="z-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> </div>… |
| `zones-intervention.html` | 1971 | engagement « rappel sous … » | `Rappel sous` | …0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div… |

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
