# Recrutement — état, architecture, campagnes (septembre 2026)

> Chantier ouvert le 2026-09-20 sur `recette` (directive ChatGPT `5732826379`).
> **Aucune publication externe, aucun budget engagé.** Tout ce qui touche aux conditions d'emploi
> vient de l'annonce publiée par l'agence le 19/09/2026 ; le reste attend une confirmation de Florian.

## 1. État trouvé (audit du 20/09)

| Point | Constat | Suite |
|---|---|---|
| Page existante | `carrieres.html`, indexée, 136 liens internes, dans le sitemap à **0.3 / yearly** | conservée comme **page pivot** (règle de page canonique), priorité relevée à 0.7 / monthly |
| **Formulaire de candidature** | 🔴 **cassé** : le contrat serveur `demande_metier` exige code postal + ville ; le formulaire n'avait **pas de champ code postal** → **toute candidature était refusée** (HTTP 400, « Code postal requis ») | champs ajoutés, contrat vérifié en conditions réelles (réponse serveur 400 uniquement sur un téléphone volontairement invalide) |
| Champs perdus | 🔴 `poste visé`, `expérience` et `lien CV` n'étaient **jamais transmis** : le client n'envoie que les champs du contrat | le poste part dans `metier`, l'expérience et le CV sont joints au message |
| Nom du candidat | un seul champ « Nom & prénom » | prénom et nom séparés |
| Offres | 4 « profils régulièrement recherchés » dont deux qui ne correspondent à aucune annonce (électricien Dunkerque, assistant·e administratif·ve) | remplacés par les **2 postes réellement ouverts** |
| Conditions affichées | mutuelle **60 %** (l'annonce de l'agence dit **80 %**), RTT, intéressement, prime de fin d'année, budget formation annuel, évolution vers chef d'équipe : **non confirmés** | retirés du site, listés en §7 pour validation |
| Données structurées | Organization + BreadcrumbList, **aucun JobPosting** | JobPosting par offre |
| Mesure | aucune mesure du parcours candidat | `assets/hc-recrutement.js` |
| Style | 34 sélecteurs descendants cassés par l'ancienne minification (accroche, boutons, cartes, formulaire) | rétablis, avec preuve (aucun élément ne porte les deux classes) |
| Responsive | — | 0 débordement en 1440 et 390 |

## 2. Architecture cible (livrée)

```
/carrieres.html                                   ← page pivot (canonique « recrutement »)
  ├─ #offres        les postes réellement ouverts, depuis data/offres-emploi.json
  ├─ #candidature   formulaire court, pré-rempli par ?poste=<slug>
  └─ liens          /emploi/<slug>.html
/emploi/plombier-sanitaire-saint-omer.html        ← 1 offre = 1 URL (exigence Google Jobs)
/emploi/plombier-chauffagiste-saint-omer.html
```

- **Source unique** : `data/offres-emploi.json` (offre, conditions confirmées, ce qui reste à confirmer).
- **Générateur** : `node scripts/gen-offres-emploi.mjs` (gabarit premium du site, JobPosting, `--check` en QA).
- **Fermer une offre** = la retirer du JSON et régénérer ; le script signale les pages orphelines.
- **Règle de page canonique** : déclarée dans `docs/seo/pages-canoniques.json`, contrôlée par
  `node scripts/seo/duplicate-intent.mjs` (cf. `docs/process/REGLE-PAGE-CANONIQUE.md`).

## 3. Offres publiées (annonce agence du 19/09/2026)

| Poste | Contrat | Secteur | Affiché |
|---|---|---|---|
| Plombier sanitaire (H/F) | CDI à temps plein | Saint-Omer, rayon ~55 km | missions, profil, conditions confirmées, « à partir de 1 700 € net/mois selon profil et expérience » |
| Plombier chauffagiste (H/F) | CDI à temps plein | Saint-Omer, rayon ~55 km | idem |

Conditions affichées, toutes issues de l'annonce : CDI temps plein · camion individuel · matériel et
outillage professionnels · téléphone et tablette · **mutuelle prise en charge à 80 %** · autonomie
d'organisation · interventions variées, particuliers et professionnels.

**Non affiché volontairement** : la borne haute de la rémunération (l'annonce indique « 1700 € à
2 2200 € », coquille manifeste) et la prime (mentionnée sans nature ni montant).

## 4. Candidature (mobile d'abord)

Prénom · Nom · Téléphone · Email · Code postal · Ville · Poste visé · Expérience · Message court ·
**CV facultatif** (lien, ou envoi ultérieur par email). Neuf champs, une colonne sur mobile.

- Le poste visé arrive à l'agence dans `metier` (« Candidature — Plombier chauffagiste (CDI) ») et le
  lead porte `type_demande = candidature` : il est distinguable d'une demande client.
- Déduplication et relance : mêmes règles que les leads clients (`submit-lead-v6`, corrélation `utm`).
- **Aucune donnée personnelle** dans l'URL, la mesure ou les journaux ; `?poste=<slug>` est un libellé
  d'offre, retiré de l'URL dès la page chargée.

**À faire côté serveur (gate — déploiement de fonction edge, décision humaine)** :
1. contrat `candidature` dédié dans `submit-lead-v6` (nom + contact suffisent : le code postal n'est pas
   utile à une candidature — aujourd'hui il est demandé pour satisfaire le contrat existant) ;
2. notification interne RH distincte des leads clients ;
3. accusé de réception candidat (`lead-auto-reply`) au texte adapté ;
4. statut de candidature dans le back-office.

## 5. SEO recrutement local

| Requête visée | Page |
|---|---|
| recrutement plombier Saint-Omer, emploi plombier Saint-Omer | `/emploi/plombier-sanitaire-saint-omer.html` |
| emploi chauffagiste Saint-Omer, recrutement chauffagiste audomarois | `/emploi/plombier-chauffagiste-saint-omer.html` |
| recrutement HELP Confort Saint-Omer, rejoindre l'équipe | `/carrieres.html` |

Pas de matrice ville × métier : **une page par offre réelle**, retirée quand l'offre se ferme.
Sitemap : page pivot 0.7 mensuel, offres 0.6 hebdomadaire (mise en ligne = déploiement de la fonction
edge `sitemap`, gate).

## 6. Mesure (`assets/hc-recrutement.js`)

`view_recruitment` · `view_job_offer` (avec `job_slug`) · `click_apply` · `start_application` ·
`submit_application` · `generate_recruitment_lead`.
Mêmes garde-fous que le reste du site : consignés dans `window.__hcFunnel` en recette, envoyés à GA4
**uniquement en production et après consentement**, jamais d'email ni de numéro dans les paramètres.
UTM / gclid / fbclid déjà conservés par `hc-leads-capture` pour les futures campagnes.

## 7. Décisions RH attendues de Florian

1. **Borne haute de la rémunération** (« 1700 € à 2 2200 € » dans l'annonce) : 2 200 € net ?
2. **Prime** : nature, montant, conditions — sinon elle reste non affichée.
3. **Mutuelle** : 80 % (annonce) confirmé ? L'ancienne page affichait 60 %.
4. **Horaires et astreintes** : organisation réelle à décrire.
5. **Formations prises en charge** (CACES, habilitations électriques, certifications gaz) : confirmées ?
6. **RTT, intéressement, prime de fin d'année, évolution vers chef d'équipe** : confirmés ?
7. **Autres postes** (électricien Dunkerque, technicien polyvalent, assistant·e administratif·ve) :
   encore ouverts ? Si oui, ils reviennent avec leurs conditions réelles.
8. **Page Indeed** : le lien « Nos offres sur Indeed » a été retiré de l'accroche (aucune offre
   vérifiable). À remettre si le compte est actif.

## 8. Campagnes à préparer (aucune publication, aucun budget)

### Meta (Facebook / Instagram) — audience locale
- Zone : 25 km autour de Saint-Omer, plus Dunkerque et Calais ; 18-55 ans.
- Angle 1 — **le camion et le matériel** : « Votre camion, votre matériel, vos chantiers. » (visuel : camion floqué, outillage)
- Angle 2 — **la proximité** : « Des chantiers à 20 minutes de chez vous, pas à l'autre bout de la région. » (visuel : carte du secteur)
- Angle 3 — **l'équipe** : « Ici, le patron, vous le croisez tous les jours. » (visuel : équipe sur chantier)
- Chaque annonce pointe l'offre correspondante, jamais la page pivot seule.
- Formulaire natif Meta **déconseillé** : la candidature doit passer par le site pour être tracée et dédupliquée.

### Google Ads — seulement si le besoin devient urgent
- Campagne Search `RECR_PLOMBIER-CHAUFFAGISTE_SO25`, mots-clés exacts : « emploi plombier saint-omer »,
  « recrutement chauffagiste saint-omer », « offre emploi plomberie audomarois ».
- Budget à décider avec Florian ; Google Jobs (JobPosting) est **gratuit** et déjà en place : le voir
  fonctionner avant de payer.

### Gratuit, à faire d'abord
1. Publier les deux offres sur **France Travail** et **Indeed** (portée locale immédiate).
2. Republier l'annonce Facebook avec le lien vers l'offre du site.
3. Vérifier l'indexation Google Jobs après la mise en ligne du sitemap.

## 9. Checklist de lancement

- [ ] Décisions RH du §7 tranchées (au minimum la rémunération et la prime).
- [ ] Déploiement de la fonction edge `sitemap` (offres dans le sitemap).
- [ ] Test du JSON-LD JobPosting dans l'outil de résultats enrichis de Google.
- [ ] Une candidature de bout en bout, faite par Florian, avec vérification de la réception à l'agence.
- [ ] Contrat `candidature` + notification RH + accusé candidat (gate serveur).
- [ ] Offres publiées sur France Travail / Indeed.

## 10. Suivi

**J+7** : candidatures reçues, sources, taux d'abandon du formulaire (`start_application` →
`generate_recruitment_lead`), positions sur « emploi plombier Saint-Omer », présence dans Google Jobs.
**J+30** : candidatures par offre, qualité des profils, offres à fermer ou à rouvrir (mettre à jour
`data/offres-emploi.json`), décision sur une campagne payante.
