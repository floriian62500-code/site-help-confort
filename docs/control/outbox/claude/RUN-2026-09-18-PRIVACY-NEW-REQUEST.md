# RUN 2026-09-18 — Nouvelle demande = état vierge (directive 5717182264 relayée le 18/09)

- run_id: RUN-2026-09-18-privacy-new-request
- branch: recette (+ integration/lot1-lot2-vs-prod) — tip `143414d5`
- preview: https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/
- acks:
  - 5717182264 → CLAUDE_ANSWERED. Déjà traitée le 17/09 (`fb1d302f`, retour 5718405367). Re-vérifiée sur la version actuelle, qui ajoute la fenêtre ouverte depuis l'accueil, l'étape tarifs avec Nom et la référence de dossier. **4 défauts reproduits et corrigés.**

## RETURN
```
NEW_REQUEST_CLEAN_STATE=PASS | EXPLICIT_RESUME_ONLY=PASS | PII_LOCAL_PURGE=PASS | CLEAR_DEVICE_DATA=PASS | REFRESH_CURRENT_DRAFT=PASS | SHARED_DEVICE_PRIVACY=PASS | PII_NOT_IN_URL=PASS | STORAGE_ROOT_CAUSE=voir ci-dessous | SHA=143414d5 | PREVIEW=https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/
```

## Cause racine (où les données persistaient)
| Emplacement | Contenu | Problème | Correction |
|---|---|---|---|
| Mémoire de la page (fenêtre ouverte depuis l'accueil) | identité + adresse du dernier envoi | recopiées par « Faire une autre demande » | supprimé : nouvelle demande = état vierge |
| Champs du formulaire (DOM) | Nom saisi à l'étape tarifs | jamais vidé (absent de la liste de vidage) | vidage de tous les champs du module |
| `localStorage` `hc_demande_v2` (brouillon non personnel, 7 j) | référence du dossier finalisé | réutilisée par la demande suivante (nouvel onglet) → doublon côté serveur | référence abandonnée après envoi et à chaque nouvelle demande |
| `sessionStorage` `hc_demande_v2_pii` (onglet) | coordonnées, adresse, textes, récapitulatif | aucune limite de durée (un onglet peut rester ouvert ou être restauré) | effacement après 2 h sans activité |
| `localStorage` `hc_lead_v1`, `hc_tarif_lead_<email/tél>` (anciens formulaires « Nos prestations ») | coordonnées complètes, sans expiration | durables, non purgées par « Effacer mes informations » | onglet uniquement (24 h), clé sans email en clair, purge des anciennes copies |
| Cookies, IndexedDB, service worker, URL, mesure | — | rien de personnel trouvé | — |

## Livré
| Commit | Contenu |
|---|---|
| `143414d5` | module (cœur + interface), « Nos prestations », tests (19 nouveaux) |

## Tests
demande-v2 147/147 · lead-cycle 67/67 · price-gate 29/29 · panier 12/12 · SEO ERRORS=0 · scénarios navigateur sur la preview : 10 en 1440, 5 en 390, tous PASS, aucun appel réseau d'envoi.

## Constats hors périmètre
- En mobile, le bandeau cookies de première visite couvre le bas du tunnel. Sur la preview uniquement, le bouton « Centre de validation » masque « Refuser ».
- **Le jeton GitHub enregistré dans la remote du dépôt site n'est plus valide** : le démon d'auto-push committe en local mais ne pousse plus (ses commits depuis 12 h 17 sont restés locaux et ont été regroupés dans `143414d5`). Le push de ce run est passé par l'authentification `gh` (trousseau), sans modifier la configuration du dépôt.

## Gates / needs_florian
needs_florian: true (configuration)
1. Remplacer le jeton de la remote utilisée par le démon d'auto-push, ou le faire passer par `gh`. C'est une configuration persistante : je ne la change pas sans accord.
2. Inchangé : déploiement des fonctions serveur + clés Stripe TEST. Tant qu'il n'a pas lieu, la production garde l'ancien comportement.

Discipline : RECETTE uniquement, envoi simulé, aucun lead créé, aucune PROD, aucun secret affiché.
