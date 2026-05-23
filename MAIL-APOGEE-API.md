# Mail à envoyer au support Apogée

**Destinataire suggéré** : support technique Apogée (ou ton interlocuteur siège Help Confort si l'accès API passe par eux)
**Objet** : Demande d'accès API Apogée — Franchise HELP Confort Saint-Omer / Dunkerque (Florian Dhaillecourt)

---

Bonjour,

Je suis Florian Dhaillecourt, dirigeant des franchises **HELP Confort Saint-Omer (62500)** et **HELP Confort Dunkerque (59140)**.

Dans le cadre de la digitalisation de nos agences (site `depan59-62.fr`, présence Facebook / Instagram / Google Business Profile, dashboard de pilotage interne), nous souhaitons **automatiser la valorisation de nos interventions terminées** sur nos canaux de communication.

Le principe : dès qu'un de nos techniciens clôture une intervention dans Apogée et y associe des photos avant/après, nous générons automatiquement un brouillon de publication réseaux sociaux + site web, que je n'ai plus qu'à valider en un clic. Ce gain de temps est crucial pour maintenir une production de contenu régulière sans surcharger l'équipe administrative.

Pour mettre en place cette automatisation, **j'ai besoin d'un accès API en lecture seule** à mes données Apogée. Pouvez-vous me confirmer :

**1. Existence et conditions d'accès à l'API Apogée**
- Existe-t-il une API REST (ou autre protocole) exposant les données de mes franchises ?
- Quelles sont les conditions d'accès (coût éventuel, contrat à signer, validation siège) ?
- Faut-il passer par le siège Help Confort ou directement par votre support technique ?

**2. Données dont j'ai besoin (en lecture seule)**
- **Interventions** : liste, statut, date de clôture, ville, métier (plomberie / chauffage / électricité / serrurerie / vitrerie / menuiserie / rénovation), technicien affecté, agence concernée
- **Photos** : photos avant/après associées à chaque intervention, avec leur URL ou contenu binaire
- **Commentaires techniciens** : note libre saisie en fin d'intervention (sert à enrichir la publication)
- **Filtrage** : pouvoir requêter par agence (Saint-Omer / Dunkerque), par date, par statut

**3. Modalités techniques**
- URL de base de l'API (production)
- Méthode d'authentification (clé API, OAuth 2.0, JWT, autre ?)
- Format des réponses (JSON, XML)
- Documentation des endpoints (Swagger / OpenAPI / PDF)
- Limites de débit (rate limiting) éventuelles
- Existe-t-il un environnement de **sandbox** pour tester avant la production ?

**4. Webhooks (idéal mais optionnel)**
- Apogée peut-il déclencher un webhook HTTP POST vers une URL de mon choix à chaque clôture d'intervention ? (Cela éviterait le polling régulier et serait plus efficace.)

**5. RGPD et sécurité**
- Quelles sont les recommandations Apogée pour stocker / traiter les données clients récupérées via API (notamment les photos d'intervention chez le client) ?
- Y a-t-il une charte ou un contrat de sous-traitance à signer ?

Mon prestataire technique (dashboard interne sur `depan59-62.fr/admin-pro`) se chargera de l'intégration. Il a besoin de ces informations pour évaluer le périmètre et planifier le développement.

Je reste disponible pour un échange téléphonique si cela facilite vos réponses. Mon objectif est de déployer cette automatisation dans le **trimestre en cours**.

Merci par avance pour votre retour.

Cordialement,

**Florian Dhaillecourt**
Dirigeant — HELP Confort Saint-Omer & Dunkerque
☎ 03 66 10 01 34
✉ florian.dhaillecourt@helpconfort.com
🌐 [depan59-62.fr](https://depan59-62.fr)

---

## Notes pour toi (à ne pas envoyer)

- Si Apogée renvoie vers le siège HC : transmets le mail à ton interlocuteur réseau habituel
- Si l'API est payante, demande un devis avant validation
- Si pas d'API REST disponible : demander si un **export CSV/Excel automatisable** ou un **accès base de données en lecture seule** est envisageable (plan B)
- Délai de réponse réaliste : 2-4 semaines (édition logicielle métier, pas une startup)
- Une fois les infos reçues → me les transmettre, je m'occupe du reste
