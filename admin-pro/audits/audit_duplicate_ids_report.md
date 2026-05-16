# Audit duplicate IDs — 2026-05-16 05:56

Sonde #63 : détecte les `id="X"` répétés dans une page (HTML invalide) et les ids partagés par > 10 pages (potentielle factorisation).

- **Pages scannées** : 39
- **IDs totaux (toutes pages)** : 517
- **IDs uniques (clés)** : 218
- **🚨 Pages avec ids dupliqués** : 0
- **🟠 IDs partagés par ≥ 10 pages** : 0

## ✅ Aucun id dupliqué dans une même page

## ✅ Aucun id partagé par ≥ 10 pages (hors whitelist)

## Notes

- Les blocs `<script>`, `<style>` et commentaires HTML sont retirés avant scan.
- Whitelist (ids attendus partout) : `chatPrec`, `chatQuick`, `chatStep2Msg`, `chatSvcField`, `chatTel`, `chatUrg`, `chatUrgBody`, `chatUrgBtn`, `chatUrgForm`, `chatUrgPanel`, `chatUrgTitle`, `footer-nav`, `hc-chat-toggle`, `hc-chat-window`, `hc-chatbot`, `hc-consent-accept`, `hc-consent-banner`, `hc-consent-refuse`, `hcHeader`, `main-content`, `main-nav`, `menu-toggle`, `mobile-menu`, `site-footer`, `site-header`, `skip-link`, `year`.
