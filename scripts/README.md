# 📂 Scripts de synchronisation

Ce dossier contient les scripts utilitaires du site HELP Confort.

## 🔄 sync-facebook-posts.py

Synchronise automatiquement les publications de la page Facebook **Help Confort ST OMER** → site.

### Installation (une seule fois)

```bash
pip3 install requests python-dotenv
```

### Configuration

1. Suis le guide **`../docs/SETUP-API-FACEBOOK.md`** pour obtenir ton **Page Access Token**
2. Copie `../.env.example` en `../.env` et remplis tes valeurs
3. Vérifie que `.env` est bien dans `.gitignore` (déjà fait)

### Utilisation

```bash
# Synchronisation normale (récupère les nouveaux posts)
python3 scripts/sync-facebook-posts.py

# Test sans rien écrire
python3 scripts/sync-facebook-posts.py --dry-run

# Limiter à N posts (utile pour tester)
python3 scripts/sync-facebook-posts.py --limit 5

# Re-télécharger TOUT (force, écrase l'existant)
python3 scripts/sync-facebook-posts.py --force
```

### Ce que le script fait

Pour chaque publication Facebook :
- ✅ Récupère le **texte complet** + date + lien permanent
- ✅ Télécharge l'**image principale** dans `images/posts/<slug>.jpg`
- ✅ Génère une **page HTML** dans `actualites/<slug>.html`
- ✅ Récupère les **stats** (vues, clics, engagement)
- ✅ Met à jour `content/actualites/index.json`

### Idempotence

Le script vérifie chaque post par son **ID Facebook** (stocké dans `index.json`).
Tu peux le relancer 100 fois sans risque — il ne re-créera pas les articles déjà importés (sauf avec `--force`).

### Automatisation (facultatif)

**Sur Mac/Linux** — synchronisation chaque jour à 8h :

```bash
crontab -e
# Ajouter cette ligne :
0 8 * * * cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET" && python3 scripts/sync-facebook-posts.py >> sync.log 2>&1
```

**Sur Netlify** (une fois le site déployé) — déclenchement automatique via Build Hook : à voir avec moi le moment venu.

### Dépannage

| Erreur | Solution |
|---|---|
| `Variables d'environnement manquantes` | Crée `.env` à la racine (cf. `.env.example`) |
| `(#190) Invalid OAuth access token` | Ton token a expiré (>60 jours). Régénère-le (cf. SETUP-API-FACEBOOK.md étape 4) |
| `(#100) Tried accessing nonexisting field` | Permission manquante sur le token (re-cocher `pages_read_engagement`) |
| `429 Too Many Requests` | Rate limit FB atteint. Relance dans 1h. |

---

*Pour toute question, reviens me voir sur Cowork avec le message d'erreur exact.*
