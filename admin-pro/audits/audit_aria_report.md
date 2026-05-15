# Audit ARIA / a11y — HELP! Confort

_Généré par `admin-pro/audits/audit_aria.py` — 37 pages scannées._

## Synthèse

- Pages scannées : **37**
- Pages 100% clean : **23**
- Pages avec ≥ 1 erreur : **7**
- Total findings : **35**

### Répartition par code

| Code | Sévérité | Occurrences |
|------|----------|-------------|
| `INPUT-NO-LABEL` | avertissement | 18 |
| `DIALOG-NO-LABEL` | erreur | 7 |
| `A-NO-NAME` | avertissement | 6 |
| `BTN-NO-NAME` | erreur | 3 |
| `H1-MISSING` | erreur | 1 |

## Détail par page

### `index.html` — 12 finding(s)

- **BTN-NO-NAME** (erreur, l. 647) — `<button type="button" class="hctsl-btn"></button>`
- **BTN-NO-NAME** (erreur, l. 652) — `<button type="button" class="hctsl-btn"></button>`
- **BTN-NO-NAME** (erreur, l. 657) — `<button type="button" class="hctsl-btn"></button>`
- **DIALOG-NO-LABEL** (erreur, l. 664) — `<div role="dialog">`
- **DIALOG-NO-LABEL** (erreur, l. 2350) — `<div role="dialog">`
- **INPUT-NO-LABEL** (avertissement, l. 913) — `<input type="checkbox" name="resa-metiers[]">`
- **INPUT-NO-LABEL** (avertissement, l. 914) — `<input type="checkbox" name="resa-metiers[]">`
- **INPUT-NO-LABEL** (avertissement, l. 915) — `<input type="checkbox" name="resa-metiers[]">`
- **INPUT-NO-LABEL** (avertissement, l. 916) — `<input type="checkbox" name="resa-metiers[]">`
- **INPUT-NO-LABEL** (avertissement, l. 917) — `<input type="checkbox" name="resa-metiers[]">`
- _… et 2 autre(s)_

### `contact.html` — 8 finding(s)

- **INPUT-NO-LABEL** (avertissement, l. 590) — `<input type="checkbox" name="services[]">`
- **INPUT-NO-LABEL** (avertissement, l. 591) — `<input type="checkbox" name="services[]">`
- **INPUT-NO-LABEL** (avertissement, l. 592) — `<input type="checkbox" name="services[]">`
- **INPUT-NO-LABEL** (avertissement, l. 593) — `<input type="checkbox" name="services[]">`
- **INPUT-NO-LABEL** (avertissement, l. 594) — `<input type="checkbox" name="services[]">`
- **INPUT-NO-LABEL** (avertissement, l. 595) — `<input type="checkbox" name="services[]">`
- **INPUT-NO-LABEL** (avertissement, l. 596) — `<input type="checkbox" name="services[]">`
- **INPUT-NO-LABEL** (avertissement, l. 597) — `<input type="checkbox" name="services[]">`

### `contrats-entretien.html` — 3 finding(s)

- **INPUT-NO-LABEL** (avertissement, l. 1632) — `<input type="checkbox" name="no_facture">`
- **INPUT-NO-LABEL** (avertissement, l. 1647) — `<input type="checkbox" name="sepa_principe">`
- **INPUT-NO-LABEL** (avertissement, l. 1678) — `<input type="checkbox" name="cgv">`

### `realisation.html` — 2 finding(s)

- **A-NO-NAME** (avertissement, l. 95) — `<a href="/"></a>`
- **H1-MISSING** (erreur, l. 0) — `Aucun <h1>`

### `avant-apres.html` — 1 finding(s)

- **A-NO-NAME** (avertissement, l. 72) — `<a href="index.html"></a>`

### `chauffagiste-saint-omer.html` — 1 finding(s)

- **DIALOG-NO-LABEL** (erreur, l. 1742) — `<div role="dialog">`

### `devis-express.html` — 1 finding(s)

- **A-NO-NAME** (avertissement, l. 97) — `<a href="index.html" class="logo"></a>`

### `electricien-saint-omer.html` — 1 finding(s)

- **DIALOG-NO-LABEL** (erreur, l. 1694) — `<div role="dialog">`

### `faq.html` — 1 finding(s)

- **A-NO-NAME** (avertissement, l. 65) — `<a href="index.html" class="hc-logo"></a>`

### `nos-prestations.html` — 1 finding(s)

- **A-NO-NAME** (avertissement, l. 332) — `<a href="index.html" class="hc-logo"></a>`

### `plombier-saint-omer.html` — 1 finding(s)

- **DIALOG-NO-LABEL** (erreur, l. 1752) — `<div role="dialog">`

### `serrurier-saint-omer.html` — 1 finding(s)

- **DIALOG-NO-LABEL** (erreur, l. 1734) — `<div role="dialog">`

### `temoignages.html` — 1 finding(s)

- **A-NO-NAME** (avertissement, l. 101) — `<a href="index.html"></a>`

### `travaux-saint-omer.html` — 1 finding(s)

- **DIALOG-NO-LABEL** (erreur, l. 1729) — `<div role="dialog">`

---

## Codes de sévérité

- **erreur** : impact bloquant pour lecteur d'écran ou validation WCAG AA.
- **avertissement** : pratique non conforme mais souvent compensée par contexte.
- **info** : indication, à valider manuellement.

_Sonde ARIA-AUDIT-V1 — à intégrer au scan quotidien._