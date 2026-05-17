# 🔗 Audit liens externes cassés — P10

*Généré le 2026-05-17 06:26 — `admin-pro/audits/audit_liens_externes.py`*

**Pages scannées** : 44
**URLs externes uniques testés** : 71
**URLs OK (2xx/3xx)** : 58
**URLs cassés (4xx/5xx/timeout/DNS)** : **13**
**URLs social-network ignorés** : 2 (whitelist : facebook/instagram/linkedin/twitter/tiktok/youtube/whatsapp)

## 🚨 Liens cassés

| Status | URL | Pages | Erreur |
|--------|-----|-------|--------|
| 403 | `https://comap.aalberts-hfc.com/fr` | chauffagiste-saint-omer.html, partenaires.html | Forbidden |
| 403 | `https://fr.indeed.com/cmp/Help-Confort` | carrieres.html | Forbidden |
| --- | `https://new.abb.com/fr` | electricien-saint-omer.html, partenaires.html | TimeoutError: The read operation timed out |
| 404 | `https://www.anah.gouv.fr/maprimeadapt` | aides.html | Not Found |
| --- | `https://www.bremaud.com/` | menuisier-saint-omer.html, partenaires.html | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify fai |
| 404 | `https://www.handicare.com/fr` | pmr-saint-omer.html | Not Found |
| 403 | `https://www.hoppe.com/fr-fr/catalogue-produits/1001192940/solutions-pour-portes-interieures-poignees` | partenaires.html, serrurier-saint-omer.html | Forbidden |
| 403 | `https://www.knauf.fr/` | travaux-saint-omer.html | Forbidden |
| 403 | `https://www.mapei.fr/` | travaux-saint-omer.html | Forbidden |
| 403 | `https://www.pellet-asc.com/` | pmr-saint-omer.html | Forbidden |
| 403 | `https://www.placo.fr/` | travaux-saint-omer.html | Forbidden |
| 403 | `https://www.saint-gobain.com/fr` | travaux-saint-omer.html | Forbidden |
| 403 | `https://www.watermatic.fr/` | plombier-saint-omer.html | Forbidden |

## 📊 Statistiques

- Taux de succès : **81 %** (58/71)
- URLs social-network non testés (à vérifier manuellement si nécessaire) : 2

## 🛠️ Procédure de correction

Pour chaque lien marqué cassé :
1. Ouvrir l'URL dans un navigateur pour confirmer (timeout possible).
2. Si 404 → trouver une URL de remplacement ou retirer le lien.
3. Si 5xx → réessayer plus tard (peut-être temporaire).
4. Si DNS/timeout → vérifier que le domaine existe encore.

*Liens social-network (facebook/insta/etc.) doivent être testés manuellement — bloqués au crawl.*

*Item P10 — `AGENT_TODO.md`.*
