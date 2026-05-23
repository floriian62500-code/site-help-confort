# Mail à Hugo (Apogée — comité de dév)

**Destinataire** : Hugo
**Objet** : API Apogée — proposition d'évolution + besoin opérationnel

---

Salut Hugo,

Au titre du comité de développement, je remonte un besoin concret qui pourrait intéresser pas mal de franchisés au-delà de mes deux agences.

**Le besoin** : automatiser la valorisation des interventions terminées vers nos canaux de communication (Facebook, Instagram, Google Business, site web). Aujourd'hui, mes techniciens clôturent leurs interventions dans Apogée avec photos avant/après et commentaire — mais 80% de ce contenu reste enfermé dans le CRM. On perd un atout commercial énorme.

**La cible** : dès qu'une intervention passe en "terminée" avec photos, mon dashboard externe (`depan59-62.fr/admin-pro`) génère automatiquement un brouillon de publication enrichi par IA (titre, description, métier, hashtags). Je valide en un clic, ça part sur tous les canaux. Les autres franchisés bénéficieraient de la même mécanique sans rien développer de leur côté.

**Ce qu'il me faut côté Apogée** :

1. **Accès API lecture seule** sur mes 2 agences (Saint-Omer + Dunkerque), endpoints `/interventions` et `/photos` au minimum
2. **Filtrage** : par agence, par statut, par date de clôture
3. **Champs nécessaires** : id intervention, date_cloture, ville, métier, technicien, commentaire libre, URLs photos avant/après
4. **Auth** : clé API ou OAuth, peu importe, à voir avec votre archi
5. **Webhook** (idéalement) : push sur une URL de mon choix quand statut → "terminée". Évite le polling, plus propre pour vos serveurs aussi
6. **Sandbox** pour que mon prestataire teste avant prod

**Mon angle pour le comité** : c'est une feature qui peut devenir un argument commercial fort pour Apogée vs concurrence (gestion x communication intégrée). Je peux porter le sujet au prochain comité avec un retour d'expérience une fois pilote validé chez moi.

**Délai souhaité** : pilote opérationnel sur Saint-Omer dans le trimestre. Si l'API existe déjà : on branche tout de suite. Si elle est en roadmap : dis-moi où elle est et si je peux booster sa priorité via le comité.

Un point téléphone si plus simple : 03 66 10 01 34.

Merci,

**Florian**
HELP Confort Saint-Omer & Dunkerque · Comité dév Apogée
✉ florian.dhaillecourt@helpconfort.com
🌐 [depan59-62.fr](https://depan59-62.fr)
