# Guide d'intégration — Claude IA (Anthropic)

**Durée estimée : 5 minutes**
**Coût : ~5-10 € de crédit suffisent pour 3000+ générations**

## Pourquoi

Permet au back-office de générer automatiquement :
- Titre SEO optimisé d'un chantier
- Description courte (feed)
- Description longue (page détail + SEO)
- Hashtags pour réseaux sociaux
- Alt-text pour les photos

## Étapes

### 1. Créer un compte Anthropic

Aller sur **https://console.anthropic.com/**

Si tu n'as pas de compte, clique "Sign up" et complète l'inscription (email + mot de passe + vérification).

### 2. Ajouter du crédit

- En haut à droite → ton avatar → **Plans & Billing**
- Choisis le plan **"Build"** (pay-as-you-go, pas d'abonnement)
- Ajoute 5 à 10 € de crédit avec ta carte bancaire
- Ce crédit ne s'épuise jamais (il reste dispo)

### 3. Créer la clé API

- Menu de gauche → **API Keys**
- Bouton **"Create Key"**
- Nom : `Help Confort Back-Office`
- Workspace : Default workspace
- Clique **"Add"**

Une fenêtre s'ouvre avec la clé : elle commence par `sk-ant-api03-...`

⚠️ **ATTENTION** : cette clé n'est affichée **qu'une seule fois**. Copie-la maintenant.

### 4. Coller la clé dans le back-office

- Aller sur ton back-office → **Paramètres** → section **Claude IA**
- Coller la clé dans le champ "Clé API"
- Choisir le modèle : **Claude Haiku 4.5** (recommandé pour le rapport qualité/prix)
- Cliquer **"Enregistrer"**

Tu dois voir un toast vert "Section anthropic enregistrée" + le voyant à gauche passer au vert.

### 5. Vérifier

Retour sur la page **Réalisations** → ouvre un chantier → un bouton **"Générer avec l'IA"** doit apparaître (sera ajouté dans la Vague B).

## Sécurité

La clé est stockée dans **ta** base Supabase, RLS activée, lisible uniquement par tes utilisateurs authentifiés. Elle n'est jamais exposée côté navigateur.

## Coûts indicatifs

| Action | Coût approximatif |
|---|---|
| Génération titre + description courte + description longue + hashtags | ~0,003 € |
| 100 générations | ~0,30 € |
| 1000 générations | ~3 € |

Avec 10 € de crédit, tu peux générer ~3300 chantiers complets.
