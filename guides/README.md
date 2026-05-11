# Guides d'intégration des APIs

Bienvenue. Ces guides t'expliquent comment connecter ton back-office Help Confort à tes services externes.

## Ordre recommandé

| # | Plateforme | Difficulté | Durée | Bénéfice |
|---|---|---|---|---|
| 1 | [Anthropic Claude](anthropic.md) | ⭐ Facile | 5 min | Génération IA des contenus chantiers |
| 2 | [Facebook + Instagram (Meta)](meta.md) | ⭐⭐ Moyen | 15-20 min | Publication automatique chantiers |
| 3 | [LinkedIn](linkedin.md) | ⭐⭐⭐ Difficile | 10-15 min | Publication sur page entreprise |
| 4 | [Google Analytics 4](ga4.md) | ⭐⭐ Moyen | 20 min | Vraies stats visiteurs sur le dashboard |
| 5 | [Google Business Profile](gbp.md) | ⭐⭐⭐⭐ Très difficile | 30-45 min + 1-3 jours validation Google | Posts Google + sync avis |

## Conseils

- **Commence par Anthropic** : c'est le plus rapide et débloque le plus de valeur immédiate (génération IA)
- **GBP nécessite une validation Google de 1 à 3 jours** : lance la demande en parallèle dès que possible
- Chaque clé/token a une durée de vie (60 jours pour Meta, 60 jours pour LinkedIn, permanent pour Anthropic et GA4) — le back-office t'enverra des alertes avant expiration

## Sécurité

Toutes les clés sont stockées dans **ta** base Supabase, dans la table `app_settings` avec RLS authentifiée. Elles ne sont **jamais** :
- Présentes dans le code source du site public
- Exposées côté navigateur
- Visibles dans le HTML rendu

## Où coller les valeurs

Toutes les valeurs récupérées dans ces guides se collent dans :
**Back-office → Paramètres** (menu Système)

Chaque section a son propre formulaire avec validation et test de connexion.
