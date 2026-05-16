-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Système de capture des leads (formulaires site)
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,

  -- Identité
  nom text not null,
  email text,
  telephone text,

  -- Localisation
  ville text,
  code_postal text,
  adresse text,

  -- Demande
  metier text,
  type_demande text default 'devis',  -- devis, urgence, info, rappel
  message text,
  budget text,

  -- Source / contexte
  source text default 'formulaire_site',  -- formulaire_site, telephone, ai_chat, autre
  source_page text,                       -- URL d'où vient le lead
  source_referer text,                    -- referer HTTP
  utm jsonb default '{}'::jsonb,          -- utm_source, utm_medium, utm_campaign

  -- Workflow
  status text not null default 'nouveau',  -- nouveau, en_cours, qualifie, devis_envoye, gagne, perdu, archive
  assigned_to text,                       -- email user qui suit
  priority text default 'normale',        -- urgente, haute, normale, basse
  tags jsonb default '[]'::jsonb,

  -- Suivi
  notes_internes text,
  last_contact_at timestamptz,
  next_action_at timestamptz,
  next_action_desc text,

  -- Conversion
  realisation_id uuid references public.realisations(id) on delete set null,  -- si converti en chantier
  estimated_value numeric,
  closed_at timestamptz,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index pour recherches courantes
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_leads_metier on public.leads(metier);
create index if not exists idx_leads_ville on public.leads(ville);

-- Trigger updated_at
create or replace function public.touch_leads()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_touch on public.leads;
create trigger trg_leads_touch
  before update on public.leads
  for each row execute function public.touch_leads();

-- RLS
alter table public.leads enable row level security;

-- Lecture / modification : admins authentifiés
drop policy if exists "leads_auth_all" on public.leads;
create policy "leads_auth_all"
  on public.leads for all
  to authenticated
  using (true)
  with check (true);

-- Insertion publique (formulaires du site public)
-- Le site public peut créer des leads avec la clé anon
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
  on public.leads for insert
  to anon
  with check (status = 'nouveau' and assigned_to is null);

-- ═══════════════════════════════════════════════════════════════
-- Résultat : "Success. No rows returned"
-- Vérifier dans Table Editor que la table 'leads' existe
-- ═══════════════════════════════════════════════════════════════
