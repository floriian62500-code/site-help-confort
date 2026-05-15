# Audit duplicate IDs — 2026-05-15 14:30

Sonde #63 : détecte les `id="X"` répétés dans une page (HTML invalide) et les ids partagés par > 10 pages (potentielle factorisation).

- **Pages scannées** : 39
- **IDs totaux (toutes pages)** : 517
- **IDs uniques (clés)** : 218
- **🚨 Pages avec ids dupliqués** : 0
- **🟠 IDs partagés par ≥ 10 pages** : 13

## ✅ Aucun id dupliqué dans une même page

## 🟠 IDs partagés par ≥ 10 pages

Ces ids dupliqués entre pages suggèrent un bloc HTML copié à la main.
Si c'est un header/footer/banner attendu, ajouter l'id à
`EXPECTED_GLOBAL_IDS` dans le script.

| ID | Nb pages | Usages totaux |
|----|----------|---------------|
| `hcHeader` | 34 | 34 |
| `year` | 33 | 33 |
| `chatPrec` | 15 | 15 |
| `chatQuick` | 15 | 15 |
| `chatStep2Msg` | 15 | 15 |
| `chatSvcField` | 15 | 15 |
| `chatTel` | 15 | 15 |
| `chatUrg` | 15 | 15 |
| `chatUrgBody` | 15 | 15 |
| `chatUrgBtn` | 15 | 15 |
| `chatUrgForm` | 15 | 15 |
| `chatUrgPanel` | 15 | 15 |
| `chatUrgTitle` | 15 | 15 |

## Notes

- Les blocs `<script>`, `<style>` et commentaires HTML sont retirés avant scan.
- Whitelist (ids attendus partout) : `footer-nav`, `hc-chat-toggle`, `hc-chat-window`, `hc-chatbot`, `hc-consent-accept`, `hc-consent-banner`, `hc-consent-refuse`, `main-content`, `main-nav`, `menu-toggle`, `mobile-menu`, `site-footer`, `site-header`, `skip-link`.
