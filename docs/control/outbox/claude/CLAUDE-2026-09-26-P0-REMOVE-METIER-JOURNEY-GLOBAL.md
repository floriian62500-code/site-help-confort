# Module « parcours » retiré des pages métier — réponse à CHATGPT-2026-09-26-P0-REMOVE-METIER-JOURNEY-GLOBAL

run : 2026-09-26 · branche `recette` · aucune mise en production

## ROOT_CAUSE

Ce bloc n'était pas un composant, c'était une **recopie**. Les sept pages le portaient à l'octet
près — 2 901 octets, même empreinte sur les sept — avec son propre `<style>` embarqué dans la
section. Rien ne le centralisait : ni `assets/`, ni `partials/`, ni un script.

C'est ce qui explique la remarque de Florian (« ce point avait déjà été demandé ») : un composant
partagé se retire une fois ; une recopie se retire autant de fois qu'elle a été collée, et il
suffit d'en oublier une pour que la demande semble non traitée. La correction précédente a porté
sur ce qui était sous les yeux, pas sur les sept exemplaires.

Deuxième cause, la même qu'hier sur les contrats : **aucun contrôle n'interdisait le retour du
bloc.** C'est corrigé ici (voir TESTS) — la garde est ce qui distingue « retiré » de « retiré pour
de bon ».

## GLOBAL_OCCURRENCES_BEFORE

Balayage des **264 pages HTML** du dépôt (hors `docs/`, `scripts/`, `supabase/`), état `042d3171` :

| motif | occurrences | fichiers |
|---|---|---|
| `hc-metier-journey` | 119 | 7 |
| `hmj-title` | 14 | 7 |
| `hmj-num` | 56 | 7 |
| `hmj-lbl` | 56 | 7 |
| `hmj-steps` | 63 | 7 |
| « Voici comment ça se passe une fois votre demande envoyée » | 7 | 7 |

## PAGES_CHANGED

Les sept pages métier qui le portaient — toutes Saint-Omer :

`chauffagiste-saint-omer.html` · `electricien-saint-omer.html` · `menuisier-saint-omer.html` ·
`plombier-saint-omer.html` · `serrurier-saint-omer.html` · `travaux-saint-omer.html` ·
`vitrier-saint-omer.html`

−2 901 octets chacune. La demande citait aussi volets, PMR et dépannage : ces pages existent (le
corpus métier en compte 44) mais **ne portaient pas le module** — vérifié, pas supposé.

Sur les sept, le bloc était placé entre la FAQ et le footer. La FAQ remonte donc au contact de la
bande de réassurance, qui touche le footer : c'est l'enchaînement d'origine de ces pages.

## GLOBAL_OCCURRENCES_AFTER

**0 occurrence** des six motifs sur les 264 pages. Hors pages : une seule mention subsiste dans le
dépôt, le fichier d'instruction lui-même
(`docs/control/inbox/chatgpt/CHATGPT-2026-09-26-P0-REMOVE-METIER-JOURNEY-GLOBAL.md`), ce que la
règle de validation autorise explicitement.

**Un cas voisin reste en place, et c'est délibéré.** `contact.html` porte un autre composant :
`hc-contact-journey` / `hcj-*`, titre plus court (« Voici comment ça se passe »), placé juste après
le formulaire de contact — mêmes cinq étapes, même date d'apparition (2026-07-25). Il n'est visé ni
par les motifs de la règle de validation, ni par le périmètre « pages métier ». Je ne supprime pas
un bloc sur une page non nommée sans décision : **question ouverte pour Florian — faut-il le
retirer aussi ?** Si oui, c'est deux minutes et le même contrôle.

## CSS_JS_CLEANUP

**JS : aucun.** Le module n'en avait pas.

**CSS : supprimé avec le bloc**, parce qu'il vivait dedans. Toutes ses règles étaient préfixées
`.hc-metier-journey` (`.hmj-title`, `.hmj-steps`, `.hmj-num`, `.hmj-lbl`, plus deux requêtes média
à 720 px et 480 px) : aucune n'était partageable, aucune ne visait un élément extérieur.

Preuves avant suppression, dans l'ordre exigé (« ne pas supprimer un style partagé ») :

- aucune mention de `hmj-` ou `hc-metier-journey` dans `assets/`, `scripts/`, `partials/`,
  `data/` — recherche faite, résultat vide ;
- aucune autre page du site ne portait ces classes ;
- aucune ancre du site ne pointait vers le module (`#parcours`, `#journey`,
  `#comment-ca-se-passe`) : 0 fichier ;
- le bloc était délimité sans ambiguïté — commentaire d'ouverture, `<section>`, `</section>`,
  suivi immédiatement du `<footer>` sur les sept pages.

## TESTS

Suite complète rejouée sur le SHA final, comme la CI la joue : **28 suites, 724 contrôles, 0
échec**. Garde-fous SEO `ERRORS=0`, en-tête unique et entité JSON-LD inchangés, inventaire strict
vert, hygiène du dépôt 10/10.

Deux contrôles ajoutés à `pages-metier` (6 → 8) :

1. **aucune trace du module sur les 208 pages publiques** — les six motifs, pas seulement la
   classe, et sur toutes les pages, pas seulement les pages métier : il est arrivé par recopie, il
   reviendrait par recopie ;
2. **aucun CSS ni JS partagé ne décrit encore ce module** — une règle orpheline est une invitation
   à recoller le bloc « puisque le style est déjà là ».

Une garde qui ne peut pas échouer ne garde rien : celle-ci a été **rejouée sur l'état d'avant la
suppression** (worktree détaché sur `042d3171`, même fichier de test). Elle échoue, code de sortie
1, et nomme les sept pages.

Contrôles visuels de la demande, mesurés sur la preview déployée :

| contrôle | 1440 | 390 |
|---|---|---|
| modules `hc-metier-journey` | 0 | 0 |
| vide entre la FAQ et la bande de réassurance | 0 px | 0 px |
| vide entre la bande et le footer | 0 px | 0 px |
| débordement horizontal | 0 | 0 |

Il n'y a donc pas de trou : entre la FAQ et le footer se trouve la bande de réassurance (Garantie
décennale · Labellisée · Techniciens salariés · Standard ouvert), haute de 83 px en desktop et de
231 px en mobile où elle s'empile. Hauteur de page sur Chauffage : 5 884 → **5 635 px** en 1440,
10 142 → **9 766 px** en 390.

## SCREENSHOTS_SAMPLE

Quatre pages contrôlées aux deux largeurs, comme demandé — Chauffage, Plomberie, Électricité,
Menuiserie :

- **1440** — la FAQ (« Vos questions sur la plomberie ») se termine par son lien « Voir toutes les
  questions fréquentes → », puis la bande sombre de réassurance, puis le footer. Aucune bande
  « Voici comment ça se passe », aucun espace vide, aucun débordement ;
- **390** — même enchaînement, la bande de réassurance passant en colonne (quatre lignes) ; la
  transition FAQ → bande → footer est continue, 0 px de vide de part et d'autre.

Captures prises pendant la vérification, non versées au dépôt : il est public. Les mesures
ci-dessus sont reproductibles avec le scénario décrit.

## SHA

`1fa6b647` sur `recette` (tête de branche, poussée).

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/plombier-saint-omer

Pages contrôlées : `/chauffagiste-saint-omer`, `/plombier-saint-omer`, `/electricien-saint-omer`,
`/menuisier-saint-omer`. Déploiement confirmé par le HTML servi (0 occurrence de
`hc-metier-journey`), pas par un code 200.

## ROLLBACK

```
git revert --no-commit 1fa6b647 && git commit
```

ou, pour ne reprendre que les pages :

```
git checkout 042d3171 -- chauffagiste-saint-omer.html electricien-saint-omer.html \
  menuisier-saint-omer.html plombier-saint-omer.html serrurier-saint-omer.html \
  travaux-saint-omer.html vitrier-saint-omer.html
```

Le style étant en ligne dans les pages, aucun cache d'asset à purger, aucun `?v=` à bumper.
Netlify redéploie la preview au push. Attention : le retour arrière **casserait la garde** ajoutée
à `pages-metier` — c'est voulu, elle dirait alors la vérité.

## NO_PROD_MUTATION_PROOF

- le commit n'existe que sur `recette` ; `origin/main` est resté sur `570225bf` (2026-09-25) ;
- fichiers touchés : 7 pages HTML et 1 fichier de test. **0** fichier sous `supabase/`, `assets/`,
  `.github/`, `netlify.toml` ou `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify ; le seul déploiement est la deploy preview automatique
  de `recette` ;
- aucun formulaire soumis pendant la vérification, aucune donnée client créée.

## Reste à traiter

`CHATGPT-2026-09-26-P0-REMOVE-CONTRATS-FINAL-CTA` (bloc « Une question avant de souscrire ? » en
fin de `/contrats-entretien.html`) : accusé réception, non commencé.

`NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO` reste la position pour la production : aucun merge vers
`main`, les cinq paquets de sécurité restent préparés et non déployés.
