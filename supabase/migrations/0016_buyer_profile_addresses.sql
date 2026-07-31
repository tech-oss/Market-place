-- Buyer profile phone number + a real saved-address book, so "Addresses"
-- and "Profile" on My Account have something to manage instead of being
-- dead links. Also backs the post-signup onboarding step where a new buyer
-- is asked (skippable) for a phone number and delivery address.

alter table public.profiles add column if not exists phone text;

create table if not exists public.buyer_addresses (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  label        text,
  full_name    text not null,
  phone        text not null,
  address_line text not null,
  city         text not null,
  postal_code  text not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists buyer_addresses_profile_idx on public.buyer_addresses(profile_id);

alter table public.buyer_addresses enable row level security;

drop policy if exists "buyer_addresses owner all" on public.buyer_addresses;
create policy "buyer_addresses owner all" on public.buyer_addresses
  for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());
