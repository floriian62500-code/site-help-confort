# SEO + AEO/GEO + VISIBILITÉ IA — HELP CONFORT

> Objectif : que HELP CONFORT soit **facile à trouver sur Google**, **facile à comprendre par les moteurs IA**,
> et **extrêmement simple à contacter**. Pas de triche : entité forte + contenu local vérifiable + preuves réelles.

## 1. ENTITÉ (source de vérité — cohérence à maintenir partout)
- **Nom** : HELP Confort Saint-Omer · **Raison sociale** : SARL Dépan'Audo
- **Tél** : 03 66 10 01 34 (+33366100134) · **Email** : saint-omer@helpconfort.com (Dunkerque : dunkerque@helpconfort.com)
- **Adresse** : 242 route de Boulogne, 62500 Saint-Martin-lez-Tatinghem
- **Agences** : Dépan'Audo (Saint-Omer) · Dépan'DK (Dunkerque)
- **Métiers** : plomberie, chauffage, électricité, serrurerie, vitrerie, menuiserie, volets, rénovation, adaptation PMR
- **Zones** : Audomarois, Calaisis, Boulonnais, Dunkerquois (222 communes)
- **Preuves** : 4,7/5 · 343 avis Google · Trustville · réseau HELP Confort
- **Profils (sameAs, présents dans le schema)** : Facebook /depanaudo, LinkedIn (dirigeant), Google Maps, Trustville
- **SIRET/RCS** : présents dans mentions-legales.html

**Cohérence** : le schema `LocalBusiness` de l'accueil est complet et cohérent (name, legalName, telephone, email, address, sameAs, knowsAbout, OfferCatalog). ✅
**À vérifier hors site** (lecture externe, non fait) : Google Business Profile, annuaires, réseaux — signaler toute divergence NAP.

## 2. SEO TECHNIQUE — état réel (statique, gabarits)
| Contrôle | État |
|---|---|
| H1 unique / page | ✅ |
| Canonical self (www.depan59-62.fr) | ✅ |
| Titles métier×ville uniques + intention + CP | ✅ (8 titres faibles corrigés) |
| Meta description | ✅ |
| Meta robots noindex accidentel (pages publiques) | ✅ (seuls admin/reset/404/espace-client en noindex — correct) |
| Meta `no-cache/Pragma/Expires` | ✅ retirées (93 pages) |
| JSON-LD (LocalBusiness/Breadcrumb/Offer/FAQPage) | ✅ |
| Sitemap + robots (référencé) | ✅ |
| og:title/description/url | ✅ (contact.html complété) |
| **Réalisations individuelles (`realisation.html`) `noindex`** | 🟠 **asset SEO/IA perdu** — voir §4 |

## 3. AEO / GEO — contenu citable par une IA
Les pages métiers ont déjà **FAQPage** (4 blocs). Principe à généraliser : chaque page répond, **en tête**, à de vraies
questions par des réponses **courtes, factuelles, vérifiables**, puis développe. Exemples de questions à couvrir :
- « Intervenez-vous en urgence à Saint-Omer ? » → *Oui, dépannage plomberie/chauffage/électricité/serrurerie, Lun-Sam 9h-17h, rappel sous 30 min.*
- « Quel plombier intervient à Longuenesse ? » → *HELP Confort (Dépan'Audo), 03 66 10 01 34, techniciens salariés.*
- « Peut-on envoyer des photos avant intervention ? » → *Oui, via l'assistant de demande en ligne.*
- « Combien coûte un dépannage ? » → *Devis gratuit ; interventions à diagnostiquer sur place, prestations forfaitaires affichées.*
- « Intervenez-vous avec les assurances / sinistres ? » → *Oui.*

## 4. RÉALISATIONS = ACTIF SEO+IA (action prioritaire)
🟠 `realisation.html?slug=` est `noindex` → les chantiers ne sont **pas indexables individuellement**.
**Recommandation** : rendre chaque réalisation indexable (page réellement crawlable : métier + problème + ville + solution +
photos + résultat + CTA), maillée avec pages métiers/villes/prestations/guides. **Décision d'architecture** (statique vs rendu
serveur) — à trancher ; gain SEO/citabilité local important.

## 5. MATRICE DE REQUÊTES — visibilité (à contrôler périodiquement)
> On ne garantit jamais une position IA. On augmente la probabilité d'être compris/cité.

| Requête commerciale | Google | ChatGPT(web) | Gemini | Perplexity | Copilot | HC cité ? | Source servie | Concurrents | Info erronée |
|---|:--:|:--:|:--:|:--:|:--:|:--:|---|---|---|
| plombier Saint-Omer | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | |
| dépannage plomberie Saint-Omer | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | |
| chauffagiste Saint-Omer / entretien chaudière | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | |
| serrurier Dunkerque / ouverture porte | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | |
| électricien urgence Saint-Omer | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | |
| dépannage volet roulant Dunkerque | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | |
| entreprise multi-dépannage habitat Saint-Omer | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | | | |

*Contrôle manuel périodique (aucun accès API IA automatisé fiable ici). À remplir lors des passes de veille.*

## 6. TECHNIQUE CRAWLERS
- robots.txt ✅ (1 sitemap, simplifié) · sitemap ✅ · canonicals ✅ · HTML rendu : contenu principal servi en HTML (pages métiers/prestations statiques). Le contenu Lot 2 dynamique (fournisseurs/communes via Edge Fn) est un **complément** — le cœur (H1, offre, FAQ, coordonnées) est en HTML statique, donc crawlable. ✅
- ⚠️ **Rien de tout ceci n'est en production** tant que le déploiement n'a pas eu lieu (prod = 16/06).

## 7. ACTIONS PRIORISÉES
1. **P1** — Déployer (débloque TOUT le SEO ci-dessus en prod). Bloqué : token Netlify + GO.
2. **P2** — Rendre les réalisations indexables (asset SEO/IA) — décision archi.
3. **P2** — Généraliser les réponses AEO courtes en tête de page métier (FAQ déjà présente).
4. **P3** — Enrichir `sameAs` (ajouter réseau HELP Confort national) ; veille concurrents locale.
