# Gérer les apporteurs d'affaires & fournisseurs depuis le back-office

Tu peux désormais ajouter, modifier et supprimer les apporteurs d'affaires (homepage) et les fournisseurs (pages métiers) **directement depuis le back-office Decap CMS**, sans toucher au code.

## Accéder au back-office

1. Va sur `https://www.depan59-62.fr/admin/` (ou en local : `http://localhost:8000/admin/`)
2. Connecte-toi avec ton identifiant Netlify Identity
3. Tu vois la liste des collections dans le menu de gauche

## 🤝 Ajouter un apporteur d'affaires (homepage)

1. Clique sur **« 🤝 Apporteurs d'affaires »** dans le menu de gauche
2. Clique sur **« Liste des apporteurs (homepage) »**
3. Clique sur **« Add Apporteurs d'affaires »** en bas de la liste
4. Remplis les champs :

| Champ | Description |
|---|---|
| **Nom** | Ex : `MAIF`, `Cabinet Dupont`, `Syndic Immo Saint-Omer` |
| **Logo officiel** | Upload PNG ou SVG transparent (~200×80 px). **Si vide**, le nom de l'apporteur s'affiche à la place. |
| **URL du site partenaire** | Ex : `https://www.maif.fr`. Facultatif. |
| **Catégorie** | Choisir parmi : Compagnie d'assurance / Cabinet d'expertise / Syndic / Bailleur social / Bailleur privé / Agence immobilière / Collectivité / Réseau national / Partenaire pro / Autre |
| **Portée** | `Local` (Saint-Omer/Dunkerque) ou `National` |
| **Ordre d'affichage** | Petit chiffre = apparaît plus tôt. Par défaut : 100. |
| **Description courte** | Optionnel — pour info interne |
| **Afficher sur la homepage** | Décocher pour masquer temporairement |

5. Clique sur **« Save »** puis **« Publish »**
6. **Le bandeau homepage est mis à jour automatiquement** (rechargement de la page)

## 🏭 Ajouter un fournisseur (pages métiers)

Même principe, dans la collection **« 🏭 Fournisseurs & marques »** :

1. Clique sur la collection, puis **« Liste des fournisseurs par métier »**
2. Add Fournisseurs / marques
3. Remplis : Nom, Logo, URL, Métier (Plomberie/Chauffage/etc.), Spécialité, Ordre, Afficher
4. Save + Publish

Les fournisseurs apparaissent sur la page métier correspondante.

## Logos officiels — recommandations

- **Format** : PNG transparent ou SVG (préféré)
- **Taille** : ~200×80 px (apporteurs) / ~160×80 px (fournisseurs)
- **Fond** : transparent (le bandeau a un fond blanc)
- **Mode couleur** : **logo couleur officiel** (le site applique automatiquement un léger filtre noir & blanc, désactivé au survol)
- **Nom de fichier** : pas d'espaces ni d'accents (ex : `maif-logo.png`)

## Si tu n'as pas encore le logo

Laisse le champ Logo **vide**. Le système affichera automatiquement la **catégorie en petit + le nom en gros** dans le bandeau. C'est propre et professionnel le temps que tu récupères le vrai logo.

## Tri & ordre

Pour mettre des apporteurs en avant (au début du défilement) :
- Mets `Ordre d'affichage = 1`, `2`, `3`...
- Pour les autres, laisse `100` (ou ce que tu veux)

Le bandeau défile en ordre croissant.

## Catégories actuellement supportées

- **Compagnie d'assurance** (MAIF, AXA, Allianz, etc.)
- **Cabinet d'expertise** (sinistres, expertise habitat)
- **Syndic de copropriété**
- **Bailleur social** (LTO, Pas-de-Calais Habitat, Maisons & Cités, etc.)
- **Bailleur privé**
- **Agence immobilière**
- **Collectivité / CCAS** (mairies, CCAS, intercommunalités)
- **Réseau / Groupe national** (HELP Confort, La Poste, etc.)
- **Partenaire pro** (autres entreprises BTP)
- **Autre**

## Limite — combien d'apporteurs maximum ?

Aucune limite technique. Recommandé : **8 à 16 apporteurs** maximum sur la homepage pour garder un défilement propre. Au-delà, le bandeau devient trop long.

---

*Si tu rencontres un souci avec le back-office (Netlify Identity, accès, publication), je peux t'aider à diagnostiquer.*
