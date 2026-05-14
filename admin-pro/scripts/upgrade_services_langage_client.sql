-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Refonte catalogue services en LANGAGE CLIENT
-- ═══════════════════════════════════════════════════════════════
--
-- OBJECTIF : Remplacer les intitulés techniques par des phrases
-- que le client tape réellement quand il a un problème.
--
-- AVANT (technique)        →  APRÈS (langage client)
-- ─────────────────────────────────────────────────────────────
-- "Mécanisme Geberit"       →  "Mon WC fuit ou ne s'arrête pas"
-- "Chauffe-eau 100L stéatite"→ "Plus d'eau chaude — Remplacement 100L"
--
-- 13 services existants reformulés + 6 prestations dépannage ajoutées
-- (débouchage, recherche fuite simple, déplacement diagnostic, etc.)
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1. UPDATE des 13 services existants — Langage client
-- ──────────────────────────────────────────────────────────────

update public.services set
  name      = 'Mon WC fuit — Remplacement mécanisme (WC suspendu)',
  short_desc= 'Chasse qui coule en continu ou bouton bloqué. Pose en 1 h, garantie 2 ans.'
where slug  = 'mecanisme-chasse-eau-standard';

update public.services set
  name      = 'Mon WC fuit — Remplacement mécanisme (WC au sol)',
  short_desc= 'Eau qui coule sans arrêt, bouton défaillant. Mécanisme premium, pose 1 h.'
where slug  = 'mecanisme-chasse-eau-wc-au-sol';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 100 L (gamme Éco)',
  short_desc= 'Pour 1-2 personnes. Remplacement avec dépose ancien + pose neuf.'
where slug  = 'chauffe-eau-100l-eco';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 100 L (anti-calcaire)',
  short_desc= 'Pour 1-2 personnes. Résistance protégée, idéal eau calcaire. Garantie +.'
where slug  = 'chauffe-eau-100l-steatite';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 150 L (gamme Éco)',
  short_desc= 'Pour 2-3 personnes. Remplacement complet sous 24-72 h.'
where slug  = 'chauffe-eau-150l-eco';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 150 L (anti-calcaire)',
  short_desc= 'Pour 2-3 personnes. Résistance stéatite, eau calcaire OK, +5 ans de vie.'
where slug  = 'chauffe-eau-150l-steatite';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 200 L mural (gamme Éco)',
  short_desc= 'Pour 3-4 personnes. Cuve verticale fixée au mur. Pose clés en main.'
where slug  = 'chauffe-eau-200l-mural-eco';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 200 L mural (anti-calcaire)',
  short_desc= 'Pour 3-4 personnes. Résistance protégée, idéal eau dure (Saint-Omer).'
where slug  = 'chauffe-eau-200l-mural-steatite';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 200 L au sol (gamme Éco)',
  short_desc= 'Pour 3-4 personnes. Pose au sol stable, idéal garage/buanderie.'
where slug  = 'chauffe-eau-200l-sol-eco';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 200 L au sol (anti-calcaire)',
  short_desc= 'Pour 3-4 personnes. Résistance protégée + pose au sol.'
where slug  = 'chauffe-eau-200l-sol-steatite';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 300 L au sol (gamme Éco)',
  short_desc= 'Pour 4-6 personnes. Grosse cuve pour famille nombreuse.'
where slug  = 'chauffe-eau-300l-sol-eco';

update public.services set
  name      = 'Plus d''eau chaude — Chauffe-eau 300 L au sol (anti-calcaire)',
  short_desc= 'Pour 4-6 personnes. Résistance protégée + grosse capacité.'
where slug  = 'chauffe-eau-300l-sol-steatite';

update public.services set
  name      = 'Demande de devis sur mesure',
  short_desc= 'Travaux complexes, rénovation, situation particulière : on se déplace gratuitement pour étudier.'
where slug  = 'devis-personnalise';

-- ──────────────────────────────────────────────────────────────
-- 2. INSERT — Nouvelles prestations dépannage en langage client
--    (problèmes concrets que le client tape sur Google)
-- ──────────────────────────────────────────────────────────────

-- ⚠️ Adaptation à la structure réelle de la table services
-- (price_ttc + deposit_pct + includes etc.). Si certaines colonnes manquent,
-- décommenter et adapter selon le schéma existant.

-- Helper : on récupère les valeurs par défaut depuis un service existant
-- pour éviter les surprises avec NOT NULL / DEFAULT.

-- 2.1 — DÉBOUCHAGE SIMPLE
insert into public.services (slug, name, short_desc, category_slug, price_ttc, deposit_pct, requires_quote, includes, duration_min, warranty, brand, badge)
values (
  'debouchage-simple',
  'Mon évier / WC / lavabo est bouché — Débouchage simple',
  'WC bouché, évier qui ne s''écoule plus, douche stagnante : on débloque en 1 h avec furet ou ventouse haute pression.',
  'plomberie',
  149.00,
  40,
  false,
  array['Déplacement', 'Diagnostic visuel', 'Débouchage furet ou ventouse', 'Rinçage et test d''évacuation', 'Garantie 1 mois'],
  60,
  'Garantie 1 mois · TVA 10%',
  'Help Confort',
  'Express 1h'
)
on conflict (slug) do nothing;

-- 2.2 — RECHERCHE DE FUITE SIMPLE
insert into public.services (slug, name, short_desc, category_slug, price_ttc, deposit_pct, requires_quote, includes, duration_min, warranty, brand, badge)
values (
  'recherche-fuite-simple',
  'J''ai une fuite mais je ne sais pas d''où — Recherche par caméra',
  'Fuite invisible, mur ou plafond humide ? Caméra thermique, gaz traceur ou écoute acoustique pour localiser sans casse.',
  'plomberie',
  250.00,
  40,
  false,
  array['Diagnostic complet sur place', 'Caméra thermique ou gaz traceur', 'Localisation précise (au mm)', 'Rapport remis à votre assurance', 'Devis de réparation'],
  120,
  'Rapport assurance · TVA 10%',
  'Help Confort',
  'Sans casse'
)
on conflict (slug) do nothing;

-- 2.3 — DÉPLACEMENT & DIAGNOSTIC
insert into public.services (slug, name, short_desc, category_slug, price_ttc, deposit_pct, requires_quote, includes, duration_min, warranty, brand, badge)
values (
  'deplacement-diagnostic',
  'Je veux qu''un pro vienne voir — Déplacement + diagnostic',
  'Vous ne savez pas ce qui ne va pas ? Notre technicien vient diagnostiquer et vous remet un devis clair.',
  'plomberie',
  89.00,
  100,
  false,
  array['Déplacement à votre domicile', 'Diagnostic visuel complet', 'Devis transparent par écrit', 'Conseils techniques honnêtes'],
  45,
  'Déduit du devis si signé · TVA 10%',
  'Help Confort',
  'Visite express'
)
on conflict (slug) do nothing;

-- 2.4 — REMPLACEMENT ROBINET / MITIGEUR
insert into public.services (slug, name, short_desc, category_slug, price_ttc, deposit_pct, requires_quote, includes, duration_min, warranty, brand, badge)
values (
  'remplacement-robinet-simple',
  'Mon robinet fuit ou est usé — Remplacement mitigeur',
  'Robinet qui goutte, mitigeur grippé, vieux modèle à changer. Fourniture + pose en 1 h.',
  'plomberie',
  179.00,
  40,
  false,
  array['Dépose ancien robinet', 'Fourniture mitigeur neuf (gamme standard)', 'Pose + raccordement', 'Test d''étanchéité', 'Garantie 2 ans'],
  60,
  'Garantie 2 ans · TVA 10%',
  'Grohe / Jacob Delafon',
  'Pose 1h'
)
on conflict (slug) do nothing;

-- 2.5 — ENTRETIEN ANNUEL CHAUDIÈRE (visite)
insert into public.services (slug, name, short_desc, category_slug, price_ttc, deposit_pct, requires_quote, includes, duration_min, warranty, brand, badge)
values (
  'entretien-chaudiere-annuel',
  'Mon entretien chaudière annuel — Visite obligatoire',
  'Obligatoire chaque année. Nettoyage, vérification sécurité, attestation officielle. Sans contrat d''entretien.',
  'chauffage',
  119.00,
  40,
  false,
  array['Nettoyage corps de chauffe + brûleur', 'Vérification organes de sécurité', 'Mesures de combustion (CO, tirage)', 'Attestation d''entretien officielle', 'Conformité Décret 2009-649'],
  60,
  'Attestation légale · TVA 10%',
  'Toutes marques',
  'Légal'
)
on conflict (slug) do nothing;

-- 2.6 — FUITE D'EAU VISIBLE (réparation simple)
insert into public.services (slug, name, short_desc, category_slug, price_ttc, deposit_pct, requires_quote, includes, duration_min, warranty, brand, badge)
values (
  'fuite-eau-visible',
  'J''ai une fuite que je vois — Réparation accessible',
  'Sous évier, flexible WC, raccord robinet : fuite localisée et accessible. Réparation rapide.',
  'plomberie',
  159.00,
  40,
  false,
  array['Diagnostic sur place', 'Remplacement raccord/flexible/joint', 'Test d''étanchéité 30 min', 'Conseils pour éviter récidive', 'Garantie 6 mois'],
  60,
  'Garantie 6 mois · TVA 10%',
  'Help Confort',
  'Urgence'
)
on conflict (slug) do nothing;

-- ──────────────────────────────────────────────────────────────
-- 3. VÉRIFICATION
-- ──────────────────────────────────────────────────────────────
select count(*) as total_services from public.services;
select slug, name, price_ttc from public.services order by category_slug, name;
