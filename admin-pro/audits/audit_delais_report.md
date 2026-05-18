# ⏱️ Audit délais d'intervention promis — Sonde IA #43

*Généré le 2026-05-18 06:58 — `admin-pro/audits/audit_delais.py`*

**Pages scannées** : 78
**Findings (promesses commerciales détectées)** : **175**
**Pages concernées** : 49

## 🎯 Contexte

Décision Florian 15 mai 2026 : retirer tous les délais d'intervention promis du site. Tout engagement chiffré (« sous 1h », « rappel sous 30 min », « réponse en moins de 2h ») crée une obligation contractuelle non tenable en cas de surcharge / aléa. Source : MEMOIRE_IA addendum v9, sonde #43.

## 📊 Synthèse

| Pattern | Occurrences |
|---------|-------------|
| engagement « sous X (h/min) » | 127 |
| engagement « rappel sous … » | 42 |
| engagement « intervention sous X » | 6 |

## 📋 Findings détaillés

| Fichier | Ligne | Pattern | Match | Contexte |
|---------|------:|---------|-------|----------|
| `a-propos.html` | 902 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `actualites.html` | 826 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `agence-dunkerque.html` | 155 | engagement « sous X (h/min) » | `sous 45 min` | …rgin:0 0 16px">Notre agence littoral dunkerquois intervient sous 45 min à 1h30 sur :</p> <div class="ag-zones"> <a href="depannag… |
| `agence-saint-omer.html` | 155 | engagement « sous X (h/min) » | `sous 30 min` | …475569;margin:0 0 16px">Notre agence audomaroise intervient sous 30 min à 1h sur :</p> <div class="ag-zones"> <a href="depannage-… |
| `chauffagiste-boulogne-sur-mer.html` | 974 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `chauffagiste-boulogne-sur-mer.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `chauffagiste-boulogne-sur-mer.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `chauffagiste-boulogne-sur-mer.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `chauffagiste-boulogne-sur-mer.html` | 1906 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-boulogne-sur-mer.html` | 2389 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-boulogne-sur-mer.html` | 1906 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `chauffagiste-calais.html` | 974 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `chauffagiste-calais.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `chauffagiste-calais.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `chauffagiste-calais.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `chauffagiste-calais.html` | 1906 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-calais.html` | 2389 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-calais.html` | 1906 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `chauffagiste-dunkerque.html` | 974 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `chauffagiste-dunkerque.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `chauffagiste-dunkerque.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `chauffagiste-dunkerque.html` | 1364 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `chauffagiste-dunkerque.html` | 1906 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-dunkerque.html` | 2389 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-dunkerque.html` | 1906 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `chauffagiste-saint-omer.html` | 984 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `chauffagiste-saint-omer.html` | 1373 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `chauffagiste-saint-omer.html` | 1373 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `chauffagiste-saint-omer.html` | 1373 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `chauffagiste-saint-omer.html` | 1915 | engagement « sous X (h/min) » | `sous 48h` | …swer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqué… |
| `chauffagiste-saint-omer.html` | 2398 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-saint-omer.html` | 1915 | engagement « intervention sous X » | `intervention sous 4` | …class="faq-answer">En contrat Confort ou Sécurité : <strong>intervention sous 48h max en semaine</strong>. Hors contrat : créneau communiqu… |
| `contact.html` | 970 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …> · Renseignez le formulaire et nous validons votre dossier sous 24h.</p> </div> <form id="sousForm" onsubmit="return submi… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …oordonnées</h4> <p class="sw-step-hint">Pour vous rappeler sous 24h et envoyer votre contrat.</p> </div> <div style="display:… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …ons puis envoyez votre demande. Un conseiller vous rappelle sous 24h pour planifier la visite technique.</p> </div> <div cl… |
| `contrats-entretien.html` | 1146 | engagement « sous X (h/min) » | `sous 24h` | …ata-validate="checked"> <span>J'accepte d'être contacté(e) sous 24h pour finaliser mon contrat. Je reconnais que ce formulaire… |
| `contrats-entretien.html` | 925 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `debouchage-canalisation.html` | 231 | engagement « sous X (h/min) » | `Sous 1h` | …><strong>90 à 180€ TTC</strong><br>Furet WC, évier, lavabo. Sous 1h.</p> </div> <div class="dc-card" style="border-left-col… |
| `depannage-boulogne-sur-mer.html` | 452 | engagement « sous X (h/min) » | `sous 1h` | …tyle="margin:0"><strong>Délai d'arrivée Boulogne :</strong> sous 1h-1h30 en heures ouvrées selon disponibilité. Tarif TTC annon… |
| `depannage-boulogne-sur-mer.html` | 1071 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-calais.html` | 1071 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-coquelles.html` | 1055 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 1044 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 410 | engagement « intervention sous X » | `Intervention sous 1` | …="item"><span class="dot" style="background:#FF6B1A"></span>Intervention sous 1h30 sur Dunkerque</span> <span class="item"><span class="do… |
| `depannage-saint-omer.html` | 1054 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-saint-pol-sur-mer.html` | 1055 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-sangatte.html` | 1055 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-boulogne-sur-mer.html` | 950 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `electricien-boulogne-sur-mer.html` | 1115 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-boulogne-sur-mer.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `electricien-boulogne-sur-mer.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `electricien-boulogne-sur-mer.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `electricien-boulogne-sur-mer.html` | 2136 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-calais.html` | 950 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `electricien-calais.html` | 1115 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-calais.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `electricien-calais.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `electricien-calais.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `electricien-calais.html` | 2136 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-dunkerque.html` | 950 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `electricien-dunkerque.html` | 1115 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-dunkerque.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `electricien-dunkerque.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `electricien-dunkerque.html` | 1159 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `electricien-dunkerque.html` | 2136 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-saint-omer.html` | 960 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `electricien-saint-omer.html` | 1124 | engagement « sous X (h/min) » | `sous 24 h` | …se, remplacement, ajout de points lumineux ou prises. Devis sous 24 h.</p></div> <span class="m-svc-arrow" aria-hidden="true">→<… |
| `electricien-saint-omer.html` | 1168 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `electricien-saint-omer.html` | 1168 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `electricien-saint-omer.html` | 1168 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `electricien-saint-omer.html` | 2145 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `faq.html` | 219 | engagement « sous X (h/min) » | `sous 24h` | …as votre réponse&nbsp;?</h3> <p>Notre équipe vous rappelle sous 24h ouvrées avec une réponse personnalisée.</p> <a href="conta… |
| `guide-fuite-eau.html` | 455 | engagement « sous X (h/min) » | `Sous 24h` | …uite simple (joint d'évier, mitigeur usé)</li> <li><strong>Sous 24h</strong> dans tous les cas — même si vous avez « réparé&nbs… |
| `index.html` | 2453 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `mentions-legales.html` | 731 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `menuisier-dunkerque.html` | 1175 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `menuisier-dunkerque.html` | 1175 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `menuisier-dunkerque.html` | 1175 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `menuisier-dunkerque.html` | 2287 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `menuisier-saint-omer.html` | 1184 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `menuisier-saint-omer.html` | 1184 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `menuisier-saint-omer.html` | 1184 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `menuisier-saint-omer.html` | 2296 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `nos-villes.html` | 117 | engagement « sous X (h/min) » | `sous 30 min` | …pan'Audo) basée à Saint-Martin-lez-Tatinghem. Interventions sous 30 min à 1h.</p> <div class="nv-grid"> <a href="depannage-sa… |
| `nos-villes.html` | 199 | engagement « sous X (h/min) » | `sous 1h` | …a href="contact.html#rappel" class="secondary">Être rappelé sous 1h</a> </div> </div> </main> <footer style="background:#0A… |
| `nos-villes.html` | 199 | engagement « rappel sous … » | `rappelé sous` | …a> <a href="contact.html#rappel" class="secondary">Être rappelé sous 1h</a> </div> </div> </main> <footer style="background:… |
| `ouverture-porte-claquee.html` | 213 | engagement « intervention sous X » | `intervention sous 1` | …)</h3> <p><strong>90 à 180€ TTC</strong><br>Sans casse, intervention sous 1-2h.</p> </div> <div class="op-card" style="border-left-… |
| `plombier-boulogne-sur-mer.html` | 965 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `plombier-boulogne-sur-mer.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `plombier-boulogne-sur-mer.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `plombier-boulogne-sur-mer.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `plombier-boulogne-sur-mer.html` | 2288 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-calais.html` | 965 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `plombier-calais.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `plombier-calais.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `plombier-calais.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `plombier-calais.html` | 2288 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-dunkerque.html` | 965 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `plombier-dunkerque.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `plombier-dunkerque.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `plombier-dunkerque.html` | 1180 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `plombier-dunkerque.html` | 2288 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-saint-omer.html` | 975 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `plombier-saint-omer.html` | 1189 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `plombier-saint-omer.html` | 1189 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `plombier-saint-omer.html` | 1189 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `plombier-saint-omer.html` | 2297 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-dunkerque.html` | 919 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `pmr-dunkerque.html` | 1132 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `pmr-dunkerque.html` | 1132 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `pmr-dunkerque.html` | 1132 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `pmr-dunkerque.html` | 2027 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-saint-omer.html` | 929 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `pmr-saint-omer.html` | 1141 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `pmr-saint-omer.html` | 1141 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `pmr-saint-omer.html` | 1141 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `pmr-saint-omer.html` | 2036 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `realisations.html` | 1118 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `serrurier-boulogne-sur-mer.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `serrurier-boulogne-sur-mer.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `serrurier-boulogne-sur-mer.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `serrurier-boulogne-sur-mer.html` | 2278 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-calais.html` | 966 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `serrurier-calais.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `serrurier-calais.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `serrurier-calais.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `serrurier-calais.html` | 2278 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `serrurier-dunkerque.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `serrurier-dunkerque.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `serrurier-dunkerque.html` | 1172 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `serrurier-dunkerque.html` | 2278 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `serrurier-saint-omer.html` | 1181 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `serrurier-saint-omer.html` | 1181 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `serrurier-saint-omer.html` | 1181 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `serrurier-saint-omer.html` | 2287 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-dunkerque.html` | 937 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `travaux-dunkerque.html` | 1145 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `travaux-dunkerque.html` | 1145 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `travaux-dunkerque.html` | 1145 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `travaux-dunkerque.html` | 2053 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-saint-omer.html` | 947 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `travaux-saint-omer.html` | 1154 | engagement « sous X (h/min) » | `sous 1h` | …<span>Cas spécifique, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `travaux-saint-omer.html` | 1154 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `travaux-saint-omer.html` | 1154 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `travaux-saint-omer.html` | 2062 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `urgence.html` | 169 | engagement « sous X (h/min) » | `sous 24h` | …ce</li> <li>Sécurisation temporaire (planche/bâche) sous 24h ouvrées</li> <li>Devis remplacement vitrage</li>… |
| `vitrier-dunkerque.html` | 943 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `vitrier-dunkerque.html` | 1044 | engagement « sous X (h/min) » | `sous 24h` | …accident&nbsp;? Nous posons une planche / bâche en attente sous 24h ouvrées, puis remplacons à votre rythme. Devis pour votre a… |
| `vitrier-dunkerque.html` | 1145 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `vitrier-dunkerque.html` | 1145 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `vitrier-dunkerque.html` | 1145 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `vitrier-dunkerque.html` | 2098 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `vitrier-saint-omer.html` | 953 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `vitrier-saint-omer.html` | 1154 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `vitrier-saint-omer.html` | 1154 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `vitrier-saint-omer.html` | 1154 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `vitrier-saint-omer.html` | 2107 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-dunkerque.html` | 943 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `volets-dunkerque.html` | 1156 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `volets-dunkerque.html` | 1156 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `volets-dunkerque.html` | 1156 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `volets-dunkerque.html` | 2128 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-saint-omer.html` | 953 | engagement « sous X (h/min) » | `Sous 1h` | …span class="m-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> <div class="m-trust-l… |
| `volets-saint-omer.html` | 1165 | engagement « sous X (h/min) » | `sous 1h` | …pécifique, rénovation, projet sur mesure : on vous rappelle sous 1h ouvrée.</span> </span> <span class="m-cta-arrow" aria-hid… |
| `volets-saint-omer.html` | 1165 | engagement « sous X (h/min) » | `sous 1h` | …<p class="sub">Renseignez vos coordonnées, on vous rappelle sous 1h ouvrée avec le tarif personnalisé.</p> <form class="m-moda… |
| `volets-saint-omer.html` | 1165 | engagement « sous X (h/min) » | `sous 1h` | …#475569;line-height:1.5">Notre équipe vous rappelle <strong>sous 1h ouvrée</strong> avec le tarif personnalisé.</p> </div> </… |
| `volets-saint-omer.html` | 2137 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `zones-intervention.html` | 790 | engagement « sous X (h/min) » | `Sous 1h` | …span class="z-cta-text"><strong>Être rappelé</strong><small>Sous 1h ouvrée</small></span> </a> </div> </div> <div class="z… |
| `zones-intervention.html` | 1714 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |

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
