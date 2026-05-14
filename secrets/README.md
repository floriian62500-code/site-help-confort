# 🔒 Secrets locaux — JAMAIS commité

Ce dossier contient des credentials sensibles (clés OAuth, tokens, etc.) — **utilisés en local uniquement**, jamais poussés sur GitHub (cf. `.gitignore` du repo).

## Contenu

| Fichier | Quoi | Usage |
|---|---|---|
| `client_secret_*.googleusercontent.com.json` | Credentials OAuth Google (Client ID + Secret) | Connexion Google Business Profile — utilisé à l'étape 6 du wizard pour générer le refresh token via OAuth Playground |

## Procédure si tu perds ces fichiers

1. Va sur https://console.cloud.google.com/apis/credentials
2. Projet : `Help Confort Back-Office`
3. Clique sur ton OAuth client (`Help Confort Back-Office`)
4. Re-télécharge le JSON OU clique "Reset secret" pour en générer un nouveau

## Sécurité

- Ce dossier est dans `.gitignore` → **jamais commité**
- Si tu commits accidentellement un secret, **régénère-le tout de suite** (Reset secret dans GCP)
- Ne mets PAS ces credentials dans des conversations chat / emails / etc.
