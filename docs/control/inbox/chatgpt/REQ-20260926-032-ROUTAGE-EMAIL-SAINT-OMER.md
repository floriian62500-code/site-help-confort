# REQ-20260926-032 — Routage des demandes vers la boîte Saint-Omer

Décision Florian : toutes les demandes internes générées par le site doivent arriver sur la boîte générique Saint-Omer, et non sur une boîte personnelle.

Adresse cible : saint-omer@helpconfort.com

À auditer :
- contact / devis ;
- demandes métier ;
- rappel ;
- tunnel ;
- abandons internes ;
- notifications liées aux achats/paiements destinées à l'agence ;
- notify-lead et notify-lead-v6 ;
- configuration notification_emails et éventuels fallbacks.

Règles :
- destinataire interne principal = saint-omer@helpconfort.com ;
- aucun destinataire personnel Florian dans to/cc/bcc pour ces demandes ;
- ne pas modifier les emails clients ;
- conserver reply_to client si utile ;
- ne pas toucher aux autres paramètres sans rapport.

Avant toute correction, vérifier la configuration réellement déployée.
Retour attendu : cause, flux audités, avant/après destinataires, fichiers/config touchés, tests, état déployé, rollback, preuve d'absence de mutation hors périmètre.

Ne pas marquer CLOSED.