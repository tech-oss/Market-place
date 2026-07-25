-- In-platform buyer ↔ seller chat with contact-info moderation + admin audit.
-- Safe to re-run.

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists conversations (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid references products(id) on delete set null,
  product_title   text,
  product_slug    text,
  buyer_id        uuid not null references profiles(id) on delete cascade,
  seller_id       uuid not null references sellers(id) on delete cascade,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (product_id, buyer_id, seller_id)
);
create index if not exists conversations_buyer_idx  on conversations(buyer_id);
create index if not exists conversations_seller_idx on conversations(seller_id);

create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid references profiles(id) on delete set null,
  body            text not null,                 -- deliverable text (redacted if blocked)
  blocked         boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists messages_convo_idx on messages(conversation_id);

-- Admin-only store of the ORIGINAL text of blocked messages (audit).
create table if not exists message_flags (
  id            uuid primary key default gen_random_uuid(),
  message_id    uuid not null references messages(id) on delete cascade,
  original_body text not null,
  reasons       text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table conversations enable row level security;
alter table messages      enable row level security;
alter table message_flags enable row level security;

-- helper: is the current user a participant of a conversation?
create or replace function is_convo_participant(cid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from conversations c
    where c.id = cid and (
      c.buyer_id = auth.uid()
      or exists (select 1 from sellers s where s.id = c.seller_id and s.profile_id = auth.uid())
    )
  );
$$;

drop policy if exists "conversations read"   on conversations;
drop policy if exists "conversations insert" on conversations;
drop policy if exists "conversations update" on conversations;
create policy "conversations read" on conversations for select
  using (is_admin() or is_convo_participant(id));
create policy "conversations insert" on conversations for insert
  with check (buyer_id = auth.uid());
create policy "conversations update" on conversations for update
  using (is_convo_participant(id));

drop policy if exists "messages read"   on messages;
drop policy if exists "messages insert" on messages;
create policy "messages read" on messages for select
  using (is_admin() or is_convo_participant(conversation_id));
create policy "messages insert" on messages for insert
  with check (sender_id = auth.uid() and is_convo_participant(conversation_id));

-- flags: sender may insert, only admins may read.
drop policy if exists "flags read"   on message_flags;
drop policy if exists "flags insert" on message_flags;
create policy "flags read"   on message_flags for select using (is_admin());
create policy "flags insert" on message_flags for insert with check (auth.uid() is not null);
