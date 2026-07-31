-- Part categories as a real backend table instead of a hardcoded list, with
-- a banner image per category. Used for: the homepage "Shop by Category"
-- section, the /categories page, the "category" filter on /parts, and the
-- seller dashboard's mandatory category dropdown when listing a part.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (true);

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (is_admin()) with check (is_admin());

insert into public.categories (name, slug, image_url, sort_order) values
  ('Brakes', 'brakes', 'https://images.unsplash.com/photo-1648817709811-89f2d7e29657?q=70&w=1200&auto=format&fit=crop', 1),
  ('Engine', 'engine', 'https://images.unsplash.com/photo-1757262865418-7a2571bc2a36?q=70&w=1200&auto=format&fit=crop', 2),
  ('Exhaust', 'exhaust', 'https://images.unsplash.com/photo-1672626923169-dae917c72864?q=70&w=1200&auto=format&fit=crop', 3),
  ('Suspension', 'suspension', 'https://images.unsplash.com/photo-1683455425978-c40c16590b0b?q=70&w=1200&auto=format&fit=crop', 4),
  ('Bodywork', 'bodywork', 'https://images.unsplash.com/photo-1666555423180-729226967c76?q=70&w=1200&auto=format&fit=crop', 5),
  ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1570103365800-63a54fd42d04?q=70&w=1200&auto=format&fit=crop', 6),
  ('Lighting', 'lighting', 'https://images.unsplash.com/photo-1755585190999-2c8b62c03a49?q=70&w=1200&auto=format&fit=crop', 7),
  ('Tyres', 'tyres', 'https://images.unsplash.com/photo-1634071257121-8cd59787ff1c?q=70&w=1200&auto=format&fit=crop', 8),
  ('Controls', 'controls', 'https://images.unsplash.com/photo-1752774941153-b96f2f7a8e80?q=70&w=1200&auto=format&fit=crop', 9),
  ('Accessories', 'accessories', 'https://images.unsplash.com/photo-1642663408192-817872d49a26?q=70&w=1200&auto=format&fit=crop', 10)
on conflict (slug) do nothing;
