# Branche `staging` — audit, sans fusion

> Demandé par 5778526407 §5 : « produire un diff synthétique contre `recette`, classer
> *utile / déjà repris / obsolète / risqué*, ne rien fusionner sans décision Florian. »
> **Rien n'a été fusionné, rien n'a été supprimé.** Ce document décrit ; Florian décide.

## 1. Le cadre

| | |
|---|---|
| Base commune | `88e62d33` — 11 juin 2026 |
| Commits propres à `staging` | **62**, tous entre le 11 et le 16 juin 2026 (aucun depuis) |
| Commits propres à `recette` | **861** |
| Fichiers touchés par `staging` | 91 (77 modifiés, 11 supprimés, 3 ajoutés) — 1 174 insertions, 137 suppressions |

`staging` a servi un chantier précis : **un CMS « éditer mon site » en WYSIWYG**, avec autour
quelques corrections d'affichage. La branche est à l'arrêt depuis trois mois pendant que `recette`
avançait de 861 commits : une fusion telle quelle écraserait du travail plus récent. D'où l'audit
fichier par fichier plutôt qu'un `merge`.

## 2. Méthode

Pour chaque fichier, j'ai comparé trois états : la base, `staging`, `recette`. Puis, ligne à ligne,
j'ai mesuré la part de l'intention de `staging` déjà satisfaite sur `recette` (une ligne ajoutée est
« reprise » si elle est présente sur `recette` ; une ligne retirée est « reprise » si elle en est
bien absente). Le classement ci-dessous s'appuie sur cette mesure, puis sur une lecture du contenu.

## 3. Classement

### 3.1 Déjà repris — ne rien faire (13 fichiers)

| Fichier | Ce que faisait `staging` | État sur `recette` |
|---|---|---|
| `assets/hc-edit-mode.js` | CMS WYSIWYG | **identique** (le fichier est là) |
| `admin-pro/valider-staging.html` | écran « promouvoir en prod » | **identique** |
| `admin-pro/photos.html` | panneau Médias | présent à 98 % |
| `admin-pro/content-site.html`, `admin-pro/paiements.html` | intégration du panneau Médias | repris |
| `prestations/ramonage.html` | retrait d'un bloc | repris |
| 9 images `_to_delete_*`, `.tmp.png`, `IMG_5740.JPG` | ménage | **supprimées des deux côtés** |

### 3.2 Déjà repris autrement — l'intention a été traitée, différemment (31 fichiers)

**Le bloc `seo-stats` des pages prestations.** `staging` le supprimait de 31 pages, motif : délais et
MaPrimeAdapt non tenables. La base affichait « ⏱ **Intervention en 1h** · Délai d'intervention ».

`recette` n'a pas supprimé le bloc : **elle l'a réécrit**. « Intervention en 1h » n'existe plus
nulle part sur le site (0 page). À la place, des formulations tenables et propres à chaque
prestation : « Sous 24 h ouvrées », « Dans la journée », « En journée selon disponibilité »,
« Rappel sous 24 h ouvrées ».

**Conclusion : ne pas fusionner.** Supprimer le bloc ferait perdre l'information utile (certificat,
garantie, éligibilité) qui a été corrigée depuis.

**Reste une question pour Florian, pas une correction à faire seul :** 31 pages annoncent encore un
délai (« Sous 48 h », « Sous 24 h ouvrées »…). C'est un engagement commercial. Si ces délais sont
tenus, rien à changer ; sinon, dis-le moi et je les reformule.

### 3.3 Utile, non repris — décision Florian (6 sujets)

| Sujet | Ce que `staging` apporte | Pourquoi ça n'est pas automatique |
|---|---|---|
| **`<body class="no-trust-band">` sur 33 pages** | masque le bandeau « 🏆 Certifié · Entreprise qualifiée… » sur les pages métier et locales | c'est un choix d'affichage, pas un bug. Le bandeau est encore sur **26 pages** de `recette`. Le veux-tu masqué ? |
| **KPI « Clics actions client »** (`admin-pro/analytics.html`) | compteur tel / email / WhatsApp sur 30 jours, top pages, courbe 7 jours | fonctionnalité entière, **absente de `recette`**. Elle lit `click_events`, que la mesure alimente déjà. Utile et sans risque : à reprendre si tu la veux. |
| **Carte des zones** (`assets/hc-map-zones.js`) | trace le polygone réel de la zone (`zonePoly`) au lieu d'un cercle | `recette` n'a pas ce code. Sujet déjà connu (carte rognée). À reprendre après vérification du tracé. |
| **`a-propos.html`** | retire la newsletter et la section « Nos outils » | motif du commit : « jamais demandé par Florian ». Les deux blocs sont **toujours en ligne**. Tu tranches. |
| **`contact.html`** | masque le bandeau « Demande de devis pour… » quand `?presta=` est inconnu ; remplace 5 emojis par des SVG sobres | le bandeau s'affiche encore avec une prestation inconnue. Correction saine, à reprendre. |
| **Double CTA « Réserver / Commander » + Devis** sur les cartes prestations | ajouté sur les fiches | **à ne pas reprendre tel quel** : le tunnel « Ma demande » a été refait depuis (catalogue, panier, checkout). Le réintroduire créerait un second chemin de commande — exactement ce que la règle de page canonique interdit. |

### 3.4 Obsolète — ne pas reprendre (2 sujets)

- **`assets/hc-services-loader.js`** : `staging` le modifie ; **le fichier n'existe plus sur `recette`**,
  remplacé par le moteur de catalogue. Reprendre le patch ressusciterait un fichier mort.
- **`admin-pro/photos-pages.html`** : `staging` le vide au profit de `photos.html` ; sur `recette` les
  deux écrans ont évolué séparément. À traiter dans l'admin, pas par fusion.

### 3.5 Risqué — à ne pas fusionner sans relecture (3 sujets)

| Sujet | Risque |
|---|---|
| **`assets/hc-widgets.js` (+209 lignes)** | ce fichier est chargé par **66 pages**. `staging` y ajoute le chargement dynamique du WYSIWYG et neutralise l'ancien widget rond bleu ; `recette` l'a modifié de son côté (53 % de l'intention déjà là). Une fusion brutale casse 66 pages. À reprendre morceau par morceau, avec contrôle visuel. |
| **CMS WYSIWYG** (`hc-edit-mode.js`, `?edit=1`, écran de validation) | le fichier **est déjà sur `recette` mais aucune page ne le charge** : la fonctionnalité est à moitié posée. Soit on la câble et on la teste (édition en ligne = écriture de contenu, donc garde-fous à écrire), soit on retire le fichier. **Ne pas laisser en l'état.** |
| **`images/.test-write`, `images/_to_delete_README.md`** | supprimés par `staging`, toujours présents sur `recette`. Suppression sans importance, mais c'est une suppression : je ne la fais pas sans ton accord. |

## 4. Recommandation

1. **Ne pas fusionner `staging`.** Sur 91 fichiers, 13 sont déjà repris, 31 ont été traités autrement
   et mieux, 2 sont obsolètes. Une fusion écraserait trois mois de travail plus récent.
2. **Reprendre à la main 3 choses sûres**, si tu les valides : le KPI « clics actions client », la
   garde `?presta=` inconnu sur contact, le polygone réel de la carte.
3. **Trancher 3 questions d'affichage** : bandeau de confiance sur les pages métier, newsletter et
   « Nos outils » sur À propos, délais annoncés sur les 31 pages prestations.
4. **Décider du CMS WYSIWYG** : le câbler proprement, ou retirer le fichier qui dort.
5. **Poser un tag de sauvegarde sur `staging`** avant toute opération, pour pouvoir y revenir :
   `git tag sauvegarde/staging-2026-09-23 <tête de staging>`. Je ne l'ai pas posé — créer une
   référence sur le dépôt est une écriture, elle t'appartient.

Aucune de ces actions n'a été exécutée.
