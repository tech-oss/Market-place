-- Manual payment release + buyer return flow.
--
-- Previously a buyer confirming delivery immediately credited the seller's
-- wallet. Money now stays with the platform after the buyer confirms: the
-- order sits at "confirmed" until an admin explicitly releases it. That gives
-- the admin a review window (typically 5-7 days) during which the buyer can
-- still return the item.
--
-- Adds two statuses for the return path:
--   return-requested : buyer asked to return; ships the item to the admin.
--   returned         : admin received it. Buyer is refunded in full; the
--                      seller is charged the platform commission as a
--                      restocking/handling fee (they were never paid, so the
--                      wallet only sees the negative commission line).

alter type order_status add value if not exists 'return-requested';
alter type order_status add value if not exists 'returned';

-- Lifecycle timestamps. confirmed_at drives the "5 days elapsed, review this
-- payout" alert on the admin dashboard and the buyer's return window.
alter table orders add column if not exists confirmed_at         timestamptz;
alter table orders add column if not exists released_at          timestamptz;
alter table orders add column if not exists return_requested_at  timestamptz;
alter table orders add column if not exists return_reason        text;
alter table orders add column if not exists returned_at          timestamptz;

-- Backfill so already-confirmed orders don't look like they were confirmed
-- "just now" once the alert goes live.
update orders set confirmed_at = updated_at
  where confirmed_at is null and status in ('confirmed', 'released');
update orders set released_at = updated_at
  where released_at is null and status = 'released';

-- Single-row platform settings. Holds the return address a buyer ships to
-- when returning an order, so it isn't hardcoded in the UI.
create table if not exists platform_settings (
  id                   int primary key default 1 check (id = 1),
  return_address       text,
  return_contact_name  text,
  return_contact_phone text,
  return_window_days   int not null default 5,
  updated_at           timestamptz not null default now()
);
insert into platform_settings (id) values (1) on conflict (id) do nothing;

alter table platform_settings enable row level security;

drop policy if exists "platform_settings public read" on platform_settings;
create policy "platform_settings public read" on platform_settings
  for select using (true);

drop policy if exists "platform_settings admin write" on platform_settings;
create policy "platform_settings admin write" on platform_settings
  for all using (is_admin()) with check (is_admin());
