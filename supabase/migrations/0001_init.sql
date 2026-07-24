-- Motorcycle Products — initial schema
-- Run in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'seller', 'buyer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_condition as enum
    ('new', 'like-new', 'excellent-used', 'good-used', 'used', 'for-parts');
exception when duplicate_object then null; end $$;

do $$ begin
  create type seller_status as enum ('pending', 'active', 'suspended', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('active', 'draft', 'out-of-stock', 'pending-review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum
    ('pending-payment','paid-held','shipped','delivered','confirmed','released','disputed','refunded','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wallet_txn_type as enum ('sale', 'commission', 'payout', 'refund');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        user_role not null default 'buyer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- security-definer helper to check admin without RLS recursion
create or replace function is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- create a profile automatically for every new auth user
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'buyer')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- sellers
-- ---------------------------------------------------------------------------
create table if not exists sellers (
  id                     uuid primary key default gen_random_uuid(),
  profile_id             uuid references profiles(id) on delete set null,
  name                   text not null,
  slug                   text unique not null,
  logo                   text,
  location               text,
  business_type          text,
  status                 seller_status not null default 'pending',
  rating                 numeric(2,1) not null default 0,
  review_count           int not null default 0,
  verified               boolean not null default false,
  id_doc_url             text,
  proof_of_residence_url text,
  member_since           date not null default now(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists sellers_status_idx on sellers(status);

-- ---------------------------------------------------------------------------
-- brands & categories (reference data)
-- ---------------------------------------------------------------------------
create table if not exists brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  logo       text,
  part_count int not null default 0
);

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  image      text,
  part_count int not null default 0
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id             uuid primary key default gen_random_uuid(),
  seller_id      uuid not null references sellers(id) on delete cascade,
  slug           text unique not null,
  sku            text unique not null,
  title          text not null,
  description    text,
  price_cents    int not null check (price_cents >= 0),
  compare_at_cents int,
  condition      product_condition not null,
  category_slug  text not null,
  brand_name     text not null,
  oem_numbers    text[] not null default '{}',
  inventory_bin  text,
  stock          int not null default 0,
  status         listing_status not null default 'pending-review',
  is_featured    boolean not null default false,
  is_new         boolean not null default false,
  views          int not null default 0,
  sold           int not null default 0,
  listed_at      timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists products_seller_idx   on products(seller_id);
create index if not exists products_category_idx  on products(category_slug);
create index if not exists products_status_idx    on products(status);

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url        text not null,
  alt        text,
  position   int not null default 0
);

create table if not exists fitments (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  brand      text not null,
  model      text not null,
  year_from  int not null,
  year_to    int not null
);

-- ---------------------------------------------------------------------------
-- orders & items (escrow model)
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  reference      text unique not null,
  buyer_id       uuid references profiles(id) on delete set null,
  buyer_name     text,
  status         order_status not null default 'paid-held',
  subtotal_cents int not null default 0,
  shipping_cents int not null default 0,
  total_cents    int not null default 0,
  courier        text,
  tracking       text,
  placed_at      timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  seller_id    uuid references sellers(id) on delete set null,
  title        text not null,
  qty          int not null default 1,
  price_cents  int not null
);
create index if not exists order_items_seller_idx on order_items(seller_id);

-- ---------------------------------------------------------------------------
-- wallet transactions
-- ---------------------------------------------------------------------------
create table if not exists wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references sellers(id) on delete cascade,
  type        wallet_txn_type not null,
  description text,
  amount_cents int not null,          -- +credit / -debit
  status      text not null default 'completed',
  created_at  timestamptz not null default now()
);
create index if not exists wallet_seller_idx on wallet_transactions(seller_id);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  author     text not null,
  rating     int not null check (rating between 1 and 5),
  title      text,
  body       text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- commission settings (single row)
-- ---------------------------------------------------------------------------
create table if not exists commission_settings (
  id          int primary key default 1 check (id = 1),
  pct         numeric(4,2) not null default 7.00,
  updated_at  timestamptz not null default now()
);
insert into commission_settings (id, pct) values (1, 7.00)
  on conflict (id) do nothing;

-- updated_at triggers
drop trigger if exists trg_products_updated on products;
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();
drop trigger if exists trg_sellers_updated on sellers;
create trigger trg_sellers_updated before update on sellers
  for each row execute function set_updated_at();
drop trigger if exists trg_orders_updated on orders;
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles            enable row level security;
alter table sellers             enable row level security;
alter table brands              enable row level security;
alter table categories          enable row level security;
alter table products            enable row level security;
alter table product_images      enable row level security;
alter table fitments            enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table wallet_transactions enable row level security;
alter table reviews             enable row level security;
alter table commission_settings enable row level security;

-- Drop existing policies first so this file is safe to re-run.
drop policy if exists "profiles self read"     on profiles;
drop policy if exists "profiles self update"   on profiles;
drop policy if exists "brands public read"     on brands;
drop policy if exists "brands admin write"     on brands;
drop policy if exists "categories public read" on categories;
drop policy if exists "categories admin write" on categories;
drop policy if exists "sellers public read"    on sellers;
drop policy if exists "sellers owner update"   on sellers;
drop policy if exists "sellers insert self"    on sellers;
drop policy if exists "sellers admin all"      on sellers;
drop policy if exists "products public read"   on products;
drop policy if exists "products seller write"  on products;
drop policy if exists "product_images read"    on product_images;
drop policy if exists "product_images write"   on product_images;
drop policy if exists "fitments read"          on fitments;
drop policy if exists "fitments write"         on fitments;
drop policy if exists "orders buyer read"      on orders;
drop policy if exists "orders buyer insert"    on orders;
drop policy if exists "orders admin update"    on orders;
drop policy if exists "order_items read"       on order_items;
drop policy if exists "wallet seller read"     on wallet_transactions;
drop policy if exists "reviews public read"    on reviews;
drop policy if exists "reviews auth insert"    on reviews;
drop policy if exists "commission public read" on commission_settings;
drop policy if exists "commission admin update" on commission_settings;

-- profiles
create policy "profiles self read"   on profiles for select using (auth.uid() = id or is_admin());
create policy "profiles self update" on profiles for update using (auth.uid() = id);

-- reference data: public read, admin write
create policy "brands public read"     on brands     for select using (true);
create policy "brands admin write"     on brands     for all using (is_admin()) with check (is_admin());
create policy "categories public read" on categories for select using (true);
create policy "categories admin write" on categories for all using (is_admin()) with check (is_admin());

-- sellers: public can read active; owner reads/updates own; admin all
create policy "sellers public read" on sellers for select
  using (status = 'active' or profile_id = auth.uid() or is_admin());
create policy "sellers owner update" on sellers for update
  using (profile_id = auth.uid() or is_admin());
create policy "sellers insert self" on sellers for insert
  with check (profile_id = auth.uid());
create policy "sellers admin all" on sellers for all
  using (is_admin()) with check (is_admin());

-- products: public read of active listings; seller manages own; admin all
create policy "products public read" on products for select using (
  status = 'active'
  or is_admin()
  or exists (select 1 from sellers s where s.id = products.seller_id and s.profile_id = auth.uid())
);
create policy "products seller write" on products for all using (
  exists (select 1 from sellers s where s.id = products.seller_id and s.profile_id = auth.uid())
  or is_admin()
) with check (
  exists (select 1 from sellers s where s.id = products.seller_id and s.profile_id = auth.uid())
  or is_admin()
);

-- product images & fitments follow their product
create policy "product_images read" on product_images for select using (true);
create policy "product_images write" on product_images for all using (
  exists (select 1 from products p join sellers s on s.id = p.seller_id
          where p.id = product_images.product_id and (s.profile_id = auth.uid() or is_admin()))
) with check (true);
create policy "fitments read" on fitments for select using (true);
create policy "fitments write" on fitments for all using (
  exists (select 1 from products p join sellers s on s.id = p.seller_id
          where p.id = fitments.product_id and (s.profile_id = auth.uid() or is_admin()))
) with check (true);

-- orders: buyer sees own; seller sees orders containing their items; admin all
create policy "orders buyer read" on orders for select using (
  buyer_id = auth.uid()
  or is_admin()
  or exists (
    select 1 from order_items oi join sellers s on s.id = oi.seller_id
    where oi.order_id = orders.id and s.profile_id = auth.uid()
  )
);
create policy "orders buyer insert" on orders for insert with check (buyer_id = auth.uid());
create policy "orders admin update" on orders for update using (is_admin());

create policy "order_items read" on order_items for select using (
  is_admin()
  or exists (select 1 from orders o where o.id = order_items.order_id and o.buyer_id = auth.uid())
  or exists (select 1 from sellers s where s.id = order_items.seller_id and s.profile_id = auth.uid())
);

-- wallet: seller sees own; admin all
create policy "wallet seller read" on wallet_transactions for select using (
  exists (select 1 from sellers s where s.id = wallet_transactions.seller_id and s.profile_id = auth.uid())
  or is_admin()
);

-- reviews: public read, authenticated insert
create policy "reviews public read" on reviews for select using (true);
create policy "reviews auth insert" on reviews for insert with check (auth.uid() is not null);

-- commission: public read, admin update
create policy "commission public read" on commission_settings for select using (true);
create policy "commission admin update" on commission_settings for update using (is_admin());
