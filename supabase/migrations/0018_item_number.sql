-- Unique, human-readable internal item number for every listing (e.g.
-- "MP-100001"), separate from the seller-editable SKU/barcode. Auto-assigned
-- on insert so it's always present and never collides. Used for fast
-- internal inventory search on the seller and admin listings pages.

create sequence if not exists public.products_item_number_seq start 100001;

alter table public.products add column if not exists item_number text unique;

create or replace function public.set_product_item_number()
returns trigger language plpgsql as $$
begin
  if new.item_number is null then
    new.item_number := 'MP-' || lpad(nextval('public.products_item_number_seq')::text, 6, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_products_item_number on public.products;
create trigger trg_products_item_number
  before insert on public.products
  for each row execute function public.set_product_item_number();

-- Backfill any existing listings that predate this column, oldest first.
do $$
declare r record;
begin
  for r in select id from public.products where item_number is null order by created_at loop
    update public.products
      set item_number = 'MP-' || lpad(nextval('public.products_item_number_seq')::text, 6, '0')
      where id = r.id;
  end loop;
end $$;
