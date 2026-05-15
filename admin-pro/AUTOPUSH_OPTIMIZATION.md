# ⚡ Optimisation autopush pour réduire les coûts Netlify

## Problème
Le script autopush actuel (`~/Library/Application Support/HelpConfort/autopush.sh`) commit + push toutes les **60 secondes** dès qu'il y a des changements. Chaque push déclenche un build Netlify (1 crédit consommé).

Sur le plan **Pro 20 $/mois = 3 000 crédits/mois**, à raison de 30-60 pushs/heure pendant les sessions de dev, on consomme tout le quota en quelques heures.

## Solution déployée côté repo (déjà actif)

Le fichier `netlify.toml` filtre maintenant les commits qui ne touchent QUE des fichiers non publiés :
- `admin-pro/audits/` (rapports d'audit IA)
- `admin-pro/*.md` (mémoires + docs)
- `.autopush/`, `scripts/`, `docs/`, `logs/`
- Tous les `*.md` à la racine
- `images/_backup_png/`

Si un commit ne contient QUE ces fichiers → Netlify skippe le build → **0 crédit consommé**.

## Solution à appliquer côté Mac (manuel, 5 min)

Ouvre Terminal et colle ces 3 commandes :

```bash
# 1. Sauvegarde l'autopush actuel
cp ~/Library/Application\ Support/HelpConfort/autopush.sh \
   ~/Library/Application\ Support/HelpConfort/autopush.sh.bak-$(date +%Y%m%d)

# 2. Augmente l'intervalle entre pushs (passe de 60s à 300s = 5 min)
sed -i '' 's/SLEEP=60/SLEEP=300/' ~/Library/Application\ Support/HelpConfort/autopush.sh
sed -i '' 's/sleep 60/sleep 300/' ~/Library/Application\ Support/HelpConfort/autopush.sh

# 3. Redémarre le LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.helpconfort.autopush.plist 2>/dev/null
launchctl load   ~/Library/LaunchAgents/com.helpconfort.autopush.plist
```

Résultat : au lieu de 60 pushs/heure, max **12 pushs/heure** (1 toutes les 5 min). Diviser les coûts par 5.

## Solution plus radicale (optionnel)

Si tu veux **un seul build par jour** (ex. à 23h pour ne pas perturber le dev), désactive l'autopush et utilise un cron :

```bash
# Désactive l'autopush
launchctl unload ~/Library/LaunchAgents/com.helpconfort.autopush.plist

# Ajoute un cron daily à 23h
(crontab -l 2>/dev/null; echo "0 23 * * * cd '/Users/HP/Documents/Claude/Projects/SITE INTERNET' && git add -A && git commit -m 'Daily push' && git push origin main") | crontab -
```

## Vérifier que Netlify skippe bien

Après un commit qui ne touche QUE des fichiers exclus, dans Netlify → Deploys, tu dois voir :
> **Skipped** "No common changes" ou "Build skipped due to ignore command"

Si ce n'est pas le cas, l'ignore rule du `netlify.toml` est mal écrite — me prévenir.

---
*Document généré 15/05/2026 par Claude*
