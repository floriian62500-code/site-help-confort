# RECETTE SITE HELP CONFORT — checklist vivante (document de référence)

**Règle** : une fonctionnalité n'est **TERMINÉE** que si les 4 étapes sont validées.
Tant qu'une manque → **en cours de validation**.

Légende par item : `Dev · Rec · Préprod · Prod` → ✅ validé · 🟡 partiel · ⬜ non fait
- **Dev** = développement terminé  · **Rec** = recette (tests réels) validée
- **Préprod** = validé sur Draft/staging · **Prod** = validé sur `depan59-62.fr`

> Rien n'est en Préprod/Prod aujourd'hui (aucun déploiement effectué depuis le 16/06).
> Donc **toutes** les lignes ci-dessous sont au mieux **« en cours de validation »**.

---

## FORMULAIRES & LEADS  (priorité 1 — perte de leads)
| Fonctionnalité | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Contact — envoi complet | ✅ | ✅ | ⬜ | ⬜ |
| Contact — CP invalide / erreurs par champ | ✅ | ✅ | ⬜ | ⬜ |
| Contact — anti double-clic | ✅ | ✅ | ⬜ | ⬜ |
| Wizard urgence — 1 lead + ville + await | ✅ | ✅ | ⬜ | ⬜ |
| Wizard — changement métier / retour | ✅ | ✅ | ⬜ | ⬜ |
| Wizard — double-clic | ✅ | ✅ | ⬜ | ⬜ |
| Wizard — récap final exact | ✅ | 🟡 | ⬜ | ⬜ |
| Wizard — erreur réseau / serveur | ✅ | ⬜ | ⬜ | ⬜ |
| Wizard — abandon puis reprise | 🟡 | ⬜ | ⬜ | ⬜ |
| Devis express → submit-lead | ✅ | ⬜ | ⬜ | ⬜ |
| Contrat entretien (redirection) | ✅ | ⬜ | ⬜ | ⬜ |
| Validation serveur par `form_type` (5 contrats) | ✅ | ✅(deno) | ⬜ | ⬜ |
| Notification agence (notify-lead v6) | ✅ | ✅ | ⬜ | ⬜ |
| Accusé réception client (lead-auto-reply) | ✅ | ✅ | ⬜ | ⬜ |
| Anti-doublon (1 lead / soumission) | ✅ | ✅ | ⬜ | ⬜ |
| Auto-archivage leads TEST RECETTE | ✅ | ⬜ | ⬜ | ⬜ |

## PHOTOS  (chaîne sécurisée)
| Fonctionnalité | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Edge Function upload-lead-photos (jeton, MIME réel, chemin serveur) | ✅ | ⬜ | ⬜ | ⬜ |
| Bucket privé lead-photos + migration | ✅(migr) | ⬜ | ⬜ | ⬜ |
| submit-lead renvoie jeton d'upload | ✅ | ⬜ | ⬜ | ⬜ |
| Câblage client (upload post-lead) | ✅ | ⬜ | ⬜ | ⬜ |
| UX échec partiel (« photos non jointes ») | ✅ | ⬜ | ⬜ | ⬜ |
| Tests 0/1/3 · trop lourd · format · réseau | ⬜ | ⬜ | ⬜ | ⬜ |

## PAGES (par gabarit)
| Gabarit | Dev | Rec console | Rec mobile | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|:--:|
| Home | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| Contact | ✅ | ✅ | 🟡 | ⬜ | ⬜ |
| Page métier (plombier) | ✅ | ✅ | 🟡 | ⬜ | ⬜ |
| Page prestation (chauffe-eau) | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| Gabarit guide | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| Gabarit actualité | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| Réalisations | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| Zones d'intervention | ✅ | ✅ | ⬜ | ⬜ | ⬜ |

## MOBILE (largeurs 320/360/375/390/412/430)
| Élément | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Header « Appeler » + logo | ✅ | ✅ | ⬜ | ⬜ |
| Hero 2 CTA visibles sans scroll | ✅ | ✅ | ⬜ | ⬜ |
| Wizard mobile | ✅ | 🟡 | ⬜ | ⬜ |
| Notification email mobile | ✅ | ✅ | ⬜ | ⬜ |
| Réalisations / tablette | ⬜ | ⬜ | ⬜ | ⬜ |

## SÉCURITÉ & DONNÉES PERSONNELLES
| Contrôle | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Leads/app_settings non lisibles anon (RLS) | — | ✅ | ⬜ | ⬜ |
| Aucune clé service_role côté front | — | ✅ | ⬜ | ⬜ |
| PII hors URL (purge + replaceState) | ✅ | ✅ | ⬜ | ⬜ |
| PII en sessionStorage uniquement (pas durable) | ✅ | ✅ | ⬜ | ⬜ |
| Honeypot + rate-limit (anti-spam) | ✅ | 🟡 | ⬜ | ⬜ |
| Upload photo : aucun accès anonyme direct | ✅ | ⬜ | ⬜ | ⬜ |
| Token GitHub en clair `.git/config` (à roter) | — | ⚠️ | — | — |

## SEO
| Contrôle | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Schema.org (FAQ/Breadcrumb/LocalBusiness) | ⬜ | ⬜ | ⬜ | ⬜ |
| Sitemap dynamique | ⬜ | ⬜ | ⬜ | ⬜ |
| Canonical | ⬜ | ⬜ | ⬜ | ⬜ |
| Redirections (_redirects) | ⬜ | ⬜ | ⬜ | ⬜ |
| Meta no-cache retiré (93 pages, perf+indexation) | ✅ | ✅ | ⬜ | ⬜ |
| Canonical présent (tous gabarits) | ✅ | ✅ | ⬜ | ⬜ |
| JSON-LD (LocalBusiness/Breadcrumb/Offer/FAQ) | ✅ | ✅ | ⬜ | ⬜ |
| Sitemap + robots (référencé) | ✅ | ✅ | ⬜ | ⬜ |
| og:title manquant sur contact.html | 🟡 | — | ⬜ | ⬜ |

## PERFORMANCE
| Contrôle | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Lighthouse | ⬜ | ⬜ | ⬜ | ⬜ |
| Core Web Vitals | ⬜ | ⬜ | ⬜ | ⬜ |

## DASHBOARD (55 pages — accès recette requis)
| Zone | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Login / logout / session | — | ⬜ | ⬜ | ⬜ |
| Leads | — | ⬜ | ⬜ | ⬜ |
| Publications | — | ⬜ | ⬜ | ⬜ |
| Avis | — | ⬜ | ⬜ | ⬜ |
| Contenus / Médias / Photos | — | ⬜ | ⬜ | ⬜ |
| Paiements | — | ⬜ | ⬜ | ⬜ |
| Permissions / rôles | — | ⬜ | ⬜ | ⬜ |
| Compte RECETTE (préparé, non créé) | ✅(spéc) | ⬜ | ⬜ | ⬜ |

## AUTOMATISATIONS (9 crons)
| Automatisation | Dev | Rec | Préprod | Prod |
|---|:--:|:--:|:--:|:--:|
| Notif lead / accusé | ✅ | ✅ | ⬜ | ⬜ |
| Sync avis / FB / GBP | — | ⬜ | ⬜ | ⬜ |
| Sitemap / IndexNow | — | ⬜ | ⬜ | ⬜ |
| Health-check / smoke-tests | — | ⬜ | ⬜ | ⬜ |

## DÉPLOIEMENT (lot de stabilisation)
| Étape | Statut |
|---|:--:|
| Runbook + rollback (`DEPLOY-LOT-STABILISATION.md`) | ✅ prêt |
| Netlify Draft | ⬜ (token) |
| Production | ⬜ |

---
*Mise à jour à chaque passe. Aucune ligne ne passe « TERMINÉE » sans Dev+Rec+Préprod+Prod.*
