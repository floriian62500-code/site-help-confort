# 🔄 Audit synchronisation wizard ↔ catalogue — Sonde IA #59

*Généré le 2026-07-12 06:05 — `admin-pro/audits/audit_catalogue_sync.py`*

**Wizard home (`ALL_PRESTAS` d'index.html)** : 0 prestations
**Catalogue (`LOCAL_CATALOG` de nos-prestations.html)** : 0 prestations
**Slugs communs** : 0
**Slugs wizard tolérés (fourre-tout)** : 0
**Alertes totales** : **0**

## 🚨 Prestations dans wizard mais ABSENTES du catalogue

✅ Aucun écart — tous les slugs wizard existent dans le catalogue.

## 🚨 Prestations dans catalogue mais ABSENTES du wizard

✅ Aucun écart — tous les slugs catalogue existent dans le wizard.

## ⚠️ Écarts de prix sur slugs communs

✅ Tous les prix communs concordent.

## 🛠️ Procédure de correction

Pour chaque alerte ci-dessus :
1. **Slug seul dans le wizard** → soit l'ajouter au `LOCAL_CATALOG` de nos-prestations.html, soit le retirer du wizard.
2. **Slug seul dans le catalogue** → l'ajouter à `ALL_PRESTAS` pour qu'il puisse être proposé dans le wizard.
3. **Écart de prix** → re-croiser avec `TARIFS_REFERENCE.md` puis aligner les deux fichiers sur le tarif validé.

*Sonde IA #59 — référence MEMOIRE_IA_MAINTENANCE.md addendum v10.*
