# Acquisition payante « entretien » — Google Ads + Meta (préparation, septembre 2026)

Directive 5728009113. **Préparation uniquement** : aucune campagne créée, aucun budget engagé, aucune balise publicitaire installée, rien en production. Activation = **GO Florian**, une fois les gates du §9 levés.

Source de vérité des prestations et des prix :
- catalogue `v_services_public` : entretien chaudière gaz **121 € TTC**, fioul **178,20 € TTC**, fioul gros volume **218,90 € TTC** ;
- contrats `v_contract_offers`, en TTC par mois : gaz BASIC **9,90 €**, CONFORT **14,30 €**, SÉCURITÉ **25,30 €** ; fioul BASIC **13,20 €**, CONFORT **17,60 €**, SÉCURITÉ **29,70 €** ;
- relevé du 18/09/2026, contrôlé en ligne par `scripts/tests/smoke.mjs`.

Aucune annonce ne cite une prestation, une zone ou un prix absents de ces sources ou des pages du site.

---

## 0. Statut par famille

| Famille | Ce que l'entreprise propose réellement (preuve) | Page d'atterrissage | Statut |
|---|---|---|---|
| **A. Chaudières** (gaz, fioul) | Entretien ponctuel au catalogue (gaz 121 €, fioul 178,20 € / 218,90 € TTC) ; contrats BASIC / CONFORT / SÉCURITÉ ; page `entretien-chaudiere.html` | `entretien-chaudiere.html` → tunnel sur les prestations chauffage à prix ferme | **READY** (préparé) |
| **B. Poêles / inserts** (bois, granulés) | Barème agence transmis par Florian le 18/09/2026 (directive 5733225819) : **EPB** entretien annuel poêle / insert à bois, ramonage compris, **115 € HT** ; **EPG** poêle / insert à granulés, ramonage compris, **136 € HT**. TTC : 126,50 / 149,60 € (TVA 10 %, logement de plus de 2 ans), 138 / 163,20 € (TVA 20 %). Référence interne : `admin-pro/TARIFS_REFERENCE.md`. Pas encore au catalogue en ligne : les deux lignes sont prêtes (`supabase/_pending_migrations/20260919100000_catalogue_entretien_poele_insert.sql`) et le site sait déjà les afficher (sous-groupe « Entretien & dépannage », icône 🔥, famille de mesure « poele » dans le tunnel) ; application reportée par Florian le 22/09 (« pas maintenant »). D'ici là, la demande passe par le formulaire de rappel de la page. | `prestations/ramonage.html#poele-insert` → formulaire de rappel | **READY** (préparé) |
| **C. Ramonage** (cheminée, conduit de chaudière ; poêle et insert : voir B, **même page canonique**, ancre `#poele-insert`) | Page `prestations/ramonage.html` : ramonage mécanique, vérification du tirage, contrôle du conduit, certificat. **Pas de prix au catalogue.** | `prestations/ramonage.html` → formulaire court « Demande de rappel » | **READY** (préparé, prix non affiché) |

**Activation : `CAMPAIGN_GO_LIVE=NO_GO`**. Les pages corrigées et la mesure ne sont qu'en recette, et les gates de production sont ouverts (§9).

---

## 1. Audit de l'existant

### Pages concernées
| Page | Rôle | Constat | Action |
|---|---|---|---|
| `entretien-chaudiere.html` | Meilleure page chaudière (contrôles détaillés, obligation légale, FAQ) | ❌ Le bouton principal « Prendre rendez-vous » menait à l'ancien formulaire **supprimé** (`#hc-reservation`) ; ❌ formules **inventées** (Essentiel 130 €, Sérénité 175 €, Tranquillité 210 €) ; ❌ FAQ « 110-180 € » et « 130 à 210 €/an » (page et données structurées) ; ❌ « priorité en cas de panne » promise à tous les contrats (la formule gaz BASIC n'en a pas) ; ❌ « MaPrimeRénov + CEE peuvent couvrir 50-70 % » ; ❌ « granulés » dans les descriptions (hors catalogue) ; ❌ qualifications (Qualigaz, PGN, PGP) citées dans les données structurées mais affichées nulle part ; ❌ rappel « 2-3 semaines avant » (le catalogue dit 1 mois) ; ❌ 2 questions de FAQ présentes en données structurées mais absentes de la page ; ⚠️ aucune mesure GA4 (seulement `hc-tracking.js`, dont les événements ne partent pas) | ✅ **Corrigé** (`08cebf89` + commit de ce dossier) : bouton unique « Demander mon entretien » → tunnel ; vraies formules, prix et conditions (SÉCURITÉ : chaudières de moins de 5 ans) ; FAQ identique entre page et données structurées (5 questions) ; plus aucune promesse non adossée au catalogue ; mesure ajoutée |
| `contrats-entretien.html` | Formules et souscription (prélèvement) | ⚠️ En PROD, la souscription affiche succès **et** erreur (RLS) ; correctif en recette (`docs/control/CONTRACT-RLS-GATE.md`) | Lien secondaire seulement, jamais page d'atterrissage payante tant que le gate n'est pas levé |
| `prestations/ramonage.html` | Page ramonage | ❌ « Intervention en 1h » (non garanti) ; ❌ « Garantie complète », « Aides & éligibilité » (faux ou vague) ; ❌ « 60-90 € TTC » sans source ; ❌ coquille « ouvrées ouvrées » ; ⚠️ aucune mesure GA4 | ✅ **Corrigé** : engagements vrais (rappel sous 24 h ouvrées, certificat remis), prix retiré en attendant un tarif au catalogue, mesure ajoutée |
| `guide-entretien-chaudiere.html`, `blog-entretien-chaudiere-annuel-obligatoire.html` | Contenu informatif | Pages de contenu, pas d'atterrissage payant (trop de lecture avant l'action) | Aucune ; utiles en liens annexes |
| `chauffagiste-<ville>.html` (8 villes) | SEO local chauffage | Mentionnent « Entretien annuel… ramonage… » en renvoi | Aucune ; pas de doublon créé |
| `prestations/vitrage-insert-poele.html` | Remplacement de vitre d'insert ou de poêle (sur devis) | **Pas** de l'entretien : hors campagne | Mot-clé négatif « vitre » (§3) |

### Points transverses
- **Promesses** : les deux pages d'atterrissage ne contiennent plus que des engagements vérifiables (tests `scripts/tests/ads-landing.test.mjs`).
- **Agence unique** : les annonces disent « Agence HELP Confort de Saint-Omer » et « Saint-Omer et Côte d'Opale », jamais deux agences. Le pied de page commun du site affiche « Agence Saint-Omer & Dunkerque » : les annonces ne doivent pas suggérer une agence à Dunkerque. C'est une zone d'intervention, pas une implantation.
- **Mesure** : GA4 est actif en production (`G-YH9GXW6H70`) **après consentement uniquement**. GTM et Clarity sont inactifs (identifiants factices). Aucune balise Google Ads, aucun pixel Meta.
- **Consentement** : la bannière actuelle est binaire (mesure d'audience). Il n'existe **pas de Consent Mode v2** (`ad_storage`, `ad_user_data`, `ad_personalization`), obligatoire avant toute balise Google Ads ou Meta dans l'UE.
- **Attribution du dossier** : UTM, `gclid` et `fbclid` sont enregistrés dans le dossier (`utm.attribution`), mais uniquement si le visiteur a accepté les cookies (`assets/tracking.js`). La page d'atterrissage d'origine (`attribution.landing`) est désormais **toujours** jointe au dossier : ce n'est pas une donnée personnelle.

---

## 2. Architecture des campagnes

| Campagne (nom technique) | Réseau | Groupes d'annonces | Page de destination |
|---|---|---|---|
| `SRCH_ENTRETIEN-CHAUDIERE_SO50` | Google Search uniquement (sans Display ni partenaires au lancement) | A1 Entretien gaz · A2 Entretien fioul · A3 Contrat d'entretien · A4 Entretien + ville | `https://depan59-62.fr/entretien-chaudiere.html` |
| `SRCH_ENTRETIEN-POELE-INSERT_SO50` | Google Search uniquement | B1 Poêle à granulés · B2 Poêle ou insert à bois · B3 Ramonage poêle / insert | `https://depan59-62.fr/prestations/ramonage.html#poele-insert` |
| `SRCH_RAMONAGE_SO50` | Google Search uniquement | C1 Ramonage cheminée · C3 Ramonage conduit de chaudière · C4 Certificat de ramonage (C2 déplacé en B3) | `https://depan59-62.fr/prestations/ramonage.html` |
| `META_ENTRETIEN_SO50` | Facebook + Instagram | 3 angles : chaudière · poêle & insert (entretien, ramonage compris) · ramonage cheminée / conduit | selon l'angle (§5) |

**Relais sur le site (sans budget)** : l'accueil porte depuis le 19/09 une relance saisonnière « Entretien et ramonage : préparez votre chauffage » juste après « Que souhaitez-vous faire ? » : bouton « Entretien chaudière », liens « Poêle ou insert » et « Ramonage », sans prix (directive 5733153347). Elle mène aux mêmes pages que les annonces.

**Réglages communs Google :**
- **Zone** : rayon de **50 km autour de l'agence** (50.7508, 2.2522). C'est la même règle que le tunnel, qui classe « dans notre zone » jusqu'à 50 km et « limite de zone » entre 50 et 70 km. Option « Présence : personnes qui se trouvent ou se rendent régulièrement dans la zone » ; la Belgique est exclue.
- **Langue** : français.
- **Horaires** : annonces toute la journée. L'élément d'appel n'est actif qu'aux heures d'ouverture (lun–ven 9h–17h, sam 9h–16h).
- **Enchères** : « Maximiser les conversions » (conversion `generate_lead`), puis coût par acquisition cible après environ 30 conversions. **Budget : non fixé, décision Florian.**
- **Appareils** : tous ; vérifier le mobile en priorité.

---

## 3. Google Ads — mots-clés

Types de correspondance : `"expression"` et `[exacte]`. Pas de requête large au lancement. Les noms de villes viennent des pages existantes du site, toutes dans le rayon de 50 km.

### A. Chaudières
**A1 — Entretien chaudière gaz**
- `"entretien chaudière gaz"`, `[entretien chaudière gaz]`
- `"entretien annuel chaudière gaz"`, `"révision chaudière gaz"`, `"visite annuelle chaudière gaz"`
- `"entretien chaudière gaz prix"`, `"tarif entretien chaudière gaz"`
- `"attestation entretien chaudière"`, `"chauffagiste entretien chaudière"`
- `"entretien chaudière saint omer"`, `[entretien chaudière saint omer]`

**A2 — Entretien chaudière fioul**
- `"entretien chaudière fioul"`, `[entretien chaudière fioul]`
- `"entretien annuel chaudière fioul"`, `"révision chaudière fioul"`
- `"entretien brûleur fioul"`, `"nettoyage chaudière fioul"`, `"entretien chaudière fioul prix"`

**A3 — Contrat d'entretien**
- `"contrat entretien chaudière"`, `[contrat entretien chaudière]`
- `"contrat entretien chaudière gaz"`, `"contrat entretien chaudière fioul"`
- `"abonnement entretien chaudière"`, `"contrat maintenance chaudière"`

**A4 — Entretien + ville**
- `"entretien chaudière dunkerque"`, `"entretien chaudière calais"`, `"entretien chaudière boulogne sur mer"`
- `"entretien chaudière gravelines"`, `"entretien chaudière grande synthe"`, `"entretien chaudière longuenesse"`, `"entretien chaudière arques"`
- `"entretien chaudière coudekerque"`, `"entretien chaudière bergues"`, `"entretien chaudière guines"`, `"entretien chaudière marck"`

**Négatifs de campagne A :**
- Emploi : emploi, recrutement, salaire, formation, cap, bac pro, alternance, apprenti, stage.
- Bricolage et information : tuto, tutoriel, vidéo, youtube, soi même, comment faire, notice, manuel, pdf, schéma.
- Achat de matériel : achat, acheter, vente, occasion, pièce, pièces détachées, leroy merlin, castorama, brico, amazon.
- Autres prestations : chaudière neuve, installation, remplacement, changement chaudière, prix chaudière, maprimerénov, prime, aide, pompe à chaleur, pac, climatisation, clim, chauffe eau, poêle, insert, granulés, pellets, vitre, ramonage.
- Gratuité : gratuit.
- Villes hors zone : lille, arras, amiens, lens, paris, belgique.

### C. Ramonage
**C1 — Ramonage cheminée**
- `"ramonage cheminée"`, `[ramonage cheminée]`, `"ramonage conduit cheminée"`
- `"ramoneur"`, `"ramoneur saint omer"`, `"ramonage saint omer"`, `[ramonage saint omer]`

**C2** : déplacé en **B3** (entretien poêle / insert, ramonage compris).

**C3 — Conduit de chaudière**
- `"ramonage conduit chaudière"`, `"ramonage chaudière fioul"`, `"ramonage chaudière"`

**C4 — Certificat**
- `"certificat de ramonage"`, `"attestation ramonage"`, `"ramonage obligatoire assurance"`

**Villes** (dans C1) : `"ramonage dunkerque"`, `"ramonage calais"`, `"ramonage boulogne sur mer"`, `"ramonage gravelines"`, `"ramonage longuenesse"`, `"ramonage arques"`.

**Négatifs de campagne C :**
- Emploi, bricolage et achat : mêmes listes que la campagne A.
- Matériel de ramonage vendu aux particuliers : kit ramonage, hérisson, bûche ramonage, brosse, tubage (sauf si la prestation est confirmée).
- Renvoyés vers la campagne B : poêle, insert, granulés, pellets.
- Autres campagnes : entretien chaudière (évite le chevauchement avec A).
- Villes hors zone : même liste que la campagne A.

### B. Poêles / inserts (barème EPB / EPG, ramonage compris)
**B1 — Poêle à granulés**
- `"entretien poêle à granulés"`, `[entretien poêle à granulés]`, `"entretien poêle granulés"`, `"révision poêle à granulés"`, `"entretien poêle pellet"`, `"entretien poêle à granulés saint omer"`

**B2 — Poêle ou insert à bois**
- `"entretien poêle à bois"`, `[entretien poêle à bois]`, `"entretien insert"`, `"entretien insert cheminée"`, `"entretien insert bois"`

**B3 — Ramonage poêle / insert** (l'offre comprend l'entretien : les annonces ne parlent jamais de « ramonage seul »)
- `"ramonage poêle à bois"`, `"ramonage poêle à granulés"`, `"ramonage insert"`, `"ramonage conduit poêle"`, `"ramonage poêle saint omer"`

**Négatifs de campagne B :**
- Emploi, bricolage et achat : mêmes listes que la campagne A.
- Achat et installation : achat poêle, poêle neuf, installation poêle, prix poêle, tubage.
- Combustible : sac granulés, livraison granulés, granulés pas cher, vente pellets.
- Autres prestations : vitre (remplacement de vitre d'insert : autre prestation), chaudière (→ A), cheminée seule (→ C).
- Villes hors zone : même liste que la campagne A.

---

## 4. Google Ads — annonces responsives (RSA) et éléments

Longueurs vérifiées : titres de 30 caractères au plus, descriptions de 90 au plus, liens annexes de 25, accroches de 25. Les prix sont TTC.

### A1 — Entretien chaudière gaz
Titres :
- H: Entretien gaz 121 € TTC
- H: Entretien chaudière gaz
- H: Agence HELP Confort Saint-Omer
- H: Attestation remise sur place
- H: Techniciens salariés
- H: Prix ferme affiché d'avance
- H: Demande en ligne 24 h/24
- H: Rappel sous 24 h ouvrées
- H: Contrat dès 9,90 € TTC/mois
- H: Entretien annuel obligatoire
- H: Saint-Omer et Côte d'Opale
- H: Mesures CO et combustion
- H: Chauffagiste à Saint-Omer
- H: Pensez-y avant l'hiver
- H: Noté 4,7/5 sur Google

Descriptions :
- D: Visite annuelle obligatoire et attestation remise. Prix ferme affiché avant l'envoi.
- D: Chaudière gaz : 121 € TTC. Ou contrat annuel dès 9,90 € TTC/mois, visite comprise.
- D: Agence HELP Confort de Saint-Omer : techniciens salariés, un interlocuteur unique.
- D: Demandez en ligne : l'agence vous rappelle sous 24 h ouvrées pour fixer le créneau.

### A2 — Entretien chaudière fioul
Titres :
- H: Entretien chaudière fioul
- H: Fioul dès 178,20 € TTC
- H: Brûleur nettoyé et réglé
- H: Attestation remise sur place
- H: Agence HELP Confort Saint-Omer
- H: Techniciens salariés
- H: Prix ferme affiché d'avance
- H: Rappel sous 24 h ouvrées
- H: Contrat fioul dès 13,20 €/mois
- H: Entretien annuel obligatoire
- H: Saint-Omer et Côte d'Opale
- H: Mesures de combustion
- H: Demande en ligne 24 h/24
- H: Pensez-y avant l'hiver
- H: Chauffagiste à Saint-Omer

Descriptions :
- D: Nettoyage et réglage du brûleur, contrôles de sécurité, attestation remise.
- D: Chaudière fioul dès 178,20 € TTC. Contrat annuel dès 13,20 € TTC/mois.
- D: Prix ferme affiché avant l'envoi. L'agence vous rappelle sous 24 h ouvrées.
- D: Agence HELP Confort de Saint-Omer : techniciens salariés, sur la Côte d'Opale.

### A3 — Contrat d'entretien
Titres :
- H: Contrat d'entretien chaudière
- H: Gaz dès 9,90 € TTC/mois
- H: Fioul dès 13,20 € TTC/mois
- H: Visite et attestation incluses
- H: Rappel automatique annuel
- H: 3 formules : BASIC à SÉCURITÉ
- H: 2 dépannages/an en CONFORT
- H: CONFORT : intervention 48 h
- H: Agence HELP Confort Saint-Omer
- H: Techniciens salariés
- H: Prélèvement mensuel
- H: Saint-Omer et Côte d'Opale
- H: Entretien annuel obligatoire
- H: Ne plus y penser chaque année
- H: Chauffagiste à Saint-Omer

Chaque titre ne promet que ce que contient la formule citée. Le « statut prioritaire » n'existe qu'en fioul ; le délai d'intervention garanti commence à CONFORT (48 h), puis 24 h en SÉCURITÉ. Aucune annonce ne cite SÉCURITÉ sans sa condition : chaudière de moins de 5 ans, après contrôle technique.

Descriptions :
- D: Gaz dès 9,90 € TTC/mois, fioul dès 13,20 € TTC/mois : visite, attestation, rappel.
- D: CONFORT : 2 dépannages par an inclus et intervention sous 48 h maximum.
- D: Contrat d'un an renouvelable, résiliable à chaque échéance. Détail des formules en ligne.
- D: Agence HELP Confort de Saint-Omer : techniciens salariés, un interlocuteur unique.

### A4 — Entretien + ville
Reprendre les titres d'A1 et ajouter l'insertion de mot-clé `{KeyWord:Entretien chaudière}` (30 caractères au plus).

### C — Ramonage (C1 à C4, titres communs puis spécialisation)
Titres :
- H: Ramonage cheminée et insert
- H: Certificat de ramonage remis
- H: Poêle à bois, insert, conduit
- H: Agence HELP Confort Saint-Omer
- H: Rappel sous 24 h ouvrées
- H: Techniciens salariés
- H: Devis gratuit, sans engagement
- H: Obligatoire 1 à 2 fois par an
- H: Vérification du tirage
- H: Demandé par votre assureur
- H: Saint-Omer et Côte d'Opale
- H: Ramoneur à Saint-Omer
- H: Conduit de chaudière aussi
- H: Avant l'hiver, pensez-y
- H: Prix confirmé avant passage

Descriptions :
- D: Ramonage de cheminée, insert, poêle à bois et conduit de chaudière. Certificat remis.
- D: Tarif confirmé avant l'intervention, sans engagement. Rappel sous 24 h ouvrées.
- D: Ramonage mécanique, vérification du tirage et contrôle du conduit par nos techniciens.
- D: Agence HELP Confort de Saint-Omer, pour Saint-Omer et toute la Côte d'Opale.

Spécialisation : C2 met en tête « Poêle à bois, insert, conduit » ; C3 « Conduit de chaudière aussi » ; C4 « Certificat de ramonage remis ».

### B — Entretien poêle & insert (B1 à B3)
Pas de prix dans ces annonces : le TTC dépend du logement (TVA 10 % ou 20 %), la page affiche le HT et les deux TTC.

Titres :
- H: Entretien poêle et insert
- H: Ramonage compris
- H: Poêle à bois ou à granulés
- H: Entretien poêle à granulés
- H: Entretien insert à bois
- H: Certificat de ramonage remis
- H: Agence HELP Confort Saint-Omer
- H: Techniciens salariés
- H: Rappel sous 24 h ouvrées
- H: Tarifs affichés HT et TTC
- H: Saint-Omer et Côte d'Opale
- H: Avant l'hiver, pensez-y
- H: Demande en ligne 24 h/24
- H: Un rendez-vous, deux besoins
- H: Un certificat pour l'assureur

Descriptions :
- D: Entretien annuel de votre poêle ou insert, bois ou granulés, avec le ramonage du conduit.
- D: Tarifs affichés en HT et en TTC. L'agence vous rappelle sous 24 h ouvrées.
- D: Certificat de ramonage remis, à conserver : votre assureur peut vous le demander.
- D: Agence HELP Confort de Saint-Omer : techniciens salariés, Saint-Omer et Côte d'Opale.

Spécialisation : B1 met en tête « Entretien poêle à granulés » ; B2 « Entretien insert à bois » ; B3 « Ramonage compris ».

### Éléments (extensions)
| Type | Contenu |
|---|---|
| Liens annexes (≤ 25 car.) | « Entretien chaudière » → page A · « Contrats d'entretien » → `/contrats-entretien.html` (**seulement après le correctif de souscription en PROD**) · « Ramonage » → page C · « Zones d'intervention » → `/zones-intervention.html` · « Nous contacter » → `/contact.html` |
| Descriptions des liens (≤ 35 car.) | « Gaz 121 €, fioul dès 178,20 € TTC » · « Visite, attestation, rappel » · « Cheminée, insert, poêle à bois » · « Saint-Omer et Côte d'Opale » · « Agence de Saint-Omer » |
| Accroches (≤ 25 car.) | Techniciens salariés · Attestation remise · Prix fermes affichés · Rappel sous 24 h ouvrées · Agence à Saint-Omer · Certificat de ramonage · Devis gratuit (ramonage) |
| Extraits structurés | Services : Entretien gaz, Entretien fioul, Contrat annuel, Ramonage |
| Appel | 03 66 10 01 34 aux heures d'ouverture ; rapports d'appels activés (numéro de transfert Google), conversion d'appel au-delà de 60 s |
| Prix (A) | Entretien gaz : 121 € · Entretien fioul : dès 178,20 € · Contrat gaz : dès 9,90 €/mois |
| Lieu | Fiche Google Business Profile de l'agence (à associer) |
| Avis | « Noté 4,7/5 sur Google » **à revérifier le jour du lancement** (la page du site annonce 343 avis) |

---

## 5. Meta (Facebook / Instagram) — 3 angles

Objectif recommandé : **Prospects**, avec conversion sur le site et optimisation sur `generate_lead`. Cela suppose le pixel et le consentement publicitaire (§6) : c'est **bloqué** en attendant. Formulaires instantanés Meta déconseillés : ils contournent le parcours du site, l'anti-doublon et l'attribution.
- **Audience** : personnes qui **habitent** dans un rayon de 50 km autour de Saint-Omer ; 25 ans et plus ; ciblage large (Advantage+).
- **Placements** : fils Facebook et Instagram, Stories et Reels ; Audience Network exclu.
- **Formats** : 1:1 (1080×1080) et 4:5 (1080×1350) pour chaque visuel ; 9:16 en option pour Stories et Reels. Texte en incrustation court (≤ 20 % de l'image). Logo HELP Confort. **Photos réelles de l'équipe**, pas d'uniformes de banque d'images.

### Angle 1 — Chaudière (entretien annuel, contrat)
Accroches (hooks) :
1. « Votre chaudière a-t-elle eu sa visite cette année ? »
2. « Entretien chaudière gaz : 121 € TTC, attestation remise. »
3. « Avant l'hiver, faites contrôler votre chaudière. »
4. « Contrat d'entretien dès 9,90 € TTC/mois : on vous rappelle chaque année. »
5. « Une agence à Saint-Omer, des techniciens salariés. »

Texte court : « Entretien chaudière gaz 121 € TTC, fioul dès 178,20 € TTC. Attestation remise. Agence HELP Confort de Saint-Omer. »

Texte moyen : « L'entretien annuel de votre chaudière est obligatoire. Nos techniciens salariés contrôlent le brûleur, la combustion (CO/CO₂), les sécurités et l'étanchéité, puis vous remettent l'attestation. Le prix ferme est affiché avant d'envoyer votre demande ; l'agence de Saint-Omer vous rappelle sous 24 h ouvrées pour fixer le créneau. Vous préférez ne plus y penser ? Contrat annuel dès 9,90 € TTC/mois. »

Titres (≤ 40) : « Entretien chaudière dès 121 € TTC » · « Contrat dès 9,90 € TTC/mois ». Bouton : **En savoir plus**. Destination : page A.

Visuels :
- (a) technicien HELP Confort devant une chaudière murale, analyseur de combustion en main, bandeau « Entretien gaz · 121 € TTC » ;
- (b) carrousel en 3 cartes : « Contrôle du brûleur » → « Mesure CO/CO₂ » → « Attestation remise » ;
- (c) automne ou premiers froids, « Avant l'hiver ».

### Angle 2 — Poêle & insert (bois, granulés) : entretien annuel, ramonage compris
Offre : barème EPB / EPG (§0). Pas de prix dans les visuels : la page les donne en HT et en TTC.

Accroches :
1. « Poêle à bois ou à granulés : l'entretien annuel, ramonage compris. »
2. « Un seul rendez-vous pour l'entretien et le ramonage de votre insert. »
3. « Certificat de ramonage : votre assureur peut vous le demander. »
4. « Avant la première flambée, faites entretenir votre poêle. »

Texte court : « Entretien annuel de votre poêle ou insert, bois ou granulés, ramonage compris. Certificat remis. Agence HELP Confort de Saint-Omer. »

Texte moyen : « L'entretien annuel de votre poêle ou de votre insert, à bois ou à granulés, avec le ramonage du conduit : un seul rendez-vous, et le certificat de ramonage vous est remis. Les tarifs sont affichés sur notre page, en HT et en TTC selon votre logement. L'agence de Saint-Omer vous rappelle sous 24 h ouvrées. »

Titres : « Entretien poêle & insert » · « Ramonage compris ». Bouton : **En savoir plus**. Destination : page B.

Visuels :
- (a) poêle à granulés ou insert à bois en fonctionnement, ambiance salon ;
- (b) technicien au travail sur un poêle ;
- (c) gros plan sur le certificat de ramonage, sans donnée client.

### Angle 3 — Ramonage cheminée et conduit de chaudière
Accroches :
1. « Cheminée, conduit de chaudière : le ramonage est obligatoire. »
2. « Ramonage et certificat : restez couvert par votre assurance. »
3. « Ramoneur à Saint-Omer et sur la Côte d'Opale. »
4. « Devis gratuit : l'agence vous rappelle sous 24 h ouvrées. »

Texte court : « Ramonage de cheminée et de conduit de chaudière, certificat remis. Devis gratuit, rappel sous 24 h ouvrées. »

Texte moyen : « Le ramonage de votre cheminée ou du conduit de votre chaudière est une obligation annuelle, et votre assureur peut demander le certificat en cas de sinistre. Nos techniciens réalisent un ramonage mécanique, vérifient le tirage et contrôlent le conduit. Tarif confirmé avant intervention, sans engagement. »

Titres : « Ramonage cheminée et conduit » · « Devis gratuit, rappel sous 24 h ». Bouton : **Obtenir un devis**. Destination : page C.

Visuels :
- (a) conduit de cheminée sur un toit de la région ;
- (b) technicien au travail ;
- (c) certificat.

### Variantes à tester (A/B), sur chaque angle
Préventif (« avant l'hiver ») · Sécurité (faits seulement : « un appareil entretenu fonctionne en sécurité », sans dramatisation sur le CO) · Confort (« une chaudière entretenue consomme moins » : le site annonce « jusqu'à 12 % », **à sourcer avant usage**) · Saison (septembre à novembre).

### Interdits
Fausse urgence (« dernières places »), « gratuit » sauf pour le devis de ramonage, délais non garantis (« en 1 h »), prix hors catalogue, deux agences, mentions de santé alarmistes.

---

## 6. Mesure des conversions

### Événements préparés (recette, `08cebf89`) — aucune donnée personnelle
| Événement | Déclencheur | Où | Paramètres |
|---|---|---|---|
| `view_maintenance_landing` | Affichage d'une page d'atterrissage | `assets/hc-landing.js` | `service_family` (chaudiere / ramonage), `page_type` |
| `click_maintenance_cta` | Clic sur le bouton principal (`data-hc-cta`) | `hc-landing.js` | `service_family`, `cta` |
| `click_to_call` | Clic sur un lien `tel:` de la page | `hc-landing.js` | `service_family`, `position` (entete / page) |
| `start_maintenance_funnel` | Tunnel ouvert depuis la page A, ajout d'une prestation d'entretien ou choix « Contrat entretien » ; une fois par session | `assets/hc-demande.js` | `service_family`, `src`, `entry` |
| `maintenance_contact_entered` | Coordonnées saisies (étape tarifs ou coordonnées) ; une fois | `hc-demande.js` | `service_family`, `src` |
| `maintenance_submit` | Demande envoyée : tunnel (A) ou formulaire de rappel confirmé par le serveur (C) | `hc-demande.js`, `hc-landing.js` + `hc-leads-capture.js` | `service_family`, `lead_type`, `src`, `simulated` |
| `generate_lead` | Même moment que `maintenance_submit` (événement GA4 recommandé) | idem | `lead_type`, `service_family`, `simulated` |
| `view_home_maintenance_promo` · `click_home_maintenance_promo` | Relance d'accueil vue à 50 % (une fois) · clic | `index.html` | `service_family` (chaudiere / poele / ramonage), `target` |

Familles mesurées : `chaudiere`, `ramonage`, `poele` (page B), `contrat` (page contrats : ouverture de la souscription = `start_maintenance_funnel`, envoi = `maintenance_submit` + `generate_lead`).

**Correctif du 19/09** : les pages chaudière et ramonage chargeaient `tracking.js` sans le bandeau de consentement. Un visiteur venu d'une annonce n'était donc jamais mesurable. Le bandeau y est ajouté, ainsi que sur la page B. La page du tunnel (`catalogue.html`) reste sans bandeau, par décision du 17/09 : le consentement est recueilli sur la page d'atterrissage.

Règles :
- envoi à GA4 via `window.hcGtag`, qui n'existe **qu'en production et après consentement** ;
- avant consentement, rien ne sort du navigateur (tout est consigné localement dans `window.__hcFunnel` pour la recette) ;
- les paramètres sont filtrés par liste blanche : aucun email ni numéro possible (tests `demande-v2` et `ads-landing`).

### Attribution du dossier
Le dossier contient `utm.attribution` (utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, référent) :
- ces valeurs ne sont mémorisées **qu'après consentement** : un visiteur qui refuse les cookies arrive sans UTM ;
- `attribution.landing` (page d'atterrissage d'origine) est toujours présente ;
- aucune donnée personnelle dans les URL.

### Conventions UTM
- **Google** : suivi automatique activé (`gclid`), plus un suffixe d'URL finale par campagne :
  `utm_source=google&utm_medium=cpc&utm_campaign=srch_entretien-chaudiere_so50_2026-10&utm_content={adgroupid}&utm_term={keyword}`
  (ramonage : `utm_campaign=srch_ramonage_so50_2026-10`).
- **Meta** : `utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}` (le `fbclid` est ajouté automatiquement).
- **Nommage** : `SRCH_<FAMILLE>_SO50_<AAAA-MM>`, `META_<FAMILLE>_SO50_<AAAA-MM>`, groupes `A1_GAZ`, `A2_FIOUL`… Tout en minuscules dans les UTM.

### À configurer à l'activation (accès requis)
1. **GA4** : marquer `generate_lead` comme événement clé ; dimensions personnalisées `service_family`, `lead_type`, `src`, `cta`, `page_type` ; contrôle dans DebugView.
2. **Google Ads** : liaison GA4 ↔ Ads ; import de `generate_lead` en conversion principale et de `click_to_call` en secondaire ; conversions d'appel via l'élément d'appel. Pas de conversions améliorées (données personnelles hachées) sans décision.
3. **Consentement** : ajouter les signaux Consent Mode v2 (`ad_storage`, `ad_user_data`, `ad_personalization`) à la bannière **avant** toute balise publicitaire.
4. **Meta** : Business Manager, vérification du domaine `depan59-62.fr`, pixel soumis au consentement, correspondance d'événements `ViewContent` (vue de page), `Contact` (appel), `Lead` (generate_lead). API Conversions en option, plus tard.

### Matrice de vérification
| Événement | Recette (`__hcFunnel`) | GA4 | Google Ads | Meta |
|---|---|---|---|---|
| view_maintenance_landing | ✅ vérifié sur la preview | ⛔ accès GA4 non fourni | — | ⛔ pixel absent |
| click_maintenance_cta | ✅ | ⛔ | — | — |
| click_to_call | ✅ | ⛔ | ⛔ compte non relié | ⛔ |
| start_maintenance_funnel | ✅ | ⛔ | — | — |
| maintenance_contact_entered | ✅ | ⛔ | — | — |
| maintenance_submit / generate_lead (tunnel) | ✅ (envoi simulé) | ⛔ | ⛔ | ⛔ |
| maintenance_submit / generate_lead (formulaire ramonage) | ✅ (événement de succès simulé, aucun envoi réel) | ⛔ | ⛔ | ⛔ |
| Attribution gclid / fbclid dans le dossier | ✅ code et tests ; ⛔ réel (production requise) | — | ⛔ | ⛔ |

Vérifié sur la Deploy Preview le 18/09/2026 (`f5090c4b`), en 1440 et en 390 :
- page A : vue, bouton principal, appel (page et en-tête), lien vers les contrats ;
- page C : vue, bouton principal, appel (page et en-tête), envoi confirmé (événement de succès déclenché à la main, formulaire jamais soumis) ;
- tunnel entretien, entrée par le lien de la page A : entretien gaz en 1440, fioul en 390, puis envoi simulé.

Aucune requête vers GA4, Google Ads, Meta ou le serveur de dossiers ; aucune donnée personnelle dans les événements.

**Aucune ligne n'est PASS côté outils externes : les comptes ne sont pas connectés.**

---

## 7. Pages d'atterrissage (état recette)
| Critère | Page A (`entretien-chaudiere.html`) | Pages B + C (`prestations/ramonage.html`, ancre `#poele-insert`) |
|---|---|---|
| Message immédiat | « Entretien chaudière gaz & fioul à Saint-Omer & Dunkerque » + encart de prix ferme (gaz / fioul / contrat) | « Ramonage & entretien poêle, insert, cheminée » + section barème poêle / insert |
| Prestation nommée | ✅ | ✅ |
| Zone | Saint-Omer et Côte d'Opale (agence unique) | idem |
| Prix | ✅ catalogue et contrats | ❌ volontairement absent : aucun prix au catalogue (§9) |
| Bouton principal unique | ✅ « Demander mon entretien » → tunnel | ✅ « Demander un devis gratuit » → formulaire court |
| Réassurance | contrôles détaillés, obligation légale, attestation | certificat, obligation annuelle, rappel sous 24 h ouvrées, avis |
| 1440 (écran 900 px) | bouton à 665–724 px, non masqué (bandeau à 787–884) ; contenu en deux colonnes 636 / 424 px, encart de prix collant ; 0 débordement | section `#poele-insert` à 1505–2097 px, tableau du barème en 4 colonnes ; ancre à 110 px sous l'en-tête collant ; 0 débordement |
| 390 (écran 844 px) | bouton à 486–543 px, au-dessus du bandeau de consentement (660–834), cliquable au centre ; formules en cartes ; prix jamais coupés ; 0 débordement | bouton à 506–563 px, au-dessus du bandeau (665–834) ; redirection 301 depuis l'ancienne URL → ancre atteinte ; barème en cartes ; 0 débordement |
| Corrigé pendant la vérification | 19/09 : tableau élargissant la page à 502 px, prix coupés, accroche décalée. 20/09 : page passée au gabarit premium du site ; héros compacté sous 480 px (le bandeau de consentement recouvrait le bouton principal au premier passage) | 20/09 : section poêle / insert fusionnée depuis la page doublon ; héros compacté ; ancre décalée sous l'en-tête |
| Mesure | ✅ `view_maintenance_landing` (`service_family=chaudiere`) vu sur la preview | ✅ `view_maintenance_landing` (`service_family=ramonage`) ; bouton poêle `landing_poele_cta` |

**Famille B (poêles / inserts) — plus de page dédiée (20/09, directive 5744476570).**
La page `entretien-poele-insert.html` créée le 19/09 faisait doublon avec la page ramonage : elle est
**fusionnée** dans la page canonique `prestations/ramonage.html`, section `#poele-insert` (barème EPB / EPG
en HT et les deux TTC, ce qui est compris, règle de TVA, bouton `landing_poele_cta` vers le formulaire de
la page). L'ancienne URL est redirigée en **301** vers l'ancre. Les annonces B pointent donc la même page
que les annonces C, sur une ancre différente — un seul historique de qualité, un seul canonical.

> Règle projet (`docs/process/REGLE-PAGE-CANONIQUE.md`) : avant toute page Ads,
> `SEARCH_EXISTING → IDENTIFY_CANONICAL → REUSE_OR_EXTEND → CREATE_ONLY_IF_NONE`, contrôlé par
> `node scripts/seo/duplicate-intent.mjs`.

---

## 8. Checklist de lancement (J0), après GO Florian
1. Gates du §9 levés, avec une preuve pour chacun.
2. En production, un dossier de test contrôlé par famille (« TEST RECETTE » dans le nom) : page d'atterrissage → parcours → dossier en base avec `attribution.landing`, `utm_*` et `gclid` (lien de test avec `gclid=TEST`) → 1 email agence + 1 email client → aucun doublon → dossier archivé.
3. Mobile 390 et ordinateur 1440 : bouton principal visible, aucun débordement, formulaire fonctionnel.
4. GA4 DebugView : les 7 événements arrivent, sans donnée personnelle.
5. Google Ads : conversion `generate_lead` au statut « Enregistrement des conversions » ; élément d'appel actif aux horaires.
6. Annonces approuvées ; note des avis (« 4,7/5 », 343 avis) revérifiée le jour même, sinon titre retiré.
7. Budget quotidien fixé par Florian ; plafond de dépense du compte défini.
8. Capacité d'accueil confirmée par l'agence (nombre de visites d'entretien possibles par semaine en septembre–novembre).

## 8 bis. Contrôles J+1 / J+3 / J+7
| Quand | Contrôles |
|---|---|
| **J+1** | Annonces diffusées et approuvées ; conversions remontées (GA4 temps réel et Ads) ; dossiers reçus en back-office avec leur attribution ; emails partis (1 agence + 1 client par dossier) ; aucune erreur sur les pages (console, formulaires) ; rythme de dépense ; appels reçus. |
| **J+3** | Rapport des termes de recherche → nouveaux négatifs ; taux de clic par groupe (viser ≥ 5 % en Search) ; taux de conversion page → dossier ; coût par dossier par famille ; qualité des dossiers avec l'agence (bonne zone, bonne prestation) ; répartition mobile / ordinateur ; distance des dossiers à l'agence. |
| **J+7** | Bilan par groupe : couper ce qui ne convertit pas ; rapport des éléments RSA (faible / bon / excellent) ; réallocation entre A et C ; Meta : fréquence, CPM, taux de clic, coût par dossier, test d'une nouvelle accroche par angle ; doublons et abandons en back-office ; point capacité avec l'agence. |

---

## 9. Gates avant activation — `CAMPAIGN_GO_LIVE=NO_GO`
| # | Gate | Qui | État |
|---|---|---|---|
| 1 | Mise en production de la recette (pages corrigées, tunnel v2, en-tête, mesure). **Aujourd'hui la PROD sert les anciennes pages**, dont le bouton cassé et les faux prix. | GO Florian | ⛔ |
| 2 | Déploiement des fonctions serveur (cycle du dossier, notifications, emails) ; sinon la PROD garde l'ancien comportement | GO Florian | ⛔ |
| 3 | Correctif de souscription des contrats en PROD (RLS, `CONTRACT-RLS-GATE.md`), si les contrats sont promus | GO Florian | ⛔ |
| 4 | Accès GA4 (vérifier les événements) et Search Console | Florian | ⛔ |
| 5 | Compte Google Ads, liaison GA4, import de conversion, Consent Mode v2 dans la bannière | Florian + développement | ⛔ |
| 6 | Meta : Business Manager, domaine vérifié, pixel soumis au consentement | Florian + développement | ⛔ |
| 7 | Tarif du ramonage confirmé et ajouté au catalogue, pour pouvoir l'afficher | Florian | ⛔ (la campagne C peut partir **sans** prix) |
| 8 | Famille B : prestation et prix confirmés (EPB / EPG, 18/09). Reste : ajout au catalogue en ligne (`supabase/_pending_migrations/…poele_insert.sql`) si l'on veut la demande à prix ferme dans le tunnel ; capacité de l'agence | Florian | ✅ prix · ⏳ catalogue |
| 9 | Test réel en PROD par famille (§8, point 2) | Claude après GO | ⛔ |
| 10 | Budget | Florian | ⛔ |
