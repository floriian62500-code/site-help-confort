# ⏱️ Audit délais d'intervention promis — Sonde IA #43

*Généré le 2026-05-16 05:56 — `admin-pro/audits/audit_delais.py`*

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
| `a-propos.html` | 842 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `actualites.html` | 751 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-saint-omer.html` | 887 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `chauffagiste-saint-omer.html` | 2030 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contact.html` | 898 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contrats-entretien.html` | 1124 | engagement « sous X (h/min) » | `sous 24h` | …> · Renseignez le formulaire et nous validons votre dossier sous 24h.</p> </div> <form id="sousForm" onsubmit="return submi… |
| `contrats-entretien.html` | 1124 | engagement « sous X (h/min) » | `sous 24h` | …oordonnées</h4> <p class="sw-step-hint">Pour vous rappeler sous 24h et envoyer votre contrat.</p> </div> <div style="display:… |
| `contrats-entretien.html` | 1124 | engagement « sous X (h/min) » | `sous 24h` | …ons puis envoyez votre demande. Un conseiller vous rappelle sous 24h pour planifier la visite technique.</p> </div> <div cl… |
| `contrats-entretien.html` | 1124 | engagement « sous X (h/min) » | `sous 24h` | …ata-validate="checked"> <span>J'accepte d'être contacté(e) sous 24h pour finaliser mon contrat. Je reconnais que ce formulaire… |
| `contrats-entretien.html` | 903 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 1028 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 399 | engagement « intervention sous X » | `Intervention sous 1` | …="item"><span class="dot" style="background:#FF6B1A"></span>Intervention sous 1h30 sur Dunkerque</span> <span class="item"><span class="do… |
| `depannage-saint-omer.html` | 1038 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-saint-omer.html` | 863 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `electricien-saint-omer.html` | 1016 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-saint-omer.html` | 1982 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-saint-omer.html` | 1078 | « dans l'heure » | `dans l'heure` | …cle class="m-tarif-card" data-presta="Intervention urgence (dans l'heure)" data-source="base-produits-2026-05"> <div class="m-tarif… |
| `electricien-saint-omer.html` | 1078 | « dans l'heure » | `dans l'heure` | …x2="12.01" y2="16"/></svg></div> <h3>Intervention urgence (dans l'heure)</h3> <p>Forfait main d'œuvre urgence électricité, interve… |
| `faq.html` | 203 | engagement « sous X (h/min) » | `sous 24h` | …as votre réponse&nbsp;?</h3> <p>Notre équipe vous rappelle sous 24h ouvrées avec une réponse personnalisée.</p> <a href="conta… |
| `guide-fuite-eau.html` | 444 | engagement « sous X (h/min) » | `Sous 24h` | …uite simple (joint d'évier, mitigeur usé)</li> <li><strong>Sous 24h</strong> dans tous les cas — même si vous avez « réparé&nbs… |
| `index.html` | 2121 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `mentions-legales.html` | 720 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-saint-omer.html` | 879 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `plombier-saint-omer.html` | 2043 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `realisations.html` | 995 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-saint-omer.html` | 879 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `serrurier-saint-omer.html` | 2018 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-saint-omer.html` | 874 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `travaux-saint-omer.html` | 2017 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `zones-intervention.html` | 788 | engagement « sous X (h/min) » | `Sous 1h` | …span class="z-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> </div> <div class="z… |
| `zones-intervention.html` | 1702 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |

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
