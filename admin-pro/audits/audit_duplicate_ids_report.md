# Audit duplicate IDs — 2026-06-24 06:50

Sonde #63 : détecte les `id="X"` répétés dans une page (HTML invalide) et les ids partagés par > 10 pages (potentielle factorisation).

- **Pages scannées** : 117
- **IDs totaux (toutes pages)** : 1545
- **IDs uniques (clés)** : 262
- **🚨 Pages avec ids dupliqués** : 1
- **🟠 IDs partagés par ≥ 10 pages** : 20

## 🚨 IDs dupliqués dans la même page (HTML invalide)

| Page | ID | Occurrences |
|------|----|-------------|
| `index.html` | `hc-avis-live` | **2** |

## 🟠 IDs partagés par ≥ 10 pages

Ces ids dupliqués entre pages suggèrent un bloc HTML copié à la main.
Si c'est un header/footer/banner attendu, ajouter l'id à
`EXPECTED_GLOBAL_IDS` dans le script.

| ID | Nb pages | Usages totaux |
|----|----------|---------------|
| `hc-avis-live` | 31 | 32 |
| `m-modal-detail-brands` | 26 | 26 |
| `m-modal-detail-brands-block` | 26 | 26 |
| `m-modal-detail-delay` | 26 | 26 |
| `m-modal-detail-delay-text` | 26 | 26 |
| `m-modal-detail-desc` | 26 | 26 |
| `m-modal-detail-eligibilite` | 26 | 26 |
| `m-modal-detail-eligibilite-text` | 26 | 26 |
| `m-modal-detail-icon` | 26 | 26 |
| `m-modal-detail-included` | 26 | 26 |
| `m-modal-detail-included-block` | 26 | 26 |
| `m-modal-detail-pane` | 26 | 26 |
| `m-modal-detail-title` | 26 | 26 |
| `m-modal-detail-warranty` | 26 | 26 |
| `m-modal-detail-warranty-text` | 26 | 26 |
| `m-modal-form-title` | 26 | 26 |
| `m-modal-presta` | 26 | 26 |
| `m-modal-success` | 26 | 26 |
| `m-reserve-form` | 26 | 26 |
| `m-reserve-modal` | 26 | 26 |

## Notes

- Les blocs `<script>`, `<style>` et commentaires HTML sont retirés avant scan.
- Whitelist (ids attendus partout) : `chatPrec`, `chatQuick`, `chatStep2Msg`, `chatSvcField`, `chatTel`, `chatUrg`, `chatUrgBody`, `chatUrgBtn`, `chatUrgForm`, `chatUrgPanel`, `chatUrgTitle`, `footer-nav`, `hc-chat-toggle`, `hc-chat-window`, `hc-chatbot`, `hc-consent-accept`, `hc-consent-banner`, `hc-consent-refuse`, `hcHeader`, `main-content`, `main-nav`, `menu-toggle`, `mobile-menu`, `site-footer`, `site-header`, `skip-link`, `year`.
