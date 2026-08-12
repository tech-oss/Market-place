-- EFT payment method alongside the existing (simulated) online payment flow.
-- Run in the Supabase SQL editor. Safe to re-run.

-- ---------------------------------------------------------------------------
-- orders: payment method / status tracking
-- ---------------------------------------------------------------------------
alter table orders add column if not exists payment_method text not null default 'online'
  check (payment_method in ('online', 'eft'));
alter table orders add column if not exists payment_status text not null default 'confirmed'
  check (payment_status in ('pending', 'submitted', 'confirmed', 'expired'));
alter table orders add column if not exists payment_proof_url text;
alter table orders add column if not exists payment_proof_uploaded_at timestamptz;
alter table orders add column if not exists payment_deadline timestamptz;
alter table orders add column if not exists payment_confirmed_at timestamptz;
alter table orders add column if not exists cancelled_at timestamptz;
alter table orders add column if not exists cancel_reason text;

create index if not exists orders_payment_status_idx on orders(payment_status);

-- ---------------------------------------------------------------------------
-- payment_settings (single row) — admin-configured payment methods + EFT bank details
-- ---------------------------------------------------------------------------
create table if not exists payment_settings (
  id                  int primary key default 1 check (id = 1),
  online_enabled      boolean not null default true,
  eft_enabled         boolean not null default true,
  bank_name           text,
  account_title       text,
  account_number      text,
  branch_code         text,
  iban                text,
  eft_instructions    text,
  updated_at          timestamptz not null default now()
);
insert into payment_settings (id) values (1) on conflict (id) do nothing;

alter table payment_settings enable row level security;
drop policy if exists "payment settings public read" on payment_settings;
drop policy if exists "payment settings admin update" on payment_settings;
create policy "payment settings public read" on payment_settings for select using (true);
create policy "payment settings admin update" on payment_settings for update using (is_admin());

-- ---------------------------------------------------------------------------
-- storage: payment-proofs (private) — same owner/admin pattern as kyc-documents
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists "payment proofs owner read" on storage.objects;
drop policy if exists "payment proofs owner write" on storage.objects;

create policy "payment proofs owner read" on storage.objects
  for select using (
    bucket_id = 'payment-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    )
  );

create policy "payment proofs owner write" on storage.objects
  for insert with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- expire_eft_orders(): cancel EFT orders whose 3-day payment deadline has
-- passed without a submitted proof (buyers who submitted proof are left for
-- an admin to review/decide rather than auto-cancelled), restoring stock.
-- security definer so it can run daily via a cron-triggered API route.
-- ---------------------------------------------------------------------------
create or replace function expire_eft_orders()
returns int language plpgsql security definer
set search_path = public as $$
declare
  o record;
  it record;
  n int := 0;
begin
  for o in
    select id from orders
    where payment_method = 'eft'
      and payment_status = 'pending'
      and status = 'pending-payment'
      and payment_deadline is not null
      and payment_deadline < now()
  loop
    for it in select product_id, qty from order_items where order_id = o.id and product_id is not null
    loop
      perform increment_product_stock(it.product_id, it.qty);
    end loop;

    update orders
    set status = 'cancelled',
        payment_status = 'expired',
        cancelled_at = now(),
        cancel_reason = 'EFT payment deadline expired'
    where id = o.id;

    n := n + 1;
  end loop;

  return n;
end $$;
