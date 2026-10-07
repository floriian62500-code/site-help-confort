# Bandeau legacy — nettoyage permanent : PR #49

Réponse à `CHATGPT-2026-10-07-REGRESSION-TOPBAR.md`. Base `main` `093f0605` (hotfix #45 inclus).
Trois commits, 208 fichiers. Preview #49 vérifiée à 1440 et 390.

## Le hotfix laissait deux trous

**1. Le balisage était toujours là, dans 140 pages**, en 7 formes.

**2. Le masque n'atteignait pas les visiteurs qui avaient déjà la feuille en cache.** La PR #45 a
modifié `assets/hc-header.css` sans relancer la synchronisation :

```
empreinte réelle du fichier     : 765aa45a30
version demandée par les pages  : 94dcff1173      ← périmée
Cache-Control du fichier servi  : max-age=2592000  (30 jours)
```

Le HTML est rechargé à chaque visite, avec le bandeau dedans ; la feuille, elle, reste en cache
jusqu'à 30 jours — sans le masque. **Un visiteur venu avant le hotfix voyait toujours la barre.**
Un contrôle en navigateur neuf ne peut pas le voir : il n'a rien en cache.

C'est aussi ce qui avait fait tomber `header.test.mjs` de 15/0 à 13/2 sur `main`.

## Ce que fait le lot

- **Le balisage part** : 0 page avec le bandeau, 0 page avec ses règles CSS mortes.
- **Il ne peut plus revenir** : `transform()` retire le bloc à chaque synchronisation (comptage
  d'imbrication) et nettoie ses règles. Sur l'accueil, où elles étaient mêlées au reste du style,
  **seules les cinq entrées du bandeau partent** — vérifié sélecteur par sélecteur.
- **La version des assets redevient juste**, donc le masque atteint aussi les visiteurs en cache.
- **Le masque reste**, en seconde barrière, documenté comme exception dans `header.test.mjs`.

## La garde

`scripts/tests/topbar-legacy.test.mjs` — balisage, règles mortes, version périmée, mention
d'agence au-dessus de l'en-tête, masque de secours, retrait par le synchroniseur.

```
joué sur main tel quel : 1 PASS / 5 FAIL     ← il attrape bien la régression
joué sur ce lot        : 6 PASS / 0 FAIL
header.test.mjs        : 13/2 -> 15 PASS / 0 FAIL
29 autres suites       : inchangées
```

Preview : contact à 1440 → en-tête 165 px collé en haut, 0 bandeau, bouton téléphone, 37 liens,
pas de débordement. Accueil à 390 → en-tête 95 px, page à 390 exactement, 0 bandeau.

## Doctrine : ce qui reste

Le contenu du bandeau (« Saint-Omer Dépan'Audo **+ Dunkerque Dépan'DK** ») disparaît avec lui.

Reste **une phrase visible** à arbitrer, sur `a-propos.html` : « l'enseigne a ouvert **une seconde
agence** à Dunkerque sous la raison sociale Dépan'DK ». Récit historique : je le signale, je n'y
touche pas.

Pour mémoire, et sans y toucher non plus : **76 pages** nomment les deux villes dans un `<title>`,
un `h1` ou un `h2` (« à Saint-Omer et Dunkerque »). C'est compatible avec la doctrine — Dunkerque
y est une zone d'intervention, pas une agence. Si vous voulez que les titres ne portent plus que
Saint-Omer, c'est une décision de marque et de référencement, pas une correction : elle mérite son
propre lot. Les ≈119 autres occurrences de « Dépan'DK » sont la ligne légale de pied de page, et
les deux « 2 agences » de `zones-intervention.html` sont des commentaires JavaScript, invisibles.

## État des PR ouvertes

| PR | sujet | état |
|---|---|---|
| #44 | la garde d'hygiène ne salit plus le dépôt (+ 9 outils sous garde) | preview verte |
| #46 | assertion `home-promo` qui figeait un titre réécrit | preview verte |
| #47 | dix dossiers internes ne sont plus servis | preview verte |
| #49 | ce lot | preview verte |

#47 et #44 ensemble ferment les 3 derniers échecs de `depot-propre`.
