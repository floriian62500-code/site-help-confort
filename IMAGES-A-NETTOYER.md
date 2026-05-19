# Images temporaires à supprimer manuellement

**Date** : 2026-05-19
**Source** : audit bugs résiduels — item « 15 fichiers .tmp.png »
**Pourquoi non traité automatiquement** : les permissions du sandbox refusent `rm` sur ces fichiers (« Operation not permitted »).

## Fichiers à supprimer

À supprimer manuellement depuis le Finder ou via Terminal (`rm`) :

```
images/mascotte-opt.tmp.png
images/mascotte.tmp.png
images/picto-electricite.tmp.png
images/picto-pmr.tmp.png
images/picto-renovation.tmp.png
images/picto-serrurerie.tmp.png
images/apporteurs/citya-ndf.tmp.png
images/apporteurs/dynaren.tmp.png
images/apporteurs/imh.tmp.png
images/labels/20210810-084335.tmp.png
images/labels/eco-artisan-rge.tmp.png
images/labels/handibat-silverbat.tmp.png
images/labels/nos-actualites-handibat-silverbat.tmp.png
```

## Commande Terminal (à exécuter à la racine du projet)

```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
rm images/*.tmp.png images/apporteurs/*.tmp.png images/labels/*.tmp.png
```

## Vérification après suppression

```bash
find images -name "*.tmp.png"
```
La commande ne doit rien renvoyer.
