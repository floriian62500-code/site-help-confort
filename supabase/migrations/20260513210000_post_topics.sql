-- ═══════════════════════════════════════════════════════════════════════════
-- HELP! Confort — Sujets de posts (déclencheurs IA)
-- ═══════════════════════════════════════════════════════════════════════════
-- Remplace les anciens "templates" statiques par des "sujets" : titre + prompt IA.
-- L'utilisateur clique sur un sujet → Studio IA génère un post adapté.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.post_topics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  description  text,
  icon         text,                          -- emoji
  category     text NOT NULL CHECK (category IN ('promo','metier','alerte','recrutement','ferie','info','temoignage','urgence','realisation','sur-mesure')),
  ai_prompt    text NOT NULL,                 -- prompt pour Studio IA
  metier       text,                          -- chauffage, plomberie, etc.
  seasonal     text,                          -- 'auto', 'hiver', 'printemps', 'ete', 'noel', null
  position     int NOT NULL DEFAULT 0,
  is_builtin   boolean NOT NULL DEFAULT false, -- créé par HC vs ajouté par user
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_topics_category_idx ON public.post_topics(category);
CREATE INDEX IF NOT EXISTS post_topics_active_idx   ON public.post_topics(active);

DROP TRIGGER IF EXISTS post_topics_touch ON public.post_topics;
CREATE TRIGGER post_topics_touch BEFORE UPDATE ON public.post_topics
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.post_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS post_topics_admin_all ON public.post_topics;
CREATE POLICY post_topics_admin_all ON public.post_topics
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ── Seed des sujets utiles HC ──────────────────────────────────────────────
INSERT INTO public.post_topics (slug, title, description, icon, category, ai_prompt, metier, seasonal, position, is_builtin) VALUES

-- ═══ Promo saisonnières ═══════════════════════════════════════════════════
('promo-entretien-hiver',
 'Promo entretien chaudière (avant hiver)',
 'Rappel entretien obligatoire + offre de saison',
 '🍂','promo',
 'Écris un post Facebook/Instagram pour HELP! Confort Saint-Omer & Dunkerque qui rappelle aux particuliers que l''entretien annuel de leur chaudière est obligatoire avant l''hiver. Mentionne nos contrats BASIC à 9€/mois HT. Ton chaleureux, professionnel, pas trop commercial. Inclure un appel à l''action vers le numéro 03 66 10 01 34. Maximum 800 caractères, hashtags pertinents en fin.',
 'chauffage','automne',10,true),

('promo-fenetres-printemps',
 'Promo rénovation fenêtres (printemps)',
 'Offre saisonnière double vitrage',
 '🌸','promo',
 'Écris un post Facebook pour HELP! Confort qui met en avant la rénovation de fenêtres en double vitrage avec les beaux jours. Aides MaPrimeRénov''. Devis gratuit. Pose par techniciens salariés. Ton positif, axé économies d''énergie. Maximum 800 caractères, hashtags.',
 'vitrerie','printemps',20,true),

-- ═══ Métier ═══════════════════════════════════════════════════════════════
('metier-depannage-fuite',
 'Service dépannage fuite d''eau 24/7',
 'Mise en avant astreinte urgence',
 '🚨','urgence',
 'Écris un post Facebook pour HELP! Confort Saint-Omer & Dunkerque. Une fuite d''eau ? On intervient en moins d''1h, 7j/7. Plombier qualifié. Devis transparent avant intervention. Numéro 03 66 10 01 34 visible. Ton rassurant et urgent. Maximum 600 caractères.',
 'plomberie',null,30,true),

('metier-pmr-douche',
 'Aménagement PMR / douche italienne',
 'Adaptation séniors + MaPrimeAdapt',
 '🚿','metier',
 'Écris un post Facebook pour HELP! Confort qui parle de l''aménagement PMR : transformation baignoire en douche italienne, barre de maintien, sol anti-dérapant. Mentionne MaPrimeAdapt'' (jusqu''à 70% d''aide). Cible : séniors et leurs proches. Ton bienveillant. Maximum 800 caractères.',
 'pmr',null,40,true),

('metier-electricite-mise-aux-normes',
 'Mise aux normes électriques',
 'Rénovation électrique sécurisée',
 '⚡','metier',
 'Écris un post Facebook pour HELP! Confort sur la mise aux normes électriques d''un logement. Conformité NF C 15-100. Diagnostic gratuit. Travail soigné par électricien certifié. Pourquoi c''est important (sécurité, assurance). Maximum 700 caractères.',
 'electricite',null,50,true),

-- ═══ Alerte météo / saison ════════════════════════════════════════════════
('alerte-gel-canalisations',
 'Alerte gel canalisations',
 'Conseils prévention quand grand froid',
 '❄️','alerte',
 'Écris un post Facebook URGENT de HELP! Confort lors d''une vague de froid : conseils pour éviter le gel des canalisations (couper l''eau, purger, calorifuger, maintenir 8°C minimum). Rappeler qu''on intervient 7j/7 en cas de fuite. Maximum 600 caractères.',
 'plomberie','hiver',60,true),

('alerte-canicule-clim',
 'Alerte canicule — installation clim',
 'Pic de demandes climatisation',
 '☀️','alerte',
 'Écris un post Facebook pour HELP! Confort en période de canicule. Installation de climatisation réversible. Délai d''intervention rapide. Devis gratuit sous 48h. Conseils confort thermique. Ton dynamique. Maximum 700 caractères.',
 'chauffage','ete',70,true),

-- ═══ Recrutement ═══════════════════════════════════════════════════════════
('recrutement-technicien',
 'Offre d''emploi technicien polyvalent',
 'CDI avec véhicule de service',
 '👷','recrutement',
 'Écris un post Facebook de recrutement pour HELP! Confort : on cherche un(e) technicien(ne) polyvalent(e) plomberie/chauffage/électricité en CDI. Saint-Omer ou Dunkerque. Véhicule de service, mutuelle, formation continue. Salaire attractif selon expérience. CV à contact@helpconfort.com. Maximum 800 caractères.',
 'multiservice',null,80,true),

-- ═══ Témoignage / avis client ═════════════════════════════════════════════
('temoignage-avis-5etoiles',
 'Mise en avant avis 5 étoiles',
 'Republier un témoignage positif',
 '⭐','temoignage',
 'Écris un post Facebook pour HELP! Confort qui met en avant un avis client 5 étoiles récent. Format : ⭐⭐⭐⭐⭐ + extrait de l''avis + remerciement chaleureux + appel à laisser un avis. Le contenu réel de l''avis sera à remplacer entre crochets [CITATION]. Maximum 600 caractères.',
 'multiservice',null,90,true),

-- ═══ Réalisation / avant-après ═══════════════════════════════════════════
('realisation-chantier-fini',
 'Partage chantier terminé (avant/après)',
 'Mise en avant d''une réalisation',
 '📸','realisation',
 'Écris un post Facebook pour HELP! Confort qui partage une réalisation récente. Format : titre accrocheur + description du chantier (à remplir entre crochets : [TYPE_TRAVAUX], [VILLE], [DURÉE]) + 2-3 points clés (matériaux, savoir-faire) + appel à contacter pour un devis. Ton fier mais humble. Maximum 700 caractères.',
 null,null,100,true),

-- ═══ Fêtes / saisonniers ═══════════════════════════════════════════════════
('voeux-noel',
 'Vœux Noël / Nouvel An',
 'Message de fin d''année + permanence urgences',
 '🎄','ferie',
 'Écris un post Facebook chaleureux pour HELP! Confort Saint-Omer & Dunkerque pour les fêtes de fin d''année. Remerciements aux clients, partenaires et salariés. Mention permanence urgences plomberie/chauffage maintenue les 24, 25, 31 décembre et 1er janvier. Ton humain, sincère. Maximum 600 caractères.',
 'multiservice','noel',110,true),

('voeux-nouvelle-annee',
 'Vœux Bonne Année + bilan',
 'Bilan année + projets nouvelle année',
 '🎊','ferie',
 'Écris un post Facebook pour HELP! Confort souhaitant une bonne année. Court bilan (clients servis, salariés, valeurs) + perspectives pour l''année. Ton positif, communicatif. Maximum 600 caractères.',
 'multiservice',null,120,true),

-- ═══ Info / éducation client ══════════════════════════════════════════════
('info-aides-energie',
 'Infographie aides rénovation énergétique',
 'MaPrimeRénov, CEE, éco-PTZ',
 '💰','info',
 'Écris un post Facebook informatif pour HELP! Confort sur les aides à la rénovation énergétique 2026 : MaPrimeRénov'', Certificats d''Économies d''Énergie (CEE), éco-PTZ. Expliquer simplement qui peut en bénéficier, jusqu''à quel montant. On accompagne les clients dans les démarches. Ton pédagogique. Maximum 900 caractères.',
 null,null,130,true),

('info-quand-changer-chaudiere',
 'Quand changer sa chaudière ?',
 'Conseils pédagogiques durée de vie',
 '🔧','info',
 'Écris un post Facebook pour HELP! Confort qui explique quand remplacer sa chaudière (signes : >15 ans, factures qui grimpent, pannes répétées, peu efficace). Mentionner les alternatives modernes (PAC, chaudière condensation). Pas commercial, ton conseil. Maximum 800 caractères.',
 'chauffage',null,140,true);
