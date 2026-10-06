# Runbook — faire tourner le build hook Netlify

*Action humaine. Rien dans ce document ne contient le secret ni l'ancienne URL.*

## Pourquoi maintenant

Un build hook Netlify était **committé dans le dépôt**, et ce dépôt est **public** depuis juin. Un
build hook n'est pas une clé d'accès aux données : c'est une URL qui, appelée sans aucune
authentification, **déclenche un déploiement de production**. Celui-ci doit être considéré comme
compromis : le retirer du dépôt (fait le 2026-09-25) ne l'invalide pas.

Ce que quelqu'un peut en faire : déclencher des déploiements en boucle — consommation des minutes
de build, et publication forcée de l'état courant de `main`. Pas d'accès aux données, pas
d'injection de code.

## Ce qu'il faut faire — cinq minutes

1. **Ouvrir Netlify** → le site du projet → **Site configuration** → **Build & deploy** →
   **Build hooks**.
2. **Repérer le hook existant.** Il n'y en a qu'un pour la production. Son nom d'origine indique
   qu'il sert au déploiement de production.
3. **Le supprimer** (bouton *Options* → *Delete*). C'est ce geste, et lui seul, qui invalide
   l'ancienne URL.
4. **En créer un nouveau** si un automatisme s'en sert encore : *Add build hook*, branche `main`,
   un nom explicite. Netlify affiche l'URL **une fois** — la copier tout de suite.
5. **Reporter la nouvelle valeur là où elle sert**, et nulle part ailleurs :
   variables d'environnement de la fonction `promote-to-prod` → `NETLIFY_BUILD_HOOK_ID`
   (Supabase → Edge Functions → Secrets). **Ne pas la remettre dans un fichier du dépôt.**

## Comment vérifier que l'ancien ne déclenche plus

Depuis un terminal, appeler l'**ancienne** URL (elle est dans votre historique Netlify, pas ici) :

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST '<ancienne-url>'
```

Attendu : **404**. Si la réponse est 200, le hook n'a pas été supprimé.

## Comment vérifier que le nouveau fonctionne

Uniquement si un automatisme l'utilise encore :

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST '<nouvelle-url>'
```

Attendu : **200**, puis un déploiement visible dans l'onglet *Deploys* de Netlify. Attention : cela
**déclenche un vrai déploiement de production**. À ne faire que si c'est acceptable à cet instant.

## Si personne ne s'en sert

Le plus sûr est de **ne pas en recréer**. La fonction `promote-to-prod` est en `quarantine` et
n'est appelée que par une page d'admin elle-même bloquée. Dans ce cas : supprimer, ne rien
recréer, et retirer la variable d'environnement devenue inutile.

## Ce qui a déjà été fait de mon côté

- le fichier a été retiré du suivi git et supprimé du disque ;
- l'URL a été caviardée dans la documentation de passation ;
- `.gitignore` couvre désormais ce nom — il couvrait un autre jeton Netlify, pas celui-là ;
- un test d'hygiène échoue si un secret de cette forme réapparaît dans le dépôt.

**Ce que je ne peux pas faire : la rotation elle-même.** Elle demande l'accès au compte Netlify.
