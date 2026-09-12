# AI-VISIBILITY / GEO-AEO / SEO LOCAL — AUDIT + PLAN

> Chantier issue #9 commentaire 5450850610. **Audit d'abord** ; correctifs sûrs après les P0 commerce
> ou en parallèle sans risque de régression. Recette only, aucun PROD sans GO Florian.
> Date baseline : **2026-08-28**. Domaine landing : `depan59-62.fr` · app : `app.depan59-62.fr`.
>
> **Règle honnêteté** : aucun moteur ne garantit inclusion/citation. On maximise des **signaux
> vérifiables**. Ci-dessous, `[DOC]` = fait documenté (source officielle/actuelle), `[HYP]` = hypothèse
> SEO/GEO à valider par la mesure. Aucun cloaking, keyword stuffing, doorway, faux avis, UA inventé.

## 0. Synthèse — le site est déjà SEO-mature
Constat : ~120 pages racine + sous-dossiers (realisations/, actualites/, prestations/…), **~195 pages
avec JSON-LD**, **196 avec canonical**, sitemap dynamique (139 URLs), robots.txt structuré, avis Google
réels, `lang="fr"`, alt présents (home : 0 image sans alt). Le chantier est un **affinage + quelques
correctifs ciblés**, pas une refonte. Risque global : faible.

## 1. Crawlabilité IA / moteurs — état
| Élément | État | Preuve | Verdict |
|---|---|---|---|
| robots.txt | présent, bloque `/admin*`, `/docs/`, `/scripts/`, `.json/.md/.sh/.pdf`, autorise `/assets/` | `robots.txt` | ✅ sain |
| Sitemap | dynamique via Edge `/functions/v1/sitemap` (139 `<loc>`), déclaré dans robots | `_redirects` + live | ⚠️ **incohérence hôte** (voir §2) |
| meta robots noindex | uniquement pages non publiques : catalogue/recette/realisation(no-slug)/reset/404/espace-client/admin-pro | grep noindex | ✅ intentionnel, aucun accidentel |
| Canonicals | non-www `https://depan59-62.fr/...` sur 113+ pages | index/plombier-saint-omer | ⚠️ voir §2 |
| Netlify headers | CSP/HSTS/XFO/permissions présents | `netlify.toml` | ✅ |
| `llms.txt` | **absent** | — | voir §10 (optionnel, non-standard) |

### Crawlers IA/moteurs — faits documentés `[DOC]`
Trois familles par éditeur : **entraînement**, **recherche/citation**, **fetch déclenché-utilisateur**.
- **OpenAI** : `GPTBot` (entraînement), `OAI-SearchBot` (citations ChatGPT Search), `ChatGPT-User` (fetch live). Contrôlables séparément dans robots.txt.
- **Anthropic** : `ClaudeBot`/`anthropic-ai` (entraînement), `Claude-SearchBot` (recherche), `Claude-User` (fetch).
- **Perplexity** : `PerplexityBot` (index), `Perplexity-User` (fetch). ⚠️ rapport Cloudflare (04/08/2025) : crawlers non déclarés observés contournant les directives → robots.txt non pleinement fiable pour Perplexity.
- **Google** : `Googlebot` (recherche) ; `Google-Extended` (opt-out entraînement Gemini, n'affecte pas l'indexation Search).
- **Microsoft** : `Bingbot` (Search + Copilot).

**Recommandation GEO** `[HYP sur l'impact, DOC sur les UA]` : pour maximiser la **découvrabilité/citation**,
laisser passer les crawlers de **recherche** (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`,
`Bingbot`, `Googlebot`) et les **fetch utilisateur** (`ChatGPT-User`, `Claude-User`, `Perplexity-User`).
Le `User-agent: *` `Allow: /` actuel les autorise **déjà**. Les crawlers d'**entraînement**
(`GPTBot`, `ClaudeBot`, `Google-Extended`) = **décision business** (autoriser n'améliore pas la citation ;
bloquer protège le contenu). → **Décision Florian requise** avant d'ajouter des blocs explicites.

Sources : voir §15.

## 2. Entité entreprise / NAP — cohérence
- **Téléphone** : `03 66 10 01 34` = NAP réel, **1078 occurrences** (dominant, cohérent). Numéros
  placeholder (`0321000000`, `0987654321`, `0328000000`) présents **uniquement** dans `admin-pro/`
  (noindex/bloqué) → **pas de fuite NAP publique** ✅.
- **Agences** : `Saint-Omer · SARL Dépan'Audo` (62) / `Dunkerque · SARL Dépan'DK` (59) — utilisé dans le moteur commande.
- ⚠️ **Incohérence hôte canonique** (P1) : canonicals = `https://depan59-62.fr/` (non-www) ; **sitemap =
  `https://www.depan59-62.fr/`** (www). robots.txt `Sitemap:` = `https://depan59-62.fr/sitemap.xml` (non-www).
  → Choisir **UN** hôte canonique (recommandé : non-www, conforme aux canonicals) et aligner sitemap
  (Edge Function) + robots + redirects 301 www→non-www. **Signal d'entité/consolidation d'autorité.**
- **Source de vérité NAP** : à centraliser (aujourd'hui répété en dur dans 100+ pages). → proposer un
  `content/config/nap.json` + un JSON-LD Organization/LocalBusiness unique injecté (P2, sans régression).

## 3. Structured data Schema.org — état + risques
Types présents (site-wide) : `LocalBusiness` (~178), `Organization` (~157), `Service` (~281),
`Offer` (~228), `BreadcrumbList` (~187), `FAQPage`/`Question`/`Answer` (32 pages), `City` (~353),
`PostalAddress`, `OpeningHoursSpecification`, `ListItem`.
- ✅ Couverture riche et pertinente pour un artisan multi-métiers local.
- ⚠️ **Deux styles JSON-LD** coexistent (`"@type":"X"` compact vs `"@type": "X"` espacé) → 2 générateurs.
  Non bloquant mais à **valider individuellement** (risque d'un template invalide passé inaperçu). Action :
  passer chaque type au **Schema Markup Validator** + **Google Rich Results Test**, corriger les invalides.
- ⚠️ `FAQPage` : depuis 08/2023 Google **restreint** les rich results FAQ aux sites gouv/santé `[DOC]`.
  Le balisage reste **valide et utile pour l'AEO/entité** (extraction IA) mais **ne produira pas** de
  rich snippet FAQ Google pour ce site. → conserver, ne pas en attendre de rich result Google.
- Recommandé (P1, si justifié réel) : `HomeAndConstructionBusiness` (sous-type de LocalBusiness) +
  `areaServed` (villes réellement desservies) + `sameAs` (profils réels GBP/FB) + `aggregateRating`
  **uniquement** à partir d'avis réels agrégés (jamais fabriqué).

## 4. Architecture sémantique — pages
- **44 pages ville×métier** (plombier-14, chauffagiste-8, serrurier-8, electricien-4, menuisier/travaux/
  vitrier/volets/pmr…). → **Audit doorway requis** : chaque page doit avoir une **valeur locale réelle**
  (contenu spécifique commune, zones, réalisations locales, FAQ locale) et non un gabarit dupliqué avec
  juste le nom de ville substitué. Livrable : matrice §Matrice ci-dessous, colonne « unicité contenu ».
- Pages transverses saines : `nos-prestations`, `zones-intervention`, `contrats-entretien`,
  `devis-express`, `realisations`, `actualites`, `contact`, `a-propos`.
- Tunnel commande `/catalogue` = `noindex` (correct : ne cannibalise pas les landing SEO ; deep-link
  `#cat=famille` / `#step=devis` depuis les pages métier — déjà en place).

## 5. Réalisations = preuve forte
- Source : Edge `realisations-json` (métier, title, description, image_after, slug, ville si dispo).
  URLs propres `/realisations/{slug}`. Section home restaurée (HOME-1). ✅
- Manque potentiel : structurer par chantier **métier + problème + solution + commune + date + photos +
  équipement/marque** en `Article`/`ImageObject` + réutilisation cohérente sur pages métier/ville
  **sans duplication** (P1). Nettoyage emoji/markdown déjà appliqué côté home.

## 6. Actualités / conseils
- Source `content/actualites/index.json` (categorie, resume, date, image, url). Filtre anti-mélange
  chantier/actu en place. ✅ Éviter la **génération massive de contenu pauvre** — privilégier réponses
  expertes locales (entretien, sinistre/assurance, réglementation vérifiable).

## 7. E-E-A-T / confiance
Présents et exploitables : techniciens **salariés**, agences locales, mentions légales, garantie décennale,
avis Google **réels** (carousel live), processus, prix/devis. ⚠️ **Ne jamais fabriquer** avis, notes,
certifications, années d'expérience, partenaires. Certifications/assurances : n'afficher que si **publiables
et prouvées**. Action : vérifier que chaque label/logo affiché est réellement détenu (audit humain).

## 8. NAP externe — checklist actions HUMAINES (le code ne corrige pas)
- [ ] **Google Business Profile** (Saint-Omer + Dunkerque) : NAP identique au site, catégories métiers, zones, horaires, photos, lien site (hôte canonique).
- [ ] **Bing Places for Business** : même NAP.
- [ ] **Apple Business Connect** : même NAP.
- [ ] Annuaires pro pertinents (PagesJaunes, etc.) : NAP identique, pas de doublons.
- [ ] Cohérence stricte **Nom / Adresse / Téléphone / URL** partout (même hôte canonique).

## 9. Avis — stratégie conforme
- [ ] Demande d'avis **après intervention** (SMS/email post-lead, déjà une brique `lead-auto-reply`).
- [ ] Répondre aux avis (Google/FB).
- [ ] Lien vers profils réels. **Aucun faux avis, aucune incitation contraire aux règles Google.**

## 10. Citabilité IA (AEO)
- ✅ Réponses directes, titres explicites, FAQ, listes/tableaux présents.
- `llms.txt` : **absent**. `[HYP]` — **non-standard**, aucun moteur ne garantit l'utiliser ; faible coût,
  faible risque. Décision : **optionnel P2** (générer un `llms.txt` pointant les pages clés/services/zones),
  sans le présenter comme un standard de recommandation. **Jamais** de « texte pour IA » caché (cloaking interdit).

## 11. Performance / accessibilité
- ✅ `lang="fr"`, alt présents (home), lazy-loading images, HTML sémantique, CSP.
- À mesurer (P1) : Lighthouse/PSI mobile (LCP/CLS/INP) sur home + 1 page métier ; corriger images non-WebP
  (backlog CLN-2), render-blocking résiduel. **Contenu crawlable sans interaction impossible** : OK (le
  contenu SEO est en HTML statique ; seul le tunnel `/catalogue` est JS, et il est `noindex` volontaire).

## 12. Protocole de mesure GEO/AEO (baseline datée)
Panel de requêtes locales par intention/métier/ville (baseline **2026-08-28**, à re-mesurer périodiquement,
**manuellement/APIs autorisées**, pas de scraping interdit) :
```
plombier urgence Saint-Omer · chauffagiste chaudière fioul Saint-Omer · serrurier Dunkerque ·
entreprise dégât des eaux Saint-Omer · électricien tableau Saint-Omer · vitrier bris de glace Dunkerque ·
entretien chaudière gaz Saint-Omer · dépannage plomberie Audomarois · contrat entretien chaudière 62500
```
Pour chaque requête × moteur (ChatGPT Search, Gemini, Copilot/Bing, Perplexity, Google) : **HELP CONFORT
cité ? position/citation si observable ? concurrents cités ? sources utilisées ?** Consigner dans
`docs/seo/GEO-BENCHMARK.md` (à créer) avec date. `[HYP]` sur la corrélation correctifs → citation.

## 13. Analytics — trafic référent IA
- `[HYP]` : distinguer les referrers d'assistants IA (chatgpt.com, perplexity.ai, gemini, copilot, bing)
  dans l'analytics existant (GA4/mesure d'audience), **sans donnée personnelle supplémentaire**.
  Limite d'attribution : beaucoup de fetch IA sont sans referrer → **attribution partielle**, à documenter.

## 14. Recherche concurrentielle (à produire)
Identifier **5–10 concurrents locaux** réellement visibles (Google/IA) par métier (Saint-Omer/Dunkerque) et
expliquer factuellement leurs avantages (contenu, avis, citations, pages locales, backlinks, GBP,
réalisations) → backlog d'amélioration HELP CONFORT **sans copier**. Livrable : `docs/seo/COMPETITIVE.md`.

## Matrice pages / services / zones / schema (extrait à compléter)
| Type de page | Ex. | Schema attendu | Statut | Unicité contenu |
|---|---|---|---|---|
| Accueil | `/` | Organization + LocalBusiness + BreadcrumbList | ✅ présent | ok |
| Prestations | `nos-prestations` | Service + Offer + BreadcrumbList | ✅ | ok |
| Zones | `zones-intervention` | LocalBusiness + areaServed(City) | ✅ | à vérifier |
| Métier×ville | `plombier-saint-omer` | LocalBusiness + Service + City + FAQ | ✅ | ⚠️ **auditer doublon** |
| Contrats | `contrats-entretien` | Service/Offer | ✅ | ok |
| Réalisation | `/realisations/{slug}` | Article/ImageObject | ⚠️ à enrichir | ok |
| Actualité | `/actualites/{slug}` | Article/BlogPosting | à vérifier | ok |

## Backlog priorisé
**P1 (sûr, fort impact, sans régression)**
1. `fix(seo): align canonical host (non-www) across sitemap + robots + redirects` — cohérence hôte.
2. `test(seo): validate JSON-LD (schema + rich results) and fix invalid templates` — matrice de validation.
3. Audit doorway des 44 pages métier×ville → plan de dé-duplication/enrichissement (doc, puis lots).
4. Lighthouse mobile baseline + quick wins perf.

**P2 (à décider / plus long)**
5. Centraliser NAP (`content/config/nap.json`) + Organization/LocalBusiness unique.
6. Enrichir réalisations (Article/ImageObject, réutilisation pages métier/ville).
7. `llms.txt` optionnel (décision).
8. Bloc robots explicite crawlers entraînement (décision business Florian).

**Actions humaines (hors code)** : §8 (GBP/Bing/Apple/annuaires), §9 (avis), §14 (concurrents),
§12 (mesure manuelle), vérification labels/certifs réels.

## Tests à exécuter (avant/après chaque correctif)
- robots.txt : 200, directives correctes, Sitemap accessible.
- sitemap.xml : 200, hôte cohérent, URLs 200 (pas de redirigées/noindex listées).
- canonicals : 1 par page, hôte unique, auto-référentes.
- schema : Schema Validator + Google Rich Results Test PASS par type.
- 404/redirects : `/realisation*`→`/realisations`, www→non-www 301.
- crawl interne : liens internes cohérents, pas d'orphelines indexables.

## 15. Sources (crawlers — documentées)
- OpenAI crawlers (GPTBot / OAI-SearchBot / ChatGPT-User) : [ppc.land](https://ppc.land/openai-revises-chatgpt-crawler-documentation-with-significant-policy-changes/), [CrawlerCheck OAI-SearchBot](https://crawlercheck.com/directory/ai-bots/oai-searchbot)
- Panorama AI crawlers (ClaudeBot/PerplexityBot/Google-Extended/Bingbot ; Cloudflare Perplexity 08/2025) : [Momentic](https://momenticmarketing.com/blog/ai-search-crawlers-bots), [Anagram](https://www.anagram.ai/blog/ai-crawlers-explained-gptbot-claudebot-perplexitybot-and-how-to-let-them-in-2026)
- (Google FAQ rich-result restriction 2023 : à re-sourcer sur Google Search Central avant implémentation.)

---

# BASELINE FACTUELLE (2026-08-28) — ajout demandé (5450879322)

## B1. Inventaire URL réel (mesuré)
| Type | Volume | Indexable | Sitemap | Note |
|---|---|---|---|---|
| Pages racine `.html` | 120 | oui sauf tunnel/utilitaires (catalogue/recette/realisation-no-slug/reset/404/espace-client) + `/admin-pro/*` | oui | — |
| Métier×ville | **22** | oui | oui | ⚠️ **audit doorway** (unicité contenu local) |
| `prestations/*.html` | 35 | oui | partiel | vérifier canonicals + distinct |
| `realisations/*.html` | 25 | oui | oui | preuve locale |
| `actualites/*.html` | 21 | oui | oui | contenu conseils |
| **Sitemap live (`<loc>`)** | **139** | — | — | hôte **www** (⚠️ vs canonicals non-www) |
| Réalisations (edge `realisations-json`) | **28** | — | — | source unique réutilisable |

Colonnes à compléter par page lors de l'implémentation P1 (status HTTP, canonical exact, title/H1,
schema présent, maillage entrant, contenu distinct O/N) — matrice §Matrice + tests §Tests.

## B2. Entity graph (source canonique proposée)
- **Marque** : HELP CONFORT (réseau, groupe La Poste) — Saint-Omer & Dunkerque.
- **Entités juridiques exploitées** : `SARL Dépan'Audo` (Saint-Omer, 62) · `SARL Dépan'DK` (Dunkerque, 59).
- **NAP** : tél `03 66 10 01 34` (cohérent, 1078 occ.) ; placeholders (0321…, 0987…) **confinés à `/admin` noindex** = pas de fuite publique.
- **URL canonique** : à figer **non-www** (`https://depan59-62.fr`) et aligner sitemap/robots/redirects.
- **Métiers** : plomberie, chauffage, électricité, serrurerie, vitrerie, menuiserie, rénovation, entretien chaudière, urgence.
- **Zones** : Audomarois (62) + Dunkerquois (59) + communes réellement desservies (à lister depuis zones-intervention, pas d'invention).
- **sameAs** : profils réels GBP/FB/annuaires (à renseigner uniquement si vérifiés — §8).
- **Contradiction à surveiller** : hôte www vs non-www (schema/sitemap/canonical/footer). Aucune autre contradiction NAP publique détectée.

## B3. Crawlers — tableau daté (vérifié 2026-08-28)
| Crawler | Fonction | Autorisé actuellement ? | Règle robots actuelle | Recommandation | Source |
|---|---|---|---|---|---|
| Googlebot | Search | ✅ | `User-agent: *` Allow | garder | Google Search Central `[à re-sourcer officiel]` |
| Bingbot | Search + Copilot | ✅ | idem | garder | Bing Webmaster `[à re-sourcer]` |
| OAI-SearchBot | ChatGPT Search (citation) | ✅ | idem | **garder** (visibilité IA) | ppc.land / CrawlerCheck |
| ChatGPT-User | fetch déclenché user | ✅ | idem | garder | idem |
| GPTBot | entraînement OpenAI | ✅ | idem | **décision business** | idem |
| Claude-SearchBot | recherche Anthropic | ✅ | idem | garder | Momentic/Anagram |
| ClaudeBot / anthropic-ai | entraînement | ✅ | idem | décision business | idem |
| PerplexityBot | index Perplexity | ✅ | idem | garder (⚠️ contournements observés Cloudflare 08/2025) | Momentic |
| Google-Extended | opt-out entraînement Gemini | ✅ (non bloqué) | idem | décision business | Google `[à re-sourcer]` |

`CRAWLER_BLOCKS = 0` (aucun crawler de recherche bloqué). Les `[à re-sourcer]` doivent être confirmés
sur la doc officielle éditeur avant tout changement robots.

## B4. Schema — test réel (à exécuter en P1)
Extraction + validation par type via Schema Markup Validator + Google Rich Results Test.
`SCHEMA_ERRORS = à mesurer` (non encore exécuté — ne pas prétendre 0 sans test). Priorité : valider les
2 styles JSON-LD coexistants, `FAQPage` (valide, pas de rich result Google post-2023), `LocalBusiness`.

## B5. Métrique baseline
`BASELINE_DONE=YES | URLS≈201 (racine 120 + sous-dossiers 81) | INDEXABLE≈sitemap 139 | SCHEMA_ERRORS=TBD(test P1) | NAP_CONFLICTS=0 public (hôte www/non-www à aligner) | CRAWLER_BLOCKS=0 | REALISATIONS_MAPPED=28 | QUERY_PANEL=64 (≥60) | QUICK_WINS=5 | HUMAN_ACTIONS=5`

## 5 QUICK WINS (classés par impact estimé)
1. **Aligner l'hôte canonique** (non-www) sitemap+robots+redirects — *impact fort / effort faible / risque faible* — consolide l'autorité et l'entité. PASS : sitemap et canonicals même hôte, 301 www→non-www.
2. **Valider tous les JSON-LD** et corriger les templates invalides — *impact moyen-fort / effort moyen / risque faible* — éligibilité rich results + compréhension entité. PASS : 0 erreur Rich Results Test par type.
3. **Audit doorway des 22 pages métier×ville** (unicité contenu) — *impact moyen / effort moyen / risque nul (lecture)* — évite la dilution/pénalité. PASS : chaque page a un contenu local distinct prouvé.
4. **Enrichir réalisations** (Article/ImageObject : métier+problème+solution+commune+date) réutilisées home/métier/zone — *impact moyen / effort moyen / risque faible* — preuve locale citable. PASS : réalisations balisées + réutilisées sans duplication.
5. **Lighthouse mobile baseline + quick wins perf** (LCP/CLS/INP) — *impact moyen / effort faible-moyen / risque faible*. PASS : Core Web Vitals « good » home + 1 page métier.

## 5 ACTIONS HUMAINES (hors code)
1. Google Business Profile (Saint-Omer + Dunkerque) : NAP + catégories + zones + photos + lien (hôte canonique).
2. Bing Places + Apple Business Connect : même NAP.
3. Collecte d'avis authentiques post-intervention + réponses.
4. Vérifier labels/certifications réellement détenus (aucune fabrication).
5. Renseigner les `sameAs` (profils réels) pour le schema Organization.
