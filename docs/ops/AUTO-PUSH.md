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
| Capturer un état intermédiaire pendant un lot | verrou de session `autopush.worksession` : ni commit ni push tant qu'il est posé, expiration de sécurité à 90 min (voir plus bas) |

## Verrou de session de travail (pendant un lot)

**Le problème qu'il résout.** Le 2026-09-23, le démon a publié deux fois un travail en cours sous un
message générique — dont une fois une fonction sitemap momentanément cassée, poussée sur `recette`.
L'anti-rebond de 180 s ne suffit pas : un lot dure des heures, avec des pauses de plus de trois
minutes entre deux éditions.

**La règle.** Pendant un lot, on pose un verrou ; le démon ne committe ni ne pousse. À la fin du lot,
on le retire et la sauvegarde repart d'elle-même.

```bash
# au début d'un lot
scripts/ops/worksession.sh start "libellé du lot"

# à la fin
scripts/ops/worksession.sh stop

# un lot qui dure : prolonger AVANT l'expiration
scripts/ops/worksession.sh renew

# savoir où on en est
scripts/ops/worksession.sh status
```

⚠️ **Un lot de plus de 90 minutes doit se prolonger.** Le 2026-09-23 à 22 h 11, le verrou a expiré
en plein travail : le mécanisme a fonctionné exactement comme prévu — il refuse de geler les
sauvegardes indéfiniment — mais le lot durait plus longtemps, et le démon a repris la main au milieu.
`renew` repousse l'expiration de 90 minutes ; il échoue s'il n'y a pas de session en cours.

**Sécurité : un verrou oublié ne gèle rien pour toujours.** Au-delà de **90 minutes**, le démon le
considère abandonné, le lève, le journalise et notifie. Les sauvegardes reprennent seules.

**Pendant un lot, la preuve de vie reste rafraîchie** : le démon est vivant, il attend. La
surveillance ne doit pas conclure à une panne — c'est l'erreur commise le 2026-09-20 avec l'arrêt
d'urgence, et elle n'est pas reproduite ici.

**Ce n'est pas l'arrêt d'urgence**, qui reste ci-dessous : celui-ci n'expire jamais et se lève à la
main. Les deux mécanismes coexistent et se testent séparément.

| | Verrou de session | Arrêt d'urgence |
|---|---|---|
| Posé par | le travail en cours, automatiquement | un humain |
| Expire | oui, au bout de 90 min | non, jamais |
| Preuve de vie | maintenue (le démon attend) | non rafraîchie (la pause est signalée après 1 h) |
| Fichier | `autopush.worksession` | `autopush.off` / `.autopush-off` |

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

## Où est la source

| Rôle | Chemin |
|---|---|
| Script qui tourne | `~/Library/Application Support/HelpConfort/autopush.sh` |
| Copie versionnée (référence, revue, réinstallation) | `scripts/ops/autopush.sh` |
| Garde-fous rejouables en bac à sable | `bash scripts/tests/autopush.test.sh` (14 contrôles, dépôt temporaire, ne touche ni le vrai dépôt ni GitHub) |

Réinstaller la version du dépôt :

```bash
cp scripts/ops/autopush.sh "$HOME/Library/Application Support/HelpConfort/autopush.sh"
chmod +x "$HOME/Library/Application Support/HelpConfort/autopush.sh"
```

## Surveillance

`scripts/automation/monitoring-uptime.sh` (LaunchAgent `com.helpconfort.monitoring-uptime`) vérifie
le démon **uniquement quand du travail attend** (fichiers modifiés non poussés) :

| Situation | Alerte (fichier local `docs/ALERT-MONITORING.md` + Slack) |
|---|---|
| kill-switch posé depuis plus d'une heure | « Auto-push EN PAUSE … pour reprendre : rm …/autopush.off » |
| aucune preuve de vie depuis 65 min (`autopush.heartbeat`) | « Auto-push ne tourne plus … » |

Le démon rafraîchit `autopush.heartbeat` à **chaque passage actif**, même sans rien à pousser ; en
pause, il ne le rafraîchit pas. Le fichier d'alerte est un artefact local, ignoré par git.

> Vu le 22/09 : l'auto-push, mis en pause pendant l'assainissement du 20/09, n'avait pas été relancé.
> La surveillance l'a signalé (« heartbeat > 65 min ET fichiers en attente »). Depuis, le message dit
> explicitement qu'il s'agit d'une pause et comment la lever.

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
