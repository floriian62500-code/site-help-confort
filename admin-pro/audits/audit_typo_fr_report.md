# Audit typographie FR (espaces insécables) — 2026-05-20 06:52

Sonde MEMOIRE #52 — la ponctuation haute (?!:;») doit être précédée d'une espace **insécable** (`&nbsp;`, U+00A0, U+202F). Seuil d'alerte : > **5** occurrences fautives par page.

## Synthèse

- Pages auditées : **80**
- Pages clean (≤ seuil) : **16**
- Pages avec alerte : **64**
- Occurrences fautives cumulées : **1207**

## ⚠️ Pages au-delà du seuil

| Page | Fautifs | Échantillons |
|------|---------|--------------|
| `faq.html` | **38** | `…ies, zones d'intervention : les réponses aux 15 ques…` · `…n technicien HELP Confort ? Notre tarif horaire est…` · `…TC) pour tous nos métiers : plomberie, chauffage, él…` |
| `mentions-legales.html` | **31** | `…ur du site Raison sociale : SARL Dépan'Audo Nom comm…` · `…Dépan'Audo Nom commercial : HELP Confort Saint-Omer…` · `…t Saint-Omer Siège social : 242 route de Boulogne, 6…` |
| `chauffagiste-calais.html` | **29** | `…etien annuel, désembouage : nos chauffagistes HELP C…` · `…dép. 👋 Chaudière en panne ? Plus d'eau chaude ? Je v…` · `…panne ? Plus d'eau chaude ? Je vous mets en relation…` |
| `chauffagiste-boulogne-sur-mer.html` | **27** | `…retien annuel obligatoire : nos chauffagistes HELP C…` · `…dép. 👋 Chaudière en panne ? Plus d'eau chaude ? Je v…` · `…panne ? Plus d'eau chaude ? Je vous mets en relation…` |
| `vitrier-dunkerque.html` | **27** | `…é, fissure, bris de glace : nos vitriers HELP Confor…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `volets-dunkerque.html` | **27** | `…isation, dépannage moteur : nos techniciens HELP Con…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `a-propos.html` | **26** | `…par deux agences locales : Dépan'Audo à Saint-Marti…` · `…vec une conviction simple : les habitants de Saint-O…` · `…manque souvent au métier : l'organisation. Un stand…` |
| `chauffagiste-dunkerque.html` | **26** | `…etien annuel, désembouage : nos chauffagistes HELP C…` · `…dép. 👋 Chaudière en panne ? Plus d'eau chaude ? Je v…` · `…panne ? Plus d'eau chaude ? Je vous mets en relation…` |
| `serrurier-boulogne-sur-mer.html` | **26** | `…e, blindage, cylindre A2P : nos serruriers HELP Conf…` · `…le Indép. 👋 Porte claquée ? Clé cassée ? Un serrurie…` · `…orte claquée ? Clé cassée ? Un serrurier intervient…` |
| `chauffagiste-saint-omer.html` | **25** | `…retien annuel obligatoire : nos chauffagistes interv…` · `…dép. 👋 Chaudière en panne ? Plus d'eau chaude ? Je v…` · `…panne ? Plus d'eau chaude ? Je vous mets en relation…` |
| `menuisier-dunkerque.html` | **25** | `…es, panneaux PVC, parquet : nos menuisiers HELP Conf…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `plombier-calais.html` | **25** | `…erche de fuite, sanitaire : nos plombiers HELP Confo…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `serrurier-calais.html` | **25** | `…age, cylindre de sécurité : nos serruriers HELP Conf…` · `…le Indép. 👋 Porte claquée ? Clé cassée ? Un serrurie…` · `…orte claquée ? Clé cassée ? Un serrurier intervient…` |
| `serrurier-dunkerque.html` | **25** | `…age, cylindre de sécurité : nos serruriers HELP Conf…` · `…le Indép. 👋 Porte claquée ? Clé cassée ? Un serrurie…` · `…orte claquée ? Clé cassée ? Un serrurier intervient…` |
| `electricien-calais.html` | **24** | `…en sécurité, installation : nos électriciens HELP Co…` · `…dép. 👋 Coupure de courant ? Tableau qui saute ? J'en…` · `…urant ? Tableau qui saute ? J'envoie un électricien.…` |
| `plombier-boulogne-sur-mer.html` | **24** | `…erche de fuite, sanitaire : nos plombiers HELP Confo…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `plombier-dunkerque.html` | **24** | `…erche de fuite, sanitaire : nos techniciens HELP Con…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `volets-saint-omer.html` | **24** | `…tablier cassé, pose neuve : nos techniciens intervie…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `electricien-dunkerque.html` | **23** | `…en sécurité, installation : nos électriciens HELP Co…` · `…dép. 👋 Coupure de courant ? Tableau qui saute ? J'en…` · `…urant ? Tableau qui saute ? J'envoie un électricien.…` |
| `pmr-dunkerque.html` | **23** | `…monte-escalier, accès PMR : nos artisans labellisés…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `travaux-dunkerque.html` | **23** | `…e, plafond, peinture, sol : nos équipes HELP Confort…` · `…👋 Un projet de rénovation ? Salle de bain, cuisine,…` · `…lle de bain, cuisine, PMR : parlons de votre chantie…` |
| `vitrier-saint-omer.html` | **23** | `…sur-mesure, sécurisation : nos vitriers intervienne…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `electricien-boulogne-sur-mer.html` | **22** | `…en sécurité, installation : nos électriciens HELP Co…` · `…dép. 👋 Coupure de courant ? Tableau qui saute ? J'en…` · `…urant ? Tableau qui saute ? J'envoie un électricien.…` |
| `menuisier-saint-omer.html` | **22** | `…sur-mesure, sécurisation : nos vitriers intervienne…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `plombier-saint-omer.html` | **22** | `…erche de fuite, sanitaire : nos techniciens intervie…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `depannage-calais.html` | **21** | `…uffage, une porte bloquée ? Notre équipe basée à Sai…` · `…Poste Dépannage à Calais : ce qu'il faut savoir Not…` · `…contraintes que Dunkerque : eau dure (calcaire), air…` |
| `depannage-coquelles.html` | **21** | `…uffage, une porte bloquée ? Notre équipe basée à Sai…` · `…e Coquelles & Cité Europe : beaucoup de logements mo…` · `…che. Particularités local : proximité immédiate de l…` |
| `depannage-saint-pol-sur-mer.html` | **21** | `…uffage, une porte bloquée ? Notre équipe basée à Sai…` · `…tite-Synthe, Fort-Mardyck : commune intégrée à Dunke…` · `…entiques. Habitat typique : mélange maisons individu…` |
| `serrurier-saint-omer.html` | **21** | `…cée, clé cassée, blindage : nos serruriers intervien…` · `…le Indép. 👋 Porte claquée ? Clé cassée ? Un serrurie…` · `…orte claquée ? Clé cassée ? Un serrurier intervient…` |
| `depannage-boulogne-sur-mer.html` | **20** | `…uffage, une porte bloquée ? Notre équipe basée à Sai…` · `…mme tout le littoral nord : eau dure, air marin agre…` · `…Délai d'arrivée Boulogne : en heures ouvrées selon…` |
| `depannage-dunkerque.html` | **20** | `…ts de Coudekerque-Branche : sur le dunkerquois , cha…` · `…age habitat sur Dunkerque : notre expertise du bâti…` · `…uois a ses particularités : corrosion accélérée par…` |
| `depannage-sangatte.html` | **20** | `…uffage, une porte bloquée ? Notre équipe basée à Sai…` · `…-Plage, Wissant, Escalles : littoral exposé, beaucou…` · `…es résidences secondaires : nous proposons un passag…` |
| `electricien-saint-omer.html` | **20** | `…se aux normes NF C 15-100 : nos électriciens qualifi…` · `…dép. 👋 Coupure de courant ? Tableau qui saute ? J'en…` · `…urant ? Tableau qui saute ? J'envoie un électricien.…` |
| `panne-chaudiere.html` | **20** | `…e de pression, eau froide : nos chauffagistes diagno…` · `…à 1-1.5 bar. Si récurrent : fuite circuit. EA / E1 S…` · `…apides Pression chaudière : doit être entre 1 et 1.5…` |
| `contrats-entretien.html` | **19** | `…ioul ou adoucisseur d'eau : choisissez la formule qu…` · `…des formules… Cadre légal : Tarifs HT, TVA en vigueu…` · `…tement la visite annuelle ? Pour une chaudière gaz :…` |
| `guide-mise-aux-normes-electriques.html` | **19** | `…s électriques NF C 15-100 : le guide complet 📖 7 min…` · `…a norme s'applique-t-elle ? La NF C 15-100 est oblig…` · `…atoire dans plusieurs cas : Construction neuve (touj…` |
| `pmr-saint-omer.html` | **19** | `…PMR, élargissement portes : nos équipes adaptent vot…` · `…tville Indép. 👋 Une fuite ? Un dégorgement ? Je vous…` · `…ne fuite ? Un dégorgement ? Je vous oriente vers le…` |
| `travaux-saint-omer.html` | **19** | `…enuiserie, adaptation PMR : un seul interlocuteur po…` · `…👋 Un projet de rénovation ? Salle de bain, cuisine,…` · `…lle de bain, cuisine, PMR : parlons de votre chantie…` |
| `depannage-saint-omer.html` | **18** | `…uffage, une porte bloquée ? Notre équipe basée à Sai…` · `…Omer, le bâti est typique : maisons audomaroises en…` · `…ans une fermette d'Arques : on intervient avec le bo…` |
| `guide-adaptation-pmr.html` | **18** | `…ment Adapter son logement : PMR & maintien à domicil…` · `…s , ce n'est plus un luxe : c'est une condition souv…` · `…quoi adapter son logement ? Le maintien à domicile e…` |
| `ouverture-porte-claquee.html` | **16** | `…ns la serrure, clé perdue : nos serruriers intervien…` · `…dans la panique, vérifiez : numéro de SIRET, adresse…` · `…Décrivez votre situation : claquée, clé bloquée, se…` |
| `index.html` | **15** | `…r avec un seul engagement : diagnostic clair, devis…` · `…pond rapidement 👋 Bonjour ! Je vous guide en 4 étape…` · `…Une question vous bloque ? Notre équipe finalise vo…` |
| `urgence.html` | **15** | `…rt-circuit, porte claquée : appelez-nous en priorité…` · `…l'assurance Appelez-nous : 03 66 10 01 34 → Guide c…` · `…) Code erreur sur l'écran ? Chauffage d'appoint sécu…` |
| `guide-fuite-eau.html` | **14** | `…Fuite d'eau : les 5 réflexes immédiats…` · `…eau Plomberie Fuite d'eau : les 5 réflexes immédiats…` · `…vrez une fuite. Réflexe 1 : Couper l'eau C'est la pr…` |
| `remplacement-chauffe-eau.html` | **14** | `…vieux ou trop énergivore : nos plombiers remplacent…` · `…remplacer son chauffe-eau ? Voici les signaux clairs…` · `…anticiper le remplacement : Plus de 12 ans Cuve frag…` |
| `diagnostic-electrique.html` | **13** | `…ntion ⚖️ Qui est concerné ? Le DEO est obligatoire s…` · `…s ou rénovations récentes : l'attestation Consuel su…` · `…suffit. Durée de validité : 3 ans pour vente · 6 ans…` |
| `depannage-saint-martin-lez-tatinghem.html` | **11** | `…ez-Tatinghem ou Tatinghem ? Notre dépôt est sur la c…` · `…rerie, volets, rénovation : tous les métiers du bâti…` · `…llons de la rue de Calais : nous connaissons chaque…` |
| `aides.html` | **10** | `…E, MaPrimeAdapt', éco-PTZ : les dispositifs sont nom…` · `…on Information importante : les aides présentées sur…` · `…P Confort des dispositifs : mai 2026 · Consultez les…` |
| `debouchage-canalisation.html` | **10** | `…refoulement entre pièces : nos plombiers intervienn…` · `…un pro pour un débouchage ? Tous les bouchons ne se…` · `…ppeler un plombier équipé : Refoulement entre pièces…` |
| `entretien-chaudiere.html` | **10** | `…vous ⚖️ Obligation légale : en France, l'entretien a…` · `…oup d'œil + une signature : c'est 45 à 60 minutes de…` · `…geux qu'un passage unique : tarif fixe annuel, passa…` |
| `guide-entretien-chaudiere.html` | **10** | `…Entretien chaudière : la loi — Guide HELP Conf…` · `…e Entretien chaudière gaz : tout ce que dit la loi 📖…` · `…nt. On vous explique tout : pourquoi c'est obligatoi…` |
| `contact.html` | **9** | `…remplissez le formulaire : nous vous rappelons rapi…` · `…es Bureaux &amp; standard : du lundi au vendredi 9h-…` · `…h-16h Urgences techniques : sur rendez-vous en journ…` |
| `depannage-gravelines.html` | **9** | `…es ou Petit-Fort-Philippe ? Notre équipe HELP Confor…` · `…, c'est un mélange unique : maisons en brique du cen…` · `…nt pour les installations : corrosion accélérée, joi…` |
| `depannage-longuenesse.html` | **9** | `…uffage, une porte bloquée ? Notre équipe basée juste…` · `…rès du parc Pierre Mauroy : intervention rapide, piè…` · `…ion urgente à Longuenesse ? Longuenesse étant juste…` |
| `tarifs.html` | **9** | `…4 Engagement transparence : nous annonçons le tarif…` · `…ès intervention. Vérifiez : SIRET visible, adresse p…` · `…'un plombier à Saint-Omer ? Le forfait déplacement e…` |
| `depannage-bergues.html` | **8** | `…ues, la « Bruges flamande » ? Notre équipe HELP Conf…` · `…s, la « Bruges flamande » ? Notre équipe HELP Confor…` · `…un patrimoine bâti unique : remparts Vauban, beffroi…` |
| `zones-intervention.html` | **8** | `…e, vitrerie et rénovation : 2 agences locales (Dépan…` · `…recommande sans hésiter. » M Mathieu D. Saint-Omer…` · `…é, finitions impeccables. » S Sophie L. Dunkerque ★★…` |
| `depannage-arques.html` | **7** | `…oin d'un dépannage rapide ? Notre équipe basée à Sai…` · `…la zone du Bras Delattre : on s'adapte au type d'ha…` · `…à Arques en cas d'urgence ? En horaires d'ouverture,…` |
| `pro.html` | **7** | `…ollectivités, entreprises : HELP Confort Saint-Omer…` · `…as de prestataire externe : la même équipe du devis…` · `…habitat traités de A à Z : intervention conservatoi…` |
| `processus.html` | **7** | `…le site, message Facebook : peu importe le canal. Vo…` · `…t disponibilités. Urgence : intervention rapide sur…` · `…nkerque. Demande standard : créneau selon agenda. Tr…` |
| `agence-dunkerque.html` | **6** | `…nformations légales Forme : Dépan'DK SIREN : 898 196…` · `…es Forme : Dépan'DK SIREN : 898 196 159 RCS : Boulog…` · `…K SIREN : 898 196 159 RCS : Boulogne-sur-Mer Assuran…` |
| `agence-saint-omer.html` | **6** | `…nformations légales Forme : SARL Dépan'Audo SIREN :…` · `…e : SARL Dépan'Audo SIREN : 898 196 159 RCS : Boulog…` · `…o SIREN : 898 196 159 RCS : Boulogne-sur-Mer Assuran…` |
| `blog.html` | **6** | `…quence, prix, attestation : tout savoir sur l'entret…` · `…a source, dégâts des eaux : les bons réflexes à avoi…` · `…el, diagnostic électrique : ce qu'il faut faire mett…` |
| `sinistres.html` | **6** | `…hnique Sinistre chez vous ? Nous intervenons techniq…` · `…l'ouverture. La priorité : limiter l'aggravation du…` · `…e à votre charge. À noter : ce formulaire est en ver…` |

## Top 5 pages les plus chargées

- `faq.html` : 38 occurrence(s)
- `mentions-legales.html` : 31 occurrence(s)
- `chauffagiste-calais.html` : 29 occurrence(s)
- `chauffagiste-boulogne-sur-mer.html` : 27 occurrence(s)
- `vitrier-dunkerque.html` : 27 occurrence(s)
