# Audit UX — Module Réalisations Back-Office

Audit réalisé après la mise en place fonctionnelle du module (Phase 1).
Méthode : analyse du flow de création chantier + des filtres + de la cohérence dashboard.

---

## 🔴 Priorité 1 — Corriger maintenant (impact majeur, effort faible)

### 1. Champ "Ville" en saisie libre = bombe à retardement
**Problème** : aujourd'hui, Ville est un `<input type="text">` avec autocomplete. Un utilisateur peut taper "Saint-Omer", "saint omer", "St Omer", "St-Omer". Conséquences :
- Les filtres ville du back-office ne marchent plus
- Les filtres ville du site public ne marchent plus
- Le SEO local est dilué (pas de regroupement propre)

**Fix** : remplacer par un `<select>` rigide avec une liste fermée (10 villes principales) + une option "Autre" qui ouvre un champ libre seulement à ce moment. Liste : Saint-Omer, Arques, Longuenesse, Tatinghem, Wizernes, Blendecques, Dunkerque, Grande-Synthe, Coudekerque-Branche, Calais, Boulogne-sur-Mer.

### 2. Checkboxes de publication multi-canal qui mentent
**Problème** : 5 checkboxes (Site / Facebook / Instagram / LinkedIn / GBP) cochables, **mais aucune API n'est branchée**. L'utilisateur coche "Facebook" → rien ne se passe. Effet "outil cassé".

**Fix** : désactiver visuellement les canaux non configurés avec un badge "Bientôt" et un tooltip "Configurez l'API dans Paramètres". Seul Site reste actif. Quand une API est connectée, on réactive la checkbox.

### 3. Champ "Agence" manquant
**Problème** : on a Métier + Ville + Technicien, mais pas l'agence (Dépan'Audo Saint-Omer ou Dépan'DK Dunkerque) — pourtant c'est un pilier de l'identité.

**Fix** : ajout d'un champ "Agence" auto-déduit de la ville (Saint-Omer/Arques/Longuenesse/Tatinghem → Dépan'Audo · Dunkerque/Grande-Synthe → Dépan'DK), modifiable manuellement si chantier croisé.

---

## 🟡 Priorité 2 — Optimisations claires (impact réel)

### 4. Photos non obligatoires alors qu'elles font 90% de la valeur
Aucune photo = aucune raison de publier. **Fix** : valider qu'au moins 1 photo (avant OU après) est uploadée avant de pouvoir mettre en "Publié". Si statut = brouillon, on autorise sans photo.

### 5. Métiers tronqués
**Problème** : le select propose 7 métiers, le site public en affiche 11. Manquent : **Menuiserie**, **Volets**, **Adaptation PMR**, **Plâtrerie**.

**Fix** : aligner la liste sur le site public.

### 6. Distinction "Description courte" vs "Description longue" floue
**Problème** : l'utilisateur ne sait pas où chaque texte est utilisé. Risque de doublon ou d'oubli.

**Fix** : étiquettes explicites + compteur de caractères :
- *Description courte* (50-200 car) → "Affichée sur la grille + feed social"
- *Description longue* (300+ car) → "Affichée sur la page détail + utilisée pour le SEO Google"

### 7. Filtre Ville en valeurs hardcodées
**Problème** : le filtre du toolbar liste 4 villes hardcodées. Si tu ajoutes un chantier à "Calais", il n'apparaîtra pas dans le filtre.

**Fix** : peupler dynamiquement le `<select>` filtre avec les villes présentes en BDD (`distinct ville from realisations`).

---

## 🟢 Priorité 3 — Qualité de vie (impact secondaire)

### 8. Raccourcis clavier manquants
- `Cmd/Ctrl + S` → Enregistrer dans la modale
- `Cmd/Ctrl + N` → Nouveau chantier depuis la liste
- `/` → focus sur la recherche

### 9. Compression : feedback utilisateur absent
Une photo de 8 Mo → 280 Ko, mais l'utilisateur n'en voit rien. **Fix** : afficher "Photo compressée : 8.2 Mo → 281 Ko (×30)" dans le toast.

### 10. Pas de bouton "Dupliquer"
Pour Help! Confort qui fait des chantiers répétitifs (remplacement mitigeur, dépannage chauffe-eau), un bouton "Dupliquer" sur la fiche éviterait de tout retaper.

### 11. Workflow "À valider" inutile en single-user
Le statut intermédiaire "validation" n'a de sens qu'avec plusieurs utilisateurs (un commercial saisit → admin valide → publie). En solo, c'est un clic perdu. **Fix** : si un seul utilisateur, masquer ce statut et garder uniquement Brouillon / Publié.

---

## 🔵 Priorité 4 — Plus tard, dépend des intégrations

### 12. Autosave brouillon
Quand on remplit la modale, si on ferme par erreur, tout est perdu. En usage terrain (mobile, interruptions), c'est risqué. **Fix** : sauver localStorage toutes les 5s en mode brouillon.

### 13. Pas de page détail publique pour les chantiers Supabase
Les anciens chantiers JSON pointaient vers `actualites/{date-slug}.html`. Les chantiers Supabase pointent vers `realisation/{slug}.html` qui n'existe pas encore — il faudra créer une page de détail dynamique (peut être une seule page `realisation.html?slug=xxx` qui lit Supabase).

### 14. Pas de gestion des photos extras (galerie)
Le schéma BDD a `images_extras jsonb default '[]'` mais l'UI n'expose que les 2 zones avant/après. Pour les gros chantiers (rénovation salle de bain), on aimerait pouvoir uploader 5-10 photos.

---

## 📊 Frictions identifiées sur le Dashboard

### 15. Bouton "Nouvelle publication" en haut sans action
Le bouton bleu en haut à droite du dashboard ne fait rien. **Fix** : le brancher sur `realisations.html?action=new` ou ouvrir un menu déroulant (Chantier / Post / Avis).

### 16. Pages secondaires vides (Médiathèque, Publications, Social, IA, Avis, Analytics, Users, Settings, Alerts)
9 pages sont des coquilles vides. **Fix** : ajouter un bandeau "Module en développement — Phase X" sur chacune avec un lien GitHub Issues ou une roadmap visuelle, pour ne pas frustrer.

### 17. Sélecteur "7 derniers jours" non fonctionnel
Le `<select>` de plage temporelle en haut du dashboard est décoratif. **Fix** : soit le brancher (filtrer les stats par période), soit le retirer en attendant.

---

## ✅ Ce qui marche bien

- Visuel global premium, cohérence Linear/Stripe
- Sidebar dark navy lisible
- Modal édition propre (header / body scroll / footer fixe)
- Upload drag-drop fluide
- Compression WebP transparente
- Toasts succincts
- Vue grille/tableau bien différenciée
- Page publique avec fallback JSON (résilience si Supabase down)

---

## 🎯 Recommandation : ordre d'attaque suggéré

1. **Maintenant** (15 min) : exécuter le seed SQL, tester l'upload, valider la chaîne complète
2. **Puis** (1h) : Priorités 1 → ville select rigide + checkboxes canaux honnêtes + champ agence
3. **Puis** (1h) : Priorités 2 → photos obligatoires si publié + métiers alignés + filtres dynamiques
4. **Puis** (2h) : Vague B → IA Claude (clé API requise)
5. **Plus tard** : Vague C (APIs externes), Vague D (analytics)
