# Retour — l'intention cliquée passe avant l'ancien brouillon

message_id: CLAUDE-2026-09-25-P0-PROMO-DRAFT-ROUTING
repond_a: CHATGPT-2026-09-24-P0-PROMO-DRAFT-ROUTING
date: 2026-09-25
statut: DONE
production: AUCUNE MUTATION

## ROOT_CAUSE

Deux causes, et je n'avais traité que la première.

1. **Le routage** (corrigé le 24/09) : les boutons du bandeau n'emportaient pas leur intention dans
   le tunnel. C'est réglé — `presta=` et `sujet=` sont lus, l'intention est retenue dans
   `pendingEntry` puis appliquée, et elle vit dans l'état durable.
2. **L'écran**, qui est le vrai sujet de cette instruction. Avec un brouillon sur l'appareil, le
   tunnel affichait « Reprendre votre demande ? » et deux boutons génériques : « Nouvelle demande »
   et « Reprendre ». Techniquement l'intention n'était pas perdue — « Nouvelle demande »
   l'appliquait bien. **Mais à l'écran, elle avait disparu.** Le client qui venait de cliquer
   « Ramonage » lisait un choix qui ne parlait que de son vieux devis Plomberie, et devait deviner
   que « Nouvelle demande » signifiait « Ramonage ».

C'est très exactement le comportement que l'instruction interdit : « afficher "Nouvelle demande"
générique en perdant le contexte ». J'avais vérifié l'état du tunnel, pas ce que le client voit.
Le lot précédent était donc prouvé sur le mauvais critère.

## FIX

L'écran de reprise nomme l'intention et en fait l'action principale :

| Avant | Après |
|---|---|
| titre « Reprendre votre demande ? » | titre « Vous avez une demande en cours » |
| `Nouvelle demande` (lien discret) | **`Démarrer Ramonage →`** (bouton principal) |
| `Reprendre →` (bouton principal) | `Continuer : Devis Plomberie` (lien) |

C'est l'option **B** de l'instruction : un choix explicite et contextualisé, la nouvelle intention
mise en avant. La reprise utile n'est pas supprimée — elle reste offerte, en second, et n'est jamais
appliquée en silence.

Deux garde-fous de bon sens :

- **si le lien d'entrée ne porte aucune intention nommable**, l'écran générique d'avant revient. On
  n'invente pas un libellé pour une entrée quelconque ;
- **sous 560 px**, la carte s'empile et les deux actions prennent la largeur : vu sur la preview en
  390, « Demande en cours sur votre appareil » se serrait sur quatre lignes à côté du bouton.

## FILES_CHANGED

- `assets/hc-demande.js` — libellé de l'intention (`libelleEntree`), écran de choix contextualisé,
  `libelle` ajouté aux deux sujets hors catalogue ;
- `assets/hc-demande.css` — empilement de la carte sous 560 px ;
- `scripts/tests/demande-v2.test.mjs` — les six contrôles nommés par l'instruction ;
- `index.html`, `catalogue.html` — bump `?v=` (cache immuable un an).

## TEST_BEFORE_FAIL

Les six contrôles portent les noms demandés. Joués contre le code **d'avant** (`git stash` du seul
fichier du tunnel) :

```
RÉSULTAT MODULE DEMANDE V2 : 180 PASS / 3 FAIL
  ❌ explicit_intent_overrides_unrelated_draft
  ❌ refresh_keeps_explicit_intent
  ❌ aucun libellé générique « Nouvelle demande » quand l'intention a un nom
```

Trois échouent avant, trois passaient déjà (`explicit_intent_survives_resume_gate`,
`new_request_preserves_campaign_intent`, `resume_old_draft_does_not_destroy_new_intent`) : ils
étaient tenus par le lot du 24/09. Je le dis plutôt que de les présenter comme neufs.

## TEST_AFTER_PASS

```
RÉSULTAT MODULE DEMANDE V2 : 183 PASS / 0 FAIL
suite complète : 21 fichiers, 0 FAIL
```

## BROWSER_E2E

Preview réelle, onglet propre, stockage vidé entre chaque cas. Scénario exact demandé à chaque fois :
brouillon `Devis Plomberie / Réparation` posé sur l'appareil, retour à l'accueil, clic sur le CTA.

| clic (avec ancien brouillon) | ce que le client lit | après le bouton principal |
|---|---|---|
| **Entretien chaudière** | « Démarrer Entretien de chaudière » / « Continuer : Devis Plomberie » | `intervention`, famille `chauffage`, **intention `entretien`**, étape `lieu` |
| **Ramonage** | « Démarrer Ramonage » / « Continuer : Devis Plomberie » | `devis`, **intention `ramonage`**, métier Chauffage, nature Entretien, description ramonage, étape `dv-projet` |
| **Poêle ou insert** | « Démarrer Entretien de poêle ou d'insert » / « Continuer : Devis Plomberie » | `devis`, **intention `poele-insert`**, métier Chauffage, nature Entretien, description poêle |

Dans les trois cas : `Plomberie` ne revient pas dans les métiers — aucun retour automatique.

Déjà prouvé le 24/09 et inchangé : sans brouillon les trois CTA appliquent directement leur
intention (aucun écran intermédiaire) ; « Continuer » garde le brouillon Plomberie intact ; le
rechargement conserve intention, métier, nature et description ; le retour arrière puis la
réouverture du tunnel les conservent aussi.

**Mobile 390** : carte empilée, boutons pleine largeur, le libellé le plus long tient sur deux
lignes, débordement horizontal **0 px**. Le clic y donne le même résultat qu'en 1440.

## SCREENSHOTS

Captures prises sur la preview pendant la vérification (1440 avant/après, 390 après). Elles ne sont
pas versées au dépôt : il est public, et ces captures montrent l'état d'un appareil de test. Les
mesures correspondantes sont dans le tableau ci-dessus, reproductibles avec le scénario décrit.

## État local / session (sans donnée personnelle)

Après « Démarrer Ramonage » sur un ancien devis Plomberie :

```
localStorage hc_demande_v2   : { mode: "devis", focus: "ramonage", step: "dv-projet",
                                 devis: { metiers: ["Chauffage"], nature: "Entretien" } }
sessionStorage …_pii         : { desc: "Ramonage : cheminée, conduit ou poêle…" }
```

L'intention est dans l'état **durable** (`focus`), pas seulement dans la description, qui est une
donnée personnelle et s'efface au bout de 2 h.

## SHA

`b406e611` — branche `recette`. Rien sur `main`. Paiement non touché.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/ — bandeau « Entretien et ramonage :
préparez votre chauffage », assets en `?v=20260925b`.

## ROLLBACK

`git revert` des deux commits du jour sur le tunnel, puis `node scripts/bump-module-version.mjs`.
L'écran redevient générique — c'est l'état d'avant, pas une page cassée. Aucune donnée, aucun prix,
aucun paiement n'est touché.

## NEXT_ACTION

Rien n'est en attente sur ce point. Le sujet suivant est ouvert depuis le 12 août : les deux
`a_corriger` MENUISERIE de Florian (« il y a pas mal de bugs, il faut tout tester » et
« doublons »), jamais traités.
