# Tâches 1 et 2 — tunnel : avancement, un blocage de décision, et une PR trouvée en chemin

Base `main` `ccb17e9f`. PR #49 fermée : la #50 la remplace et est en production.

## PR #51 — la correction de la PR #48 n'atteint pas les visiteurs en cache

Trouvée en câblant le tunnel. **Même mécanique que le bandeau legacy, sur un autre fichier.**

```
assets/hc-promo-saison.js — empreinte réelle : c8359c48ef
                            version demandée : b54f8db069   ← périmée
                            Cache-Control     : 30 jours
```

La PR #48 a corrigé le script de l'encart sans relancer la synchronisation. Le HTML se recharge à
chaque visite, le script non : **un visiteur venu avant la PR #48 voit toujours « Poêle ou insert »
et son lien mort**, jusqu'à 30 jours. Le contrôle en navigateur neuf ne peut pas le voir.

Le lot remet les 204 pages sur la version réelle (une ligne par page) et **étend la garde
`topbar-legacy.test.mjs` à l'encart**, pour que ça n'arrive pas une troisième fois.
Jouée sur `main` telle quelle : 5 PASS / 1 FAIL, en nommant les 204 pages. Sur le lot : 6/0.

## Tunnel — où il en est

Branche `feat/tunnel-ma-demande`, toujours **sans PR**.

```
demande-v2        187 PASS /  3 FAIL     (c'étaient 180/10)
catalogue-public    6 PASS /  0 FAIL
price-gate         29 PASS /  0 FAIL
hc-cart            12 PASS /  0 FAIL
intention-unique   14 PASS / 11 FAIL
anti-double-envoi   9 PASS /  3 FAIL
consent             2 PASS /  6 FAIL
```

Fait depuis le dernier rapport :
- **verrou de paiement explicite** (`PAIEMENT_ACTIF = false`) : le tunnel se comporte comme si le
  serveur répondait « indisponible », même si `create-payment-session` était déployée un jour.
  L'activation redevient une décision, pas un effet de bord.
- `tracking.js` : garde d'environnement (aucune mesure hors `depan59-62.fr`) et `hcGtag` exposé
  seulement après le consentement.
- `nos-prestations.html` : plus de coordonnées en stockage durable, clé anti-doublon sans email ni
  téléphone en clair, « Effacer mes données » qui atteint sa fonction, « Autres prestations » au
  niveau des familles.

## Le blocage : l'accueil a déjà son propre tunnel

Les 3 échecs restants de `demande-v2` sont un seul sujet : l'accueil doit porter 3 CTA
(`hero_intervention`, `carte_intervention`, `carte_devis`) vers `/catalogue.html`.

Or **l'accueil de `main` a déjà son propre parcours de demande, en page** : 13 étapes
`hc-resa-step`, 24 cartes `mq-card`, et il appelle **directement** `submit-lead-v6` et
`upload-lead-photos`. Ce n'est pas un accueil auquel il manque une porte : c'est un second tunnel,
plus récent, avec une autre mise en forme (« Quel est votre besoin ? » au lieu de
« Que souhaitez-vous faire ? »).

Câbler les 3 CTA revient donc à décider lequel des deux parcours reçoit les visiteurs. Trois
chemins possibles :

- **A.** l'accueil garde son parcours en page, et le tunnel ne sert que depuis les pages métier ;
- **B.** l'accueil ouvre le tunnel (l'intention d'origine du module) et son parcours en page est retiré ;
- **C.** les deux coexistent avec des rôles distincts, à définir.

Je ne tranche pas. **Et l'accueil appelle aussi `stripe-create-payment-link`** — le point P1 déjà
signalé, un lien de paiement public dont le montant vient du client : il vit dans ce parcours-là.
Le choix a donc aussi un effet sur ce sujet.

## Ce que je fais ensuite, sans attendre

Les travaux restants du tunnel qui ne dépendent d'aucune décision : le bandeau de consentement
(`consent`, 2/6 — version datée sur 65 pages, hauteur publiée, pas de seconde barre) et le verrou
de double envoi (`anti-double-envoi`, 9/3). Puis la tâche 3, Contrats Chauffage.
