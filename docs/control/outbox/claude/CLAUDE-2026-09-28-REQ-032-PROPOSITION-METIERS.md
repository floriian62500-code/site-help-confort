# Retour Claude — REQ-20260926-032 : proposition « Nos métiers » (avant tout code)

message_id: CLAUDE-2026-09-28-REQ-032-PROPOSITION-METIERS
objet: demande Florian du 2026-09-28 — refonte de la partie Métiers, « montrer avant de coder »
branche: recette
date: 2026-09-28
nature: diagnostic + proposition — **aucune ligne de code, aucun fichier public modifié**

## CE QUI EST LIVRÉ
- `docs/ux/PROPOSITION-NOS-METIERS-2026-09-28.md` — livrables 1 à 6 : diagnostic, proposition UX,
  plan de pages, plan technique en lots, plan de retour arrière, questions ouvertes ;
- maquette cliquable desktop **et** mobile, page Métiers **et** bloc accueil :
  https://claude.ai/artifact/2WW7DyBSsoJmM8oCW5pNsm (page privée de Florian) ;
- REQ-20260926-032 créée, statut `READY_FOR_FLORIAN_VALIDATION`, `prochain_id = REQ-20260926-033`.

## LES TROIS CONSTATS QUI CHANGENT LA DEMANDE

**1. La page demandée existe déjà, en ligne, et personne ne peut la trouver.**
`nos-metiers.html` (36,9 Ko) répond **200 en production** et sur la preview, mais **aucun lien du
site n'y mène** : deux fichiers la citent, elle-même et un rapport d'audit d'août. Le menu
« Métiers » envoie directement vers les neuf pages de Saint-Omer. La règle de page canonique
(`SEARCH_EXISTING → REUSE_OR_EXTEND → CREATE_ONLY_IF_NONE`) impose donc de **refondre et brancher
celle-ci**, pas d'en créer une. Aucune URL nouvelle, aucune 301, aucune suppression.

**2. Cette page est factuellement fausse et ne convertit pas.** Son H1 annonce « Nos 8 métiers »
alors qu'elle en liste neuf ; son accroche cite des « peintres », métier absent de l'offre
affichée ; elle n'a **aucun CTA devis ni achat**, seulement un numéro de téléphone.

**3. Quatre métiers sur neuf n'ont rien à vendre en ligne.** Lu dans `v_services_public` le
2026-09-28 : 34 prestations publiées, 29 à prix fixe, 5 sur devis.

| métier | prestations | achetables | à partir de |
|---|---|---|---|
| Plomberie | 15 | 15 | 114 € |
| Chauffage | 6 | 6 | 105 € |
| Serrurerie | 5 | 5 | 98 € |
| Électricité | 2 | 1 | 114 € |
| Vitrerie | 2 | 1 | 120 € |
| Rénovation | 4 | 0 | — |
| Menuiserie / Volets / PMR | **0** | 0 | — |

La consigne « 2 CTA maximum : devis + achat si packagé » ne peut donc pas s'appliquer
uniformément : cinq métiers auront deux boutons, quatre n'en auront qu'un. C'est l'état du
catalogue, pas un choix de maquette — et c'est une **décision commerciale de Florian**.

## CE QUI EST PROPOSÉ, EN UNE LIGNE
Trois niveaux et pas quatre : **accueil (vue d'ensemble) → page Nos métiers (maison cliquable,
9 zones) → page métier existante / catalogue filtré / devis ou achat**. Le menu « Métiers » devient
un vrai lien vers la page, le déroulant reste pour l'accès direct. `/catalogue` garde son rôle de
parcours « Commander » et ne réaffiche pas les métiers : pas de troisième hub.

## PLAN D'EXÉCUTION (non démarré)
Lot A page seule · Lot B branchement du menu (partiel + propagation 265 pages, lot à surveiller) ·
Lot C bloc accueil · Lot D deux CTA sur les pages métier (à coordonner avec REQ-020).
Un commit par lot. Retour arrière prévu lot par lot, plus une branche de sauvegarde immuable avant
le premier. SVG inline ~8 Ko, aucune librairie, aucun fichier dans `assets/`.

## GEL RESPECTÉ
Cette proposition ne lève pas le gel : **REQ-023 attend toujours la validation visuelle de
Florian**, et rien ne se code avant — ni ce chantier, ni REQ-026, REQ-020 ou REQ-017.

## NO_PUBLIC_MUTATION_PROOF
Diff de ce lot : `docs/control/REQUESTS-TRACKER.json`, `docs/ux/PROPOSITION-NOS-METIERS-2026-09-28.md`
et ce rapport. Aucune page, aucun asset, aucune fonction edge, aucune migration, aucun Stripe,
aucune 301, aucun merge vers `main`, aucun déploiement.

## NEXT_ACTION
Attente de trois réponses de Florian : la maquette convient-elle ; que fait-on des quatre métiers
sans prestation ; veut-il des photos par métier (neuf à fournir, lot E).
