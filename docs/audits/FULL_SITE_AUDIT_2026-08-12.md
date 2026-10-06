# Rapport d'audit complet — Site BTP Help Confort (recette)

> **Audit total CP-0004**
> Date d'émission : 2026-08-13 · Fenêtre de scan : 2026-08-12
> Environnement : **recette** (aucune action PROD, Stripe LIVE gelé)
> Registre détaillé : `docs/AUDIT-MASTER.md`

---

## 1. Résumé exécutif

| Indicateur | Valeur |
|-----------|:--:|
| Pages scannées | **177** |
| Findings bruts | **24** |
| Anomalies consolidées | **19** |
| P0 (bloquant) | **0** |
| P1 (critique) | **2** anomalies · **25** pages |
| P2 (majeur) | **12** anomalies · ~40 pages |
| P3 (mineur) | **5** anomalies · ~30 pages |

**Verdict :** aucun bloquant technique (0 P0, aucune page en erreur serveur autre qu'une redirection 301 attendue-en-200). Le risque le plus élevé est **commercial/honnêteté** : 25 pages promettent une « réservation / paiement en ligne + acompte 40 % » alors que le paiement en ligne est **gelé** et qu'aucune infrastructure d'acompte n'existe. Le reste est du SEO on-page (ciblage bi-ville, contenu mince/dupliqué de pages ville, titles trop longs/tronqués) sans impact fonctionnel mais pesant sur la visibilité et la crédibilité.

---

## 2. Top 10 des problèmes à fort impact

| # | ID | Priorité | Impact | Résumé |
|:-:|----|:--:|--------|--------|
| 1 | A-2026-001 | P1 | Honnêteté + conversion, 22 pages | CTA catalogue « réservation en ligne · acompte 40 % » sur 22 pages métier-ville alors que paiement gelé. |
| 2 | A-2026-002 | P1 | Honnêteté, 3 pages phares | Promesses paiement/acompte Stripe sur nos-prestations, garanties, contact — contradiction avec le gel. |
| 3 | A-2026-003 | P2 | Cohérence offre | espace-client met en avant « paiement en ligne des contrats » (gelé) — à marquer « à venir ». |
| 4 | A-2026-005 | P2 | SEO local, 10 pages | Ciblage bi-ville Saint-Omer + Dunkerque (title/H1) → dilution + titles sans séparateur. |
| 5 | A-2026-007 | P2 | SEO local, 14 pages | 14 satellites plombier/chauffagiste « Intervention rapide » dupliqués à ~90 %. |
| 6 | A-2026-008 | P2 | SEO local, 4 pages | 4 satellites serrurier strictement templatisés (1319 mots identiques) → risque doorway. |
| 7 | A-2026-009 | P2 | Conversion, 4 pages | Ces 4 satellites serrurier n'ont aucun formulaire de lead on-page. |
| 8 | A-2026-004 | P2 | SEO/hygiène | realisation.html = stub mort (301 + canonical self + noindex + 3 H1 JS). |
| 9 | A-2026-011 | P2 | Indexation | partenaire.html : 0 JSON-LD + H1 vide sans JS (invisible pour un crawler). |
| 10 | A-2026-013 | P2 | SEO/cannibalisation | salle-de-bain.html & salle-de-bain-pmr.html partagent exactement le même `<title>`. |

---

## 3. Quick-wins (fort ratio impact/effort)

Corrections localisées, faible risque, à préparer pour un lot rapide :

- **A-2026-001** — un seul bloc templatisé partagé répliqué sur 22 pages : retirer « réservation en ligne · acompte 40 % » → « prise de RDV / devis gratuit ». **Un correctif = 22 pages assainies.**
- **A-2026-018** — supprimer le double espace dans le title de urgence.html.
- **A-2026-019** — harmoniser « grohe » → « Grohe » (sanitaire.html).
- **A-2026-013** — différencier le `<title>` de salle-de-bain-pmr.html.
- **A-2026-017** — aligner le gabarit title des 2 pages Dunkerque sur les siblings.
- **A-2026-004** — supprimer/aligner le stub mort realisation.html (canonical self + noindex).
- **A-2026-009** — ajouter le composant formulaire lead partagé sur 4 satellites serrurier.

---

## 4. Plan de correction ordonné (P0 → P1 → P2)

> Aucune correction n'est exécutée ici. Plan de séquençage uniquement. Gates : **aucune PROD, Stripe LIVE gelé.**

### Étape 0 — P0
Néant (0 P0). Rien de bloquant.

### Étape 1 — P1 (honnêteté commerciale, prioritaire absolu)
1. **A-2026-001** — Neutraliser le bloc CTA « réservation en ligne · acompte 40 % » sur les 22 pages métier-ville (correctif templatisé unique). Reformuler en RDV/devis.
2. **A-2026-002** — Aligner nos-prestations, garanties, contact sur le gel : retirer/reformuler paiement en ligne + acompte + lien Stripe SMS/email ; vérifier la cohérence avec l'index.
   - *Contrôle transverse :* re-grep global « acompte », « paiement en ligne », « Stripe », « réserv » sur les 177 pages pour garantir 0 résidu avant clôture.

### Étape 2 — P2 (SEO local + structure + cohérence offre)
3. **A-2026-003** — Marquer « paiement contrats entretien » comme « à venir » sur espace-client.
4. **A-2026-005 / A-2026-006** — Dé-diluer le ciblage bi-ville : un ciblage mono-ville par page (title + H1 + contenu) ; corriger les titles sans séparateur ; différencier les paires travaux/pmr.
5. **A-2026-007 / A-2026-008 / A-2026-012** — Traiter le contenu mince/dupliqué : enrichir en contenu local unique OU réduire l'indexation des satellites / consolider vers pages hub.
6. **A-2026-009** — Ajouter le formulaire lead sur les 4 satellites serrurier.
7. **A-2026-004** — Nettoyer le stub mort realisation.html.
8. **A-2026-010 / A-2026-011** — Clarifier la taxonomie partenaires/fournisseurs ; rendre H1 + JSON-LD server-side sur partenaire.html.
9. **A-2026-013 / A-2026-014** — Titles : dé-dupliquer salle-de-bain PMR ; raccourcir les 7 titres institutionnels > 65 car.

### Étape 3 — P3 (polish, après P1/P2)
10. **A-2026-015 / A-2026-016** — Corriger le générateur de title (troncature propre) + raccourcir les 11+8 titres longs/ellipsés.
11. **A-2026-017 / A-2026-018 / A-2026-019** — Gabarit Dunkerque, double espace, casse Grohe.

---

## 5. Gates & conformité

- **Aucune** modification de code réalisée dans ce run.
- **Aucun** déploiement, **aucune** action PROD.
- **Stripe LIVE gelé** — cohérent avec les anomalies P1 : les corrections consistent à *retirer* les promesses de paiement, pas à activer un flux.
- Statut de toutes les anomalies : **DÉTECTÉ** (aucune passée en CLASSÉE sans contrôle réel sur l'environnement final).
