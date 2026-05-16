# Photos fournisseurs — guide d'utilisation

## Pourquoi ce script existe

L'environnement Cowork (sandbox) utilise un proxy qui bloque la plupart des
domaines externes (sites des fournisseurs : Velux, Atlantic, Hörmann,
Schneider, etc.). Les téléchargements doivent donc être lancés **depuis le
Mac** de Florian, pas depuis l'agent.

## Comment lancer le script

Ouvre le Terminal sur ton Mac, puis :

```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
python3 scripts/dl-supplier-photos.py
```

Le script :

- Crée le dossier `/images/fournisseurs/` s'il n'existe pas
- Télécharge chaque image en `<slug>-photo.jpg` (ex. `velux-photo.jpg`)
- **Saute les marques qui ont déjà un fichier** (idempotent)
- Affiche un récapitulatif `OK / SKIPPED / FAILED` à la fin

## Corriger une URL qui échoue

Certaines URLs sont des *best-guess* basées sur la structure habituelle des
sites fournisseurs. Quand une URL renvoie 404 ou redirige (login, etc.),
le script l'affiche en `FAILED`. Pour la corriger :

1. Va sur le site officiel du fournisseur (ex. `velux.fr`)
2. Trouve une photo produit représentative
3. Clic droit sur l'image → **"Copier l'adresse de l'image"**
4. Ouvre `scripts/dl-supplier-photos.py`
5. Remplace l'URL dans le dict `BRAND_URLS` :

   ```python
   BRAND_URLS = {
       ...
       "velux": "https://www.velux.fr/.../vraie-url-copiee.jpg",
       ...
   }
   ```

6. Relance `python3 scripts/dl-supplier-photos.py`. Les marques déjà
   téléchargées seront sautées automatiquement.

## Marques incluses dans le script

| Slug             | Catégorie                       |
|------------------|---------------------------------|
| groupe-millet    | Menuiseries (fenêtres, portes)  |
| bremaud          | Portes d'entrée                 |
| kostum           | Portes d'entrée aluminium       |
| jeld-wen         | Portes intérieures/extérieures  |
| roziere          | Portes d'entrée sur mesure      |
| velux            | Fenêtres de toit                |
| soprofen         | Volets roulants                 |
| hormann          | Portes de garage                |
| novoferm         | Portes de garage                |
| atlantic         | Chauffe-eau / ECS               |
| geberit          | Sanitaire / WC                  |
| schneider        | Tableaux électriques            |
| legrand          | Appareillage électrique         |

Pour ajouter un fournisseur, ajoute simplement une entrée au dict.

## Comment utiliser les images dans les pages prestation

Une fois les photos téléchargées, modifie manuellement les cartes
fournisseurs dans les pages prestation (par exemple
`menuisier-saint-omer.html`, `electricien-saint-omer.html`, etc.) pour
remplacer le visuel actuel par la vraie photo :

```html
<article class="brand-card">
  <img src="/images/fournisseurs/velux-photo.jpg"
       alt="Velux — fenêtre de toit"
       loading="lazy"
       width="320" height="200">
  <h3>Velux</h3>
  <p>Notre fournisseur partenaire pour les fenêtres de toit.</p>
</article>
```

> **Important :** ne mets pas à jour le HTML tant que les fichiers ne sont
> pas physiquement présents dans `/images/fournisseurs/` — sinon les pages
> afficheraient des images cassées.

## Vérification rapide après téléchargement

```bash
ls -lh "/Users/HP/Documents/Claude/Projects/SITE INTERNET/images/fournisseurs/"
```

Tu dois voir un fichier `.jpg` par marque téléchargée avec succès.
