# E2E — parcours de commande unifié (UX-COMMERCE-1)

> Tâche ledger : **UX-COMMERCE-1** (commit F). Source : issue #9 commentaire 5443822193.
> Scénarios exigés + résultats vérifiés au navigateur sur le moteur `catalogue.html`
> (serveur local statique, données réelles `v_services_public`). Vérifié le 2026-08-27.
> Régression automatisable : `node scripts/tests/smoke.mjs <baseURL>` (checks structurels 5→11).

## Résultats (navigateur, données réelles)

| # | Scénario exigé | Étapes vérifiées | Résultat |
|---|---|---|---|
| 1 | **Client sait → 2 prestations de 2 familles** | mode « Je sais » → Plomberie (15 produits) → ajout → retour familles → Chauffage (6) → ajout → panier | ✅ panier 2 lignes, 2 familles, mode=paiement |
| 2 | Suite checkout scénario 1 | panier → urgence Oui/Non → adresse → coordonnées → confirmation | ✅ récap complet (prestations + agence Saint-Omer + coordonnées) |
| 3 | **Client hésite** | mode « Aidez-moi » → 6 métiers → Plomberie → 15 problèmes → mot-clé « fuite » (→1) → fiche → Ajouter → panier | ✅ recommandation réelle, ajout au même panier |
| 4 | **Produit sur devis** | fiche VMC (`requires_quote`) → « Ajouter à ma demande de devis » | ✅ ligne devis, pas de prix ferme affiché |
| 5 | **Panier mixte** | prix ferme (plomberie) + sur devis (VMC) dans le même panier | ✅ mode=mixte, hasQuote=true, total ferme séparé |
| 6 | **Hors zone** | CP 75001 → 1er clic : avertissement « hors zone principale » + bouton « Continuer quand même » (reste sur l'écran) ; 2e clic : avance | ✅ averti sans blocage silencieux |
| 7 | **Adresse manuelle** | saisie CP/ville manuelle (autocomplete BAN facultatif, `data-autocomplete-skip`) | ✅ CP/ville persistants, aucun wipe |
| 8 | **Retour / refresh / reprise** | remplissage jusqu'à coordonnées → rechargement page | ✅ reprend à l'étape coords, champs + panier réhydratés (localStorage) |
| 9 | **Double-submit** | bouton Envoyer : `dataset.sending` verrouille le 2e clic | ✅ garde anti-double-submit |
| 10 | Validation inline + focus 1re erreur | adresse vide → 3 erreurs (reste) ; tél/email invalides → 2 erreurs (reste) ; focus 1er champ fautif | ✅ |
| 11 | **Mobile** | viewport < 1024 : barre panier fixe + bottom-sheet ; ≥1024 : résumé sticky | ✅ (bottom-sheet masqué desktop, corrigé) |
| 12 | Deep-link page métier | `/catalogue#cat=plomberie` ouvre directement la famille Plomberie | ✅ (contrat CMD-2 conservé) |

## Notes honnêteté / hygiène

- **Aucune soumission réelle** déclenchée pendant les tests (arrêt avant l'appel `submit-lead-v6`,
  sinon nom `NE PAS TRAITER`) → aucune notification agence parasite.
- **Créneau** : jamais inventé — message honnête « Nous vous rappelons pour confirmer le créneau ».
- **Paiement** : aucun paiement en ligne (Stripe gated = BLOCKED_HUMAN) ; réservation non bloquée
  par le paiement ; total payable **recalculé côté serveur** (le front n'envoie que id+qty).
- **1 check smoke** (`admin PAT/promote 404`) échoue en **serveur local** (sert `/admin-pro/*`) mais
  passe sur le Deploy Preview Netlify (redirections) — artefact d'environnement, pas une régression.

## Reste (gates, hors périmètre autonome)

- Paiement Stripe TEST en modale (panier 100% éligible, montant serveur) = **BLOCKED_HUMAN** (clé `sk_test_` + GO deploy edge).
- QA visuelle responsive fine (320/375/390/768/1024/1440/1920) = validation Florian (pane non fiable pour le pixel).
