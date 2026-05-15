# 🔗 Audit liens externes cassés — P10

*Généré le 2026-05-15 13:47 — `admin-pro/audits/audit_liens_externes.py`*

**Pages scannées** : 39
**URLs externes uniques testés** : 13
**URLs OK (2xx/3xx)** : 0
**URLs cassés (4xx/5xx/timeout/DNS)** : **13**
**URLs social-network ignorés** : 2 (whitelist : facebook/instagram/linkedin/twitter/tiktok/youtube/whatsapp)

## 🚨 Liens cassés

| Status | URL | Pages | Erreur |
|--------|-----|-------|--------|
| --- | `https://carto.com/attributions` | zones-intervention.html | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://maps.app.goo.gl/B4BPVTiRp5rDp26fA` | a-propos.html, actualites.html, aides.html (+30) | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://quaredesign.fr/` | chauffagiste-saint-omer.html, electricien-saint-omer.html, plombier-saint-omer.html (+2) | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://rsramonsoler.com/fr/personnes` | chauffagiste-saint-omer.html, electricien-saint-omer.html, plombier-saint-omer.html (+2) | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://trustville.com/avis-clients/pc/6D2evM/services_a_la_personne/saint_martin_lez_tatinghem/help` | chauffagiste-saint-omer.html, electricien-saint-omer.html, index.html (+3) | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.atlantic.fr/` | chauffagiste-saint-omer.html, electricien-saint-omer.html, plombier-saint-omer.html (+2) | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.cnil.fr` | mentions-legales.html | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.franchise-fff.com/mediation/mediation-consommateurs` | mentions-legales.html | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.hansgrohe.fr/` | chauffagiste-saint-omer.html, electricien-saint-omer.html, plombier-saint-omer.html (+2) | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.helpconfort.com` | mentions-legales.html | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.kinedo.com/` | chauffagiste-saint-omer.html, electricien-saint-omer.html, plombier-saint-omer.html (+2) | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.netlify.com` | mentions-legales.html | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |
| --- | `https://www.openstreetmap.org/copyright` | zones-intervention.html | URLError: <urlopen error Tunnel connection failed: 403 Forbidden> |

## 📊 Statistiques

- Taux de succès : **0 %** (0/13)
- URLs social-network non testés (à vérifier manuellement si nécessaire) : 2

## 🛠️ Procédure de correction

Pour chaque lien marqué cassé :
1. Ouvrir l'URL dans un navigateur pour confirmer (timeout possible).
2. Si 404 → trouver une URL de remplacement ou retirer le lien.
3. Si 5xx → réessayer plus tard (peut-être temporaire).
4. Si DNS/timeout → vérifier que le domaine existe encore.

*Liens social-network (facebook/insta/etc.) doivent être testés manuellement — bloqués au crawl.*

*Item P10 — `AGENT_TODO.md`.*
