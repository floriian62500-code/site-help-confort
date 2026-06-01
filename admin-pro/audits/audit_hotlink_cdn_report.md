# 🖼️ Audit images hot-linkées CDN tiers — sonde #13

_Généré le 2026-06-01 08:38_

- Pages HTML scannées : **115**
- Fichiers JS scannés : **37**
- Hosts uniques détectés : **85**
  - Self (HC) : 1
  - Supabase projet : 1
  - CDN tolérés (CSP-whitelistés) : 7
  - **Externes non whitelistés** : **76**

## ⚠️ Hosts externes non whitelistés

### 📄 `akw.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://akw.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `bricard.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://bricard.com/particuliers/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `carto.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `assets/hc-map-zones.js`

- `assets/hc-map-zones.js` → `https://carto.com/attributions`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `comap.aalberts-hfc.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://comap.aalberts-hfc.com/fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `coretecfloors.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://coretecfloors.com/fr-fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `fr.indeed.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `carrieres.html`

- `carrieres.html` → `https://fr.indeed.com/cmp/Help-Confort`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `france-renov.gouv.fr` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `aides.html`

- `aides.html` → `https://france-renov.gouv.fr/aides/simulation`
- `aides.html` → `https://france-renov.gouv.fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `gef.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://gef.fr/index.php/produits-gef/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `groupe-millet.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://groupe-millet.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 🖼️ `images.unsplash.com` — 3 occurrence(s) (3 image(s))

Fichiers concernés : `volets-saint-omer.html 2.html`

- `volets-saint-omer.html 2.html` → `https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?fm=jpg&q=70&w=600&h=375&auto=format&fit=crop`
- `volets-saint-omer.html 2.html` → `https://images.unsplash.com/photo-1744869524920-f0efc925b82f?fm=jpg&q=70&w=600&h=375&auto=format&fit=crop`
- `volets-saint-omer.html 2.html` → `https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?fm=jpg&q=70&w=600&h=375&auto=format&fit=crop`

→ **Recommandation** : télécharger les assets critiques dans `/images/` pour garantir le contrôle, le cache et la conformité CSP.

### 📄 `maps.app.goo.gl` — 70 occurrence(s) (0 image(s))

Fichiers concernés : `a-propos.html`, `actualites.html`, `aides.html`, `assets/hc-avis-carousel.js`, `assets/hc-avis-live.js`, `avant-apres.html`, `blog.html`, `carrieres.html`, `chauffagiste-boulogne-sur-mer.html`, `chauffagiste-calais.html`

- `a-propos.html` → `https://maps.app.goo.gl/B4BPVTiRp5rDp26fA`
- `actualites.html` → `https://maps.app.goo.gl/B4BPVTiRp5rDp26fA`
- `aides.html` → `https://maps.app.goo.gl/B4BPVTiRp5rDp26fA`
- `avant-apres.html` → `https://maps.app.goo.gl/B4BPVTiRp5rDp26fA`
- `blog.html` → `https://maps.app.goo.gl/B4BPVTiRp5rDp26fA`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `mon-installateur.atlantic.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://mon-installateur.atlantic.fr/Societe/DEPAN-AUDO-HELP-CONFORT`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `new.abb.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://new.abb.com/fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `parador.de` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://parador.de/fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 🖼️ `plus.unsplash.com` — 3 occurrence(s) (3 image(s))

Fichiers concernés : `volets-saint-omer.html 2.html`

- `volets-saint-omer.html 2.html` → `https://plus.unsplash.com/premium_photo-1664301972519-506636f0245d?fm=jpg&q=70&w=600&h=375&auto=format&fit=crop`
- `volets-saint-omer.html 2.html` → `https://plus.unsplash.com/premium_photo-1661301068444-8ac48208d017?fm=jpg&q=70&w=600&h=375&auto=format&fit=crop`
- `volets-saint-omer.html 2.html` → `https://plus.unsplash.com/premium_photo-1661884973994-d7625e52631a?fm=jpg&q=70&w=600&h=375&auto=format&fit=crop`

→ **Recommandation** : télécharger les assets critiques dans `/images/` pour garantir le contrôle, le cache et la conformité CSP.

### 📄 `quaredesign.fr` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`, `volets-saint-omer.html 2.html`

- `partenaires.html` → `https://quaredesign.fr/`
- `volets-saint-omer.html 2.html` → `https://quaredesign.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `rsramonsoler.com` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`, `volets-saint-omer.html 2.html`

- `partenaires.html` → `https://rsramonsoler.com/fr/personnes`
- `volets-saint-omer.html 2.html` → `https://rsramonsoler.com/fr/personnes`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `shop.siegenia.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://shop.siegenia.com/siegenia/fr/Pi%C3%A8ces-de-rechange/Ferrures-de-portes/Serrures-%C3%A0-encastrer/c/shop_morits`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `siamp.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://siamp.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `trustville.com` — 28 occurrence(s) (0 image(s))

Fichiers concernés : `chauffagiste-boulogne-sur-mer.html`, `chauffagiste-calais.html`, `chauffagiste-dunkerque.html`, `chauffagiste-saint-omer.html`, `electricien-boulogne-sur-mer.html`, `electricien-calais.html`, `electricien-dunkerque.html`, `electricien-saint-omer.html`, `index.html`, `menuisier-dunkerque.html`

- `chauffagiste-boulogne-sur-mer.html` → `https://trustville.com/avis-clients/pc/6D2evM/services_a_la_personne/saint_martin_lez_tatinghem/help_confort_saint_omer`
- `chauffagiste-calais.html` → `https://trustville.com/avis-clients/pc/6D2evM/services_a_la_personne/saint_martin_lez_tatinghem/help_confort_saint_omer`
- `chauffagiste-dunkerque.html` → `https://trustville.com/avis-clients/pc/6D2evM/services_a_la_personne/saint_martin_lez_tatinghem/help_confort_saint_omer`
- `chauffagiste-saint-omer.html` → `https://trustville.com/avis-clients/pc/6D2evM/services_a_la_personne/saint_martin_lez_tatinghem/help_confort_saint_omer`
- `electricien-boulogne-sur-mer.html` → `https://trustville.com/avis-clients/pc/6D2evM/services_a_la_personne/saint_martin_lez_tatinghem/help_confort_saint_omer`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.anah.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `aides.html`

- `aides.html` → `https://www.anah.fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.anah.gouv.fr` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `aides.html`

- `aides.html` → `https://www.anah.gouv.fr/maprimeadapt`
- `aides.html` → `https://www.anah.gouv.fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.atlantic.fr` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`, `volets-saint-omer.html 2.html`

- `partenaires.html` → `https://www.atlantic.fr/`
- `volets-saint-omer.html 2.html` → `https://www.atlantic.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.bremaud.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.bremaud.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.bubendorff.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.bubendorff.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.chappee.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.chappee.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.citya.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.citya.com`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.clarity.ms` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `assets/tracking.js`

- `assets/tracking.js` → `https://www.clarity.ms/tag/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.cnil.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `mentions-legales.html`

- `mentions-legales.html` → `https://www.cnil.fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.dedietrich-thermique.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.dedietrich-thermique.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.delabie.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.delabie.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.domusvi.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.domusvi.com`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.dynaren.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.dynaren.com`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.ecologie.gouv.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `aides.html`

- `aides.html` → `https://www.ecologie.gouv.fr/dispositif-des-certificats-deconomies-denergie`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.esri.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `zones-intervention.html`

- `zones-intervention.html` → `https://www.esri.com`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.facebook.com` — 100 occurrence(s) (0 image(s))

Fichiers concernés : `a-propos.html`, `actualites.html`, `aides.html`, `avant-apres.html`, `blog.html`, `carrieres.html`, `chauffagiste-boulogne-sur-mer.html`, `chauffagiste-calais.html`, `chauffagiste-dunkerque.html`, `chauffagiste-saint-omer.html`

- `a-propos.html` → `https://www.facebook.com/depanaudo/`
- `actualites.html` → `https://www.facebook.com`
- `actualites.html` → `https://www.facebook.com/depanaudo/`
- `actualites.html` → `https://www.facebook.com/plugins/post.php?href=`
- `aides.html` → `https://www.facebook.com/depanaudo/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.ferco.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.ferco.fr/fr-fr/produits/technique-de-porte/gu-secury-serrures-multipoints`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.fichet-pointfort.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.fichet-pointfort.com/fr/fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.finimetal.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.finimetal.com/fr-fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.franchise-fff.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `mentions-legales.html`

- `mentions-legales.html` → `https://www.franchise-fff.com/mediation/mediation-consommateurs`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.frisquet.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.frisquet.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.geberit.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.geberit.fr/accueil/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.google.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `contact.html`

- `contact.html` → `https://www.google.com/maps?q=242+route+de+Boulogne,+62500+Saint-Martin-lez-Tatinghem&output=embed`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.guy-hoquet.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.guy-hoquet.com`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.hansgrohe.fr` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`, `volets-saint-omer.html 2.html`

- `partenaires.html` → `https://www.hansgrohe.fr/`
- `volets-saint-omer.html 2.html` → `https://www.hansgrohe.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.helpconfort.com` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `mentions-legales.html`, `reseau-help-confort.html`

- `mentions-legales.html` → `https://www.helpconfort.com`
- `reseau-help-confort.html` → `https://www.helpconfort.com`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.homeserve.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.homeserve.fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.hoppe.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.hoppe.com/fr-fr/catalogue-produits/1001192940/solutions-pour-portes-interieures-poignees-pour-portes-interie`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.hsk.de` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.hsk.de/fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.ima.eu` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.ima.eu`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.iseo.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.iseo.com/fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.jeld-wen.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.jeld-wen.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.kinedo.com` — 2 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`, `volets-saint-omer.html 2.html`

- `partenaires.html` → `https://www.kinedo.com/`
- `volets-saint-omer.html 2.html` → `https://www.kinedo.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.kostum.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.kostum.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.laposte.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.laposte.fr/services-seniors/adapter-son-domicile`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.legrand.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.legrand.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.linkedin.com` — 67 occurrence(s) (0 image(s))

Fichiers concernés : `a-propos.html`, `actualites.html`, `aides.html`, `avant-apres.html`, `carrieres.html`, `chauffagiste-boulogne-sur-mer.html`, `chauffagiste-calais.html`, `chauffagiste-dunkerque.html`, `chauffagiste-saint-omer.html`, `contact.html`

- `a-propos.html` → `https://www.linkedin.com/in/florian-d-haillecourt-2a67bb207`
- `actualites.html` → `https://www.linkedin.com/in/florian-d-haillecourt-2a67bb207`
- `aides.html` → `https://www.linkedin.com/in/florian-d-haillecourt-2a67bb207`
- `avant-apres.html` → `https://www.linkedin.com/in/florian-d-haillecourt-2a67bb207`
- `carrieres.html` → `https://www.linkedin.com/in/florian-d-haillecourt-2a67bb207`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.maco.eu` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.maco.eu/fr-FR/Home`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.maprimerenov.gouv.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `aides.html`

- `aides.html` → `https://www.maprimerenov.gouv.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.meister.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.meister.com/fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.netlify.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `mentions-legales.html`

- `mentions-legales.html` → `https://www.netlify.com`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.riouglass.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.riouglass.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.roziere.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.roziere.fr/index.html`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.saunierduval.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.saunierduval.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.schueco.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.schueco.com/fr/particuliers`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.service-public.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `aides.html`

- `aides.html` → `https://www.service-public.fr/particuliers/vosdroits/F19905`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.somfypro.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.somfypro.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.soprofen.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.soprofen.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.sppf.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.sppf.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.trenois.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.trenois.com/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.vachette.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.vachette.fr/particulier/fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.velux.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.velux.fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.viaren.fr` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `pro.html`

- `pro.html` → `https://www.viaren.fr`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.w3.org` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `assets/hc-before-after.js`

- `assets/hc-before-after.js` → `http://www.w3.org/2000/svg\`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 📄 `www.winkhaus.com` — 1 occurrence(s) (0 image(s))

Fichiers concernés : `partenaires.html`

- `partenaires.html` → `https://www.winkhaus.com/fr/`

→ Vérifier si le host est légitimement whitelisté côté CSP (`netlify.toml` → `connect-src` / `script-src`).

### 🖼️ `{s}.basemaps.cartocdn.com` — 1 occurrence(s) (1 image(s))

Fichiers concernés : `assets/hc-map-zones.js`

- `assets/hc-map-zones.js` → `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`

→ **Recommandation** : télécharger les assets critiques dans `/images/` pour garantir le contrôle, le cache et la conformité CSP.


---

## 📋 Détail tous hosts

| Host | Classification | Occurrences | Images |
|------|----------------|-------------|--------|
| `akw.fr` | 🔴 external | 1 | 0 |
| `api-adresse.data.gouv.fr` | ⚪ trusted | 62 | 0 |
| `bricard.com` | 🔴 external | 1 | 0 |
| `btcbjwqiivhpwoszomhg.supabase.co` | 🔵 supabase | 80 | 3 |
| `carto.com` | 🔴 external | 1 | 0 |
| `cdn.jsdelivr.net` | ⚪ trusted | 68 | 0 |
| `comap.aalberts-hfc.com` | 🔴 external | 1 | 0 |
| `connect.facebook.net` | ⚪ trusted | 1 | 0 |
| `coretecfloors.com` | 🔴 external | 1 | 0 |
| `fonts.googleapis.com` | ⚪ trusted | 241 | 0 |
| `fonts.gstatic.com` | ⚪ trusted | 96 | 0 |
| `fr.indeed.com` | 🔴 external | 1 | 0 |
| `france-renov.gouv.fr` | 🔴 external | 2 | 0 |
| `gef.fr` | 🔴 external | 1 | 0 |
| `groupe-millet.com` | 🔴 external | 1 | 0 |
| `images.unsplash.com` | 🔴 external | 3 | 3 |
| `maps.app.goo.gl` | 🔴 external | 70 | 0 |
| `mon-installateur.atlantic.fr` | 🔴 external | 1 | 0 |
| `new.abb.com` | 🔴 external | 1 | 0 |
| `parador.de` | 🔴 external | 1 | 0 |
| `plus.unsplash.com` | 🔴 external | 3 | 3 |
| `quaredesign.fr` | 🔴 external | 2 | 0 |
| `rsramonsoler.com` | 🔴 external | 2 | 0 |
| `shop.siegenia.com` | 🔴 external | 1 | 0 |
| `siamp.fr` | 🔴 external | 1 | 0 |
| `trustville.com` | 🔴 external | 28 | 0 |
| `unpkg.com` | ⚪ trusted | 4 | 0 |
| `www.anah.fr` | 🔴 external | 1 | 0 |
| `www.anah.gouv.fr` | 🔴 external | 2 | 0 |
| `www.atlantic.fr` | 🔴 external | 2 | 0 |
| `www.bremaud.com` | 🔴 external | 1 | 0 |
| `www.bubendorff.com` | 🔴 external | 1 | 0 |
| `www.chappee.com` | 🔴 external | 1 | 0 |
| `www.citya.com` | 🔴 external | 1 | 0 |
| `www.clarity.ms` | 🔴 external | 1 | 0 |
| `www.cnil.fr` | 🔴 external | 1 | 0 |
| `www.dedietrich-thermique.fr` | 🔴 external | 1 | 0 |
| `www.delabie.fr` | 🔴 external | 1 | 0 |
| `www.depan59-62.fr` | 🟢 self | 229 | 116 |
| `www.domusvi.com` | 🔴 external | 1 | 0 |
| `www.dynaren.com` | 🔴 external | 1 | 0 |
| `www.ecologie.gouv.fr` | 🔴 external | 1 | 0 |
| `www.esri.com` | 🔴 external | 1 | 0 |
| `www.facebook.com` | 🔴 external | 100 | 0 |
| `www.ferco.fr` | 🔴 external | 1 | 0 |
| `www.fichet-pointfort.com` | 🔴 external | 1 | 0 |
| `www.finimetal.com` | 🔴 external | 1 | 0 |
| `www.franchise-fff.com` | 🔴 external | 1 | 0 |
| `www.frisquet.com` | 🔴 external | 1 | 0 |
| `www.geberit.fr` | 🔴 external | 1 | 0 |
| `www.google.com` | 🔴 external | 1 | 0 |
| `www.googletagmanager.com` | ⚪ trusted | 2 | 0 |
| `www.guy-hoquet.com` | 🔴 external | 1 | 0 |
| `www.hansgrohe.fr` | 🔴 external | 2 | 0 |
| `www.helpconfort.com` | 🔴 external | 2 | 0 |
| `www.homeserve.fr` | 🔴 external | 1 | 0 |
| `www.hoppe.com` | 🔴 external | 1 | 0 |
| `www.hsk.de` | 🔴 external | 1 | 0 |
| `www.ima.eu` | 🔴 external | 1 | 0 |
| `www.iseo.com` | 🔴 external | 1 | 0 |
| `www.jeld-wen.fr` | 🔴 external | 1 | 0 |
| `www.kinedo.com` | 🔴 external | 2 | 0 |
| `www.kostum.fr` | 🔴 external | 1 | 0 |
| `www.laposte.fr` | 🔴 external | 1 | 0 |
| `www.legrand.fr` | 🔴 external | 1 | 0 |
| `www.linkedin.com` | 🔴 external | 67 | 0 |
| `www.maco.eu` | 🔴 external | 1 | 0 |
| `www.maprimerenov.gouv.fr` | 🔴 external | 1 | 0 |
| `www.meister.com` | 🔴 external | 1 | 0 |
| `www.netlify.com` | 🔴 external | 1 | 0 |
| `www.riouglass.com` | 🔴 external | 1 | 0 |
| `www.roziere.fr` | 🔴 external | 1 | 0 |
| `www.saunierduval.fr` | 🔴 external | 1 | 0 |
| `www.schueco.com` | 🔴 external | 1 | 0 |
| `www.service-public.fr` | 🔴 external | 1 | 0 |
| `www.somfypro.fr` | 🔴 external | 1 | 0 |
| `www.soprofen.fr` | 🔴 external | 1 | 0 |
| `www.sppf.fr` | 🔴 external | 1 | 0 |
| `www.trenois.com` | 🔴 external | 1 | 0 |
| `www.vachette.fr` | 🔴 external | 1 | 0 |
| `www.velux.fr` | 🔴 external | 1 | 0 |
| `www.viaren.fr` | 🔴 external | 1 | 0 |
| `www.w3.org` | 🔴 external | 1 | 0 |
| `www.winkhaus.com` | 🔴 external | 1 | 0 |
| `{s}.basemaps.cartocdn.com` | 🔴 external | 1 | 1 |