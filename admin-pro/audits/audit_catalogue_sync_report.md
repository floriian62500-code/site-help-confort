# 🔄 Audit synchronisation wizard ↔ catalogue — Sonde IA #59

*Généré le 2026-05-27 07:06 — `admin-pro/audits/audit_catalogue_sync.py`*

**Wizard home (`ALL_PRESTAS` d'index.html)** : 30 prestations
**Catalogue (`LOCAL_CATALOG` de nos-prestations.html)** : 35 prestations
**Slugs communs** : 18
**Slugs wizard tolérés (fourre-tout)** : 2
**Alertes totales** : **27**

## 🚨 Prestations dans wizard mais ABSENTES du catalogue

| Slug | Label wizard | Métier | Prix |
|------|--------------|--------|------|
| `adaptation-pmr` | Adaptation PMR / senior | Travaux | sur devis |
| `blindage-porte` | Blindage de porte | Serrurerie | sur devis |
| `chasse-geberit` | Mécanisme chasse d | Plomberie | 203.0 € |
| `chasse-nicoll` | Mécanisme chasse d | Plomberie | 187.0 € |
| `contrat-chauffage-basic` | Contrat chauffage Basic (gaz) | Chauffage | 108.0 € |
| `contrat-chauffage-confort` | Contrat chauffage Confort (gaz) | Chauffage | 156.0 € |
| `depannage-chaudiere-t1` | Dépannage chaudière (T1 semaine) | Chauffage | 75.0 € |
| `gabarit-vitrerie` | Réalisation gabarit (vitrage sur mesure) | Vitrerie | 184.0 € |
| `renovation-salle-de-bain` | Rénovation salle de bain complète | Travaux | sur devis |
| `tableau-electrique` | Tableau électrique complet | Électricité | sur devis |

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
| `depannage-recherche-panne-chauffage` | Dépannage & recherche de panne chauffage | chauffage | 148.0 € |
| `devis-enduit` | Enduit intérieur / extérieur | sur-mesure | sur devis |
| `devis-isolation` | Isolation thermique / phonique | sur-mesure | sur devis |
| `devis-peinture` | Peinture intérieure | sur-mesure | sur devis |
| `devis-plafond` | Plafond (rénovation, pose) | sur-mesure | sur devis |
| `devis-remplacement-vitrage` | Devis remplacement vitrage | vitrerie | sur devis |
| `devis-revetements-muraux` | Revêtements muraux | sur-mesure | sur devis |
| `devis-vitre-insert-poele` | Devis vitre insert / poêle | vitrerie | sur devis |
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
