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

## Round 2 (sur `717d0891`)
_(à compléter avec les verdicts)_
