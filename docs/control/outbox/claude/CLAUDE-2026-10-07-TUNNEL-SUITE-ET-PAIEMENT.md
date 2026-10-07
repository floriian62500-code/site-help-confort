# Tunnel — suite, et l'inventaire paiement demandé

Base `main` `ccb17e9f`. Branche `feat/tunnel-ma-demande`, toujours sans PR : le blocage de
décision sur l'accueil reste ouvert.

## Inventaire paiement — demandé par le message du 2026-10-07

Hors documentation, voici **le code vivant** qui appelle ces fonctions.

| fonction | fichiers du site | déployée |
|---|---|---|
| `stripe-create-payment-link` | **`index.html`**, **`assets/hc-reserve-modal.js`**, `admin-pro/interventions.html`, `admin-pro/paiements.html` | **oui, active** |
| `stripe-webhook` | aucun fichier du site (documentation et tests seulement) | **oui, active** |
| `create-payment-session` | aucun fichier de `main`. Ma branche l'apporte avec `assets/hc-demande.js`, **sous verrou** | **non déployée** |

Deux points à verser au dossier architecture, sans aucune mutation de ma part :

1. **Le montant vient du navigateur.** `assets/hc-reserve-modal.js` envoie
   `{ amount_eur, description }` au serveur. C'est exactement ce que l'architecture cible que vous
   décrivez écarte (prix fixé côté serveur, Checkout hébergé, webhook de confirmation).
2. **La fonction est déployée avec `verify_jwt` désactivé.** Les deux fichiers portent par ailleurs
   l'ancienne clé anon en clair, celle qui a été révoquée : elle ne protège donc rien, et ne
   bloquerait rien non plus.

Côté tunnel, le verrou est explicite : `PAIEMENT_ACTIF = false`. Le module se comporte comme si le
serveur répondait « indisponible », même si `create-payment-session` était déployée un jour.
Les points d'accroche pour la future instrumentation existent déjà dans le module (états du
parcours, identifiant de demande, prestation choisie, succès/abandon) : rien n'est branché.

## Avancement des suites

```
                    avant      maintenant
demande-v2          180/10     187 PASS /  3 FAIL   (3 = la décision sur l'accueil)
catalogue-public      5/1        6 PASS /  0 FAIL
price-gate           29/0       29 PASS /  0 FAIL
hc-cart              12/0       12 PASS /  0 FAIL
consent               2/6        8 PASS /  0 FAIL
anti-double-envoi     9/3       12 PASS /  0 FAIL
intention-unique     14/11      14 PASS / 11 FAIL
```

**Consentement.** Le bandeau prend une forme compacte sur téléphone, publie sa hauteur en
`--hc-consent-h`, et fait place nette des barres d'action collées en bas tant qu'il s'affiche.
Surtout : **65 pages demandaient `assets/hc-consent.js` sans version**. Le fichier est servi avec un
cache long — un visiteur gardait l'ancien bandeau même après correction. C'est la **troisième fois**
que ce piège se présente (en-tête, encart, bandeau) ; les trois sont désormais couverts par une
garde. `prestations/ramonage.html` et `maprimeadapt.html` n'avaient aucun bandeau, et
`maprimeadapt.html` chargeait quand même `tracking.js`.

**Double envoi.** Le verrou existait déjà sur les deux boutons de l'accueil. Les trois assertions
exigeaient une écriture précise — une variable nommée `btn`, sans espaces — alors que les boutons
s'appellent `sendComplex` et `payBtn`. Elles vérifient maintenant le comportement. Et l'ancienne
assertion « verrou posé avant l'appel » comparait des positions dans le texte : or la fonction qui
appelle `submit-lead-v6` est déclarée **avant** les gestionnaires qui l'utilisent. J'ai vérifié que
la garde mord encore : en retirant le verrou de l'accueil, elle repasse à 11/1.

## Reste

`intention-unique` (14/11) : les pages métier doivent renvoyer vers les contrats et ouvrir
l'entretien sans vendre, et aucune page hors canonique ne doit afficher un prix de contrat en HT.
Ce point **croise la tâche 3** (Contrats Chauffage, source tarifaire canonique, affichage TTC) :
je le traite avec elle plutôt que deux fois.

Et toujours ouvert : **quel parcours reçoit les visiteurs depuis l'accueil** (REQ-051).
