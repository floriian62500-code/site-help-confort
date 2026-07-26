# Spec Lot 2 — Pages métiers premium

**Statut** : documentation strictement préparatoire, aucun développement tant que le lot 1 n'est pas livré et validé.
**Priorité roadmap** : #2 (après Homepage qui convertit).
**Périmètre** : 7 pages métier tier 1 uniquement (Saint-Omer). Les pages villes tier 2 seront traitées dans le lot 5 (SEO local massif).

---

## 1. Objectif unique de ces pages

> **Convaincre le visiteur que HELP Confort est le bon spécialiste pour son besoin métier.**

Toute décision de design, contenu ou CTA sert cet objectif. Pas de doublon avec la home (rôle "orienter") ni avec la page contact (rôle "faciliter la prise de contact").

## 2. Pages concernées

| Fichier | Métier | Baseline lignes |
|---|---|---|
| `plombier-saint-omer.html` | Plomberie | 1865 |
| `chauffagiste-saint-omer.html` | Chauffage | 2029 |
| `electricien-saint-omer.html` | Électricité | 1823 |
| `serrurier-saint-omer.html` | Serrurerie | à mesurer |
| `vitrier-saint-omer.html` | Vitrerie | à mesurer |
| `menuisier-saint-omer.html` | Menuiserie | à mesurer |
| `travaux-saint-omer.html` | Travaux/rénovation | à mesurer |

## 3. Audit baseline synthétique (à confirmer avant dev)

**Ce qui existe déjà et fonctionne** :
- Hero métier avec H1 localisé
- Structured data multi-schemas (LocalBusiness + Plumber/HVACBusiness/Electrician + OfferCatalog)
- Section "Notre savoir-faire" avec 5-7 services listés
- Section "Nos chantiers" avec réalisations
- Trust-band commune (avis, années)

**Ce qui manque pour passer en premium** :
- **Preuves sociales chiffrées spécifiques au métier** (nb interventions/an de ce métier, années de spécialisation, taux de résolution 1ère intervention)
- **Certifications/qualifications métier visibles** (Qualibat, RGE si applicable, PGN/PGP gaz pour plombiers, Qualifelec pour électriciens…) — à valider avec Florian quelles certifs HC possède réellement (pas de promesse en l'air, cf règle mémoire)
- **Cas d'usage typiques** : 5-8 pannes/situations courantes avec approche HC (rassure visiteur qui se reconnaît dans le problème)
- **Fourchette tarifaire transparente** pour prestations récurrentes (« à partir de X € » avec cadre explicatif) — à confirmer avec Florian
- **Zones desservies** : liste des principales communes (lien vers pages villes tier 2 quand elles seront transformées lot 5)
- **Réalisations filtrées par métier** (déjà techniquement possible via `realisations-json` + filtre `metier`)
- **Avis clients filtrés par métier** (si tag métier disponible en base `reviews`)
- **Parcours narratif 5 étapes** cohérent avec home + contact (livré lot 1)
- **CTA multi-canaux** : Appeler / Demander un devis / Voir nos chantiers (déjà en place mais à harmoniser)
- **Trust points** distincts : techniciens salariés (pas de sous-traitance), matériel professionnel, standard téléphonique humain

## 4. Composants premium à intégrer

### 4.1 Header métier premium
Sous le H1, une ligne compacte avec **3-4 preuves de spécialisation immédiates** :
- Années d'exercice de HC dans ce métier
- Nb interventions réalisées sur ce métier (rond, chiffre récent)
- Note moyenne avis clients pour ce métier (si disponible)
- Certification métier principale (badge si applicable)

Toutes ces valeurs sourcées depuis Supabase (jamais hardcodées) — cohérent avec la règle "pas de hardcode".

### 4.2 Bloc "Comment on intervient" (le parcours narratif)
Repris du lot 1, cohérent partout : Décrivez → Nous préparons → Un conseiller vous rappelle → Vous recevez votre devis → Nos techniciens interviennent.

### 4.3 Section "Cas courants en [métier]"
5-8 situations concrètes du visiteur (« Fuite sous évier », « Chaudière qui s'éteint », « Serrure claquée dehors »…) avec description empathique + approche HC + CTA vers wizard urgence.

### 4.4 Section "Notre savoir-faire" enrichie
Existant mais à améliorer : ajouter pour chaque service :
- Approche technique HC (comment on procède)
- Matériel utilisé (démonstre le sérieux)
- Fourchette tarifaire (à valider avec Florian)

### 4.5 Section "Nos chantiers récents [métier]"
Filtre dynamique via `realisations-json` + param `?metier=plomberie`. Affiche les 4-6 derniers chantiers de ce métier. Cohérent avec la boucle IA publication du lot 3.

### 4.6 Section "Ils nous ont fait confiance [métier]"
Avis clients filtrés par métier si le tag existe. Sinon avis globaux avec précision "toutes prestations confondues".

### 4.7 Section "Zones où nous intervenons"
Liste des principales communes du secteur avec liens vers pages villes tier 2 (à noter : ces liens ne fonctionneront qu'après le lot 5 SEO local massif — prévoir liens vers `zones-intervention.html` en fallback).

### 4.8 FAQ métier locale
5-7 questions typiques ancrées local + schema.org FAQPage :
- « Combien coûte un [métier] à Saint-Omer la nuit ? »
- « Intervention le dimanche possible ? »
- « Devis gratuit pour [prestation] ? »
- Etc.

### 4.9 CTA finaux clairs
Bloc de fin avec 3 CTA parallèles : Appeler / Demander un devis / Voir toutes nos réalisations métier.

## 5. Contenu à préparer par métier (matrice — à valider avec Florian avant dev)

| Élément | Plomberie | Chauffage | Électricité | Serrurerie | Vitrerie | Menuiserie | Travaux |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Certification métier | PGN/PGP ? | RGE QualiPAC ? | Qualifelec ? | A2P ? | — | — | Qualibat ? |
| Nb interventions/an | à mesurer via Supabase realisations count | | | | | | |
| Fourchette tarifaire par presta | à valider | | | | | | |
| Cas courants (5-8) | à rédiger | | | | | | |
| Questions FAQ (5-7) | à rédiger | | | | | | |

Cette matrice sera remplie par Florian ou co-rédigée pendant la phase Dev du lot 2.

## 6. SEO renforcé

- **Meta description** unique par page, contient métier + villes + différenciateur HC
- **Structured data FAQPage** ajouté (rich snippets Google)
- **Structured data BreadcrumbList** ajouté (fil d'ariane visible SERP)
- **Maillage interne** :
  - Chaque page métier renvoie vers 5-8 pages villes du secteur (fallback zones-intervention.html tant que lot 5 pas fait)
  - Chaque page métier renvoie vers 3-5 réalisations récentes du métier
  - Cross-linking entre métiers connexes (plombier ↔ chauffagiste ↔ salle de bain)
- **Meta canonique** vérifié partout
- **Retrait meta `no-cache`** déjà fait (lot #14, semaine dernière)

## 7. Cohérence charte HELP Confort

Design cohérent avec la home et le lot 1 :
- Palette : bleus #0DA0CF / #1FC4F0 (technique), orange #FF6B1A (urgence), gris #64748b (secondaire)
- Typo : Inter (400/500/700/800) + Playfair Display italique pour emphase
- Espacements aérés, cards blanches sur fond très clair, ombres douces
- CTA principaux : gradient bleu + hover subtil, jamais criards
- Icônes SVG stroke 1.8-2.4 cohérent avec le reste du site

## 8. Interactions et micro-copy

- Hover cards avec élévation légère (transform translateY(-2px) + shadow)
- Focus visible sur CTA (accessibilité)
- Wording empathique (règle mémoire : "on vend confiance") — jamais commercial pushy
- Textes courts, scannables mobile
- Preuve sociale toujours visible (jamais loin d'un CTA)

## 9. Grilles à passer AVANT livraison (obligatoire)

### Grille 7 critères business
Chaque page métier doit cocher au minimum :
- ✅ [1] Génère des demandes d'intervention
- ✅ [2] Génère des appels
- ✅ [4] Améliore la confiance
- ✅ [5] Améliore le SEO
- Ne coche pas [3] ventes en ligne (les prestations simples réservables sont dans le lot 4)

### Grille 8 questions produit
- ✅ Améliore l'expérience visiteur cherchant un spécialiste ?
- ✅ Inspire davantage confiance ?
- ✅ Facilite le passage à l'action ?
- ✅ Réduit les frictions ?
- ✅ Améliore le SEO ?
- ⚪ Automatise la communication ? (indirectement via IA publication lot 3)
- ✅ Réduit le temps de gestion ? (source unique Supabase pour data)
- ✅ Valeur ajoutée vs concurrent (structured data + FAQ + preuves chiffrées absentes chez concurrents locaux)

### Checklist cohérence 8 points (avant clôture lot)
- [ ] Desktop/mobile testé sur 3 largeurs (mobile 375, tablet 768, desktop 1440)
- [ ] Cohérence avec home + contact (parcours narratif identique, wording proche)
- [ ] Cohérence graphique charte HC respectée partout
- [ ] Cohérence juridique (mentions certifs seulement si HC les possède réellement)
- [ ] Cohérence SEO (H1, meta, structured data, canonique, maillage)
- [ ] Cohérence CTA (libellés harmonisés, destinations vérifiées, tracking OK)
- [ ] Cohérence maillage interne (liens sortants + entrants vérifiés)
- [ ] Cohérence charte HC (ton, promesses tenables, image de marque)

## 10. Ce qui NE FAIT PAS partie du lot 2 (hors périmètre strict)

- Les 18 pages métier tier 2 dupliquées (plombier-marck, plombier-outreau, etc.) → **lot 5** (SEO local massif, transformation via template Supabase)
- La réservation en ligne des prestations forfaitaires → **lot 4** (Stripe)
- La refonte du Cockpit BO → **lot 3 bis** (après IA publication)
- Toute nouvelle brique IA → **lot 3** (IA publication uniquement en priorité)

## 11. Livrables attendus fin lot 2

1. 7 pages métier tier 1 refondues avec composants premium listés en §4
2. Rapport de tests 3 largeurs + rapport Lighthouse (perf/SEO/accessibilité)
3. Preview Netlify staging + 8 cases cochées de la checklist §9
4. Note POUR-FLORIAN si des données manquantes bloquent (certifs métier, tarifs, avis par métier)

## 12. Prérequis avant démarrage lot 2

- ✅ Lot 1 livré et validé
- ✅ Cohérence charte confirmée (parcours narratif du lot 1 validé graphiquement)
- 🟡 Matrice §5 remplie par Florian (certifs, tarifs, cas courants, FAQ) — 30 min ensemble
- 🟡 Décision "on affiche des fourchettes tarifaires ou pas ?" — impact confiance/transparence

## 13. Durée estimée

- Développement : 3-4 jours (avec matrice §5 remplie)
- Tests + corrections : 1 jour
- Optimisations : 1 jour
- Livraison + validation : 1 jour
- **Total : ~7 jours ouvrés** pour les 7 pages en qualité premium

---

*Spec préparée le 2026-07-25 pendant l'attente configuration secrets du lot 1. Aucun code produit à ce stade. Aucune dépendance créée. Toute évolution de cette spec attend validation Florian.*
