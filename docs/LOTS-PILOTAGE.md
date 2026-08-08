# PILOTAGE PAR LOTS — SITE HELP CONFORT

> **Mission** : construire la meilleure machine à générer des **appels, demandes d'intervention et CA**.
> Chaque décision est évaluée par : « **Est-ce que cela aide un visiteur à devenir client ?** »
> Un lot n'est **TERMINÉ** que si Développement + Recette + Préproduction + Production sont validés.
> On ne passe pas au lot suivant tant que le précédent n'est pas **stabilisé**.

---

## LOT 1 — Capture de leads  ◀ EN COURS
**Objectif métier** : permettre à un visiteur de faire une demande (appel, intervention, devis) **sans abandon**, et garantir que le lead arrive **réellement** à l'agence.

**Critères de réussite**
✔ un lead créé · ✔ un seul · ✔ notification agence reçue · ✔ accusé client envoyé ·
✔ mobile OK · ✔ desktop OK · ✔ parcours < 2 min · ✔ 0 erreur console · ✔ 0 donnée perdue · ✔ 0 PII exposée

**Périmètre** : Contact · Wizard urgence · Devis express · Validation serveur `form_type` · Notification v6 · Accusé · Tracking · PII

**État**
- Développement ✅
- Recette ✅ (contact, wizard, notification, sécurité) · 🟡 (branches réseau/serveur, tracking à revérifier)
- Préproduction ⬜
- Production ⬜

**Bloquant** : déploiement (Netlify Draft → prod, `submit-lead` v6, chaîne photo).

---

## LOT 2 — Pages métiers premium & conversion
**Objectif métier** : transformer le trafic SEO des pages métiers/villes en demandes (CTA clairs, preuves, zones).
**Critères** : CTA évident · téléphone visible · formulaire accessible · preuves (avis/réalisations) · zone d'intervention · différenciation · 0 contenu vide.
**État** : Dev ✅ · Rec 🟡 (gabarits home/métier/prestation console OK) · Préprod ⬜ · Prod ⬜

## LOT 3 — Dashboard (pilotage du site)
**Objectif métier** : traiter les leads vite et piloter contenus/avis/SEO — sans devenir un CRM.
**Critères** : login sûr · leads lisibles + actions rapides · permissions justes · 0 donnée exposée.
**État** : Dev — · Rec ⬜ (compte RECETTE préparé, non créé) · Préprod ⬜ · Prod ⬜

## LOT 4 — SEO local & performance
**Objectif métier** : capter la recherche locale (plombier + ville) et charger vite (conversion mobile).
**Critères** : schema.org · sitemap · canonical · Lighthouse/CWV · pages villes riches.
**État** : Dev 🟡 · Rec ⬜ · Préprod ⬜ · Prod ⬜

---

# AUDIT CRITIQUE — LOT 1 (posture Directeur Produit / Growth)

Chaque point : **problème → conséquence conversion → proposition → priorité → décision**.

### 🔴 P1 — Le wizard met « Confirmer & payer en ligne » comme action principale
- **Conséquence** : pour un **dépannage**, exiger un paiement en ligne en fin de parcours **fait fuir** le visiteur qui veut d'abord être rappelé. Frein majeur à la conversion.
- **Proposition** : action principale = **« Être rappelé gratuitement »** (crée le lead) ; le paiement en ligne devient **secondaire/optionnel**, réservé aux prestations à prix fixe. Le lead ne dépend jamais du paiement.
- **Aide à convertir ?** OUI (fort). **Décision** : commerciale (HELP CONFORT veut-il le paiement upfront ?) → **à valider**.

### 🟠 P2 — Wizard en 4 étapes pour une urgence
- **Conséquence** : un client stressé veut aller vite (< 2 min). 4 étapes = friction/abandon.
- **Proposition** : chemin urgence **raccourci** (besoin + tél + description) ; bouton **Appeler** toujours visible en haut du wizard. Garder le parcours long pour devis/travaux.
- **Aide à convertir ?** OUI. **Priorité** : prochain lot / intégrable sans risque.

### 🟠 P2 — Formulaire contact : adresse complète exigée dès le 1er contact
- **Conséquence** : plus de champs = moins de complétions. L'adresse précise n'est pas nécessaire pour rappeler.
- **Proposition** : proposer un mode **« Être rappelé »** (nom + tél + besoin) via `form_type=rappel`, l'adresse complète étant collectée à l'appel. Le contrat serveur `rappel` existe déjà.
- **Aide à convertir ?** OUI. **Priorité** : prochain lot.

### 🟢 Améliorations conversion / rassurance (à intégrer sans risque)
- **Confirmation client** : ajouter un **SMS** de confirmation (en plus de l'email) → rassure, réduit le no-show. *Automatisable (Twilio backlog).* Décision coût.
- **Réassurance temps réel** : afficher « rappel sous 30 min en heures ouvrées » **près du bouton d'envoi** (déjà dans l'accusé, pas assez visible avant l'envoi).
- **Preuve** : afficher le nombre de demandes traitées / avis **au-dessus** du formulaire (déjà présent, à renforcer).

### 🗑️ À supprimer / simplifier (inutile pour convertir)
- Le **paiement Stripe dans le wizard urgence** (prix « à diagnostiquer » → fallback contact) ajoute de la complexité pour peu de valeur sur un dépannage → à retirer du parcours urgence (garder pour prestations forfaitaires uniquement). *Lié au P1.*

**Synthèse LOT 1** : le parcours **fonctionne** (lead créé, notifié) mais **n'est pas optimisé pour convertir** : le paiement-first et la longueur sont les 2 premiers freins. Décision commerciale attendue sur le paiement-first ; le reste est intégrable au fil des lots.
