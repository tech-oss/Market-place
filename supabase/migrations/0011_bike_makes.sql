-- Motorcycle makes (bike makes) as a real backend table instead of a
-- hardcoded list. Used for: the homepage "Browse by Brand" strip, the
-- /brands page, the "brand" filter on /parts, and the seller dashboard's
-- "make" dropdown when listing a part (so every listing's compatibility
-- falls exactly into one of these makes).

create table if not exists public.bike_makes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.bike_makes enable row level security;

drop policy if exists "bike_makes public read" on public.bike_makes;
create policy "bike_makes public read" on public.bike_makes
  for select using (true);

drop policy if exists "bike_makes admin write" on public.bike_makes;
create policy "bike_makes admin write" on public.bike_makes
  for all using (is_admin()) with check (is_admin());

insert into public.bike_makes (name, slug, logo, sort_order) values
  ('BMW', 'bmw', 'BMW', 1),
  ('Yamaha', 'yamaha', 'YAM', 2),
  ('Honda', 'honda', 'HON', 3),
  ('KTM', 'ktm', 'KTM', 4),
  ('Suzuki', 'suzuki', 'SUZ', 5),
  ('Triumph', 'triumph', 'TRI', 6),
  ('Kawasaki', 'kawasaki', 'KAW', 7),
  ('Ducati', 'ducati', 'DUC', 8),
  ('Harley-Davidson', 'harley-davidson', 'H-D', 9),
  ('Aprilia', 'aprilia', 'APR', 10),
  ('Moto Guzzi', 'moto-guzzi', 'MGZ', 11),
  ('Royal Enfield', 'royal-enfield', 'RE', 12),
  ('Husqvarna', 'husqvarna', 'HQV', 13),
  ('Piaggio', 'piaggio', 'PIA', 14),
  ('Vespa', 'vespa', 'VSP', 15),
  ('Beta', 'beta', 'BET', 16)
on conflict (slug) do nothing;
