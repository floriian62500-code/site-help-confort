# Activer le tracking — GA4, GTM, Microsoft Clarity

Le code de tracking est déjà installé sur **toutes les pages** du site, mais il est désactivé tant que les ID ne sont pas renseignés. Voici comment l'activer en quelques minutes.

## 1. Google Analytics 4 (GA4) — gratuit

1. Va sur [analytics.google.com](https://analytics.google.com), connecte-toi avec ton compte Google.
2. Crée une propriété GA4 pour `helpconfort-saintomer.fr`.
3. Récupère l'**ID de mesure** : il commence par `G-` (ex : `G-ABC1234XYZ`).
4. Dans **tous les fichiers HTML** du site, remplace `G-XXXXXXXXXX` par ton ID.

```bash
# Astuce : depuis le dossier du site, en une commande
grep -rl "G-XXXXXXXXXX" --include="*.html" . | xargs sed -i '' 's/G-XXXXXXXXXX/G-TONIDREEL/g'
```

## 2. Google Tag Manager (GTM) — gratuit

1. Va sur [tagmanager.google.com](https://tagmanager.google.com).
2. Crée un conteneur pour `helpconfort-saintomer.fr` (type : Web).
3. Récupère l'**ID GTM** : il commence par `GTM-` (ex : `GTM-ABCDEF1`).
4. Remplace `GTM-XXXXXXX` par ton ID dans tous les fichiers HTML.

```bash
grep -rl "GTM-XXXXXXX" --include="*.html" . | xargs sed -i '' 's/GTM-XXXXXXX/GTM-TONIDREEL/g'
```

## 3. Microsoft Clarity — gratuit (heatmaps, replays)

1. Va sur [clarity.microsoft.com](https://clarity.microsoft.com), connecte-toi.
2. Crée un projet pour `helpconfort-saintomer.fr`.
3. Récupère l'**ID de projet** (ex : `abc123xyz`).
4. Remplace `CLARITY_ID` par ton ID dans tous les fichiers HTML.

```bash
grep -rl "CLARITY_ID" --include="*.html" . | xargs sed -i '' 's/CLARITY_ID/tonidreel/g'
```

## 4. Vérification

Après remplacement et mise en ligne :

- **GA4** : ouvre une page du site, va dans Analytics → Rapports → Temps réel (tu dois voir 1 utilisateur).
- **GTM** : utilise l'extension Chrome [Tag Assistant](https://tagassistant.google.com/) pour vérifier le déclenchement.
- **Clarity** : connecte-toi à clarity.microsoft.com, attends quelques minutes, tu verras les premiers replays.

## Ordre recommandé

1. **GA4 d'abord** (essentiel, mesure le trafic).
2. **Clarity ensuite** (gratuit illimité, identifie immédiatement les frictions UX).
3. **GTM en dernier** (puissant pour configurer des conversions avancées : appels, formulaires, urgences).

## Configuration recommandée des conversions GA4 (via GTM)

Une fois GA4 connecté, mesure ces événements de conversion :

| Événement | Trigger GTM | Pourquoi |
|---|---|---|
| `appel_telephone` | Clic sur tout `<a href="tel:...">` | Mesure la conversion principale |
| `clic_urgence` | Clic sur le FAB urgence (`#hc-emerg-btn`) | Volume des urgences générées |
| `clic_devis` | Clic sur les boutons "Demander un devis" | Funnel devis |
| `submit_contact` | Soumission du formulaire de contact | Lead qualifié |
| `clic_facebook`, `clic_linkedin`, `clic_google` | Clics sur les réseaux sociaux | Mesure de l'engagement marque |

---

*Document généré dans le cadre de la Phase 1 de la roadmap stratégique HELP CONFORT.*
