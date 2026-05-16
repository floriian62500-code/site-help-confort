# Audits qualité — HELP Confort

Scripts d'audit local lancés à la demande pour pré-filtrer les erreurs HTML/JSON-LD avant validation W3C/schema.org officielle.

## Scripts

| Script | Sortie | Lance |
|--------|--------|-------|
| `audit_jsonld.py` | `audit_jsonld_report.md` | Vérifie syntaxe + champs Schema.org de chaque bloc `<script type="application/ld+json">` |
| `audit_html5.py`  | `audit_html5_report.md`  | Vérifie DOCTYPE, lang, charset, title, meta description, viewport, canonical, h1, alt manquants, ids dupliqués |

## Lancement

```bash
cd "/path/SITE INTERNET"
python3 admin-pro/audits/audit_jsonld.py
python3 admin-pro/audits/audit_html5.py
```

Pas de dépendance externe — Python 3 stdlib uniquement.

## Limitations connues

- Le compteur de balises (`<div>`, `<a>`…) est **indicatif** — un parseur HTML strict serait nécessaire pour détecter le nesting fin. Un déséquilibre de ±1 est généralement un faux positif lié à la sidebar partagée.
- L'audit ne remplace pas https://validator.w3.org/ ni https://validator.schema.org — il les pré-filtre.
- Les pages dynamiques (réalisation, devis-express, avant/après) ont leur contenu injecté par JS — le `<h1>` statique peut être absent légitimement.

## Dernier passage (mai 2026)

- **HTML5** : 0 erreurs / 31 warnings sur 38 pages — warnings = parser artefacts + `<img alt="">` décoratifs.
- **JSON-LD** : 0 erreurs syntaxe / 173 warnings sur 35 pages — warnings = champs `recommandés` sur `Service` imbriqués qui héritent du `provider`/`areaServed` du parent.
- 3 pages sans JSON-LD (à revoir) : `avant-apres.html`, `devis-express.html`, `realisation.html`.
