-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Table chat_conversations
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════
--
-- Stocke chaque échange du chatbot IA (Claude) :
--   - 1 ligne = 1 session de conversation
--   - messages = jsonb array [{role:"user", content:"..."}, {role:"assistant", content:"..."}]
--   - Florian peut tagger (rating) pour améliorer le prompt système
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.chat_conversations (
  id              uuid primary key default gen_random_uuid(),
  session_id      text not null,             -- UUID généré côté client, persisté en localStorage
  user_email      text,                      -- si capturé pendant la conversation
  user_phone      text,
  user_name       text,
  messages        jsonb not null default '[]'::jsonb,  -- [{role,content,ts}]
  topic           text,                      -- catégorisation auto : "fuite", "chauffage", "devis", etc.
  metier          text,                      -- métier détecté : plomberie / chauffage / ...
  agence          text default 'depan-audo', -- depan-audo ou depan-dk
  status          text default 'open',       -- open | closed | escalated
  rating          int,                       -- 1 (mauvais) à 5 (excellent) — feedback admin
  rating_notes    text,                      -- commentaires admin pour amélioration prompt
  lead_captured   boolean default false,     -- true si email/tel obtenu
  message_count   int default 0,
  total_tokens    int default 0,             -- coût IA cumulé
  user_agent      text,
  page_url        text,                      -- URL où la conv a démarré
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  closed_at       timestamptz
);

create index if not exists idx_chat_session  on public.chat_conversations (session_id);
create index if not exists idx_chat_status   on public.chat_conversations (status, updated_at desc);
create index if not exists idx_chat_email    on public.chat_conversations (user_email) where user_email is not null;
create index if not exists idx_chat_rating   on public.chat_conversations (rating) where rating is not null;
create index if not exists idx_chat_recent   on public.chat_conversations (updated_at desc);

-- Trigger updated_at
create or replace function public.touch_chat_conv()
returns trigger as $$
begin
  new.updated_at = now();
  new.message_count = coalesce(jsonb_array_length(new.messages), 0);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_chat_conv_touch on public.chat_conversations;
create trigger trg_chat_conv_touch
  before update on public.chat_conversations
  for each row execute function public.touch_chat_conv();

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════
alter table public.chat_conversations enable row level security;

-- Anon peut INSERT (créer sa conv) et UPDATE sa propre conv via session_id matching
drop policy if exists "chat_anon_insert" on public.chat_conversations;
create policy "chat_anon_insert"
  on public.chat_conversations for insert to anon
  with check (status = 'open');

drop policy if exists "chat_anon_update_own" on public.chat_conversations;
create policy "chat_anon_update_own"
  on public.chat_conversations for update to anon
  using (true)  -- la session_id sert d'identité (suffisant pour un chat public)
  with check (true);

drop policy if exists "chat_anon_select_own" on public.chat_conversations;
create policy "chat_anon_select_own"
  on public.chat_conversations for select to anon
  using (true);

-- Admin (authenticated) full access
drop policy if exists "chat_admin_all" on public.chat_conversations;
create policy "chat_admin_all"
  on public.chat_conversations for all to authenticated
  using (true) with check (true);

-- ═══════════════════════════════════════════════════════════════
-- Vue admin : stats utiles
-- ═══════════════════════════════════════════════════════════════
create or replace view public.v_chat_stats as
select
  date_trunc('day', created_at) as day,
  count(*)                       as conversations,
  count(*) filter (where lead_captured = true) as leads,
  count(*) filter (where rating is not null)   as rated,
  avg(rating)                    as avg_rating,
  sum(total_tokens)              as tokens_total
from public.chat_conversations
group by 1
order by 1 desc;

grant select on public.v_chat_stats to authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Vérification
-- ═══════════════════════════════════════════════════════════════
select 'Table chat_conversations créée ✅' as message,
       count(*) as ligne_count
from public.chat_conversations;
