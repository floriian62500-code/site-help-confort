# 🔄 Audit synchronisation wizard ↔ catalogue — Sonde IA #59

*Généré le 2026-05-15 13:11 — `admin-pro/audits/audit_catalogue_sync.py`*

**Wizard home (`ALL_PRESTAS` d'index.html)** : 30 prestations
**Catalogue (`LOCAL_CATALOG` de nos-prestations.html)** : 30 prestations
**Slugs communs** : 28
**Alertes totales** : **9**

## 🚨 Prestations dans wizard mais ABSENTES du catalogue

| Slug | Label wizard | Métier | Prix |
|------|--------------|--------|------|
| `plomberie-sur-devis` | Autre dépannage plomberie | Plomberie | sur devis |
| `travaux-renovation` | Devis travaux / rénovation | Travaux | sur devis |

## 🚨 Prestations dans catalogue mais ABSENTES du wizard

| Slug | Label catalogue | Métier | Prix |
|------|-----------------|--------|------|
| `chauffe-eau-100-st` | Chauffe-eau 100 L Stéatite (mural) | chauffe-eau | 887.0 € |
| `chauffe-eau-150-st` | Chauffe-eau 150 L Stéatite (mural) | chauffe-eau | 961.0 € |

## ⚠️ Écarts de prix sur slugs communs

| Slug | Wizard | Catalogue |
|------|--------|-----------|
| `adaptation-pmr` | quote=True | quote=False |
| `blindage-porte` | quote=True | quote=False |
| `pompe-a-chaleur` | quote=True | quote=False |
| `renovation-salle-de-bain` | quote=True | quote=False |
| `tableau-electrique` | quote=True | quote=False |

## 🛠️ Procédure de correction

Pour chaque alerte ci-dessus :
1. **Slug seul dans le wizard** → soit l'ajouter au `LOCAL_CATALOG` de nos-prestations.html, soit le retirer du wizard.
2. **Slug seul dans le catalogue** → l'ajouter à `ALL_PRESTAS` pour qu'il puisse être proposé dans le wizard.
3. **Écart de prix** → re-croiser avec `TARIFS_REFERENCE.md` puis aligner les deux fichiers sur le tarif validé.

*Sonde IA #59 — référence MEMOIRE_IA_MAINTENANCE.md addendum v10.*
