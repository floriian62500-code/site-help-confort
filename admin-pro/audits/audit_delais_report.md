# ⏱️ Audit délais d'intervention promis — Sonde IA #43

*Généré le 2026-05-20 06:50 — `admin-pro/audits/audit_delais.py`*

**Pages scannées** : 82
**Findings (promesses commerciales détectées)** : **149**
**Pages concernées** : 49

## 🎯 Contexte

Décision Florian 15 mai 2026 : retirer tous les délais d'intervention promis du site. Tout engagement chiffré (« sous 1h », « rappel sous 30 min », « réponse en moins de 2h ») crée une obligation contractuelle non tenable en cas de surcharge / aléa. Source : MEMOIRE_IA addendum v9, sonde #43.

## 📊 Synthèse

| Pattern | Occurrences |
|---------|-------------|
| engagement « sous X (h/min) » | 103 |
| engagement « rappel sous … » | 41 |
| engagement « intervention sous X » | 5 |

## 📋 Findings détaillés

| Fichier | Ligne | Pattern | Match | Contexte |
|---------|------:|---------|-------|----------|
| `a-propos.html` | 969 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `actualites.html` | 833 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `agence-dunkerque.html` | 213 | engagement « sous X (h/min) » | `sous 45 min` | …rgin:0 0 16px">Notre agence littoral dunkerquois intervient sous 45 min à 1h30 sur :</p> <div class="ag-zones"> <a href="depannag… |
| `agence-saint-omer.html` | 213 | engagement « sous X (h/min) » | `sous 30 min` | …475569;margin:0 0 16px">Notre agence audomaroise intervient sous 30 min à 1h sur :</p> <div class="ag-zones"> <a href="depannage-… |
| `chauffagiste-boulogne-sur-mer.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `chauffagiste-boulogne-sur-mer.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `chauffagiste-boulogne-sur-mer.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `chauffagiste-boulogne-sur-mer.html` | 1941 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-boulogne-sur-mer.html` | 2431 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-boulogne-sur-mer.html` | 1941 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `chauffagiste-calais.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `chauffagiste-calais.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `chauffagiste-calais.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `chauffagiste-calais.html` | 1941 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-calais.html` | 2431 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-calais.html` | 1941 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `chauffagiste-dunkerque.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `chauffagiste-dunkerque.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `chauffagiste-dunkerque.html` | 974 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `chauffagiste-dunkerque.html` | 1941 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-dunkerque.html` | 2431 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-dunkerque.html` | 1941 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `chauffagiste-saint-omer.html` | 1948 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-saint-omer.html` | 2438 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-saint-omer.html` | 1948 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `contact.html` | 434 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.94rem">Devis simple sous 24h</strong> <span style="font-size:.74rem;color:#64748b… |
| `contact.html` | 434 | engagement « sous X (h/min) » | `sous 24h` | …us adressons un <strong>devis gratuit et détaillé</strong> (sous 24h pour les demandes simples)</li> <li>Vous décidez libre… |
| `contact.html` | 1044 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contrats-entretien.html` | 1153 | engagement « sous X (h/min) » | `sous 24h` | …> · Renseignez le formulaire et nous validons votre dossier sous 24h.</p> </div> <form id="sousForm" onsubmit="return submi… |
| `contrats-entretien.html` | 1153 | engagement « sous X (h/min) » | `sous 24h` | …oordonnées</h4> <p class="sw-step-hint">Pour vous rappeler sous 24h et envoyer votre contrat.</p> </div> <div style="display:… |
| `contrats-entretien.html` | 1153 | engagement « sous X (h/min) » | `sous 24h` | …ons puis envoyez votre demande. Un conseiller vous rappelle sous 24h pour planifier la visite technique.</p> </div> <div cl… |
| `contrats-entretien.html` | 1153 | engagement « sous X (h/min) » | `sous 24h` | …ata-validate="checked"> <span>J'accepte d'être contacté(e) sous 24h pour finaliser mon contrat. Je reconnais que ce formulaire… |
| `contrats-entretien.html` | 932 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-boulogne-sur-mer.html` | 1078 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-calais.html` | 1078 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-coquelles.html` | 1062 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 1051 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-saint-omer.html` | 1061 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-saint-pol-sur-mer.html` | 1062 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-sangatte.html` | 1062 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …tion de plus de 15 ans. Conforme arrêté 28/09/2017. Rapport sous 48h.</p> <a href="tel:+33366100134" class="de-cta">📞 03 66 10… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …<p style="font-size:.92rem;color:#64748b">📄 Rapport remis sous 48h ouvrées. Compatible toutes notariées + agences immobilières… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …ur T2-T4 standard. Tarif annoncé avant déplacement, rapport sous 48h.</p> </div> <div class="de-faq"> <h3>Mon installation a… |
| `electricien-boulogne-sur-mer.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `electricien-boulogne-sur-mer.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `electricien-boulogne-sur-mer.html` | 1145 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-boulogne-sur-mer.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `electricien-boulogne-sur-mer.html` | 2177 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-calais.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `electricien-calais.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `electricien-calais.html` | 1145 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-calais.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `electricien-calais.html` | 2177 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-dunkerque.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `electricien-dunkerque.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `electricien-dunkerque.html` | 1145 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-dunkerque.html` | 950 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `electricien-dunkerque.html` | 2177 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `electricien-saint-omer.html` | 1153 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `electricien-saint-omer.html` | 2185 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `faq.html` | 219 | engagement « sous X (h/min) » | `sous 24h` | …as votre réponse&nbsp;?</h3> <p>Notre équipe vous rappelle sous 24h ouvrées avec une réponse personnalisée.</p> <a href="conta… |
| `guide-fuite-eau.html` | 455 | engagement « sous X (h/min) » | `Sous 24h` | …uite simple (joint d'évier, mitigeur usé)</li> <li><strong>Sous 24h</strong> dans tous les cas — même si vous avez « réparé&nbs… |
| `index.html` | 2481 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `mentions-legales.html` | 740 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `menuisier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `menuisier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `menuisier-dunkerque.html` | 2326 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `menuisier-saint-omer.html` | 2335 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `nos-villes.html` | 175 | engagement « sous X (h/min) » | `sous 30 min` | …pan'Audo) basée à Saint-Martin-lez-Tatinghem. Interventions sous 30 min à 1h.</p> <div class="nv-grid"> <a href="depannage-sa… |
| `ouverture-porte-claquee.html` | 272 | engagement « intervention sous X » | `intervention sous 1` | …)</h3> <p><strong>90 à 180€ TTC</strong><br>Sans casse, intervention sous 1-2h.</p> </div> <div class="op-card" style="border-left-… |
| `plombier-boulogne-sur-mer.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `plombier-boulogne-sur-mer.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `plombier-boulogne-sur-mer.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `plombier-boulogne-sur-mer.html` | 2329 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-calais.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `plombier-calais.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `plombier-calais.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `plombier-calais.html` | 2329 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-dunkerque.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `plombier-dunkerque.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `plombier-dunkerque.html` | 965 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `plombier-dunkerque.html` | 2329 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `plombier-saint-omer.html` | 2263 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-dunkerque.html` | 922 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `pmr-dunkerque.html` | 922 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `pmr-dunkerque.html` | 922 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `pmr-dunkerque.html` | 2029 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-saint-omer.html` | 932 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `pmr-saint-omer.html` | 932 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `pmr-saint-omer.html` | 932 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `pmr-saint-omer.html` | 2099 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `realisations.html` | 1141 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `serrurier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `serrurier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `serrurier-boulogne-sur-mer.html` | 2319 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `serrurier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `serrurier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `serrurier-calais.html` | 2319 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `serrurier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `serrurier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `serrurier-dunkerque.html` | 2319 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `serrurier-saint-omer.html` | 2326 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `travaux-dunkerque.html` | 2094 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `travaux-saint-omer.html` | 2103 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `urgence.html` | 364 | engagement « sous X (h/min) » | `sous 24h` | …ce</li> <li>Sécurisation temporaire (planche/bâche) sous 24h ouvrées</li> <li>Devis remplacement vitrage</li>… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …accident&nbsp;? Nous posons une planche / bâche en attente sous 24h ouvrées, puis remplacons à votre rythme. Devis pour votre a… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `vitrier-dunkerque.html` | 2140 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `vitrier-saint-omer.html` | 2149 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `volets-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `volets-dunkerque.html` | 943 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `volets-dunkerque.html` | 2142 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> <div class="m-trust-live">… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h</strong> <span style="font-size:.76rem;color:#647… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h</strong> avec le tarif personnalisé.</p> </div> </div> <… |
| `volets-saint-omer.html` | 2151 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `zones-intervention.html` | 790 | engagement « sous X (h/min) » | `sous 24h` | …lass="z-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h</small></span> </a> </div> </div> <div class="z-hero-m… |
| `zones-intervention.html` | 1716 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |

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
