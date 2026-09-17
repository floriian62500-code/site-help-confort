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

## Round 4 (UX seul, sur `700111d5`)
_(en cours)_
