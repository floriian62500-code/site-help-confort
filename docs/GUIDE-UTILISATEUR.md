# Guide utilisateur — Back-Office HELP Confort

> Pense-bête rapide pour retrouver les fonctions clés du back-office. Pas besoin de lire ça d'un trait — utilise-le comme référence ponctuelle.

---

## 🚀 Accès rapide

| Quoi | URL |
|---|---|
| Site public | https://depan59-62.fr |
| **Back-office (dashboard)** | https://depan59-62.fr/admin-pro/ |
| Login | https://depan59-62.fr/admin-pro/login.html (compte : `florian.dhaillecourt@helpconfort.com`) |
| Diagnostic du système | https://depan59-62.fr/admin-pro/setup.html |
| Réglages globaux | https://depan59-62.fr/admin-pro/settings.html |

---

## 🌅 Routine du matin (5 min)

1. **Ouvre le dashboard** → https://depan59-62.fr/admin-pro/
2. **Regarde les alertes contextuelles** (sous les KPI) — elles te disent ce qui demande ton attention :
   - 📥 N souscriptions à importer dans le CRM
   - N leads à qualifier
   - N commandes à traiter
   - N avis Google non répondus
3. **Si une alerte est là**, clique sur "voir →" : tu arrives directement filtré sur les items concernés.
4. **Le bloc "Mon CRM"** ouvre Apogée dans un nouvel onglet.

---

## 📥 Workflow souscription contrat (le plus important)

**Quand un client souscrit un contrat d'entretien sur le site (`/contrats-entretien`)** :

1. La souscription est **automatiquement enregistrée** dans Supabase
2. Un **email part** vers `saint-omer@helpconfort.com` (notif Resend)
3. La souscription apparaît dans **`Contrats d'entretien`** avec le badge `📥 À IMPORTER`
4. Sur le dashboard, l'inbox "Souscriptions à importer" s'affiche en orange
5. **Toi tu dois** :
   - Cliquer sur la ligne du client → modal détaillée (énergie, équipement, CGV, etc.)
   - Aller dans **Apogée** créer le contact / lead correspondant
   - Revenir sur HELP Confort → clic bouton **`📥 Importé`** sur la ligne → saisir l'ID externe Apogée (facultatif)
6. Le contrat passe en `✓ CRM` (vert)

**Pour gagner du temps** : si tu as importé plusieurs souscriptions d'un coup dans Apogée, utilise le bouton **"Tout marquer importé"** en haut de la liste.

**Export CSV** : bouton CSV pour récupérer toutes les souscriptions filtrées (format Excel FR avec ; comme séparateur).

---

## 📞 Workflow leads / demandes clients

**`Demandes clients`** centralise tous les formulaires du site (devis, urgences, contact).

Pour chaque demande tu vois :
- Un **badge couleur** : 🔥 URGENCE (rouge) / 📄 SOUSCRIPTION (bleu) / 💬 DEVIS (gris)
- Le **contact direct** (téléphone et email cliquables → ouvre l'appel / le mail)
- L'**adresse complète** + un preview du message client
- 3 **boutons d'action rapide** à droite :
  - 📞 Appeler (vert, met en avant)
  - 💬 SMS
  - 📧 Email
  - "Détails →" pour la modal complète

**Modal détaillée** (clic sur "Détails →") :
- Identité + adresse complète
- Section "Souscription contrat" si applicable (énergie, équipement, montant, CGV)
- Section "Photos liées" si le lead est rattaché à une réalisation
- Tracking source (UTM, page d'origine, referer)

---

## 🛠️ Workflow commande prestation (catalogue)

**Quand un client commande une prestation à la carte depuis `/nos-prestations`** :

1. Apparaît dans **`Catalogue prestations` → onglet `Commandes`**
2. Tu vois le numéro de commande, le client, la prestation, le créneau préféré, le montant et l'acompte
3. Badge **🔥 URGENT** si le client a choisi "Urgent" comme créneau
4. Clic sur la ligne → modal avec tous les détails + bouton "Marquer confirmée / programmée / terminée"

---

## ⭐ Workflow avis Google

**`Avis clients`** :

1. Les avis Google + Facebook sont synchronisés automatiquement (table `reviews`)
2. Les nouveaux apparaissent en haut, avec badge ⚠ À traiter
3. Clic **"Répondre"** → modal avec ton brouillon + **bouton "Générer avec l'IA"** qui crée une réponse adaptée au ton de l'avis (poli, contextuel, propose action si négatif)
4. Tu peux modifier avant publication
5. La réponse part vers Google Business Profile (via Edge Function `reply-review`)

---

## 📅 Workflow publications réseaux sociaux

Cible **B2C** = Facebook + Instagram + Google Business Profile (pas LinkedIn pour l'instant).

**3 façons de publier** :

1. **Studio création IA** (`Magic`) : drop tes photos chantier → IA génère titre + description + hashtags + planifie sur les 3 canaux
2. **Bibliothèque de templates** (`Modèles de posts` via studio) : sujets pré-définis, clic "Générer avec l'IA"
3. **Manuel** : depuis la `Pile de publication`, ajoute manuellement

**Calendrier éditorial** affiche la vue mois avec les posts programmés.

**Agent IA hebdo** : chaque vendredi 18h, **7 brouillons** sont générés automatiquement pour la semaine suivante (fichier `docs/POSTS-SEMAINE-{N}.md`). Tu valides lundi matin.

---

## 🔧 Réglages essentiels

`Réglages → Paramètres` :

| Section | À quoi ça sert |
|---|---|
| **Société** | SEO global du site (raison sociale, adresse, SIRET) |
| **Claude IA** | Clé API Anthropic — débloque la génération de textes (posts, titres, descriptions) |
| **Facebook / Instagram** | Tokens Meta pour cross-poster |
| **Google Business** | OAuth Google pour publier + lire les avis |
| **Google Analytics 4** | Voir les stats visiteurs dans le dashboard |
| **CRM externe** | URL d'accès au CRM Apogée (le bouton "Mon CRM" du dashboard pointe ici) |
| **Notifications email** | Adresses qui reçoivent les notifs souscriptions / leads / commandes |

---

## 🤖 Agents IA en autonomie

4 agents tournent dans Cowork pour te décharger :

1. **`helpconfort-daily-maintenance`** — tous les matins 7h : audit technique + fixes auto + rapport `docs/AUDIT-QUOTIDIEN.md`
2. **`helpconfort-evening-business-recap`** — tous les soirs 18h (lun-sam) : récap business + à-faire-demain → `docs/RECAP-SOIR.md`
3. **`helpconfort-hourly-monitoring`** — toutes les heures : check uptime + Edge Functions + alerte si problème
4. **`helpconfort-weekly-post-drafts`** — chaque vendredi 18h : 7 brouillons de posts pour la semaine suivante → `docs/POSTS-SEMAINE-{N}.md`

Pour gérer ces agents (pause, run manuel, ajustement) : section **"Scheduled"** dans la sidebar Cowork.

---

## 🚨 Que faire si quelque chose plante

### Le site est inaccessible
1. Va sur https://app.netlify.com/projects/remarkable-dragon-364e2b/deploys
2. Regarde le dernier deploy : OK ✓ vert ? KO ✗ rouge ?
3. Si KO → clique sur le deploy en échec → onglet "Deploy log" → lis l'erreur
4. 95% des cas : push manuel `cd ~/Documents/Claude/Projects/SITE\ INTERNET && git push` depuis le terminal Mac

### Le formulaire de souscription ne marche pas
1. Test la page directement : https://depan59-62.fr/contrats-entretien.html
2. Si erreur visible → screenshot + envoie à Claude
3. Vérifier les logs Edge Function : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/functions/notify-subscription/logs

### Les emails de notif ne partent pas
1. Vérifier Resend : https://resend.com/emails (statut des derniers envois)
2. Vérifier le secret `RESEND_API_KEY` : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/functions/secrets
3. Tester avec le bouton "🧪 Tester le pipeline" sur https://depan59-62.fr/admin-pro/contracts.html

### Le diagnostic affiche du orange
- Vois si c'est bloquant : "Clé Anthropic" → bloque la gen IA, à configurer dans `Paramètres → Claude IA`
- Sinon → cosmétique, ignorable

### J'ai oublié mon mot de passe
1. https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/auth/users
2. Clic sur ta ligne (`florian.dhaillecourt@helpconfort.com`)
3. Bouton "Send magic link" → tu reçois un mail, clic le lien, tu es connecté

---

## 📊 Stats projet

- **Pages publiques** : ~30 (site, articles, fiches métier, zones, guides)
- **Pages back-office** : ~25 (admin-pro/)
- **Edge Functions Supabase** : 16+ déployées
- **Migrations SQL** : 14 dans le repo (toutes auto-appliquées par autopush)
- **Agents IA** : 4 (daily-maintenance, evening-recap, hourly-monitoring, weekly-posts)

---

## 📞 Si tu galères vraiment

Demande directement à Claude :
- "Sur la page X je vois Y, c'est normal ?" (avec un screenshot)
- "Comment je fais pour Z ?"
- "Fix le bug qui fait que..."

Claude a accès au repo, peut faire les changements, et autopush déploie tout seul.

---

**Dernière mise à jour** : 2026-05-15 — Documentation générée automatiquement.
