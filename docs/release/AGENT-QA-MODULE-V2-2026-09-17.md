# Module « Ma demande » v2 — revue multi-agents (directive 5699304300)

Preview : `https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/catalogue.html` (QA en `?simulate=1`, aucun envoi réel).

## Builds
| SHA | Contenu |
|---|---|
| `32c59496` | Module v2 : entrée 2 intentions, intervention (lieu → besoin → accès tarifs → précision → Ma demande → coordonnées → prise en charge → confirmation), devis (travaux → projet → photos → lieu → coordonnées → vérification → confirmation) |
| `914ad048` | QA manuelle 1440/390 : coupures de titres, barre mobile, kicker lien direct, « 0 km », libellés 390 |
| `717d0891` | Corrections round 1 agents (voir ci-dessous) |

## Round 1 (sur `914ad048`) — 5/5 FAIL
| Profil | Verdict | P1 | Constats clés |
|---|---|---|---|
| Client lambda | FAIL | Coordonnées demandées pour des métiers sans prix (Rénovation) | aide au choix hors sujet, « prix ferme » vs « prix confirmé », pas de délai/horaires, photos perdues sans message |
| Desktop 1440 | FAIL (10 P2) | — | vide sous les étapes courtes, toast sur le CTA, erreur délai sous le pied, retour ← qui pollue l'historique, contrastes |
| Design | FAIL | composition desktop, liste « boutique » (pilules noires), 2e choix mobile sous la ligne de flottaison | graisses Inter non chargées, 4 états « sélectionné », logo carré illisible |
| Mobile 390 | FAIL | erreur « délai » invisible | recherche non tolérante, cibles < 44 px, retour après envoi |
| UX / conversion | FAIL | Rénovation derrière l'accès tarifs ; « +33 6… » refusé | email obligatoire, Modifier sans retour, aide sans sortie |

Corrections `717d0891` : métiers sans prix → devis ; accès tarifs honnête (email facultatif, transmission explicite) ; téléphone = règle edge ; carte pleine hauteur ; liste à coches ; entrée mobile compacte ; aide par métier (offre conseillée) ; recherche tolérante ; horaires réels + « sous 24 h ouvrées » ; retour « Modifier » ; historique propre ; contrastes/focus/cibles 44 px ; logo horizontal ; confirmation 2 colonnes + total + coordonnées ; « Effacer mes informations ». Tests : price-gate 29/29, demande-v2 57/57, hc-cart 12/12, guardrails 0 erreur.

## Hors module (escaladé à Florian, non corrigé ici)
Données catalogue (300 L < 200 L, doublons mitigeur, marques dans les noms, unités « par radiateur » non structurées, contrat entretien parmi les dépannages), /nos-prestations (prix publics + acompte 40 %), périmètre de zone exact (seuils 50/70 km à vol d'oiseau vs « 55 km » des fiches), délai de rappel pour les urgences.

## Round 2 (sur `717d0891`) — design PASS, 4 FAIL
| Profil | Verdict | Corrections round 1 vérifiées | Restant principal |
|---|---|---|---|
| UX | FAIL | 9/9 | P1 : interventions perdues en silence lors d'une bascule vers le devis |
| Design | **PASS** | 10/10 | P2 : vide colonne droite / cartes courtes ; lignes d'offres trop hautes |
| Client | FAIL (3 P2) | 6/8 corrigés | email facultatif puis exigé ; agence fermée signalée tard ; photo perdue signalée tard |
| Desktop | FAIL | 9/10 | P1 : boucle Rénovation ; P2 : toasts effacés, focus sous la barre, erreurs non reliées aux champs |
| Mobile | FAIL | 9/10 | P1 : même boucle ; P2 : erreurs cachées sous la barre d'action |

Corrections `41729afd` → `ec0596d9` (traçabilité `331028f8`) : contexte neuf au choix « intervention » + « changer » ; interventions conservées (lignes « sur devis » ou jointes au devis) ; toasts non effacés ; email facultatif partout ; horaires dès l'entrée ; photos perdues signalées partout ; retour « Modifier » fiable ; aide au choix (diagnostic d'abord, porte simple/blindée, chasse d'eau) ; recherche (mots vides, synonymes, début de mot) ; colonne sans vide ; offres compactes ; champ en erreur centré ; aria-describedby ; focus opaque ; flèches clavier ; cibles 44 px. Tests : demande-v2 66/66, price-gate 29/29.

## Round 3 (sur `ec0596d9`) — 4 PASS, UX FAIL (1 P1)
| Profil | Verdict |
|---|---|
| UX / conversion | FAIL — P1 : depuis la vérification du devis, gérer une intervention jointe renvoyait vers le parcours intervention (travaux et description du devis perdus) |
| Design | **PASS** |
| Client | **PASS** |
| Desktop 1440 | **PASS** |
| Mobile 390 | **PASS** |

P2 relevés, tous profils confondus : alternative serrurerie équivalente plus chère, supplément de gamme affiché HT, toasts plus larges que l'écran à 390 px, champ en erreur centré avant l'affichage du message, focus peu visible sur les champs en erreur, barre d'action desktop translucide.

Corrections `7f657897` : « Retirer » sur place dans la vérification du devis (P1) + P2/P3 (détail dans le message de commit).

### Vérification manuelle après round 3 (Claude, preview, envoi simulé)
- 390 et 1440 : intervention ajoutée → bascule devis → récap « Intervention jointe » + « Retirer » (cible 44 px) → retrait sans quitter le récap, message « … retirée de la demande », focus sur « Envoyer », demande vidée ; confirmation devis avec Travaux + Projet ; aucune requête réseau d'envoi (simulation). **P1 corrigé.**
- Défaut trouvé pendant cette QA et corrigé (`f884d9ce`) : la liste de suggestions d'adresse se rouvrait après la sortie du champ (réponse BAN tardive) et restait ouverte au retour sur l'étape Lieu. Vérifié ensuite : ouverture normale quand le champ a le focus (5 suggestions), plus de réouverture hors focus.
- Mesure du tunnel (`f884d9ce` → `700111d5`) vérifiée sur la preview : séquence complète intervention (start → étapes → accès tarifs → ajout/retrait → coordonnées → soumission → `generate_lead`) et entretien (`lead_type=entretien`), 0 donnée personnelle dans les paramètres, 0 script GA chargé et 0 envoi depuis la preview ; CTA accueil vérifiés sur le HTML servi par Netlify (liens réécrits sans `.html`).

### Backend (REAL_BACKEND, stack Supabase LOCAL isolé — pas la PROD)
`scripts/test/start-e2e-local.sh` : parcours v2 construits par le cœur réel du front — accès tarifs, INTERVENTION (2 prestations, prix ferme + sur devis), DEVIS (photo stockée, rejeu du jeton refusé, intervention jointe), ENTRETIEN (« Contrat entretien ») : création du lead, notification invoquée (0 email), relecture de la ligne en base (message identique au front, téléphone normalisé, lead test archivé, attribution). **21/21 PASS** (`1626b7bd`, relancé avec attribution sur `f884d9ce`).

## Round 4 (UX seul, sur `700111d5`) — **PASS**
- P1 du round 3 **corrigé** (390 et 1440) : « Retirer » reste sur le récap du devis, ligne retirée, message, focus sur « Envoyer », confirmation avec Travaux + Projet.
- Vérifiés OK : parcours intervention et devis complets, erreurs (message, marquage, focus), suggestions d'adresse, vocabulaire (ni panier/commande, ni emoji, agence unique Saint-Omer), mise en page 390/1440 sans défilement horizontal, badge « envoi simulé » présent à chaque envoi.
- P2 relevés → corrigés dans `0b01b834` sauf le n° 1 : (1) bouton retour du navigateur après plusieurs allers-retours « Modifier » (rien n'est perdu) — **ouvert** ; (2) retour ← depuis le devis ouvert depuis la liste des prestations ; (3) entrée entretien : étape générique en trop ; (4) « toute la Côte d'Opale » promet plus que la zone ; (5) message du code postal trop sec.

## Confidentialité (`0b01b834` + carte de reprise sans ville) — vérifié sur la preview, 390
Défaut constaté dans le code : identité, adresse et description étaient conservées 7 jours dans le navigateur et recopiées dans une nouvelle demande.

| Scénario | Résultat |
|---|---|
| Demande envoyée → accueil → nouvelle demande | champs vides, aucune donnée affichée ni stockée |
| Stockage durable (localStorage) pendant tout le parcours | aucune donnée personnelle (après accès tarifs, avant et après envoi) |
| Session après envoi | identité et adresse vidées |
| Demande abandonnée → accueil → nouvelle demande | écran « Vous avez une demande en cours » (Nouvelle demande / Reprendre), rien de prérempli |
| « Nouvelle demande » | étape Lieu vide, demande vidée |
| « Reprendre » (même onglet) | demande et coordonnées restaurées |
| Rechargement en cours de demande | coordonnées conservées |
| Second utilisateur (nouvel onglet) | aucune donnée personnelle, même après « Reprendre » (seule la prestation choisie est reprise) |
| « Effacer mes informations de cet appareil » | demande, brouillon, accès tarifs et marqueurs de mesure purgés |
| URL | étape et catégorie uniquement |

## Round 5 — mise en scène premium ouverte depuis l'accueil (directive 5713069274)
Le moteur v2 n'est pas retouché : seules la forme d'expérience et la couche visuelle changent.

**Architecture** : module extrait en composant partagé (`assets/hc-demande-core.js`, `assets/hc-demande.css` isolé sous `.hcd`, `assets/hc-demande.js` avec `HcDemande.mount/open/close`). `catalogue.html` reste la page d'entrée directe ; l'accueil ouvre la fenêtre premium (modale desktop, feuille plein écran mobile), module chargé à la demande, repli en navigation normale.

**Avant → après (mesuré sur la preview)**
| Point | Avant | Après |
|---|---|---|
| Forme | page séparée `/catalogue.html` | fenêtre ouverte depuis l'accueil, site visible derrière, défilement de fond verrouillé |
| Carte centrale (étape Lieu, 1440×900) | hauteur forcée `100vh − 136 px` ≈ 764 px pour ~300 px de contenu | hauteur ajustée au contenu : 596 px |
| Fond | dégradé bleu très pâle sur gris | halos de marque bleu + orange sur base claire chaude |
| Barre de progression | 4 px, une couleur | 6 px, dégradé bleu, libellé d'étape renforcé |
| Bouton principal | aplat orange foncé | dégradé orange avec ombre colorée |
| Champs | fond gris clair, focus fin | fond blanc, focus bleu marque avec halo (4 px) |
| Colonne « Votre demande » | bloc passif (« se construit ici ») | avancement du parcours (fait / en cours / à venir) + récapitulatif + réassurance agence chaleureuse avec appel direct |
| Téléphone en-tête | bouton blanc discret | bouton de marque (gris quand l'agence est fermée) |

**Contrôles faits avant revue** : page dédiée inchangée ; fenêtre ouverte/fermée par CTA, « Quitter », Échap, retour navigateur, focus rendu au CTA, URL nettoyée ; parcours intervention complet dans la fenêtre (envoi simulé) ; mobile 390 plein écran sans colonne latérale ; smoke déployé 17/17.

**Round 5 (revues UX / design / mobile, sur `5c05125a`)**

| Profil | Verdict | Principal |
|---|---|---|
| Design | **VISUAL_LEVEL=UPGRADED**, AGENT_DESIGN=FAIL | P1 : aucune identité ni réassurance visibles en mobile (logo masqué, colonne de réassurance hors écran) ; P1 : 198 px (24 %) de vide sous la carte en 1440 |
| UX | AGENT_UX=FAIL | **P0 : après fermeture, la coque invisible couvrait l'accueil et le rendait inerte** ; P1 : numérotation d'étape incohérente entre l'en-tête et le rail ; P1 : métier hérité d'une visite précédente qui court-circuitait l'étape Besoin |
| Mobile 390 | MOBILE_390=FAIL | **P0 : barre d'actions collante annulée par un `overflow:hidden` (bouton principal jusqu'à 1 100 px sous la ligne de flottaison)** ; P1 : état sélectionné invisible ; P2 : libellés à 13 px, mentions légales 16 px de haut |

Les deux P0 avaient été introduits par ma propre mise en scène (coque et liseré de marque) : c'est exactement ce que les revues devaient attraper.

**Corrections `3fc7518a`** (14) : `.hcd-overlay[hidden]{display:none}` ; `overflow` rendu à la carte (liseré arrondi par `border-radius`) ; entrée intervention sans métier hérité ; rail nommé comme l'en-tête ; logo mobile rétabli + pied de carte « HELP Confort · agence de Saint-Omer · techniciens salariés · aucun paiement en ligne · 03 66 10 01 34 » sur toutes les étapes ; carte desktop rejoignant la base ; colonne récap qui défile ; états sélectionnés en bleu de marque ; total mis en valeur ; en-tête contextualisé sur l'écran de choix ; « Retour à l'accueil » qui referme ; page hôte neutralisée (`inert` + `aria-hidden`) pendant l'ouverture ; libellés mobiles 15 px ; mentions légales à 44 px.

**Contre-vérification (Claude, preview)** : accueil de nouveau cliquable après fermeture par Échap, « Quitter », fond et retour navigateur ; barre d'actions collante rétablie (bouton à 686 px sur 844 en 390) ; feuille plein écran 390×844 (top 0 après `getAnimations().finish()`) ; vide sous la carte 1440 ramené de 198 px à 23 px ; en-tête et rail affichent tous deux « Tarifs » ; logo 26 px et pied de carte présents en mobile.

**Contre-revue indépendante (sur `3fc7518a`)** : 6 correctifs sur 7 confirmés mesures à l'appui (fermeture par les 4 chemins → accueil de nouveau cliquable, `inert` retiré sur 53 éléments ; bouton principal dans l'écran sur les 10 étapes en 390 ; entrée intervention sans métier hérité ; en-tête et rail alignés ; vide sous la carte 198 px → 36 px ; état sélectionné bleu de marque mesuré). Restaient : pied de carte absent sur l'étape « Besoin », carte mobile pas pleine hauteur sur les étapes courtes (barre d'actions à 724 px au lieu de 844), logo écrasé par l'en-tête, rail masqué sur « Et ensuite ? ».

**Corrections finales `f18f9129` + `c74f8139`**, vérifiées : pied de carte sur toutes les étapes (dont Besoin), `min-height` mobile rétabli (barre d'actions à 844 px sur Lieu comme sur Tarifs), logo 69×26 stable, rail conservé sur « Et ensuite ? ». Smoke déployé 17/17, demande-v2 108/108.

## Confidentialité — re-vérification après la fenêtre ouverte depuis l'accueil (directive 5717182264 relayée le 18/09, `143414d5`)
Les captures relayées datent du 17/09 (build d'avant `0b01b834`). La re-vérification sur la version déployée (`2b013fe8`) a quand même trouvé 4 défauts, tous reproduits sur la preview avant correction :

| # | Défaut (preview `2b013fe8`) | Preuve avant correction | Correction `143414d5` |
|---|---|---|---|
| 1 | « Faire une autre demande » recopiait identité et adresse dans la nouvelle demande (même symptôme que la capture : Lieu prérempli + « Coordonnées … » dans « Votre demande ») | Lieu = adresse précédente, colonne « Coordonnées Bob Second · 06 … » | nouvelle demande = état vierge, plus aucune identité gardée en mémoire |
| 2 | Le champ **Nom** de l'étape tarifs (ajouté le 18/09) n'était jamais vidé | après « Nouvelle demande » puis après « Effacer mes informations » : Nom = nom de la personne précédente | vidage de **tous** les champs de saisie du module (plus de liste à tenir à jour) |
| 3 | La référence d'un dossier **finalisé** restait sur l'appareil | nouvel onglet, autre personne : même référence que le dossier envoyé → le serveur l'aurait classée en doublon (demande perdue une fois les fonctions déployées) | référence abandonnée après envoi et à chaque nouvelle demande ; créée à l'envoi si besoin (les devis n'en avaient jamais) |
| 4 | « Effacer mes informations » laissait les anciennes coordonnées (`hc_lead_v1` en stockage durable, `hc_tarif_lead_<email>`) ; « Nos prestations » les écrivait sans expiration et son bouton « Effacer mes données » ne fonctionnait pas | clés présentes après l'effacement ; bouton → fonction introuvable | purge de toutes les clés personnelles du site (choix cookies conservé) ; « Nos prestations » : onglet uniquement, 24 h, clé sans email en clair, bouton réparé |

Ajouté : données personnelles de l'onglet effacées après **2 h sans activité** (au chargement et à chaque réouverture de la fenêtre), anciennes coordonnées durables purgées dès l'ouverture du module.

**Preuves après correction — preview `143414d5` (envoi simulé, aucun appel réseau d'envoi), 1440 puis 390** :

| Scénario | 1440 | 390 |
|---|---|---|
| Envoi → « Retour à l'accueil » → « J'ai besoin d'être dépanné » | Lieu vide, aucun champ rempli, « Votre demande » vide, nouvelle référence | idem (feuille plein écran) |
| « Faire une autre demande » → Intervention (et Devis sur la page dédiée) | vide | vide |
| Abandon (coordonnées saisies) → fermeture → réouverture | carte « Vous avez une demande en cours · 1 intervention », rien de personnel visible ; « Reprendre » restaure ; « Nouvelle demande » vide tout | idem |
| Rechargement en cours de demande | même étape, mêmes coordonnées, même référence, panier conservé | — |
| Nouvel onglet / second utilisateur | carte de reprise sans donnée personnelle ; après « Reprendre », aucune coordonnée | — |
| Ancienne référence finalisée sur l'appareil | abandonnée à l'entrée (nouvelle référence) | — |
| Données personnelles vieilles de 3 h (onglet resté ouvert / rechargé) | effacées avant affichage | — |
| « Effacer mes informations » puis personne suivante | clés personnelles purgées (y compris anciennes), formulaire des tarifs vide | idem |
| Navigation privée (stockage vierge) | vierge | vierge |
| URL / mesure | URL = `#step=…&cat=…` ; 0 donnée personnelle dans 11 événements de mesure | — |

Tests : demande-v2 **147/147** (19 nouveaux, en échec sur `2b013fe8`), lead-cycle 67/67, price-gate 29/29, panier 12/12, SEO ERRORS=0.
Hors périmètre, constaté : en mobile, le bandeau cookies de première visite couvre le bas du tunnel ; sur la preview uniquement, le bouton « Centre de validation » masque « Refuser ».
