# Auto-push du site — fonctionnement, arrêt d'urgence, retour arrière

> Mise à jour du 2026-09-20 (directive 5732805778). Le démon tourne **sur le Mac de Florian**,
> pas dans le dépôt : `~/Library/LaunchAgents/com.helpconfort.autopush.plist` →
> `~/Library/Application Support/HelpConfort/autopush.sh`, toutes les 60 s.

## Ce qu'il fait

1. Si la copie de travail n'a plus bougé depuis **3 minutes**, il committe tout
   (`chore(auto): sauvegarde automatique <date> — N fichier(s)`).
2. Il pousse la branche courante vers **la même branche distante**, en **avance rapide seulement**.

## Ce qu'il ne fait jamais

| Interdit | Garde en place |
|---|---|
| Pousser sur `main` (production) | liste blanche `recette`, `integration/lot1-lot2-vs-prod` ; toute autre branche → sortie immédiate et journal |
| Forcer un push | aucun `--force` / `--force-with-lease` ; si la branche a divergé : arrêt + notification, résolution humaine |
| Appliquer une migration Supabase | le bloc `supabase db push` de l'ancienne version est **supprimé** ; une migration dans le lot est seulement signalée dans le journal |
| Stocker un jeton | authentification par `gh auth git-credential` (trousseau macOS) ; **aucun PAT dans le dépôt ni dans le script** |
| Committer pendant une édition | anti-rebond de 180 s, plus refus si `index.lock`, rebase, merge, cherry-pick ou bisect en cours |
| Tourner deux fois en parallèle | verrou atomique `autopush.lock` (répertoire), repris automatiquement s'il est figé depuis plus de 10 min |

## Arrêt d'urgence (kill-switch)

```bash
# arrêter : le démon continue de se lancer mais ne fait plus rien
touch "$HOME/Library/Application Support/HelpConfort/autopush.off"

# variante depuis le dépôt (utile pendant une manipulation délicate)
touch "/Users/HP/Documents/Claude/Projects/SITE INTERNET/.autopush-off"

# reprendre
rm "$HOME/Library/Application Support/HelpConfort/autopush.off"
```

Arrêt complet du démon (il ne se lancera plus du tout) :

```bash
launchctl unload "$HOME/Library/LaunchAgents/com.helpconfort.autopush.plist"
```

## Retour arrière

La version précédente est conservée à côté du script :

```bash
cd "$HOME/Library/Application Support/HelpConfort"
ls autopush.sh.bak-*            # sauvegardes horodatées
cp autopush.sh.bak-20260920 autopush.sh
```

⚠️ **L'ancienne version poussait sur `main` et lançait `supabase db push` sur la base de
production.** Ne la restaurer que pour inspection, jamais pour la laisser tourner.

## Journal et diagnostic

```bash
tail -30 "$HOME/Library/Application Support/HelpConfort/autopush.log"
bash "$HOME/Library/Application Support/HelpConfort/autopush.sh" --dry-run   # simulation, n'écrit rien
gh auth status                                                               # source de l'authentification
```

| Ligne du journal | Sens |
|---|---|
| `📝 commit auto (N fichier(s)) sur recette` | sauvegarde locale |
| `✅ push <sha> → recette` | poussé, la preview Netlify se reconstruit |
| `⛔ branche « X » hors périmètre` | la branche courante n'est pas dans la liste blanche : rien n'est poussé |
| `⛔ recette a divergé du distant` | quelqu'un a réécrit l'historique distant : à résoudre à la main |
| `⏸ opération git en cours` | rebase/merge en cours : le démon s'écarte |
| `❌ push échoué — échec #N` | notification macOS aux échecs 3, 30 et 300 ; vérifier `gh auth status` |

## Historique

- **2026-09-18** → le jeton inscrit dans l'URL de la remote devient invalide : plus aucun push
  automatique, 109 000 échecs consécutifs consignés, commits locaux non publiés.
- **2026-09-20** → réécriture (v3) : push limité à `recette` / `integration`, avance rapide seule,
  authentification `gh`, verrou, anti-rebond, kill-switch, suppression du déploiement Supabase
  automatique. L'URL distante porteuse du jeton n'est plus utilisée : le script pousse vers l'URL
  HTTPS publique en passant par `gh`.
