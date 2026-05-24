# ⏱️ Audit délais d'intervention promis — Sonde IA #43

*Généré le 2026-05-24 06:39 — `admin-pro/audits/audit_delais.py`*

**Pages scannées** : 84
**Findings (promesses commerciales détectées)** : **136**
**Pages concernées** : 46

## 🎯 Contexte

Décision Florian 15 mai 2026 : retirer tous les délais d'intervention promis du site. Tout engagement chiffré (« sous 1h », « rappel sous 30 min », « réponse en moins de 2h ») crée une obligation contractuelle non tenable en cas de surcharge / aléa. Source : MEMOIRE_IA addendum v9, sonde #43.

## 📊 Synthèse

| Pattern | Occurrences |
|---------|-------------|
| engagement « sous X (h/min) » | 94 |
| engagement « rappel sous … » | 41 |
| engagement « intervention sous X » | 1 |

## 📋 Findings détaillés

| Fichier | Ligne | Pattern | Match | Contexte |
|---------|------:|---------|-------|----------|
| `a-propos.html` | 971 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `actualites.html` | 835 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-boulogne-sur-mer.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-boulogne-sur-mer.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-boulogne-sur-mer.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-boulogne-sur-mer.html` | 2178 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-calais.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-calais.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-calais.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-calais.html` | 2178 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-dunkerque.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-dunkerque.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-dunkerque.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-dunkerque.html` | 2178 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-saint-omer.html` | 2185 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contact.html` | 434 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.94rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.74rem;color… |
| `contact.html` | 434 | engagement « sous X (h/min) » | `sous 24h` | …us adressons un <strong>devis gratuit et détaillé</strong> (sous 24h ouvrées pour les demandes simples)</li> <li>Vous décid… |
| `contact.html` | 1046 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contrats-entretien.html` | 1155 | engagement « sous X (h/min) » | `sous 24h` | …> · Renseignez le formulaire et nous validons votre dossier sous 24h ouvrées.</p> </div> <form id="sousForm" onsubmit="retu… |
| `contrats-entretien.html` | 1155 | engagement « sous X (h/min) » | `sous 24h` | …oordonnées</h4> <p class="sw-step-hint">Pour vous rappeler sous 24h ouvrées et envoyer votre contrat.</p> </div> <div style="… |
| `contrats-entretien.html` | 1155 | engagement « sous X (h/min) » | `sous 24h` | …ons puis envoyez votre demande. Un conseiller vous rappelle sous 24h ouvrées pour planifier la visite technique.</p> </div>… |
| `contrats-entretien.html` | 1155 | engagement « sous X (h/min) » | `sous 24h` | …ata-validate="checked"> <span>J'accepte d'être contacté(e) sous 24h ouvrées pour finaliser mon contrat. Je reconnais que ce for… |
| `contrats-entretien.html` | 934 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-boulogne-sur-mer.html` | 1080 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-calais.html` | 1080 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-coquelles.html` | 1064 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 1053 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-saint-omer.html` | 1063 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-saint-pol-sur-mer.html` | 1064 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-sangatte.html` | 1064 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …tion de plus de 15 ans. Conforme arrêté 28/09/2017. Rapport sous 48h ouvrées.</p> <a href="tel:+33366100134" class="de-cta">📞… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …<p style="font-size:.92rem;color:#64748b">📄 Rapport remis sous 48h ouvrées. Compatible toutes notariées + agences immobilières… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …ur T2-T4 standard. Tarif annoncé avant déplacement, rapport sous 48h ouvrées.</p> </div> <div class="de-faq"> <h3>Mon install… |
| `electricien-boulogne-sur-mer.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-boulogne-sur-mer.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-boulogne-sur-mer.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-boulogne-sur-mer.html` | 1916 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-calais.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-calais.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-calais.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-calais.html` | 1916 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-dunkerque.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-dunkerque.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-dunkerque.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-dunkerque.html` | 1916 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-saint-omer.html` | 1924 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `faq.html` | 219 | engagement « sous X (h/min) » | `sous 24h` | …as votre réponse&nbsp;?</h3> <p>Notre équipe vous rappelle sous 24h ouvrées avec une réponse personnalisée.</p> <a href="conta… |
| `guide-fuite-eau.html` | 455 | engagement « sous X (h/min) » | `Sous 24h` | …uite simple (joint d'évier, mitigeur usé)</li> <li><strong>Sous 24h ouvrées</strong> dans tous les cas — même si vous avez « ré… |
| `index.html` | 2483 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `mentions-legales.html` | 742 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `menuisier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `menuisier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `menuisier-dunkerque.html` | 2107 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `menuisier-saint-omer.html` | 2116 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `ouverture-porte-claquee.html` | 275 | engagement « intervention sous X » | `intervention sous 1` | …)</h3> <p><strong>90 à 180€ TTC</strong><br>Sans casse, intervention sous 1-2h.</p> </div> <div class="op-card" style="border-left-… |
| `plombier-boulogne-sur-mer.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-boulogne-sur-mer.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-boulogne-sur-mer.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-boulogne-sur-mer.html` | 2095 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-calais.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-calais.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-calais.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-calais.html` | 2095 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-dunkerque.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-dunkerque.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-dunkerque.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-dunkerque.html` | 2095 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-saint-omer.html` | 2101 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-dunkerque.html` | 922 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `pmr-dunkerque.html` | 922 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `pmr-dunkerque.html` | 922 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `pmr-dunkerque.html` | 1820 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-saint-omer.html` | 932 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `pmr-saint-omer.html` | 932 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `pmr-saint-omer.html` | 932 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `pmr-saint-omer.html` | 1890 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `realisations.html` | 1141 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-boulogne-sur-mer.html` | 2057 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-calais.html` | 2057 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-dunkerque.html` | 2057 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-saint-omer.html` | 2064 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `sous 24h` | …olor:#64748b">Catalogue tarifs transparents · devis gratuit sous 24h ouvrées</p> </div> </section> <section class="m-section"… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `travaux-dunkerque.html` | 1749 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `sous 24h` | …olor:#64748b">Catalogue tarifs transparents · devis gratuit sous 24h ouvrées</p> </div> </section> <section class="m-section"… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `travaux-saint-omer.html` | 1758 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `urgence.html` | 364 | engagement « sous X (h/min) » | `sous 24h` | …ce</li> <li>Sécurisation temporaire (planche/bâche) sous 24h ouvrées</li> <li>Devis remplacement vitrage</li>… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …accident&nbsp;? Nous posons une planche / bâche en attente sous 24h ouvrées, puis remplacons à votre rythme. Devis pour votre a… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `vitrier-dunkerque.html` | 1904 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `vitrier-saint-omer.html` | 1913 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `volets-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `volets-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `volets-dunkerque.html` | 1924 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `volets-saint-omer.html` | 1933 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `zones-intervention.html` | 790 | engagement « sous X (h/min) » | `sous 24h` | …lass="z-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> </div> <div class="… |
| `zones-intervention.html` | 1738 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |

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
