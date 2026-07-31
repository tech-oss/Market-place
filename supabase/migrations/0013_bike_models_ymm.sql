-- Admin-managed bike Make/Model/Year (YMM) catalog + seller "request a new
-- YMM" workflow.
--
-- bike_makes already exists (0011). This adds:
--   - bike_models: models (with a year range) that belong to a make, so the
--     seller listing form can offer a real Make -> Model -> Year cascade
--     instead of free text.
--   - ymm_requests: when a seller can't find their bike in the catalog, they
--     submit a free-text make/model/year proposal alongside their listing.
--     The listing is held in 'pending-review' until an admin approves the
--     request (which creates/reuses the catalog rows) or rejects it.

create table if not exists public.bike_models (
  id         uuid primary key default gen_random_uuid(),
  make_id    uuid not null references public.bike_makes(id) on delete cascade,
  name       text not null,
  year_from  int not null,
  year_to    int not null,
  status     text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (make_id, name, year_from, year_to)
);
create index if not exists bike_models_make_idx on public.bike_models(make_id);

alter table public.bike_models enable row level security;

drop policy if exists "bike_models public read" on public.bike_models;
create policy "bike_models public read" on public.bike_models
  for select using (true);

drop policy if exists "bike_models admin write" on public.bike_models;
create policy "bike_models admin write" on public.bike_models
  for all using (is_admin()) with check (is_admin());

create table if not exists public.ymm_requests (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.sellers(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete cascade,
  make_name    text not null,
  model_name   text not null,
  year_from    int not null,
  year_to      int not null,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note   text,
  created_at   timestamptz not null default now(),
  decided_at   timestamptz
);
create index if not exists ymm_requests_status_idx on public.ymm_requests(status);

alter table public.ymm_requests enable row level security;

drop policy if exists "ymm_requests seller read own" on public.ymm_requests;
create policy "ymm_requests seller read own" on public.ymm_requests for select using (
  is_admin()
  or exists (select 1 from public.sellers s where s.id = ymm_requests.seller_id and s.profile_id = auth.uid())
);

drop policy if exists "ymm_requests seller insert own" on public.ymm_requests;
create policy "ymm_requests seller insert own" on public.ymm_requests for insert with check (
  exists (select 1 from public.sellers s where s.id = ymm_requests.seller_id and s.profile_id = auth.uid())
);

drop policy if exists "ymm_requests admin write" on public.ymm_requests;
create policy "ymm_requests admin write" on public.ymm_requests for update using (is_admin()) with check (is_admin());

drop policy if exists "ymm_requests admin delete" on public.ymm_requests;
create policy "ymm_requests admin delete" on public.ymm_requests for delete using (is_admin());
