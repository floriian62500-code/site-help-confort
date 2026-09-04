# 🔒 Audit RGPD strict — état par défaut consent

_Généré le 2026-09-04 07:48_

**Règle vérifiée :** aucun cookie / localStorage / sessionStorage
ne doit être posé tant que l'utilisateur n'a pas explicitement
cliqué sur **Accepter** (ou ouvert le banner via `hcConsentReset`).

## 1️⃣ `assets/hc-consent.js`

✅ **OK** — 2 écriture(s) de stockage détectée(s),
toutes dans un scope user-triggered (`persist` / `hcConsentReset` / click handler).

## 2️⃣ `assets/tracking.js` — garde consent

✅ **OK** — Garde consent + return détectés en tête de fichier ✓

---

## 🎯 Bilan : conforme RGPD strict ✓
