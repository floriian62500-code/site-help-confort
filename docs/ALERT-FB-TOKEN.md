# 🚨 Token Facebook mort — action requise

**Date** : 2026-05-16T14:55:01+02:00
**Erreur** : unknown

## Action recommandée

1. Va sur https://developers.facebook.com/tools/explorer/
2. Sélectionne ton app HC + Get User Access Token
3. Permissions : pages_show_list, pages_read_engagement, pages_manage_posts, pages_read_user_content
4. Generate Access Token
5. Dans la barre URL Explorer, tape `me/accounts` puis Submit
6. Copie le `access_token` de la page HC
7. Colle dans https://depan59-62.fr/admin-pro/settings.html#section-meta → Save

Une fois fait, je détecterai automatiquement la mise à jour à la prochaine exécution (demain 4h15) et reprendrai le refresh permanent.

## Causes possibles
- L'app Meta a été révoquée par Florian dans Facebook (Settings → Apps)
- Le mot de passe Facebook a été changé récemment
- L'admin de la page n'est plus l'utilisateur lié à l'app
- Limitation Facebook (sanction, throttling)
