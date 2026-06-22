# ⏱️ Audit délais d'intervention promis — Sonde IA #43

*Généré le 2026-06-22 09:11 — `admin-pro/audits/audit_delais.py`*

**Pages scannées** : 118
**Findings (promesses commerciales détectées)** : **158**
**Pages concernées** : 68

## 🎯 Contexte

Décision Florian 15 mai 2026 : retirer tous les délais d'intervention promis du site. Tout engagement chiffré (« sous 1h », « rappel sous 30 min », « réponse en moins de 2h ») crée une obligation contractuelle non tenable en cas de surcharge / aléa. Source : MEMOIRE_IA addendum v9, sonde #43.

## 📊 Synthèse

| Pattern | Occurrences |
|---------|-------------|
| engagement « sous X (h/min) » | 115 |
| engagement « rappel sous … » | 41 |
| engagement « intervention sous X » | 2 |

## 📋 Findings détaillés

| Fichier | Ligne | Pattern | Match | Contexte |
|---------|------:|---------|-------|----------|
| `a-propos.html` | 991 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `actualites.html` | 842 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `blog-debouchage-canalisation-furet-hydrocurage.html` | 184 | engagement « sous X (h/min) » | `sous 2h` | …ret, hydrocurage ou caméra : on diagnostique et on débouche sous 2h.</p> <a href="tel:+33366100134"> <svg width="18" heig… |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 181 | engagement « sous X (h/min) » | `sous 24h` | …s : entretien automatique programmé, dépannage prioritaire (sous 24h en formule Confort), pas de majoration soir/week-end, petit… |
| `blog-panne-electrique-disjoncteur-saute.html` | 171 | engagement « sous X (h/min) » | `sous 2h` | …équipe intervient à Saint-Omer, Dunkerque, Calais, Boulogne sous 2h en urgence électrique.</p> </section> <section class="blog-… |
| `chauffagiste-boulogne-sur-mer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-boulogne-sur-mer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-boulogne-sur-mer.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-boulogne-sur-mer.html` | 2010 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-calais.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-calais.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-calais.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-calais.html` | 2010 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-coudekerque-branche.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `chauffagiste-dunkerque.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-dunkerque.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-dunkerque.html` | 975 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-dunkerque.html` | 2014 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-marck.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `chauffagiste-outreau.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `chauffagiste-saint-omer.html` | 985 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `chauffagiste-saint-omer.html` | 985 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `chauffagiste-saint-omer.html` | 985 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `chauffagiste-saint-omer.html` | 2020 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `chauffagiste-wimereux.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `contact.html` | 435 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.94rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.74rem;color… |
| `contact.html` | 435 | engagement « sous X (h/min) » | `sous 24h` | …us adressons un <strong>devis gratuit et détaillé</strong> (sous 24h ouvrées pour les demandes simples)</li> <li>Vous décid… |
| `contact.html` | 1103 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `contrats-entretien.html` | 1162 | engagement « sous X (h/min) » | `sous 24h` | …> · Renseignez le formulaire et nous validons votre dossier sous 24h ouvrées.</p> </div> <form id="sousForm" onsubmit="retu… |
| `contrats-entretien.html` | 1162 | engagement « sous X (h/min) » | `sous 24h` | …oordonnées</h4> <p class="sw-step-hint">Pour vous rappeler sous 24h ouvrées et envoyer votre contrat.</p> </div> <div style="… |
| `contrats-entretien.html` | 1162 | engagement « sous X (h/min) » | `sous 24h` | …ons puis envoyez votre demande. Un conseiller vous rappelle sous 24h ouvrées pour planifier la visite technique.</p> </div>… |
| `contrats-entretien.html` | 1162 | engagement « sous X (h/min) » | `sous 24h` | …ata-validate="checked"> <span>J'accepte d'être contacté(e) sous 24h ouvrées pour finaliser mon contrat. Je reconnais que ce for… |
| `contrats-entretien.html` | 941 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-boulogne-sur-mer.html` | 1087 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-calais.html` | 1087 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-coquelles.html` | 1071 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-dunkerque.html` | 1063 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-saint-omer.html` | 1073 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-saint-pol-sur-mer.html` | 1071 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `depannage-sangatte.html` | 1071 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …tion de plus de 15 ans. Conforme arrêté 28/09/2017. Rapport sous 48h ouvrées.</p> <a href="tel:+33366100134" class="de-cta">📞… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …<p style="font-size:.92rem;color:#64748b">📄 Rapport remis sous 48h ouvrées. Compatible toutes notariées + agences immobilières… |
| `diagnostic-electrique.html` | 57 | engagement « sous X (h/min) » | `sous 48h` | …ur T2-T4 standard. Tarif annoncé avant déplacement, rapport sous 48h ouvrées.</p> </div> <div class="de-faq"> <h3>Mon install… |
| `electricien-boulogne-sur-mer.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-boulogne-sur-mer.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-boulogne-sur-mer.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-boulogne-sur-mer.html` | 1808 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-calais.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-calais.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-calais.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-calais.html` | 1808 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-dunkerque.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-dunkerque.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-dunkerque.html` | 951 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-dunkerque.html` | 1810 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `electricien-saint-omer.html` | 961 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `electricien-saint-omer.html` | 961 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `electricien-saint-omer.html` | 961 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `electricien-saint-omer.html` | 1817 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `faq.html` | 220 | engagement « sous X (h/min) » | `sous 24h` | …as votre réponse&nbsp;?</h3> <p>Notre équipe vous rappelle sous 24h ouvrées avec une réponse personnalisée.</p> <a href="conta… |
| `guide-fuite-eau.html` | 456 | engagement « sous X (h/min) » | `Sous 24h` | …uite simple (joint d'évier, mitigeur usé)</li> <li><strong>Sous 24h ouvrées</strong> dans tous les cas — même si vous avez « ré… |
| `index.html` | 2665 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `mentions-legales.html` | 745 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `menuisier-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `menuisier-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `menuisier-dunkerque.html` | 1840 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `menuisier-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `menuisier-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `menuisier-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `menuisier-saint-omer.html` | 1848 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `nos-villes.html` | 339 | engagement « intervention sous X » | `intervention sous 2` | …~50 min depuis Saint-Omer. <strong>Devis gratuit</strong>, intervention sous 24-48h en standard.</p> <a href="depannage-boulogne-sur… |
| `ouverture-porte-claquee.html` | 283 | engagement « intervention sous X » | `intervention sous 1` | …)</h3> <p><strong>90 à 180€ TTC</strong><br>Sans casse, intervention sous 1-2h.</p> </div> <div class="op-card" style="border-left-… |
| `plombier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-boulogne-sur-mer.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-boulogne-sur-mer.html` | 1850 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-calais.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-calais.html` | 1850 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-coudekerque-branche.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-coulogne.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-dunkerque.html` | 966 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-dunkerque.html` | 1852 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-grande-synthe.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-guines.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-le-portel.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-marck.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-outreau.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-saint-martin-boulogne.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `plombier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `plombier-saint-omer.html` | 976 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `plombier-saint-omer.html` | 1858 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `plombier-teteghem.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `plombier-wimereux.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `pmr-dunkerque.html` | 923 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `pmr-dunkerque.html` | 923 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `pmr-dunkerque.html` | 923 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `pmr-dunkerque.html` | 1825 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `pmr-saint-omer.html` | 933 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `pmr-saint-omer.html` | 933 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `pmr-saint-omer.html` | 933 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `pmr-saint-omer.html` | 1894 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `realisations.html` | 1162 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-boulogne-sur-mer.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-boulogne-sur-mer.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-boulogne-sur-mer.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-boulogne-sur-mer.html` | 1807 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-calais.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-calais.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-calais.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-calais.html` | 1807 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-coudekerque-branche.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `serrurier-dunkerque.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-dunkerque.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-dunkerque.html` | 967 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-dunkerque.html` | 1810 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-marck.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `serrurier-outreau.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `serrurier-saint-omer.html` | 977 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `serrurier-saint-omer.html` | 977 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `serrurier-saint-omer.html` | 977 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `serrurier-saint-omer.html` | 1816 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `serrurier-wimereux.html` | 232 | engagement « sous X (h/min) » | `sous 2h` | …enir <strong>sous 24 à 48h</strong> en standard, et <strong>sous 2h en urgence</strong> (avec majoration soir/week-end).</p>… |
| `travaux-dunkerque.html` | 938 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `travaux-dunkerque.html` | 938 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `travaux-dunkerque.html` | 938 | engagement « sous X (h/min) » | `sous 24h` | …olor:#64748b">Catalogue tarifs transparents · devis gratuit sous 24h ouvrées</p> </div> </section> <section class="m-section"… |
| `travaux-dunkerque.html` | 938 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `travaux-dunkerque.html` | 1748 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `travaux-saint-omer.html` | 948 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `travaux-saint-omer.html` | 948 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `travaux-saint-omer.html` | 948 | engagement « sous X (h/min) » | `sous 24h` | …olor:#64748b">Catalogue tarifs transparents · devis gratuit sous 24h ouvrées</p> </div> </section> <section class="m-section"… |
| `travaux-saint-omer.html` | 948 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `travaux-saint-omer.html` | 1756 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `urgence.html` | 372 | engagement « sous X (h/min) » | `sous 24h` | …ce</li> <li>Sécurisation temporaire (planche/bâche) sous 24h ouvrées</li> <li>Devis remplacement vitrage</li>… |
| `vitrier-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `vitrier-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `vitrier-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …accident&nbsp;? Nous posons une planche / bâche en attente sous 24h ouvrées, puis remplacons à votre rythme. Devis pour votre a… |
| `vitrier-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `vitrier-dunkerque.html` | 1796 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `vitrier-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `vitrier-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `vitrier-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `vitrier-saint-omer.html` | 1804 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `volets-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `volets-dunkerque.html` | 944 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `volets-dunkerque.html` | 1797 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `volets-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …lass="m-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> <div class="m-trust-… |
| `volets-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …"display:block;color:#0A1428;font-size:.96rem">Devis simple sous 24h ouvrées</strong> <span style="font-size:.76rem;co… |
| `volets-saint-omer.html` | 954 | engagement « sous X (h/min) » | `sous 24h` | …9;line-height:1.5">Notre équipe vous rappelle <strong>Devis sous 24h ouvrées ouvrées</strong> avec le tarif personnalisé.</p> <… |
| `volets-saint-omer.html` | 1826 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |
| `zones-intervention.html` | 791 | engagement « sous X (h/min) » | `sous 24h` | …lass="z-cta-text"><strong>Être rappelé</strong><small>Devis sous 24h ouvrées</small></span> </a> </div> </div> <div class="… |
| `zones-intervention.html` | 1370 | engagement « rappel sous … » | `Rappel sous` | …x-shadow:0 0 0 3px rgba(34,212,142,.3)"></span> En ligne · Rappel sous&nbsp;<strong style="color:#fff">1h</strong> </div> </div>… |

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
