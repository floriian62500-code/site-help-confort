# Contrôles et tests

> Mise à jour : 2026-09-20. Tout tourne **hors ligne** avec Node, sans dépendance à installer.
> Un test qui échoue décrit le défaut réel qu'il protège : lire le libellé avant de « réparer le test ».

## Tout passer

```bash
for t in scripts/tests/*.test.mjs; do echo "== $t"; node "$t" || break; done
bash scripts/tests/autopush.test.sh          # garde-fous du démon (bac à sable)
node scripts/seo/seo-guardrails.mjs          # invariants SEO — sortie 1 si ERROR
node scripts/header/sync-header.mjs --check  # en-tête unique sur toutes les pages
node scripts/seo/duplicate-intent.mjs        # doublons d'intention
node scripts/seo/fix-compound-selectors.mjs --check
node scripts/gen-offres-emploi.mjs --check   # offres d'emploi à jour
```

## Ce que couvre chaque suite

| Suite | Ce qu'elle protège |
|---|---|
| `demande-v2` (165) | le tunnel « Ma demande » : étapes, état vierge, confidentialité, reprise, gate tarifaire |
| `lead-cycle` (67) | intention silencieuse, corrélation, relance d'abandon, absence de doublon |
| `price-gate` (29) | aucun prix affiché sans source catalogue |
| `hc-cart` (12) | panier et devis |
| `contrats` (31) | page des contrats : prix TTC depuis la base, parcours de souscription |
| `ads-landing` (31) | pages d'atterrissage entretien : promesses vraies, prix du catalogue, un bouton mesuré |
| `canonical-pages` (20) | une seule URL par intention, doublon redirigé, garde-fou anti-doublon |
| `recrutement` (41) | offres réelles, candidature acceptée par le serveur, JobPosting fidèle, mesure |
| `consent` (8) | le bandeau est chargé partout où la mesure existe |
| `home-promo` (8) | la relance d'accueil : 1 message, 1 bouton, mesure correcte |
| `back-nav` (12) | le retour arrière du tunnel (historique propre) |
| `realisations` (15) | cartes cliquables, recrutement exclu des chantiers, manifeste |
| `header` (15) | en-tête identique sur 202 pages |
| `autopush` (14) | le démon ne pousse jamais sur `main`, ne force jamais, s'arrête à la demande |

## Vérifier un contrat serveur sans créer de lead

Les formulaires envoient de **vraies** demandes à l'agence. Pour prouver qu'un formulaire satisfait le
contrat du serveur, on envoie un payload **volontairement invalide** : la réponse 400 arrive **avant**
tout enregistrement.

```bash
curl -s -X POST "https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/submit-lead-v6" \
  -H "Content-Type: application/json" \
  -d '{"form_type":"demande_metier","nom":"CONTROLE","prenom":"Recette","tel":"000",
       "email":"controle@example.invalid","cp":"62500","ville":"Saint-Omer","message":"controle"}'
# → 400 {"errors":{"telephone":"Téléphone invalide"}} : seul le téléphone est refusé,
#   donc tous les autres champs satisfont le contrat. Rien n'a été créé.
```

C'est exactement ainsi qu'a été prouvé, le 20/09, que le formulaire de candidature était cassé
(il manquait le code postal → 100 % des candidatures refusées).

## Vérification visuelle (obligatoire avant d'annoncer « fait »)

Sur la **vraie preview**, jamais seulement en local, à **1440** et **390** :

1. débordement horizontal : `document.documentElement.scrollWidth - innerWidth` doit être ≤ 0 ;
2. le bouton principal doit être **cliquable** : `document.elementFromPoint(x, y)` doit renvoyer le
   bouton, pas le bandeau cookies (piège récurrent en 390) ;
3. la mesure : `window.__hcFunnel` doit contenir l'événement attendu (et rien ne part vers GA4).

Un balayage automatisé des 210 pages × 4 largeurs existe (iframes + mesure) : il a servi à prouver
« 0 débordement » après les corrections du 19 et du 20/09.

## Ce qui n'est pas couvert (à savoir)

- Aucun test de bout en bout avec envoi réel (par choix : les leads sont réels).
- Les fonctions edge ne sont pas testées automatiquement ; leur déploiement est manuel.
- Le rendu visuel n'est pas comparé pixel à pixel : c'est la vérification navigateur qui fait foi.
