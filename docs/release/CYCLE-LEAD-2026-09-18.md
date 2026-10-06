# Cycle commercial d'un lead — accès aux tarifs, finalisation, abandon, CRM (18/09/2026)

Directives 5713150094 / 5713186419 + réserve tarifaire. **Recette uniquement** : le code est poussé, le déploiement des fonctions serveur reste un geste humain (voir « Gates »).

## 1. Ce qui changeait de comportement (constaté sur les captures de Florian)
| Constat | Cause | Correction |
|---|---|---|
| L'agence recevait « NOUVEAU LEAD » et le client « votre demande a bien été reçue » **dès le clic « Afficher les tarifs »** | `submit-lead-v6` notifiait à chaque enregistrement | l'accès aux tarifs crée une **intention silencieuse** (`status=intent`) : aucune notification, aucun accusé de réception |
| Lead nommé « Florian Florian » | le serveur recopiait le prénom dans le nom quand le nom était vide, et le tunnel ne demandait pas le nom | champ **Nom obligatoire** à l'étape tarifs + `nom: nom || null` côté serveur |
| Risque de doublon entre l'accès aux tarifs et la demande finale | aucun lien entre les deux envois | **référence de corrélation** : la finalisation met à jour le même dossier (`reused: true`) |
| Aucune relance des visiteurs qui laissent leurs coordonnées sans finaliser | rien n'existait | `leads-abandon-sweep` : après **15 min** d'inactivité, **une seule** alerte interne « Demande non finalisée » |
| Emails : « rappel sous 30 minutes », « 7j/7 », signature « Saint-Omer & Dunkerque » | contenu non aligné sur la réalité | rappel **sous 24 h ouvrées**, horaires réels (lun–ven 9h–17h, sam 9h–16h), **une seule agence physique** (Saint-Omer), message adapté au type réel de demande |
| Prix affiché perçu comme intangible | aucune réserve | **réserve tarifaire** sur le récapitulatif, l'étape tarifs, la confirmation, le message transmis à l'agence et les deux emails |

## 2. Cycle en place
```
Afficher les tarifs → intention (status=intent, crm_status=pending)   … aucun email
   ├─ le client finalise → MÊME dossier : status=nouveau, finalized_at
   │        → 1 notification agence + 1 accusé de réception client
   └─ le client abandonne → après 15 min d'inactivité : status=needs_followup
            → 1 alerte interne « Demande non finalisée » (jamais deux, jamais au client)
               puis s'il revient et finalise : même dossier, abandon clôturé
```

## 3. Preuves (stack Supabase local isolé, aucun email réel, aucune PROD)
`bash scripts/test/start-e2e-local.sh` — scénarios `CYCLE_A` à `CYCLE_F` :
- A : intention enregistrée, statut et horodatage corrects, **accusé de réception refusé** (`intent_not_finalized`), prénom et nom distincts en base ;
- B : finalisation → **même identifiant de dossier** (`reused: true`), `finalized_at` posé ;
- C : intention inactive 30 min → sweep → **1 alerte**, statut `needs_followup` ; second passage → **0 alerte** ;
- D : reprise après abandon → **même dossier**, aucun doublon ;
- E : plus aucune alerte après finalisation ;
- F : CRM Apogée → `blocked: missing_credentials`, file d'attente non vide (aucun faux succès).

Suites statiques : `scripts/tests/lead-cycle.test.mjs` (36 garanties : silence à l'accès tarifs, alerte unique, contenu des emails, réserve tarifaire, CRM sans secret inventé).

## 4. Gates — ce qui demande un geste de Florian
Rien n'est déployé côté serveur : en production, le comportement actuel (2 emails dès l'accès aux tarifs) **reste inchangé** tant que les fonctions ne sont pas déployées.

```bash
# 1) fonctions (le cœur du lot)
supabase functions deploy submit-lead-v6 notify-lead-v6 lead-auto-reply leads-abandon-sweep --project-ref btcbjwqiivhpwoszomhg

# 2) relance d'abandon toutes les 5 minutes (à planifier une fois la fonction déployée)
#    pg_cron ou planificateur externe appelant :
#    POST https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/leads-abandon-sweep  {"minutes":15}

# 3) CRM Apogée — seulement quand l'éditeur fournit l'accès (voir docs/CRM-APOGEE-MAPPING.md)
supabase secrets set APOGEE_API_URL="…" APOGEE_API_KEY="…" --project-ref btcbjwqiivhpwoszomhg
supabase functions deploy crm-apogee-push --project-ref btcbjwqiivhpwoszomhg
```

Contrôle conseillé juste après le déploiement, avec une vraie adresse de test : accès aux tarifs → **aucun email** ; finalisation → **1 email agence + 1 email client** ; abandon → **1 alerte interne** après 15 min.
