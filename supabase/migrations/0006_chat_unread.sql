-- Unread tracking for chat. Safe to re-run.

alter table conversations add column if not exists buyer_last_read_at  timestamptz not null default now();
alter table conversations add column if not exists seller_last_read_at timestamptz not null default now();

-- Per-conversation unread count for the current user (buyer or seller side).
create or replace function my_unread()
returns table(conversation_id uuid, unread bigint)
language sql security definer stable
set search_path = public as $$
  select m.conversation_id, count(*)::bigint
  from messages m
  join conversations c on c.id = m.conversation_id
  where (m.sender_id is null or m.sender_id <> auth.uid())
    and (
      (c.buyer_id = auth.uid() and m.created_at > c.buyer_last_read_at)
      or (
        m.created_at > c.seller_last_read_at
        and exists (select 1 from sellers s where s.id = c.seller_id and s.profile_id = auth.uid())
      )
    )
  group by m.conversation_id;
$$;

grant execute on function my_unread() to authenticated;
