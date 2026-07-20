# Migrer vers un System User Token Meta (token permanent)

> **Objectif** : ne plus jamais avoir à re-générer le token Facebook. Un System User Token est lié au Business Manager (pas à toi Florian), donc :
> - il ne meurt PAS quand tu changes ton mot de passe FB
> - il ne meurt PAS si Facebook invalide ta session pour raisons de sécurité
> - il n'expire JAMAIS (sauf révocation manuelle explicite)
>
> C'est LA façon dont Meta veut qu'on fasse pour un usage production.

**Durée** : ~20 minutes, à faire UNE SEULE FOIS.
**Résultat** : plus jamais de "les chantiers ne se publient plus depuis X jours".

---

## Prérequis

- Être **admin du Business Manager HELP Confort** (ID à vérifier dans Meta Business Suite → Paramètres → Infos sur l'entreprise)
- Avoir accès à l'App Meta HELP Confort déjà créée (utilisée par le wizard actuel — App ID `986385010519313`)
- 20 min sans interruption

Si le Business Manager n'existe pas encore, il faut d'abord le créer (10 min de plus) — ping-moi et je détaille cette partie.

---

## Étape 1 — Ouvrir Business Settings

1. Ouvre https://business.facebook.com/settings
2. Vérifie en haut à gauche que tu es bien sur le **Business Manager HELP Confort** (pas ton perso).
3. Colonne de gauche → **Utilisateurs** → **Utilisateurs système**

---

## Étape 2 — Créer le System User

1. Bouton **"+ Ajouter"** (ou "Add")
2. Nom : `HC Site Automation` (peu importe le nom, c'est pour toi)
3. Rôle : **Employé** (pas Admin — principe du moindre privilège)
4. Clique **Créer un utilisateur système**

Un nouvel utilisateur "robot" apparaît. Il n'a pas de mot de passe, pas d'email, pas de profil FB — c'est juste un porteur de token.

---

## Étape 3 — Attribuer la Page FB à ce System User

1. Sur le System User que tu viens de créer, clique **"Attribuer des actifs"** (ou "Assign Assets")
2. Type d'actif : **Pages**
3. Sélectionne la page **HELP Confort Saint-Omer** (ID `107405408058063`)
4. Permissions : coche **"Gérer la page"** (`Manage Page` — nécessaire pour publier + lire les posts)
5. Enregistre

Répète pour l'App Meta HELP Confort si tu veux qu'il puisse la gérer :
- Actif : **Apps**
- App : HELP Confort (App ID `986385010519313`)
- Permissions : **Développer l'app** (Develop app)

---

## Étape 4 — Générer le System User Token

1. Retour sur ta fiche System User → onglet **"Générer un nouveau token"**
2. App : sélectionne **HELP Confort**
3. Durée : **Ne jamais expirer** (Never Expire) ← **CRITIQUE**
4. Scopes à cocher (autorisations minimales pour ton usage) :
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `pages_manage_posts`
   - `pages_manage_metadata`
   - `read_insights` (optionnel, si tu veux les stats FB)
5. Clique **"Générer un token"**

Un long token `EAA...` s'affiche. **Copie-le immédiatement** — tu ne pourras plus le revoir après avoir fermé la fenêtre.

---

## Étape 5 — Vérifier que c'est bien le bon token (10 sec)

Dans un terminal ou dans ton navigateur, teste :
```
https://graph.facebook.com/v21.0/me?access_token=<COLLE_TON_TOKEN_ICI>
```

Tu dois voir :
```json
{"name": "HC Site Automation", "id": "..."}
```

Si oui → parfait, c'est ton System User token qui répond, pas ton compte perso.

---

## Étape 6 — Enregistrer dans Supabase (2 méthodes au choix)

### Méthode A — Via le wizard existant (recommandé, plus safe)

1. Ouvre https://www.depan59-62.fr/admin-pro/wizard-meta.html
2. Va directement à l'étape 6.2 (le champ Page Token)
3. Colle ton nouveau System User Token
4. Valide → le wizard écrit dans `app_settings.meta`

### Méthode B — En SQL direct (si le wizard bugue)

Depuis Supabase SQL Editor (https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/sql/new) :

```sql
UPDATE app_settings
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      value,
      '{page_access_token}',
      '"COLLE_TON_NOUVEAU_TOKEN_ICI"'::jsonb
    ),
    '{token_source}',
    '"system_user_never_expires"'::jsonb
  ),
  '{token_refreshed_at}',
  ('"' || to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') || '"')::jsonb
),
updated_at = now()
WHERE key = 'meta';
```

---

## Étape 7 — Vérifier que tout roule (30 sec)

Ouvre https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/pipeline-health-check

Dans la réponse JSON, section `meta` :
```json
"meta": {
  "token_ok": true,
  "page_name": "HELP Confort Saint-Omer",
  "token_source": "system_user_never_expires"
}
```

Si `token_ok: true` → migration réussie. Le cron `auto-sync-facebook-posts` va reprendre son travail dans les 30 min qui suivent.

---

## Étape 8 — (Optionnel) Trigger immédiat pour rattraper les chantiers en attente

Depuis Supabase SQL Editor :
```sql
SELECT net.http_post(
  url := 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/sync-facebook-posts',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer a3dc507d51dd495c50f6ef3d63e724b4f3d4d2c033c5c749d122fa497e28c8e3'
  ),
  body := '{}'::jsonb
);
```

Attends 5 secondes, puis :
```sql
SELECT * FROM net._http_response ORDER BY id DESC LIMIT 1;
```

Le champ `content` te dira combien de chantiers ont été importés et combien ont été skippés (actus / doublons).

---

## Pourquoi cette procédure > l'ancien Page Token perso

| | Page Token perso (ancien) | System User Token (nouveau) |
|---|---|---|
| Créé au nom de | Compte Florian Dhaillecourt | Business Manager HELP Confort |
| Dépend du mot de passe FB perso | **Oui** | **Non** |
| Meurt si tu changes ton mdp | **Oui** ← bug 20/07/2026 | Non |
| Meurt si FB invalide ta session | **Oui** | Non |
| Renouvellement obligatoire | Tous les 60 j | **JAMAIS** |
| Setup initial | 25 min | 20 min |
| Best practice Meta | Non (usage dev/perso) | **Oui** (usage prod) |

---

## Que se passe-t-il pour l'ancien token ?

Aucune action à faire — le nouveau System User Token remplace l'ancien dans `app_settings.meta`. L'ancien reste "invalidé" côté Facebook, il ne fera plus rien. Tu peux même le révoquer explicitement dans Business Settings → Apps → HELP Confort → onglet "Tokens" si tu veux faire propre.

---

## Monitoring post-migration

Le `pipeline-health-check` v4 (déployé le 20/07/2026) surveille le token Meta toutes les 30 min et t'envoie un mail immédiatement si :
- Le token est invalidé (jamais dans le cas System User, mais safe)
- Le token a > 45 jours (pertinent uniquement si tu restes en Page Token perso)
- Aucun chantier synchronisé depuis > 7 jours (WARN) ou > 14 jours (CRITICAL)

Tu ne perdras plus 53 jours à découvrir que ça a cassé.

---

*Guide créé le 2026-07-20 suite au bug "chantiers ne se publient plus depuis 53 jours".*
*Voir aussi : `BUGS-HISTORY.md` §2026-07-20 + `POUR-FLORIAN.md`.*
