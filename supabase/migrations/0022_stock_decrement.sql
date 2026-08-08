-- Atomic stock decrement/rollback for order placement, so concurrent buyers
-- can't oversell a listing. Flips the listing to 'out-of-stock' the moment
-- it hits zero; a manual restock (increasing stock again) should also flip
-- status back to 'active', which the seller dashboard already does on edit.

create or replace function decrement_product_stock(p_id uuid, p_qty int)
returns table(new_stock int)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update products
  set stock = stock - p_qty,
      status = case when stock - p_qty <= 0 then 'out-of-stock' else status end
  where id = p_id and stock >= p_qty
  returning stock;
end;
$$;

create or replace function increment_product_stock(p_id uuid, p_qty int)
returns table(new_stock int)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update products
  set stock = stock + p_qty,
      status = case when status = 'out-of-stock' and stock + p_qty > 0 then 'active' else status end
  where id = p_id
  returning stock;
end;
$$;

grant execute on function decrement_product_stock(uuid, int) to authenticated;
grant execute on function increment_product_stock(uuid, int) to authenticated;
