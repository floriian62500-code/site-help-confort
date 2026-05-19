# 🔄 Audit synchronisation wizard ↔ catalogue — Sonde IA #59

*Généré le 2026-05-19 06:50 — `admin-pro/audits/audit_catalogue_sync.py`*

**Wizard home (`ALL_PRESTAS` d'index.html)** : 30 prestations
**Catalogue (`LOCAL_CATALOG` de nos-prestations.html)** : 35 prestations
**Slugs communs** : 25
**Slugs wizard tolérés (fourre-tout)** : 2
**Alertes totales** : **13**

## 🚨 Prestations dans wizard mais ABSENTES du catalogue

| Slug | Label wizard | Métier | Prix |
|------|--------------|--------|------|
| `contrat-chauffage-basic` | Contrat chauffage Basic (gaz) | Chauffage | 108.0 € |
| `contrat-chauffage-confort` | Contrat chauffage Confort (gaz) | Chauffage | 156.0 € |
| `depannage-chaudiere-t1` | Dépannage chaudière (T1 semaine) | Chauffage | 75.0 € |

## 🚨 Prestations dans catalogue mais ABSENTES du wizard

| Slug | Label catalogue | Métier | Prix |
|------|-----------------|--------|------|
| `attestation-consuel` | Attestation Consuel | electricite | sur devis |
| `contrat-chauffage-basic-fioul` | Contrat Basic — chaudière fioul | chauffage | 140.0 € |
| `contrat-chauffage-basic-gaz` | Contrat Basic — chaudière gaz | chauffage | 108.0 € |
| `contrat-chauffage-confort-fioul` | Contrat Confort — chaudière fioul | chauffage | 190.0 € |
| `contrat-chauffage-confort-gaz` | Contrat Confort — chaudière gaz | chauffage | 156.0 € |
| `contrat-chauffage-securite-fioul` | Contrat Sécurité — chaudière fioul | chauffage | 320.0 € |
| `contrat-chauffage-securite-gaz` | Contrat Sécurité — chaudière gaz | chauffage | 276.0 € |
| `depannage-chaudiere` | Dépannage chaudière | chauffage | sur devis |
| `pose-luminaire` | Pose de luminaire | electricite | sur devis |
| `vmc` | VMC simple ou double flux | electricite | sur devis |

## ⚠️ Écarts de prix sur slugs communs

✅ Tous les prix communs concordent.

## 🛠️ Procédure de correction

Pour chaque alerte ci-dessus :
1. **Slug seul dans le wizard** → soit l'ajouter au `LOCAL_CATALOG` de nos-prestations.html, soit le retirer du wizard.
2. **Slug seul dans le catalogue** → l'ajouter à `ALL_PRESTAS` pour qu'il puisse être proposé dans le wizard.
3. **Écart de prix** → re-croiser avec `TARIFS_REFERENCE.md` puis aligner les deux fichiers sur le tarif validé.

*Sonde IA #59 — référence MEMOIRE_IA_MAINTENANCE.md addendum v10.*
