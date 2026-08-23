# 🔗 Audit liens externes cassés — P10

*Généré le 2026-08-23 03:52 — `admin-pro/audits/audit_liens_externes.py`*

**Pages scannées** : 117
**URLs externes uniques testés** : 61
**URLs OK (2xx/3xx)** : 51
**URLs cassés (4xx/5xx/timeout/DNS)** : **10**
**URLs social-network ignorés** : 2 (whitelist : facebook/instagram/linkedin/twitter/tiktok/youtube/whatsapp)

## 🚨 Liens cassés

| Status | URL | Pages | Erreur |
|--------|-----|-------|--------|
| 403 | `https://comap.aalberts-hfc.com/fr` | partenaires.html | Forbidden |
| 403 | `https://fr.indeed.com/cmp/Help-Confort` | carrieres.html | Forbidden |
| --- | `https://france-renov.gouv.fr` | aides.html | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify fai |
| --- | `https://france-renov.gouv.fr/aides/simulation` | aides.html | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify fai |
| --- | `https://new.abb.com/fr` | partenaires.html | TimeoutError: The read operation timed out |
| --- | `https://www.anah.fr` | aides.html | URLError: <urlopen error timed out> |
| 404 | `https://www.anah.gouv.fr/maprimeadapt` | aides.html | Not Found |
| --- | `https://www.bremaud.com/` | partenaires.html | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify fai |
| 403 | `https://www.helpconfort.com` | mentions-legales.html, reseau-help-confort.html | Forbidden |
| 403 | `https://www.hoppe.com/fr-fr/catalogue-produits/1001192940/solutions-pour-portes-interieures-poignees` | partenaires.html | Forbidden |

## 📊 Statistiques

- Taux de succès : **83 %** (51/61)
- URLs social-network non testés (à vérifier manuellement si nécessaire) : 2

## 🛠️ Procédure de correction

Pour chaque lien marqué cassé :
1. Ouvrir l'URL dans un navigateur pour confirmer (timeout possible).
2. Si 404 → trouver une URL de remplacement ou retirer le lien.
3. Si 5xx → réessayer plus tard (peut-être temporaire).
4. Si DNS/timeout → vérifier que le domaine existe encore.

*Liens social-network (facebook/insta/etc.) doivent être testés manuellement — bloqués au crawl.*

*Item P10 — `AGENT_TODO.md`.*
