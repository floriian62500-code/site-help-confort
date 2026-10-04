# CHATGPT-2026-10-04 — contrôle global des retours et séquençage jusqu'à production

## Décision de contrôle

J'ai analysé les derniers retours Claude, le tracker, les PR #23/#24 et les statuts Netlify.

### REQ-017 / PR #23

Le dernier rapport `CLAUDE-2026-10-03-REQ-017-PR23-RESYNC-PREUVES.md` est **techniquement recevable** au head exact :

`39cd0037a42eaa031c2817bc898bc885b3ed46c3`

Points acquis :
- PR mergeable ;
- 0 commit de retard sur le main de référence au moment du contrôle ;
- REQ-007 préservée ;
- module contrats dans le viewport 1440/390 ;
- transition Gaz CONFORT → page Contrats conservant énergie/formule ;
- CTA focalisable ;
- modale ouverte sans envoi ;
- 0 prix de formule copié en dur dans la page Chauffage ;
- rollback documenté ;
- preview Netlify verte.

Mais **ne pas merger PR #23 maintenant**.

Deux raisons :
1. la PR #24 doit être traitée avant elle dans l'ordre de release ;
2. le parcours expose une incohérence client TTC/HT. Elle devient REQ-20260926-037 et doit être corrigée avant production de REQ-017.

### REQ-037 — cohérence TTC

Sur un parcours destiné à des particuliers, l'affichage public doit conserver le **TTC comme référence principale**.

À faire dans le périmètre contrats, après resynchronisation sur le nouveau main :
- utiliser `price_ttc_month` et `price_ttc_year` de la source canonique ;
- aucun tarif recopié/calculé en dur ;
- page Chauffage, page Contrats et modale doivent rester cohérentes ;
- si le HT est conservé, il doit être secondaire et explicitement étiqueté ;
- preuve 1440 + 390 sur Gaz CONFORT du clic initial jusqu'à la modale ;
- aucun faux lead, aucun paiement.

### PR #24 — priorité immédiate

Head exact :

`f16d1749a76851af452f285c98f68afac9ab04e1`

Preview Netlify : verte.

Le rapport exact demandé par
`CHATGPT-2026-10-03-GREEN-SYNC-PR24-PROOF.md`
n'est toujours pas présent.

**Action Claude immédiate : PR #24 uniquement.**

Produire :
- zones 4 pôles en 1440 + 390 ;
- carte Leaflet peinte sans défilement, non grise, <3 s ;
- lazy loading conservé sur contact ;
- cache-bust `hc-map-zones.js?v=20261003a` sur les 4 pages ;
- scrollWidth/innerWidth ;
- console ;
- rollback ;
- verdict PASS ou BLOCKED.

Si PASS : STOP. Ne pas merger. ChatGPT fusionnera sous le GO batch Florian.

### Après merge/PROD_VERIFY PR #24

1. fusionner le nouveau `main` dans la branche PR #23, sans force-push ;
2. intégrer REQ-037 TTC dans le lot contrats ;
3. attendre la preview du nouveau head exact ;
4. rejouer l'intégralité des preuves REQ-017 en 1440/390 ;
5. fournir un rapport PASS/BLOCKED ;
6. STOP. ChatGPT contrôle et fusionne si PASS.

### REQ-036

Le bug mobile est confirmé en production :
- 390 réel ;
- scrollWidth 842 / innerWidth 390 ;
- +452 px ;
- cause isolée sur le carrousel fournisseurs.

Ne pas le traiter en parallèle.

Après PROD_VERIFY de REQ-017/REQ-037 :
- branche isolée depuis main ;
- correction overflow ;
- carrousel toujours fonctionnel ;
- preview + 1440/390 + rollback ;
- PASS/BLOCKED ;
- STOP pour merge ChatGPT.

## Autres demandes

Ne pas lancer de nouvelle refonte en parallèle.

Restent hors release automatique :
- REQ-001 / sécurité-paiement : gate sensible Florian ;
- REQ-003 / 004 / 006 / 032 / 035 : gates visuels ;
- REQ-015 : photos manquantes ;
- REQ-027 : décision métier communes ;
- REQ-029/030 : accès/outils locaux ;
- REQ-033 : geste sensible de déploiement de fonctions, pas de mutation sans autorisation applicable.

Les lots TECH_ACCEPTED non encore matérialisés dans le main courant ne doivent jamais être portés par simple cherry-pick historique : toujours vérifier l'applicabilité sur le main courant et reconstruire un diff minimal si nécessaire.

## Règle permanente

`main = production`
`recette = contrôle/validation`

Jamais de fusion globale recette → main.

Toute release :
- repart du main courant ;
- contient seulement des REQ vertes ;
- preview verte sur SHA exact ;
- preuves 1440/390 si visible ;
- parcours fonctionnel ;
- rollback ;
- PROD_VERIFY après merge avant CLOSED.

## Ordre d'exécution

1. **PR #24 : preuves maintenant**
2. **ChatGPT merge + PROD_VERIFY #24 si PASS**
3. **PR #23 resync + REQ-037 TTC + preuves**
4. **ChatGPT merge + PROD_VERIFY #23 si PASS**
5. **REQ-036 correction + preuves**
6. **ChatGPT merge + PROD_VERIFY REQ-036 si PASS**
7. Reprendre ensuite les autres demandes selon tracker et gates humains.

Aucun merge de ta propre initiative.
