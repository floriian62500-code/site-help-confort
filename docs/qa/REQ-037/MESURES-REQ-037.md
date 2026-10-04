# REQ-037 — cohérence TTC, mesurée sur les trois surfaces

Généré le 2026-10-04T15:10:19.316Z

Source canonique `v_contract_offers`, offre `gaz-confort` : `price_ttc_month` **14.3**, `price_ttc_year` **171.6**, `price_ht_month` **13**.
Attendu à l'écran : **14,30 €** TTC par mois, **171,60 €** TTC par an, **13 €** HT par mois.

## PR #26 (preview) — `176c28d147ae9440b89783f7eac5eb49dcd94916`
URL : https://deploy-preview-26--remarkable-dragon-364e2b.netlify.app

### 1440 px
- **surface 1 — page Chauffage** : « 14,30 € TTC / mois » _(secondaire : soit 13 € HT par mois)_
- **surface 2 — page Contrats** : « 14,30 € TTC / mois » _(secondaire : 171,60 € TTC par an · soit 13 € HT par mois)_ · URL `/contrats-entretien.html?energie=gaz&formule=confort#formules` · énergie **en-gaz** · formule **CONFORT**
- **surface 3 — modale** : « 14,30 € TTC/mois (13 € HT) — 171,60 € TTC/an » · ouverte **true** · Gaz / CONFORT · champs bruts : HT `13`, TTC `14.3` · cases pré-cochées **0**
- **même TTC sur les trois surfaces** : **oui — 14,30 € partout**
- débordement : page Chauffage 0 px · page Contrats 0 px · module hors cadre **0**
- **écritures réseau** : **aucune — aucun lead envoyé**
- erreurs console imputables au site : **aucune**

### 390 px
- **surface 1 — page Chauffage** : « 14,30 € TTC / mois » _(secondaire : soit 13 € HT par mois)_
- **surface 2 — page Contrats** : « 14,30 € TTC / mois » _(secondaire : 171,60 € TTC par an · soit 13 € HT par mois)_ · URL `/contrats-entretien.html?energie=gaz&formule=confort#formules` · énergie **en-gaz** · formule **CONFORT**
- **surface 3 — modale** : « 14,30 € TTC/mois (13 € HT) — 171,60 € TTC/an » · ouverte **true** · Gaz / CONFORT · champs bruts : HT `13`, TTC `14.3` · cases pré-cochées **0**
- **même TTC sur les trois surfaces** : **oui — 14,30 € partout**
- débordement : page Chauffage 452 px · page Contrats 90 px · module hors cadre **0**
- **écritures réseau** : **aucune — aucun lead envoyé**
- erreurs console imputables au site : **aucune**

## production (avant correctif) — `96e75d88f57dbe867fb8490dbdc2749093340a70`
URL : https://depan59-62.fr

### 1440 px
- **surface 1 — page Chauffage** : « 14,30 € TTC / mois » _(secondaire : soit 13 € HT par mois)_
- **surface 2 — page Contrats** : « 13 € HT /mois » _(secondaire : soit 156 € HT/an)_ · URL `/contrats-entretien.html?energie=gaz&formule=confort#formules` · énergie **en-gaz** · formule **CONFORT**
- **surface 3 — modale** : « 13 € HT/mois — 156 €/an » · ouverte **true** · Gaz / CONFORT · champs bruts : HT `null`, TTC `null` · cases pré-cochées **0**
- **même TTC sur les trois surfaces** : **NON**
- débordement : page Chauffage 0 px · page Contrats 0 px · module hors cadre **0**
- **écritures réseau** : **aucune — aucun lead envoyé**
- erreurs console imputables au site : **aucune**

### 390 px
- **surface 1 — page Chauffage** : « 14,30 € TTC / mois » _(secondaire : soit 13 € HT par mois)_
- **surface 2 — page Contrats** : « 13 € HT /mois » _(secondaire : soit 156 € HT/an)_ · URL `/contrats-entretien.html?energie=gaz&formule=confort#formules` · énergie **en-gaz** · formule **CONFORT**
- **surface 3 — modale** : « 13 € HT/mois — 156 €/an » · ouverte **true** · Gaz / CONFORT · champs bruts : HT `null`, TTC `null` · cases pré-cochées **0**
- **même TTC sur les trois surfaces** : **NON**
- débordement : page Chauffage 452 px · page Contrats 90 px · module hors cadre **0**
- **écritures réseau** : **aucune — aucun lead envoyé**
- erreurs console imputables au site : **aucune**

## Empreintes des captures produites par ce script

- `pr26-preview-1440-1-chauffage.jpg` — sha256 `7170f1872ca0c5eb` — 138 Ko
- `pr26-preview-1440-2-contrats.jpg` — sha256 `ac17da3e53e6a6e1` — 110 Ko
- `pr26-preview-1440-3-modale.jpg` — sha256 `54e20ee3f5c3447d` — 58 Ko
- `pr26-preview-390-1-chauffage.jpg` — sha256 `d4ae726ecb34baed` — 128 Ko
- `pr26-preview-390-2-contrats.jpg` — sha256 `e24ae4b2843f91f3` — 36 Ko
- `pr26-preview-390-3-modale.jpg` — sha256 `abf73a6d6200177c` — 37 Ko
- `prod-avant-1440-1-chauffage.jpg` — sha256 `e88da26b4238d432` — 137 Ko
- `prod-avant-1440-2-contrats.jpg` — sha256 `0956695822a4e5d9` — 105 Ko
- `prod-avant-1440-3-modale.jpg` — sha256 `8566c4ebad8b4267` — 55 Ko
- `prod-avant-390-1-chauffage.jpg` — sha256 `0afda60e1625989b` — 127 Ko
- `prod-avant-390-2-contrats.jpg` — sha256 `7d1b54144ea27261` — 35 Ko
- `prod-avant-390-3-modale.jpg` — sha256 `f71ccccafdb3972c` — 35 Ko
